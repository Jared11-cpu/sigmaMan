(() => {
'use strict';
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const params = new URLSearchParams(location.search), demo = params.has('demo'), embedded = params.has('embed');
const STORE = 'run-log-v1';
const pad = n => String(n).padStart(2, '0');
const chinaNow = () => new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }));
const dateKey = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const dateShift = n => { const d = chinaNow(); d.setDate(d.getDate() + n); return dateKey(d); };
const today = () => dateKey(chinaNow());

const feelings = [['😫', '好累'], ['😮‍💨', '一般'], ['🙂', '还行'], ['😄', '舒服'], ['🔥', '超爽']];
const studyFocusLevels = [['😵', '走神'], ['😐', '一般'], ['🙂', '专注'], ['🧠', '沉浸'], ['⚡', '心流']];
const tags = ['和室友一起', '下雨', '大风', '降温', '操场', '公园', '间歇跑', '恢复跑'];
const studyTags = ['番茄钟', '图书馆', '早读', '刷题', '复盘', '笔记', '无手机', '深度工作'];

const DEFAULT_MEMBERS = [];
const LEGACY_SEEDED_MEMBERS = ['林舟', '陈默', '苏晴'];
const MEMBER_PALETTE = ['#e5492b', '#203f91', '#0f766e', '#c27803', '#7c3aed', '#be185d', '#15803d', '#0369a1'];

function defaultStudyTargets() {
  return [
    { id: 'st-1', title: '专业核心课精读与笔记', category: '深度阅读', targetHours: 45, doneHours: 18.5, color: '#203f91', deadline: '本月' },
    { id: 'st-2', title: '算法题与代码实战训练', category: '编程实践', targetHours: 35, doneHours: 14.0, color: '#e5492b', deadline: '本月' },
    { id: 'st-3', title: '英语听力精听与口语复述', category: '语言输出', targetHours: 25, doneHours: 10.5, color: '#e4a334', deadline: '本月' },
    { id: 'st-4', title: '复盘输出与错题本整理', category: '复盘沉淀', targetHours: 15, doneHours: 6.0, color: '#262624', deadline: '每周' }
  ];
}

function defaultHabits() {
  return [
    { id: 'hb-1', title: '06:30 前起床离开被窝', tag: '作息', icon: 'sunrise' },
    { id: 'hb-2', title: '手机专注隔离 ≥ 2 小时', tag: '戒断', icon: 'bolt' },
    { id: 'hb-3', title: '完成运动或学习任一核心打卡', tag: '行动', icon: 'target' },
    { id: 'hb-4', title: '23:30 前入睡 + 今日复盘', tag: '复盘', icon: 'moon' }
  ];
}

function defaultStudyRecords(name = '帅哥') {
  return [
    { id: 2004, person: name, date: dateShift(-1), time: '08:30', hours: 2.5, minutes: 150, focus: 4, targetId: 'st-1', subject: '专业核心课精读与笔记', note: '拆解了第三章核心框架，输出 2 页思维导图。', tags: ['深度工作', '笔记'], likes: 2, liked: false },
    { id: 2003, person: name, date: dateShift(-2), time: '19:45', hours: 2.0, minutes: 120, focus: 3, targetId: 'st-2', subject: '算法题与代码实战训练', note: '独立完成 4 道动态规划中等题，边界条件理顺了。', tags: ['刷题', '番茄钟'], likes: 1, liked: false },
    { id: 2002, person: name, date: dateShift(-4), time: '09:15', hours: 1.8, minutes: 108, focus: 3, targetId: 'st-3', subject: '英语听力精听与口语复述', note: '精听两篇播客并跟读 Shadowing 30 分钟。', tags: ['早读', '无手机'], likes: 1, liked: false },
    { id: 2001, person: name, date: dateShift(-6), time: '20:30', hours: 1.5, minutes: 90, focus: 2, targetId: 'st-4', subject: '复盘输出与错题本整理', note: '整理本周错题与代码坑点，明确下周突破项。', tags: ['复盘', '图书馆'], likes: 0, liked: false }
  ];
}

function defaultCompetitorSportRecords() { return []; }
function defaultCompetitorStudyRecords() { return []; }

function defaultHabitLogs() {
  return {
    [dateShift(-6)]: ['hb-1', 'hb-2', 'hb-3'],
    [dateShift(-5)]: ['hb-1', 'hb-2', 'hb-3', 'hb-4'],
    [dateShift(-4)]: ['hb-1', 'hb-3', 'hb-4'],
    [dateShift(-3)]: ['hb-1', 'hb-2', 'hb-3'],
    [dateShift(-2)]: ['hb-1', 'hb-2', 'hb-3', 'hb-4'],
    [dateShift(-1)]: ['hb-1', 'hb-2', 'hb-3', 'hb-4']
  };
}

function defaultMemberHabitLogs() { return {}; }

function seed() {
  return {
    version: 1, teamSeeded: true, soloPurged: true, name: '帅哥', goal: 245, days: [1, 2, 6, 0], members: [],
    studyGoal: 120, studyDays: [1, 2, 3, 4, 5, 6],
    sportDatePlan: {},
    studyDatePlan: {},
    studyTargets: defaultStudyTargets(),
    habits: defaultHabits(),
    habitLogs: defaultHabitLogs(),
    memberHabitLogs: {},
    records: [
      { id: 1004, person: '帅哥', date: dateShift(-1), time: '06:10', km: 21.1, minutes: 120, feel: 4, note: '再多跑一步，风景就不一样。', tags: ['操场'], likes: 2, liked: false },
      { id: 1003, person: '帅哥', date: dateShift(-2), time: '06:20', km: 10, minutes: 57, feel: 3, note: '十公里，刚刚好。', tags: ['公园'], likes: 1, liked: false },
      { id: 1002, person: '帅哥', date: dateShift(-4), time: '06:05', km: 28.5, minutes: 165, feel: 0, note: '长距离慢慢跑。', tags: ['操场'], likes: 1, liked: false },
      { id: 1001, person: '帅哥', date: dateShift(-6), time: '06:15', km: 6.4, minutes: 38, feel: 4, note: '早起的人，先看见太阳。', tags: ['操场'], likes: 1, liked: false }
    ],
    studyRecords: [
      ...defaultStudyRecords('帅哥')
    ]
  };
}

function hydrateState(raw) {
  const base = seed();
  if (!raw || (raw.version !== 1 && raw.schemaVersion !== 2) || !Array.isArray(raw.records)) return base;
  const userName = raw.name || base.name;
  let members = Array.isArray(raw.members) ? raw.members.filter(Boolean) : [];
  let records = raw.records;
  let studyRecords = Array.isArray(raw.studyRecords) ? raw.studyRecords : defaultStudyRecords(userName);
  let memberHabitLogs = raw.memberHabitLogs && typeof raw.memberHabitLogs === 'object' ? { ...raw.memberHabitLogs } : {};
  const soloPurged = Boolean(raw.soloPurged);

  // One-time cleanup: clear pre-seeded rival characters (林舟/陈默/苏晴) while preserving user's own data
  if (!soloPurged) {
    const purgeSet = new Set(LEGACY_SEEDED_MEMBERS.filter(n => n !== userName));
    members = members.filter(m => !purgeSet.has(m));
    records = records.filter(r => !purgeSet.has(r.person) && !(r.id >= 3000 && r.id < 4000));
    studyRecords = studyRecords.filter(r => !purgeSet.has(r.person) && !(r.id >= 4000 && r.id < 5000));
    purgeSet.forEach(m => { delete memberHabitLogs[m]; });
  }

  return {
    ...base,
    ...raw,
    teamSeeded: true,
    soloPurged: true,
    members,
    records,
    studyRecords,
    studyGoal: Number.isFinite(raw.studyGoal) ? raw.studyGoal : base.studyGoal,
    studyDays: Array.isArray(raw.studyDays) ? raw.studyDays : base.studyDays,
    sportDatePlan: raw.sportDatePlan && typeof raw.sportDatePlan === 'object' ? { ...raw.sportDatePlan } : {},
    studyDatePlan: raw.studyDatePlan && typeof raw.studyDatePlan === 'object' ? { ...raw.studyDatePlan } : {},
    studyTargets: (Array.isArray(raw.studyTargets) && raw.studyTargets.length ? raw.studyTargets : base.studyTargets).map(t => {
      const linkedH = studyRecords.filter(r => r.person === userName && r.targetId === t.id).reduce((s, r) => s + (Number(r.hours) || 0), 0);
      const baseH = Number.isFinite(t.baseHours) ? t.baseHours : Math.max(0, Math.round(((Number(t.doneHours) || 0) - linkedH) * 100) / 100);
      return { ...t, archived: Boolean(t.archived), baseHours: baseH };
    }),
    habits: (Array.isArray(raw.habits) && raw.habits.length ? raw.habits : base.habits).map(h => ({ ...h, archived: Boolean(h.archived) })),
    habitLogs: raw.habitLogs && typeof raw.habitLogs === 'object' ? raw.habitLogs : base.habitLogs,
    memberHabitLogs
  };
}

let state, _rawStored = null;
try {
  _rawStored = JSON.parse(localStorage.getItem(STORE) || 'null');
  state = demo ? seed() : hydrateState(_rawStored);
  if (!demo && _rawStored && !_rawStored.soloPurged && typeof localStorage !== 'undefined') { try { localStorage.setItem(STORE, JSON.stringify(state)); } catch {} }
} catch {
  state = seed();
}
if (demo) {
  state.records.unshift({ id: 1005, person: state.name, date: today(), time: '06:10', km: 21.1, minutes: 120, feel: 4, note: '今天，也跑完了。', tags: ['操场'], likes: 1, liked: false });
  state.studyRecords.unshift({ id: 2005, person: state.name, date: today(), time: '09:00', hours: 2.0, minutes: 120, focus: 4, targetId: 'st-1', subject: '专业核心课精读与笔记', note: '晨跑后精力充沛，高效完成两小时深度阅读。', tags: ['深度工作', '无手机'], likes: 1, liked: false });
  state.habitLogs[today()] = ['hb-1', 'hb-2', 'hb-3', 'hb-4'];
}

const POMO_KEY = STORE + '_pomo_session';
const PENDING_OPS_KEY = STORE + '_pending_ops';
const VALID_VIEWS = ['home', 'progress', 'plan', 'study', 'ranking', 'achievements', 'records', 'people'];
const hashView = (typeof location !== 'undefined' && location.hash) ? location.hash.replace(/^#/, '').split('?')[0] : '';
let view = params.get('view') || (VALID_VIEWS.includes(hashView) ? hashView : 'home');
let showArchivedTargets = false, showArchivedHabits = false, pendingImportBackup = null;
let rankPeriod = '本月', rankMetric = '综合积分', progressTab = '双轨总览', chartType = '7天趋势', achFilter = '全部';
let recordKindFilter = 'all'; // 'all' | 'sport' | 'study'
let recordSelectKey = ''; // 'sport:id' or 'study:id'
let homeBpMode = 'track'; // 'track' | 'study'
let bpFocus = 'sport'; // 'sport' | 'study' | 'habit'
let radarFocusAxis = '学习时间'; // interactive radar axis selection
let selectedCalDate = today();
let selectedBarDate = today();
let selectedChartNote = '';
let selectedBucket = null; // { mode, idx }
let rankChartMode = 'sport'; // 'sport' | 'study'
let dualChartMode = state.members.length ? 'sport-comp' : 'personal-dual'; // 'personal-dual' | 'sport-comp' | 'study-comp' | 'score-comp'
let chartScaleMode = 'cum'; // 'cum' | 'single'
let chartPersonFilter = 'all'; // 'all' or specific competitor name
let selectedNodeKey = ''; // 'sport:1004' or 'study:2004'

// Real-timestamp Pomodoro timer state (persisted across reloads)
function loadPomoSession() {
  try {
    const raw = JSON.parse(localStorage.getItem(POMO_KEY) || 'null');
    if (raw && typeof raw === 'object' && Number.isFinite(raw.totalSec)) return raw;
  } catch {}
  return {
    sessionId: 'pomo-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
    targetId: state.studyTargets[0]?.id || 'st-1',
    totalSec: 25 * 60,
    state: 'idle',
    startedAt: 0,
    pausedAccumMs: 0,
    pauseStartedAt: 0,
    completedAt: 0,
    errorMsg: ''
  };
}
let pomoSession = loadPomoSession();
function savePomoSession() { try { localStorage.setItem(POMO_KEY, JSON.stringify(pomoSession)); } catch {} }
function getPomoElapsedSec() {
  if (pomoSession.state === 'idle') return 0;
  if (pomoSession.state === 'completed' || pomoSession.state === 'saving' || pomoSession.state === 'saved') {
    if (pomoSession.completedAt && pomoSession.startedAt) {
      return Math.max(0, Math.round((pomoSession.completedAt - pomoSession.startedAt - (pomoSession.pausedAccumMs || 0)) / 1000));
    }
    return pomoSession.totalSec;
  }
  const refNow = pomoSession.state === 'paused' ? (pomoSession.pauseStartedAt || Date.now()) : Date.now();
  const ms = Math.max(0, refNow - (pomoSession.startedAt || refNow) - (pomoSession.pausedAccumMs || 0));
  return Math.min(pomoSession.totalSec, Math.floor(ms / 1000));
}
function getPomoLeftSec() { return Math.max(0, pomoSession.totalSec - getPomoElapsedSec()); }
let pomodoroTotal = pomoSession.totalSec, pomodoroLeft = getPomoLeftSec(), pomodoroRunning = pomoSession.state === 'running', pomodoroTick = null;
let pomodoroTargetId = pomoSession.targetId || state.studyTargets[0]?.id || 'st-1';

let quoteIndex = params.has('quote') ? Number(params.get('quote')) : 1, quoteTimer, step = 0, draft = null, modalPreviousFocus = null, toastTimer, dialogSave = null;
if (!['home', 'progress', 'plan', 'study', 'ranking', 'achievements', 'records', 'people'].includes(view)) view = 'home';

const nav = [
  ['home', '首页', 'track'],
  ['progress', '进度', 'pulse'],
  ['plan', '运动', 'shoe'],
  ['study', '学习', 'book'],
  ['ranking', '排名', 'trophy'],
  ['achievements', '成就', 'medal'],
  ['records', '记录', 'chart'],
  ['people', '自律', 'sunrise']
];
if (embedded) document.body.classList.add('embedded');

const ICONS = {
  track: '<ellipse cx="12" cy="12" rx="9" ry="5.5"/><ellipse cx="12" cy="12" rx="5.5" ry="2.5"/><circle cx="16.5" cy="7.5" r="2" fill="currentColor" stroke="none"/>',
  pulse: '<path d="M3 12h4l2.5-6 4 12 2.5-6H21"/>',
  calendar: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 9h18M8 14h3M13 14h3"/>',
  trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z"/><path d="M7 5H4v2a3 3 0 0 0 3 3M17 5h3v2a3 3 0 0 1-3 3"/>',
  medal: '<circle cx="12" cy="14" r="6"/><path d="M9 9L6 3h4l2 4 2-4h4l-3 6"/><path d="M12 11.5v5M9.5 14h5"/>',
  chart: '<path d="M4 20h16M7 16v-5M12 16V7M17 16v-8"/>',
  sunrise: '<path d="M12 3v3M5.6 6.6l2.1 2.1M18.4 6.6l-2.1 2.1M3 15h18M6 19h12"/><path d="M7.5 15a4.5 4.5 0 0 1 9 0"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path d="M8 7h8M8 11h6"/>',
  brain: '<path d="M9.5 4A3.5 3.5 0 0 0 6 7.5c0 .4.1.8.2 1.1A3.5 3.5 0 0 0 4 12a3.5 3.5 0 0 0 2.5 3.4c0 2 1.6 3.6 3.5 3.6h2V4h-2.5z"/><path d="M14.5 4A3.5 3.5 0 0 1 18 7.5c0 .4-.1.8-.2 1.1A3.5 3.5 0 0 1 20 12a3.5 3.5 0 0 1-2.5 3.4c0 2-1.6 3.6-3.5 3.6H12V4h2.5z"/>',
  route: '<circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8.5 18H13a3 3 0 0 0 0-6h-2a3 3 0 0 1 0-6h4.5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  flame: '<path d="M12 3c2 3 5 5.2 5 9a5 5 0 1 1-10 0c0-2.5 1.3-4.6 3-6.5.2 1.7 1.3 2.7 2.5 2.7-.2-2-.5-3.6-.5-5.2z"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/>',
  users: '<circle cx="9" cy="8" r="3"/><path d="M3 19a6 6 0 0 1 12 0"/><circle cx="17" cy="9" r="2.5"/><path d="M15 19a5 5 0 0 1 6 0"/>',
  check: '<circle cx="12" cy="12" r="9"/><path d="M8.5 12.2l2.5 2.5 4.5-5"/>',
  shoe: '<path d="M3 16h18v2.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5V16z"/><path d="M4 16l2.5-7 3.5 2 3-3 4 4.5 4 1.5V16"/>',
  moon: '<path d="M19 14.5A7 7 0 0 1 9.5 5a7 7 0 1 0 9.5 9.5z"/>',
  heart: '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>',
  bolt: '<path d="M13 2L5 13h6l-1 9 9-11h-6l0-9z"/>',
  crown: '<path d="M3 18h18l-1.5-10-4.5 4-3-6-3 6-4.5-4L3 18z"/>',
  mountain: '<path d="M3 19L9.5 7l4 6.5 2.5-3.5L21 19H3z"/>',
  compass: '<circle cx="12" cy="12" r="9"/><polygon points="15.5,8.5 13.2,13.2 8.5,15.5 10.8,10.8"/>',
  infinity: '<path d="M18.2 8.8a3.8 3.8 0 0 0-5.4 0L11.2 10.4 9.6 8.8a3.8 3.8 0 1 0 0 5.4l1.6-1.6 1.6 1.6a3.8 3.8 0 0 0 5.4-5.4z"/>',
  flag: '<path d="M5 21V4M5 4h12l-2.5 4L17 12H5"/>',
  spark: '<path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6z"/>'
};

function icon(name, cls = '') {
  return '<svg class="ui-ico ' + cls + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || ICONS.spark) + '</svg>';
}

const hasLocalStorage = (() => {
  try { const k = '__rl_chk'; localStorage.setItem(k, '1'); localStorage.removeItem(k); return true; } catch { return false; }
})();

