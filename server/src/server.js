const path = require('node:path');
const fs = require('node:fs');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const dotenv = require('dotenv');

// Load environment variables
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) dotenv.config({ path: envPath });
else dotenv.config();

const { initDb } = require('./db');
const { RunningRepository } = require('./repository');

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';
const DEFAULT_ROOM_CODE = process.env.DEFAULT_ROOM_CODE || 'default';
const DB_PATH = path.resolve(__dirname, '..', process.env.DB_PATH || './data/running.sqlite');
const UPLOAD_DIR = path.resolve(__dirname, '..', process.env.UPLOAD_DIR || './uploads');
const STATIC_DIR = path.resolve(__dirname, '..', process.env.STATIC_DIR || '../');
const MAX_UPLOAD_SIZE = (parseInt(process.env.MAX_UPLOAD_SIZE_MB || '15', 10)) * 1024 * 1024;

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const db = initDb(DB_PATH);
const repo = new RunningRepository(db);
repo.ensureRoom(DEFAULT_ROOM_CODE);

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'same-origin');
  const rawCookie = req.headers.cookie || '';
  const cookies = {};
  rawCookie.split(';').forEach(part => {
    const idx = part.indexOf('=');
    if (idx > 0) cookies[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
  });
  req.cookies = cookies;
  const room = req.headers['x-room-code'] || req.query?.room || req.query?.roomCode || DEFAULT_ROOM_CODE;
  let personHeader = '';
  if (req.headers['x-person']) {
    try { personHeader = decodeURIComponent(String(req.headers['x-person'])); } catch { personHeader = String(req.headers['x-person']); }
  }
  const token = req.cookies['rl_member_token'] || req.headers['x-member-token'] || '';
  if (req.path.startsWith('/api/')) {
    try {
      const sess = repo.issueOrVerifySession(room, personHeader, token);
      req.memberSession = sess;
      if (sess.token && sess.token !== token) {
        res.setHeader('Set-Cookie', `rl_member_token=${encodeURIComponent(sess.token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`);
      }
    } catch {}
  }
  next();
});
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// SSE Client Management
const sseClients = new Map(); // roomCode -> Set of res
function broadcast(roomCode, eventData) {
  const clients = sseClients.get(roomCode);
  if (!clients || !clients.size) return;
  const jsonStr = JSON.stringify(eventData);
  const payload = `event: state_change\ndata: ${jsonStr}\n\ndata: ${jsonStr}\n\n`;
  for (const client of clients) {
    try { client.write(payload); } catch {}
  }
}

