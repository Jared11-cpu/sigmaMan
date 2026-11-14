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
  const room = req.query.room || DEFAULT_ROOM_CODE;
  const person = req.query.person || null;
  res.json(repo.getState(room, person));
});

// 4. Sport Records
app.post('/api/records/sport', (req, res) => {
  const room = req.body.room || DEFAULT_ROOM_CODE;
  const rec = repo.addSportRecord(room, req.body);
  broadcast(room, { type: 'sport-record-added', record: rec });
  res.json({ success: true, record: rec });
});
app.delete('/api/records/sport/:id', (req, res) => {
  const room = req.query.room || req.body.room || DEFAULT_ROOM_CODE;
  repo.deleteSportRecord(room, req.params.id);
  broadcast(room, { type: 'sport-record-deleted', id: Number(req.params.id) });
  res.json({ success: true, id: Number(req.params.id) });
});

// 5. Study Records
app.post('/api/records/study', (req, res) => {
  const room = req.body.room || DEFAULT_ROOM_CODE;
  const rec = repo.addStudyRecord(room, req.body);
  broadcast(room, { type: 'study-record-added', record: rec });
  res.json({ success: true, record: rec });
});
app.delete('/api/records/study/:id', (req, res) => {
  const room = req.query.room || req.body.room || DEFAULT_ROOM_CODE;
  repo.deleteStudyRecord(room, req.params.id);
  broadcast(room, { type: 'study-record-deleted', id: Number(req.params.id) });
  res.json({ success: true, id: Number(req.params.id) });
});

// 6. Like
app.post('/api/records/:kind/:id/like', (req, res) => {
  const room = req.body.room || DEFAULT_ROOM_CODE;
  const kind = req.params.kind;
  if (!['sport', 'study'].includes(kind)) return res.status(400).json({ error: '无效记录类型' });
  const result = repo.toggleLike(room, kind, req.params.id, req.body.person || '帅哥');
  broadcast(room, { type: 'record-liked', kind, id: Number(req.params.id), ...result });
  res.json({ success: true, ...result });
});

// 7. Study Targets
app.post('/api/study-targets', (req, res) => {
  const room = req.body.room || DEFAULT_ROOM_CODE;
  const t = repo.addStudyTarget(room, req.body);
  broadcast(room, { type: 'study-target-added', target: t });
  res.json({ success: true, target: t });
});
app.delete('/api/study-targets/:id', (req, res) => {
  const room = req.query.room || req.body.room || DEFAULT_ROOM_CODE;
  repo.deleteStudyTarget(room, req.params.id);
  broadcast(room, { type: 'study-target-deleted', id: req.params.id });
  res.json({ success: true });
});

// 8. Habits & Habit Logs
app.post('/api/habits', (req, res) => {
  const room = req.body.room || DEFAULT_ROOM_CODE;
  const h = repo.addHabit(room, req.body);
  broadcast(room, { type: 'habit-added', habit: h });
  res.json({ success: true, habit: h });
});
app.delete('/api/habits/:id', (req, res) => {
  const room = req.query.room || req.body.room || DEFAULT_ROOM_CODE;
  repo.deleteHabit(room, req.params.id);
  broadcast(room, { type: 'habit-deleted', id: req.params.id });
  res.json({ success: true });
});
const handleHabitLogs = (req, res) => {
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
};
app.put('/api/habit-logs', handleHabitLogs);
app.post('/api/habit-logs', handleHabitLogs);

// 9. Plans
app.patch('/api/plans', (req, res) => {
  const room = req.body.room || DEFAULT_ROOM_CODE;
  const plans = repo.updatePlans(room, req.body);
  broadcast(room, { type: 'plans-updated', plans });
  res.json({ success: true, plans });
});

// 10. Members & Identity
app.post('/api/members', (req, res) => {
  const room = req.body.room || DEFAULT_ROOM_CODE;
  const members = repo.addMember(room, req.body.name);
  broadcast(room, { type: 'members-updated', members });
  res.json({ success: true, members });
});
app.delete('/api/members/:name', (req, res) => {
  const room = req.query.room || req.body.room || DEFAULT_ROOM_CODE;
  const members = repo.removeMember(room, decodeURIComponent(req.params.name));
  broadcast(room, { type: 'members-updated', members });
  res.json({ success: true, members });
});
const handleRename = (req, res) => {
  const room = req.body.room || DEFAULT_ROOM_CODE;
  const oldName = req.body.oldName;
  const newName = req.body.newName || req.body.name;
  if (!newName) return res.status(400).json({ error: '新名称不能为空' });
  const result = repo.renamePerson(room, oldName, newName);
  broadcast(room, { type: 'person-renamed', ...result });
  res.json({ success: true, ...result });
};
app.post('/api/rename', handleRename);
app.post('/api/user/rename', handleRename);

// 11. Uploads (Multipart or Base64)
app.post('/api/uploads', (req, res) => {
  upload.single('file')(req, res, err => {
    if (err) return res.status(400).json({ error: err.message });
    if (req.file) {
      return res.json({ success: true, url: `/uploads/${req.file.filename}` });
    }
    // Check base64 fallback in json body
    const base64Data = req.body?.data || req.body?.image;
    if (base64Data && typeof base64Data === 'string' && base64Data.startsWith('data:image/')) {
      const match = base64Data.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      if (!match) return res.status(400).json({ error: '无效 Base64 图片' });
      const ext = match[1] === 'jpeg' ? 'jpg' : match[1].toLowerCase();
      const filename = `photo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const buf = Buffer.from(match[2], 'base64');
      fs.writeFileSync(path.join(UPLOAD_DIR, filename), buf);
      return res.json({ success: true, url: `/uploads/${filename}` });
    }
    res.status(400).json({ error: '请上传图片文件或提供图片 Base64 编码' });
  });
});

// 12. Backup Export & Import & Clear
app.get('/api/export', (req, res) => {
  const room = req.query.room || DEFAULT_ROOM_CODE;
  res.setHeader('Content-Disposition', `attachment; filename="run-log-backup-${room}-${Date.now()}.json"`);
  res.json(repo.getState(room));
});
app.post('/api/import', (req, res) => {
  const room = req.body.room || DEFAULT_ROOM_CODE;
  const payload = req.body.data || req.body;
  repo.importState(room, payload);
  broadcast(room, { type: 'state-imported' });
  res.json({ success: true, message: '数据已成功恢复至数据库' });
});
app.delete('/api/records', (req, res) => {
  const room = req.query.room || req.body.room || DEFAULT_ROOM_CODE;
  repo.clearRecords(room);
  broadcast(room, { type: 'records-cleared' });
  res.json({ success: true, message: '打卡记录已清空' });
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