/* ---------- Dual-Mode Server Sync Client (Online REST+SSE + PendingOps + Structured Errors) ---------- */
let isServerOnline = false;
let currentRoomCode = params.get('room') || (hasLocalStorage ? (() => { try { return localStorage.getItem('running_room_code'); } catch { return null; } })() : null) || 'default';
let sseSource = null;
let lastSyncError = '';
let pendingOps = (() => {
  try { const a = JSON.parse(localStorage.getItem(PENDING_OPS_KEY) || '[]'); return Array.isArray(a) ? a : []; } catch { return []; }
})();
function savePendingOps() { try { localStorage.setItem(PENDING_OPS_KEY, JSON.stringify(pendingOps)); } catch {} }
function nextOpId(prefix = 'op') { return prefix + '-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8); }
function removePendingOp(opId) { pendingOps = pendingOps.filter(x => x.operationId !== opId); savePendingOps(); }
async function flushPendingOps() {
  if (!isServerOnline || !pendingOps.length) return;
  const copy = [...pendingOps];
  for (const op of copy) {
    const res = await serverFetch(op.endpoint, op.method || 'POST', op.payload);
    if (res && res.ok) {
      removePendingOp(op.operationId);
      lastSyncError = '';
    } else if (res && res.status >= 400 && res.status < 500) {
      removePendingOp(op.operationId);
      lastSyncError = res.error || '数据校验未通过';
    } else {
      lastSyncError = (res && res.error) || '网络连接失败';
      break;
    }
  }
}

async function checkServerHealth() {
  if (embedded || demo) return false;
  if (typeof location !== 'undefined' && (location.protocol === 'file:' || location.origin === 'null' || window.mausbot)) return false;
  try {
    const res = await fetch('/api/health?roomCode=' + encodeURIComponent(currentRoomCode), { cache: 'no-cache' });
    if (!res.ok) return false;
    const json = await res.json();
    return json && json.status === 'ok';
  } catch {
    return false;
  }
}

async function serverFetch(endpoint, method = 'GET', data = null) {
  if (!isServerOnline) return { ok: false, offline: true, status: 0, error: '当前处于离线模式' };
  const headers = {
    'X-Room-Code': currentRoomCode,
    'X-Person': encodeURIComponent(state?.name || '')
  };
  if (data && !(data instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  const opts = { method, headers, cache: 'no-cache' };
  if (data) {
    opts.body = (data instanceof FormData) ? data : JSON.stringify(data);
  }
  try {
    const res = await fetch('/api' + endpoint, opts);
    let json = {};
    try { json = await res.json(); } catch {}
    if (!res.ok) {
      const errMsg = json.error || json.message || ('请求失败 (' + res.status + ')');
      if (method !== 'GET') lastSyncError = errMsg;
      return { ok: false, success: false, status: res.status, error: errMsg, ...json };
    }
    if (method !== 'GET') lastSyncError = '';
    if (json && typeof json === 'object' && !Array.isArray(json)) {
      return Object.assign(json, { ok: true, status: res.status });
    }
    return { ok: true, status: res.status, data: json };
  } catch (e) {
    console.warn('[ServerSync] API call failed:', endpoint, e);
    if (method !== 'GET') lastSyncError = '网络连接异常';
    return { ok: false, success: false, status: 0, error: '无法连接到服务器' };
  }
}

function hasActiveEditingState() {
  if (draft) return true;
  if ($('#editor')?.open) return true;
  const ae = document.activeElement;
  if (ae && ['INPUT', 'TEXTAREA', 'SELECT'].includes(ae.tagName)) return true;
  return false;
}

function initSSE() {
  if (embedded || demo || !isServerOnline || typeof EventSource === 'undefined') return;
  if (sseSource) sseSource.close();
  try {
    sseSource = new EventSource('/api/events?roomCode=' + encodeURIComponent(currentRoomCode));
    sseSource.addEventListener('state_change', async () => {
      if (hasActiveEditingState() || pendingOps.length > 0) {
        toast('收到远端数据更新，保存当前编辑后自动同步');
        return;
      }
      const remoteState = await serverFetch('/state');
      if (remoteState && remoteState.ok) {
        state = hydrateState(remoteState);
        persistLocalOnly();
        render(true);
      }
    });
    sseSource.onerror = () => {
      sseSource.close();
      sseSource = null;
      setTimeout(initSSE, 10000);
    };
  } catch (err) {
    console.warn('[SSE] EventSource init failed:', err);
  }
}

async function syncLocalToCloud() {
  if (!isServerOnline) { toast('当前处于离线模式，无法同步至云端'); return; }
  await flushPendingOps();
  if (lastSyncError) { toast('部分变更同步失败：' + lastSyncError); return; }
  const res = await serverFetch('/import', 'POST', state);
  if (res && res.ok) {
    toast('本地全部数据已成功迁移同步至云端 SQLite！');
    const latest = await serverFetch('/state');
    if (latest && latest.ok) {
      state = hydrateState(latest);
      persistLocalOnly();
      render(true);
    }
  } else {
    toast('同步失败：' + (res?.error || '请检查网络或后端状态'));
  }
}

function persistLocalOnly() {
  if (demo || !hasLocalStorage) return;
  try { localStorage.setItem(STORE, JSON.stringify(state)); } catch { toast('浏览器存储空间不足，请先导出备份。'); }
}

function persist(syncPlans = false) {
  persistLocalOnly();
  if (syncPlans && isServerOnline) {
    serverFetch('/plans', 'PATCH', {
      goal: state.goal,
      days: state.days,
      studyGoal: state.studyGoal,
      studyDays: state.studyDays,
      sportDatePlan: state.sportDatePlan,
      studyDatePlan: state.studyDatePlan
    });
  }
}
function toast(message) {
  const t = $('#toast');
  if (!t) return;
  t.textContent = message;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

/* ---------- Core Helpers: Sports + Study + Discipline + Multiplayer Competition ---------- */
function allMembers() { return [state.name, ...state.members]; }
function memberColor(name) {
  const idx = allMembers().indexOf(name);
  return MEMBER_PALETTE[Math.max(0, idx) % MEMBER_PALETTE.length];
}
function total(records = state.records) { return records.reduce((s, r) => s + r.km, 0); }
function totalStudy(records = state.studyRecords) { return records.reduce((s, r) => s + (r.hours || 0), 0); }
function monthly(records = state.records) { return records.filter(r => r.date.slice(0, 7) === today().slice(0, 7)); }
function weekStart() { const d = chinaNow(); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return dateKey(d); }
function weekly(records = state.records) { return records.filter(r => r.date >= weekStart() && r.date <= today()); }
function mine(records = state.records) { return records.filter(r => r.person === state.name); }
function mineStudy(records = state.studyRecords) { return records.filter(r => r.person === state.name); }
function runToday(name = state.name) { return state.records.some(r => r.person === name && r.date === today()); }
function studyToday(name = state.name) { return state.studyRecords.some(r => r.person === name && r.date === today()); }
function isSportPlanned(dk) {
  if (state.sportDatePlan && Object.prototype.hasOwnProperty.call(state.sportDatePlan, dk)) return !!state.sportDatePlan[dk];
  return state.days.includes(new Date(dk + 'T12:00:00').getDay());
}
function isStudyPlanned(dk) {
  if (state.studyDatePlan && Object.prototype.hasOwnProperty.call(state.studyDatePlan, dk)) return !!state.studyDatePlan[dk];
  return state.studyDays.includes(new Date(dk + 'T12:00:00').getDay());
}

function activeHabits() { return state.habits.filter(h => !h.archived); }
function activeStudyTargets() { return state.studyTargets.filter(t => !t.archived); }
function targetStats(t, person = state.name) {
  const linked = state.studyRecords.filter(r => r.person === person && r.targetId === t.id);
  const recTotal = Math.round(totalStudy(linked) * 100) / 100;
  const baseH = Number(t.baseHours) || 0;
  return { recTotal, baseH, cumulative: Math.round((baseH + recTotal) * 10) / 10, count: linked.length };
}
function recomputeStudyTargetDoneHours() {
  state.studyTargets.forEach(t => {
    const st = targetStats(t, state.name);
    if (t.baseHours !== undefined || st.recTotal > 0) t.doneHours = Math.max(st.cumulative, 0);
  });
}

function habitRateForPerson(name = state.name, dk = today()) {
  const list = activeHabits();
  const totalH = Math.max(1, list.length);
  const doneIds = name === state.name
    ? (state.habitLogs[dk] || [])
    : (state.memberHabitLogs?.[name]?.[dk] || []);
  const validDone = list.filter(h => doneIds.includes(h.id)).length;
  return { done: validDone, total: list.length, pct: Math.round(validDone / totalH * 100) };
}
function habitRateForDate(dk = today()) { return habitRateForPerson(state.name, dk); }
function weeklyHabitPct(name = state.name) {
  let sum = 0;
  for (let i = 0; i < 7; i++) sum += habitRateForPerson(name, dateShift(-i)).pct;
  return Math.round(sum / 7);
}
function streak(name = state.name) {
  const dates = new Set(state.records.filter(r => r.person === name).map(r => r.date));
  let s = 0, start = dates.has(today()) ? 0 : -1;
  for (let i = start; dates.has(dateShift(i)); i--) s++;
  return s;
}
function studyStreak(name = state.name) {
  const dates = new Set(state.studyRecords.filter(r => r.person === name).map(r => r.date));
  let s = 0, start = dates.has(today()) ? 0 : -1;
  for (let i = start; dates.has(dateShift(i)); i--) s++;
  return s;
}
function dualStreak(name = state.name) {
  const dates = new Set([
    ...state.records.filter(r => r.person === name).map(r => r.date),
    ...state.studyRecords.filter(r => r.person === name).map(r => r.date)
  ]);
  let s = 0, start = dates.has(today()) ? 0 : -1;
  for (let i = start; dates.has(dateShift(i)); i--) s++;
  return s;
}
function pace(r) { const s = Math.round(r.minutes * 60 / Math.max(0.01, r.km)); return Math.floor(s / 60) + "′" + pad(s % 60) + "″"; }
function paceSeconds(r) { return r.minutes * 60 / Math.max(0.01, r.km); }
function formatPaceSec(sec) { if (!Number.isFinite(sec) || sec <= 0) return '—'; const s = Math.round(sec); return Math.floor(s / 60) + "′" + pad(s % 60) + "″"; }
function avgPace(records = state.records) { return records.length ? pace({ minutes: records.reduce((s, r) => s + r.minutes, 0), km: total(records) }) : '—'; }
function level(name = state.name) {
  const runs = state.records.filter(r => r.person === name), st = state.studyRecords.filter(r => r.person === name);
  if (runs.some(r => r.km >= 21.1) && totalStudy(st) >= 8) return '双料行者';
  if (runs.some(r => r.km >= 21.1)) return '半马勇者';
  if (totalStudy(st) >= 5) return '深度学者';
  return (runs.length || st.length) ? '自律新星' : '即刻出发';
}
function monthElapsedPct() {
  const d = chinaNow();
  const dim = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  return Math.round(d.getDate() / dim * 100);
}

function teamLeaderboard(period = '本月', metric = '综合积分') {
  const filterBy = list => list.filter(r => period === '总榜' || (period === '今天' ? r.date === today() : period === '本周' ? r.date >= weekStart() : r.date.slice(0, 7) === today().slice(0, 7)));
  const sRecords = filterBy(state.records), lRecords = filterBy(state.studyRecords);
  return allMembers().map(name => {
    const sList = sRecords.filter(r => r.person === name), lList = lRecords.filter(r => r.person === name);
    const km = total(sList), hrs = totalStudy(lList);
    const days = new Set([...sList.map(r => r.date), ...lList.map(r => r.date)]).size;
    const likes = sList.reduce((s, r) => s + (r.likes || 0), 0) + lList.reduce((s, r) => s + (r.likes || 0), 0);
    const hbRate = weeklyHabitPct(name);
    const score = Math.round(km * 10 + hrs * 25 + days * 15 + likes * 5 + hbRate * 0.5);
    return { name, sList, lList, km, hrs, days, likes, hbRate, score, streak: dualStreak(name) };
  }).sort((a, b) => metric === '综合积分' ? b.score - a.score : metric === '按公里' ? b.km - a.km : metric === '按学习' ? b.hrs - a.hrs : metric === '按天数' ? b.days - a.days : b.likes - a.likes);
}

/* Unified Records Stream */
function allUnifiedRecords(filterKind = 'all', onlyMine = false) {
  const sBase = onlyMine ? mine() : state.records;
  const lBase = onlyMine ? mineStudy() : state.studyRecords;
  const sList = filterKind === 'study' ? [] : sBase.map(r => ({ ...r, _kind: 'sport', _key: 'sport:' + r.id }));
  const lList = filterKind === 'sport' ? [] : lBase.map(r => ({ ...r, _kind: 'study', _key: 'study:' + r.id }));
  return [...sList, ...lList].sort((a, b) => (b.date + b.time + b.id).localeCompare(a.date + a.time + a.id));
}

function findTargetTitle(id) {
  return state.studyTargets.find(t => t.id === id)?.title || '自主深度学习';
}

/* Seamless Full-Width Marquee Builder (2 identical halves, each >= 2200px wide) */
function marqueeTrackMarkup(chunksHtml) {
  const half = chunksHtml + chunksHtml + chunksHtml + chunksHtml;
  return '<div class="marquee-track"><div class="marquee-half">' + half + '</div><div class="marquee-half" aria-hidden="true">' + half + '</div></div>';
}

function updateHeader() {
  const d = chinaNow();
  $('#today-date').textContent = d.getFullYear() + '.' + pad(d.getMonth() + 1) + '.' + pad(d.getDate()) + ' · 周' + '日一二三四五六'[d.getDay()];
  const mtKm = total(mine(monthly())).toFixed(1), mtH = totalStudy(monthly(mineStudy())).toFixed(1);
  const hb = habitRateForDate(today());
  const board = teamLeaderboard('本月', '综合积分');
  const myRank = board.findIndex(x => x.name === state.name) + 1;
  const top = board[0];
  const solo = board.length === 1;
  const content = [
    solo ? '早起奔跑 · 专注学习 · 个人双轨自律日志' : '早起奔跑 · 专注学习 · 多人竞技打卡',
    state.name + ' 本月跑 ' + mtKm + '/' + state.goal + 'KM',
    '本月学习 ' + mtH + '/' + state.studyGoal + 'H',
    '今日自律 ' + hb.done + '/' + hb.total + ' 项',
    solo ? ('个人积分 ' + (top?.score || 0) + ' 分 · 随时可＋伙伴') : ('PK榜第 ' + myRank + '/' + board.length + ' 名 · 榜首 ' + (top?.name || state.name) + ' (' + (top?.score || 0) + '分)'),
    '双轨连胜 ' + dualStreak() + ' 天'
  ];
  const tickerChunks = content.map(t => '<span>' + esc(t) + '</span><b>＋</b>').join('');
  $('#ticker-content').innerHTML = marqueeTrackMarkup(tickerChunks);

  const blueFlow = $('#blue-flow');
  if (blueFlow) {
    const todayWinners = allMembers().filter(n => runToday(n) || studyToday(n));
    const blueItems = [
      '比昨天的自己多学一页',
      '早起奔跑，保持清醒',
      '专注一小时，胜过拖延一整天',
      solo
        ? ('今日个人进度：运动 ' + (runToday() ? '✓' : '待打卡') + ' · 学习 ' + (studyToday() ? '✓' : '待打卡'))
        : ('今日已有 ' + todayWinners.length + '/' + allMembers().length + ' 位伙伴完成打卡：' + (todayWinners.length ? todayWinners.join(' · ') : '等你率先点亮')),
      '学习 · 自律 · 运动，一步步走向更好的自己'
    ];
    const blueChunks = blueItems.map(t => '<span>' + esc(t) + '</span><em>　✦　</em>').join('');
    blueFlow.innerHTML = marqueeTrackMarkup(blueChunks);
  }

  const liveMarquee = $('#live-marquee');
  if (liveMarquee) {
    const mt = total(mine(monthly())), stH = totalStudy(monthly(mineStudy()));
    const sPct = Math.round(mt / Math.max(1, state.goal) * 100);
    const stPct = Math.round(stH / Math.max(1, state.studyGoal) * 100);
    const sportBoard = [...board].sort((a, b) => b.km - a.km);
    const mySportRank = sportBoard.findIndex(x => x.name === state.name) + 1;
    const studyBoard = [...board].sort((a, b) => b.hrs - a.hrs);
    const myStudyRank = studyBoard.findIndex(x => x.name === state.name) + 1;
    const myRow = board[myRank - 1] || { score: 0 };
    const liveItems = [
      state.name + ' 本月运动 ' + mt.toFixed(1) + '/' + state.goal + 'km · 学习 ' + stH.toFixed(1) + '/' + state.studyGoal + 'h',
      '今日自律 ' + hb.done + '/' + hb.total + ' 项 · 双轨连胜 ' + dualStreak() + ' 天',
      solo
        ? ('当前个人积分 ' + myRow.score + ' 分 · 可点「＋ 加人物」邀请伙伴同榜')
        : ('多人PK总榜：' + board.map((r, i) => '#' + (i + 1) + ' ' + r.name + ' ' + r.score + '分').join(' · ')),
      solo ? ('目标达成：运动 ' + sPct + '% · 学习 ' + stPct + '%') : ('运动榜 #' + mySportRank + ' · 学习榜 #' + myStudyRank)
    ];
    const liveChunks = liveItems.map(t => '<span>' + esc(t) + '</span><em>◆</em>').join('');
    liveMarquee.innerHTML = marqueeTrackMarkup(liveChunks);
  }
}

function tick() {
  const d = chinaNow();
  const c = $('#clock');
  if (c) c.textContent = pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
}
function ring(value, label, percent, size = 'md', variant = 'orange') {
  const sz = size === 'lg' ? 102 : 92;
  return PixelProgressBar.renderRingHtml({
    progress: percent,
    size: sz,
    viewBoxSize: 108,
    thickness: 18,
    radius: 39,
    variant: variant,
    bare: true,
    valueText: String(value),
    labelText: label ? String(label) : '',
    ariaLabel: (label || '环形进度') + ' ' + value,
    className: 'ring ring-' + size
  });
}
function heading(title, right = '', ico = '') {
  return '<div class="section-heading"><span class="heading-title">' + (ico ? icon(ico, 'heading-ico') : '') + title + '</span><small>' + right + '</small></div>';
}
function subtabs(values, selected, action, cls = '', iconMap = null) {
  return '<div class="subtabs ' + cls + '">' + values.map(v => '<button data-action="' + action + '" data-value="' + v + '" class="' + (v === selected ? 'active' : '') + '">' + (iconMap && iconMap[v] ? icon(iconMap[v], 'tab-ico') : '') + '<span>' + v + '</span></button>').join('') + '</div>';
}

function arrowBoxMarkup() {
  return '<span class="arrow-box" aria-hidden="true"><i class="arr-main">→</i><i class="arr-clone">→</i></span>';
}

function cta(coral = false) {
  const hasTeam = state.members.length > 0;
  if (coral) {
    return '<div class="cta-dual-bar">'
      + '<button class="checkin-cta coral" data-action="checkin" data-mode="sport"><span><strong>运动打卡</strong><small>' + (runToday() ? '今日已跑 ✓' + (hasTeam ? ' · 支持切伙伴' : '') : '点击记录距离与配速') + '</small></span>' + arrowBoxMarkup() + '</button>'
      + '<button class="checkin-cta blue-cta" data-action="checkin" data-mode="study"><span><strong>学习打卡</strong><small>' + (studyToday() ? '今日已学 ✓' + (hasTeam ? ' · 支持切伙伴' : '') : '点击记录专注与目标') + '</small></span>' + arrowBoxMarkup() + '</button>'
      + '</div>';
  }
  const rDone = runToday(), sDone = studyToday();
  return '<div class="checkin-cta dual-home-cta">'
    + '<button class="dual-cta-half is-sport" data-action="checkin" data-mode="sport"><span><strong>运动打卡</strong><small>RUN · ' + (rDone ? '今日已跑 1/1 ✓' : '点击记录跑步') + '</small></span>' + arrowBoxMarkup() + '</button>'
    + '<button class="dual-cta-half is-study" data-action="checkin" data-mode="study"><span><strong>学习打卡</strong><small>STUDY · ' + (sDone ? '今日已学 1/1 ✓' : '点击记录专注') + '</small></span>' + arrowBoxMarkup() + '</button>'
    + '</div>';
}

const quotes = [
  ['SMALL STEPS.<br><em>EVERY</em> DAY.', 'flame', '不积跬步，无以至千里'],
  ['DISCIPLINE IS<br><em>FREEDOM.</em>', 'lightning', '自律的尽头，是真正的自由'],
  ['SHARP MIND.<br>STRONG <em>BODY.</em>', 'black', '头脑清醒，体魄强健'],
  ['ONE MORE<br><em>CHAPTER.</em>', 'flame', '再多学一章，再多跑一程'],
  ['EARN YOUR<br><em>PEACE.</em>', 'lightning', '流过汗与墨，才配得上从容'],
  ['YOUR PACE.<br><em>YOUR</em> FUTURE.', 'black', '按自己的配速，跑向自己的未来'],
  ['SHOW UP<br><em>BEFORE</em> DAWN.', 'flame', '在天亮之前出发，在喧嚣之前沉思'],
  ['DEEP WORK.<br><em>ZERO</em> EXCUSES.', 'lightning', '深度专注，绝不拖延'],
  ['RUN WITH<br><em>RIVALS.</em>', 'black', '与强手并肩，在竞技中共同进化'],
  ['CONSISTENCY<br>BEATS <em>TALENT.</em>', 'flame', '持续执行，远胜一时天赋'],
  ['SWEAT NOW.<br><em>SHINE</em> LATER.', 'flame', '此刻流汗，来日闪光'],
  ['READ HARD.<br>THINK <em>CLEAR.</em>', 'lightning', '深读硬啃，思考清澈'],
  ['START EARLY.<br><em>FINISH</em> STRONG.', 'flame', '清晨启程，强势收官'],
  ['BUILD HABITS.<br><em>SHAPE</em> DESTINY.', 'lightning', '习惯成自然，日常塑命运'],
  ['KEEP MOVING.<br><em>NO</em> SHORTCUTS.', 'black', '步履不停，没有捷径']
];

function quoteMarkup() {
  const idx = quoteIndex % quotes.length;
  const q = quotes[idx];
  const theme = q[1] || 'lightning';
  const themeTag = theme === 'flame' ? 'PIXEL.FLAME' : theme === 'lightning' ? 'PIXEL.LIGHTNING' : 'PIXEL.MATRIX';
  const dots = quotes.map((_, i) => '<button type="button" class="quote-dot ' + (i === idx ? 'active' : '') + '" data-quote="' + i + '" aria-label="切换到第 ' + (i + 1) + ' 句宣言"><i class="quote-dot-fill"></i></button>').join('');
  return '<section class="quote ' + theme + '" id="quote" role="button" tabindex="0" aria-label="切换每日宣言卡片">'
    + '<canvas class="pixel-matrix-canvas" data-pixel-theme="' + theme + '" aria-hidden="true"></canvas>'
    + '<div class="quote-meta"><span>[ 今日宣言 · ' + themeTag + '_0' + pad(idx + 1) + ' ]</span><div class="quote-meta-right"><div class="quote-tex-switch"><button type="button" class="quote-tex-btn ' + (theme === 'flame' ? 'active' : '') + '" data-quote="0">🔥 火焰</button><button type="button" class="quote-tex-btn ' + (theme === 'lightning' ? 'active' : '') + '" data-quote="1">⚡ 闪电</button></div><span>' + pad(idx + 1) + ' / ' + pad(quotes.length) + '</span></div></div>'
    + '<h2 class="mask-reveal">' + q[0] + '</h2>'
    + '<div class="quote-foot"><span class="quote-sub">' + q[2] + '</span><div class="quote-dots">' + dots + '</div></div>'
    + '<div class="pixel-dither-edge" aria-hidden="true"></div>'
    + '<div class="quote-line"></div></section>';
}

/* ---------- Multi-Dimensional Study Radar SVG on Home ---------- */
function studyRadarAxes(person = state.name) {
  const mySt = state.studyRecords.filter(r => r.person === person);
  const mtHours = totalStudy(monthly(mySt));
  const weekHours = totalStudy(weekly(mySt));
  const targetGoalHours = person === state.name ? state.studyGoal : 60;
  const expectedPaceH = Math.max(4, targetGoalHours * Math.max(0.15, monthElapsedPct() / 100));
  const timeScore = Math.min(100, Math.max(mtHours > 0 ? 22 : 8, Math.round((mtHours / expectedPaceH) * 80)));

  const avgTargetPct = person === state.name
    ? Math.round(state.studyTargets.reduce((s, t) => s + Math.min(1, t.doneHours / Math.max(1, t.targetHours)), 0) / Math.max(1, state.studyTargets.length) * 100)
    : Math.min(100, Math.round(mtHours / 15 * 68));

  const avgFocus = mySt.length ? mySt.reduce((s, r) => s + (r.focus || 2), 0) / mySt.length : 0;
  const weekSessions = weekly(mySt).length;
  const effortScore = mySt.length ? Math.min(100, Math.round((avgFocus / 4) * 62 + Math.min(4, weekSessions) * 9.5)) : 10;

  const hab7 = weeklyHabitPct(person);
  const ds = dualStreak(person);
  const disciplineScore = Math.min(100, Math.round(hab7 * 0.82 + Math.min(9, ds) * 2));

  return [
    { key: '学习时间', en: 'TIME', val: timeScore, sub: mtHours.toFixed(1) + 'h / 周' + weekHours.toFixed(1) + 'h', targetView: 'study' },
    { key: '任务完成度', en: 'TASKS', val: avgTargetPct, sub: state.studyTargets.length + '目标 ' + avgTargetPct + '%', targetView: 'study' },
    { key: '努力程度', en: 'EFFORT', val: effortScore, sub: '均专注 ' + avgFocus.toFixed(1) + '/4 · ' + weekSessions + '场', targetView: 'records' },
    { key: '自律时间', en: 'HABIT', val: disciplineScore, sub: '7日 ' + hab7 + '% · 连胜' + ds + '天', targetView: 'people' }
  ];
}

function homeBlueprintStudySvg() {
  const axes = studyRadarAxes(state.name);
  const topRival = state.members[0] ? studyRadarAxes(state.members[0]) : null;
  const avgRadar = Math.round(axes.reduce((s, a) => s + a.val, 0) / axes.length);
  const rivalAvg = topRival ? Math.round(topRival.reduce((s, a) => s + a.val, 0) / topRival.length) : null;
  const axColors = ['#203f91', '#e5492b', '#e4a334', '#262624'];

  const cx = 85, cy = 103, R = 46;
  const dialRing = PixelProgressBar.buildRingLayers({ progress: avgRadar, cx, cy, radius: R, thickness: 18, variant: 'blue' });
  const rivalRing = rivalAvg !== null ? PixelProgressBar.buildRingLayers({ progress: rivalAvg, cx, cy, radius: 31, thickness: 12, variant: 'orange' }) : null;
  const dialTicks = Array.from({ length: 24 }, (_, i) => {
    const ang = (i / 24) * Math.PI * 2 - Math.PI / 2;
    const r1 = R + 11, r2 = i % 6 === 0 ? R + 16 : R + 13.5;
    return '<line x1="' + (cx + r1 * Math.cos(ang)).toFixed(1) + '" y1="' + (cy + r1 * Math.sin(ang)).toFixed(1)
      + '" x2="' + (cx + r2 * Math.cos(ang)).toFixed(1) + '" y2="' + (cy + r2 * Math.sin(ang)).toFixed(1)
      + '" stroke="' + (i % 6 === 0 ? '#203F91' : '#BDB6AA') + '" stroke-width="' + (i % 6 === 0 ? '1.3' : '.75') + '"/>';
  }).join('');

  const dialPanel = '<g class="bp-hit" data-action="go-view" data-value="study" role="button" tabindex="0" style="cursor:pointer">'
    + '<defs>' + dialRing.defs + (rivalRing ? rivalRing.defs : '') + '</defs>'
    + '<rect x="14" y="14" width="142" height="178" fill="#f7f6ef" stroke="#262624" stroke-width="1.4"/>'
    + '<rect x="14" y="14" width="142" height="18" fill="#1a1a18"/>'
    + '<text x="22" y="26" style="font:700 8px var(--mono);fill:#e4a334;letter-spacing:.7px">STUDY POWER INDEX</text>'
    + dialTicks
    + dialRing.markup
    + (rivalRing ? rivalRing.markup : '')
    + '<text x="' + cx + '" y="' + (cy + 5) + '" text-anchor="middle" style="font:900 26px var(--sans);fill:#203F91;letter-spacing:-1px">' + avgRadar + '<tspan style="font:700 10px var(--mono);fill:#262624">%</tspan></text>'
    + '<text x="' + cx + '" y="' + (cy + 18) + '" text-anchor="middle" style="font:700 7.5px var(--mono);fill:#6e6d65">4D 综合指数</text>'
    + '<line x1="22" y1="168" x2="148" y2="168" stroke="#d3d1c7" stroke-width="1"/>'
    + '<text x="22" y="182" style="font:700 8px var(--mono);fill:#203F91">■ ' + esc(state.name) + ' ' + avgRadar + '%</text>'
    + (topRival ? '<text x="148" y="182" text-anchor="end" style="font:700 8px var(--mono);fill:#E5492B">' + esc(state.members[0].slice(0, 4)) + ' ' + rivalAvg + '%</text>'
      : '<text x="148" y="182" text-anchor="end" style="font:700 7.5px var(--mono);fill:#6e6d65">点卡进学习 →</text>')
    + '</g>';

  const rowsHtml = axes.map((ax, i) => {
    const y = 14 + i * 46, isSel = radarFocusAxis === ax.key, clr = axColors[i % axColors.length];
    const barX = 174, barY = y + 24, barW = 244, barH = 10, segs = 20, segGap = 2;
    const segW = (barW - (segs - 1) * segGap) / segs;
    const filledSegs = Math.max(1, Math.round((Math.min(100, ax.val) / 100) * segs));
    const blocks = Array.from({ length: segs }, (_, si) => {
      const bx = barX + si * (segW + segGap), on = si < filledSegs;
      return '<rect x="' + bx.toFixed(1) + '" y="' + barY + '" width="' + segW.toFixed(1) + '" height="' + barH
        + '" fill="' + (on ? clr : '#FFFFFF') + '" stroke="' + (on ? clr : '#D6D0C6') + '" stroke-width=".6" opacity="' + (on ? (si % 2 === 0 ? '1' : '.86') : '1') + '"/>';
    }).join('');
    const rivalVal = topRival ? topRival[i].val : null;
    const rivalX = rivalVal !== null ? (barX + (Math.min(100, rivalVal) / 100) * barW) : 0;
    return '<g class="bp-hit study-pillar-row ' + (isSel ? 'is-selected' : '') + '" data-action="radar-axis" data-value="' + ax.key + '" role="button" tabindex="0" style="cursor:pointer">'
      + '<rect x="164" y="' + y + '" width="264" height="40" fill="' + (isSel ? '#ffffff' : '#f7f6ef') + '" stroke="' + (isSel ? '#1a1a18' : '#bdbab0') + '" stroke-width="' + (isSel ? '1.8' : '1') + '"/>'
      + '<rect x="164" y="' + y + '" width="4" height="40" fill="' + clr + '"/>'
      + '<text x="175" y="' + (y + 15.5) + '" style="font:800 10.5px var(--body);fill:' + (isSel ? '#e5492b' : '#1a1a18') + '">0' + (i + 1) + ' ' + ax.key + '</text>'
      + '<text x="266" y="' + (y + 15.5) + '" style="font:600 8.5px var(--mono);fill:#6e6d65">' + esc(ax.sub) + '</text>'
      + '<text x="420" y="' + (y + 16) + '" text-anchor="end" style="font:900 13px var(--mono);fill:' + clr + '">' + ax.val + '%</text>'
      + blocks
      + (rivalVal !== null ? '<line x1="' + rivalX.toFixed(1) + '" y1="' + (barY - 2) + '" x2="' + rivalX.toFixed(1) + '" y2="' + (barY + barH + 2) + '" stroke="#e5492b" stroke-width="2"/>' : '')
      + '</g>';
  }).join('');

  return '<svg class="track-svg study-radar-svg" viewBox="0 0 440 218" role="img" aria-label="学习时间、任务完成度、努力程度、自律时间四维像素遥测面板">'
    + '<defs><pattern id="study-minor-grid" width="22" height="22" patternUnits="userSpaceOnUse"><path d="M22 0H0V22" fill="none" stroke="#9997" stroke-width=".25"/></pattern>'
    + '<linearGradient id="study-dial-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#203f91"/><stop offset="55%" stop-color="#4774eb"/><stop offset="100%" stop-color="#e5492b"/></linearGradient>'
    + '<pattern id="study-px-overlay" width="6" height="6" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="3" height="3" fill="#f7f6ef" opacity=".24"/><rect x="3" y="3" width="3" height="3" fill="#e4a334" opacity=".24"/></pattern></defs>'
    + '<rect x="8" y="3" width="424" height="210" fill="url(#study-minor-grid)" opacity=".32" pointer-events="none" style="pointer-events:none"/>'
    + '<path class="cross" d="M12 7V19M6 13H18M428 7V19M422 13H434"/>'
    + dialPanel + rowsHtml + '</svg>';
}

function track() {
  const done = runToday(), sDone = studyToday();
  const members = allMembers();
  const trackRoster = members.map((m, idx) => {
    const clr = memberColor(m);
    const mKm = total(monthly(state.records.filter(r => r.person === m)));
    const mDone = runToday(m);
    const baseAngles = [Math.PI * 0.5, -Math.PI * 0.45, -Math.PI * 0.08, Math.PI * 0.92, -Math.PI * 0.72, Math.PI * 0.18];
    const ang = baseAngles[idx % baseAngles.length] + Math.min(0.28, (mKm / Math.max(1, state.goal)) * 0.35);
    const lane = idx % 4;
    const rx = 148 - lane * 9, ry = 68.5 - lane * 9;
    const cx = idx === 0 ? 228 : (220 + rx * Math.cos(ang));
    const cy = idx === 0 ? 171 : (107.5 + ry * Math.sin(ang));
    const tagRight = cx >= 220;
    const tagX = idx === 0 ? cx + 22 : (tagRight ? Math.min(416, cx + 16) : Math.max(24, cx - 16));
    const tagAnchor = idx === 0 ? 'start' : (tagRight ? 'start' : 'end');
    const tagY = idx === 0 ? cy + 4 : (cy < 107.5 ? cy - 2 : cy + 4);
    const isMe = idx === 0;
    return '<g class="bp-hit track-runner-pin" data-action="checkin" data-mode="sport" data-person="' + esc(m) + '" role="button" tabindex="0">'
      + (isMe ? '<circle class="runner-pulse" cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="27"/><circle class="runner-pulse" cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="19" style="animation-delay:-1.2s"/>' : '')
      + '<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="' + (isMe ? 15.5 : 12.5) + '" fill="' + clr + '" stroke="#f2f1e8" stroke-width="2.2"/>'
      + '<text class="track-name" x="' + cx.toFixed(1) + '" y="' + (cy + 4).toFixed(1) + '" text-anchor="middle" style="font-size:' + (isMe ? 11.5 : 10) + 'px">' + esc(m.slice(0, 1)) + '</text>'
      + (mDone ? '<circle cx="' + (cx + (isMe ? 13 : 10)).toFixed(1) + '" cy="' + (cy - (isMe ? 12 : 9)).toFixed(1) + '" r="6" fill="#262624" stroke="#f2f1e8" stroke-width="1.3"/><text x="' + (cx + (isMe ? 13 : 10)).toFixed(1) + '" y="' + (cy - (isMe ? 9.2 : 6.2)).toFixed(1) + '" text-anchor="middle" style="font:800 7.5px var(--mono);fill:#e4a334">✓</text>' : '')
      + (!isMe ? '<text x="' + tagX.toFixed(1) + '" y="' + tagY.toFixed(1) + '" text-anchor="' + tagAnchor + '" style="font:700 8px var(--mono);fill:' + clr + '">' + esc(m) + ' ' + mKm.toFixed(0) + 'k</text>' : '')
      + '</g>';
  }).join('');

  const trackBody = homeBpMode === 'study'
    ? homeBlueprintStudySvg()
    : '<svg class="track-svg" viewBox="0 0 440 215" role="img" aria-label="多人晨跑操场轨道"><defs>'
      + '<pattern id="minor-grid" width="22" height="22" patternUnits="userSpaceOnUse"><path d="M22 0H0V22" fill="none" stroke="#9997" stroke-width=".25"/></pattern>'
      + '<pattern id="turf-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><path d="M0 0V8" stroke="#5b6a4e" stroke-opacity=".11" stroke-width="1"/></pattern>'
      + '<pattern id="finish-check" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="2" height="2" fill="#262624"/><rect x="2" y="2" width="2" height="2" fill="#262624"/></pattern>'
      + '</defs>'
      + '<rect x="8" y="3" width="424" height="205" fill="url(#minor-grid)" opacity=".28"/>'
      + '<rect class="track-surface" x="72" y="39" width="296" height="137" rx="68.5"/>'
      + '<rect class="track-infield" x="99" y="66" width="242" height="83" rx="41.5"/>'
      + '<path class="dimension" d="M40 110H401M221 20V189M134 30V17M305 30V17M134 23H305M400 39V176M394 39H406M394 176H406"/>'
      + '<text x="205" y="17">84.39 m</text><text x="394" y="110">73.00 m</text><text x="196" y="77">INFIELD</text>'
      + [0, 1, 2, 3].map(i => '<rect class="lane' + (i === 0 ? ' lane-outer' : '') + '" x="' + (72 + i * 9) + '" y="' + (39 + i * 9) + '" width="' + (296 - i * 18) + '" height="' + (137 - i * 18) + '" rx="' + (68.5 - i * 9) + '"/>').join('')
      + '<rect x="228" y="149" width="4" height="27" fill="url(#finish-check)" opacity=".75"/>'
      + '<text class="lane-tag" x="80" y="102">L1</text><text class="lane-tag" x="89" y="112">L2</text>'
      + '<rect class="lane" x="168" y="84" width="107" height="48"/>'
      + '<path class="lane" d="M221 84V132M168 95H177V120H168M275 95H267V120H275"/>'
      + '<circle class="lane" cx="221" cy="108" r="10"/>'
      + '<path class="cross" d="M18 11V31M8 21H28M415 11V31M405 21H425M18 183V203M8 193H28M415 183V203M405 193H425"/>'
      + '<text x="208" y="198">' + (members.length === 1 ? 'START · 个人主跑道' : ('START · ' + members.length + '人同跑')) + '</text>'
      + '<g class="orbit-runner orbit-trail-2" aria-hidden="true"><circle r="3" fill="#e4a334"/></g>'
      + '<g class="orbit-runner orbit-trail-1" aria-hidden="true"><circle r="4.5" fill="#e5492b"/></g>'
      + '<g class="orbit-runner" aria-hidden="true"><circle r="6" fill="#e5492b" stroke="#f2f1e8" stroke-width="2"/><circle r="11" fill="none" stroke="#e5492b" opacity=".4"/></g>'
      + trackRoster
      + '</svg>';

  return '<div class="track-wrap">'
    + trackBody
    + '<button class="track-badge track-mode-switch" data-action="toggle-home-bp" title="点击切换运动跑道与四维学习雷达">' + (homeBpMode === 'study' ? '4D RADAR ⇄ 400M 跑道' : '400M TRACK ⇄ 四维学习雷达') + '</button>'
    + '<button class="track-add-btn" data-action="add-person" title="添加竞技人物/伙伴">' + (members.length === 1 ? '＋ 加人物' : '＋ 加人物 (' + members.length + '人)') + '</button>'
    + '<button class="track-caption ' + ((done && sDone) ? 'done' : '') + '" data-action="go-view" data-value="' + (homeBpMode === 'study' ? 'study' : 'progress') + '">' + (homeBpMode === 'study' ? ('选中：' + radarFocusAxis + ' · 进学习目标 →') : (done ? '今日已跑 ✓ · 点节点查看线表' : '跑 ' + (done ? 1 : 0) + '/1 · 学 ' + (sDone ? 1 : 0) + '/1 · ' + (members.length === 1 ? '查看双轨线表 →' : members.length + '人同跑'))) + '</button>'
    + '</div>';
}

function home() {
  const mt = total(mine(monthly())), stH = totalStudy(monthly(mineStudy()));
  const sPct = Math.round(mt / Math.max(1, state.goal) * 100);
  const stPct = Math.round(stH / Math.max(1, state.studyGoal) * 100);
  const hb = habitRateForDate(today());
  const board = teamLeaderboard('本月', '综合积分');
  const myRank = board.findIndex(x => x.name === state.name) + 1;
  const myRow = board[myRank - 1] || { score: 0, km: mt, hrs: stH };
  const sportBoard = [...board].sort((a, b) => b.km - a.km);
  const mySportRank = sportBoard.findIndex(x => x.name === state.name) + 1;
  const sportLeadDelta = sportBoard[0] ? (sportBoard[0].km - mt).toFixed(1) : '0';
  const studyBoard = [...board].sort((a, b) => b.hrs - a.hrs);
  const myStudyRank = studyBoard.findIndex(x => x.name === state.name) + 1;
  const studyLeadDelta = studyBoard[0] ? (studyBoard[0].hrs - stH).toFixed(1) : '0';
  const solo = board.length === 1;

  return '<div class="home">'
    + quoteMarkup() + track() + cta()
    + '<section class="home-metrics home-metrics-4" aria-label="运动学习自律与核心进度">'
    + '<button class="metric-tile" data-action="go-view" data-value="plan"><div class="metric-top"><small>本月运动 / RUN</small><em class="metric-rank">' + (solo ? ('目标 ' + sPct + '%') : ('#' + mySportRank + (mySportRank === 1 ? ' 领跑' : ' 差' + sportLeadDelta + 'k'))) + '</em></div><strong>' + mt.toFixed(1) + '<em> KM</em></strong>' + PixelProgressBar.renderHtml({ progress: sPct, height: 12, width: '100%', bare: true, variant: 'orange', className: 'metric-ppb', ariaLabel: '本月运动目标进度' }) + '</button>'
    + '<button class="metric-tile" data-action="go-view" data-value="study"><div class="metric-top"><small>本月学习 / STUDY</small><em class="metric-rank is-blue">' + (solo ? ('目标 ' + stPct + '%') : ('#' + myStudyRank + (myStudyRank === 1 ? ' 领跑' : ' 差' + studyLeadDelta + 'h'))) + '</em></div><strong>' + stH.toFixed(1) + '<em> H</em></strong>' + PixelProgressBar.renderHtml({ progress: stPct, height: 12, width: '100%', bare: true, variant: 'blue', className: 'metric-ppb', ariaLabel: '本月学习目标进度' }) + '</button>'
    + '<button class="metric-tile" data-action="go-view" data-value="people"><div class="metric-top"><small>今日自律 / HABIT</small><em class="metric-rank is-gold">' + dualStreak() + '天连胜</em></div><strong>' + hb.done + '<em>/' + hb.total + ' 项</em></strong>' + PixelProgressBar.renderHtml({ progress: hb.pct, height: 12, width: '100%', bare: true, variant: 'gold', className: 'metric-ppb', ariaLabel: '今日自律完成进度' }) + '</button>'
    + '<button class="metric-tile" data-action="go-view" data-value="progress"><div class="metric-top"><small>' + (solo ? '综合积分 / SCORE' : '多人竞技 / PK榜') + '</small><em class="metric-rank is-ink">' + (solo ? '单人基准' : (board.length + '人同榜')) + '</em></div><strong>' + (solo ? (myRow.score + '<em> 分</em>') : ('第' + myRank + '<em>名 · ' + myRow.score + '分</em>')) + '</strong>' + PixelProgressBar.renderHtml({ progress: solo ? Math.max(sPct, stPct) : Math.round(myRow.score / Math.max(1, board[0]?.score || 1) * 100), height: 12, width: '100%', bare: true, variant: 'ink', className: 'metric-ppb', ariaLabel: '综合竞技进度' }) + '</button>'
    + '</section>'
    + '<div class="home-manifesto"><div class="home-manifesto-copy"><span>' + (solo ? '自律即自由，<em>日进一寸。</em>' : '运动强身，<em>结伴致远。</em>') + '</span><small>0x0610 // PIXEL.BLUEPRINT · RUN &amp; STUDY ↗</small></div><a class="manifesto-film-btn" href="film.html"><span>▶</span> 30s 品牌动效</a></div>'
    + '</div>';
}

/* ---------- Architectural Telemetry Blueprint SVG (Clickable 3-Ring Telemetry) ---------- */
function progressBlueprint(sportPct, studyPct, habitPct, mt, stH, pacePct) {
  const cx = 114, cy = 110;
  const ringsCfg = [
    { key: 'sport', label: '运动 MOVE', short: 'MOVE', r: 84, w: 18, pct: sportPct, c1: '#E5492B', c2: '#F28263', c3: '#FFE0D4', variant: 'orange', valText: mt.toFixed(1) + ' / ' + state.goal + ' km', paceText: sportPct >= pacePct ? '领先时间线 +' + (sportPct - pacePct) + '%' : '距时间线差 ' + Math.max(0, pacePct - sportPct) + '%', ctaLabel: '运动打卡 →', ctaAction: 'checkin', ctaMode: 'sport' },
    { key: 'study', label: '学习 STUDY', short: 'STUDY', r: 61, w: 18, pct: studyPct, c1: '#203F91', c2: '#4A74E8', c3: '#D4E3FF', variant: 'blue', valText: stH.toFixed(1) + ' / ' + state.studyGoal + ' h', paceText: studyPct >= pacePct ? '专注超前 +' + (studyPct - pacePct) + '%' : '距时间线差 ' + Math.max(0, pacePct - studyPct) + '%', ctaLabel: '学习专注 →', ctaAction: 'checkin', ctaMode: 'study' },
    { key: 'habit', label: '自律 HABIT', short: 'HABIT', r: 38, w: 18, pct: habitPct, c1: '#D48817', c2: '#E4A334', c3: '#FFF0C2', variant: 'gold', valText: '7日均 ' + habitPct + '%', paceText: '双轨连胜 ' + dualStreak() + ' 天', ctaLabel: '自律清单 →', ctaAction: 'go-view', ctaView: 'people' }
  ];
  const activeCfg = ringsCfg.find(x => x.key === bpFocus) || ringsCfg[0];
  const degreeTicks = Array.from({ length: 36 }, (_, i) => {
    const ang = (i / 36) * Math.PI * 2 - Math.PI / 2, r1 = 97, r2 = i % 3 === 0 ? 103 : 100;
    return '<line x1="' + (cx + r1 * Math.cos(ang)).toFixed(1) + '" y1="' + (cy + r1 * Math.sin(ang)).toFixed(1) + '" x2="' + (cx + r2 * Math.cos(ang)).toFixed(1) + '" y2="' + (cy + r2 * Math.sin(ang)).toFixed(1) + '" stroke="' + (i % 9 === 0 ? '#D97757' : '#BDB6AA') + '" stroke-width="' + (i % 9 === 0 ? '1.3' : '.75') + '"/>';
  }).join('');

  let allDefs = '';
  const svgRings = ringsCfg.map(rg => {
    const isSel = bpFocus === rg.key;
    const layers = PixelProgressBar.buildRingLayers({
      progress: rg.pct,
      cx: cx,
      cy: cy,
      radius: rg.r,
      thickness: rg.w,
      colors: { c1: rg.c1, c2: rg.c2, c3: rg.c3 }
    });
    allDefs += layers.defs;
    const circ = 2 * Math.PI * rg.r, clamped = Math.max(0, Math.min(100, rg.pct)), dash = (clamped / 100) * circ;
    return '<g class="bp-hit apple-ring-grp ' + (isSel ? 'is-focused' : 'is-dim') + '" data-action="bp-focus" data-value="' + rg.key + '" data-ring-key="' + rg.key + '" data-ring-r="' + rg.r + '" data-ring-w="' + rg.w + '" role="button" tabindex="0" aria-label="切换查看' + rg.label + ' ' + rg.pct + '%">'
      + '<circle class="apple-ring-hit" cx="' + cx + '" cy="' + cy + '" r="' + rg.r + '" fill="none" stroke="transparent" stroke-width="' + (rg.w + 8) + '"/>'
      + layers.markup
      + '<circle class="apple-ring-arc" cx="' + cx + '" cy="' + cy + '" r="' + rg.r + '" fill="none" stroke="transparent" stroke-width="' + rg.w + '" stroke-dasharray="' + dash.toFixed(1) + ' ' + circ.toFixed(1) + '" transform="rotate(-90 ' + cx + ' ' + cy + ')"/>'
      + '<line class="apple-ring-start" x1="' + cx + '" y1="' + (cy - rg.r - rg.w / 2) + '" x2="' + cx + '" y2="' + (cy - rg.r + rg.w / 2) + '" stroke="#F4D0C3" stroke-width="1.3" opacity="0.7" pointer-events="none"/>'
      + '</g>';
  }).join('');

  const deckCards = ringsCfg.map(rg => '<button type="button" class="apple-ring-tile ' + (bpFocus === rg.key ? 'is-focused' : '') + '" style="--ring-c1:' + rg.c1 + ';--ring-c2:' + rg.c2 + '" data-action="bp-focus" data-value="' + rg.key + '" data-ring-key="' + rg.key + '" data-ring-pct="' + rg.pct + '" data-ring-c1="' + rg.c1 + '" data-ring-label="' + esc(rg.label) + '" data-ring-short="' + esc(rg.short) + '" data-ring-pace="' + esc(rg.paceText) + '" data-ring-cta-action="' + rg.ctaAction + '" data-ring-cta-mode="' + (rg.ctaMode || '') + '" data-ring-cta-view="' + (rg.ctaView || '') + '" data-ring-cta-label="' + esc(rg.ctaLabel) + '"><div class="art-top"><span class="art-dot"></span><strong>' + rg.label + '</strong><em>' + rg.pct + '%</em></div>' + PixelProgressBar.renderHtml({ progress: rg.pct, height: 12, width: '100%', bare: true, variant: rg.variant, className: 'art-ppb', ariaLabel: rg.label + '进度' }) + '<div class="art-sub"><span>' + esc(rg.valText) + '</span><small>' + esc(rg.paceText) + '</small></div></button>').join('');
  const ctaAttrs = activeCfg.ctaAction === 'checkin' ? 'data-action="checkin" data-mode="' + activeCfg.ctaMode + '"' : 'data-action="go-view" data-value="' + activeCfg.ctaView + '"';

  return '<div class="blueprint-panel apple-rings-panel"><div class="apple-rings-stage"><div class="apple-rings-visual">'
    + '<svg class="blueprint-svg apple-rings-svg" viewBox="0 0 228 220" role="img" aria-label="运动学习自律三环 Claude 色系像素能量环，点击圆环切换焦点">'
    + '<defs>' + allDefs + '</defs>'
    + '<path class="cross" d="M12 6V18M6 12H18M216 6V18M210 12H222M12 202V214M6 208H18M216 202V214M210 208H222" stroke="#8C857B"/>'
    + '<line x1="16" y1="' + cy + '" x2="212" y2="' + cy + '" stroke="#E2DDD3" stroke-width=".75" stroke-dasharray="3 3"/>'
    + '<line x1="' + cx + '" y1="12" x2="' + cx + '" y2="208" stroke="#E2DDD3" stroke-width=".75" stroke-dasharray="3 3"/>'
    + degreeTicks + svgRings
    + '<text x="' + cx + '" y="' + (cy + 3) + '" text-anchor="middle" class="apple-center-val" style="fill:' + activeCfg.c1 + '">' + activeCfg.pct + '%</text>'
    + '<text x="' + cx + '" y="' + (cy + 16) + '" text-anchor="middle" class="apple-center-lbl" style="fill:#5E5951">' + activeCfg.short + '</text></svg></div>'
    + '<div class="apple-rings-deck"><div class="apple-deck-head"><span>[ PIXEL ENERGY RINGS · 点击切换 ]</span><small>时间标尺 ' + pacePct + '%</small></div>'
    + deckCards + '<div class="apple-deck-foot"><span>当前聚焦：<b data-ring-foot-label>' + activeCfg.label + '</b> · <span data-ring-foot-pace>' + esc(activeCfg.paceText) + '</span></span><button type="button" class="apple-cta-btn" data-ring-cta ' + ctaAttrs + '>' + activeCfg.ctaLabel + '</button></div>'
    + '</div></div></div>';
}

function focusAppleRing(key, panelEl) {
  bpFocus = key;
  const panel = panelEl || $('#page .apple-rings-panel');
  if (!panel) return false;
  const cy = 110;
  panel.querySelectorAll('.apple-ring-grp').forEach(g => {
    const k = g.dataset.ringKey;
    const isSel = k === key;
    const baseW = Number(g.dataset.ringW || 14);
    const baseR = Number(g.dataset.ringR || 60);
    const sw = isSel ? baseW + 2 : baseW;
    g.classList.toggle('is-focused', isSel);
    g.classList.toggle('is-dim', !isSel);
    const trk = g.querySelector('.apple-ring-track'); if (trk) trk.setAttribute('stroke-width', String(sw));
    const arc = g.querySelector('.apple-ring-arc'); if (arc) arc.setAttribute('stroke-width', String(sw));
    const px = g.querySelector('.apple-ring-px'); if (px) px.setAttribute('stroke-width', String(Math.max(4, sw - 5)));
    const out = g.querySelector('.apple-ring-outer'); if (out) out.setAttribute('r', (baseR + sw / 2).toFixed(1));
    const st = g.querySelector('.apple-ring-start');
    if (st) {
      st.setAttribute('y1', (cy - baseR - sw / 2).toFixed(1));
      st.setAttribute('y2', (cy - baseR + sw / 2).toFixed(1));
    }
  });
  let activeTile = null;
  panel.querySelectorAll('.apple-ring-tile').forEach(tile => {
    const isSel = tile.dataset.ringKey === key;
    tile.classList.toggle('is-focused', isSel);
    if (isSel) activeTile = tile;
  });
  if (activeTile) {
    const cVal = panel.querySelector('.apple-center-val');
    const cLbl = panel.querySelector('.apple-center-lbl');
    if (cVal) {
      cVal.textContent = activeTile.dataset.ringPct + '%';
      cVal.style.fill = activeTile.dataset.ringC1 || '#e5492b';
    }
    if (cLbl) cLbl.textContent = activeTile.dataset.ringShort || '';
    const fLbl = panel.querySelector('[data-ring-foot-label]');
    const fPace = panel.querySelector('[data-ring-foot-pace]');
    const fCta = panel.querySelector('[data-ring-cta]');
    if (fLbl) fLbl.textContent = activeTile.dataset.ringLabel || '';
    if (fPace) fPace.textContent = activeTile.dataset.ringPace || '';
    if (fCta) {
      const act = activeTile.dataset.ringCtaAction;
      fCta.dataset.action = act;
      if (act === 'checkin') {
        fCta.dataset.mode = activeTile.dataset.ringCtaMode || 'sport';
        delete fCta.dataset.value;
      } else {
        fCta.dataset.value = activeTile.dataset.ringCtaView || 'people';
        delete fCta.dataset.mode;
      }
      fCta.textContent = activeTile.dataset.ringCtaLabel || '';
    }
  }
  return true;
}

/* ---------- Home-Style Blueprint Chart Wrapper ---------- */
function blueprintChartCard(badgeText, rightText, svgAndBody, noteText = '', legendHtml = '') {
  return '<div class="bp-chart-card">'
    + '<div class="bp-card-ruler"><span>' + esc(badgeText) + '</span>' + (legendHtml ? '<div class="bp-legend">' + legendHtml + '</div>' : '') + '<em>' + esc(rightText) + '</em></div>'
    + '<div class="bp-card-stage">' + svgAndBody + '</div>'
    + (noteText ? '<div class="chart-note" id="chart-note">' + icon('spark') + '<span>' + noteText + '</span></div>' : '')
    + '</div>';
}

/* ---------- Interactive 28-Day Unified Heatmap + Right-Side Day Explanation Card ---------- */
function calendarHeatmap(daysCount = 28) {
  const startOffset = -(daysCount - 1);
  const startD = new Date(dateShift(startOffset) + 'T12:00:00');
  const leadBlanks = (startD.getDay() + 6) % 7;
  const cells = [];
  for (let b = 0; b < leadBlanks; b++) cells.push('<span class="cal-blank" aria-hidden="true"></span>');
  for (let i = 0; i < daysCount; i++) {
    const dk = dateShift(startOffset + i);
    const dObj = new Date(dk + 'T12:00:00');
    const dayRuns = mine().filter(r => r.date === dk);
    const dayStudy = mineStudy().filter(r => r.date === dk);
    const kmSum = total(dayRuns), hSum = totalStudy(dayStudy);
    const hb = habitRateForDate(dk);
    const isToday = dk === today();
    const isSelected = dk === selectedCalDate;
    const isPlanned = isSportPlanned(dk) || isStudyPlanned(dk);
    const both = kmSum > 0 && hSum > 0;
    const cls = ['cal-cell', both ? 'both-done' : kmSum > 0 ? 'ran' : hSum > 0 ? 'studied' : isPlanned ? 'planned-miss' : 'rest', isToday ? 'is-today' : '', isSelected ? 'is-selected' : ''].filter(Boolean).join(' ');
    cells.push('<button type="button" class="' + cls + '" data-action="select-cal" data-value="' + dk + '" title="' + dk + ' · 跑 ' + kmSum.toFixed(1) + 'km · 学 ' + hSum.toFixed(1) + 'h">'
      + '<span class="cal-day">' + pad(dObj.getDate()) + '<em class="cal-hb-dot">' + (hb.done ? hb.done + '/' + hb.total : '') + '</em></span>'
      + '<div class="cal-vals">'
      + (kmSum ? '<span class="cal-km">' + kmSum.toFixed(0) + 'k</span>' : '')
      + (hSum ? '<span class="cal-hr">' + hSum.toFixed(1) + 'h</span>' : '')
      + (!kmSum && !hSum && isToday ? '<small class="cal-tag">今</small>' : '')
      + '</div></button>');
  }

  const selDateObj = new Date(selectedCalDate + 'T12:00:00');
  const selWeekLabel = '周' + '日一二三四五六'[selDateObj.getDay()];
  const isSelToday = selectedCalDate === today();
  const selRuns = state.records.filter(r => r.date === selectedCalDate);
  const selStudy = state.studyRecords.filter(r => r.date === selectedCalDate);
  const selKm = total(selRuns), selMin = selRuns.reduce((s, r) => s + (r.minutes || 0), 0);
  const selHrs = totalStudy(selStudy), selStudyMin = selStudy.reduce((s, r) => s + (r.minutes || 0), 0);
  const selHb = habitRateForDate(selectedCalDate);
  const selDoneHbIds = state.habitLogs[selectedCalDate] || [];
  const selPlanned = isSportPlanned(selectedCalDate) || isStudyPlanned(selectedCalDate);

  let dayStatusText = '休整恢复日', dayStatusCls = 'is-rest';
  if (selKm > 0 && selHrs > 0) { dayStatusText = '双轨均完成 ★'; dayStatusCls = 'is-both'; }
  else if (selKm > 0) { dayStatusText = '已完成运动 · 待学习'; dayStatusCls = 'is-sport'; }
  else if (selHrs > 0) { dayStatusText = '已完成学习 · 待运动'; dayStatusCls = 'is-study'; }
  else if (selPlanned) { dayStatusText = isSelToday ? '今日计划待打卡' : '计划日未打卡'; dayStatusCls = 'is-miss'; }

  const runItemsHtml = selRuns.length
    ? selRuns.map(r => {
      const f = feelings[r.feel] || ['🏃', '完成'];
      return '<div class="cdc-entry is-sport">'
        + '<div class="cdc-entry-top"><span class="cdc-who"><i style="background:' + esc(memberColor(r.person)) + '"></i>' + esc(r.person) + '</span><strong>' + r.km.toFixed(2) + ' km</strong><em>' + r.minutes + 'm · 配速 ' + pace(r) + '</em><button type="button" class="cdc-jump" data-action="open-record" data-value="sport:' + r.id + '">小票 ↗</button></div>'
        + '<p class="cdc-entry-note">' + f[0] + ' ' + f[1] + (r.note ? ' · “' + esc(r.note) + '”' : '') + '</p>'
        + '</div>';
    }).join('')
    : '<div class="cdc-empty">当日暂无运动打卡记录' + (isSelToday ? ' — <button type="button" class="cdc-inline-cta" data-action="checkin" data-mode="sport">立即运动打卡 →</button>' : '') + '</div>';

  const studyItemsHtml = selStudy.length
    ? selStudy.map(r => {
      const f = studyFocusLevels[r.focus] || ['🧠', '专注'];
      return '<div class="cdc-entry is-study">'
        + '<div class="cdc-entry-top"><span class="cdc-who"><i style="background:' + esc(memberColor(r.person)) + '"></i>' + esc(r.person) + '</span><strong>' + r.hours.toFixed(1) + ' h</strong><em>' + esc(r.subject || findTargetTitle(r.targetId)) + '</em><button type="button" class="cdc-jump" data-action="open-record" data-value="study:' + r.id + '">小票 ↗</button></div>'
        + '<p class="cdc-entry-note">' + f[0] + ' ' + f[1] + (r.note ? ' · “' + esc(r.note) + '”' : '') + '</p>'
        + '</div>';
    }).join('')
    : '<div class="cdc-empty">当日暂无学习专注记录' + (isSelToday ? ' — <button type="button" class="cdc-inline-cta is-blue" data-action="checkin" data-mode="study">立即学习打卡 →</button>' : '') + '</div>';

  const habitChecklistHtml = state.habits.map(h => {
    const on = selDoneHbIds.includes(h.id);
    return '<button type="button" class="cdc-habit-pill ' + (on ? 'on' : '') + '" data-action="toggle-habit-date" data-value="' + selectedCalDate + ':' + esc(h.id) + '" aria-pressed="' + on + '">'
      + '<span>' + (on ? '✓' : '○') + '</span>'
      + '<b>' + esc(h.title) + '</b>'
      + '<small>' + esc(h.tag) + '</small>'
      + '</button>';
  }).join('');

  const rightCard = '<aside class="cal-day-card" id="cal-day-card">'
    + '<div class="cdc-head">'
    + '<div><small>[ DAY LOG · 当日执行情况卡片 ]</small><h4>' + selectedCalDate + ' · ' + selWeekLabel + (isSelToday ? ' <em>TODAY</em>' : '') + '</h4></div>'
    + '<span class="cdc-status ' + dayStatusCls + '">' + dayStatusText + '</span>'
    + '</div>'
    + '<div class="cdc-kpis">'
    + '<div class="cdc-kpi is-sport"><small>运动执行</small><strong>' + selKm.toFixed(1) + '<em> km</em></strong><span>' + (selRuns.length ? selRuns.length + '次 · ' + selMin + 'min' : '未打卡') + '</span></div>'
    + '<div class="cdc-kpi is-study"><small>学习投入</small><strong>' + selHrs.toFixed(1) + '<em> h</em></strong><span>' + (selStudy.length ? selStudy.length + '场 · ' + selStudyMin + 'min' : '未打卡') + '</span></div>'
    + '<div class="cdc-kpi is-habit"><small>自律习惯</small><strong>' + selHb.done + '<em>/' + selHb.total + '</em></strong><span>达成 ' + selHb.pct + '%</span></div>'
    + '</div>'
    + '<div class="cdc-sec"><div class="cdc-sec-title"><span>🏃 运动完成情况</span><small>' + selRuns.length + ' 条</small></div>' + runItemsHtml + '</div>'
    + '<div class="cdc-sec"><div class="cdc-sec-title"><span>📚 学习完成情况</span><small>' + selStudy.length + ' 条</small></div>' + studyItemsHtml + '</div>'
    + '<div class="cdc-sec"><div class="cdc-sec-title"><span>⚡ 自律习惯清单（点击可切换）</span><small>' + selHb.done + '/' + selHb.total + ' 项</small></div><div class="cdc-habit-grid">' + habitChecklistHtml + '</div></div>'
    + '</aside>';

  return '<div class="cal-split-layout">'
    + '<div class="cal-heat-wrap">'
    + '<div class="cal-weekdays"><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span><span>日</span></div>'
    + '<div class="cal-grid">' + cells.join('') + '</div>'
    + '<div class="cal-legend"><span><i class="leg-both"></i>我的双轨完成</span><span><i class="leg-ran"></i>仅运动</span><span><i class="leg-study"></i>仅学习</span><span><i class="leg-plan"></i>计划日</span><span><i class="leg-today"></i>今日</span></div>'
    + '</div>'
    + rightCard
    + '</div>';
}

/* ---------- Interactive Home-Style 7-Day Dual / Single Bar Chart ---------- */
function barChart(mode = 'dual') {
  const days = Array.from({ length: 7 }, (_, i) => {
    const dk = dateShift(i - 6);
    const runs = mine().filter(r => r.date === dk);
    const st = mineStudy().filter(r => r.date === dk);
    return { dk, km: total(runs), hr: totalStudy(st), runs, st, hb: habitRateForDate(dk) };
  });
  const maxKm = Math.max(10, ...days.map(v => v.km));
  const maxHr = Math.max(3, ...days.map(v => v.hr));
  const showSport = mode === 'dual' || mode === 'sport';
  const showStudy = mode === 'dual' || mode === 'study';

  const cols = days.map((v, i) => {
    const cx = 36 + i * 54;
    const isSel = v.dk === selectedBarDate;
    const dObj = new Date(v.dk + 'T12:00:00');
    const wLabel = i === 6 ? '今天' : '周' + '日一二三四五六'[dObj.getDay()];
    const hKm = v.km ? Math.max(8, (v.km / maxKm) * 86) : 3;
    const hHr = v.hr ? Math.max(8, (v.hr / maxHr) * 86) : 3;
    let bars = '';
    if (showSport && showStudy) {
      bars = '<rect x="' + (cx + 2) + '" y="' + (112 - hKm).toFixed(1) + '" width="15" rx="1.5" height="' + hKm.toFixed(1) + '" fill="' + (v.km ? '#e5492b' : '#d8d5ca') + '"/>'
        + (v.km ? '<text x="' + (cx + 9.5) + '" y="' + (107 - hKm).toFixed(1) + '" text-anchor="middle" class="bar-val-s">' + v.km.toFixed(0) + 'k</text>' : '')
        + '<rect x="' + (cx + 20) + '" y="' + (112 - hHr).toFixed(1) + '" width="15" rx="1.5" height="' + hHr.toFixed(1) + '" fill="' + (v.hr ? '#203f91' : '#d8d5ca') + '"/>'
        + (v.hr ? '<text x="' + (cx + 27.5) + '" y="' + (107 - hHr).toFixed(1) + '" text-anchor="middle" class="bar-val-l">' + v.hr.toFixed(1) + 'h</text>' : '');
    } else if (showSport) {
      bars = '<rect x="' + (cx + 4) + '" y="' + (112 - hKm).toFixed(1) + '" width="28" rx="2" height="' + hKm.toFixed(1) + '" fill="' + (i === 6 ? '#e5492b' : v.km ? '#262624' : '#d8d5ca') + '"/>'
        + (v.km ? '<text x="' + (cx + 18) + '" y="' + (106 - hKm).toFixed(1) + '" text-anchor="middle" class="bar-val">' + v.km.toFixed(1) + 'k</text>' : '');
    } else {
      bars = '<rect x="' + (cx + 4) + '" y="' + (112 - hHr).toFixed(1) + '" width="28" rx="2" height="' + hHr.toFixed(1) + '" fill="' + (i === 6 ? '#203f91' : v.hr ? '#262624' : '#d8d5ca') + '"/>'
        + (v.hr ? '<text x="' + (cx + 18) + '" y="' + (106 - hHr).toFixed(1) + '" text-anchor="middle" class="bar-val">' + v.hr.toFixed(1) + 'h</text>' : '');
    }
    return '<g class="bp-hit bar-col ' + (isSel ? 'is-selected' : '') + '" data-action="select-bar" data-value="' + v.dk + '" role="button" tabindex="0" aria-label="' + v.dk + ' 运动 ' + v.km.toFixed(1) + 'km 学习 ' + v.hr.toFixed(1) + 'h">'
      + '<rect x="' + (cx - 4) + '" y="12" width="46" height="136" fill="' + (isSel ? 'rgba(228,163,52,.16)' : 'transparent') + '" stroke="' + (isSel ? '#262624' : 'none') + '" stroke-width="1"/>'
      + bars
      + '<text x="' + (cx + 18) + '" y="129" text-anchor="middle" style="' + (isSel ? 'fill:#1a1a18;font-weight:800' : '') + '">' + wLabel + '</text>'
      + '<text x="' + (cx + 18) + '" y="142" text-anchor="middle" class="bar-date">' + v.dk.slice(5) + '</text>'
      + '</g>';
  }).join('');

  const selDay = days.find(d => d.dk === selectedBarDate) || days[6];
  const svg = '<svg class="line-chart bar-chart" viewBox="0 0 420 156" role="img" aria-label="近七天运动与学习柱状图，点击任一日期查看详情">'
    + [0, 1, 2].map(i => '<path class="grid" d="M24 ' + (26 + i * 43) + 'H410"/>').join('')
    + '<path class="cross" d="M12 8V20M6 14H18M408 8V20M402 14H414"/>'
    + cols
    + '</svg>';

  const inspector = '<div class="day-inspector">'
    + '<div class="day-inspector-head"><strong>[ ' + selDay.dk + ' 点击柱子切换日期 ]</strong><span>自律 ' + selDay.hb.done + '/' + selDay.hb.total + ' 项</span></div>'
    + '<div class="day-inspector-stats">'
    + '<span>🏃 我的运动：<b>' + selDay.km.toFixed(1) + ' km</b> (' + selDay.runs.length + ' 次)</span>'
    + '<span>📚 我的学习：<b>' + selDay.hr.toFixed(1) + ' h</b> (' + selDay.st.length + ' 场)</span>'
    + (selDay.runs[0] ? '<button class="inspect-pill is-sport" data-action="open-record" data-value="sport:' + selDay.runs[0].id + '">看运动小票 ↗</button>' : '')
    + (selDay.st[0] ? '<button class="inspect-pill is-study" data-action="open-record" data-value="study:' + selDay.st[0].id + '">看学习小票 ↗</button>' : '')
    + '</div></div>';

  const legend = (showSport ? '<span><i style="background:#e5492b"></i>运动 KM</span>' : '') + (showStudy ? '<span><i style="background:#203f91"></i>学习 HOURS</span>' : '');
  return blueprintChartCard('7-DAY TELEMETRY · CLICK BAR', '点击柱列查看当日细节', svg + inspector, '', legend);
}

/* ---------- Precision Date Scale, Explicit Multi-Person Competition Line Charts + Crosshair + Detail Card ---------- */
const dayNum = dk => {
  const [y, m, d] = dk.split('-').map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / 86400000);
};
const fmtDayNum = num => {
  const d = new Date(num * 86400000);
  return pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate());
};

function fixed28DateScale(xMin = 58, xMax = 486) {
  const minStr = dateShift(-27), maxStr = today();
  const minD = dayNum(minStr), span = 27;
  const mapX = dk => xMin + (Math.max(0, Math.min(span, dayNum(dk) - minD)) / span) * (xMax - xMin);
  const ticks = [-27, -20, -13, -6, 0].map(off => {
    const val = dayNum(dateShift(off));
    return { x: xMin + ((val - minD) / span) * (xMax - xMin), label: fmtDayNum(val) };
  });
  return { minStr, maxStr, mapX, ticks };
}

function adaptiveDateScale(dates, xMin = 58, xMax = 486) {
  const unique = [...new Set(dates)].sort();
  if (!unique.length) return { mapX: () => (xMin + xMax) / 2, ticks: [] };
  let minD = dayNum(unique[0]);
  let maxD = dayNum(unique[unique.length - 1]);
  if (maxD - minD < 2) { minD -= 1; maxD += 1; }
  const span = Math.max(1, maxD - minD);
  const mapX = dk => xMin + ((dayNum(dk) - minD) / span) * (xMax - xMin);
  const stepDays = Math.max(1, Math.ceil(span / 6));
  const dayList = [];
  for (let d = minD; d <= maxD; d += stepDays) dayList.push(d);
  if (dayList[dayList.length - 1] !== maxD) {
    if (maxD - dayList[dayList.length - 1] < stepDays * 0.45 && dayList.length > 1) dayList[dayList.length - 1] = maxD;
    else dayList.push(maxD);
  }
  const ticks = dayList.map(val => ({
    x: xMin + ((val - minD) / span) * (xMax - xMin),
    label: fmtDayNum(val)
  }));
  return { mapX, ticks };
}

function niceUpperAndTicks(rawMax, unitSuffix = '', divisions = 4) {
  const safeMax = Math.max(1, rawMax);
  const roughStep = safeMax / divisions;
  const pow10 = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const frac = roughStep / pow10;
  const niceFrac = frac <= 1 ? 1 : frac <= 2 ? 2 : frac <= 2.5 ? 2.5 : frac <= 5 ? 5 : 10;
  const stepSize = niceFrac * pow10;
  const niceMax = Math.ceil(safeMax / stepSize) * stepSize;
  const actualDiv = Math.max(2, Math.round(niceMax / stepSize));
  const ticks = Array.from({ length: actualDiv + 1 }, (_, i) => {
    const val = niceMax * (1 - i / actualDiv);
    const valStr = Number.isInteger(val) ? String(val) : val.toFixed(1);
    return {
      y: 36 + (i / actualDiv) * 188,
      val,
      text: valStr + unitSuffix
    };
  });
  return { niceMax, ticks };
}

function buildNodeDetailCardMarkup(pt) {
  if (!pt) {
    return '<aside class="node-detail-card is-empty" id="node-detail-card"><div class="ndc-head"><span>[ NODE TELEMETRY ]</span></div><p class="ndc-empty">点击左侧线性图节点或下方明细表任一行，查看当日数据与打卡小票。</p></aside>';
  }
  const r = pt.r, isStudy = pt.kind === 'study', clr = pt.color || memberColor(pt.person);
  const fTuple = isStudy ? studyFocusLevels[r.focus] : feelings[r.feel];
  const recKey = pt.recordKey;
  return '<aside class="node-detail-card" id="node-detail-card" style="--node-clr:' + esc(clr) + '">'
    + '<div class="ndc-head"><span class="ndc-type-tag" style="background:' + esc(clr) + '">' + (isStudy ? 'STUDY // 学习' : 'RUN // 运动') + '</span><span class="ndc-rank-pill">' + esc(pt.rankLabel || '节点详情') + '</span></div>'
    + '<div class="ndc-person"><span class="ndc-avatar" style="border-color:' + esc(clr) + ';color:' + esc(clr) + '">' + esc(pt.person.slice(0, 1)) + '</span><div><strong>' + esc(pt.person) + (pt.person === state.name ? ' · 我' : '') + '</strong><small>' + esc(r.date) + ' · ' + esc(r.time) + '</small></div><span class="ndc-feel">' + (fTuple ? fTuple[0] + ' ' + fTuple[1] : '') + '</span></div>'
    + '<div class="ndc-kpi"><div class="ndc-kpi-main"><strong>' + esc(pt.heroVal) + '</strong><span>' + esc(pt.heroUnit) + '</span></div><div class="ndc-kpi-sub"><small>' + esc(pt.cumLabel) + '</small><b>' + esc(pt.cumVal) + '</b></div></div>'
    + (isStudy && r.subject ? '<div class="ndc-subject">' + icon('book') + '<span>' + esc(r.subject) + '</span></div>' : '')
    + '<div class="ndc-specs">' + (isStudy ? '<div><small>时长</small><strong>' + r.minutes + 'm</strong></div><div><small>番茄</small><strong>' + Math.max(1, Math.round(r.minutes / 25)) + '个</strong></div><div><small>点赞</small><strong>' + (r.likes || 0) + '</strong></div>' : '<div><small>时长</small><strong>' + r.minutes + 'm</strong></div><div><small>配速</small><strong>' + pace(r) + '</strong></div><div><small>点赞</small><strong>' + (r.likes || 0) + '</strong></div>') + '</div>'
    + '<p class="ndc-note">“' + esc(r.note || (isStudy ? '专注一小时，胜过焦虑一整天。' : '今天，也跑完了。')) + '”</p>'
    + '<div class="ndc-actions"><button class="ndc-btn ' + (r.liked ? 'liked' : '') + '" data-action="like-unified" data-value="' + esc(recKey) + '">' + icon('heart') + ' ' + (r.liked ? '已赞 ' : '点赞 ') + (r.likes || 0) + '</button><button class="ndc-btn primary" data-action="open-record" data-value="' + esc(recKey) + '">看小票档案 →</button></div>'
    + '</aside>';
}

function buildLinearTableMarkup(allPts, activePt, showPersonCol) {
  if (!allPts.length) return '';
  const ordered = [...allPts].sort((a, b) => (b.r.date + b.r.time).localeCompare(a.r.date + a.r.time)).slice(0, 16);
  return '<div class="linear-table-wrap"><div class="linear-table-head"><span>[ LINEAR LOG · 线性明细表 ]</span><small>点击任一行同步曲线坐标与小票</small></div><div class="linear-table-scroll"><table class="linear-table"><thead><tr><th>日期</th>' + (showPersonCol ? '<th>成员</th>' : '<th>轨道</th>') + '<th>当次</th><th>累计/指标</th></tr></thead><tbody>'
    + ordered.map(p => {
      const isSel = activePt && p.nodeKey === activePt.nodeKey;
      const trackBadge = p.kind === 'study' ? '<em class="lt-dot is-study">学</em>' : '<em class="lt-dot is-sport">跑</em>';
      return '<tr class="linear-row ' + (isSel ? 'is-selected' : '') + '" data-chart-row="' + esc(p.nodeKey) + '" tabindex="0" role="button">'
        + '<td>' + esc(p.r.date.slice(5)) + '</td>'
        + '<td>' + (showPersonCol ? ('<span class="lt-person"><i style="background:' + esc(p.color) + '"></i>' + esc(p.person) + '</span>') : trackBadge) + '</td>'
        + '<td><b>' + esc(p.heroVal) + '</b><small>' + esc(p.heroUnit === 'HOURS' ? 'h' : p.heroUnit === 'KM' ? 'km' : '') + '</small></td>'
        + '<td class="lt-val">' + esc(p.yExact) + '</td></tr>';
    }).join('')
    + '</tbody></table></div></div>';
}

function buildChartCrosshairSvg(pt, xMin = 58, xMax = 486) {
  if (!pt) return '';
  const x = pt.px, y = pt.py, dateLbl = pt.r.date.slice(5), valLbl = pt.yExact || pt.heroVal;
  const calloutText = (allMembers().length > 1 ? (pt.person + ' · ') : '') + (pt.pointTag || pt.heroVal);
  const pillW = Math.min(182, Math.max(76, calloutText.length * 8.2 + 16));
  const bx = Math.max(xMin + 4, Math.min(xMax - 2 - pillW, x - pillW / 2));
  const by = y > 68 ? y - 30 : y + 12;
  const dxBox = Math.max(xMin, Math.min(xMax - 42, x - 21));
  return '<line x1="' + x.toFixed(1) + '" y1="36" x2="' + x.toFixed(1) + '" y2="224" stroke="#1a1a18" stroke-width="1" stroke-dasharray="3 3" opacity=".48"/>'
    + '<line x1="' + xMin + '" y1="' + y.toFixed(1) + '" x2="' + x.toFixed(1) + '" y2="' + y.toFixed(1) + '" stroke="' + esc(pt.color) + '" stroke-width="1" stroke-dasharray="3 3" opacity=".68"/>'
    + '<rect x="' + dxBox.toFixed(1) + '" y="224" width="42" height="14" fill="#1a1a18"/>'
    + '<text x="' + (dxBox + 21).toFixed(1) + '" y="234" text-anchor="middle" style="font:700 8.5px var(--mono);fill:#e4a334">' + esc(dateLbl) + '</text>'
    + '<rect x="2" y="' + (y - 8).toFixed(1) + '" width="48" height="16" fill="' + esc(pt.color) + '"/>'
    + '<text x="26" y="' + (y + 3).toFixed(1) + '" text-anchor="middle" style="font:700 8.5px var(--mono);fill:#f2f1e8">' + esc(valLbl) + '</text>'
    + '<rect x="' + bx.toFixed(1) + '" y="' + by.toFixed(1) + '" width="' + pillW.toFixed(1) + '" height="19" fill="#1a1a18" stroke="' + esc(pt.color) + '" stroke-width="1.2"/>'
    + '<text x="' + (bx + pillW / 2).toFixed(1) + '" y="' + (by + 12.5).toFixed(1) + '" text-anchor="middle" style="font:700 9px var(--mono);fill:#f2f1e8">' + esc(calloutText) + '</text>';
}

let currentChartNodesMap = {};
function lineChart(type) {
  const members = allMembers();
  const solo = members.length === 1;
  const visibleMembers = chartPersonFilter !== 'all' && members.includes(chartPersonFilter) ? [chartPersonFilter] : members;

  let mode = type;
  let dualTabsHtml = '';
  if (type === 'dual') {
    mode = dualChartMode;
    const dualItems = [
      ['personal-dual', '双轨达成率'],
      ['sport-comp', solo ? '运动跑量线' : '运动多人PK'],
      ['study-comp', solo ? '学习时长线' : '学习多人PK'],
      ['score-comp', solo ? '综合积分线' : '综合积分PK']
    ];
    dualTabsHtml = '<div class="comp-mode-pills">'
      + dualItems.map(([k, lbl]) =>
        '<button type="button" class="comp-mode-btn ' + (dualChartMode === k ? 'active' : '') + '" data-action="dual-chart-mode" data-value="' + k + '">' + lbl + '</button>'
      ).join('') + '</div>';
  }

  const supportsScaleToggle = ['plan', 'sport-comp', 'study', 'study-comp'].includes(mode);
  const scaleSwitchHtml = supportsScaleToggle
    ? '<div class="comp-scale-pills"><button type="button" class="' + (chartScaleMode === 'cum' ? 'active' : '') + '" data-action="chart-scale" data-value="cum">累计曲线</button><button type="button" class="' + (chartScaleMode === 'single' ? 'active' : '') + '" data-action="chart-scale" data-value="single">单次分布</button></div>'
    : '';
  const soloAddBtnHtml = solo ? '<button type="button" class="comp-chip add-btn" data-action="add-person">＋ 加人物对比</button>' : '';

  const topControlsBar = (dualTabsHtml || scaleSwitchHtml || soloAddBtnHtml)
    ? '<div class="comp-controls-top">' + dualTabsHtml + '<div class="comp-controls-right">' + scaleSwitchHtml + soloAddBtnHtml + '</div></div>'
    : '';

  const summaryKind = (mode === 'study' || mode === 'study-comp' || mode === 'study-focus') ? 'study'
    : mode === 'score-comp' ? 'score' : 'sport';
  const boardSport = teamLeaderboard('本月', '按公里');
  const boardStudy = teamLeaderboard('本月', '按学习');
  const boardScore = teamLeaderboard('本月', '综合积分');
  const chipSummaryOf = m => {
    if (summaryKind === 'study') {
      const r = boardStudy.find(x => x.name === m);
      return r ? r.hrs.toFixed(1) + 'h' : '0h';
    }
    if (summaryKind === 'score') {
      const r = boardScore.find(x => x.name === m);
      return r ? r.score + '分' : '0分';
    }
    const r = boardSport.find(x => x.name === m);
    return r ? r.km.toFixed(1) + 'k' : '0k';
  };

  const memberFilterChips = !solo
    ? '<div class="comp-filter-row">'
      + '<button type="button" class="comp-chip ' + (chartPersonFilter === 'all' ? 'active' : '') + '" data-action="chart-person" data-value="all">全部 ' + members.length + ' 人PK</button>'
      + members.map(m => '<button type="button" class="comp-chip ' + (chartPersonFilter === m ? 'active' : '') + '" style="--mclr:' + memberColor(m) + '" data-action="chart-person" data-value="' + esc(m) + '"><i></i><span>' + esc(m) + '</span><b>' + chipSummaryOf(m) + '</b></button>').join('')
      + '<button type="button" class="comp-chip add-btn" data-action="add-person">＋ 加人物</button>'
      + '</div>'
    : '';

  let seriesList = [];
  let yLabels = [];
  let yUnitTitle = '';
  let targetRuleHtml = '';
  let chartTitle = '';
  const chartHint = '点击像素节点或线性明细表行同步查看';

  if (mode === 'personal-dual') {
    const { minStr, maxStr, mapX, ticks } = fixed28DateScale(58, 486);
    const allSMonth = [...mine(monthly())].sort((a, b) => (a.date + a.time).localeCompare(b.date + a.time));
    const allLMonth = [...monthly(mineStudy())].sort((a, b) => (a.date + a.time).localeCompare(b.date + a.time));
    const sRecs = allSMonth.filter(r => r.date >= minStr && r.date <= maxStr);
    const lRecs = allLMonth.filter(r => r.date >= minStr && r.date <= maxStr);
    if (!allSMonth.length && !allLMonth.length) return '<div class="empty">暂无本月曲线数据，完成第一次运动或学习打卡后自动生成。</div>';
    const maxPct = 100;
    let sSum = total(allSMonth.filter(r => r.date < minStr));
    const sPts = sRecs.map((r, i) => {
      sSum += r.km;
      const pct = Math.min(100, sSum / Math.max(1, state.goal) * 100);
      return {
        x: mapX(r.date), y: 224 - (pct / maxPct) * 188, r, person: r.person, kind: 'sport', color: '#e5492b',
        nodeKey: 'ps-' + r.id + '-' + i, recordKey: 'sport:' + r.id,
        heroVal: r.km.toFixed(1), heroUnit: 'KM', cumLabel: '本月累计跑量', cumVal: sSum.toFixed(1) + ' km (' + Math.round(pct) + '%)',
        yExact: Math.round(pct) + '%', pointTag: Math.round(pct) + '% · ' + sSum.toFixed(1) + 'k',
        rankLabel: state.name + ' · 运动轨道'
      };
    });
    let lSum = totalStudy(allLMonth.filter(r => r.date < minStr));
    const lPts = lRecs.map((r, i) => {
      lSum += r.hours;
      const pct = Math.min(100, lSum / Math.max(1, state.studyGoal) * 100);
      return {
        x: mapX(r.date), y: 224 - (pct / maxPct) * 188, r, person: r.person, kind: 'study', color: '#203f91',
        nodeKey: 'pl-' + r.id + '-' + i, recordKey: 'study:' + r.id,
        heroVal: r.hours.toFixed(1), heroUnit: 'HOURS', cumLabel: '本月累计学习', cumVal: lSum.toFixed(1) + ' h (' + Math.round(pct) + '%)',
        yExact: Math.round(pct) + '%', pointTag: Math.round(pct) + '% · ' + lSum.toFixed(1) + 'h',
        rankLabel: state.name + ' · 学习轨道'
      };
    });
    const lastSPct = sPts.length ? sPts.at(-1).yExact : '0%';
    const lastLPct = lPts.length ? lPts.at(-1).yExact : '0%';
    seriesList = [
      { name: '运动完成', endTag: '运动 ' + lastSPct, color: '#e5492b', points: sPts, areaGrad: true },
      { name: '学习完成', endTag: '学习 ' + lastLPct, color: '#203f91', points: lPts, areaGrad: true }
    ];
    yLabels = [100, 75, 50, 25, 0].map((v, i) => ({ y: 36 + i * 47, text: v + '%' }));
    yUnitTitle = 'Y: 月目标达成率 (%)';
    targetRuleHtml = '<path d="M58 224L486 36" fill="none" stroke="#262624" stroke-width="1.1" stroke-dasharray="5 4" opacity=".42"/><text x="414" y="54" class="chart-target-txt">100% 28天标尺</text>';
    chartTitle = 'PERSONAL DUAL · 个人双轨达成线性表';
    const kpiSummary = [
      { label: '记录笔数', val: (sPts.length + lPts.length) + ' 笔' },
      { label: '运动达成', val: lastSPct + ' (' + sSum.toFixed(1) + 'k)' },
      { label: '学习达成', val: lastLPct + ' (' + lSum.toFixed(1) + 'h)' }
    ];
    return finishChartRender(seriesList, yLabels, yUnitTitle, ticks, targetRuleHtml, chartTitle, chartHint, topControlsBar, true, kpiSummary);
  }

  if (mode === 'plan' || mode === 'sport-comp') {
    const { minStr, maxStr, mapX, ticks } = fixed28DateScale(58, 486);
    const allMonthly = monthly(state.records).filter(r => visibleMembers.includes(r.person));
    const inWindow = allMonthly.filter(r => r.date >= minStr && r.date <= maxStr);
    if (!allMonthly.length) return '<div class="empty">暂无本月运动曲线数据，完成第一次跑步打卡后自动生成。</div>';
    const isSingle = chartScaleMode === 'single';
    const rawMax = isSingle
      ? Math.max(10, ...allMonthly.map(r => r.km))
      : Math.max(15, ...visibleMembers.map(m => total(allMonthly.filter(r => r.person === m))));
    const { niceMax, ticks: yTicks } = niceUpperAndTicks(rawMax * 1.08, 'k', 4);
    const board = teamLeaderboard('本月', '按公里');

    seriesList = visibleMembers.map(m => {
      const mPrior = allMonthly.filter(r => r.person === m && r.date < minStr);
      const mRecs = inWindow.filter(r => r.person === m).sort((a, b) => (a.date + a.time).localeCompare(b.date + a.time));
      const clr = memberColor(m);
      const rIdx = board.findIndex(x => x.name === m) + 1;
      let sum = isSingle ? 0 : total(mPrior);
      const pts = mRecs.map((r, i) => {
        sum += r.km;
        const plotVal = isSingle ? r.km : sum;
        return {
          x: mapX(r.date), y: 224 - (plotVal / niceMax) * 188, r, person: m, kind: 'sport', color: clr,
          nodeKey: 'sp-' + m + '-' + r.id + '-' + i, recordKey: 'sport:' + r.id,
          heroVal: r.km.toFixed(1), heroUnit: 'KM', cumLabel: solo ? '累计跑量' : ('累计跑量 (月榜 #' + rIdx + ')'), cumVal: sum.toFixed(1) + ' km',
          yExact: plotVal.toFixed(1) + 'k',
          pointTag: isSingle ? '单次 ' + r.km.toFixed(1) + 'k' : '累计 ' + sum.toFixed(1) + 'k (+' + r.km.toFixed(1) + ')',
          rankLabel: solo ? (m + ' · 运动轨道') : ('运动月榜 #' + rIdx + '/' + board.length)
        };
      });
      const lastVal = isSingle ? (mRecs.at(-1)?.km || 0).toFixed(1) : sum.toFixed(1);
      return { name: m, endTag: (solo ? '' : '#' + rIdx + ' ') + m + ' ' + lastVal + 'k', color: clr, points: pts, areaGrad: visibleMembers.length === 1 };
    });
    yLabels = yTicks;
    yUnitTitle = isSingle ? 'Y: 单次跑量 (km)' : 'Y: 累计跑量 (km)';
    if (!isSingle && visibleMembers.length === 1 && state.goal <= niceMax) {
      const gy = (224 - (state.goal / niceMax) * 188).toFixed(1);
      targetRuleHtml = '<line x1="58" y1="' + gy + '" x2="486" y2="' + gy + '" stroke="#262624" stroke-width="1.1" stroke-dasharray="5 4" opacity=".5"/><text x="482" y="' + (Number(gy) - 5) + '" text-anchor="end" class="chart-target-txt">月目标 ' + state.goal + ' km</text>';
    }
    chartTitle = isSingle ? (solo ? 'SPORT SINGLE · 单次运动明细线' : 'SPORT SINGLE · 多人单次距离对比') : (solo ? 'SPORT CURVE · 运动累计线性表' : 'SPORT PK CURVE · 多人月度里程竞速');
    const maxRun = Math.max(0, ...allMonthly.map(r => r.km));
    const kpiSummary = [
      { label: '本月次数', val: allMonthly.length + ' 次' },
      { label: '最高单次', val: maxRun.toFixed(1) + ' km' },
      { label: '目标对比', val: Math.round(total(mine(monthly())) / Math.max(1, state.goal) * 100) + '%' }
    ];
    return finishChartRender(seriesList, yLabels, yUnitTitle, ticks, targetRuleHtml, chartTitle, chartHint, topControlsBar + memberFilterChips, visibleMembers.length === 1, kpiSummary);
  }

  if (mode === 'study' || mode === 'study-comp') {
    const { minStr, maxStr, mapX, ticks } = fixed28DateScale(58, 486);
    const allMonthly = monthly(state.studyRecords).filter(r => visibleMembers.includes(r.person));
    const inWindow = allMonthly.filter(r => r.date >= minStr && r.date <= maxStr);
    if (!allMonthly.length) return '<div class="empty">暂无本月学习曲线数据，完成第一次学习打卡后自动生成。</div>';
    const isSingle = chartScaleMode === 'single';
    const rawMax = isSingle
      ? Math.max(2, ...allMonthly.map(r => r.hours))
      : Math.max(4, ...visibleMembers.map(m => totalStudy(allMonthly.filter(r => r.person === m))));
    const { niceMax, ticks: yTicks } = niceUpperAndTicks(rawMax * 1.12, 'h', 4);
    const board = teamLeaderboard('本月', '按学习');

    seriesList = visibleMembers.map(m => {
      const mPrior = allMonthly.filter(r => r.person === m && r.date < minStr);
      const mRecs = inWindow.filter(r => r.person === m).sort((a, b) => (a.date + a.time).localeCompare(b.date + a.time));
      const clr = memberColor(m);
      const rIdx = board.findIndex(x => x.name === m) + 1;
      let sum = isSingle ? 0 : totalStudy(mPrior);
      const pts = mRecs.map((r, i) => {
        sum += r.hours;
        const plotVal = isSingle ? r.hours : sum;
        return {
          x: mapX(r.date), y: 224 - (plotVal / niceMax) * 188, r, person: m, kind: 'study', color: clr,
          nodeKey: 'st-' + m + '-' + r.id + '-' + i, recordKey: 'study:' + r.id,
          heroVal: r.hours.toFixed(1), heroUnit: 'HOURS', cumLabel: solo ? '累计学习' : ('累计学习 (月榜 #' + rIdx + ')'), cumVal: sum.toFixed(1) + ' h',
          yExact: plotVal.toFixed(1) + 'h',
          pointTag: isSingle ? '单场 ' + r.hours.toFixed(1) + 'h' : '累计 ' + sum.toFixed(1) + 'h (+' + r.hours.toFixed(1) + ')',
          rankLabel: solo ? (m + ' · 学习轨道') : ('学习月榜 #' + rIdx + '/' + board.length)
        };
      });
      const lastVal = isSingle ? (mRecs.at(-1)?.hours || 0).toFixed(1) : sum.toFixed(1);
      return { name: m, endTag: (solo ? '' : '#' + rIdx + ' ') + m + ' ' + lastVal + 'h', color: clr, points: pts, areaGrad: visibleMembers.length === 1 };
    });
    yLabels = yTicks;
    yUnitTitle = isSingle ? 'Y: 单场专注 (h)' : 'Y: 累计学习 (h)';
    chartTitle = isSingle ? (solo ? 'STUDY SINGLE · 单场专注明细线' : 'STUDY SINGLE · 多人单场时长对比') : (solo ? 'STUDY CURVE · 学习累计线性表' : 'STUDY PK CURVE · 多人月度学习竞速');
    const maxHrs = Math.max(0, ...allMonthly.map(r => r.hours));
    const kpiSummary = [
      { label: '专注场次', val: allMonthly.length + ' 场' },
      { label: '最长单场', val: maxHrs.toFixed(1) + ' h' },
      { label: '目标达成', val: Math.round(totalStudy(monthly(mineStudy())) / Math.max(1, state.studyGoal) * 100) + '%' }
    ];
    return finishChartRender(seriesList, yLabels, yUnitTitle, ticks, targetRuleHtml, chartTitle, chartHint, topControlsBar + memberFilterChips, visibleMembers.length === 1, kpiSummary);
  }

  if (mode === 'score-comp') {
    const { minStr, maxStr, mapX, ticks } = fixed28DateScale(58, 486);
    const unified = allUnifiedRecords('all', false).filter(r => r.date >= minStr && r.date <= maxStr && r.date.slice(0, 7) === today().slice(0, 7) && visibleMembers.includes(r.person));
    if (!unified.length) return '<div class="empty">暂无近28天综合积分曲线数据。</div>';
    const board = teamLeaderboard('本月', '综合积分');
    let maxScore = 100;
    const rawSeries = visibleMembers.map(m => {
      const mRecs = unified.filter(r => r.person === m).sort((a, b) => (a.date + a.time + a.id).localeCompare(b.date + b.time + b.id));
      let cumScore = 0;
      const seenDays = new Set();
      const mapped = mRecs.map((r, i) => {
        const isSt = r._kind === 'study';
        const dayBonus = seenDays.has(r.date) ? 0 : (seenDays.add(r.date), 15);
        const ptsDelta = Math.round((isSt ? r.hours * 25 : r.km * 10) + dayBonus + (r.likes || 0) * 5);
        cumScore += ptsDelta;
        maxScore = Math.max(maxScore, cumScore);
        return { r, isSt, cumScore, ptsDelta, i };
      });
      return { m, mapped, finalScore: cumScore };
    });

    const { niceMax, ticks: yTicks } = niceUpperAndTicks(maxScore * 1.08, '', 4);
    seriesList = rawSeries.map(({ m, mapped, finalScore }) => {
      const clr = memberColor(m);
      const rIdx = board.findIndex(x => x.name === m) + 1;
      const pts = mapped.map(({ r, isSt, cumScore, ptsDelta, i }) => ({
        x: mapX(r.date), y: 224 - (cumScore / niceMax) * 188, r, person: m, kind: r._kind, color: clr,
        nodeKey: 'sc-' + m + '-' + r._key + '-' + i, recordKey: r._key,
        heroVal: '+' + ptsDelta, heroUnit: 'PTS · ' + (isSt ? r.hours.toFixed(1) + 'h' : r.km.toFixed(1) + 'k'),
        cumLabel: '累计竞速积分', cumVal: cumScore + ' 分' + (solo ? '' : ' (#' + rIdx + ')'),
        yExact: cumScore + '分', pointTag: cumScore + '分 (+' + ptsDelta + ')',
        rankLabel: solo ? (m + ' · 综合积分') : ('综合总榜 #' + rIdx + '/' + board.length)
      }));
      return { name: m, endTag: (solo ? '' : '#' + rIdx + ' ') + m + ' ' + finalScore + '分', color: clr, points: pts, areaGrad: visibleMembers.length === 1 };
    });
    yLabels = yTicks;
    yUnitTitle = 'Y: 综合积分 (分)';
    targetRuleHtml = '<text x="486" y="18" text-anchor="end" class="chart-target-txt">积分 = 跑1km×10 + 学1h×25 + 出勤×15</text>';
    chartTitle = solo ? 'TOTAL SCORE · 个人综合积分线性表' : 'TOTAL PK SCORE · 多人综合积分竞速';
    const kpiSummary = [
      { label: '有效打卡', val: unified.length + ' 笔' },
      { label: '当前积分', val: (rawSeries[0]?.finalScore || 0) + ' 分' },
      { label: '双轨连胜', val: dualStreak() + ' 天' }
    ];
    return finishChartRender(seriesList, yLabels, yUnitTitle, ticks, targetRuleHtml, chartTitle, chartHint, topControlsBar + memberFilterChips, visibleMembers.length === 1, kpiSummary);
  }

  if (mode === 'study-focus') {
    const { minStr, maxStr, mapX, ticks } = fixed28DateScale(58, 486);
    const recs = state.studyRecords.filter(r => r.date >= minStr && r.date <= maxStr && visibleMembers.includes(r.person)).sort((a, b) => (a.date + a.time).localeCompare(b.date + a.time));
    if (!recs.length) return '<div class="empty">暂无近28天学习时长趋势数据。</div>';
    const { niceMax, ticks: yTicks } = niceUpperAndTicks(Math.max(3, ...recs.map(r => r.hours)) * 1.12, 'h', 4);
    seriesList = visibleMembers.map(m => {
      const mRecs = recs.filter(r => r.person === m);
      const clr = memberColor(m);
      const pts = mRecs.map((r, i) => ({
        x: mapX(r.date), y: 224 - (r.hours / niceMax) * 188, r, person: m, kind: 'study', color: clr,
        nodeKey: 'sf-' + m + '-' + r.id + '-' + i, recordKey: 'study:' + r.id,
        heroVal: r.hours.toFixed(1), heroUnit: 'HOURS', cumLabel: '本次专注评级', cumVal: (studyFocusLevels[r.focus]?.[0] || '🧠') + ' ' + (studyFocusLevels[r.focus]?.[1] || '专注'),
        yExact: r.hours.toFixed(1) + 'h', pointTag: r.hours.toFixed(1) + 'h · ' + (studyFocusLevels[r.focus]?.[1] || '专注'),
        rankLabel: m + ' · 单场专注'
      }));
      const lastH = mRecs.length ? mRecs.at(-1).hours.toFixed(1) : '0.0';
      return { name: m, endTag: m + ' ' + lastH + 'h', color: clr, points: pts, areaGrad: visibleMembers.length === 1 };
    });
    yLabels = yTicks;
    yUnitTitle = 'Y: 单场专注 (h)';
    chartTitle = solo ? 'FOCUS TREND · 专注时长线性表' : 'FOCUS TREND · 多人专注时长对比';
    const avgH = recs.length ? (totalStudy(recs) / recs.length).toFixed(1) : '0.0';
    return finishChartRender(seriesList, yLabels, yUnitTitle, ticks, targetRuleHtml, chartTitle, chartHint, memberFilterChips, visibleMembers.length === 1, [
      { label: '记录场次', val: recs.length + ' 场' },
      { label: '场均专注', val: avgH + ' h' },
      { label: '累计专注', val: totalStudy(recs).toFixed(1) + ' h' }
    ]);
  }

  const { minStr, maxStr, mapX, ticks } = fixed28DateScale(58, 486);
  const recs = state.records.filter(r => r.date >= minStr && r.date <= maxStr && visibleMembers.includes(r.person)).sort((a, b) => (a.date + a.time).localeCompare(b.date + a.time));
  if (!recs.length) return '<div class="empty">暂无近28天配速趋势数据。</div>';
  const paces = recs.map(paceSeconds);
  const minSec = Math.max(180, Math.floor(Math.min(...paces) / 30) * 30 - 30);
  const maxSec = Math.max(minSec + 120, Math.ceil(Math.max(...paces) / 30) * 30 + 30);
  seriesList = visibleMembers.map(m => {
    const mRecs = recs.filter(r => r.person === m);
    const clr = memberColor(m);
    const pts = mRecs.map((r, i) => ({
      x: mapX(r.date), y: 36 + ((paceSeconds(r) - minSec) / (maxSec - minSec)) * 188, r, person: m, kind: 'sport', color: clr,
      nodeKey: 'pc-' + m + '-' + r.id + '-' + i, recordKey: 'sport:' + r.id,
      heroVal: pace(r), heroUnit: '/KM', cumLabel: '本次里程与用时', cumVal: r.km.toFixed(1) + ' km · ' + r.minutes + ' 分钟',
      yExact: pace(r), pointTag: pace(r) + ' (' + r.km.toFixed(1) + 'k)',
      rankLabel: m + ' · 配速节奏'
    }));
    const lastPace = mRecs.length ? pace(mRecs.at(-1)) : '—';
    return { name: m, endTag: m + ' ' + lastPace, color: clr, points: pts, areaGrad: visibleMembers.length === 1 };
  });
  yLabels = [0, 1, 2, 3, 4].map(i => ({ y: 36 + i * 47, text: formatPaceSec(minSec + (maxSec - minSec) * (i / 4)) }));
  yUnitTitle = 'Y: 配速 (上方更快)';
  chartTitle = solo ? 'PACE TREND · 个人配速线性表' : 'PACE TREND · 多人配速精准对比';
  return finishChartRender(seriesList, yLabels, yUnitTitle, ticks, targetRuleHtml, chartTitle, chartHint, memberFilterChips, visibleMembers.length === 1, [
    { label: '记录次', val: recs.length + ' 次' },
    { label: '最快配速', val: formatPaceSec(Math.min(...paces)) },
    { label: '均配速', val: avgPace(recs) }
  ]);
}

function finishChartRender(seriesList, yLabels, yUnitTitle, ticks, targetRuleHtml, chartTitle, chartHint, controlsHtml = '', showAllPointValues = false, kpiItems = []) {
  const allPts = seriesList.flatMap(s => s.points);
  currentChartNodesMap = {};

  const placed = [];
  allPts.forEach(p => {
    let px = p.x, py = p.y;
    let shift = 0;
    while (placed.some(q => Math.abs(q.px - px) < 6 && Math.abs(q.py - py) < 7) && shift < 4) {
      shift++;
      px = p.x + (shift % 2 === 1 ? 1 : -1) * Math.ceil(shift / 2) * 4.5;
    }
    p.px = Math.max(58, Math.min(486, px));
    p.py = py;
    placed.push(p);
    currentChartNodesMap[p.nodeKey] = p;
  });

  let activePt = allPts.find(p => p.nodeKey === selectedNodeKey);
  if (!activePt) {
    const minePts = allPts.filter(p => p.person === state.name);
    activePt = minePts.at(-1) || allPts.at(-1) || null;
    if (activePt) selectedNodeKey = activePt.nodeKey;
  }

  const endLabels = seriesList
    .filter(s => s.points.length)
    .map(s => ({ s, last: s.points.at(-1), ly: s.points.at(-1).py }))
    .sort((a, b) => a.ly - b.ly);
  for (let i = 1; i < endLabels.length; i++) {
    if (endLabels[i].ly - endLabels[i - 1].ly < 22) {
      endLabels[i].ly = endLabels[i - 1].ly + 22;
    }
  }
  if (endLabels.length && endLabels.at(-1).ly > 218) {
    endLabels[endLabels.length - 1].ly = 218;
    for (let i = endLabels.length - 2; i >= 0; i--) {
      if (endLabels[i + 1].ly - endLabels[i].ly < 22) {
        endLabels[i].ly = Math.max(42, endLabels[i + 1].ly - 22);
      }
    }
  }
  const endLabelMap = new Map(endLabels.map(e => [e.s, e.ly]));

  const placedTags = [];
  const linesSvg = seriesList.map((s, si) => {
    if (!s.points.length) return '';
    const d = s.points.map((p, i) => (i ? 'L' : 'M') + p.px.toFixed(1) + ',' + p.py.toFixed(1)).join(' ');
    const area = s.areaGrad && s.points.length > 1
      ? d + ' L' + s.points.at(-1).px.toFixed(1) + ',224 L' + s.points[0].px.toFixed(1) + ',224 Z'
      : '';
    const patId = 'px-dither-' + si;
    const areaDef = area
      ? '<defs>'
        + '<linearGradient id="cg-' + si + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="' + s.color + '" stop-opacity=".18"/><stop offset="100%" stop-color="' + s.color + '" stop-opacity=".02"/></linearGradient>'
        + '<pattern id="' + patId + '" width="8" height="8" patternUnits="userSpaceOnUse">'
        + '<rect x="0" y="0" width="2" height="2" fill="' + s.color + '" opacity=".24"/>'
        + '<rect x="4" y="2" width="2" height="2" fill="' + s.color + '" opacity=".18"/>'
        + '<rect x="2" y="4" width="2" height="2" fill="' + s.color + '" opacity=".14"/>'
        + '<rect x="6" y="6" width="2" height="2" fill="' + s.color + '" opacity=".2"/>'
        + '</pattern></defs>'
        + '<path d="' + area + '" fill="url(#cg-' + si + ')"/><path d="' + area + '" fill="url(#' + patId + ')"/>'
      : '';
    const pathEl = s.points.length > 1 ? '<path class="comp-line" d="' + d + '" fill="none" stroke="' + s.color + '" stroke-width="2.4" stroke-linejoin="miter"/>' : '';
    const dotsEl = s.points.map(p => {
      const isSel = activePt && p.nodeKey === activePt.nodeKey;
      const sz = isSel ? 9.5 : 7;
      const half = sz / 2;
      let valTag = '';
      if (showAllPointValues && !isSel) {
        const tryOffsets = p.py < 54 ? [16, -9, 25] : [-9, 16, -19];
        let chosenY = null;
        for (const dy of tryOffsets) {
          const ty = p.py + dy;
          if (ty < 40 || ty > 219) continue;
          const conflict = placedTags.some(t => Math.abs(t.x - p.px) < 30 && Math.abs(t.y - ty) < 12);
          if (!conflict) { chosenY = ty; break; }
        }
        if (chosenY !== null) {
          placedTags.push({ x: p.px, y: chosenY });
          valTag = '<text x="' + p.px.toFixed(1) + '" y="' + chosenY.toFixed(1) + '" text-anchor="middle" style="font:700 8px var(--mono);fill:' + s.color + '">' + esc(p.yExact) + '</text>';
        }
      }
      return '<g class="bp-hit chart-node-hit ' + (isSel ? 'is-selected' : '') + '" data-chart-node="' + esc(p.nodeKey) + '" tabindex="0" role="button" aria-label="' + esc(p.person) + ' ' + p.r.date + ' ' + esc(p.yExact) + '">'
        + '<rect x="' + (p.px - 11).toFixed(1) + '" y="' + (p.py - 11).toFixed(1) + '" width="22" height="22" fill="transparent"/>'
        + (isSel ? '<rect class="node-halo" x="' + (p.px - 8).toFixed(1) + '" y="' + (p.py - 8).toFixed(1) + '" width="16" height="16" fill="none" stroke="' + s.color + '" stroke-width="1.8" opacity=".72" shape-rendering="crispEdges"/>' : '')
        + '<rect class="node-sq" x="' + (p.px - half).toFixed(1) + '" y="' + (p.py - half).toFixed(1) + '" width="' + sz + '" height="' + sz + '" fill="' + s.color + '" stroke="#f2f1e8" stroke-width="1.8" shape-rendering="crispEdges"/>'
        + valTag
        + '</g>';
    }).join('');

    const last = s.points.at(-1);
    const ly = endLabelMap.get(s) ?? last.py;
    const tagTxt = s.endTag || s.name;
    const endBadge = '<g class="chart-end-tag" data-action="chart-person" data-value="' + esc(s.name === chartPersonFilter ? 'all' : s.name) + '" style="cursor:pointer">'
      + '<polyline points="' + last.px.toFixed(1) + ',' + last.py.toFixed(1) + ' 494,' + ly.toFixed(1) + ' 502,' + ly.toFixed(1) + '" fill="none" stroke="' + s.color + '" stroke-width="1.2" stroke-dasharray="2.5 2"/>'
      + '<rect x="502" y="' + (ly - 9.5).toFixed(1) + '" width="112" height="19" fill="' + s.color + '"/>'
      + '<text x="508" y="' + (ly + 3.5).toFixed(1) + '" style="font:700 9.5px var(--body);fill:#f2f1e8">' + esc(tagTxt) + '</text>'
      + '</g>';

    return areaDef + pathEl + endBadge + dotsEl;
  }).join('');

  const svg = '<svg class="line-chart comp-line-svg" viewBox="0 0 620 264" role="img" aria-label="' + esc(chartTitle) + '">'
    + '<text x="6" y="18" style="font:700 9.5px var(--mono);fill:#262624">' + esc(yUnitTitle) + '</text>'
    + yLabels.map(yl => '<path class="grid" d="M58 ' + yl.y.toFixed(1) + 'H486"/><text x="52" y="' + (yl.y + 3).toFixed(1) + '" text-anchor="end">' + esc(yl.text) + '</text>').join('')
    + ticks.map(tk => '<path class="grid vgrid" d="M' + tk.x.toFixed(1) + ' 36V224"/><text class="x-tick-lbl" x="' + tk.x.toFixed(1) + '" y="249" text-anchor="middle">' + esc(tk.label) + '</text>').join('')
    + '<path d="M58 36V224H486" fill="none" stroke="#262624" stroke-width="1.2" opacity=".55"/>'
    + '<text x="486" y="261" text-anchor="end" style="font:700 8.5px var(--mono);fill:#6e6d65">28-DAY AXIS (MM-DD) →</text>'
    + targetRuleHtml
    + linesSvg
    + '<g id="chart-crosshair-layer">' + buildChartCrosshairSvg(activePt) + '</g>'
    + '</svg>';

  const kpiStripHtml = kpiItems.length
    ? '<div class="chart-kpi-strip">' + kpiItems.map(k => '<div class="ck-cell"><small>' + esc(k.label) + '</small><strong>' + esc(k.val) + '</strong></div>').join('') + '</div>'
    : '';

  const linearTableHtml = buildLinearTableMarkup(allPts, activePt, allMembers().length > 1);
  const legend = seriesList.map(s => '<span><i style="background:' + s.color + '"></i>' + esc(s.endTag || s.name) + '</span>').join('');
  const splitBody = '<div class="chart-split-stage chart-slide-in">'
    + '<div class="chart-stage-main">' + controlsHtml + kpiStripHtml + svg + '<div id="linear-table-box">' + linearTableHtml + '</div></div>'
    + '<div class="chart-stage-detail">' + buildNodeDetailCardMarkup(activePt) + '</div>'
    + '</div>';

  return blueprintChartCard(chartTitle, chartHint, splitBody, '', legend);
}

/* ---------- View 2: Progress ---------- */
function progress() {
  const wRuns = new Set(mine(weekly()).map(r => r.date)).size;
  const mt = total(mine(monthly())), stH = totalStudy(monthly(mineStudy()));
  const doneSport = runToday(), doneStudy = studyToday(), hb = habitRateForDate(today());
  const sportPct = Math.round(mt / Math.max(1, state.goal) * 100);
  const studyPct = Math.round(stH / Math.max(1, state.studyGoal) * 100);
  const habitPct = weeklyHabitPct();
  const pacePct = monthElapsedPct();
  const members = allMembers(), solo = members.length === 1;
  const curveTab = solo ? '双轨线性表' : '多人竞速曲线';
  const activeProgTab = (progressTab === '双轨线性表' || progressTab === '多人竞速曲线') ? curveTab : progressTab;

  const sportRem = Math.max(0, state.goal - mt), studyRem = Math.max(0, state.studyGoal - stH);
  return '<div class="editorial-page">'
    + '<div class="hero-split">'
    + '<section class="poster-hero poster-flame" data-wm="' + sportPct + '%">'
    + '<div class="poster-meta"><span>[ 02-A / 运动目标 · FLAME PIXEL ]</span><span>每周 ' + state.days.length + ' 跑 · ' + (doneSport ? '今日已跑 ✓' : '今日待跑') + '</span></div>'
    + '<div class="plan-hero-row">'
    + '<div class="poster-big-stat"><small>跑量达成</small><strong>' + sportPct + '<em>%</em></strong></div>'
    + '<div class="poster-body">'
    + '<h2>' + mt.toFixed(1) + ' <em>/ ' + state.goal + ' KM</em></h2>'
    + '<p class="poster-cn">已跑 ' + mt.toFixed(1) + ' 公里 · ' + (sportRem ? '距目标还差 ' + sportRem.toFixed(1) + ' km 继续冲刺' : '本月跑量目标已达成 ✓') + '</p>'
    + '</div></div>'
    + '<div class="poster-kpis poster-kpis-4">'
    + '<div><small>完成率</small><strong>' + sportPct + '<em>%</em></strong></div>'
    + '<div><small>本月已跑</small><strong>' + mt.toFixed(1) + '<em>KM</em></strong></div>'
    + '<div><small>月度目标</small><strong>' + state.goal + '<em>KM</em></strong></div>'
    + '<div><small>剩余里程</small><strong>' + sportRem.toFixed(1) + '<em>KM</em></strong></div>'
    + '</div>'
    + '</section>'
    + '<section class="poster-hero poster-lightning" data-wm="' + studyPct + '%">'
    + '<div class="poster-meta"><span>[ 02-B / 学习目标 · LIGHTNING PIXEL ]</span><span>每周 ' + state.studyDays.length + ' 学 · ' + (doneStudy ? '今日已学 ✓' : '今日待学') + '</span></div>'
    + '<div class="plan-hero-row">'
    + '<div class="poster-big-stat"><small>学时达成</small><strong>' + studyPct + '<em>%</em></strong></div>'
    + '<div class="poster-body">'
    + '<h2>' + stH.toFixed(1) + ' <em>/ ' + state.studyGoal + ' H</em></h2>'
    + '<p class="poster-cn">已学 ' + stH.toFixed(1) + ' 小时 · ' + (studyRem ? '距目标还差 ' + studyRem.toFixed(1) + ' h 保持专注' : '本月学习目标已达成 ✓') + '</p>'
    + '</div></div>'
    + '<div class="poster-kpis poster-kpis-4">'
    + '<div><small>完成率</small><strong>' + studyPct + '<em>%</em></strong></div>'
    + '<div><small>本月已学</small><strong>' + stH.toFixed(1) + '<em>H</em></strong></div>'
    + '<div><small>月度目标</small><strong>' + state.studyGoal + '<em>H</em></strong></div>'
    + '<div><small>剩余学时</small><strong>' + studyRem.toFixed(1) + '<em>H</em></strong></div>'
    + '</div>'
    + '</section>'
    + '</div>'
    + cta(true)
    + subtabs(['双轨总览', curveTab, '28天三合一热力', '7天双柱对比'], activeProgTab, 'progress-tab', 'equal', { '双轨总览': 'users', [curveTab]: 'chart', '28天三合一热力': 'calendar', '7天双柱对比': 'pulse' })
    + progressBody()
    + '</div>';
}

function progressBody() {
  const monthPace = monthElapsedPct();
  if (progressTab === '双轨总览') {
    const d = chinaNow();
    const daysLeft = Math.max(1, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate() - d.getDate() + 1);
    const myMt = total(mine(monthly())), mySt = totalStudy(monthly(mineStudy()));
    const remSport = Math.max(0, state.goal - myMt), remStudy = Math.max(0, state.studyGoal - mySt);
    const hb = habitRateForDate(today());
    const board = teamLeaderboard('本月', '综合积分');

    const solo = board.length === 1;
    const cards = board.map((row, idx) => {
      const name = row.name;
      const clr = memberColor(name);
      const runs = state.records.filter(r => r.person === name), stRuns = state.studyRecords.filter(r => r.person === name);
      const mt = row.km, stMt = row.hrs;
      const sPct = Math.min(100, Math.round(mt / Math.max(1, state.goal) * 100));
      const lPct = Math.min(100, Math.round(stMt / Math.max(1, state.studyGoal) * 100));
      const weekHits = ['一', '二', '三', '四', '五', '六', '日'].map((v, i) => {
        const wd = new Date(weekStart() + 'T12:00:00'); wd.setDate(wd.getDate() + i);
        const key = dateKey(wd);
        const rHit = runs.some(r => r.date === key), lHit = stRuns.some(r => r.date === key);
        const isToday = key === today();
        return '<button type="button" data-action="jump-cal" data-value="' + key + '" class="mini-day ' + (rHit && lHit ? 'both' : rHit ? 'done' : lHit ? 'studied' : '') + (isToday ? ' is-today' : '') + '" title="点击查看 ' + key + '"><span>' + v + '</span><b>' + (rHit && lHit ? '★' : rHit ? '跑' : lHit ? '学' : '·') + '</b></button>';
      }).join('');
      return '<div class="progress-person" style="--mclr:' + clr + '">'
        + '<div class="person-head"><span class="avatar-sm" style="border-color:' + clr + ';color:' + clr + '">' + esc(name.slice(0, 1)) + '</span><div><strong>' + (solo ? '' : '#' + (idx + 1) + ' ') + esc(name) + (name === state.name ? ' · 我' : '') + '</strong><span class="badge-tag">' + row.score + ' 积分 · ' + level(name) + '</span></div><button class="status-chip ' + ((runs.some(r => r.date === today()) && stRuns.some(r => r.date === today())) ? 'is-done' : '') + '" data-action="checkin" data-mode="sport" data-person="' + esc(name) + '">' + icon('check') + (solo ? '立即打卡' : '帮TA打卡') + '</button></div>'
        + '<div class="inline-stat"><label>' + icon('calendar') + ' 本周双轨</label><div class="mini-week">' + weekHits + '</div></div>'
        + '<div class="inline-stat"><label>' + icon('shoe') + ' 运动对比</label>' + PixelProgressBar.renderHtml({ progress: sPct, height: 18, width: '100%', bare: true, variant: 'orange', pacePct: monthPace, className: 'meter-ppb', ariaLabel: name + ' 运动目标对比进度' }) + '<span class="meter-pct">' + mt.toFixed(1) + 'k</span></div>'
        + '<div class="inline-stat"><label>' + icon('book') + ' 学习对比</label>' + PixelProgressBar.renderHtml({ progress: lPct, height: 18, width: '100%', bare: true, variant: 'blue', pacePct: monthPace, className: 'meter-ppb', ariaLabel: name + ' 学习目标对比进度' }) + '<span class="meter-pct">' + stMt.toFixed(1) + 'h</span></div>'
        + '<div class="person-metrics"><div><small>本月跑量</small><strong>' + mt.toFixed(1) + ' km</strong></div><div><small>本月学习</small><strong>' + stMt.toFixed(1) + ' h</strong></div><div><small>7日自律</small><strong>' + row.hbRate + '%</strong></div><div><small>双轨连胜</small><strong>' + row.streak + ' 天</strong></div></div>'
        + '</div>';
    }).join('');

    const insight = '<aside class="progress-insight">'
      + '<div class="insight-banner"><span>[ ' + (solo ? 'SOLO RHYTHM CHECK · 个人节律' : 'TEAM PK &amp; RHYTHM CHECK') + ' ]</span><strong>距离本月目标：运动 <em>' + remSport.toFixed(1) + ' KM</em> · 学习 <em>' + remStudy.toFixed(1) + ' H</em></strong></div>'
      + '<div class="insight-grid">'
      + '<div class="insight-box"><span>运动日均需跑</span><strong>' + (remSport / daysLeft).toFixed(1) + ' <em>KM/天</em></strong><small>本月剩余 ' + daysLeft + ' 天</small></div>'
      + '<div class="insight-box"><span>学习日均需学</span><strong>' + (remStudy / daysLeft).toFixed(1) + ' <em>H/天</em></strong><small>距离 ' + state.studyGoal + 'h 目标</small></div>'
      + '</div>'
      + '<div class="quick-habit-strip"><span>' + icon('bolt') + ' 今日自律快速勾选 (' + hb.done + '/' + hb.total + ')</span><div class="quick-habit-pills">'
      + state.habits.map(h => { const on = (state.habitLogs[today()] || []).includes(h.id); return '<button class="qh-pill ' + (on ? 'on' : '') + '" data-action="toggle-habit" data-value="' + h.id + '">' + (on ? '✓ ' : '○ ') + esc(h.title.slice(0, 10)) + '</button>'; }).join('')
      + '</div></div>'
      + '<div class="insight-ppb-row"><button type="button" class="insight-ppb-btn" data-action="open-ppb-demo">🧩 像素进度条组件演示 (0%–100% / 不确定状态)</button></div>'
      + '</aside>';
    return '<div class="progress-split"><div class="progress-list">' + cards + '</div>' + insight + '</div>';
  }
  if (progressTab === '双轨线性表' || progressTab === '多人竞速曲线') {
    return '<div class="chart-panel">' + lineChart('dual') + '</div>';
  }
  if (progressTab === '28天三合一热力') {
    const activeDays = Array.from({ length: 28 }, (_, i) => dateShift(i - 27)).filter(dk => state.records.some(r => r.date === dk) || state.studyRecords.some(r => r.date === dk)).length;
    return '<div class="data-chart blueprint-chart"><div class="chart-head"><div><strong>[ 近 28 天运动 × 学习 × 自律三合一热力 ]</strong><small>点击任意日期格子，立即检视全员当天运动里程、学习课程与自律完成项</small></div><div class="chart-badges"><span>近 28 天活跃 ' + activeDays + ' 天</span></div></div>' + calendarHeatmap(28) + '</div>';
  }
  return '<div class="data-chart blueprint-chart">' + barChart('dual') + '</div>';
}

function render28DayPlanSection(kind) {
  const isStudy = kind === 'study';
  const startD = new Date(weekStart() + 'T12:00:00');
  startD.setDate(startD.getDate() - 7);
  const wDays = [1, 2, 3, 4, 5, 6, 0], wNames = ['一', '二', '三', '四', '五', '六', '日'];
  const templateArr = isStudy ? state.studyDays : state.days;

  const weekdayHeaders = wDays.map((dow, i) => {
    const on = templateArr.includes(dow);
    return '<button type="button" class="plan-28-wbtn ' + (isStudy ? 'is-study ' : '') + (on ? 'is-on' : '') + '" data-action="' + (isStudy ? 'study-day' : 'day') + '" data-value="' + dow + '" title="点击批量切换每周' + wNames[i] + '">'
      + '<span>周' + wNames[i] + '</span><small>' + (on ? '常驻' : '休') + '</small></button>';
  }).join('');

  let plannedCount = 0;
  const cells = Array.from({ length: 28 }, (_, idx) => {
    const dObj = new Date(startD.getTime()); dObj.setDate(startD.getDate() + idx);
    const dk = dateKey(dObj), isToday = dk === today();
    const planned = isStudy ? isStudyPlanned(dk) : isSportPlanned(dk);
    if (planned) plannedCount++;
    const done = isStudy ? mineStudy().some(r => r.date === dk) : mine().some(r => r.date === dk);
    const cls = ['plan-28-cell', isStudy ? 'is-study' : 'is-sport', done ? 'is-done' : planned ? 'is-planned' : '', isToday ? 'is-today' : ''].filter(Boolean).join(' ');
    const stateLabel = done ? (isStudy ? '已学✓' : '已跑✓') : planned ? (isStudy ? '学习' : '跑步') : '休息';
    return '<button type="button" class="' + cls + '" data-action="' + (isStudy ? 'toggle-study-date' : 'toggle-sport-date') + '" data-value="' + dk + '" aria-pressed="' + planned + '" title="' + dk + ' · 点击切换计划/休息">'
      + '<span class="p28-top">' + (isToday ? '<em class="p28-today">今</em>' : '<span>' + pad(dObj.getMonth() + 1) + '/' + pad(dObj.getDate()) + '</span>') + '</span>'
      + '<span class="p28-state">' + stateLabel + '</span></button>';
  }).join('');

  return '<section class="week-plan">'
    + '<div class="week-head"><span class="eyebrow">' + icon(isStudy ? 'book' : 'calendar') + (isStudy ? ' 28天学习节奏计划（点单日或周表头切换）' : ' 28天晨跑节奏计划（点单日或周表头切换）') + '</span><small>28天已排 ' + plannedCount + ' 天</small></div>'
    + '<div class="plan-28-wrap"><div class="plan-28-weekdays">' + weekdayHeaders + '</div><div class="plan-28-grid">' + cells + '</div>'
    + '<div class="plan-28-legend"><span><i class="l-done"></i>已完成</span><span><i class="' + (isStudy ? 'l-study' : 'l-sport') + '"></i>' + (isStudy ? '计划学习' : '计划跑步') + '</span><span><i class="l-rest"></i>休息</span></div></div></section>';
}

/* ---------- View 3: Sports Plan ---------- */
function plan() {
  const mt = total(mine(monthly())), p = Math.round(mt / Math.max(1, state.goal) * 100), remaining = Math.max(0, state.goal - mt);
  const presets = [100, 150, 200, 245, 300];

  return '<div class="plan-layout"><div class="plan-left">'
    + '<section class="poster-hero poster-flame poster-compact" data-wm="' + p + '%">'
    + '<div class="poster-meta"><span>[ 03 / 运动目标与多人竞速 ]</span><span>' + esc(state.name) + ' · 每周 ' + state.days.length + ' 跑</span></div>'
    + '<div class="plan-hero-row">'
    + '<div class="poster-big-stat"><small>本月运动进度</small><strong>' + p + '<em>%</em></strong></div>'
    + '<div><h2>' + mt.toFixed(1) + ' <em>/ ' + state.goal + ' KM</em></h2><p class="poster-cn">已跑 ' + mt.toFixed(1) + ' 公里 · ' + (remaining ? '还差 ' + remaining.toFixed(1) + ' km 达成目标' : '本月运动目标已达成 ✓') + '</p></div>'
    + '</div>'
    + '<div class="poster-kpis poster-kpis-4">'
    + '<div><small>完成进度</small><strong>' + p + '<em>%</em></strong></div>'
    + '<div><small>已跑里程</small><strong>' + mt.toFixed(1) + '<em>KM</em></strong></div>'
    + '<div><small>目标里程</small><strong>' + state.goal + '<em>KM</em></strong></div>'
    + '<div><small>剩余待跑</small><strong>' + remaining.toFixed(1) + '<em>KM</em></strong></div>'
    + '</div></section>'
    + '<section class="plan-controls">'
    + '<div class="preset-row">' + presets.map(g => '<button class="preset-chip ' + (state.goal === g ? 'active' : '') + '" data-action="goal-set" data-value="' + g + '">' + g + 'K</button>').join('') + '</div>'
    + '<div class="segments">' + [-10, -5, 5, 10].map(n => '<button data-action="goal" data-value="' + n + '">' + (n > 0 ? '+' : '') + n + ' km</button>').join('') + '</div>'
    + '</section>'
    + render28DayPlanSection('sport')
    + '</div><div class="plan-right">'
    + '<div class="blueprint-box">' + lineChart('plan') + '</div>'
    + '<div class="next-run"><div class="next-run-left">' + icon('sunrise') + '<div><span>下一次计划出发</span><small>每周 ' + state.days.length + ' 天 · 准时开跑</small></div></div><strong>' + nextRun() + '</strong></div>'
    + '</div></div>';
}

/* ---------- View 4: Dedicated Study Goals & Focus Cockpit ---------- */
function formatTimer(sec) { return pad(Math.floor(sec / 60)) + ':' + pad(sec % 60); }

function study() {
  const stRuns = mineStudy();
  const stH = totalStudy(monthly(stRuns));
  const p = Math.round(stH / Math.max(1, state.studyGoal) * 100);
  const remaining = Math.max(0, state.studyGoal - stH);
  const presets = [40, 80, 120, 160, 200];

  const archivedTargetCount = state.studyTargets.filter(t => t.archived).length;
  const visibleTargets = showArchivedTargets ? state.studyTargets : activeStudyTargets();
  const targetCards = visibleTargets.map(t => {
    const pct = Math.min(100, Math.round(t.doneHours / Math.max(1, t.targetHours) * 100));
    return '<article class="study-target-card ' + (t.archived ? 'is-archived' : '') + '" style="--accent:' + esc(t.color) + '">'
      + '<div class="st-top"><span class="st-cat">' + esc(t.category) + ' · ' + esc(t.deadline) + (t.archived ? ' · 已归档' : '') + '</span>'
      + '<span class="st-top-actions">'
      + '<button class="st-act" data-action="edit-study-target" data-value="' + esc(t.id) + '" title="编辑目标" aria-label="编辑目标">✎</button>'
      + '<button class="st-act" data-action="archive-study-target" data-value="' + esc(t.id) + '" title="' + (t.archived ? '恢复在研' : '归档目标') + '">' + (t.archived ? '恢复' : '归档') + '</button>'
      + '<button class="st-del" data-action="del-study-target" data-value="' + esc(t.id) + '" aria-label="删除目标">×</button></span></div>'
      + '<h4>' + esc(t.title) + '</h4>'
      + '<div class="st-progress-row">' + PixelProgressBar.renderHtml({ progress: pct, height: 12, width: '100%', bare: true, color: t.color, state: pct >= 100 ? 'success' : 'loading', className: 'st-ppb', ariaLabel: t.title + ' 学习进度' }) + '<span>' + t.doneHours.toFixed(1) + ' / ' + t.targetHours + 'h (' + pct + '%)</span></div>'
      + '<div class="st-actions">'
      + '<button data-action="quick-study" data-value="' + esc(t.id) + ':0.5">+0.5h</button>'
      + '<button data-action="quick-study" data-value="' + esc(t.id) + ':1">+1.0h</button>'
      + '<button class="st-checkin-btn" data-action="checkin" data-mode="study" data-target="' + esc(t.id) + '">专注打卡 →</button>'
      + '</div></article>';
  }).join('')
  + (archivedTargetCount ? '<button type="button" class="archived-toggle" data-action="toggle-archived-targets">' + (showArchivedTargets ? '收起已归档目标 (' + archivedTargetCount + ')' : '查看已归档目标 (' + archivedTargetCount + ')') + '</button>' : '');

  return '<div class="plan-layout study-layout"><div class="plan-left">'
    + '<section class="poster-hero poster-lightning poster-compact" data-wm="' + p + '%">'
    + '<div class="poster-meta"><span>[ 04 / 学习目标与多人竞学 ]</span><span>' + state.studyTargets.length + ' 个在研目标 · 每周 ' + state.studyDays.length + ' 天</span></div>'
    + '<div class="plan-hero-row">'
    + '<div class="poster-big-stat"><small>本月学习进度</small><strong>' + p + '<em>%</em></strong></div>'
    + '<div><h2>' + stH.toFixed(1) + ' <em>/ ' + state.studyGoal + ' H</em></h2><p class="poster-cn">已学 ' + stH.toFixed(1) + ' 小时 · ' + (remaining ? '还差 ' + remaining.toFixed(1) + ' 小时达成月目标' : '本月学习目标已达成 ✓') + '</p></div>'
    + '</div>'
    + '<div class="poster-kpis poster-kpis-4">'
    + '<div><small>完成进度</small><strong>' + p + '<em>%</em></strong></div>'
    + '<div><small>已学时长</small><strong>' + stH.toFixed(1) + '<em>H</em></strong></div>'
    + '<div><small>目标时长</small><strong>' + state.studyGoal + '<em>H</em></strong></div>'
    + '<div><small>剩余待学</small><strong>' + remaining.toFixed(1) + '<em>H</em></strong></div>'
    + '</div></section>'
    + '<section class="plan-controls">'
    + '<div class="preset-row">' + presets.map(g => '<button class="preset-chip ' + (state.studyGoal === g ? 'active' : '') + '" data-action="study-goal-set" data-value="' + g + '">' + g + 'H</button>').join('') + '</div>'
    + '<div class="segments">' + [-10, -5, 5, 10].map(n => '<button data-action="study-goal" data-value="' + n + '">' + (n > 0 ? '+' : '') + n + ' h</button>').join('') + '</div>'
    + '</section>'
    + render28DayPlanSection('study')
    + '<section class="study-targets-section">'
    + '<div class="week-head"><span class="eyebrow">' + icon('target') + ' 学习目标拆解板（点击快速记录或打卡）</span><button class="add-target-btn" data-action="add-study-target">＋ 新建学习目标</button></div>'
    + '<div class="study-targets-grid">' + targetCards + '</div>'
    + '</section>'
    + '</div><div class="plan-right">'
    + '<div class="pomodoro-panel">'
    + '<div class="pomo-head"><span>[ FOCUS ENGINE · 番茄专注计时 ]</span><div class="pomo-presets"><button class="' + (pomodoroTotal === 1500 ? 'active' : '') + '" data-action="pomo-set" data-value="25">25m</button><button class="' + (pomodoroTotal === 3000 ? 'active' : '') + '" data-action="pomo-set" data-value="50">50m</button></div></div>'
    + '<div class="pomo-main"><strong id="pomo-clock">' + formatTimer(getPomoLeftSec()) + '</strong>'
    + '<div class="pomo-ctrl">'
    + '<button class="pomo-btn primary" data-action="pomo-toggle">' + (pomoSession.state === 'running' ? '暂停计时 Ⅱ' : pomoSession.state === 'paused' ? '继续专注 ▶' : '开始专注 ▶') + '</button>'
    + '<button class="pomo-btn" data-action="pomo-reset">重置 ↺</button>'
    + '<button class="pomo-btn accent" data-action="pomo-finish"' + (getPomoElapsedSec() < 60 || pomoSession.state === 'saving' ? ' disabled' : '') + '>' + (pomoSession.state === 'saving' ? '保存中…' : '记入学习 ✓') + '</button>'
    + '</div></div>'
    + '<div class="pomo-hint" id="pomo-elapsed-hint">本轮已投入：' + Math.floor(getPomoElapsedSec() / 60) + '分' + (getPomoElapsedSec() % 60) + '秒 · 满 60 秒可精确记入</div>'
    + (pomoSession.errorMsg ? '<div class="pomo-error">' + esc(pomoSession.errorMsg) + '</div>' : '')
    + '<div class="pomo-target-select"><label>当前关联目标：</label><select id="pomo-target-sel" data-action="pomo-target">'
    + (activeStudyTargets().length ? activeStudyTargets() : state.studyTargets).map(t => '<option value="' + esc(t.id) + '" ' + (t.id === pomodoroTargetId ? 'selected' : '') + '>' + esc(t.title) + '</option>').join('')
    + '</select></div></div>'
    + '<div class="blueprint-box">' + lineChart('study') + '</div>'
    + '<div class="next-run"><div class="next-run-left">' + icon('brain') + '<div><span>下一次深度专注</span><small>每周 ' + state.studyDays.length + ' 天 · 告别手机干扰</small></div></div><strong>' + nextStudy() + '</strong></div>'
    + '</div></div>';
}

function nextRun() {
  const now = chinaNow();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  for (let i = 0; i < 15; i++) {
    const d = chinaNow(); d.setDate(d.getDate() + i);
    const dk = dateKey(d);
    if (!isSportPlanned(dk)) continue;
    if (i === 0) {
      if (runToday()) continue;
      if (nowMin > 6 * 60 + 10) return '今日已过计划点（可补跑）';
      return '今天 06:10';
    }
    return (i === 1 ? '明早' : i < 7 ? ('周' + '日一二三四五六'[d.getDay()]) : dk.slice(5)) + ' 06:10';
  }
  return '自由跑 · 随时出发';
}
function nextStudy() {
  const now = chinaNow();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  for (let i = 0; i < 15; i++) {
    const d = chinaNow(); d.setDate(d.getDate() + i);
    const dk = dateKey(d);
    if (!isStudyPlanned(dk)) continue;
    if (i === 0) {
      if (studyToday()) continue;
      if (nowMin > 8 * 60 + 30) return '今日已过计划点（可随时专注）';
      return '今天 08:30';
    }
    return (i === 1 ? '明早' : i < 7 ? ('周' + '日一二三四五六'[d.getDay()]) : dk.slice(5)) + ' 08:30';
  }
  return '随时开卷';
}

/* ---------- View 5: Unified Multi-Player Ranking ---------- */
function ranking() {
  const rows = teamLeaderboard(rankPeriod, rankMetric);
  const valOf = r => rankMetric === '综合积分' ? r.score : rankMetric === '按公里' ? r.km : rankMetric === '按学习' ? r.hrs : rankMetric === '按天数' ? r.days : r.likes;
  const maxVal = Math.max(1, ...rows.map(valOf));
  const top = rows[0];
  const topVal = top ? (rankMetric === '综合积分' ? top.score + ' <em>PTS</em>' : rankMetric === '按公里' ? top.km.toFixed(1) + ' <em>KM</em>' : rankMetric === '按学习' ? top.hrs.toFixed(1) + ' <em>H</em>' : rankMetric === '按天数' ? top.days + ' <em>天</em>' : top.likes + ' <em>赞</em>') : '—';
  const myRuns = mine(), myStudy = mineStudy();
  const bestPace = myRuns.length ? formatPaceSec(Math.min(...myRuns.map(paceSeconds))) : '—';

  const soloRank = rows.length === 1;
  return '<div class="rank-layout"><div class="rank-left">'
    + '<section class="poster-hero poster-black poster-compact" data-wm="' + (soloRank ? 'SOLO' : '#1') + '">'
    + '<div class="poster-meta"><span>[ 05 / ' + (soloRank ? '个人战绩档案' : '多人竞技总榜') + ' · ' + rankPeriod + ' ]</span><span>' + rankMetric + '</span></div>'
    + '<div class="rank-hero-main"><div><span class="rank-crown-tag">' + icon('crown') + ' ' + (soloRank ? '个人基准档案' : '当前榜首') + '</span><h2>' + esc(top?.name || state.name) + '</h2></div><div class="rank-hero-score">' + topVal + '</div></div>'
    + '</section>'
    + '<div class="rank-filters">'
    + '<div class="filter-row"><span class="filter-label">' + icon('calendar') + ' 周期</span>' + subtabs(['今天', '本周', '本月', '总榜'], rankPeriod, 'rank-period', 'equal') + '</div>'
    + '<div class="filter-row"><span class="filter-label">' + icon('bolt') + ' 维度</span>' + subtabs(['综合积分', '按公里', '按学习', '按天数', '按人气'], rankMetric, 'rank-metric', 'equal', { '综合积分': 'trophy', '按公里': 'shoe', '按学习': 'book', '按天数': 'calendar', '按人气': 'heart' }) + '</div>'
    + '</div>'
    + rows.map((r, i) => {
      const clr = memberColor(r.name);
      const val = valOf(r), barPct = val ? Math.max(8, Math.round(val / maxVal * 100)) : 0;
      const result = rankMetric === '综合积分' ? r.score : rankMetric === '按公里' ? r.km.toFixed(1) : rankMetric === '按学习' ? r.hrs.toFixed(1) : rankMetric === '按天数' ? r.days : r.likes;
      const unit = rankMetric === '综合积分' ? '积分' : rankMetric === '按公里' ? '公里' : rankMetric === '按学习' ? '小时' : rankMetric === '按天数' ? '天' : '赞';
      return '<div class="rank-person ' + (i === 0 && val ? 'is-first' : '') + '">'
        + '<span class="place" style="' + (i > 0 ? 'border-color:' + clr + ';color:' + clr : '') + '">' + (val ? (i === 0 ? icon('crown', 'place-ico') : pad(i + 1)) : '—') + '</span>'
        + '<div class="rank-main"><div class="person-head"><strong>' + esc(r.name) + (r.name === state.name ? ' · 我' : '') + '</strong><span class="badge-tag">' + level(r.name) + '</span></div>'
        + PixelProgressBar.renderHtml({ progress: barPct, height: 12, width: '100%', bare: true, color: (i === 0 && val) ? '#e5492b' : clr, className: 'rank-ppb', ariaLabel: r.name + ' 排行进度' })
        + '<p>🏃 ' + r.km.toFixed(1) + ' km · 📚 ' + r.hrs.toFixed(1) + ' h · 出勤 ' + r.days + ' 天 · 自律 ' + r.hbRate + '%</p></div>'
        + '<div class="rank-result">' + result + '<small>' + unit + '</small></div></div>';
    }).join('')
    + '<div class="rank-invite"><div>' + icon('users') + '<div><strong>' + (soloRank ? '暂未添加竞技伙伴' : '持续扩大自律竞技圈') + '</strong><small>' + (soloRank ? '当前处于个人专注模式，点击右侧随时添加室友/搭子同榜 PK' : '支持邀请更多室友或学习搭子加入实时排行榜 PK') + '</small></div></div><button data-action="add-person">＋ 加人物</button></div>'
    + '</div><div class="rank-right">'
    + '<div class="pace-summary"><div><small>我的最快配速</small><strong>' + bestPace + '</strong></div><div><small>我的累计学习</small><strong>' + totalStudy(myStudy).toFixed(1) + ' h</strong></div><div><small>我的双轨连胜</small><strong>' + dualStreak() + ' 天</strong></div></div>'
    + subtabs(['运动配速对比', '学习专注对比'], rankChartMode === 'study' ? '学习专注对比' : '运动配速对比', 'rank-chart-mode', 'equal', { '运动配速对比': 'shoe', '学习专注对比': 'book' })
    + '<div class="blueprint-box">' + lineChart(rankChartMode === 'study' ? 'study-focus' : 'pace') + '</div>'
    + '</div></div>';
}

/* ---------- View 6: 18 Balanced Medals ---------- */
function medals() {
  const runs = mine(), km = total(runs);
  const stRuns = mineStudy(), hrs = totalStudy(stRuns);
  const totalLikes = runs.reduce((s, r) => s + (r.likes || 0), 0) + stRuns.reduce((s, r) => s + (r.likes || 0), 0);
  const perfectHabitDays = Object.keys(state.habitLogs).filter(dk => (state.habitLogs[dk] || []).length >= Math.max(1, activeHabits().length)).length;
  const bothTodayCount = [...new Set(runs.map(r => r.date))].filter(dk => stRuns.some(l => l.date === dk)).length;

  return [
    ['flag', '运动', '完成第一次跑步', '初次出发', '迈出跑道第一步，万事开头难但你已经跑了。', runs.length, 1, '次'],
    ['shoe', '运动', '单次跑满 5 公里', '五公里选手', '把城市跑成自己的地图。', Math.max(0, ...runs.map(r => r.km)), 5, 'km'],
    ['mountain', '运动', '单次跑满 10 公里', '十公里勇士', '比昨天的自己更进一步。', Math.max(0, ...runs.map(r => r.km)), 10, 'km'],
    ['trophy', '运动', '单次跑满 21.1 公里', '半马勇者', '21.1 公里，这是你的里程碑。', Math.max(0, ...runs.map(r => r.km)), 21.1, 'km'],
    ['compass', '运动', '累计跑满 100 公里', '百里行者', '每一公里，都有自己的故事。', km, 100, 'km'],
    ['flame', '运动', '连续晨跑 7 天', '晨跑全勤', '七个清晨，七次与自己相遇。', streak(), 7, '天'],
    ['book', '学习', '完成第一次学习打卡', '开卷有益', '打开书页的那一刻，焦虑就少了一半。', stRuns.length, 1, '次'],
    ['clock', '学习', '单次专注满 2 小时', '深度沉浸', '屏息凝神两个小时，时间站在你这边。', Math.max(0, ...stRuns.map(r => r.hours)), 2, 'h'],
    ['brain', '学习', '累计学习 10 小时', '十小时砖石', '知识在安静的积累中发生质变。', hrs, 10, 'h'],
    ['spark', '学习', '进入 2 次⚡心流状态', '心流学者', '忘却时间流逝的专注，是学习最高回报。', stRuns.filter(r => r.focus === 4).length, 2, '次'],
    ['target', '学习', '累计学习 50 小时', '半百学者', '五十个小时的深耕，足以重塑认知边界。', hrs, 50, 'h'],
    ['medal', '学习', '连续学习打卡 7 天', '七日笃学', '日日精进，不疾而速。', studyStreak(), 7, '天'],
    ['sunrise', '自律', '单日双轨（跑+学）完成', '文武双全', '同一天里既锤炼身体，也滋养头脑。', bothTodayCount, 1, '天'],
    ['check', '自律', '单日自律清单全满', '满分自律日', '对自己的每一个承诺，都说到做到。', perfectHabitDays, 1, '天'],
    ['bolt', '自律', '连续 3 天双轨打卡', '三日定力', '三天是惯性的起点，继续向前。', dualStreak(), 3, '天'],
    ['crown', '自律', '达成 5 天自律全满日', '秩序大师', '规律的作息与行动，带来真正的自由。', perfectHabitDays, 5, '天'],
    ['heart', '自律', '累计收获 10 个赞', '人气榜样', '你的坚持，也在点亮身边的朋友。', totalLikes, 10, '赞'],
    ['infinity', '自律', '双轨累计打卡 30 天', '长期主义', '慢一点没关系，运动与学习一直都在。', new Set([...runs.map(r => r.date), ...stRuns.map(r => r.date)]).size, 30, '天']
  ];
}

function achievements() {
  const all = medals(), unlockedList = all.filter(m => m[5] >= m[6]), count = unlockedList.length;
  const list = achFilter === '已解锁' ? unlockedList
    : achFilter === '冲刺中' ? all.filter(m => m[5] < m[6])
    : ['运动', '学习', '自律'].includes(achFilter) ? all.filter(m => m[1] === achFilter)
    : all;
  const lv = Math.max(1, Math.floor(count / 3) + 1);
  const achPct = Math.round(count / Math.max(1, all.length) * 100);
  const totalKm = total(mine()), totalHrs = totalStudy(mineStudy());
  return '<div class="ach-page">'
    + '<section class="poster-hero poster-black poster-compact" data-wm="' + achPct + '%">'
    + '<div class="poster-meta"><span>[ 06 / 运动 · 学习 · 自律勋章墙 ]</span><span>LV' + lv + ' · ' + level() + ' · ' + count + ' / ' + all.length + ' UNLOCKED</span></div>'
    + '<div class="ach-poster-row">'
    + '<div class="poster-big-stat"><small>勋章解锁进度</small><strong>' + achPct + '<em>%</em></strong></div>'
    + '<div class="ach-poster-copy"><h2>' + count + ' <em>/ ' + all.length + ' MEDALS</em></h2><p class="poster-cn">6 枚运动 + 6 枚学习 + 6 枚自律 · 已跑 ' + totalKm.toFixed(1) + ' km · 已学 ' + totalHrs.toFixed(1) + ' h</p></div>'
    + '</div>'
    + '<div class="poster-kpis poster-kpis-4">'
    + '<div><small>解锁进度</small><strong>' + achPct + '<em>%</em></strong></div>'
    + '<div><small>已获勋章</small><strong>' + count + '<em>/' + all.length + '</em></strong></div>'
    + '<div><small>累计跑步</small><strong>' + totalKm.toFixed(1) + '<em>KM</em></strong></div>'
    + '<div><small>累计学习</small><strong>' + totalHrs.toFixed(1) + '<em>H</em></strong></div>'
    + '</div></section>'
    + subtabs(['全部', '运动', '学习', '自律', '已解锁', '冲刺中'], achFilter, 'ach-filter', 'equal', { '全部': 'medal', '运动': 'shoe', '学习': 'book', '自律': 'bolt', '已解锁': 'check', '冲刺中': 'target' })
    + '<div class="medal-grid">' + (list.length ? list.map((m, idx) => {
      const unlocked = m[5] >= m[6];
      const curVal = Math.min(m[5], m[6]).toFixed(m[6] % 1 ? 1 : 0);
      const pct = Math.min(100, Math.round(m[5] / m[6] * 100));
      const catCls = m[1] === '学习' ? 'cat-study' : m[1] === '自律' ? 'cat-habit' : 'cat-sport';
      return '<button class="medal-card" data-action="flip" aria-label="' + m[2] + '，点击翻面" aria-pressed="false"><span class="medal-inner">'
        + '<span class="medal-front ' + (unlocked ? 'unlocked ' : '') + catCls + '">'
        + '<span class="medal-code">#' + pad(idx + 1) + ' · ' + m[1] + '</span>'
        + '<span class="medal-flip-hint">↻</span>'
        + '<span class="medal-symbol">' + icon(m[0]) + '</span>'
        + '<p>' + m[2] + '</p>'
        + (unlocked ? '<small class="medal-title-tag">✓ ' + m[3] + '</small>' : '<span class="medal-ratio">' + curVal + '/' + m[6] + m[7] + ' · ' + pct + '%</span><span class="medal-progress"><i style="width:' + pct + '%"></i></span>')
        + '</span>'
        + '<span class="medal-back">' + icon(m[0], 'medal-back-ico') + '<strong>' + m[3] + '</strong><p>' + m[4] + '</p><small>' + curVal + ' / ' + m[6] + ' ' + m[7] + '</small></span>'
        + '</span></button>';
    }).join('') : '<div class="empty">当前筛选下暂无勋章。</div>') + '</div></div>';
}

/* ---------- View 7: Records & Interactive Blueprint Charts ---------- */
function departureChart(kindFilter = 'all') {
  const list = allUnifiedRecords(kindFilter);
  const hrs = list.map(r => Number(r.time.slice(0, 2)) + Number(r.time.slice(3)) / 60);
  const avgH = hrs.length ? hrs.reduce((s, h) => s + h, 0) / hrs.length : 7.5;
  const avgStr = pad(Math.floor(avgH)) + ':' + pad(Math.round((avgH % 1) * 60));
  const morningX1 = (24 + (5 / 24) * 372).toFixed(1), morningW = ((3.5 / 24) * 372).toFixed(1);
  const studyX1 = (24 + (8.5 / 24) * 372).toFixed(1), studyW = ((3.5 / 24) * 372).toFixed(1);
  const eveX1 = (24 + (19 / 24) * 372).toFixed(1), eveW = ((3.5 / 24) * 372).toFixed(1);

  const svg = '<svg class="line-chart" viewBox="0 0 420 84" role="img" aria-label="运动与学习时段分布图，点击圆点查看记录">'
    + '<rect x="' + morningX1 + '" y="16" width="' + morningW + '" height="34" rx="3" fill="rgba(229,73,43,.12)" stroke="#e5492b" stroke-dasharray="3 2" stroke-width=".8"/>'
    + '<text x="' + (Number(morningX1) + 2) + '" y="11" style="fill:#e5492b;font-weight:700">晨跑窗 05–08</text>'
    + '<rect x="' + studyX1 + '" y="16" width="' + studyW + '" height="34" rx="3" fill="rgba(32,63,145,.11)" stroke="#203f91" stroke-dasharray="3 2" stroke-width=".8"/>'
    + '<text x="' + (Number(studyX1) + 2) + '" y="11" style="fill:#203f91;font-weight:700">早学窗 08:30–12</text>'
    + '<rect x="' + eveX1 + '" y="16" width="' + eveW + '" height="34" rx="3" fill="rgba(32,63,145,.11)" stroke="#203f91" stroke-dasharray="3 2" stroke-width=".8"/>'
    + '<text x="' + (Number(eveX1) + 2) + '" y="11" style="fill:#203f91;font-weight:700">夜读窗 19–22:30</text>'
    + '<path d="M24 33H396" stroke="#d3d1c7" stroke-width="8" stroke-linecap="round"/>'
    + Array.from({ length: 9 }, (_, i) => '<text x="' + (24 + i * 46.5) + '" y="70" text-anchor="middle">' + pad(i * 3) + ':00</text>').join('')
    + list.map((r, idx) => {
      const cx = 24 + ((Number(r.time.slice(0, 2)) + Number(r.time.slice(3)) / 60) / 24) * 372;
      const isSport = r._kind === 'sport';
      const note = (isSport ? '🏃 ' : '📚 ') + r.person + ' · ' + r.date + ' ' + r.time + ' · ' + (isSport ? r.km.toFixed(1) + ' km' : r.hours.toFixed(1) + ' h ' + r.subject);
      return '<g class="bp-hit" data-point="t' + idx + '" data-record="' + r._key + '" data-note="' + esc(note) + '" tabindex="0" role="button"><circle cx="' + cx.toFixed(1) + '" cy="' + (isSport ? 29 : 37) + '" r="9" fill="transparent"/><circle cx="' + cx.toFixed(1) + '" cy="' + (isSport ? 29 : 37) + '" r="5" fill="' + memberColor(r.person) + '" stroke="#f2f1e8" stroke-width="1.6"/></g>';
    }).join('')
    + '</svg>';

  return blueprintChartCard('TIME WINDOW · CLICK NODE', '平均启动 ' + avgStr, svg, selectedChartNote || '点击轨道圆点查看对应成员的时间窗并同步右侧小票', '<span><i style="background:#e5492b"></i>运动出发</span><span><i style="background:#203f91"></i>学习专注</span>');
}

function interactiveBucketsChart(mode, list) {
  let rows = [];
  const feelPalette = ['#262624', '#203f91', '#d97757', '#e4a334', '#e5492b'];
  if (mode === 'feeling') {
    if (recordKindFilter === 'study') {
      rows = studyFocusLevels.map((f, i) => ({ label: f[0] + ' ' + f[1], items: list.filter(r => r.focus === i), color: feelPalette[i % feelPalette.length] }));
    } else if (recordKindFilter === 'sport') {
      rows = feelings.map((f, i) => ({ label: f[0] + ' ' + f[1], items: list.filter(r => r.feel === i), color: feelPalette[i % feelPalette.length] }));
    } else {
      rows = [0, 1, 2, 3, 4].map(i => ({
        label: feelings[i][0] + ' ' + feelings[i][1] + '/' + studyFocusLevels[i][1],
        items: list.filter(r => (r._kind === 'sport' ? r.feel : r.focus) === i),
        color: feelPalette[i % feelPalette.length]
      }));
    }
  } else {
    if (recordKindFilter === 'study') {
      rows = [
        { label: '< 1.5 小时', items: list.filter(r => r.hours < 1.5), color: '#203f91' },
        { label: '1.5–2.5 小时', items: list.filter(r => r.hours >= 1.5 && r.hours < 2.5), color: '#e5492b' },
        { label: '2.5–4 小时', items: list.filter(r => r.hours >= 2.5 && r.hours < 4), color: '#e4a334' },
        { label: '4+ 深度攻坚', items: list.filter(r => r.hours >= 4), color: '#262624' }
      ];
    } else if (recordKindFilter === 'sport') {
      rows = [
        { label: '0–5 km', items: list.filter(r => r.km < 5), color: '#e5492b' },
        { label: '5–10 km', items: list.filter(r => r.km >= 5 && r.km < 10), color: '#203f91' },
        { label: '10–21 km', items: list.filter(r => r.km >= 10 && r.km < 21.1), color: '#e4a334' },
        { label: '21.1+ 半马', items: list.filter(r => r.km >= 21.1), color: '#262624' }
      ];
    } else {
      rows = [
        { label: '🏃 短程 <10km', items: list.filter(r => r._kind === 'sport' && r.km < 10), color: '#e5492b' },
        { label: '🏃 长距 ≥10km', items: list.filter(r => r._kind === 'sport' && r.km >= 10), color: '#e4a334' },
        { label: '📚 专注 <2h', items: list.filter(r => r._kind === 'study' && r.hours < 2), color: '#203f91' },
        { label: '📚 深度 ≥2h', items: list.filter(r => r._kind === 'study' && r.hours >= 2), color: '#262624' }
      ];
    }
  }

  const max = Math.max(1, ...rows.map(r => r.items.length));
  const tot = Math.max(1, list.length);
  const activeIdx = selectedBucket && selectedBucket.mode === mode ? selectedBucket.idx : -1;
  const barsHtml = '<div class="feeling-bars">' + rows.map((row, idx) => {
    const c = row.items.length;
    const isSel = idx === activeIdx;
    return '<button type="button" class="dist-bar-btn ' + (isSel ? 'is-selected' : '') + '" data-action="select-bucket" data-value="' + mode + ':' + idx + '">'
      + '<label>' + esc(row.label) + '</label>'
      + PixelProgressBar.renderHtml({ progress: Math.round(c / max * 100), height: 18, width: '100%', bare: true, color: row.color, className: 'dist-ppb', ariaLabel: row.label + ' 占比进度' })
      + '<span>' + c + ' 次 (' + Math.round(c / tot * 100) + '%)</span>'
      + '</button>';
  }).join('') + '</div>';

  const matched = activeIdx >= 0 && rows[activeIdx] ? rows[activeIdx].items : [];
  const drawer = '<div class="day-inspector">'
    + '<div class="day-inspector-head"><strong>[ ' + (activeIdx >= 0 ? esc(rows[activeIdx]?.label || '') + ' · 匹配记录' : '点击上方任意横条筛选对应记录') + ' ]</strong><span>' + (activeIdx >= 0 ? matched.length + ' 条' : '共 ' + list.length + ' 条') + '</span></div>'
    + (activeIdx >= 0 ? '<div class="day-inspector-body">' + (matched.length ? matched.map(r => '<button class="inspect-pill ' + (r._kind === 'study' ? 'is-study' : 'is-sport') + '" data-action="open-record" data-value="' + r._key + '">' + esc(r.person) + ' ' + (r._kind === 'study' ? '📚 ' + r.date.slice(5) + ' · ' + r.hours.toFixed(1) + 'h' : '🏃 ' + r.date.slice(5) + ' · ' + r.km.toFixed(1) + 'km') + ' ↗</button>').join('') : '<span class="inspect-empty">该档位暂无记录</span>') + '</div>' : '')
    + '</div>';

  return blueprintChartCard((mode === 'feeling' ? 'STATE & FOCUS' : 'INTENSITY SPLIT') + ' · CLICK BAR', '点击横条直达小票', barsHtml + drawer, '');
}

function dataChart() {
  const list = allUnifiedRecords(recordKindFilter);
  if (chartType === '7天趋势') return barChart(recordKindFilter === 'all' ? 'dual' : recordKindFilter);
  if (chartType === '28天热力') return calendarHeatmap(28);
  if (chartType === '黄金时段') return departureChart(recordKindFilter);
  if (chartType === '强度分布') return interactiveBucketsChart('intensity', list);
  return interactiveBucketsChart('feeling', list);
}

function recordsPage() {
  const list = allUnifiedRecords(recordKindFilter);
  let curIdx = list.findIndex(x => x._key === recordSelectKey);
  if (curIdx < 0) curIdx = 0;
  const r = list[curIdx];
  if (r) recordSelectKey = r._key;

  const sKm = total(state.records), stH = totalStudy(state.studyRecords);
  const totalCount = state.records.length + state.studyRecords.length;
  const hb = habitRateForDate(today());

  const receiptBody = r ? (r._kind === 'study'
    ? '<article class="record-card is-study-receipt">'
      + '<div class="record-stamp"><span>STUDY RECEIPT //' + pad(list.length - curIdx).padStart(3, '0') + '</span><span>' + icon('clock') + ' ' + r.date + ' · ' + r.time + '</span></div>'
      + '<div class="record-hero-km is-study"><strong>' + r.hours.toFixed(1) + ' <em>HOURS</em></strong><span>' + esc(r.person) + ' ' + (studyFocusLevels[r.focus]?.[0] || '🧠') + ' · ' + (studyFocusLevels[r.focus]?.[1] || '专注') + '</span></div>'
      + '<div class="record-subject-line">' + icon('book') + ' <strong>' + esc(r.subject || findTargetTitle(r.targetId)) + '</strong></div>'
      + '<div class="record-tags"><span class="badge-tag is-study-tag">学习档案</span>' + (r.tags || []).map(t => '<span>' + esc(t) + '</span>').join('') + '</div>'
      + '<div class="record-numbers"><div><strong>' + r.minutes + '</strong><small>MIN / 分钟</small></div><div><strong>' + Math.max(1, Math.round(r.minutes / 25)) + '</strong><small>POMO / 番茄</small></div><div><strong>#' + (list.length - curIdx) + '</strong><small>LOG / 序号</small></div></div>'
      + '<p class="record-note">“' + esc(r.note || '专注一小时，胜过焦虑一整天。') + '”</p>'
      + (r.photo ? '<img class="record-photo" src="' + r.photo + '" alt="学习笔记照片">' : '')
      + '<div class="record-actions"><button class="like-btn ' + (r.liked ? 'liked' : '') + '" data-action="like-unified" data-value="' + r._key + '" aria-pressed="' + !!r.liked + '">' + icon('heart') + ' ' + (r.likes || '赞一个') + '</button><button class="edit-btn" data-action="edit-unified" data-value="' + r._key + '">编辑</button><button class="delete-btn" data-action="delete-unified" data-value="' + r._key + '">删除这条</button></div>'
      + '</article>'
    : '<article class="record-card">'
      + '<div class="record-stamp"><span>RUN RECEIPT //' + pad(list.length - curIdx).padStart(3, '0') + '</span><span>' + icon('clock') + ' ' + r.date + ' · ' + r.time + '</span></div>'
      + '<div class="record-hero-km"><strong>' + r.km.toFixed(2) + ' <em>KM</em></strong><span>' + esc(r.person) + ' ' + (feelings[r.feel]?.[0] || '🏃') + ' · ' + (feelings[r.feel]?.[1] || '') + '</span></div>'
      + '<div class="record-tags"><span class="badge-tag">' + level(r.person) + '</span>' + (r.tags || []).map(t => '<span>' + esc(t) + '</span>').join('') + '</div>'
      + '<div class="record-numbers"><div><strong>' + r.minutes + '</strong><small>MIN / 时长</small></div><div><strong>' + pace(r) + '</strong><small>PACE / 配速</small></div><div><strong>#' + (list.length - curIdx) + '</strong><small>RUN / 序号</small></div></div>'
      + '<p class="record-note">“' + esc(r.note || '今天，也跑完了。') + '”</p>'
      + (r.photo ? '<img class="record-photo" src="' + r.photo + '" alt="本次晨跑照片">' : '')
      + '<div class="record-actions"><button class="like-btn ' + (r.liked ? 'liked' : '') + '" data-action="like-unified" data-value="' + r._key + '" aria-pressed="' + !!r.liked + '">' + icon('heart') + ' ' + (r.likes || '赞一个') + '</button><button class="edit-btn" data-action="edit-unified" data-value="' + r._key + '">编辑</button><button class="delete-btn" data-action="delete-unified" data-value="' + r._key + '">删除这条</button></div>'
      + '</article>')
    : '<div class="empty">当前筛选下还没有打卡记录。</div>';

  return '<div class="records-layout"><div class="records-left">'
    + '<section class="poster-hero poster-blue poster-compact" data-wm="LOG">'
    + '<div class="poster-meta"><span>[ 07 / 全员运动 × 学习数据档案 ]</span><span>共 ' + totalCount + ' 条打卡</span></div>'
    + '<div class="poster-kpis poster-kpis-4">'
    + '<div><small>全员跑量</small><strong>' + sKm.toFixed(1) + '<em>K</em></strong></div>'
    + '<div><small>全员学习</small><strong>' + stH.toFixed(1) + '<em>H</em></strong></div>'
    + '<div><small>今日自律</small><strong>' + hb.done + '<em>/' + hb.total + '</em></strong></div>'
    + '<div><small>均配速</small><strong>' + avgPace() + '</strong></div>'
    + '</div></section>'
    + '<div class="domain-filter-bar">'
    + subtabs(['全部', '运动', '学习'], recordKindFilter === 'sport' ? '运动' : recordKindFilter === 'study' ? '学习' : '全部', 'record-kind', 'equal', { '全部': 'spark', '运动': 'shoe', '学习': 'book' })
    + '</div>'
    + subtabs(['7天趋势', '28天热力', '黄金时段', '强度分布', '状态感觉'], chartType, 'chart-type', 'data-tabs', { '7天趋势': 'chart', '28天热力': 'calendar', '黄金时段': 'clock', '强度分布': 'route', '状态感觉': 'spark' })
    + '<div class="data-chart blueprint-chart">' + dataChart() + '</div>'
    + '</div><div class="records-right">'
    + heading('[07] 双轨打卡小票档案', '<span class="pager"><button data-action="record-prev" aria-label="上一条记录" ' + (curIdx <= 0 ? 'disabled' : '') + '>‹</button><span>' + (r ? curIdx + 1 : 0) + ' / ' + list.length + '</span><button data-action="record-next" aria-label="下一条记录" ' + (curIdx >= list.length - 1 ? 'disabled' : '') + '>›</button></span>', 'spark')
    + (list.length ? '<div class="record-strip">' + list.map((item, idx) => {
      const isStudy = item._kind === 'study';
      return '<button class="record-chip ' + (isStudy ? 'chip-study ' : 'chip-sport ') + (idx === curIdx ? 'active' : '') + '" data-action="record-select" data-value="' + item._key + '"><em>' + (isStudy ? '学' : '跑') + '</em><span>' + esc(item.person.slice(0, 2)) + ' ' + item.date.slice(5) + '</span><strong>' + (isStudy ? item.hours.toFixed(1) + 'h' : item.km.toFixed(1) + 'k') + '</strong></button>';
    }).join('') + '</div>' : '')
    + receiptBody
    + '</div></div>';
}

/* ---------- View 8: Discipline & Multi-Person Co-Check-in ---------- */
function people() {
  const tmrw = chinaNow(); tmrw.setDate(tmrw.getDate() + 1);
  const tmrwDay = tmrw.getDay();
  const tmrwDk = dateShift(1);
  const tmrwRunPlanned = isSportPlanned(tmrwDk), tmrwStudyPlanned = isStudyPlanned(tmrwDk);
  const tmrwLabel = '周' + '日一二三四五六'[tmrwDay];
  const hb = habitRateForDate(today());

  const archivedHabitCount = state.habits.filter(h => h.archived).length;
  const visibleHabits = showArchivedHabits ? state.habits : activeHabits();
  const habitRows = visibleHabits.map(h => {
    const idxAll = state.habits.findIndex(x => x.id === h.id);
    const done = (state.habitLogs[today()] || []).includes(h.id);
    const weekDots = Array.from({ length: 7 }, (_, i) => {
      const dk = dateShift(i - 6);
      const hit = (state.habitLogs[dk] || []).includes(h.id);
      return '<i class="' + (hit ? 'hit' : '') + '" title="' + dk + '"></i>';
    }).join('');
    return '<div class="habit-row ' + (done ? 'is-done ' : '') + (h.archived ? 'is-archived' : '') + '">'
      + '<button class="habit-check" data-action="toggle-habit" data-value="' + esc(h.id) + '" aria-pressed="' + done + '">'
      + '<span class="habit-box">' + (done ? '✓' : '') + '</span>'
      + '<span class="habit-tag">' + esc(h.tag) + '</span>'
      + '<strong>' + esc(h.title) + (h.archived ? ' · 已停用' : '') + '</strong>'
      + '</button>'
      + '<div class="habit-dots" aria-label="近7天完成情况">' + weekDots + '</div>'
      + '<span class="habit-ctrls">'
      + (idxAll > 0 ? '<button class="habit-ctrl" data-action="move-habit" data-value="' + esc(h.id) + ':-1" title="上移">↑</button>' : '')
      + (idxAll < state.habits.length - 1 ? '<button class="habit-ctrl" data-action="move-habit" data-value="' + esc(h.id) + ':1" title="下移">↓</button>' : '')
      + '<button class="habit-ctrl" data-action="edit-habit" data-value="' + esc(h.id) + '" title="编辑">✎</button>'
      + '<button class="habit-ctrl" data-action="archive-habit" data-value="' + esc(h.id) + '" title="' + (h.archived ? '恢复启用' : '停用') + '">' + (h.archived ? '恢复' : '停用') + '</button>'
      + (state.habits.length > 1 ? '<button class="habit-del" data-action="del-habit" data-value="' + esc(h.id) + '" aria-label="删除自律项">×</button>' : '')
      + '</span>'
      + '</div>';
  }).join('')
  + (archivedHabitCount ? '<button type="button" class="archived-toggle" data-action="toggle-archived-habits">' + (showArchivedHabits ? '收起已停用习惯 (' + archivedHabitCount + ')' : '查看已停用习惯 (' + archivedHabitCount + ')') + '</button>' : '');

  return '<div class="people-layout"><div class="people-left">'
    + '<section class="poster-hero poster-orange poster-compact" data-wm="' + hb.pct + '%">'
    + '<div class="poster-meta"><span>[ 08 / 每日自律与多人共同打卡 ]</span><span>今日自律 ' + hb.done + '/' + hb.total + ' (' + hb.pct + '%)</span></div>'
    + '<div class="plan-hero-row">'
    + '<div class="poster-big-stat"><small>今日自律进度</small><strong>' + hb.pct + '<em>%</em></strong></div>'
    + '<div class="poster-body"><h2>DISCIPLINE &<br><em>TEAM PK.</em></h2><p class="poster-cn">已完成 ' + hb.done + '/' + hb.total + ' 项自律 · 本月跑 ' + total(mine(monthly())).toFixed(1) + ' km · 学 ' + totalStudy(monthly(mineStudy())).toFixed(1) + ' h</p></div>'
    + '</div>'
    + '<div class="people-intro-actions">'
    + '<button class="tomorrow-toggle ' + (tmrwRunPlanned ? 'active' : '') + '" data-action="toggle-tomorrow">' + icon(tmrwRunPlanned ? 'check' : 'shoe') + '明早' + tmrwLabel + '跑步 ' + (tmrwRunPlanned ? '已计划✓' : '休息') + '</button>'
    + '<button class="tomorrow-toggle ' + (tmrwStudyPlanned ? 'active' : '') + '" data-action="toggle-tomorrow-study">' + icon(tmrwStudyPlanned ? 'check' : 'book') + '明天' + tmrwLabel + '学习 ' + (tmrwStudyPlanned ? '已计划✓' : '休息') + '</button>'
    + '<button class="add-person" data-action="add-person">＋ 添加伙伴</button>'
    + '</div></section>'
    + '<section class="habit-matrix-panel">'
    + '<div class="week-head"><span class="eyebrow">' + icon('bolt') + ' 今日自律习惯矩阵（点击勾选 + 近7天记录）</span><button class="add-target-btn" data-action="add-habit">＋ 添加自律项</button></div>'
    + '<div class="habit-list">' + habitRows + '</div>'
    + '</section>'
    + '<div class="people-list">' + allMembers().map((n, i) => {
      const clr = memberColor(n);
      const runs = state.records.filter(r => r.person === n), stRuns = state.studyRecords.filter(r => r.person === n);
      const mt = total(monthly(runs)), stMt = totalStudy(monthly(stRuns));
      const doneS = runToday(n), doneL = studyToday(n), mHb = habitRateForPerson(n, today());
      return '<div class="person-card">'
        + '<div class="person-card-top"><span class="avatar" style="border-color:' + clr + ';color:' + clr + '">' + esc(n.slice(0, 1)) + '</span><div class="person-meta"><h3>' + esc(n) + (i === 0 ? ' · 我' : '') + '</h3><span class="badge-tag">' + level(n) + ' · 自律 ' + mHb.done + '/' + mHb.total + '</span></div>'
        + '<span class="status-chip ' + ((doneS && doneL) ? 'is-done' : '') + '">' + icon((doneS && doneL) ? 'check' : 'clock') + (doneS && doneL ? '双轨完成' : doneS ? '已跑待学' : doneL ? '已学待跑' : '待出发') + '</span>'
        + (i > 0 ? '<button class="remove-person" data-action="remove-person" data-value="' + esc(n) + '" aria-label="移除伙伴 ' + esc(n) + '">×</button>' : '')
        + '</div>'
        + '<div class="person-stats"><div><small>本月跑量</small><strong>' + mt.toFixed(1) + ' km</strong></div><div><small>本月学习</small><strong>' + stMt.toFixed(1) + ' h</strong></div><div><small>双轨连胜</small><strong>' + dualStreak(n) + ' 天</strong></div></div>'
        + '<div class="person-co-actions">'
        + '<button data-action="checkin" data-mode="sport" data-person="' + esc(n) + '">🏃 记运动</button>'
        + '<button data-action="checkin" data-mode="study" data-person="' + esc(n) + '">📚 记学习</button>'
        + '</div>'
        + '</div>';
    }).join('') + '</div></div>'
    + '<aside class="people-brief">'
    + '<div class="brief-sunrise-art"><svg viewBox="0 0 360 110" aria-hidden="true"><defs><pattern id="sun-grid" width="18" height="18" patternUnits="userSpaceOnUse"><path d="M18 0H0V18" fill="none" stroke="#9996" stroke-width=".25"/></pattern></defs><rect width="360" height="110" fill="url(#sun-grid)" opacity=".45"/><path d="M18 82H342" stroke="#262624" stroke-width="1.5"/><path d="M90 82A90 90 0 0 1 270 82" fill="rgba(229,73,43,.14)" stroke="#e5492b" stroke-width="2"/><circle cx="180" cy="82" r="24" fill="#e5492b"/><text x="180" y="102" text-anchor="middle" style="font:700 9px var(--mono);fill:#6e6d65">06:10 RUN  ·  08:30 STUDY  ·  PK</text></svg></div>'
    + '<div class="brief-head">' + icon('target') + '<div><strong>明日双轨行动清单</strong><small>跑步 ' + nextRun() + ' · 学习 ' + nextStudy() + '</small></div></div>'
    + '<ul class="prep-list">'
    + '<li><span>01</span><div><strong>睡前备好跑鞋与耳机</strong><small>闹钟一响即刻出发，不给赖床留余地</small></div></li>'
    + '<li><span>02</span><div><strong>列出明日首项学习目标</strong><small>早间精力最佳，优先攻克最难的核心章节</small></div></li>'
    + '<li><span>03</span><div><strong>手机隔离开启番茄钟</strong><small>专注块内关闭消息弹窗，守住心流</small></div></li>'
    + '<li><span>04</span><div><strong>和伙伴互相督促打卡</strong><small>点卡面上「记运动 / 记学习」即可帮同组搭子代记 PK</small></div></li>'
    + '</ul>'
    + '<a class="brief-film-link" href="film.html">' + icon('spark') + ' 观看 30 秒晨跑品牌动效 →</a>'
    + '</aside></div>';
}

const renderers = { home, progress, plan, study, ranking, achievements, records: recordsPage, people };
function render(preserveScroll = false) {
  const page = $('#page');
  const prevTop = preserveScroll && page ? page.scrollTop : 0;
  updateHeader();
  page.dataset.page = view;
  page.innerHTML = '<div class="' + (preserveScroll ? 'page-stay' : 'page-enter') + '" style="display:flex;flex-direction:column;flex:1;min-height:0">' + renderers[view]() + '</div>';
  if (preserveScroll) page.scrollTop = prevTop;
  $('.bottom-nav').innerHTML = nav.map(([id, label, ico], i) => '<button data-view="' + id + '" class="' + (id === view ? 'active' : '') + '" ' + (id === view ? 'aria-current="page"' : '') + '>' + icon(ico, 'nav-ico') + '<span class="nav-label"><small>' + pad(i + 1) + '</small>' + label + '</span></button>').join('');
  clearInterval(quoteTimer);
  if (view === 'home' && !matchMedia('(prefers-reduced-motion: reduce)').matches) quoteTimer = setInterval(nextQuote, 7000);
}
function nextQuote() { quoteIndex = (quoteIndex + 1) % quotes.length; const el = $('#quote'); if (el) el.outerHTML = quoteMarkup(); initPixelMatrices(); }
function navigate(v) {
  if (!VALID_VIEWS.includes(v)) v = 'home';
  view = v;
  if (typeof location !== 'undefined' && location.hash !== '#' + v) {
    try { history.replaceState(null, '', '#' + v); } catch { location.hash = v; }
  }
  render(false);
  $('#page').scrollTop = 0;
  $('#page').focus({ preventScroll: true });
}
window.addEventListener('hashchange', () => {
  const hv = location.hash.replace(/^#/, '').split('?')[0];
  if (VALID_VIEWS.includes(hv) && hv !== view) navigate(hv);
});

function openEditor(title, body, onSave, button = '保存 →') {
  dialogSave = onSave;
  $('#editor-title').textContent = title;
  $('#editor-body').innerHTML = body;
  $('#editor-save').textContent = button;
  $('#editor-save').hidden = !onSave;
  if (!$('#editor').open) $('#editor').showModal();
}
$('#editor-close')?.addEventListener('click', () => { pendingImportBackup = null; $('#editor').close('cancel'); });
$('#editor-cancel')?.addEventListener('click', () => { pendingImportBackup = null; $('#editor').close('cancel'); });
$('#editor-form').addEventListener('submit', async e => {
  if (dialogSave) {
    e.preventDefault();
    const res = await dialogSave();
    if (res !== false) $('#editor').close('save');
  }
});
$('#rename').onclick = () => openEditor('你的个人昵称', '<label for="name-input">在运动跑道与学习档案中，怎么称呼你？</label><input id="name-input" value="' + esc(state.name) + '" maxlength="12" required autocomplete="nickname">', () => {
  const name = $('#name-input').value.trim();
  if (!name) { $('#name-input').focus(); return false; }
  if (state.members.includes(name)) { toast('这个名字已在伙伴名单里。'); return false; }
  state.records.forEach(r => { if (r.person === state.name) r.person = name; });
  state.studyRecords.forEach(r => { if (r.person === state.name) r.person = name; });
  const oldName = state.name;
  state.name = name; persist(); render(true); toast('新名字，新起点。');
  if (isServerOnline) serverFetch('/rename', 'POST', { oldName, newName: name });
});

function openPixelProgressDemoModal() {
  const milestones = [
    { label: '0% · 纯白轨道 #FFFFFF（隐藏填充与尾迹）', progress: 0, height: 24, variant: 'orange', state: 'loading' },
    { label: '25% · 运动主题橙红 (#E5492B)', progress: 25, height: 24, variant: 'orange', state: 'loading' },
    { label: '60% · 学习主题深蓝 (#203F91)', progress: 60, height: 24, variant: 'blue', state: 'loading' },
    { label: '90% · 自律主题琥珀金 (#E4A334)', progress: 90, height: 24, variant: 'gold', state: 'loading' },
    { label: '100% · 竞技主题墨黑 (#262624 · 完整终态)', progress: 100, height: 24, variant: 'ink', state: 'success' },
    { label: 'paused · Claude 赤陶暖棕 (#D97757)', progress: 62, height: 24, variant: 'claude', state: 'paused' },
    { label: 'error · 异常断点文字提示', progress: 38, height: 24, variant: 'orange', state: 'error', errorText: '同步校对异常：已保留 38% 本地进度' },
    { label: 'indeterminate · 未知真实进度循环态', progress: 0, height: 24, variant: 'blue', state: 'indeterminate' }
  ];
  const ringMilestones = [
    { p: 0, v: 'orange', lbl: '0% 纯白底' },
    { p: 25, v: 'orange', lbl: '25% 运动橙' },
    { p: 60, v: 'blue', lbl: '60% 学习蓝' },
    { p: 90, v: 'gold', lbl: '90% 自律金' },
    { p: 100, v: 'ink', lbl: '100% 竞技墨' }
  ];
  const bodyHtml = '<div class="ppb-demo-modal">'
    + '<p class="hint" style="margin:0 0 12px">纯白轨道 #FFFFFF · 网页多主题色系（运动红橙 #E5492B / 学习深蓝 #203F91 / 自律琥珀金 #E4A334 / 竞技墨黑 #262624 / Claude 赤陶 #D97757） · 6行阶梯 + 4×4px闪烁像素 + 6px后方柔光。</p>'
    + '<div class="ppb-demo-list">' + milestones.map(m => PixelProgressBar.renderHtml(m)).join('') + '</div>'
    + '<div class="ppb-demo-ctrl">'
    + '<label><span>手动调整交互条：<strong id="ppb-m-pct-lbl">60%</strong> · 高度 <strong id="ppb-m-h-lbl">24px</strong></span></label>'
    + '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">'
    + '<input type="range" id="ppb-m-slider" min="0" max="100" value="60" style="flex:1;min-width:120px">'
    + '<select id="ppb-m-variant"><option value="orange">运动红橙 (#E5492B)</option><option value="blue">学习深蓝 (#203F91)</option><option value="gold">自律琥珀金 (#E4A334)</option><option value="ink">竞技墨黑 (#262624)</option><option value="claude">Claude 赤陶 (#D97757)</option></select>'
    + '<select id="ppb-m-h"><option value="12">12px</option><option value="18">18px</option><option value="24" selected>24px</option></select>'
    + '<select id="ppb-m-state"><option value="loading">loading</option><option value="paused">paused</option><option value="success">success</option><option value="error">error</option><option value="indeterminate">indeterminate</option></select>'
    + '</div>'
    + '<div id="ppb-m-live" style="margin-top:10px"></div>'
    + '<div id="ppb-m-rings" style="margin-top:14px;display:flex;gap:12px;flex-wrap:wrap;justify-content:space-around;padding-top:12px;border-top:1px solid #393530">'
    + ringMilestones.map(rm => PixelProgressBar.renderRingHtml({ progress: rm.p, variant: rm.v, size: 96, thickness: 18, state: rm.p === 100 ? 'success' : 'loading', label: rm.lbl, showStatus: false })).join('')
    + '</div>'
    + '</div></div>';
  openEditor('PixelProgressBar · 网页主题多色像素能量条与圆环', bodyHtml, null);
  const liveOpts = { label: '可交互示例（250ms 平滑过渡）', progress: 60, height: 24, variant: 'orange', state: 'loading', errorText: '连接超时：保留当前断点' };
  const liveEl = PixelProgressBar.mount($('#ppb-m-live'), liveOpts);
  const syncLive = () => {
    PixelProgressBar.update(liveEl, liveOpts);
    $('#ppb-m-pct-lbl').textContent = liveOpts.state === 'indeterminate' ? '未知' : (liveOpts.state === 'success' ? '100%' : liveOpts.progress + '%');
    $('#ppb-m-h-lbl').textContent = liveOpts.height + 'px';
  };
  $('#ppb-m-slider')?.addEventListener('input', e => {
    liveOpts.progress = Number(e.target.value);
    if (liveOpts.state === 'indeterminate' || liveOpts.state === 'success') { liveOpts.state = 'loading'; $('#ppb-m-state').value = 'loading'; }
    syncLive();
  });
  $('#ppb-m-variant')?.addEventListener('change', e => { liveOpts.variant = e.target.value; syncLive(); });
  $('#ppb-m-h')?.addEventListener('change', e => { liveOpts.height = Number(e.target.value); syncLive(); });
  $('#ppb-m-state')?.addEventListener('change', e => {
    liveOpts.state = e.target.value;
    if (liveOpts.state === 'success') { liveOpts.progress = 100; $('#ppb-m-slider').value = '100'; }
    syncLive();
  });
}

$('#open-settings').onclick = () => {
  const modeBadge = isServerOnline
    ? '<div style="margin-bottom:12px;padding:8px 12px;background:#eef7ed;border:1px solid #7bc676;color:#1e4620;font-size:12px;display:flex;align-items:center;justify-content:space-between"><span><strong>● 在线后端已连接</strong> (房间: ' + esc(currentRoomCode) + ')</span><button type="button" id="btn-sync-to-cloud" style="border:1px solid #7bc676;background:#fff;padding:2px 8px;font-size:11px;cursor:pointer">将本地缓存推送到云端 ↑</button></div>'
    : '<div style="margin-bottom:12px;padding:8px 12px;background:#fff8ee;border:1px solid #e4a334;color:#7a4b04;font-size:12px"><strong>○ 离线模式 (localStorage)</strong><br><small>双击打开网页.cmd 或纯本地使用；启动后端后刷新即享 SQLite 真持久化与云端多人同步。</small></div>';

  openEditor('RUN & STUDY / 设置与云端', modeBadge + '<p class="hint">支持在线 SQLite 真持久化与离线本地缓存自适应双模式。数据可随时导出备份。</p><button type="button" class="settings-link" id="export-data">↗ 导出完整数据备份 .json</button><label for="import-data">从备份恢复（将替换当前数据）</label><input id="import-data" type="file" accept=".json,application/json"><button type="button" class="settings-link" id="open-ppb-demo">🧩 像素进度条组件演示 (0%–100% / 不确定状态)</button><a class="settings-link" href="pixel-progress-demo.html" target="_blank">↗ 在独立窗口打开完整组件演示页</a><a class="settings-link" href="film.html">▶ 播放 30 秒品牌动效</a><button type="button" class="settings-link" id="download-poster">↓ 保存今日双轨打卡海报 .png</button><button type="button" class="settings-link danger" id="clear-records">清空当前运动与学习记录</button>', null);
};

function downloadBlob(blob, name) {
  const a = document.createElement('a'), url = URL.createObjectURL(blob);
  a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function exportData() {
  const payload = {
    ...state,
    schemaVersion: 2,
    exportedAt: new Date().toISOString(),
    unitNote: 'sport: km/minutes; study: hours/minutes/seconds; timezone: Asia/Shanghai'
  };
  downloadBlob(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }), 'run-study-log-' + today() + '.json');
  toast('完整备份已导出 (schemaVersion: 2)。');
}
function validateBackup(s) {
  return s && (s.version === 1 || s.schemaVersion === 2) && typeof s.name === 'string' && s.name.length > 0 && s.name.length <= 12
    && Number.isFinite(s.goal) && s.goal >= 5 && s.goal <= 10000
    && Array.isArray(s.days) && s.days.every(d => Number.isInteger(d) && d >= 0 && d <= 6)
    && Array.isArray(s.members) && s.members.every(n => typeof n === 'string' && n.length <= 12)
    && Array.isArray(s.records);
}
function applyConfirmedBackupImport(backup) {
  state = hydrateState(backup);
  persistLocalOnly();
  if (isServerOnline) serverFetch('/import', 'POST', backup);
  pendingImportBackup = null;
  $('#editor').close();
  render();
  toast('数据已恢复。');
}
document.addEventListener('change', async e => {
  if (e.target.id === 'pomo-target-sel') {
    pomodoroTargetId = e.target.value;
    pomoSession.targetId = pomodoroTargetId;
    savePomoSession();
    return;
  }
  if (e.target.id !== 'import-data') return;
  try {
    const file = e.target.files[0]; if (!file || file.size > 8e6) throw Error();
    const backup = JSON.parse(await file.text()); if (!validateBackup(backup)) throw Error();
    pendingImportBackup = backup;
    const host = $('#editor-body');
    const oldPrev = host.querySelector('.import-preview-card');
    if (oldPrev) oldPrev.remove();
    const prev = document.createElement('div');
    prev.className = 'import-preview-card';
    prev.innerHTML = '<strong>导入前校验预览</strong>'
      + '<div>将替换恢复：用户「' + esc(backup.name) + '」 · 运动 ' + backup.records.length + ' 条 · 学习 ' + (backup.studyRecords || []).length + ' 条 · 伙伴 ' + backup.members.length + ' 位</div>'
      + '<div class="ip-actions"><button type="button" id="export-before-import">先导出当前备份</button><button type="button" class="ip-confirm" id="confirm-import-btn">确认替换恢复 →</button><button type="button" id="cancel-import-btn">取消</button></div>';
    host.appendChild(prev);
  } catch { pendingImportBackup = null; toast('无法读取备份，请选择有效的 JSON 数据文件。'); }
});

function poster() {
  const c = document.createElement('canvas'); c.width = 1080; c.height = 1440;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#f2f1e8'; ctx.fillRect(0, 0, 1080, 1440);
  ctx.fillStyle = '#203f91'; ctx.fillRect(0, 150, 1080, 850);
  ctx.fillStyle = '#262624'; ctx.font = 'bold 44px Bahnschrift, Arial'; ctx.fillText('↗ RUN & STUDY LOG', 65, 95);
  ctx.font = '24px monospace'; ctx.fillText(today(), 780, 95);
  ctx.fillStyle = '#f2f1e8'; ctx.font = '900 96px Bahnschrift, Arial'; ctx.fillText('SMALL STEPS.', 65, 460);
  ctx.fillStyle = '#e4a334'; ctx.fillText('EVERY DAY.', 65, 570);
  const r = mine()[0], s = mineStudy()[0];
  ctx.save(); ctx.translate(70, 790); ctx.rotate(-.06);
  ctx.fillStyle = '#f2f1e8'; ctx.fillRect(0, 0, 920, 165);
  ctx.strokeStyle = '#e5492b'; ctx.lineWidth = 4; ctx.strokeRect(10, 10, 900, 145);
  ctx.fillStyle = '#e5492b'; ctx.font = '900 70px Bahnschrift, Arial';
  ctx.fillText((r?.km || 0).toFixed(1) + ' KM   |   ' + (s?.hours || 0).toFixed(1) + ' H STUDY', 32, 105);
  ctx.restore();
  ctx.fillStyle = '#262624'; ctx.font = '46px Georgia, serif'; ctx.fillText(state.name + ' · 运动 · 学习 · 自律', 65, 1135);
  ctx.font = '26px monospace'; ctx.fillText('CHECK IN / ' + today(), 65, 1210);
  ctx.strokeStyle = '#262624'; ctx.beginPath(); ctx.moveTo(65, 1290); ctx.lineTo(1015, 1290); ctx.stroke();
  ctx.font = '24px Bahnschrift, Arial'; ctx.fillText('RUN · STUDY · SELF-DISCIPLINE', 65, 1355);
  c.toBlob(b => { if (b) downloadBlob(b, 'run-study-poster-' + today() + '.png'); }, 'image/png');
}

/* ---------- Pomodoro Engine (Wall-Clock Persistent) & Record Edit Modal ---------- */
function syncPomoClock() {
  const elapsed = getPomoElapsedSec();
  const left = getPomoLeftSec();
  pomodoroLeft = left;
  const el = $('#pomo-clock');
  if (el) el.textContent = formatTimer(left);
  const hint = $('#pomo-elapsed-hint');
  if (hint) hint.textContent = '本轮已投入：' + Math.floor(elapsed / 60) + '分' + (elapsed % 60) + '秒 · 满 60 秒可精确记入';
  const finBtn = $('[data-action="pomo-finish"]');
  if (finBtn) finBtn.disabled = elapsed < 60 || pomoSession.state === 'saving';
}
function stopPomodoro(newState = 'paused') {
  clearInterval(pomodoroTick);
  pomodoroTick = null;
  pomodoroRunning = false;
  if (pomoSession.state === 'running' && newState === 'paused') {
    pomoSession.state = 'paused';
    pomoSession.pauseStartedAt = Date.now();
  } else if (newState) {
    pomoSession.state = newState;
  }
  savePomoSession();
}
function startPomodoroLoop() {
  clearInterval(pomodoroTick);
  pomodoroTick = setInterval(() => {
    const left = getPomoLeftSec();
    syncPomoClock();
    if (left <= 0) {
      stopPomodoro('completed');
      pomoSession.completedAt = Date.now();
      savePomoSession();
      toast('计时结束！请点击「记入学习 ✓」保存本轮专注。');
      render(true);
    }
  }, 500);
}
if (pomoSession.state === 'running') {
  if (getPomoLeftSec() <= 0) {
    pomoSession.state = 'completed';
    pomoSession.completedAt = pomoSession.startedAt + pomoSession.pausedAccumMs + pomoSession.totalSec * 1000;
    savePomoSession();
  } else {
    startPomodoroLoop();
  }
}

function openRecordEditModal(key) {
  const [kind, idStr] = key.split(':'), id = Number(idStr);
  const arr = kind === 'study' ? state.studyRecords : state.records;
  const rec = arr.find(x => x.id === id);
  if (!rec) return;
  const isStudy = kind === 'study';
  const tagsPool = isStudy ? studyTags : tags;
  const feelsPool = isStudy ? studyFocusLevels : feelings;
  const body = '<div class="record-edit-form">'
    + '<div class="form-grid-2">'
    + '<div class="field-group"><label for="er-date">日期</label><input id="er-date" type="date" value="' + esc(rec.date) + '"></div>'
    + '<div class="field-group"><label for="er-time">时间</label><input id="er-time" type="time" value="' + esc(rec.time || '06:10') + '"></div>'
    + '</div>'
    + '<div class="form-grid-2">'
    + (isStudy
      ? '<div class="field-group"><label for="er-target">所属学习目标</label><select id="er-target">' + state.studyTargets.map(t => '<option value="' + esc(t.id) + '" ' + (t.id === rec.targetId ? 'selected' : '') + '>' + esc(t.title) + '</option>').join('') + '</select></div>'
        + '<div class="field-group"><label for="er-min">专注时长（分钟，1–960）</label><input id="er-min" type="number" min="1" max="960" value="' + esc(rec.minutes || Math.round((rec.hours || 1) * 60)) + '"></div>'
      : '<div class="field-group"><label for="er-km">距离（km）</label><input id="er-km" type="number" min="0.05" max="300" step="0.01" value="' + esc(rec.km) + '"></div>'
        + '<div class="field-group"><label for="er-min">时长（分钟）</label><input id="er-min" type="number" min="1" max="1440" value="' + esc(rec.minutes) + '"></div>')
    + '</div>'
    + '<div class="field-group"><label for="er-feel">' + (isStudy ? '专注度' : '体感') + '</label><select id="er-feel">' + feelsPool.map((f, idx) => '<option value="' + idx + '" ' + (idx === (rec.feel ?? rec.focus ?? 3) ? 'selected' : '') + '>' + f[0] + ' ' + f[1] + '</option>').join('') + '</select></div>'
    + '<div class="field-group"><label for="er-tags">标签（逗号分隔，可用：' + tagsPool.slice(0, 4).join('、') + '）</label><input id="er-tags" value="' + esc((rec.tags || []).join(', ')) + '"></div>'
    + '<div class="field-group"><label for="er-note">备注</label><textarea id="er-note" maxlength="240">' + esc(rec.note || '') + '</textarea></div>'
    + '</div>';

  openEditor(isStudy ? '编辑学习记录 #' + id : '编辑运动记录 #' + id, body, async () => {
    const dateVal = $('#er-date').value;
    const timeVal = $('#er-time').value || rec.time || '06:10';
    const minVal = Math.round(Number($('#er-min').value));
    const feelVal = Number($('#er-feel').value);
    const noteVal = $('#er-note').value.trim();
    const tagsVal = $('#er-tags').value.split(/[,，]/).map(s => s.trim()).filter(Boolean);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateVal)) { toast('请输入有效日期'); return false; }
    if (!Number.isFinite(minVal) || minVal < 1 || minVal > 1440) { toast('时长需在有效范围内'); return false; }

    let patchPayload = { date: dateVal, time: timeVal, minutes: minVal, note: noteVal, tags: tagsVal };
    if (isStudy) {
      if (minVal > 960) { toast('单条学习不超过 960 分钟'); return false; }
      const newTid = $('#er-target').value;
      const hoursVal = Math.round((minVal / 60) * 100) / 100;
      const tObj = state.studyTargets.find(t => t.id === newTid);
      patchPayload = { ...patchPayload, targetId: newTid, subject: tObj?.title || rec.subject, hours: hoursVal, seconds: minVal * 60, focus: feelVal };
    } else {
      const kmVal = Math.round(Number($('#er-km').value) * 100) / 100;
      if (!Number.isFinite(kmVal) || kmVal < 0.05 || kmVal > 300) { toast('距离需在 0.05–300 km 之间'); return false; }
      patchPayload = { ...patchPayload, km: kmVal, feel: feelVal };
    }

    if (isServerOnline) {
      const res = await serverFetch('/records/' + kind + '/' + id, 'PATCH', patchPayload);
      if (!res.ok) { toast(res.error || '编辑失败'); return false; }
      Object.assign(rec, res.record || patchPayload);
    } else {
      Object.assign(rec, patchPayload);
    }
    recomputeStudyTargetDoneHours();
    persistLocalOnly();
    render(true);
    toast('记录已更新，统计与目标已同步重算！');
  }, '保存修改 →');
}