function handleApiError(res, err) {
  const status = err.statusCode || 500;
  const body = { success: false, code: err.code || (status === 400 ? 'BAD_REQUEST' : 'SERVER_ERROR'), error: err.message || '服务器处理失败' };
  if (err.currentRecord) body.currentRecord = err.currentRecord;
  res.status(status).json(body);
}

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const cleanExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext.toLowerCase()) ? ext.toLowerCase() : '.jpg';
    cb(null, `photo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${cleanExt}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: MAX_UPLOAD_SIZE },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('只允许上传 JPG, PNG, WebP, GIF 格式图片'));
  }
});

// 1. Health
const startTime = Date.now();
app.get('/api/health', (req, res) => {
  const stats = repo.getStats();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.round((Date.now() - startTime) / 1000),
    nodeVersion: process.version,
    database: { engine: 'SQLite (node:sqlite)', status: 'connected', path: DB_PATH },
    stats
  });
});

// 2. Real-time Events (SSE)
app.get('/api/events', (req, res) => {
  const room = req.query.roomCode || req.query.room || DEFAULT_ROOM_CODE;
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  if (!sseClients.has(room)) sseClients.set(room, new Set());
  sseClients.get(room).add(res);

  res.write(`data: ${JSON.stringify({ type: 'connected', room, time: Date.now() })}\n\n`);

  const heartbeat = setInterval(() => {
    try { res.write(': heartbeat\n\n'); } catch {}
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    const set = sseClients.get(room);
    if (set) { set.delete(res); if (!set.size) sseClients.delete(room); }
  });
});

// 3. Full State
app.get('/api/state', (req, res) => {
  try {
    const room = req.query.room || DEFAULT_ROOM_CODE;
    const person = req.query.person || null;
    res.json(repo.getState(room, person));
  } catch (err) { handleApiError(res, err); }
});

// 3b. Incremental Changes & Shared Leaderboard
app.get('/api/changes', (req, res) => {
  try {
    const room = req.query.room || req.query.roomCode || DEFAULT_ROOM_CODE;
    const since = Number(req.query.since || 0);
    const person = req.query.person || req.memberSession?.person || null;
    res.json({ success: true, ...repo.getChangesSince(room, since, person) });
  } catch (err) { handleApiError(res, err); }
});

app.get('/api/leaderboard', (req, res) => {
  try {
    const room = req.query.room || req.query.roomCode || DEFAULT_ROOM_CODE;
    const period = req.query.period || '本月';
    const metric = req.query.metric || '综合积分';
    const person = req.query.person || req.memberSession?.person || null;
    res.json({ success: true, ...repo.getLeaderboard(room, period, metric, person) });
  } catch (err) { handleApiError(res, err); }
});

// 4. Sport Records
app.post('/api/records/sport', (req, res) => {
  try {
    const room = req.body.room || DEFAULT_ROOM_CODE;
    const out = repo.addSportRecord(room, req.body);
    if (!out.deduplicated) broadcast(room, { type: 'sport-record-added', record: out.record, version: out.version, rev: out.version, operationId: req.body.operationId || '' });
    res.json({ success: true, ...out });
  } catch (err) { handleApiError(res, err); }
});
app.patch('/api/records/sport/:id', (req, res) => {
  try {
    const room = req.body.room || DEFAULT_ROOM_CODE;
    const out = repo.updateSportRecord(room, req.params.id, req.body, req.body.person || req.memberSession?.person || null);
    if (!out.deduplicated) broadcast(room, { type: 'sport-record-updated', record: out.record, version: out.version, rev: out.version, operationId: req.body.operationId || '' });
    res.json({ success: true, ...out });
  } catch (err) { handleApiError(res, err); }
});
app.delete('/api/records/sport/:id', (req, res) => {
  try {
    const room = req.query.room || req.body.room || DEFAULT_ROOM_CODE;
    const out = repo.deleteSportRecord(room, req.params.id, req.body || {}, req.body?.person || req.memberSession?.person || null);
    if (!out.deduplicated) broadcast(room, { type: 'sport-record-deleted', id: Number(req.params.id), version: out.version, rev: out.version, operationId: req.body?.operationId || '' });
    res.json({ success: true, id: Number(req.params.id), ...out });
  } catch (err) { handleApiError(res, err); }
});

// 5. Study Records
app.post('/api/records/study', (req, res) => {
  try {
    const room = req.body.room || DEFAULT_ROOM_CODE;
    const out = repo.addStudyRecord(room, req.body);
    if (!out.deduplicated) broadcast(room, { type: 'study-record-added', record: out.record, version: out.version, rev: out.version, operationId: req.body.operationId || req.body.sessionId || '' });
    res.json({ success: true, ...out });
  } catch (err) { handleApiError(res, err); }
});
app.patch('/api/records/study/:id', (req, res) => {
  try {
    const room = req.body.room || DEFAULT_ROOM_CODE;
    const out = repo.updateStudyRecord(room, req.params.id, req.body, req.body.person || req.memberSession?.person || null);
    if (!out.deduplicated) broadcast(room, { type: 'study-record-updated', record: out.record, version: out.version, rev: out.version, operationId: req.body.operationId || '' });
    res.json({ success: true, ...out });
  } catch (err) { handleApiError(res, err); }
});
app.delete('/api/records/study/:id', (req, res) => {
  try {
    const room = req.query.room || req.body.room || DEFAULT_ROOM_CODE;
    const out = repo.deleteStudyRecord(room, req.params.id, req.body || {}, req.body?.person || req.memberSession?.person || null);
    if (!out.deduplicated) broadcast(room, { type: 'study-record-deleted', id: Number(req.params.id), version: out.version, rev: out.version, operationId: req.body?.operationId || '' });
    res.json({ success: true, id: Number(req.params.id), ...out });
  } catch (err) { handleApiError(res, err); }
});

// 6. Like
app.post('/api/records/:kind/:id/like', (req, res) => {
  try {
    const room = req.body.room || DEFAULT_ROOM_CODE;
    const kind = req.params.kind;
    if (!['sport', 'study'].includes(kind)) return res.status(400).json({ success: false, error: '无效记录类型' });
    const result = repo.toggleLike(room, kind, req.params.id, req.body.person || '帅哥');
    broadcast(room, { type: 'record-liked', kind, id: Number(req.params.id), ...result });
    res.json({ success: true, ...result });
  } catch (err) { handleApiError(res, err); }
});

// 7. Study Targets
app.post('/api/study-targets', (req, res) => {
  try {
    const room = req.body.room || DEFAULT_ROOM_CODE;
    const t = repo.addStudyTarget(room, req.body);
    broadcast(room, { type: 'study-target-added', target: t, version: t.version });
    res.json({ success: true, target: t, version: t.version });
  } catch (err) { handleApiError(res, err); }
});
app.patch('/api/study-targets/:id', (req, res) => {
  try {
    const room = req.body.room || DEFAULT_ROOM_CODE;
    const out = repo.updateStudyTarget(room, req.params.id, req.body);
    broadcast(room, { type: 'study-target-updated', target: out.target, version: out.version });
    res.json({ success: true, ...out });
  } catch (err) { handleApiError(res, err); }
});
app.delete('/api/study-targets/:id', (req, res) => {
  try {
    const room = req.query.room || req.body.room || DEFAULT_ROOM_CODE;
    const out = repo.deleteStudyTarget(room, req.params.id);
    broadcast(room, { type: 'study-target-deleted', id: req.params.id, version: out.version });
    res.json({ success: true, ...out });
  } catch (err) { handleApiError(res, err); }
});

// 8. Habits & Habit Logs
app.post('/api/habits', (req, res) => {
  try {
    const room = req.body.room || DEFAULT_ROOM_CODE;
    const h = repo.addHabit(room, req.body);
    broadcast(room, { type: 'habit-added', habit: h, version: h.version });
    res.json({ success: true, habit: h, version: h.version });
  } catch (err) { handleApiError(res, err); }
});
app.patch('/api/habits/:id', (req, res) => {
  try {
    const room = req.body.room || DEFAULT_ROOM_CODE;
    const out = repo.updateHabit(room, req.params.id, req.body);
    broadcast(room, { type: 'habit-updated', habit: out.habit, version: out.version });
    res.json({ success: true, ...out });
  } catch (err) { handleApiError(res, err); }
});
app.put('/api/habits/order', (req, res) => {
  try {
    const room = req.body.room || DEFAULT_ROOM_CODE;
    const out = repo.reorderHabits(room, req.body.ids);
    broadcast(room, { type: 'habits-reordered', version: out.version });
    res.json({ success: true, ...out });
  } catch (err) { handleApiError(res, err); }
});
app.delete('/api/habits/:id', (req, res) => {
  try {
    const room = req.query.room || req.body.room || DEFAULT_ROOM_CODE;
    const out = repo.deleteHabit(room, req.params.id);
    broadcast(room, { type: 'habit-deleted', id: req.params.id, version: out.version });
    res.json({ success: true, ...out });
  } catch (err) { handleApiError(res, err); }
});
const handleHabitLogs = (req, res) => {
  try {
    const room = req.body.room || DEFAULT_ROOM_CODE;
    const person = req.body.person;
    const date = req.body.date;
    let habitIds = req.body.habitIds;
    if (!Array.isArray(habitIds)) {
      if (req.body.habitId) {
        const current = repo.getHabitLogsForPerson(room, person, date);
        if (req.body.completed === false) {
          habitIds = current.filter(id => id !== req.body.habitId);
        } else {
          habitIds = current.includes(req.body.habitId) ? current : [...current, req.body.habitId];
        }
      } else {
        habitIds = [];
      }
    }
    const saved = repo.updateHabitLogs(room, person, date, habitIds);
    broadcast(room, { type: 'habit-logs-updated', person, date, habitIds: saved });
    res.json({ success: true, habitIds: saved });
  } catch (err) { handleApiError(res, err); }
};
app.put('/api/habit-logs', handleHabitLogs);
app.post('/api/habit-logs', handleHabitLogs);

// 9. Plans
app.patch('/api/plans', (req, res) => {
  try {
    const room = req.body.room || DEFAULT_ROOM_CODE;
    const plans = repo.updatePlans(room, req.body);
    broadcast(room, { type: 'plans-updated', plans });
    res.json({ success: true, plans });
  } catch (err) { handleApiError(res, err); }
});

// 10. Members & Identity
app.post('/api/members', (req, res) => {
  try {
    const room = req.body.room || DEFAULT_ROOM_CODE;
    const members = repo.addMember(room, req.body.name);
    broadcast(room, { type: 'members-updated', members });
    res.json({ success: true, members });
  } catch (err) { handleApiError(res, err); }
});
app.delete('/api/members/:name', (req, res) => {
  try {
    const room = req.query.room || req.body.room || DEFAULT_ROOM_CODE;
    const members = repo.removeMember(room, decodeURIComponent(req.params.name));
    broadcast(room, { type: 'members-updated', members });
    res.json({ success: true, members });
  } catch (err) { handleApiError(res, err); }
});
const handleRename = (req, res) => {
  try {
    const room = req.body.room || DEFAULT_ROOM_CODE;
    const oldName = req.body.oldName;
    const newName = req.body.newName || req.body.name;
    if (!newName) return res.status(400).json({ success: false, error: '新名称不能为空' });
    const result = repo.renamePerson(room, oldName, newName, req.body.operationId || null);
    if (!result.deduplicated) broadcast(room, { type: 'person-renamed', ...result, rev: result.version, operationId: req.body.operationId || '' });
    res.json({ success: true, ...result });
  } catch (err) { handleApiError(res, err); }
};
app.post('/api/rename', handleRename);
app.post('/api/user/rename', handleRename);

// 11. Uploads (Multipart or Base64)
app.post('/api/uploads', (req, res) => {
  upload.single('file')(req, res, err => {
    if (err) return res.status(400).json({ success: false, error: err.message });
    if (req.file) {
      return res.json({ success: true, url: `/uploads/${req.file.filename}` });
    }
    const base64Data = req.body?.data || req.body?.image;
    if (base64Data && typeof base64Data === 'string' && base64Data.startsWith('data:image/')) {
      const match = base64Data.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      if (!match) return res.status(400).json({ success: false, error: '无效 Base64 图片' });
      const ext = match[1] === 'jpeg' ? 'jpg' : match[1].toLowerCase();
      const filename = `photo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const buf = Buffer.from(match[2], 'base64');
      fs.writeFileSync(path.join(UPLOAD_DIR, filename), buf);
      return res.json({ success: true, url: `/uploads/${filename}` });
    }
    res.status(400).json({ success: false, error: '请上传图片文件或提供图片 Base64 编码' });
  });
});