/* ---------- Global Event Delegation ---------- */
document.addEventListener('click', async e => {
  const navButton = e.target.closest('[data-view]'); if (navButton) { navigate(navButton.dataset.view); return; }
  if (e.target.closest('#btn-sync-to-cloud')) { syncLocalToCloud(); return; }
  if (e.target.closest('#open-ppb-demo')) { $('#editor').close(); openPixelProgressDemoModal(); return; }
  if (e.target.closest('#export-data') || e.target.closest('#export-before-import')) { exportData(); return; }
  if (e.target.closest('#confirm-import-btn')) { if (pendingImportBackup) applyConfirmedBackupImport(pendingImportBackup); return; }
  if (e.target.closest('#cancel-import-btn')) {
    pendingImportBackup = null;
    e.target.closest('.import-preview-card')?.remove();
    const inp = $('#import-data'); if (inp) inp.value = '';
    return;
  }
  if (e.target.closest('#download-poster')) { poster(); return; }
  if (e.target.closest('#clear-records')) {
    openEditor('清空打卡记录', '<p>确认清空运动与学习记录？目标与习惯清单会保留。</p>', async () => {
      if (isServerOnline) {
        const res = await serverFetch('/records', 'DELETE');
        if (!res.ok) { toast(res.error || '清空失败'); return false; }
      }
      state.records = []; state.studyRecords = [];
      recomputeStudyTargetDoneHours();
      persistLocalOnly();
      render();
      toast('记录已清空，新的旅程从这里开始。');
    }, '确认清空');
    return;
  }

  // Interactive Line Chart Node OR Linear Table Row -> Sync SVG Crosshair, Table Row & Side Card!
  const chartNode = e.target.closest('[data-chart-node]');
  const chartRow = e.target.closest('[data-chart-row]');
  if (chartNode || chartRow) {
    const key = chartNode ? chartNode.dataset.chartNode : chartRow.dataset.chartRow;
    const pt = currentChartNodesMap[key];
    if (pt) {
      selectedNodeKey = key;
      recordSelectKey = pt.recordKey;
      const stage = (chartNode || chartRow).closest('.chart-split-stage');
      const svg = stage ? stage.querySelector('svg.comp-line-svg') : document.querySelector('svg.comp-line-svg');
      if (svg) {
        svg.querySelectorAll('.chart-node-hit.is-selected').forEach(el => {
          el.classList.remove('is-selected');
          el.querySelector('.node-halo')?.remove();
          const sq = el.querySelector('.node-sq');
          const npt = currentChartNodesMap[el.dataset.chartNode];
          if (sq && npt) {
            sq.setAttribute('x', (npt.px - 3.5).toFixed(1));
            sq.setAttribute('y', (npt.py - 3.5).toFixed(1));
            sq.setAttribute('width', '7');
            sq.setAttribute('height', '7');
          }
        });
        const targetHit = [...svg.querySelectorAll('.chart-node-hit')].find(el => el.dataset.chartNode === key);
        if (targetHit) {
          targetHit.classList.add('is-selected');
          const sq = targetHit.querySelector('.node-sq');
          if (sq) {
            sq.setAttribute('x', (pt.px - 4.75).toFixed(1));
            sq.setAttribute('y', (pt.py - 4.75).toFixed(1));
            sq.setAttribute('width', '9.5');
            sq.setAttribute('height', '9.5');
            const halo = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            halo.setAttribute('class', 'node-halo');
            halo.setAttribute('x', (pt.px - 8).toFixed(1));
            halo.setAttribute('y', (pt.py - 8).toFixed(1));
            halo.setAttribute('width', '16');
            halo.setAttribute('height', '16');
            halo.setAttribute('fill', 'none');
            halo.setAttribute('stroke', pt.color);
            halo.setAttribute('stroke-width', '1.8');
            halo.setAttribute('opacity', '.72');
            targetHit.insertBefore(halo, sq);
          }
        }
        const ch = svg.querySelector('#chart-crosshair-layer');
        if (ch) ch.innerHTML = buildChartCrosshairSvg(pt);
      }
      if (stage) {
        stage.querySelectorAll('.linear-row.is-selected').forEach(r => r.classList.remove('is-selected'));
        const tRow = [...stage.querySelectorAll('.linear-row')].find(r => r.dataset.chartRow === key);
        if (tRow) tRow.classList.add('is-selected');
        const card = stage.querySelector('#node-detail-card');
        if (card) card.outerHTML = buildNodeDetailCardMarkup(pt);
      }
      enhanceTextStagger();
    }
    return;
  }

  const dot = e.target.closest('[data-point]');
  if (dot) {
    const svg = dot.closest('svg');
    if (svg) svg.querySelectorAll('[data-point].is-active').forEach(el => el.classList.remove('is-active'));
    dot.classList.add('is-active');
    selectedChartNote = dot.dataset.note || '';
    if (dot.dataset.record) recordSelectKey = dot.dataset.record;
    const noteEl = $('#chart-note');
    if (noteEl) {
      const recLink = dot.dataset.record ? ' <button class="note-jump-btn" data-action="open-record" data-value="' + esc(dot.dataset.record) + '">看小票 →</button>' : '';
      noteEl.innerHTML = icon('spark') + '<span>' + esc(selectedChartNote) + '</span>' + recLink;
    } else toast(selectedChartNote);
    return;
  }

  const qdot = e.target.closest('[data-quote]'); if (qdot) { e.stopPropagation(); quoteIndex = Number(qdot.dataset.quote); const el = $('#quote'); if (el) el.outerHTML = quoteMarkup(); initPixelMatrices(); syncMotion(); const qTheme = quotes[quoteIndex % quotes.length]?.[1]; if (qTheme === 'flame') triggerFlameSurge(950); else triggerLightningSurge(520); return; }
  if (e.target.closest('#quote')) { nextQuote(); syncMotion(); const qTheme = quotes[quoteIndex % quotes.length]?.[1]; if (qTheme === 'flame') triggerFlameSurge(950); else triggerLightningSurge(520); return; }
  if (!e.target.closest('button, a, input, [data-action]')) {
    if (e.target.closest('.poster-flame')) { triggerFlameSurge(1150); }
    else if (e.target.closest('.poster-lightning')) { triggerLightningSurge(950); }
  }

  const b = e.target.closest('[data-action]'); if (!b) return;
  const a = b.dataset.action, v = b.dataset.value;

  if (a === 'checkin') { openCheckin(b.dataset.mode || 'sport', b.dataset.target || null, b.dataset.person || state.name); return; }
  if (a === 'go-view') { navigate(v); return; }
  if (a === 'toggle-home-bp') { homeBpMode = homeBpMode === 'track' ? 'study' : 'track'; render(true); return; }
  if (a === 'radar-axis') { radarFocusAxis = v; render(true); toast('四维聚焦：' + v); return; }
  if (a === 'home-pick-target') { navigate('study'); toast('已定位到学习目标：' + findTargetTitle(v)); return; }
  if (a === 'bp-focus') { if (!focusAppleRing(v, b.closest('.apple-rings-panel'))) render(true); return; }
  if (a === 'open-ppb-demo') { openPixelProgressDemoModal(); return; }

  if (a === 'chart-person') { chartPersonFilter = v; selectedNodeKey = ''; render(true); return; }
  if (a === 'dual-chart-mode') { dualChartMode = v; selectedNodeKey = ''; render(true); return; }
  if (a === 'chart-scale') { chartScaleMode = v; selectedNodeKey = ''; render(true); return; }

  if (a === 'progress-tab') { progressTab = v; selectedChartNote = ''; selectedNodeKey = ''; render(true); return; }
  if (a === 'jump-cal') { selectedCalDate = v; progressTab = '28天三合一热力'; render(true); return; }
  if (a === 'select-cal') { selectedCalDate = v; render(true); return; }
  if (a === 'select-bar') { selectedBarDate = v; render(true); return; }
  if (a === 'select-bucket') {
    const [m, idxStr] = v.split(':'), idx = Number(idxStr);
    selectedBucket = (selectedBucket && selectedBucket.mode === m && selectedBucket.idx === idx) ? null : { mode: m, idx };
    render(true); return;
  }
  if (a === 'open-record') { recordSelectKey = v; navigate('records'); return; }

  if (a === 'rank-period') { rankPeriod = v; render(true); return; }
  if (a === 'rank-metric') { rankMetric = v; render(true); return; }
  if (a === 'rank-chart-mode') { rankChartMode = v === '学习专注对比' ? 'study' : 'sport'; selectedNodeKey = ''; render(true); return; }

  if (a === 'chart-type') { chartType = v; selectedChartNote = ''; render(true); return; }
  if (a === 'record-kind') { recordKindFilter = v === '运动' ? 'sport' : v === '学习' ? 'study' : 'all'; selectedChartNote = ''; selectedBucket = null; render(true); return; }
  if (a === 'ach-filter') { achFilter = v; render(true); return; }

  if (a === 'goal') { state.goal = Math.max(5, Math.min(10000, state.goal + Number(v))); persist(true); render(true); return; }
  if (a === 'goal-set') { state.goal = Number(v); persist(true); render(true); toast('本月运动目标已设为 ' + v + ' km'); return; }
  if (a === 'day') {
    const d = Number(v);
    state.days = state.days.includes(d) ? state.days.filter(x => x !== d) : [...state.days, d];
    if (state.sportDatePlan) Object.keys(state.sportDatePlan).forEach(dk => { if (new Date(dk + 'T12:00:00').getDay() === d) delete state.sportDatePlan[dk]; });
    persist(true); render(true); return;
  }
  if (a === 'toggle-sport-date') {
    state.sportDatePlan = state.sportDatePlan || {};
    state.sportDatePlan[v] = !isSportPlanned(v);
    persist(true); render(true); return;
  }

  if (a === 'study-goal') { state.studyGoal = Math.max(5, Math.min(1000, state.studyGoal + Number(v))); persist(true); render(true); return; }
  if (a === 'study-goal-set') { state.studyGoal = Number(v); persist(true); render(true); toast('本月学习目标已设为 ' + v + ' 小时'); return; }
  if (a === 'study-day') {
    const d = Number(v);
    state.studyDays = state.studyDays.includes(d) ? state.studyDays.filter(x => x !== d) : [...state.studyDays, d];
    if (state.studyDatePlan) Object.keys(state.studyDatePlan).forEach(dk => { if (new Date(dk + 'T12:00:00').getDay() === d) delete state.studyDatePlan[dk]; });
    persist(true); render(true); return;
  }
  if (a === 'toggle-study-date') {
    state.studyDatePlan = state.studyDatePlan || {};
    state.studyDatePlan[v] = !isStudyPlanned(v);
    persist(true); render(true); return;
  }

  if (a === 'quick-study') {
    const [tid, hStr] = v.split(':'); const hrs = Number(hStr);
    const tObj = state.studyTargets.find(x => x.id === tid);
    if (tObj) {
      const minutes = Math.round(hrs * 60);
      const qRec = {
        id: Date.now(), person: state.name, date: today(),
        time: pad(chinaNow().getHours()) + ':' + pad(chinaNow().getMinutes()),
        hours: hrs, minutes, seconds: minutes * 60, source: 'quick', operationId: nextOpId('quick'),
        focus: 3, targetId: tid, subject: tObj.title,
        note: '快捷专注记录 +' + hrs + 'h', tags: ['深度工作'], likes: 0, liked: false
      };
      if (isServerOnline) {
        const res = await serverFetch('/records/study', 'POST', qRec);
        if (!res.ok) { toast('保存失败：' + (res.error || '请稍后重试')); return; }
        if (res.record) Object.assign(qRec, res.record);
      }
      state.studyRecords.unshift(qRec);
      const hbArr = state.habitLogs[today()] || [];
      if (state.habits.some(h => h.id === 'hb-3') && !hbArr.includes('hb-3')) state.habitLogs[today()] = [...hbArr, 'hb-3'];
      recomputeStudyTargetDoneHours();
      persistLocalOnly(); render(true); triggerLightningSurge(2000); triggerFlameSurge(1800); celebrate(); toast('已为「' + tObj.title + '」记入 ' + hrs + ' 小时！');
    }
    return;
  }

  if (a === 'toggle-archived-targets') { showArchivedTargets = !showArchivedTargets; render(true); return; }
  if (a === 'toggle-archived-habits') { showArchivedHabits = !showArchivedHabits; render(true); return; }

  if (a === 'add-study-target') {
    openEditor('新建学习目标', '<div class="field-group"><label for="st-title">目标名称</label><input id="st-title" maxlength="24" placeholder="例如：高等数学刷题 / 英语精听" required></div><div class="field-group"><label for="st-cat">分类标签</label><input id="st-cat" maxlength="10" value="深度学习"></div><div class="field-group"><label for="st-hrs">本月目标小时数</label><input id="st-hrs" type="number" min="1" max="300" value="30"></div>', () => {
      const title = $('#st-title').value.trim(), cat = $('#st-cat').value.trim() || '深度学习', targetHours = Number($('#st-hrs').value) || 30;
      if (!title) { toast('请输入学习目标名称'); return false; }
      const colors = ['#203f91', '#e5492b', '#e4a334', '#262624'];
      const newT = { id: 'st-' + Date.now(), title, category: cat, targetHours: Math.max(1, targetHours), doneHours: 0, baseHours: 0, archived: false, color: colors[state.studyTargets.length % colors.length], deadline: '本月' };
      state.studyTargets.push(newT);
      persistLocalOnly(); render(true); toast('学习目标已创建！');
      if (isServerOnline) serverFetch('/study-targets', 'POST', newT);
    });
    return;
  }
  if (a === 'edit-study-target') {
    const t = state.studyTargets.find(x => x.id === v); if (!t) return;
    openEditor('编辑学习目标', '<div class="field-group"><label for="st-title">目标名称</label><input id="st-title" maxlength="24" value="' + esc(t.title) + '"></div><div class="field-group"><label for="st-cat">分类标签</label><input id="st-cat" maxlength="10" value="' + esc(t.category || '深度学习') + '"></div><div class="form-grid-2"><div class="field-group"><label for="st-hrs">目标小时</label><input id="st-hrs" type="number" min="1" max="500" value="' + t.targetHours + '"></div><div class="field-group"><label for="st-dead">周期</label><input id="st-dead" maxlength="12" value="' + esc(t.deadline || '本月') + '"></div></div>', () => {
      const title = $('#st-title').value.trim(); if (!title) return false;
      t.title = title; t.category = $('#st-cat').value.trim() || '深度学习'; t.targetHours = Math.max(1, Number($('#st-hrs').value) || t.targetHours); t.deadline = $('#st-dead').value.trim() || '本月';
      persistLocalOnly(); render(true); toast('学习目标已更新');
      if (isServerOnline) serverFetch('/study-targets/' + t.id, 'PATCH', { title: t.title, category: t.category, targetHours: t.targetHours, deadline: t.deadline });
    });
    return;
  }
  if (a === 'archive-study-target') {
    const t = state.studyTargets.find(x => x.id === v); if (!t) return;
    t.archived = !t.archived;
    persistLocalOnly(); render(true);
    toast(t.archived ? '目标已归档（关联历史记录保留）' : '目标已恢复在研');
    if (isServerOnline) serverFetch('/study-targets/' + t.id, 'PATCH', { archived: t.archived });
    return;
  }
  if (a === 'del-study-target') {
    if (state.studyTargets.length <= 1) { toast('至少保留一个学习目标'); return; }
    state.studyTargets = state.studyTargets.filter(t => t.id !== v);
    persistLocalOnly(); render(true); toast('已移除该学习目标');
    if (isServerOnline) serverFetch('/study-targets/' + v, 'DELETE');
    return;
  }

  if (a === 'pomo-set') {
    if (pomoSession.state === 'running') { toast('请先暂停当前专注再切换时长'); return; }
    const sec = Number(v) * 60;
    pomodoroTotal = sec; pomodoroLeft = sec;
    pomoSession = { sessionId: nextOpId('pomo'), targetId: pomodoroTargetId, totalSec: sec, state: 'idle', startedAt: 0, pausedAccumMs: 0, pauseStartedAt: 0, completedAt: 0, errorMsg: '' };
    savePomoSession(); render(true); return;
  }
  if (a === 'pomo-toggle') {
    if (pomoSession.state === 'running') {
      stopPomodoro('paused'); render(true);
    } else {
      if (pomoSession.state === 'idle' || pomoSession.state === 'saved' || pomoSession.state === 'completed') {
        pomoSession.sessionId = nextOpId('pomo');
        pomoSession.startedAt = Date.now();
        pomoSession.pausedAccumMs = 0;
        pomoSession.pauseStartedAt = 0;
        pomoSession.completedAt = 0;
      } else if (pomoSession.state === 'paused' && pomoSession.pauseStartedAt) {
        pomoSession.pausedAccumMs += Math.max(0, Date.now() - pomoSession.pauseStartedAt);
        pomoSession.pauseStartedAt = 0;
      }
      pomoSession.targetId = pomodoroTargetId;
      pomoSession.state = 'running';
      pomoSession.errorMsg = '';
      pomodoroRunning = true;
      savePomoSession();
      startPomodoroLoop();
      render(true);
    }
    return;
  }
  if (a === 'pomo-reset') {
    const elapsed = getPomoElapsedSec();
    if (elapsed >= 60) {
      openEditor('重置当前专注计时？', '<p>当前已投入 <strong>' + Math.floor(elapsed / 60) + '分' + (elapsed % 60) + '秒</strong>。重置将放弃本轮未保存计时，不会删除历史已保存记录。</p>', () => {
        stopPomodoro('idle');
        pomoSession = { sessionId: nextOpId('pomo'), targetId: pomodoroTargetId, totalSec: pomoSession.totalSec, state: 'idle', startedAt: 0, pausedAccumMs: 0, pauseStartedAt: 0, completedAt: 0, errorMsg: '' };
        pomodoroLeft = pomoSession.totalSec;
        savePomoSession(); render(true); toast('计时器已重置');
      }, '确认重置');
      return;
    }
    stopPomodoro('idle');
    pomoSession = { sessionId: nextOpId('pomo'), targetId: pomodoroTargetId, totalSec: pomoSession.totalSec, state: 'idle', startedAt: 0, pausedAccumMs: 0, pauseStartedAt: 0, completedAt: 0, errorMsg: '' };
    pomodoroLeft = pomoSession.totalSec;
    savePomoSession(); render(true); return;
  }
  if (a === 'pomo-finish') {
    const elapsedSec = getPomoElapsedSec();
    if (elapsedSec < 60) { toast('专注不足 60 秒（当前 ' + elapsedSec + ' 秒），满 60 秒后可记入'); return; }
    if (pomoSession.state === 'saving') return;
    stopPomodoro('saving');
    pomoSession.errorMsg = '';
    savePomoSession(); render(true);

    const tObj = state.studyTargets.find(x => x.id === pomodoroTargetId) || state.studyTargets[0];
    const minutes = Math.max(1, Math.round(elapsedSec / 60));
    const hrs = Math.round((elapsedSec / 3600) * 100) / 100;
    const pRec = {
      id: Date.now(), person: state.name, date: today(),
      time: pad(chinaNow().getHours()) + ':' + pad(chinaNow().getMinutes()),
      hours: hrs, minutes, seconds: elapsedSec, source: 'pomodoro',
      sessionId: pomoSession.sessionId, operationId: pomoSession.sessionId,
      focus: 4, targetId: tObj?.id || 'st-1', subject: tObj?.title || '番茄专注',
      note: '实测番茄专注 ' + Math.floor(elapsedSec / 60) + ' 分 ' + (elapsedSec % 60) + ' 秒。',
      tags: ['番茄钟', '无手机'], likes: 0, liked: false
    };
    if (isServerOnline) {
      const res = await serverFetch('/records/study', 'POST', pRec);
      if (!res.ok) {
        pomoSession.state = 'paused';
        pomoSession.errorMsg = '服务器保存失败：' + (res.error || '请稍后重试') + '（已保留计时）';
        savePomoSession(); render(true);
        toast('保存失败，当前专注已保留');
        return;
      }
      if (res.record) Object.assign(pRec, res.record);
    }
    if (!state.studyRecords.some(r => r.sessionId === pRec.sessionId || r.id === pRec.id)) {
      state.studyRecords.unshift(pRec);
    }
    const hbArr = state.habitLogs[today()] || [];
    if (state.habits.some(h => h.id === 'hb-3') && !hbArr.includes('hb-3')) state.habitLogs[today()] = [...hbArr, 'hb-3'];
    recomputeStudyTargetDoneHours();
    persistLocalOnly();
    pomoSession = { sessionId: nextOpId('pomo'), targetId: pomodoroTargetId, totalSec: pomoSession.totalSec, state: 'idle', startedAt: 0, pausedAccumMs: 0, pauseStartedAt: 0, completedAt: 0, errorMsg: '' };
    pomodoroLeft = pomoSession.totalSec;
    savePomoSession(); render(true); triggerLightningSurge(2000); triggerFlameSurge(1800); celebrate();
    toast('专注保存成功！记入 ' + minutes + ' 分钟 (' + hrs.toFixed(2) + ' h)');
    return;
  }

  if (a === 'toggle-habit-date') {
    const [dk, hid] = v.split(':');
    const arr = state.habitLogs[dk] || [];
    state.habitLogs[dk] = arr.includes(hid) ? arr.filter(id => id !== hid) : [...arr, hid];
    persistLocalOnly(); render(true);
    if (isServerOnline) serverFetch('/habit-logs', 'PUT', { person: state.name, date: dk, habitIds: state.habitLogs[dk] });
    return;
  }
  if (a === 'toggle-habit') {
    const arr = state.habitLogs[today()] || [];
    state.habitLogs[today()] = arr.includes(v) ? arr.filter(id => id !== v) : [...arr, v];
    persistLocalOnly(); render(true);
    if (isServerOnline) serverFetch('/habit-logs', 'PUT', { person: state.name, date: today(), habitIds: state.habitLogs[today()] });
    return;
  }
  if (a === 'add-habit') {
    openEditor('新增每日自律习惯', '<div class="field-group"><label for="hb-title">习惯内容</label><input id="hb-title" maxlength="24" placeholder="例如：睡前阅读 30 分钟 / 不喝含糖饮料" required></div><div class="field-group"><label for="hb-tag">标签（2-4字）</label><input id="hb-tag" maxlength="6" value="自律"></div>', () => {
      const title = $('#hb-title').value.trim(), tag = $('#hb-tag').value.trim() || '自律';
      if (!title) { toast('请输入自律习惯内容'); return false; }
      const newH = { id: 'hb-' + Date.now(), title, tag, icon: 'bolt', archived: false };
      state.habits.push(newH);
      persistLocalOnly(); render(true); toast('新自律习惯已加入每日清单！');
      if (isServerOnline) serverFetch('/habits', 'POST', newH);
    });
    return;
  }
  if (a === 'edit-habit') {
    const h = state.habits.find(x => x.id === v); if (!h) return;
    openEditor('编辑自律习惯', '<div class="field-group"><label for="hb-title">习惯内容</label><input id="hb-title" maxlength="24" value="' + esc(h.title) + '"></div><div class="field-group"><label for="hb-tag">标签</label><input id="hb-tag" maxlength="6" value="' + esc(h.tag || '每日') + '"></div>', () => {
      const title = $('#hb-title').value.trim(); if (!title) return false;
      h.title = title; h.tag = $('#hb-tag').value.trim() || '每日';
      persistLocalOnly(); render(true); toast('习惯已更新');
      if (isServerOnline) serverFetch('/habits/' + h.id, 'PATCH', { title: h.title, tag: h.tag });
    });
    return;
  }
  if (a === 'move-habit') {
    const [hid, dirStr] = v.split(':'), dir = Number(dirStr);
    const idx = state.habits.findIndex(x => x.id === hid);
    const targetIdx = idx + dir;
    if (idx >= 0 && targetIdx >= 0 && targetIdx < state.habits.length) {
      const tmp = state.habits[idx];
      state.habits[idx] = state.habits[targetIdx];
      state.habits[targetIdx] = tmp;
      persistLocalOnly(); render(true);
      if (isServerOnline) serverFetch('/habits/order', 'PUT', { ids: state.habits.map(x => x.id) });
    }
    return;
  }
  if (a === 'archive-habit') {
    const h = state.habits.find(x => x.id === v); if (!h) return;
    h.archived = !h.archived;
    persistLocalOnly(); render(true);
    toast(h.archived ? '习惯已停用（历史记录保留）' : '习惯已恢复启用');
    if (isServerOnline) serverFetch('/habits/' + h.id, 'PATCH', { archived: h.archived });
    return;
  }
  if (a === 'del-habit') {
    state.habits = state.habits.filter(h => h.id !== v);
    persistLocalOnly(); render(true); toast('已移除该自律项');
    if (isServerOnline) serverFetch('/habits/' + v, 'DELETE');
    return;
  }

  if (a === 'toggle-tomorrow') {
    const dk = dateShift(1);
    state.sportDatePlan = state.sportDatePlan || {};
    state.sportDatePlan[dk] = !isSportPlanned(dk);
    persist(true); render(true); toast(state.sportDatePlan[dk] ? '已将明早加入跑步计划！' : '已将明早跑步设为休息日。'); return;
  }
  if (a === 'toggle-tomorrow-study') {
    const dk = dateShift(1);
    state.studyDatePlan = state.studyDatePlan || {};
    state.studyDatePlan[dk] = !isStudyPlanned(dk);
    persist(true); render(true); toast(state.studyDatePlan[dk] ? '已将明天加入学习计划！' : '已将明天学习设为休息日。'); return;
  }

  if (a === 'flip') { b.classList.toggle('flipped'); b.setAttribute('aria-pressed', b.classList.contains('flipped')); return; }

  const curList = allUnifiedRecords(recordKindFilter);
  const curIdx = Math.max(0, curList.findIndex(x => x._key === recordSelectKey));
  if (a === 'record-prev' && curIdx > 0) { recordSelectKey = curList[curIdx - 1]._key; render(true); return; }
  if (a === 'record-next' && curIdx < curList.length - 1) { recordSelectKey = curList[curIdx + 1]._key; render(true); return; }
  if (a === 'record-select') { recordSelectKey = v; render(true); return; }

  if (a === 'like-unified') {
    const [kind, idStr] = v.split(':'), id = Number(idStr);
    const arr = kind === 'study' ? state.studyRecords : state.records;
    const item = arr.find(x => x.id === id);
    if (item) {
      item.liked = !item.liked;
      item.likes = Math.max(0, (item.likes || 0) + (item.liked ? 1 : -1));
      persist(); render(true);
      if (isServerOnline) serverFetch('/records/' + kind + '/' + id + '/like', 'POST', { person: state.name });
    }
    return;
  }
  if (a === 'edit-unified') { openRecordEditModal(v); return; }
  if (a === 'delete-unified') {
    const [kind, idStr] = v.split(':'), id = Number(idStr);
    openEditor('删除这条打卡记录？', '<p>确认删除选中的' + (kind === 'study' ? '学习（将同步扣减关联目标小时）' : '运动') + '记录？统计图表将同步更新。</p>', async () => {
      if (isServerOnline) {
        const res = await serverFetch('/records/' + kind + '/' + id, 'DELETE');
        if (!res.ok) { toast(res.error || '删除失败'); return false; }
      }
      if (kind === 'study') state.studyRecords = state.studyRecords.filter(x => x.id !== id);
      else state.records = state.records.filter(x => x.id !== id);
      recomputeStudyTargetDoneHours();
      recordSelectKey = ''; selectedNodeKey = ''; persistLocalOnly(); render(true); toast('这条记录已删除。');
    }, '删除记录');
    return;
  }

  if (a === 'remove-person') {
    state.members = state.members.filter(m => m !== v);
    if (chartPersonFilter === v) chartPersonFilter = 'all';
    if (!state.members.length) { dualChartMode = 'personal-dual'; if (progressTab === '多人竞速曲线') progressTab = '双轨线性表'; }
    persist(); render(true); toast('已移除伙伴 ' + v);
    if (isServerOnline) serverFetch('/members/' + encodeURIComponent(v), 'DELETE');
    return;
  }
  if (a === 'add-person') openEditor('邀请一位自律同行伙伴', '<label for="person-name">伙伴名字</label><input id="person-name" maxlength="12" placeholder="怎么称呼 TA？" required><p class="hint">添加后即可在排行榜、进度PK、多人折线图与打卡弹窗中共同打卡。</p>', () => {
    const n = $('#person-name').value.trim();
    if (!n || allMembers().includes(n)) { toast('请输入一个不重复的伙伴名字。'); return false; }
    state.members.push(n); if (progressTab === '双轨线性表') progressTab = '多人竞速曲线'; persist(); render(true); toast('伙伴 ' + n + ' 已加入竞技名单！');
    if (isServerOnline) serverFetch('/members', 'POST', { name: n });
  });
});

/* ---------- Unified 5-Step Check-in Modal (Sport + Study + Multi-Person Co-Check-in) ---------- */
function openCheckin(mode = 'sport', targetId = null, personName = state.name) {
  modalPreviousFocus = document.activeElement;
  step = 0;
  const tid = targetId || state.studyTargets[0]?.id || 'st-1';
  const validPerson = allMembers().includes(personName) ? personName : state.name;
  draft = {
    mode,
    person: validPerson,
    km: 5,
    hours: 1.5,
    targetId: tid,
    minutes: mode === 'study' ? 90 : 30,
    feel: null,
    tags: [],
    note: '',
    photo: '',
    operationId: nextOpId('chk'),
    saving: false,
    time: pad(chinaNow().getHours()) + ':' + pad(chinaNow().getMinutes())
  };
  $('#app').inert = true; drawModal();
}
function closeCheckin() { draft = null; $('#modal-root').innerHTML = ''; $('#app').inert = false; modalPreviousFocus?.focus(); }

function readStep() {
  if (step === 1) {
    if (draft.mode === 'study') {
      const h = Number($('#hours-input').value);
      if (!Number.isFinite(h) || h < 0.2 || h > 16) { toast('学习时长请填 0.2–16 小时。'); return false; }
      draft.hours = Math.round(h * 10) / 10;
      draft.minutes = Math.round(draft.hours * 60);
      draft.targetId = $('#study-target-select')?.value || draft.targetId;
    } else {
      const n = Number($('#distance-input').value);
      if (!Number.isFinite(n) || n < .1 || n > 300) { toast('距离请填 0.1–300 km。'); return false; }
      draft.km = Math.round(n * 100) / 100;
    }
  }
  if (step === 2) {
    const n = Number($('#minutes-input').value);
    if (!Number.isFinite(n) || n < 1 || n > 1440) { toast('时长请填 1–1440 分钟。'); return false; }
    draft.minutes = Math.round(n); draft.time = $('#start-time').value || draft.time;
  }
  if (step === 3) {
    draft.note = $('#run-note').value.trim();
    if (draft.feel === null) { toast(draft.mode === 'study' ? '选一个今天的学习专注度吧。' : '选一个今天的跑步感觉吧。'); return false; }
  }
  return true;
}