// 12. Backup Export & Import & Clear
app.get('/api/export', (req, res) => {
  try {
    const room = req.query.room || DEFAULT_ROOM_CODE;
    res.setHeader('Content-Disposition', `attachment; filename="run-log-backup-${room}-${Date.now()}.json"`);
    const st = repo.getState(room);
    res.json({
      ...st,
      schemaVersion: 2,
      exportedAt: new Date().toISOString(),
      unitNote: 'sport: km/minutes; study: hours/minutes/seconds; timezone: Asia/Shanghai'
    });
  } catch (err) { handleApiError(res, err); }
});
app.post('/api/import', (req, res) => {
  try {
    const room = req.body.room || DEFAULT_ROOM_CODE;
    const payload = req.body.data || req.body;
    const out = repo.importState(room, payload);
    broadcast(room, { type: 'state-imported', version: out.version });
    res.json({ success: true, message: '数据已成功恢复至数据库', ...out });
  } catch (err) { handleApiError(res, err); }
});
app.delete('/api/records', (req, res) => {
  try {
    const room = req.query.room || req.body.room || DEFAULT_ROOM_CODE;
    const out = repo.clearRecords(room);
    broadcast(room, { type: 'records-cleared', version: out.version });
    res.json({ success: true, message: '打卡记录已清空', ...out });
  } catch (err) { handleApiError(res, err); }
});

// Static files
app.use('/uploads', express.static(UPLOAD_DIR));
app.use(express.static(STATIC_DIR));

// Fallback to index.html for unknown GET requests
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) return next();
  res.sendFile(path.join(STATIC_DIR, 'index.html'));
});

const server = app.listen(PORT, HOST, () => {
  console.log(`===================================================`);
  console.log(`  RUN & STUDY LOG · 服务端已启动 (Node 24 + SQLite)`);
  console.log(`  本地地址: http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
  console.log(`  健康检查: http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}/api/health`);
  console.log(`  数据文件: ${DB_PATH}`);
  console.log(`  照片目录: ${UPLOAD_DIR}`);
  console.log(`===================================================`);
});

module.exports = { app, server };