function stepMarkup() {
  const isStudy = draft.mode === 'study';
  const modeBar = '<div class="modal-mode-switch">'
    + '<button type="button" class="' + (!isStudy ? 'active' : '') + '" data-modal="switch-mode" data-value="sport">🏃 运动打卡</button>'
    + '<button type="button" class="' + (isStudy ? 'active' : '') + '" data-modal="switch-mode" data-value="study">📚 学习打卡</button>'
    + '</div>'
    + '<div class="modal-person-row"><span>打卡人：</span>'
    + allMembers().map(m => '<button type="button" class="mp-pill ' + (draft.person === m ? 'active' : '') + '" style="--mclr:' + memberColor(m) + '" data-modal="switch-person" data-value="' + esc(m) + '">' + esc(m) + (m === state.name ? ' (我)' : '') + '</button>').join('')
    + '</div>';

  if (step === 0) {
    return modeBar + '<h3>SNAP</h3><p class="step-description">' + (isStudy ? '拍一张书桌笔记、自习室或学习界面截图。' : '拍张跑步照片，或者跑步 App 的截图。') + '</p>'
      + '<label class="photo-drop ' + (draft.photo ? 'has-photo' : '') + '" for="photo-file">' + (draft.photo ? '<img src="' + draft.photo + '" alt="已选打卡照片">' : '') + '<span class="camera-disc"><svg viewBox="0 0 36 36"><path d="M5 11h7l3-4h7l3 4h6v20H5z"/><circle cx="18" cy="21" r="7"/></svg></span><span>' + (draft.photo ? '点击更换照片' : '点这里选照片') + '</span></label>'
      + '<input type="file" id="photo-file" accept="image/*" hidden><input type="file" id="camera-file" accept="image/*" capture="environment" hidden>'
      + '<div class="photo-buttons"><button type="button" data-modal="camera">▣ 直接拍照</button><button type="button" data-modal="album">▧ 从相册选</button></div>'
      + '<button type="button" class="skip-photo" data-modal="next">先跳过照片，继续打卡 →</button>'
      + '<p class="hint">照片只保存在当前浏览器，可在记录档案中查看。</p>';
  }
  if (step === 1) {
    if (isStudy) {
      return modeBar + '<h3>STUDY HOURS</h3><p class="step-description">专注学习了多久？选择所属学习目标与时长。</p>'
        + '<select id="study-target-select" class="modal-target-select">' + state.studyTargets.map(t => '<option value="' + esc(t.id) + '" ' + (t.id === draft.targetId ? 'selected' : '') + '>目标：' + esc(t.title) + '</option>').join('') + '</select>'
        + '<input id="hours-input" class="big-input" type="number" min=".2" max="16" step=".1" value="' + draft.hours.toFixed(1) + '" aria-label="学习时长，小时"><div class="input-unit">HOURS</div>'
        + '<div class="segments">' + [-1, -0.5, 0.5, 1].map(n => '<button data-modal="hours-add" data-value="' + n + '">' + (n > 0 ? '+' : '') + n + '</button>').join('') + '</div>'
        + '<div class="pills">' + [0.5, 1, 1.5, 2, 3].map(n => '<button class="pill ' + (draft.hours === n ? 'selected' : '') + '" data-modal="hours-set" data-value="' + n + '">' + n + 'h</button>').join('') + '</div>';
    }
    return modeBar + '<h3>DISTANCE</h3><p class="step-description">跑了多远？点按钮调，或者选一个常用距离。</p>'
      + '<input id="distance-input" class="big-input" type="number" min=".1" max="300" step=".01" value="' + draft.km.toFixed(2) + '" aria-label="跑步距离，公里"><div class="input-unit">KILOMETERS</div>'
      + '<div class="segments">' + [-1, -.1, .1, 1].map(n => '<button data-modal="distance-add" data-value="' + n + '">' + (n > 0 ? '+' : '') + n + '</button>').join('') + '</div>'
      + '<div class="pills">' + [3, 5, 8, 10, 21.1].map(n => '<button class="pill ' + (draft.km === n ? 'selected' : '') + '" data-modal="distance-set" data-value="' + n + '">' + (n === 21.1 ? '半马' : n + 'K') + '</button>').join('') + '</div>';
  }
  if (step === 2) {
    return '<h3>TIME</h3><p class="step-description">' + (isStudy ? '确认实际投入分钟数与开始学习时间。' : '不必赶时间，跑出自己的节奏。') + '</p>'
      + '<input id="minutes-input" class="big-input" type="number" min="1" max="1440" step="1" value="' + draft.minutes + '" aria-label="时长，分钟"><div class="input-unit">MINUTES</div>'
      + '<div class="segments">' + [-15, -5, 5, 15].map(n => '<button data-modal="minutes-add" data-value="' + n + '">' + (n > 0 ? '+' : '') + n + ' min</button>').join('') + '</div>'
      + '<label class="hint" for="start-time" style="display:block;margin-top:25px">开始时间</label>'
      + '<input type="time" id="start-time" value="' + draft.time + '" style="margin-top:8px;width:100%;padding:10px;border:1px solid var(--ink);background:var(--paper-warm)">';
  }
  if (step === 3) {
    const fList = isStudy ? studyFocusLevels : feelings;
    const tList = isStudy ? studyTags : tags;
    return '<h3>' + (isStudy ? 'FOCUS' : 'FEEL') + '</h3><p class="step-description">' + (isStudy ? '这次学习的专注度如何？' : '今天跑得怎么样？') + '</p>'
      + '<div class="feel-options">' + fList.map((f, i) => '<button class="feel-option ' + (draft.feel === i ? 'selected' : '') + '" data-modal="feel" data-value="' + i + '" aria-pressed="' + (draft.feel === i) + '"><span>' + f[0] + '</span>' + f[1] + '</button>').join('') + '</div>'
      + '<div class="pills">' + tList.map(t => '<button class="pill ' + (draft.tags.includes(t) ? 'selected' : '') + '" data-modal="tag" data-value="' + t + '">' + t + '</button>').join('') + '</div>'
      + '<textarea class="note-input" id="run-note" maxlength="200" placeholder="' + (isStudy ? '写一句学习收获或复盘要点（可选）' : '一句话跑步感想（可选）') + '">' + esc(draft.note) + '</textarea>';
  }
  if (isStudy) {
    return '<h3>STUDY DONE.</h3><p class="step-description">为 <strong>' + esc(draft.person) + '</strong> 保存本次学习成果并更新排行榜。</p><div class="review-ticket is-study-ticket"><strong>' + draft.hours.toFixed(1) + ' <span style="font-size:25px;letter-spacing:0">hours</span></strong><small>' + today() + ' / ' + esc(draft.person) + ' · ' + esc(findTargetTitle(draft.targetId)) + '</small><dl><dt>专注时长</dt><dd>' + draft.minutes + ' MIN</dd><dt>番茄折算</dt><dd>' + Math.max(1, Math.round(draft.minutes / 25)) + ' 个</dd><dt>专注度</dt><dd>' + studyFocusLevels[draft.feel][0] + ' ' + studyFocusLevels[draft.feel][1] + '</dd><dt>照片</dt><dd>' + (draft.photo ? '已添加 ✓' : '本次无照片') + '</dd></dl></div>';
  }
  return '<h3>ONE MORE DONE.</h3><p class="step-description">为 <strong>' + esc(draft.person) + '</strong> 保存本次跑步里程并同步竞技曲线。</p><div class="review-ticket"><strong>' + draft.km.toFixed(2) + ' <span style="font-size:25px;letter-spacing:0">km</span></strong><small>' + today() + ' / ' + esc(draft.person) + '</small><dl><dt>时长</dt><dd>' + draft.minutes + ' MIN</dd><dt>配速</dt><dd>' + pace(draft) + ' /KM</dd><dt>感觉</dt><dd>' + feelings[draft.feel][0] + ' ' + feelings[draft.feel][1] + '</dd><dt>照片</dt><dd>' + (draft.photo ? '已添加 ✓' : '本次无照片') + '</dd></dl></div>';
}

function drawModal() {
  const root = $('#modal-root');
  root.innerHTML = '<div class="modal-overlay"><section class="checkin-modal" role="dialog" aria-modal="true" aria-labelledby="checkin-heading"><div class="modal-header"><h2 id="checkin-heading"><small>[' + (draft.mode === 'study' ? 'STUDY' : 'RUN') + ' · 0' + (step + 1) + '/05]</small> ' + (draft.mode === 'study' ? '学习打卡' : '运动打卡') + ' · ' + esc(draft.person) + '</h2><button class="close-modal" data-modal="close" aria-label="关闭打卡">×</button></div><div class="steps" aria-label="第 ' + (step + 1) + ' 步，共 5 步">' + Array.from({ length: 5 }, (_, i) => '<i class="' + (i <= step ? 'done' : '') + '"></i>').join('') + '</div><div class="step-content">' + stepMarkup() + '</div><div class="step-footer"><button data-modal="back">' + (step ? '‹ 返回' : '‹ 取消') + '</button><button data-modal="' + (step === 4 ? 'save' : 'next') + '" ' + (step === 3 && draft.feel === null ? 'disabled' : '') + '>' + (step === 4 ? '完成打卡 ✓' : '下一步 ›') + '</button></div></section></div>';
  $('.close-modal').focus({ preventScroll: true });
}

$('#modal-root').addEventListener('click', async e => {
  const b = e.target.closest('[data-modal]'); if (!b) return;
  const a = b.dataset.modal, v = b.dataset.value;
  if (a === 'close') closeCheckin();
  if (a === 'switch-mode') {
    draft.mode = v; draft.feel = null; draft.tags = [];
    if (v === 'study' && draft.minutes === 30) draft.minutes = 90;
    if (v === 'sport' && draft.minutes === 90) draft.minutes = 30;
    drawModal();
  }
  if (a === 'switch-person') {
    draft.person = v;
    drawModal();
  }
  if (a === 'back') {
    if (!step) { closeCheckin(); return; }
    if (step === 1) {
      if (draft.mode === 'study') { const h = Number($('#hours-input').value); if (h >= .2 && h <= 16) draft.hours = h; }
      else { const n = Number($('#distance-input').value); if (n >= .1 && n <= 300) draft.km = n; }
    }
    if (step === 2) { draft.minutes = Math.max(1, Math.min(1440, Number($('#minutes-input').value) || 30)); draft.time = $('#start-time').value || draft.time; }
    if (step === 3) draft.note = $('#run-note').value;
    step--; drawModal();
  }
  if (a === 'next') { if (!readStep()) return; step++; drawModal(); }
  if (a === 'album') $('#photo-file').click();
  if (a === 'camera') $('#camera-file').click();
  if (a === 'distance-add' || a === 'distance-set') {
    draft.km = a === 'distance-set' ? Number(v) : Math.max(.1, Math.min(300, Math.round(((Number($('#distance-input').value) || 0) + Number(v)) * 100) / 100));
    $('#distance-input').value = draft.km.toFixed(2);
    $$('[data-modal="distance-set"]').forEach(el => el.classList.toggle('selected', Number(el.dataset.value) === draft.km));
  }
  if (a === 'hours-add' || a === 'hours-set') {
    draft.hours = a === 'hours-set' ? Number(v) : Math.max(.2, Math.min(16, Math.round(((Number($('#hours-input').value) || 0) + Number(v)) * 10) / 10));
    draft.minutes = Math.round(draft.hours * 60);
    $('#hours-input').value = draft.hours.toFixed(1);
    $$('[data-modal="hours-set"]').forEach(el => el.classList.toggle('selected', Number(el.dataset.value) === draft.hours));
  }
  if (a === 'minutes-add') { $('#minutes-input').value = Math.max(1, Math.min(1440, (Number($('#minutes-input').value) || 0) + Number(v))); }
  if (a === 'feel') {
    draft.feel = Number(v);
    $$('.feel-option').forEach(el => { const active = Number(el.dataset.value) === draft.feel; el.classList.toggle('selected', active); el.setAttribute('aria-pressed', active); });
    $('[data-modal="next"]').disabled = false;
  }
  if (a === 'tag') { draft.tags = draft.tags.includes(v) ? draft.tags.filter(t => t !== v) : [...draft.tags, v]; b.classList.toggle('selected', draft.tags.includes(v)); }
  if (a === 'save') {
    if (draft.saving) return;
    draft.saving = true;
    b.disabled = true;
    const who = draft.person || state.name;
    let savedRec = null;
    if (draft.mode === 'study') {
      const tObj = state.studyTargets.find(t => t.id === draft.targetId);
      savedRec = { id: Date.now(), person: who, date: today(), time: draft.time, hours: draft.hours, minutes: draft.minutes, seconds: Math.round(draft.minutes * 60), source: 'manual', operationId: draft.operationId, focus: draft.feel, targetId: draft.targetId, subject: tObj?.title || '自主学习', note: draft.note, tags: draft.tags, photo: draft.photo, likes: 0, liked: false };
    } else {
      savedRec = { id: Date.now(), person: who, date: today(), time: draft.time, km: draft.km, minutes: draft.minutes, source: 'manual', operationId: draft.operationId, feel: draft.feel, note: draft.note, tags: draft.tags, photo: draft.photo, likes: 0, liked: false };
    }
    const savedMode = draft.mode;
    if (isServerOnline) {
      const endpoint = savedMode === 'study' ? '/records/study' : '/records/sport';
      const res = await serverFetch(endpoint, 'POST', savedRec);
      if (!res.ok) {
        draft.saving = false;
        b.disabled = false;
        toast('保存失败：' + (res.error || '服务器未响应，草稿已保留'));
        return;
      }
      if (res.record) Object.assign(savedRec, res.record);
    }
    if (savedMode === 'study') {
      state.studyRecords.unshift(savedRec);
      recordSelectKey = 'study:' + savedRec.id;
    } else {
      state.records.unshift(savedRec);
      recordSelectKey = 'sport:' + savedRec.id;
    }
    // Auto-complete hb-3 (action habit) for today
    if (who === state.name) {
      const hbArr = state.habitLogs[today()] || [];
      if (state.habits.some(h => h.id === 'hb-3') && !hbArr.includes('hb-3')) state.habitLogs[today()] = [...hbArr, 'hb-3'];
    } else {
      state.memberHabitLogs = state.memberHabitLogs || {};
      state.memberHabitLogs[who] = state.memberHabitLogs[who] || {};
      const mArr = state.memberHabitLogs[who][today()] || [];
      if (state.habits.some(h => h.id === 'hb-3') && !mArr.includes('hb-3')) state.memberHabitLogs[who][today()] = [...mArr, 'hb-3'];
    }
    recomputeStudyTargetDoneHours();
    persistLocalOnly();
    closeCheckin(); navigate(view); triggerFlameSurge(1900); triggerLightningSurge(1400); celebrate(); toast(who + ' ' + (savedMode === 'study' ? '学习' : '运动') + '打卡成功！');
  }
});

$('#modal-root').addEventListener('change', async e => {
  if (!['photo-file', 'camera-file'].includes(e.target.id)) return;
  const file = e.target.files[0]; if (!file) return;
  if (!file.type.startsWith('image/')) { toast('请选择图片文件。'); return; }
  if (isServerOnline) {
    try {
      const fd = new FormData();
      fd.append('file', file);
      const upRes = await serverFetch('/uploads', 'POST', fd);
      if (upRes && upRes.url) {
        draft.photo = upRes.url;
        drawModal();
        return;
      }
    } catch {}
  }
  try {
    const bitmap = await createImageBitmap(file), scale = Math.min(1, 900 / Math.max(bitmap.width, bitmap.height)), c = document.createElement('canvas');
    c.width = Math.round(bitmap.width * scale); c.height = Math.round(bitmap.height * scale);
    c.getContext('2d').drawImage(bitmap, 0, 0, c.width, c.height);
    draft.photo = c.toDataURL('image/jpeg', .75); bitmap.close(); drawModal();
  } catch { toast('这张照片暂时无法读取，请试试 JPG 或 PNG。'); }
});

document.addEventListener('keydown', e => {
  if (e.target.matches('[data-point],[data-chart-node],[data-chart-row],[data-action]') && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); e.target.dispatchEvent(new MouseEvent('click', { bubbles: true })); }
  if (e.target.id === 'quote' && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); nextQuote(); syncMotion(); }
  if (!draft) return;
  if (e.key === 'Escape') { e.preventDefault(); closeCheckin(); }
  if (e.key === 'Tab') {
    const focusables = $$('button:not(:disabled),input:not([hidden]),textarea,select,[tabindex="0"]', $('.checkin-modal')).filter(el => el.getClientRects().length);
    const first = focusables[0], last = focusables.at(-1);
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});

function celebrate() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  $('#confetti').innerHTML = Array.from({ length: 60 }, () => '<i class="confetti-piece" style="left:' + Math.random() * 100 + '%;background:' + ['#e5492b', '#203f91', '#e4a334', '#f2f1e8'][Math.floor(Math.random() * 4)] + ';--drift:' + (Math.random() - .5) * 300 + 'px;animation-delay:' + Math.random() * .5 + 's;transform:rotate(' + Math.random() * 360 + 'deg)"></i>').join('');
  setTimeout(() => $('#confetti').innerHTML = '', 3500);
}

/* ---------- DeepBook Button Text Stagger & Pixel-Dither Matrix Engine ---------- */
function enhanceTextStagger() {
  const btns = [...document.querySelectorAll('.checkin-cta strong, .dual-cta-half strong, .manifesto-film-btn, .track-add-btn, .track-mode-switch, .add-person, .add-target-btn, .ndc-btn.primary, .pomo-btn, .motion-toggle')];
  btns.forEach(el => {
    if (el.dataset.staggered === '1') return;
    const raw = (el.textContent || '').trim();
    if (!raw || raw.length > 26 || el.querySelector('svg')) return;
    if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', raw);
    el.classList.add('db-stagger');
    const chars = Array.from(raw);
    el.innerHTML = '<span class="db-clip" aria-hidden="true">' + chars.map((ch, i) =>
      '<span class="db-ch" style="--i:' + i + '">' + (ch === ' ' ? '&nbsp;' : esc(ch)) + '</span>'
    ).join('') + '</span>';
    el.dataset.staggered = '1';
  });
}

const BAYER4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5]
];
let pixelFrameId = 0;
let pixelPhase = 2.35;
let lightningSurgeUntil = 0;
let flameSurgeUntil = 0;

const FLAME_STATIC_PHASE = 2.35;
const FLAME_PALETTE = [
  '#2d060a', // 0: 深紫褐余烬底 (Deep Crimson-Plum Charcoal)
  '#5a0b12', // 1: 暗酒红热流层 (Dark Wine Ember)
  '#961414', // 2: 炽深红底层火幕 (Deep Ruby Red)
  '#d62818', // 3: 朱红主焰外廓 (Vermilion Outer Flame)
  '#f6511d', // 4: 熔岩亮橙中焰 (Blazing Lava Orange)
  '#ff8c1a', // 5: 琥珀金橙内焰 (Amber Gold Flame)
  '#ffd026', // 6: 柠檬金高亮火舌 (Solar Yellow Core)
  '#fffbe0'  // 7: 炽白金焰心与火星 (White-Hot Platinum Core)
];
const FLAME_LOBES = [
  { x: 0.04, h: 0.50, w: 0.088, speed: 1.92, curl: 0.042, power: 1.06, seed: 0.4 },
  { x: 0.14, h: 0.66, w: 0.104, speed: 1.54, curl: 0.052, power: 1.18, seed: 1.5 },
  { x: 0.25, h: 0.54, w: 0.092, speed: 1.82, curl: 0.046, power: 1.08, seed: 2.7 },
  { x: 0.36, h: 0.74, w: 0.112, speed: 1.42, curl: 0.058, power: 1.22, seed: 3.8 },
  { x: 0.47, h: 0.58, w: 0.096, speed: 1.72, curl: 0.048, power: 1.12, seed: 4.9 },
  { x: 0.58, h: 0.80, w: 0.118, speed: 1.36, curl: 0.062, power: 1.26, seed: 6.1 },
  { x: 0.69, h: 0.90, w: 0.128, speed: 1.26, curl: 0.066, power: 1.32, seed: 7.3 },
  { x: 0.80, h: 0.76, w: 0.114, speed: 1.58, curl: 0.054, power: 1.22, seed: 8.5 },
  { x: 0.89, h: 0.68, w: 0.102, speed: 1.78, curl: 0.048, power: 1.16, seed: 9.6 },
  { x: 0.96, h: 0.54, w: 0.086, speed: 2.05, curl: 0.038, power: 1.08, seed: 10.8 }
];

function createFlameEmber(isInitial = false) {
  const x = 0.03 + Math.random() * 0.94;
  const y = isInitial ? (0.05 + Math.random() * 0.84) : (0.58 + Math.random() * 0.32);
  const shapeRoll = Math.random();
  return {
    x,
    y,
    vy: 0.22 + Math.random() * 0.28,
    vxAmp: 0.018 + Math.random() * 0.026,
    vxFreq: 3.2 + Math.random() * 4.2,
    vxPhase: Math.random() * Math.PI * 2,
    driftBias: (Math.random() - 0.48) * 0.036,
    shape: shapeRoll < 0.28 ? 'cross' : shapeRoll < 0.64 ? 'block' : 'dot'
  };
}

function ensureFlameState(canvas) {
  if (!canvas._flameState) {
    const embers = [];
    for (let i = 0; i < 42; i++) embers.push(createFlameEmber(true));
    canvas._flameState = {
      embers,
      surgeUntil: 0,
      surgeDuration: 1150,
      lastTickMs: performance.now(),
      seed: 1.15
    };
  }
  return canvas._flameState;
}

function triggerFlameSurge(durationMs = 1150) {
  if (document.body.classList.contains('motion-paused') || (typeof reducedMotion !== 'undefined' && reducedMotion.matches)) return;
  const now = performance.now();
  const clamped = Math.min(2200, Math.max(600, durationMs));
  flameSurgeUntil = Math.max(flameSurgeUntil, now + clamped);
  const canvases = document.querySelectorAll('.pixel-matrix-canvas[data-pixel-theme="flame"]');
  canvases.forEach(c => {
    const st = ensureFlameState(c);
    st.surgeUntil = Math.max(st.surgeUntil, now + clamped);
    st.surgeDuration = clamped;
    for (let i = 0; i < 10 && i < st.embers.length; i++) {
      const idx = Math.floor(Math.random() * st.embers.length);
      st.embers[idx] = createFlameEmber(false);
    }
    drawPixelMatrix(c, pixelPhase);
  });
}

// ==========================================
// 100% ????????? + ??????? (1~3 Bolts, 2~4 Forks Each)
// ==========================================
function ensureCanvasState(canvas) {
  if (!canvas._lightningState) {
    const now = performance.now();
    canvas._lightningState = {
      active: null,
      nextStrike: now
    };
  }
  return canvas._lightningState;
}

function subdividePerpPath(p1, p2, jitterRatio, depth, minX, maxX, minY, maxY) {
  if (depth <= 0) return [p1, p2];
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const len = Math.hypot(dx, dy);
  if (len < 2.2) return [p1, p2];
  const nx = -dy / len;
  const ny = dx / len;
  const rawJitter = Math.max(len * jitterRatio, depth >= 2 ? 3.2 : 1.6);
  const offset = (Math.random() - 0.5) * 2 * rawJitter;
  const alongShift = (Math.random() - 0.5) * 0.16;
  const mx = (p1.x + p2.x) * 0.5 + dx * alongShift + nx * offset;
  const my = (p1.y + p2.y) * 0.5 + dy * alongShift + ny * offset;
  const mid = {
    x: Math.max(minX, Math.min(maxX, mx)),
    y: Math.max(minY, Math.min(maxY, my))
  };
  const nextRatio = jitterRatio * 0.88;
  const left = subdividePerpPath(p1, mid, nextRatio, depth - 1, minX, maxX, minY, maxY);
  const right = subdividePerpPath(mid, p2, nextRatio, depth - 1, minX, maxX, minY, maxY);
  return left.slice(0, -1).concat(right);
}

function buildFractalChain(anchors, jitterRatio, depth, minX, maxX, minY, maxY) {
  let pts = [anchors[0]];
  for (let i = 0; i < anchors.length - 1; i++) {
    const seg = subdividePerpPath(anchors[i], anchors[i + 1], jitterRatio, depth, minX, maxX, minY, maxY);
    pts = pts.concat(seg.slice(1));
  }
  return pts;
}

function buildCrookedBranch(origin, reachLen, baseAngle, segCount, jitterRatio, depth, minX, maxX, minY, maxY) {
  const anchors = [origin];
  let cur = origin;
  let curAngle = baseAngle;
  for (let s = 0; s < segCount; s++) {
    const stepLen = (reachLen / segCount) * (0.72 + Math.random() * 0.56);
    // 每个宏拐点明显偏转，避免分支退化为直线
    const turnSign = (s === 0 ? (Math.random() < 0.5 ? -1 : 1) : (Math.random() < 0.72 ? -1 : 1) * Math.sign(curAngle - baseAngle || 1));
    curAngle = baseAngle + turnSign * (0.34 + Math.random() * 0.52);
    const nx = Math.max(minX, Math.min(maxX, cur.x + Math.sin(curAngle) * stepLen));
    const ny = Math.max(minY, Math.min(maxY, cur.y + Math.max(0.18, Math.cos(curAngle)) * stepLen));
    const wp = { x: nx, y: ny };
    anchors.push(wp);
    cur = wp;
  }
  return buildFractalChain(anchors, jitterRatio, depth, minX, maxX, minY, maxY);
}

function distToSegSq(px, py, ax, ay, bx, by) {
  const vx = bx - ax, vy = by - ay;
  const wx = px - ax, wy = py - ay;
  const len2 = vx * vx + vy * vy;
  if (len2 <= 1e-6) return wx * wx + wy * wy;
  let t = (wx * vx + wy * vy) / len2;
  if (t < 0) t = 0;
  else if (t > 1) t = 1;
  const dx = px - (ax + t * vx), dy = py - (ay + t * vy);
  return dx * dx + dy * dy;
}

function appendPolylineSegs(pts, step, weight, outSegs) {
  if (!pts || pts.length < 2) return;
  let prev = pts[0];
  for (let i = step; i < pts.length - 1; i += step) {
    outSegs.push({ ax: prev.x, ay: prev.y, bx: pts[i].x, by: pts[i].y, w: weight });
    prev = pts[i];
  }
  const last = pts[pts.length - 1];
  outSegs.push({ ax: prev.x, ay: prev.y, bx: last.x, by: last.y, w: weight });
}

function generateRandomLightningBolt(w, h) {
  const boltCount = 1 + Math.floor(Math.random() * 3);
  const zoneAnchors = boltCount === 1
    ? [[0.54, 0.84]]
    : boltCount === 2
      ? [[0.43, 0.60], [0.72, 0.91]]
      : [[0.36, 0.50], [0.58, 0.72], [0.79, 0.94]];

  const heroIdx = Math.floor(Math.random() * boltCount);
  const bolts = [];
  const minSafeX = w * 0.25;
  const maxSafeX = Math.max(minSafeX + 24, w - 6);

  // 为非主闪电随机分配差异化原型：短促半空闪（少分支）、大斜跨多分枝、细锐远景副闪电
  const secondaryModes = ['short-sparse', 'slanted-forked', 'mid-crooked'];
  for (let i = secondaryModes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = secondaryModes[i];
    secondaryModes[i] = secondaryModes[j];
    secondaryModes[j] = tmp;
  }
  let secCursor = 0;

  for (let b = 0; b < boltCount; b++) {
    const isHero = b === heroIdx;
    const mode = isHero ? 'hero-full' : secondaryModes[secCursor++ % secondaryModes.length];
    const [minF, maxF] = zoneAnchors[b];
    const startX = w * (minF + Math.random() * (maxF - minF));

    let startY = 0;
    let endY = h;
    let targetX = startX;
    let macroSteps = 3;
    let kinkScale = 0.08;
    let jitterRatio = 0.36;
    let forkCount = 2;
    let forkLenScale = 1.0;
    let weight = 1.0;
    let delayMs = 0;

    if (mode === 'hero-full') {
      startY = 0;
      endY = h;
      const slantDir = startX > w * 0.70 ? -1 : 1;
      targetX = Math.max(minSafeX + 14, Math.min(maxSafeX - 4, startX + slantDir * w * (0.08 + Math.random() * 0.14)));
      macroSteps = 3 + Math.floor(Math.random() * 2);
      kinkScale = 0.095;
      jitterRatio = 0.36;
      forkCount = 3 + Math.floor(Math.random() * 2); // 3~4 条主分支（多分枝）
      forkLenScale = 1.08;
      weight = 1.0;
      delayMs = 0;
    } else if (mode === 'short-sparse') {
      // 明显更短：仅占高度 34% ~ 58%，半空凌空熄灭或起于中高层，少分支 (0~1条)
      startY = Math.random() < 0.45 ? h * (0.08 + Math.random() * 0.14) : 0;
      endY = Math.min(h * 0.88, startY + h * (0.34 + Math.random() * 0.24));
      const dir = (Math.random() < 0.5 ? -1 : 1);
      targetX = Math.max(minSafeX + 8, Math.min(maxSafeX - 4, startX + dir * w * (0.04 + Math.random() * 0.10)));
      macroSteps = 2;
      kinkScale = 0.075;
      jitterRatio = 0.40;
      forkCount = Math.random() < 0.45 ? 0 : 1; // 少分支 / 极简锐闪电
      forkLenScale = 0.58;
      weight = 0.62 + Math.random() * 0.10;
      delayMs = 35 + Math.floor(Math.random() * 65);
    } else if (mode === 'slanted-forked') {
      // 大跨度斜劈 + 2~3 条曲折长分支
      startY = 0;
      endY = h * (0.76 + Math.random() * 0.24);
      const slantDir = startX > w * 0.65 ? -1 : 1;
      targetX = Math.max(minSafeX + 10, Math.min(maxSafeX - 4, startX + slantDir * w * (0.14 + Math.random() * 0.16)));
      macroSteps = 4;
      kinkScale = 0.115;
      jitterRatio = 0.42;
      forkCount = 2 + Math.floor(Math.random() * 2);
      forkLenScale = 0.92;
      weight = 0.78 + Math.random() * 0.10;
      delayMs = 18 + Math.floor(Math.random() * 48);
    } else {
      // mid-crooked: 中高跨度大曲折伴随闪电（60%~88% 高度，1~2 条分支）
      startY = Math.random() < 0.35 ? h * 0.06 : 0;
      endY = Math.min(h, startY + h * (0.58 + Math.random() * 0.28));
      targetX = Math.max(minSafeX + 10, Math.min(maxSafeX - 4, startX + (Math.random() - 0.5) * w * 0.18));
      macroSteps = 3;
      kinkScale = 0.125;
      jitterRatio = 0.44;
      forkCount = 1 + Math.floor(Math.random() * 2);
      forkLenScale = 0.76;
      weight = 0.68 + Math.random() * 0.12;
      delayMs = 28 + Math.floor(Math.random() * 55);
    }

    const macroAnchors = [{ x: startX, y: startY }];
    for (let s = 1; s < macroSteps; s++) {
      const t = s / macroSteps;
      // 交替方向折跃，让每道闪电有各自独特的骨架姿态
      const zigSign = (s % 2 === 0 ? 1 : -1) * (b % 2 === 0 ? 1 : -1);
      const kink = (zigSign * 0.55 + (Math.random() - 0.5) * 1.1) * w * kinkScale;
      const wx = Math.max(minSafeX + 6, Math.min(maxSafeX - 4, startX + (targetX - startX) * t + kink));
      const wy = startY + (endY - startY) * Math.max(0.08, Math.min(0.92, t + (Math.random() - 0.5) * 0.08));
      macroAnchors.push({ x: wx, y: wy });
    }
    macroAnchors.push({ x: targetX, y: endY });

    const mainPts = buildFractalChain(macroAnchors, jitterRatio, 3, minSafeX, maxSafeX, startY, endY);

    const forks = [];
    const twigs = [];
    const sparks = [{ x: targetX, y: Math.max(2, endY - 2) }];
    const glowSegs = [];
    appendPolylineSegs(mainPts, 3, 1.0, glowSegs);

    const minIdx = Math.max(3, Math.floor(mainPts.length * 0.12));
    const maxIdx = Math.max(minIdx + 2, Math.floor(mainPts.length * 0.82));
    for (let f = 0; f < forkCount; f++) {
      const frac = (f + 0.18 + Math.random() * 0.64) / Math.max(1, forkCount);
      const idx = Math.min(mainPts.length - 2, Math.floor(minIdx + frac * (maxIdx - minIdx)));
      const origin = mainPts[idx];
      const side = (f + b) % 2 === 0 ? -1 : 1;
      const baseAngle = (0.48 + Math.random() * 0.56) * side;
      const spanH = Math.max(80, endY - startY);
      // 分支长度有长有短：短电弧须到长分叉
      const sizeVariety = f === 0 ? (0.34 + Math.random() * 0.16) : (0.18 + Math.random() * 0.26);
      const reachLen = Math.max(28, Math.min(h * 0.52, spanH * sizeVariety * forkLenScale));
      const bendCount = reachLen > 72 ? 3 : 2;
      const forkPts = buildCrookedBranch(
        origin, reachLen, baseAngle, bendCount, 0.44, 3,
        minSafeX * 0.82, maxSafeX, Math.max(2, origin.y - 8), Math.min(h - 2, origin.y + reachLen * 1.15)
      );
      forks.push(forkPts);
      appendPolylineSegs(forkPts, 2, 0.72, glowSegs);
      sparks.push(forkPts[forkPts.length - 1]);

      // 65% 概率再分出曲折毛细二级小叉（同样 2 折+垂直分形抖动，非直线）
      if (Math.random() < 0.65 && forkPts.length >= 6) {
        const twOrigin = forkPts[Math.floor(forkPts.length * (0.32 + Math.random() * 0.32))];
        const twSide = Math.random() < 0.5 ? side : -side;
        const twAngle = baseAngle + twSide * (0.36 + Math.random() * 0.42);
        const twLen = Math.max(18, reachLen * (0.36 + Math.random() * 0.24));
        const twPts = buildCrookedBranch(
          twOrigin, twLen, twAngle, 2, 0.46, 2,
          minSafeX * 0.80, maxSafeX, Math.max(2, twOrigin.y - 6), h - 2
        );
        twigs.push(twPts);
        appendPolylineSegs(twPts, 3, 0.45, glowSegs);
      }
    }

    bolts.push({
      isHero,
      mode,
      spanRatio: Number(((endY - startY) / Math.max(1, h)).toFixed(2)),
      weight,
      delayMs,
      mainPts,
      forks,
      twigs,
      sparks,
      glowSegs
    });
  }

  return {
    startTime: performance.now(),
    duration: 920 + Math.random() * 260, // 0.92s ~ 1.18s 充分展示电弧美感与分叉层次
    bolts
  };
}

function triggerLightningSurge(durationMs = 1120) {
  if (document.body.classList.contains('motion-paused') || (typeof reducedMotion !== 'undefined' && reducedMotion.matches)) return;
  const clamped = Math.min(1350, Math.max(900, durationMs));
  lightningSurgeUntil = performance.now() + clamped;
  const canvases = document.querySelectorAll('.pixel-matrix-canvas[data-pixel-theme="lightning"]');
  canvases.forEach(c => {
    const w = c.clientWidth || 360;
    const h = c.clientHeight || 220;
    const st = ensureCanvasState(c);
    st.active = generateRandomLightningBolt(w, h);
    st.active.duration = clamped;
    st.nextStrike = performance.now() + st.active.duration + 1100;
    drawPixelMatrix(c, pixelPhase);
  });
}

function strokeTaperedPolyline(ctx, pts, wStart, wEnd, aStart, aEnd, colorAtAlpha) {
  if (!pts || pts.length < 2) return;
  const bands = 4;
  const totalSegs = pts.length - 1;
  for (let band = 0; band < bands; band++) {
    const i0 = Math.floor((band * totalSegs) / bands);
    const i1 = Math.max(i0 + 1, Math.floor(((band + 1) * totalSegs) / bands));
    if (i0 >= totalSegs) break;
    const t = (band + 0.5) / bands;
    const lw = wStart + (wEnd - wStart) * t;
    const al = aStart + (aEnd - aStart) * t;
    if (al <= 0.01 || lw <= 0.05) continue;
    ctx.lineWidth = lw;
    ctx.strokeStyle = colorAtAlpha(al);
    ctx.beginPath();
    ctx.moveTo(pts[i0].x, pts[i0].y);
    for (let i = i0 + 1; i <= Math.min(pts.length - 1, i1); i++) {
      ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.stroke();
  }
}

function drawPixelMatrix(canvas, phase = 0) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.clientWidth || 360;
  const h = canvas.clientHeight || 220;
  if (!w || !h) return;
  const cell = 6;
  const cols = Math.ceil(w / cell);
  const rows = Math.ceil(h / cell);
  const theme = canvas.dataset.pixelTheme || 'blue';

  if (theme === 'lightning') {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const bw = Math.round(w * dpr);
    const bh = Math.round(h * dpr);
    if (canvas.width !== bw || canvas.height !== bh) {
      canvas.width = bw;
      canvas.height = bh;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const nowMs = performance.now();
    const isMotionPaused = document.body.classList.contains('motion-paused') || (typeof reducedMotion !== 'undefined' && reducedMotion.matches);
    const st = ensureCanvasState(canvas);

    if (!isMotionPaused) {
      if (!st.active && nowMs >= st.nextStrike) {
        st.active = generateRandomLightningBolt(w, h);
        st.nextStrike = nowMs + st.active.duration + 1150 + Math.random() * 850;
      }
    } else {
      st.active = null;
    }

    // 可观测持久放电包络 (~1s)：极速击穿 -> 高亮微颤持续观测期 -> 短促呼吸回击 -> 柔和余晖熄灭
    let strikeIntensity = 0;
    const elapsedTotal = st.active ? (nowMs - st.active.startTime) : 0;
    if (st.active) {
      if (elapsedTotal >= st.active.duration) {
        st.active = null;
      } else {
        const p = elapsedTotal / st.active.duration;
        if (p < 0.08) {
          strikeIntensity = 1.0;
        } else if (p < 0.54) {
          strikeIntensity = 0.91 + 0.09 * Math.sin(p * 42);
        } else if (p < 0.64) {
          strikeIntensity = 0.54;
        } else if (p < 0.80) {
          strikeIntensity = 0.94;
        } else {
          strikeIntensity = Math.max(0.02, Math.pow(1 - (p - 0.80) / 0.20, 1.4));
        }
      }
    }

    const liveBolts = [];
    const allGlowSegs = [];
    if (st.active && strikeIntensity > 0.03) {
      for (const b of st.active.bolts) {
        if (elapsedTotal >= b.delayMs) {
          const bDur = Math.max(120, st.active.duration - b.delayMs);
          const bp = Math.min(1, (elapsedTotal - b.delayMs) / bDur);
          const bEnv = bp < 0.08
            ? 1.0
            : bp < 0.55
              ? (0.91 + 0.09 * Math.sin(bp * 42))
              : bp < 0.65
                ? 0.54
                : bp < 0.81
                  ? 0.94
                  : Math.max(0.02, Math.pow(1 - (bp - 0.81) / 0.19, 1.4));
          const bInt = bEnv * b.weight;
          liveBolts.push({ bolt: b, intensity: bInt });
          for (let g = 0; g < b.glowSegs.length; g++) {
            const sg = b.glowSegs[g];
            allGlowSegs.push({ ax: sg.ax, ay: sg.ay, bx: sg.bx, by: sg.by, w: sg.w * bInt });
          }
        }
      }
    }

    // A. 保留 6px 深海宝蓝 Bayer 像素渐变矩阵 + 沿连续闪电线段丝带式贴合提亮（无独立圆形光斑）
    const baseBluePal = [
      'rgba(8, 22, 78, 0.58)',
      'rgba(16, 42, 126, 0.70)',
      'rgba(27, 68, 180, 0.80)',
      'rgba(37, 99, 235, 0.88)',
      'rgba(56, 175, 255, 0.94)'
    ];
    const litBluePal = [
      'rgba(59, 130, 246, 0.84)',
      'rgba(56, 189, 248, 0.88)',
      'rgba(125, 211, 252, 0.92)',
      'rgba(186, 230, 253, 0.94)'
    ];
    const skyFlashBoost = strikeIntensity * 0.18;
    const glowRadius = 68;
    const glowRadiusSq = glowRadius * glowRadius;

    for (let y = 0; y < rows; y++) {
      const ny = y / Math.max(1, rows - 1);
      const cy = y * cell + cell * 0.5;
      for (let x = 0; x < cols; x++) {
        const nx = x / Math.max(1, cols - 1);
        const cx = x * cell + cell * 0.5;
        const baseGrad = 0.28 * nx + 0.34 * (1 - ny) + 0.15 + skyFlashBoost * nx;
        const waveDither = 0.07 * Math.sin(nx * 7.5 + ny * 4.2 + (isMotionPaused ? 0 : phase * 0.45));
        let bgVal = Math.max(0, Math.min(1, baseGrad + waveDither));

        let litProx = 0;
        if (allGlowSegs.length > 0 && cx > w * 0.18) {
          let minD2 = glowRadiusSq;
          let bestW = 1;
          for (let g = 0; g < allGlowSegs.length; g++) {
            const sg = allGlowSegs[g];
            const d2 = distToSegSq(cx, cy, sg.ax, sg.ay, sg.bx, sg.by);
            if (d2 < minD2) { minD2 = d2; bestW = sg.w; }
          }
          if (minD2 < glowRadiusSq) {
            const normDist = 1 - Math.sqrt(minD2) / glowRadius;
            litProx = Math.pow(normDist, 1.45) * bestW;
            bgVal = Math.min(1, bgVal + litProx * 0.52);
          }
        }

        if (litProx > 0.28) {
          const lIdx = Math.min(litBluePal.length - 1, Math.floor(((litProx - 0.28) / 0.72) * litBluePal.length));
          ctx.fillStyle = litBluePal[lIdx];
        } else {
          const bgBand = Math.min(baseBluePal.length - 1, Math.floor(bgVal * baseBluePal.length));
          ctx.fillStyle = baseBluePal[bgBand];
        }
        ctx.fillRect(x * cell, y * cell, cell - 1, cell - 1);
      }
    }

    // B. 方案A+：一体贴合闪电氛围柔光 + 高精分形锐利冰白冰青电弧
    if (liveBolts.length > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // B1. 全局线性斜向片状天幕闪光（替代圆形径向光斑，与全卡电离一体呼应）
      const sheetGrad = ctx.createLinearGradient(w * 0.18, 0, w, h * 0.85);
      sheetGrad.addColorStop(0, 'rgba(37, 99, 235, 0)');
      sheetGrad.addColorStop(0.55, 'rgba(56, 189, 248, ' + (0.09 * strikeIntensity).toFixed(3) + ')');
      sheetGrad.addColorStop(1, 'rgba(224, 242, 254, ' + (0.15 * strikeIntensity).toFixed(3) + ')');
      ctx.fillStyle = sheetGrad;
      ctx.fillRect(0, 0, w, h);

      // B2. 逐道绘制：沿闪电本体的连续宽幅冰白氛围薄纱 -> 电光蓝柔光 -> 冰青等离子层 -> 极细纯冰白内芯
      for (let i = 0; i < liveBolts.length; i++) {
        const { bolt, intensity } = liveBolts[i];
        const isHero = bolt.isHero;
        const a = Math.min(1, intensity);

        // Pass 0: 贴合闪电路径的一体冰白/冰青氛围底光（取代圆形白斑）
        ctx.shadowColor = 'rgba(186, 230, 253, ' + (0.36 * a).toFixed(2) + ')';
        ctx.shadowBlur = isHero ? 20 : 12;
        strokeTaperedPolyline(
          ctx, bolt.mainPts, isHero ? 22 : 14, isHero ? 11 : 7, 0.12 * a, 0.05 * a,
          al => 'rgba(224, 242, 254, ' + al.toFixed(3) + ')'
        );
        for (let f = 0; f < bolt.forks.length; f++) {
          strokeTaperedPolyline(
            ctx, bolt.forks[f], isHero ? 9.5 : 6.5, 2.8, 0.08 * a, 0.02 * a,
            al => 'rgba(224, 242, 254, ' + al.toFixed(3) + ')'
          );
        }

        // Pass 1: 外层电光蓝柔光
        ctx.shadowColor = 'rgba(96, 165, 250, ' + (0.78 * a).toFixed(2) + ')';
        ctx.shadowBlur = isHero ? 14 : 9;
        strokeTaperedPolyline(
          ctx, bolt.mainPts, isHero ? 10.5 : 7.0, isHero ? 5.0 : 3.4, 0.34 * a, 0.16 * a,
          al => 'rgba(56, 189, 248, ' + al.toFixed(3) + ')'
        );
        for (let f = 0; f < bolt.forks.length; f++) {
          strokeTaperedPolyline(
            ctx, bolt.forks[f], isHero ? 4.6 : 3.2, 1.4, 0.24 * a, 0.05 * a,
            al => 'rgba(56, 189, 248, ' + al.toFixed(3) + ')'
          );
        }

        // Pass 2: 中层冰青辉光
        ctx.shadowColor = 'rgba(125, 211, 252, ' + (0.94 * a).toFixed(2) + ')';
        ctx.shadowBlur = isHero ? 7 : 5;
        strokeTaperedPolyline(
          ctx, bolt.mainPts, isHero ? 4.5 : 3.0, isHero ? 2.1 : 1.4, 0.78 * a, 0.48 * a,
          al => 'rgba(165, 243, 252, ' + al.toFixed(3) + ')'
        );
        for (let f = 0; f < bolt.forks.length; f++) {
          strokeTaperedPolyline(
            ctx, bolt.forks[f], isHero ? 2.2 : 1.5, 0.75, 0.60 * a, 0.16 * a,
            al => 'rgba(165, 243, 252, ' + al.toFixed(3) + ')'
          );
        }

        // Pass 3: 锐利极细纯冰白内芯 (无 shadowBlur 保持矢量级锐度)
        ctx.shadowBlur = 0;
        strokeTaperedPolyline(
          ctx, bolt.mainPts, isHero ? 2.45 : 1.65, isHero ? 1.05 : 0.75, 1.00 * a, 0.86 * a,
          al => 'rgba(255, 255, 255, ' + al.toFixed(3) + ')'
        );
        for (let f = 0; f < bolt.forks.length; f++) {
          strokeTaperedPolyline(
            ctx, bolt.forks[f], isHero ? 1.25 : 0.92, 0.40, 0.94 * a, 0.28 * a,
            al => 'rgba(255, 255, 255, ' + al.toFixed(3) + ')'
          );
        }
        for (let tw = 0; tw < bolt.twigs.length; tw++) {
          strokeTaperedPolyline(
            ctx, bolt.twigs[tw], 0.75, 0.28, 0.72 * a, 0.16 * a,
            al => 'rgba(224, 242, 254, ' + al.toFixed(3) + ')'
          );
        }

        // Pass 4: 尖端微弱电离星火
        for (let sp = 0; sp < bolt.sparks.length; sp++) {
          const pt = bolt.sparks[sp];
          ctx.fillStyle = 'rgba(224, 242, 254, ' + (0.78 * a).toFixed(2) + ')';
          ctx.fillRect(pt.x - 1, pt.y - 1, 2, 2);
        }
      }
      ctx.restore();
    }
    return;
  }

  if (theme === 'flame') {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const bw = Math.round(w * dpr);
    const bh = Math.round(h * dpr);
    if (canvas.width !== bw || canvas.height !== bh) {
      canvas.width = bw;
      canvas.height = bh;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, w, h);

    // 5px crisp pixel grid with 1px pixel mortar gap -> unmistakable retro pixel-art fire
    const fCell = 5;
    const fDraw = fCell - 1;
    const fCols = Math.ceil(w / fCell);
    const fRows = Math.ceil(h / fCell);
    const nowMs = performance.now();
    const isMotionPaused = document.body.classList.contains('motion-paused') || (typeof reducedMotion !== 'undefined' && reducedMotion.matches);
    const fst = ensureFlameState(canvas);
    const t = isMotionPaused ? FLAME_STATIC_PHASE : phase;

    let surgeNorm = 0;
    if (!isMotionPaused && fst.surgeUntil > nowMs) {
      const sp = Math.max(0, Math.min(1, (fst.surgeUntil - nowMs) / Math.max(1, fst.surgeDuration)));
      surgeNorm = Math.sin(sp * Math.PI);
    }

    const breath = 1.0 + 0.08 * Math.sin(t * 0.92 + fst.seed) + 0.04 * Math.sin(t * 2.05 + 1.1);
    const ampBoost = breath + surgeNorm * 0.28;
    const lobeState = FLAME_LOBES.map(L => ({
      x: L.x,
      h: L.h * ampBoost * (0.88 + 0.14 * Math.sin(t * L.speed + L.seed * 2.1)),
      w: L.w * (1 + surgeNorm * 0.14),
      speed: L.speed,
      curl: L.curl,
      power: L.power,
      seed: L.seed
    }));

    // Step-quantized vertical advection for authentic pixel fire tongues
    const yQuant = Math.floor(t * 5.6);
    const bandGrid = new Uint8Array(fCols * fRows);

    for (let y = 0; y < fRows; y++) {
      // Quantize ny in 2-row micro-terraces so flame contours form crisp pixel steps
      const nyRaw = y / Math.max(1, fRows - 1);
      const nyStep = (Math.floor(y / 2) * 2) / Math.max(1, fRows - 1);
      const ny = nyRaw * 0.65 + nyStep * 0.35;
      const rise = 1 - ny;
      const bedDepth = ny > 0.64 ? (ny - 0.64) / 0.36 : 0;
      const tipMask = ny <= 0.26 ? (1 - ny / 0.26) : 0;

      for (let x = 0; x < fCols; x++) {
        const nxRaw = x / Math.max(1, fCols - 1);
        const nxStep = (Math.floor(x / 2) * 2) / Math.max(1, fCols - 1);
        const nx = nxRaw * 0.68 + nxStep * 0.32;
        const bayer = (BAYER4[y & 3][x & 3] + 0.5) / 16;

        // 1. Deep layered ember-to-ruby pixel sky (indices 0 -> 1 -> 2 -> 3) so upper flames have strong contrast
        const skyWave = 0.05 * Math.sin(nx * 8.5 - t * 0.85) + 0.04 * Math.cos(ny * 7.2 + t * 0.65);
        const bgWarmth = Math.max(0.02, 0.04 + 0.38 * Math.pow(ny, 1.32) + skyWave + surgeNorm * 0.06);

        // 2. Full-width bottom terraced white-gold & orange firebed (nx = 0..1)
        const bedWave = 0.90 + 0.10 * Math.sin(nx * 18.0 - t * 2.8) + 0.06 * Math.cos(nx * 29.0 + t * 3.3);
        const firebed = bedDepth > 0 ? Math.pow(bedDepth, 1.02) * 0.96 * bedWave : 0;

        // 3. 10 full-width rising, S-swaying, bifurcated pixel flame lobes with distinct inner/mid/outer cores
        let lobeMax = 0;
        let lobeSecond = 0;
        let coreBoost = 0;
        for (let li = 0; li < lobeState.length; li++) {
          const L = lobeState[li];
          const u = rise / Math.max(0.16, L.h);
          if (u > 1.24) continue;
          const sway = L.curl * (0.26 + 0.94 * rise) * (
            Math.sin(nyStep * 9.2 + t * (L.speed * 1.38) + L.seed) +
            0.46 * Math.sin(nyStep * 16.4 + t * 3.0 - L.seed)
          );
          const cx = L.x + sway;
          const pinch = 1.0 + 0.18 * Math.sin(nyStep * 12.0 + t * 2.5 + L.seed);
          const halfW = L.w * Math.max(0.20, 1.0 - 0.60 * Math.min(1, u)) * pinch;
          const splitOff = 0.38 * halfW * Math.sin(nyStep * 11.2 + t * 2.7 + L.seed * 3.1);
          const dx = Math.abs(nx - cx);
          const dxFork = Math.abs(nx - (cx + splitOff));
          const dist = Math.min(dx, dxFork * 1.10);
          // Stepped radial profile for unmistakable multi-ring pixel flame tongues
          const normD = dist / Math.max(0.014, halfW);
          if (normD < 1.15) {
            const radial = normD < 0.28 ? 1.0
              : normD < 0.56 ? 0.80
              : normD < 0.84 ? 0.54
              : Math.max(0, 1 - normD / 1.15) * 0.32;
            const vFall = Math.max(0, 1 - Math.pow(Math.max(0, u), 1.32));
            const lh = radial * vFall * L.power;
            if (lh > lobeMax) {
              lobeSecond = lobeMax;
              lobeMax = lh;
            } else if (lh > lobeSecond) {
              lobeSecond = lh;
            }
            if (normD < 0.32 && u < 0.68) {
              coreBoost = Math.max(coreBoost, (1 - u / 0.68) * 0.24);
            }
          }
        }

        // 4. Crisp cellular pixel turbulence & detached pixel flame islands near tongue tips
        const hSeed = Math.sin(x * 12.9898 + (y + yQuant) * 78.233) * 43758.5453;
        const cellHash = hSeed - Math.floor(hSeed);
        const turb = 0.055 * Math.sin(nxStep * 24.0 + nyStep * 16.0 + t * 3.5) * Math.cos(nxStep * 18.0 - nyStep * 22.0 + t * 2.6);
        const topBreak = tipMask * (0.16 + 0.22 * cellHash);
        const detachedWisp = (ny > 0.06 && ny <= 0.36 && lobeMax > 0.08 && lobeMax < 0.36 && cellHash > 0.62) ? 0.26 : 0;

        // 5. Full-width bottom white-hot platinum & solar-yellow core (nx = 0..1)
        const fullWidthBaseCore = ny > 0.78
          ? 0.26 * Math.pow((ny - 0.78) / 0.22, 0.78) * (0.86 + 0.14 * Math.sin(nx * 20.0 + t * 3.0))
          : 0;

        // Keep upper-left headline area slightly deeper ruby/crimson so white/gold text pops with high contrast
        const textZoneMod = (nx < 0.48 && ny < 0.54) ? 0.72 : 1.0;
        const rawFlame = (Math.max(firebed, lobeMax * 0.86 + lobeSecond * 0.24) + coreBoost + fullWidthBaseCore + turb + detachedWisp - topBreak) * textZoneMod;
        const heat = Math.max(bgWarmth, Math.min(0.999, rawFlame));

        // Ordered Bayer dither strictly at narrow band boundaries (0.24..0.76) so solid pixel terraces & 4x4 checker borders both stand out
        const scaled = heat * (FLAME_PALETTE.length - 1);
        const band = Math.floor(scaled);
        const frac = scaled - band;
        let idx = Math.min(FLAME_PALETTE.length - 1, band);
        const ditherThreshold = 0.24 + bayer * 0.52;
        if (frac > ditherThreshold && idx + 1 < FLAME_PALETTE.length) idx += 1;
        bandGrid[y * fCols + x] = idx;
      }
    }

    // Pass 1: Render 8-tier pixel matrix with a 1-step crimson rim highlight around hot flame tongues
    for (let y = 0; y < fRows; y++) {
      const rowOff = y * fCols;
      for (let x = 0; x < fCols; x++) {
        let idx = bandGrid[rowOff + x];
        // Pixel contour accent: if a cool background pixel (0..1) touches a hot flame pixel (>=4), step it up to deep ruby (2) for crisp pixel silhouette
        if (idx <= 1) {
          const up = y > 0 ? bandGrid[(y - 1) * fCols + x] : idx;
          const dn = y + 1 < fRows ? bandGrid[(y + 1) * fCols + x] : idx;
          const lf = x > 0 ? bandGrid[rowOff + x - 1] : idx;
          const rt = x + 1 < fCols ? bandGrid[rowOff + x + 1] : idx;
          if (up >= 4 || dn >= 4 || lf >= 4 || rt >= 4) {
            idx = 2;
          }
        }
        ctx.fillStyle = FLAME_PALETTE[idx];
        ctx.fillRect(x * fCell, y * fCell, fDraw, fDraw);
      }
    }

    // Pass 2: Multi-shape pixel embers (plus-cross sparks, 2x2 pixel blocks, 1x1 crisp sparks)
    const dt = isMotionPaused ? 0 : Math.min(0.05, Math.max(0.001, (nowMs - fst.lastTickMs) / 1000));
    fst.lastTickMs = nowMs;
    const embers = fst.embers;
    for (let i = 0; i < embers.length; i++) {
      const em = embers[i];
      if (!isMotionPaused) {
        em.x += (Math.sin(t * em.vxFreq + em.vxPhase) * em.vxAmp + em.driftBias) * dt;
        em.y -= em.vy * (1 + surgeNorm * 0.52) * dt;
        if (em.y < 0.03 || em.x < 0.02 || em.x > 0.98) {
          embers[i] = createFlameEmber(false);
          continue;
        }
      }
      const alt = Math.max(0, Math.min(1, (0.88 - em.y) / 0.80));
      const gx = Math.max(1, Math.min(fCols - 3, Math.floor(em.x * fCols)));
      const gy = Math.max(1, Math.min(fRows - 3, Math.floor(em.y * fRows)));
      const coreColor = alt < 0.36 ? FLAME_PALETTE[7] : alt < 0.68 ? FLAME_PALETTE[6] : FLAME_PALETTE[5];
      const haloColor = alt < 0.45 ? FLAME_PALETTE[5] : FLAME_PALETTE[3];

      if (em.shape === 'cross' && alt < 0.62) {
        // Retro 5-cell pixel plus-star spark
        ctx.fillStyle = haloColor;
        ctx.fillRect((gx - 1) * fCell, gy * fCell, fDraw, fDraw);
        ctx.fillRect((gx + 1) * fCell, gy * fCell, fDraw, fDraw);
        ctx.fillRect(gx * fCell, (gy - 1) * fCell, fDraw, fDraw);
        ctx.fillRect(gx * fCell, (gy + 1) * fCell, fDraw, fDraw);
        ctx.fillStyle = coreColor;
        ctx.fillRect(gx * fCell, gy * fCell, fDraw, fDraw);
      } else if (em.shape === 'block' && alt < 0.52) {
        // 2x2 stepped pixel cluster with hotter bottom-inner cell
        ctx.fillStyle = haloColor;
        ctx.fillRect(gx * fCell, gy * fCell, fDraw, fDraw);
        ctx.fillRect((gx + 1) * fCell, gy * fCell, fDraw, fDraw);
        ctx.fillStyle = coreColor;
        ctx.fillRect(gx * fCell, (gy + 1) * fCell, fDraw, fDraw);
        ctx.fillRect((gx + 1) * fCell, (gy + 1) * fCell, fDraw, fDraw);
      } else {
        // 1x1 pixel spark with trailing vertical ember pixel
        ctx.fillStyle = coreColor;
        ctx.fillRect(gx * fCell, gy * fCell, fDraw, fDraw);
        if (gy + 1 < fRows) {
          ctx.fillStyle = FLAME_PALETTE[3];
          ctx.fillRect(gx * fCell, (gy + 1) * fCell, fDraw, fDraw);
        }
      }
    }
    return;
  }

  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, w, h);

  const palettes = {
    orange: [
      'rgba(255, 246, 214, 0.36)',
      'rgba(229, 73, 43, 0.42)',
      'rgba(26, 26, 24, 0.34)',
      'rgba(255, 255, 255, 0.48)'
    ],
    black: [
      'rgba(32, 63, 145, 0.46)',
      'rgba(229, 73, 43, 0.48)',
      'rgba(228, 163, 52, 0.52)',
      'rgba(242, 241, 232, 0.44)'
    ],
    blue: [
      'rgba(78, 134, 255, 0.44)',
      'rgba(0, 212, 255, 0.38)',
      'rgba(228, 163, 52, 0.48)',
      'rgba(229, 73, 43, 0.46)'
    ]
  };
  const pal = palettes[theme] || palettes.blue;

  for (let y = 0; y < rows; y++) {
    const ny = y / Math.max(1, rows - 1);
    for (let x = 0; x < cols; x++) {
      const nx = x / Math.max(1, cols - 1);
      const wave = 0.09 * Math.sin(nx * 5.6 + phase) + 0.07 * Math.cos(ny * 4.4 - phase * 0.75);
      const density = Math.max(0.04, Math.min(0.96, (nx * 0.62 + (1 - ny) * 0.36 - 0.06) + wave));
      const threshold = (BAYER4[y & 3][x & 3] + 0.5) / 16;
      if (density > threshold) {
        const band = Math.min(pal.length - 1, Math.floor(density * pal.length));
        const isSpark = ((x * 7 + y * 13) % 23 === 0) && density > 0.55;
        ctx.fillStyle = isSpark ? pal[pal.length - 1] : pal[band];
        ctx.fillRect(x * cell, y * cell, cell - 1, cell - 1);
      }
    }
  }
}

function initPixelMatrices() {
  [...document.querySelectorAll('.poster-hero')].forEach(hero => {
    if (!hero.querySelector('.pixel-matrix-canvas')) {
      const c = document.createElement('canvas');
      c.className = 'pixel-matrix-canvas';
      c.dataset.pixelTheme = hero.classList.contains('poster-flame') ? 'flame'
        : hero.classList.contains('poster-lightning') ? 'lightning'
        : hero.classList.contains('poster-orange') ? 'orange'
        : hero.classList.contains('poster-black') ? 'black'
        : 'blue';
      c.setAttribute('aria-hidden', 'true');
      hero.prepend(c);
    }
  });
  [...document.querySelectorAll('.pixel-matrix-canvas')].forEach(c => drawPixelMatrix(c, pixelPhase));
  requestAnimationFrame(() => [...document.querySelectorAll('.pixel-matrix-canvas')].forEach(c => drawPixelMatrix(c, pixelPhase)));
}

function stopPixelLoop() {
  if (pixelFrameId) { cancelAnimationFrame(pixelFrameId); pixelFrameId = 0; }
}
function startPixelLoop() {
  stopPixelLoop();
  let lastDraw = 0;
  const stepFrame = ts => {
    if (document.body.classList.contains('motion-paused') || reducedMotion.matches) {
      pixelFrameId = 0; return;
    }
    const canvases = [...document.querySelectorAll('.pixel-matrix-canvas')];
    const nowLoop = performance.now();
    const hasActiveLightning = nowLoop < lightningSurgeUntil || canvases.some(c => c._lightningState && c._lightningState.active);
    const hasActiveFlameSurge = nowLoop < flameSurgeUntil;
    const hasFlame = canvases.some(c => c.dataset.pixelTheme === 'flame');
    const minInterval = hasActiveLightning ? 16 : hasActiveFlameSurge ? 24 : hasFlame ? 33 : 55;
    if (ts - lastDraw >= minInterval) {
      pixelPhase += hasActiveLightning ? 0.035 : hasFlame ? 0.075 : 0.11;
      canvases.forEach(c => drawPixelMatrix(c, pixelPhase));
      lastDraw = ts;
    }
    pixelFrameId = requestAnimationFrame(stepFrame);
  };
  pixelFrameId = requestAnimationFrame(stepFrame);
}

let motionPaused = false;
const motionButton = $('#motion-toggle'), reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
function syncMotion() {
  const stopped = motionPaused || reducedMotion.matches;
  document.body.classList.toggle('motion-paused', stopped);
  motionButton.setAttribute('aria-pressed', String(stopped));
  motionButton.textContent = reducedMotion.matches ? '跟随系统：减少动效' : motionPaused ? '开启动效 ▶' : '暂停动效 Ⅱ';
  delete motionButton.dataset.staggered;
  enhanceTextStagger();
  motionButton.disabled = reducedMotion.matches;
  clearInterval(quoteTimer);
  if (!stopped && view === 'home') quoteTimer = setInterval(nextQuote, 7000);
  if (stopped) { stopPixelLoop(); [...document.querySelectorAll('.pixel-matrix-canvas')].forEach(c => drawPixelMatrix(c, pixelPhase)); } else startPixelLoop();
}
motionButton.addEventListener('click', () => { motionPaused = !motionPaused; syncMotion(); });
reducedMotion.addEventListener('change', syncMotion);
const originalRender = render;
render = function (preserveScroll = false) {
  originalRender(preserveScroll); enhanceTextStagger(); initPixelMatrices(); syncMotion();
  if (window.mausbot?.setContext) {
    try { window.mausbot.setContext('view=' + view + ' | progressTab=' + progressTab + ' | dualChartMode=' + dualChartMode); } catch {}
  }
};
const originalDrawModal = drawModal;
drawModal = function () { originalDrawModal(); enhanceTextStagger(); };
window.addEventListener('resize', () => { [...document.querySelectorAll('.pixel-matrix-canvas')].forEach(c => drawPixelMatrix(c, pixelPhase)); });
updateHeader(); tick(); setInterval(tick, 1000); render();

// URL checkin parameters auto popup
const checkinParam = params.get('checkin');
if (checkinParam === 'snap' || checkinParam === 'sport') {
  openCheckin('sport');
} else if (checkinParam === 'distance') {
  openCheckin('sport');
  step = 1;
  draft.km = 6.4;
  drawModal();
} else if (checkinParam === 'study') {
  openCheckin('study');
}

// Startup server health check & state sync (guarded against embedded/demo iframe)
if (!embedded && !demo && typeof checkServerHealth === 'function') {
  checkServerHealth().then(async online => {
    if (online) {
      isServerOnline = true;
      console.log('[RUN LOG] 在线后端已连接，正在同步云端 SQLite 状态...');
      await flushPendingOps();
      const remoteState = await serverFetch('/state');
      if (remoteState && remoteState.ok) {
        state = hydrateState(remoteState);
        persistLocalOnly();
        render(true);
      }
      initSSE();
    } else {
      isServerOnline = false;
    }
  });
}
})();
