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

function studySecondsOf(r) {
  if (!r || typeof r !== 'object') return 0;
  if (Number.isFinite(Number(r.seconds)) && Number(r.seconds) > 0) return Math.round(Number(r.seconds));
  if (Number.isFinite(Number(r.minutes)) && Number(r.minutes) > 0) return Math.round(Number(r.minutes) * 60);
  if (Number.isFinite(Number(r.hours)) && Number(r.hours) > 0) return Math.round(Number(r.hours) * 3600);
  return 0;
}
function studyMinutesOf(r) {
  const sec = studySecondsOf(r);
  return sec > 0 ? Math.max(1, Math.round(sec / 60)) : 0;
}
function studyHoursOf(r) {
  return roundedStudyHours(studySecondsOf(r) / 3600);
}
function roundedStudyHours(hours) { return Math.round(hours * 100) / 100; }
function normalizeStudyRecord(r) {
  const seconds = studySecondsOf(r);
  const minutes = seconds > 0 ? Math.max(1, Math.round(seconds / 60)) : 0;
  const hours = roundedStudyHours(seconds / 3600);
  return { ...r, seconds, minutes, hours };
}

function hydrateState(raw, opts = {}) {
  const fromServer = Boolean(opts && opts.fromServer);
  const base = seed();
  if (!raw || (raw.version !== 1 && raw.schemaVersion !== 2) || !Array.isArray(raw.records)) {
    raw = base;
  }
  const userName = raw.name || base.name;
  let members = Array.isArray(raw.members) ? raw.members.filter(Boolean) : [];
  let records = raw.records.map(r => ({
    ...r,
    syncStatus: fromServer ? 'synced' : (r.syncStatus || 'local'),
    syncError: fromServer ? '' : (r.syncError || '')
  }));
  let studyRecords = (Array.isArray(raw.studyRecords) ? raw.studyRecords : defaultStudyRecords(userName)).map(r =>
    normalizeStudyRecord({
      ...r,
      syncStatus: fromServer ? 'synced' : (r.syncStatus || 'local'),
      syncError: fromServer ? '' : (r.syncError || '')
    })
  );
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
      const linkedSec = studyRecords.filter(r => r.person === userName && r.targetId === t.id).reduce((s, r) => s + studySecondsOf(r), 0);
      const linkedHours = linkedSec / 3600;
      const baseHours = Number.isFinite(t.baseHours) ? t.baseHours : Math.max(0, roundedStudyHours((Number(t.doneHours) || 0) - linkedHours));
      return { ...t, archived: Boolean(t.archived), baseHours, doneHours: Math.max(0, roundedStudyHours(baseHours + linkedHours)) };
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
const VALID_VIEWS = ['home', 'progress', 'plan', 'study', 'ranking', 'achievements', 'records', 'people', 'more'];
const hashView = (typeof location !== 'undefined' && location.hash) ? location.hash.replace(/^#/, '').split('?')[0] : '';
let view = params.get('view') || (VALID_VIEWS.includes(hashView) ? hashView : 'home');
let showArchivedTargets = false, showArchivedHabits = false, pendingImportBackup = null;
let rankPeriod = '本月', rankMetric = '综合积分', progressTab = '双轨总览', chartType = '7天趋势', achFilter = '全部';
let recordKindFilter = 'all'; // 'all' | 'sport' | 'study'
let recordPersonFilter = 'mine'; // 'mine' | 'all'
let recordRangeFilter = '7d'; // '7d' | '30d' | 'all'
let recordTrendMode = 'daily'; // 'daily' | 'cum'
let recordSelectedDate = ''; // '' (full interval) | 'YYYY-MM-DD'
let recordsMoreOpen = false;
let recordsMoreChartType = '28天热力'; // '28天热力' | '黄金时段' | '强度分布' | '状态感觉'
let externalFilterNotice = '';
let lastReceiptFocusSelector = '';
let lastEditorOpener = null;
let lastEditorFocusSelector = '';
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
let arenaSprintStart = 0;
let arenaSprintUntil = 0;
let electricSweepUntil = 0;
let flameMegaSurgeUntil = 0;
let newlyArchivedRecordKey = '';
let feedbackClearTimer = 0;
let feedbackAnimId = 0;

// Real-timestamp Pomodoro timer state (persisted across reloads)
function loadPomoSession() {
  try {
    const raw = JSON.parse(localStorage.getItem(POMO_KEY) || 'null');
    if (raw && typeof raw === 'object' && Number.isFinite(raw.totalSec)) {
      if (raw.state === 'saving') return { ...raw, state: 'paused', errorMsg: '保存中断，请重试同步' };
      return raw;
    }
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
  if (pomoSession.state === 'completed' || pomoSession.state === 'saved') {
    if (pomoSession.completedAt && pomoSession.startedAt) {
      return Math.min(pomoSession.totalSec, Math.max(0, Math.round((pomoSession.completedAt - pomoSession.startedAt - (pomoSession.pausedAccumMs || 0)) / 1000)));
    }
    return pomoSession.totalSec;
  }
  const refNow = (pomoSession.state === 'paused' || pomoSession.state === 'saving')
    ? (pomoSession.completedAt || pomoSession.pauseStartedAt || Date.now())
    : Date.now();
  const ms = Math.max(0, refNow - (pomoSession.startedAt || refNow) - (pomoSession.pausedAccumMs || 0));
  return Math.min(pomoSession.totalSec, Math.floor(ms / 1000));
}
function getStudyFocusEntryMeta() {
  const leftText = formatTimer(getPomoLeftSec());
  const targetTitle = findTargetTitle(pomodoroTargetId);
  if (pomoSession.state === 'running') {
    return { label: '查看专注', stateText: '进行中 · 剩余 ' + leftText, aria: '查看专注，' + targetTitle + '，剩余 ' + leftText };
  }
  if (pomoSession.state === 'paused') {
    return { label: '继续专注', stateText: '已暂停 · 剩余 ' + leftText, aria: '继续专注，' + targetTitle + '，剩余 ' + leftText };
  }
  if (pomoSession.state === 'completed') {
    return { label: '查看专注', stateText: '待记入 · ' + Math.floor(getPomoElapsedSec() / 60) + ' 分钟', aria: '查看专注，本轮已完成待记入' };
  }
  return { label: '开始专注', stateText: '', aria: '开始专注，当前目标 ' + targetTitle };
}
function getPomoLeftSec() { return Math.max(0, pomoSession.totalSec - getPomoElapsedSec()); }
let pomodoroTotal = pomoSession.totalSec, pomodoroLeft = getPomoLeftSec(), pomodoroRunning = pomoSession.state === 'running', pomodoroTick = null;
let pomodoroTargetId = pomoSession.targetId || state.studyTargets[0]?.id || 'st-1';

let quoteIndex = params.has('quote') ? Number(params.get('quote')) : 0, quoteTimer, step = 0, draft = null, modalPreviousFocus = null, modalPreviousFocusSelector = '', toastTimer, dialogSave = null;
if (!VALID_VIEWS.includes(view)) view = 'home';

const nav = [
  ['home', '今天', 'track'],
  ['records', '记录', 'chart'],
  ['ranking', '排名', 'trophy'],
  ['more', '更多', 'more']
];
const MORE_ITEMS = [
  { id: 'progress', label: '进度', icon: 'pulse', sub: '目标完成率与趋势' },
  { id: 'plan', label: '运动', icon: 'shoe', sub: '跑步计划与里程打卡' },
  { id: 'study', label: '学习', icon: 'book', sub: '专注番茄与学习目标' },
  { id: 'achievements', label: '成就', icon: 'medal', sub: '勋章与连续里程碑' },
  { id: 'people', label: '自律', icon: 'sunrise', sub: '每日习惯与同行伙伴' }
];
const MORE_VIEWS = MORE_ITEMS.map(x => x.id);
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
  spark: '<path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6z"/>',
  more: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.2"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.2"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.2"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.2"/>'
};

function icon(name, cls = '') {
  return '<svg class="ui-ico ' + cls + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || ICONS.spark) + '</svg>';
}

const hasLocalStorage = (() => {
  try { const k = '__rl_chk'; localStorage.setItem(k, '1'); localStorage.removeItem(k); return true; } catch { return false; }

// Register PWA Service Worker for offline static shell (never intercepts /api/*)
if (!embedded && !demo && typeof navigator !== 'undefined' && 'serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
})();

/* ---------- Dual-Mode Server Sync Client (Online REST+SSE + PendingOps + Structured Errors) ---------- */
let isServerOnline = false;
let currentRoomCode = params.get('room') || (hasLocalStorage ? (() => { try { return localStorage.getItem('running_room_code'); } catch { return null; } })() : null) || 'default';
let sseSource = null;
let lastSyncError = '';
let pendingOps = (() => {
  try { const a = JSON.parse(localStorage.getItem(PENDING_OPS_KEY) || '[]'); return Array.isArray(a) ? a : []; } catch { return []; }
})();
const inFlightOpIds = new Set();
let syncRetrying = false;
function savePendingOps() { try { localStorage.setItem(PENDING_OPS_KEY, JSON.stringify(pendingOps)); } catch {} }
function nextOpId(prefix = 'op') { return prefix + '-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8); }
function roomPendingOps(room = currentRoomCode) {
  return pendingOps.filter(x => (x.roomCode || 'default') === room);
}
const recentSelfOpIds = new Set();
function markSelfOpId(opId) {
  if (!opId) return;
  recentSelfOpIds.add(opId);
  if (recentSelfOpIds.size > 150) {
    const first = recentSelfOpIds.values().next().value;
    recentSelfOpIds.delete(first);
  }
}
function enqueuePendingOp(op) {
  if (!op || !op.operationId) return;
  markSelfOpId(op.operationId);
  const normalized = {
    roomCode: currentRoomCode,
    status: 'pending',
    lastError: '',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...op
  };
  const idx = pendingOps.findIndex(x =>
    x.operationId === normalized.operationId ||
    (normalized.coalesceKey && x.coalesceKey === normalized.coalesceKey && (x.roomCode || 'default') === (normalized.roomCode || 'default') && !inFlightOpIds.has(x.operationId))
  );
  if (idx >= 0) pendingOps[idx] = { ...pendingOps[idx], ...normalized, updatedAt: Date.now() };
  else pendingOps.push(normalized);
  savePendingOps();
}
async function queueOrSendWriteOp(op) {
  enqueuePendingOp(op);
  if (isServerOnline) {
    return await flushPendingOps(op.operationId);
  }
  return { synced: 0, failed: 0, queued: true };
}
function queueSavedCheckin(kind, record) {
  enqueuePendingOp({ operationId: record.operationId, kind, recordId: record.id,
    roomCode: record.checkinRoom, endpoint: '/records/' + kind, method: 'POST', payload: record });
}
if (!demo) {
  for (const [kind, records] of [['sport', state.records], ['study', state.studyRecords]]) {
    for (const record of records) {
      if (record.checkinRoom === currentRoomCode && record.syncStatus !== 'synced' && record.operationId &&
          !pendingOps.some(op => op.operationId === record.operationId)) queueSavedCheckin(kind, record);
    }
  }
}
function removePendingOp(opId) { pendingOps = pendingOps.filter(x => x.operationId !== opId); savePendingOps(); }
function syncStatusMeta(status) {
  if (status === 'synced') return { key: 'synced', label: '已同步', detail: '已同步至服务器' };
  if (status === 'pending') return { key: 'pending', label: '等待同步', detail: '已存本机，等待同步' };
  if (status === 'failed') return { key: 'failed', label: '同步失败', detail: '同步失败，可点击重试' };
  return { key: 'local', label: '本机已保存', detail: '离线已保存在本机浏览器' };
}
function syncPillMarkup(rec) {
  const op = rec && rec.operationId ? pendingOps.find(x => x.operationId === rec.operationId) : null;
  const st = op ? (op.status === 'failed' ? 'failed' : (isServerOnline ? 'pending' : (rec.syncStatus === 'local' ? 'local' : 'pending'))) : (rec?.syncStatus || (isServerOnline ? 'synced' : 'local'));
  const meta = syncStatusMeta(st);
  return '<span class="ck-sync-pill is-' + meta.key + '" title="' + esc(rec?.syncError || op?.lastError || meta.detail) + '">' + meta.label + '</span>';
}
function recordSyncStateKey(rec) {
  const op = rec && rec.operationId ? pendingOps.find(x => x.operationId === rec.operationId) : null;
  if (rec && rec.syncError) return 'failed';
  if (op) return op.status === 'failed' ? 'failed' : (isServerOnline ? 'pending' : (rec.syncStatus === 'local' ? 'local' : 'pending'));
  return rec?.syncStatus || (isServerOnline ? 'synced' : 'local');
}
function beijingDateOf(rec) {
  const raw = rec && (rec.date || rec.createdAt);
  if (typeof raw === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
    const dt = new Date(raw);
    if (!Number.isNaN(dt.getTime())) {
      try {
        const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(dt);
        const y = parts.find(p => p.type === 'year')?.value;
        const m = parts.find(p => p.type === 'month')?.value;
        const d = parts.find(p => p.type === 'day')?.value;
        if (y && m && d) return y + '-' + m + '-' + d;
      } catch {}
      return dateKey(new Date(dt.toLocaleString('en-US', { timeZone: 'Asia/Shanghai' })));
    }
  }
  return today();
}
function updateLocalRecordSyncStatus(kind, opId, recId, status, errMsg = '', serverRec = null) {
  const arr = kind === 'study' ? state.studyRecords : state.records;
  const target = arr.find(r => (opId && r.operationId === opId) || (recId !== undefined && recId !== null && r.id === recId));
  if (!target) return;
  if (serverRec && typeof serverRec === 'object') {
    const oldKey = kind + ':' + target.id;
    Object.assign(target, kind === 'study' ? normalizeStudyRecord(serverRec) : serverRec);
    if (recordSelectKey === oldKey) recordSelectKey = kind + ':' + target.id;
    if (newlyArchivedRecordKey === oldKey) newlyArchivedRecordKey = kind + ':' + target.id;
  }
  target.syncStatus = status;
  target.syncError = errMsg || '';
  if (opId && !target.operationId) target.operationId = opId;
}
function insertLocalRecordDedup(kind, rec, data = state) {
  const arr = kind === 'study' ? data.studyRecords : data.records;
  const normalized = kind === 'study' ? normalizeStudyRecord(rec) : rec;
  const existingIdx = arr.findIndex(r => (normalized.operationId && r.operationId === normalized.operationId) || r.id === normalized.id);
  if (existingIdx >= 0) {
    arr[existingIdx] = { ...arr[existingIdx], ...normalized };
    return arr[existingIdx];
  }
  arr.unshift(normalized);
  return normalized;
}
async function flushPendingOps(onlyOpId = null) {
  if (!isServerOnline) return { synced: 0, failed: roomPendingOps().length };
  const list = roomPendingOps().filter(op => !onlyOpId || op.operationId === onlyOpId);
  if (!list.length) return { synced: 0, failed: 0 };
  let synced = 0, failed = 0;
  for (const op of list) {
    if (inFlightOpIds.has(op.operationId)) continue;
    inFlightOpIds.add(op.operationId);
    op.status = 'pending';
    op.updatedAt = Date.now();
    savePendingOps();
    updateLocalRecordSyncStatus(op.kind, op.operationId, op.recordId, 'pending', '');
    try {
      markSelfOpId(op.operationId);
      const payload = { ...(op.payload || {}), room: op.roomCode || currentRoomCode, operationId: op.operationId };
      const res = await serverFetch(op.endpoint, op.method || 'POST', payload);
      if (res && res.ok) {
        if (op.kind === 'sport' || op.kind === 'study') {
          updateLocalRecordSyncStatus(op.kind, op.operationId, op.recordId, 'synced', '', res.record || null);
        }
        if (typeof res.version === 'number') state.dataVersion = res.version;
        removePendingOp(op.operationId);
        lastSyncError = '';
        synced++;
      } else {
        const errText = (res && res.error) || '网络连接失败';
        op.status = 'failed';
        op.lastError = errText;
        op.updatedAt = Date.now();
        savePendingOps();
        updateLocalRecordSyncStatus(op.kind, op.operationId, op.recordId, 'failed', errText);
        lastSyncError = errText;
        failed++;
        if (!res || res.status === 0) break;
      }
    } finally {
      inFlightOpIds.delete(op.operationId);
    }
  }
  recomputeStudyTargetDoneHours();
  persistLocalOnly();
  return { synced, failed };
}
async function retryPendingOps(onlyOpId = null) {
  if (syncRetrying) return;
  syncRetrying = true;
  try {
    if (!isServerOnline) {
      const online = await checkServerHealth();
      if (online) {
        isServerOnline = true;
        initSSE();
      } else {
        const targets = roomPendingOps().filter(op => !onlyOpId || op.operationId === onlyOpId);
        targets.forEach(op => {
          op.status = 'failed';
          op.lastError = '当前仍处于离线状态，无法连接服务器';
          updateLocalRecordSyncStatus(op.kind, op.operationId, op.recordId, 'failed', op.lastError);
        });
        savePendingOps();
        persistLocalOnly();
        render(true);
        toast('服务器暂未连通，记录仍保留在本机，可稍后重试。');
        return;
      }
    }
    const out = await flushPendingOps(onlyOpId);
    if (out.synced > 0 && roomPendingOps().length === 0) {
      const remoteState = await serverFetch('/state');
      if (remoteState && remoteState.ok) {
        state = mergeRemoteState(remoteState);
        persistLocalOnly();
      }
    }
    render(true);
    if (out.failed === 0 && out.synced > 0) toast('已成功同步 ' + out.synced + ' 条记录至服务器！');
    else if (out.failed > 0) toast('同步失败：' + (lastSyncError || '请稍后重试') + '（记录已保留）');
    else toast('当前没有待同步记录。');
  } finally {
    syncRetrying = false;
  }
}
function mergeRemoteState(remoteRaw) {
  const prevSport = state ? [...state.records] : [];
  const prevStudy = state ? [...state.studyRecords] : [];
  const next = hydrateState(remoteRaw, { fromServer: true });
  const pendingIds = new Set(roomPendingOps().map(x => x.operationId));
  if (pendingIds.size) {
    prevSport.forEach(r => {
      if (r.operationId && pendingIds.has(r.operationId) && !next.records.some(x => x.id === r.id || (x.operationId && x.operationId === r.operationId))) {
        next.records.unshift(r);
      }
    });
    prevStudy.forEach(r => {
      if (r.operationId && pendingIds.has(r.operationId) && !next.studyRecords.some(x => x.id === r.id || (x.operationId && x.operationId === r.operationId))) {
        next.studyRecords.unshift(normalizeStudyRecord(r));
      }
    });
    recomputeStudyTargetDoneHours(next);
  }
  return next;
}

/* ---------- Scoped Check-in Draft Persistence (Room + User + Mode Isolated, IDB Photo Store) ---------- */
const DRAFT_IDB_NAME = 'run_log_ck_draft_media';
const DRAFT_IDB_STORE = 'photos';
function openDraftPhotoDb() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') { reject(new Error('no-idb')); return; }
    const req = indexedDB.open(DRAFT_IDB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(DRAFT_IDB_STORE)) db.createObjectStore(DRAFT_IDB_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('idb-open-failed'));
  });
}
async function draftPhotoIdbPut(key, dataUrl) {
  try {
    const db = await openDraftPhotoDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(DRAFT_IDB_STORE, 'readwrite');
      tx.objectStore(DRAFT_IDB_STORE).put(dataUrl, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
    return true;
  } catch { return false; }
}
async function draftPhotoIdbGet(key) {
  try {
    const db = await openDraftPhotoDb();
    const val = await new Promise((resolve, reject) => {
      const tx = db.transaction(DRAFT_IDB_STORE, 'readonly');
      const r = tx.objectStore(DRAFT_IDB_STORE).get(key);
      r.onsuccess = () => resolve(r.result || '');
      r.onerror = () => reject(r.error);
    });
    db.close();
    return val;
  } catch { return ''; }
}
async function draftPhotoIdbDel(key) {
  try {
    const db = await openDraftPhotoDb();
    await new Promise(resolve => {
      const tx = db.transaction(DRAFT_IDB_STORE, 'readwrite');
      tx.objectStore(DRAFT_IDB_STORE).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
    db.close();
  } catch {}
}
function draftStorageKey(mode = 'sport', room = currentRoomCode, owner = state?.name || '') {
  return STORE + '_ck_draft::' + encodeURIComponent(String(room || 'default')) + '::' + encodeURIComponent(String(owner || 'default')) + '::' + encodeURIComponent(String(mode || 'sport'));
}
function getSavedDraft(mode = 'sport') {
  if (demo || !hasLocalStorage) return null;
  try {
    const raw = localStorage.getItem(draftStorageKey(mode));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    if (parsed.roomCode !== currentRoomCode || parsed.owner !== state.name || parsed.mode !== mode) return null;
    if (mode === 'study') {
      const { minutes, hours, ...savedDraft } = parsed;
      const seconds = Math.max(60, Math.min(16 * 3600, studySecondsOf(parsed) || 90 * 60));
      return { ...savedDraft, seconds };
    }
    const minutes = Math.max(1, Math.round(Number(parsed.minutes) || 30));
    return { ...parsed, seconds: minutes * 60, minutes, hours: roundedStudyHours(minutes / 60) };
  } catch { return null; }
}
function clearSavedDraft(mode = 'sport') {
  if (!hasLocalStorage) return;
  const key = draftStorageKey(mode);
  try { localStorage.removeItem(key); } catch {}
  draftPhotoIdbDel(key);
}
function persistCheckinDraft(d = draft, s = step) {
  if (!d || demo || !hasLocalStorage) return;
  const key = draftStorageKey(d.mode);
  const isDataPhoto = typeof d.photo === 'string' && d.photo.startsWith('data:image/');
  const payload = {
    version: 1,
    roomCode: currentRoomCode,
    owner: state.name,
    mode: d.mode,
    step: Math.max(0, Math.min(4, Number(s) || 0)),
    person: d.person,
    date: d.date,
    km: d.km,
    seconds: d.mode === 'study' ? studySecondsOf(d) : Math.max(60, Math.round((d.minutes || 30) * 60)),
    minutes: d.mode === 'study' ? studyMinutesOf(d) : d.minutes,
    hours: d.mode === 'study' ? studyHoursOf(d) : d.hours,
    targetId: d.targetId,
    feel: d.feel,
    tags: Array.isArray(d.tags) ? d.tags : [],
    note: d.note || '',
    photo: isDataPhoto ? '' : (d.photo || ''),
    photoInIdb: isDataPhoto,
    photoStorage: d.photoStorage || '',
    operationId: d.operationId,
    extrasOpen: d.extrasOpen,
    time: d.time,
    savedAt: Date.now()
  };
  try {
    localStorage.setItem(key, JSON.stringify(payload));
  } catch {}
  if (isDataPhoto) draftPhotoIdbPut(key, d.photo);
  else draftPhotoIdbDel(key);
}
function setDraftStudySeconds(sec) {
  draft.seconds = Math.max(60, Math.min(16 * 3600, Math.round(sec)));
}
function draftStudyHoursInputValue() {
  // Four decimal places can round-trip every whole second.
  return Number((draft.seconds / 3600).toFixed(4));
}
function updateStudyDurationPreview(unit) {
  const isHours = unit === 'hours';
  const seconds = draft.seconds;
  const minutes = studyMinutesOf(draft);
  const hours = studyHoursOf(draft);
  const preview = $(isHours ? '#ck-study-derived' : '#ck-study-min-derived');
  if (preview) preview.innerHTML = '<strong>' + (isHours ? minutes + ' 分钟' : hours.toFixed(2) + ' 小时') + '</strong>（' + seconds + ' 秒）';
  $$('[data-modal="' + unit + '-set"]').forEach(el => {
    const value = Number(el.dataset.value);
    el.classList.toggle('selected', isHours ? value * 3600 === seconds : value === minutes);
  });
}
function photoStorageHint(d) {
  if (!d) return '';
  if (d.photoUploading) return '正在上传照片至服务器（/uploads），请稍候…';
  if (d.photoRestoreWarning && !d.photo) return '提示：上次的离线本地照片未能随草稿恢复，如需附图请重新选择。';
  if (d.photo) {
    if (d.photo.startsWith('/uploads/') || (d.photo.startsWith('http://') || d.photo.startsWith('https://'))) {
      return '✓ 照片已上传至服务器（/uploads），保存打卡后可跨设备在记录档案中查看。';
    }
    if (d.photoStorage === 'local-fallback') {
      return '⚠ 服务器上传失败，照片已降级保存在当前浏览器本地（仅本机可见）。';
    }
    return '● 照片已压缩并仅保存在当前浏览器本地（离线存储，仅本机可见）。';
  }
  return isServerOnline
    ? '在线模式：选择照片后将上传至服务器（/uploads），跨设备可见；若上传失败则自动降级保存在当前浏览器。'
    : '离线模式：照片将压缩后仅保存在当前浏览器本地，清理缓存或换设备后不可见。';
}
function photoTicketLabel(d) {
  if (!d || !d.photo) return '本次无照片';
  if (d.photo.startsWith('/uploads/') || (d.photo.startsWith('http://') || d.photo.startsWith('https://'))) return '已上传服务器 ✓';
  return d.photoStorage === 'local-fallback' ? '仅存本机（上传降级）' : '仅存当前浏览器';
}

async function checkServerHealth() {
  if (embedded || demo) return false;
  if (location.hostname.endsWith('.github.io')) return false;
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
    sseSource.addEventListener('state_change', async ev => {
      let evt = null;
      try { evt = ev && ev.data ? JSON.parse(ev.data) : null; } catch {}
      if (evt && evt.operationId && (recentSelfOpIds.has(evt.operationId) || inFlightOpIds.has(evt.operationId))) {
        if (typeof evt.rev === 'number') state.dataVersion = Math.max(state.dataVersion || 1, evt.rev);
        return;
      }
      if (hasActiveEditingState() || roomPendingOps().length > 0) {
        toast('收到远端数据更新，保存当前编辑后自动同步');
        return;
      }
      const sinceRev = Number(state.dataVersion) || 0;
      const diffRes = await serverFetch('/changes?room=' + encodeURIComponent(currentRoomCode) + '&since=' + sinceRev);
      if (diffRes && diffRes.ok) {
        if (!diffRes.hasChanges) return;
        if (diffRes.state) {
          state = mergeRemoteState(diffRes.state);
          persistLocalOnly();
          render(true);
          return;
        }
      }
      const remoteState = await serverFetch('/state');
      if (remoteState && remoteState.ok) {
        state = mergeRemoteState(remoteState);
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
      state = mergeRemoteState(latest);
      persistLocalOnly();
      render(true);
    }
  } else {
    toast('同步失败：' + (res?.error || '请检查网络或后端状态'));
  }
}

function persistLocalOnly(data = state) {
  if (demo) return true;
  try {
    localStorage.setItem(STORE, JSON.stringify(data));
    return true;
  } catch {
    toast('本机存储不可用或空间不足。');
    return false;
  }
}

function persist(syncPlans = false) {
  persistLocalOnly();
  if (syncPlans) {
    queueOrSendWriteOp({
      operationId: nextOpId('plan'),
      coalesceKey: 'plans',
      kind: 'plans',
      endpoint: '/plans',
      method: 'PATCH',
      payload: {
        goal: state.goal,
        days: state.days,
        studyGoal: state.studyGoal,
        studyDays: state.studyDays,
        sportDatePlan: state.sportDatePlan,
        studyDatePlan: state.studyDatePlan
      }
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
function totalStudySeconds(records = state.studyRecords) { return records.reduce((s, r) => s + studySecondsOf(r), 0); }
function totalStudyMinutes(records = state.studyRecords) { return Math.round(totalStudySeconds(records) / 60); }
function totalStudy(records = state.studyRecords) { return roundedStudyHours(totalStudySeconds(records) / 3600); }
function monthly(records = state.records) { return records.filter(r => r.date.slice(0, 7) === today().slice(0, 7)); }
function weekStart() { const d = chinaNow(); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return dateKey(d); }
function weekly(records = state.records) { return records.filter(r => r.date >= weekStart() && r.date <= today()); }
function mine(records = state.records) { return records.filter(r => r.person === state.name); }
function mineStudy(records = state.studyRecords) { return records.filter(r => r.person === state.name); }
function todaySportSummary(name = state.name) {
  const dk = today();
  const recs = state.records.filter(r => r.person === name && r.date === dk);
  const km = Math.round(total(recs) * 100) / 100;
  return { count: recs.length, km, done: recs.length > 0 };
}
function todayStudySummary(name = state.name) {
  const dk = today();
  const recs = state.studyRecords.filter(r => r.person === name && r.date === dk);
  const seconds = totalStudySeconds(recs);
  const minutes = Math.round(seconds / 60);
  const hours = roundedStudyHours(seconds / 3600);
  return { count: recs.length, seconds, minutes, hours, done: recs.length > 0 };
}
function runToday(name = state.name) { return todaySportSummary(name).done; }
function studyToday(name = state.name) { return todayStudySummary(name).done; }
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
function recomputeStudyTargetDoneHours(data = state) {
  data.studyTargets.forEach(t => {
    const linked = data.studyRecords.filter(r => r.person === data.name && r.targetId === t.id);
    t.doneHours = Math.max(0, roundedStudyHours((Number(t.baseHours) || 0) + totalStudySeconds(linked) / 3600));
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
function comboTier(days = dualStreak()) {
  if (days >= 30) return { tier: 5, code: 'SIGMA MAX', label: '三十日长期主义', color: '#38bdf8', accent: '#ffd026', nextAt: null, prevAt: 30 };
  if (days >= 14) return { tier: 4, code: 'LEGEND', label: '十四日传奇连击', color: '#ffd026', accent: '#ff5a2f', nextAt: 30, prevAt: 14 };
  if (days >= 7) return { tier: 3, code: 'HYPER', label: '七日全勤觉醒', color: '#38bdf8', accent: '#ff6b3d', nextAt: 14, prevAt: 7 };
  if (days >= 3) return { tier: 2, code: 'OVERDRIVE', label: '三日定力突破', color: '#ff6b3d', accent: '#ffd026', nextAt: 7, prevAt: 3 };
  if (days >= 1) return { tier: 1, code: 'IGNITE', label: '初燃连击启动', color: '#e5492b', accent: '#f6ad55', nextAt: 3, prevAt: 1 };
  return { tier: 0, code: 'STANDBY', label: '等待点亮连击', color: '#64748b', accent: '#94a3b8', nextAt: 1, prevAt: 0 };
}
function comboPixelEmblemSvg(tierObj, size = 40) {
  const t = tierObj.tier;
  const c1 = tierObj.color;
  const c2 = tierObj.accent;
  const frame = t >= 3 ? '<rect x="0" y="0" width="2" height="2" fill="' + c1 + '"/><rect x="10" y="0" width="2" height="2" fill="' + c2 + '"/><rect x="0" y="10" width="2" height="2" fill="' + c2 + '"/><rect x="10" y="10" width="2" height="2" fill="' + c1 + '"/>' : '';
  let core = '<rect x="5" y="4" width="2" height="2" fill="' + c1 + '"/><rect x="4" y="6" width="4" height="2" fill="' + c1 + '"/><rect x="5" y="7" width="2" height="1" fill="' + c2 + '"/>';
  if (t >= 2) {
    core = '<rect x="5" y="2" width="2" height="2" fill="' + c2 + '"/><rect x="4" y="4" width="4" height="2" fill="' + c1 + '"/><rect x="3" y="6" width="6" height="3" fill="' + c1 + '"/><rect x="5" y="5" width="2" height="3" fill="#fffbe0"/>';
  }
  if (t >= 3) {
    core = '<rect x="2" y="3" width="2" height="2" fill="' + c2 + '"/><rect x="5" y="2" width="2" height="2" fill="#fffbe0"/><rect x="8" y="3" width="2" height="2" fill="' + c2 + '"/><rect x="3" y="5" width="6" height="2" fill="' + c1 + '"/><rect x="2" y="7" width="8" height="2" fill="' + c1 + '"/><rect x="4" y="6" width="4" height="2" fill="#fffbe0"/>';
  }
  if (t >= 4) {
    core = '<rect x="5" y="1" width="2" height="2" fill="#fffbe0"/><rect x="3" y="3" width="6" height="2" fill="' + c1 + '"/><rect x="2" y="5" width="8" height="3" fill="' + c2 + '"/><rect x="4" y="4" width="4" height="3" fill="#fffbe0"/><rect x="3" y="8" width="6" height="2" fill="' + c1 + '"/>';
  }
  if (t >= 5) {
    core = '<rect x="5" y="1" width="2" height="10" fill="#fffbe0"/><rect x="1" y="5" width="10" height="2" fill="' + c1 + '"/><rect x="3" y="3" width="6" height="6" fill="' + c2 + '"/><rect x="4" y="4" width="4" height="4" fill="#090e1c"/><rect x="5" y="5" width="2" height="2" fill="#fffbe0"/>';
  }
  return '<svg class="combo-pixel-emblem" viewBox="0 0 12 12" width="' + size + '" height="' + size + '" shape-rendering="crispEdges" aria-hidden="true">' + frame + core + '</svg>';
}
function getStudyFocusCharge() {
  const stH = totalStudy(monthly(mineStudy()));
  const monthlyBase = Math.min(0.32, (stH / Math.max(1, state.studyGoal)) * 0.32);
  let pomoPart = 0;
  if (pomoSession.state === 'running' || pomoSession.state === 'paused') {
    const ratio = Math.min(1, getPomoElapsedSec() / Math.max(60, pomoSession.totalSec));
    pomoPart = 0.18 + ratio * 0.82;
  } else if (pomoSession.state === 'completed' || performance.now() < electricSweepUntil) {
    pomoPart = 1;
  }
  const chargeNorm = Math.min(1, Math.max(monthlyBase, pomoPart));
  return {
    chargeNorm,
    chargePct: Math.round(chargeNorm * 100),
    isFocusing: pomoSession.state === 'running'
  };
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
    const blueItems = [
      '抓住了，命运的王牌',
      '改变命运的瞬间就在这不起眼的现在',
      '错也好，错过也好，过去就好',
      '没有人是你的敌人，叶寒风',
      '别再躲在人群里当一个懦夫',
      '永远不再逃避'
    ];
    const blueChunks = blueItems.map(t => '<span>' + esc(t) + '</span><em>✦</em>').join('');
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

function ckEntryBarsMarkup(modes = ['sport', 'study']) {
  const parts = [];
  modes.forEach(m => {
    const saved = getSavedDraft(m);
    if (saved) {
      const mLabel = m === 'study' ? '学习打卡' : '运动打卡';
      const detail = m === 'study'
        ? (studyMinutesOf(saved) + ' 分钟 / ' + studyHoursOf(saved).toFixed(1) + 'h')
        : (Number(saved.km || 5).toFixed(1) + ' km · ' + (saved.minutes || 30) + ' min');
      parts.push(
        '<div class="ck-entry-bar is-draft" role="status">'
        + '<span class="ck-entry-text"><strong>未完成' + mLabel + '草稿</strong> · ' + esc(detail) + '（第 ' + ((saved.step || 0) + 1) + '/5 步）</span>'
        + '<span class="ck-entry-actions">'
        + '<button type="button" class="ck-btn ck-btn-primary" data-action="resume-draft" data-mode="' + m + '">继续填写</button>'
        + '<button type="button" class="ck-btn ck-btn-ghost" data-action="discard-draft" data-mode="' + m + '">丢弃草稿</button>'
        + '</span></div>'
      );
    }
  });
  const ops = roomPendingOps();
  if (ops.length) {
    const failedOps = ops.filter(x => x.status === 'failed');
    const isFailed = failedOps.length > 0;
    const statusKey = isFailed ? 'failed' : (isServerOnline ? 'pending' : 'local');
    const meta = syncStatusMeta(statusKey);
    const detail = isFailed
      ? (failedOps.length + ' 条 · ' + esc(failedOps[0].lastError || '请检查网络后重试'))
      : (ops.length + ' 条' + (isServerOnline ? '待上传至服务器' : '已存本机，联网后可同步'));
    parts.push(
      '<div class="ck-entry-bar ' + (isFailed ? 'is-failed' : (isServerOnline ? 'is-pending' : 'is-local')) + '" role="' + (isFailed ? 'alert' : 'status') + '">'
      + '<span class="ck-entry-text"><strong>' + meta.label + '</strong> · ' + detail + '</span>'
      + '<span class="ck-entry-actions">'
      + '<button type="button" class="ck-btn ck-btn-retry" data-action="retry-sync">重试同步</button>'
      + '</span></div>'
    );
  }
  return parts.length ? '<div class="ck-entry-bars">' + parts.join('') + '</div>' : '';
}

function cta(coral = false) {
  const rs = todaySportSummary(), ss = todayStudySummary();
  const sportLabel = '记运动';
  const studyLabel = '记学习';
  const sportSummary = rs.done
    ? ('今日 ' + rs.km.toFixed(1) + ' km · ' + rs.count + ' 次')
    : '今日 0 km · 0 次';
  const studySummary = ss.done
    ? ('今日 ' + ss.minutes + ' 分钟 · ' + ss.count + ' 次')
    : '今日 0 分钟 · 0 次';
  const entryBars = ckEntryBarsMarkup(['sport', 'study']);

  if (coral) {
    return '<div class="cta-dual-bar">'
      + '<button class="checkin-cta coral" data-action="checkin" data-mode="sport" aria-label="' + sportLabel + '，' + sportSummary + '"><span><strong>' + sportLabel + '</strong><small class="ck-cta-summary">' + sportSummary + '</small></span>' + arrowBoxMarkup() + '</button>'
      + '<button class="checkin-cta blue-cta" data-action="checkin" data-mode="study" aria-label="' + studyLabel + '，' + studySummary + '"><span><strong>' + studyLabel + '</strong><small class="ck-cta-summary">' + studySummary + '</small></span>' + arrowBoxMarkup() + '</button>'
      + '</div>' + entryBars;
  }
  return '<div class="checkin-cta dual-home-cta">'
    + '<button class="dual-cta-half is-sport" data-action="checkin" data-mode="sport" aria-label="' + sportLabel + '，' + sportSummary + '"><span><strong>' + sportLabel + '</strong><small class="ck-cta-summary">' + sportSummary + '</small></span>' + arrowBoxMarkup() + '</button>'
    + '<button class="dual-cta-half is-study" data-action="checkin" data-mode="study" aria-label="' + studyLabel + '，' + studySummary + '"><span><strong>' + studyLabel + '</strong><small class="ck-cta-summary">' + studySummary + '</small></span>' + arrowBoxMarkup() + '</button>'
    + entryBars
    + '</div>';
}

const quotes = [
  ['SMALL STEPS.<br><em>EVERY</em> DAY.', 'flame', '不积跬步，无以至千里'],
  ['DISCIPLINE IS<br><em>FREEDOM.</em>', 'lightning', '自律的尽头，是真正的自由'],
  ['SHARP MIND.<br>STRONG <em>BODY.</em>', 'storm', '头脑清醒，体魄强健'],
  ['ONE MORE<br><em>CHAPTER.</em>', 'flame', '再多学一章，再多跑一程'],
  ['EARN YOUR<br><em>PEACE.</em>', 'lightning', '流过汗与墨，才配得上从容'],
  ['YOUR PACE.<br><em>YOUR</em> FUTURE.', 'storm', '按自己的配速，跑向自己的未来'],
  ['SHOW UP<br><em>BEFORE</em> DAWN.', 'flame', '在天亮之前出发，在喧嚣之前沉思'],
  ['DEEP WORK.<br><em>ZERO</em> EXCUSES.', 'lightning', '深度专注，绝不拖延'],
  ['RUN WITH<br><em>RIVALS.</em>', 'storm', '与强手并肩，在竞技中共同进化'],
  ['CONSISTENCY<br>BEATS <em>TALENT.</em>', 'flame', '持续执行，远胜一时天赋'],
  ['SWEAT NOW.<br><em>SHINE</em> LATER.', 'flame', '此刻流汗，来日闪光'],
  ['READ HARD.<br>THINK <em>CLEAR.</em>', 'lightning', '深读硬啃，思考清澈'],
  ['START EARLY.<br><em>FINISH</em> STRONG.', 'flame', '清晨启程，强势收官'],
  ['BUILD HABITS.<br><em>SHAPE</em> DESTINY.', 'lightning', '习惯成自然，日常塑命运'],
  ['KEEP MOVING.<br><em>NO</em> SHORTCUTS.', 'storm', '步履不停，没有捷径']
];

function quoteMarkup() {
  const idx = quoteIndex % quotes.length;
  const q = quotes[idx];
  const theme = q[1] || 'lightning';
  const themeTag = theme === 'flame' ? 'PIXEL.FLAME' : theme === 'lightning' ? 'PIXEL.LIGHTNING' : theme === 'storm' ? 'PIXEL.STORM' : theme === 'frost' ? 'PIXEL.FROST' : 'PIXEL.MATRIX';
  const dots = quotes.map((_, i) => '<button type="button" class="quote-dot ' + (i === idx ? 'active' : '') + '" data-quote="' + i + '" aria-label="切换到第 ' + (i + 1) + ' 句宣言"><i class="quote-dot-fill"></i></button>').join('');
  return '<section class="quote ' + theme + '" id="quote" aria-label="每日宣言卡片">'
    + '<canvas class="pixel-matrix-canvas" data-pixel-theme="' + theme + '" aria-hidden="true"></canvas>'
    + '<div class="quote-meta"><span>[ 今日宣言 · ' + themeTag + '_0' + pad(idx + 1) + ' ]</span><div class="quote-meta-right"><div class="quote-tex-switch"><button type="button" class="quote-tex-btn ' + (theme === 'flame' ? 'active' : '') + '" data-quote="0"><span aria-hidden="true">🔥</span> 火焰</button><button type="button" class="quote-tex-btn ' + (theme === 'lightning' ? 'active' : '') + '" data-quote="1"><span aria-hidden="true">⚡</span> 闪电</button><button type="button" class="quote-tex-btn ' + (theme === 'storm' ? 'active' : '') + '" data-quote="2"><span aria-hidden="true">🌪</span> 风暴</button><button type="button" class="quote-tex-btn quote-cycle-btn" data-action="quote-next" aria-label="切换下一句每日宣言">下一句 <span aria-hidden="true">↻</span></button></div><span>' + pad(idx + 1) + ' / ' + pad(quotes.length) + '</span></div></div>'
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
      + '<rect x="8" y="3" width="424" height="205" fill="url(#minor-grid)" opacity=".36"/>'
      + '<rect class="track-surface" x="72" y="39" width="296" height="137" rx="68.5"/>'
      + '<rect class="track-infield" x="99" y="66" width="242" height="83" rx="41.5"/>'
      + '<path class="dimension" d="M40 110H401M221 20V189M134 30V17M305 30V17M134 23H305M400 39V176M394 39H406M394 176H406"/>'
      + '<text x="205" y="17">84.39 m</text><text x="394" y="110">73.00 m</text><text x="196" y="77">PIXEL ARENA</text>'
      + [0, 1, 2, 3].map(i => '<rect class="lane' + (i === 0 ? ' lane-outer' : '') + '" x="' + (72 + i * 9) + '" y="' + (39 + i * 9) + '" width="' + (296 - i * 18) + '" height="' + (137 - i * 18) + '" rx="' + (68.5 - i * 9) + '"/>').join('')
      + '<rect x="228" y="149" width="4" height="27" fill="url(#finish-check)" opacity=".92"/>'
      + '<text class="lane-tag" x="80" y="102">L1</text><text class="lane-tag" x="89" y="112">L2</text>'
      + '<rect class="lane" x="168" y="84" width="107" height="48"/>'
      + '<path class="lane" d="M221 84V132M168 95H177V120H168M275 95H267V120H275"/>'
      + '<circle class="lane" cx="221" cy="108" r="10"/>'
      + '<path class="cross" d="M18 11V31M8 21H28M415 11V31M405 21H425M18 183V203M8 193H28M415 183V203M405 193H425"/>'
      + '<text x="202" y="198">' + (members.length === 1 ? 'START · 像素竞技场' : ('START · ' + members.length + '人像素竞技')) + '</text>'
      + '<g class="orbit-runner orbit-trail-2" aria-hidden="true"><circle r="3" fill="#e4a334"/></g>'
      + '<g class="orbit-runner orbit-trail-1" aria-hidden="true"><circle r="4.5" fill="#e5492b"/></g>'
      + '<g class="orbit-runner" aria-hidden="true"><circle r="6" fill="#ff5a2f" stroke="#f2f1e8" stroke-width="2"/><circle r="11" fill="none" stroke="#38bdf8" opacity=".55"/></g>'
      + trackRoster
      + '</svg>';

  const isSprinting = performance.now() < arenaSprintUntil;
  const myCombo = dualStreak();
  const cTier = comboTier(myCombo);
  return '<div class="track-wrap pixel-arena-wrap ' + (homeBpMode === 'study' ? 'is-radar-mode ' : '') + (isSprinting ? 'is-sprinting' : '') + '">'
    + (homeBpMode === 'track' ? '<canvas class="arena-fx-canvas" aria-hidden="true"></canvas>' : '')
    + '<div class="arena-hud-top">'
    + '<span class="arena-hud-tag slash-chip">[ ' + (homeBpMode === 'study' ? 'NEURAL RADAR' : '400M PIXEL ARENA') + ' ]</span>'
    + '<button type="button" class="arena-combo-pill tier-' + cTier.tier + '" data-action="go-view" data-value="people" title="查看 COMBO 连击与自律里程碑">'
    + comboPixelEmblemSvg(cTier, 16)
    + '<span>COMBO ×' + myCombo + '</span><em>' + cTier.code + '</em></button>'
    + '</div>'
    + trackBody
    + '<button class="track-badge track-mode-switch" data-action="toggle-home-bp" title="点击切换运动跑道与四维学习雷达">' + (homeBpMode === 'study' ? '4D RADAR ⇄ 400M 跑道' : '400M TRACK ⇄ 四维学习雷达') + '</button>'
    + '<button class="track-add-btn" data-action="add-person" title="添加竞技人物/伙伴">' + (members.length === 1 ? '＋ 加人物' : '＋ 加人物 (' + members.length + '人)') + '</button>'
    + '<button class="track-caption ' + ((done && sDone) ? 'done' : '') + '" data-action="go-view" data-value="' + (homeBpMode === 'study' ? 'study' : 'progress') + '">' + (homeBpMode === 'study' ? ('选中：' + radarFocusAxis + ' · 进学习目标 →') : (isSprinting ? '⚡ 打卡冲刺圈进行中…' : done ? '今日已跑 ✓ · 点节点查看线表' : '跑 ' + (done ? 1 : 0) + '/1 · 学 ' + (sDone ? 1 : 0) + '/1 · ' + (members.length === 1 ? '查看双轨线表 →' : members.length + '人同跑'))) + '</button>'
    + '</div>';
}

function homeTodayPanel() {
  const dk = today();
  const rs = todaySportSummary(), ss = todayStudySummary();
  const totalCount = rs.count + ss.count;
  const focusMeta = getStudyFocusEntryMeta();
  const entryBars = ckEntryBarsMarkup(['sport', 'study']);
  const members = allMembers();
  const habits = activeHabits();
  const hb = habitRateForDate(dk);
  const doneHabitIds = state.habitLogs[dk] || [];
  const todayItems = allUnifiedRecords('all', true).filter(r => beijingDateOf(r) === dk);

  const habitsHtml = habits.length
    ? '<div class="today-sub-block today-habits-block">'
      + '<div class="today-sub-head"><span class="today-sub-title">今日自律 <em>' + hb.done + '/' + hb.total + '</em></span>'
      + '<button type="button" class="today-sub-link" data-action="go-view" data-value="people">管理 <span aria-hidden="true">→</span></button></div>'
      + '<div class="today-habits-grid">'
      + habits.map(h => {
        const isDone = doneHabitIds.includes(h.id);
        return '<button type="button" class="today-habit-btn ' + (isDone ? 'is-done' : '') + '" data-action="toggle-habit" data-value="' + esc(h.id) + '" aria-pressed="' + isDone + '">'
          + '<span class="today-habit-check" aria-hidden="true">' + (isDone ? '✓' : '') + '</span>'
          + '<span class="today-habit-label">' + esc(h.title) + '</span></button>';
      }).join('')
      + '</div></div>'
    : '';

  const feedRowsHtml = todayItems.length
    ? '<div class="today-feed-list">' + todayItems.slice(0, 4).map(item => {
      const isStudy = item._kind === 'study';
      const val = isStudy ? (studyMinutesOf(item) + ' 分钟') : (Number(item.km).toFixed(2) + ' km');
      const detail = isStudy ? (item.subject || findTargetTitle(item.targetId)) : (item.note || (item.tags && item.tags[0]) || '');
      const metaText = [item.time, detail].filter(Boolean).join(' · ');
      const syncKey = recordSyncStateKey(item);
      const syncMeta = syncStatusMeta(syncKey);
      return '<button type="button" class="today-feed-row ' + (isStudy ? 'is-study' : 'is-sport') + '" data-action="open-receipt-modal" data-value="' + esc(item._key) + '" data-focus-key="homefeed:' + esc(item._key) + '">'
        + '<span class="today-feed-tag">' + (isStudy ? '学习' : '运动') + '</span>'
        + '<strong>' + val + '</strong>'
        + (metaText ? '<span class="today-feed-meta">' + esc(metaText) + '</span>' : '')
        + (syncKey !== 'synced' ? '<span class="today-feed-sync is-' + syncMeta.key + '">' + syncMeta.label + '</span>' : '')
        + '<span class="today-feed-arrow" aria-hidden="true">›</span></button>';
    }).join('') + '</div>'
    : '<p class="today-empty-hint">今天还没有运动或学习记录，点击上方按钮即可打卡。</p>';

  const feedHtml = '<div class="today-sub-block today-feed-block">'
    + '<div class="today-sub-head"><span class="today-sub-title">今日明细</span>'
    + (todayItems.length > 4 ? '<button type="button" class="today-sub-link" data-action="go-today-records">全部 ' + todayItems.length + ' 条 <span aria-hidden="true">→</span></button>' : '')
    + '</div>'
    + feedRowsHtml
    + '</div>';

  const hasTodayRecord = totalCount > 0;
  const primaryCtaLabel = hasTodayRecord ? '再记一次' : '打卡';
  const primaryDefaultMode = (!getSavedDraft('sport') && getSavedDraft('study')) ? 'study' : 'sport';
  const primaryAria = primaryCtaLabel + '，今日已完成运动 ' + rs.km.toFixed(1) + ' 公里（' + rs.count + ' 次）、学习 ' + ss.minutes + ' 分钟（' + ss.count + ' 次），共 ' + totalCount + ' 次';

  return '<section class="home-today-panel ck-today-panel" aria-labelledby="home-today-heading">'
    + '<div class="ck-today-hero">'
    + '<div class="ck-today-head">'
    + '<div class="ck-today-title-wrap"><h2 id="home-today-heading">今天</h2><span class="ck-today-count" aria-label="今日打卡共 ' + totalCount + ' 次">' + (hasTodayRecord ? ('已记 ' + totalCount + ' 次') : '今日 0 次') + '</span></div>'
    + '<button type="button" class="ck-today-link" data-action="go-today-records" data-focus-key="home:today-records">今日记录 <span aria-hidden="true">→</span></button>'
    + '</div>'
    + '<div class="ck-today-summary" role="group" aria-label="今日完成量与次数">'
    + '<div class="ck-today-stat is-sport"><span class="ck-today-stat-label">运动</span><strong>' + rs.km.toFixed(1) + ' <em>km</em></strong><span class="ck-today-stat-count">' + rs.count + ' 次</span></div>'
    + '<div class="ck-today-stat is-study"><span class="ck-today-stat-label">学习</span><strong>' + ss.minutes + ' <em>分钟</em></strong><span class="ck-today-stat-count">' + ss.count + ' 次</span></div>'
    + '</div>'
    + '<button type="button" class="ck-primary-cta ' + (hasTodayRecord ? 'is-again' : 'is-first') + '" data-action="checkin" data-mode="' + primaryDefaultMode + '" data-focus-key="home:primary-checkin" aria-label="' + esc(primaryAria) + '"><span>' + primaryCtaLabel + '</span><span class="ck-primary-cta-arrow" aria-hidden="true">→</span></button>'
    + '<div class="ck-track-entries" role="group" aria-label="运动与学习独立入口">'
    + '<button type="button" class="ck-track-entry is-sport" data-view="plan" aria-label="进入运动页，今日 ' + rs.km.toFixed(1) + ' 公里，' + rs.count + ' 次">' + icon('shoe', 'ck-entry-ico') + '<span class="ck-entry-body"><strong>运动</strong><small>' + rs.km.toFixed(1) + ' km · ' + rs.count + ' 次</small></span><span class="ck-entry-chevron" aria-hidden="true">›</span></button>'
    + '<button type="button" class="ck-track-entry is-study" data-view="study" aria-label="进入学习页，今日 ' + ss.minutes + ' 分钟，' + ss.count + ' 次">' + icon('book', 'ck-entry-ico') + '<span class="ck-entry-body"><strong>学习</strong><small>' + ss.minutes + ' 分钟 · ' + ss.count + ' 次</small></span><span class="ck-entry-chevron" aria-hidden="true">›</span></button>'
    + '</div>'
    + '</div>'
    + (focusMeta.stateText ? '<div class="today-focus-note" id="home-focus-note" role="status">专注计时：' + esc(findTargetTitle(pomodoroTargetId)) + ' · ' + esc(focusMeta.stateText) + '</div>' : '')
    + entryBars
    + '<details class="ck-today-fold">'
    + '<summary class="ck-today-fold-summary"><span>今日明细、自律与更多操作</span><small>自律 ' + hb.done + '/' + hb.total + ' · 明细 ' + todayItems.length + ' 条</small></summary>'
    + '<div class="ck-today-fold-body">'
    + '<div class="ck-today-tools">'
    + '<button type="button" class="today-act-btn is-focus" data-action="go-focus" data-focus-key="home:go-focus" aria-label="' + esc(focusMeta.aria) + '">' + focusMeta.label + '</button>'
    + '<button type="button" class="today-records-btn is-subtle" data-action="add-person" title="添加同行伙伴">' + (members.length === 1 ? '＋ 加人物' : '＋ 加人物 (' + members.length + '人)') + '</button>'
    + '</div>'
    + habitsHtml
    + feedHtml
    + '</div></details>'
    + '</section>';
}

function morePage() {
  const mt = total(mine(monthly())), stH = totalStudy(monthly(mineStudy()));
  const sPct = Math.round(mt / Math.max(1, state.goal) * 100);
  const stPct = Math.round(stH / Math.max(1, state.studyGoal) * 100);
  const rs = todaySportSummary(), ss = todayStudySummary();
  const hb = habitRateForDate(today());
  const ds = dualStreak();
  const metaMap = {
    progress: '运动 ' + sPct + '% · 学习 ' + stPct + '%',
    plan: '今日 ' + rs.km.toFixed(1) + ' km · 本月 ' + mt.toFixed(1) + '/' + state.goal + ' km',
    study: '今日 ' + ss.minutes + ' 分钟 · 本月 ' + stH.toFixed(1) + '/' + state.studyGoal + ' h',
    achievements: '勋章墙与连续里程碑',
    people: '今日自律 ' + hb.done + '/' + hb.total + ' · COMBO ×' + ds
  };
  const rows = MORE_ITEMS.map(item => {
    const summary = metaMap[item.id] || item.sub;
    return '<li class="ck-more-item"><button type="button" class="ck-more-row" data-view="' + item.id + '" aria-label="打开' + item.label + '页，' + esc(summary) + '">'
      + '<span class="ck-more-ico-wrap" aria-hidden="true">' + icon(item.icon, 'ck-more-ico') + '</span>'
      + '<span class="ck-more-text"><strong>' + item.label + '</strong><small>' + esc(summary) + '</small></span>'
      + '<span class="ck-more-chevron" aria-hidden="true">›</span>'
      + '</button></li>';
  }).join('');
  return '<section class="ck-more-page" aria-labelledby="ck-more-heading">'
    + '<header class="ck-more-header"><h2 id="ck-more-heading">更多</h2><p>进度、运动、学习、成就与自律</p></header>'
    + '<ul class="ck-more-list" aria-label="全部扩展页面入口">' + rows + '</ul>'
    + '</section>';
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

  return '<div class="home ck-home">'
    + homeTodayPanel() + quoteMarkup()
    + '<section class="home-metrics home-metrics-4" aria-label="运动学习自律与核心进度">'
    + '<button class="metric-tile" data-action="go-view" data-value="plan"><div class="metric-top"><small>本月运动 / RUN</small><em class="metric-rank">' + (solo ? ('目标 ' + sPct + '%') : ('#' + mySportRank + (mySportRank === 1 ? ' 领跑' : ' 差' + sportLeadDelta + 'k'))) + '</em></div><strong>' + mt.toFixed(1) + '<em> KM</em></strong>' + PixelProgressBar.renderHtml({ progress: sPct, height: 12, width: '100%', bare: true, variant: 'orange', className: 'metric-ppb', ariaLabel: '本月运动目标进度' }) + '</button>'
    + '<button class="metric-tile" data-action="go-view" data-value="study"><div class="metric-top"><small>本月学习 / STUDY</small><em class="metric-rank is-blue">' + (solo ? ('目标 ' + stPct + '%') : ('#' + myStudyRank + (myStudyRank === 1 ? ' 领跑' : ' 差' + studyLeadDelta + 'h'))) + '</em></div><strong>' + stH.toFixed(1) + '<em> H</em></strong>' + PixelProgressBar.renderHtml({ progress: stPct, height: 12, width: '100%', bare: true, variant: 'blue', className: 'metric-ppb', ariaLabel: '本月学习目标进度' }) + '</button>'
    + (() => { const ds = dualStreak(); const ct = comboTier(ds); const nextGoal = ct.nextAt || 30; const cPct = ct.nextAt ? Math.min(100, Math.round(ds / nextGoal * 100)) : 100; return '<button class="metric-tile is-combo-tile tier-' + ct.tier + '" data-action="go-view" data-value="people"><div class="metric-top"><small>COMBO 连击 / STREAK</small><em class="metric-rank is-gold">' + ct.code + ' · ' + hb.done + '/' + hb.total + '</em></div><strong>COMBO ×' + ds + '</strong>' + PixelProgressBar.renderHtml({ progress: cPct, height: 12, width: '100%', bare: true, variant: 'gold', className: 'metric-ppb', ariaLabel: 'COMBO 连击进度' }) + '</button>'; })()
    + '<button class="metric-tile" data-action="go-view" data-value="progress"><div class="metric-top"><small>' + (solo ? '综合积分 / SCORE' : '多人竞技 / PK榜') + '</small><em class="metric-rank is-ink">' + (solo ? '单人基准' : (board.length + '人同榜')) + '</em></div><strong>' + (solo ? (myRow.score + '<em> 分</em>') : ('第' + myRank + '<em>名 · ' + myRow.score + '分</em>')) + '</strong>' + PixelProgressBar.renderHtml({ progress: solo ? Math.max(sPct, stPct) : Math.round(myRow.score / Math.max(1, board[0]?.score || 1) * 100), height: 12, width: '100%', bare: true, variant: 'ink', className: 'metric-ppb', ariaLabel: '综合竞技进度' }) + '</button>'
    + '</section>'
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
function calendarHeatmap(daysCount = 28, opts = null) {
  const fKind = opts?.kind || 'all';
  const fOnlyMine = opts ? Boolean(opts.onlyMine) : true;
  const cellRunsBase = fKind === 'study' ? [] : (fOnlyMine ? mine() : state.records);
  const cellStudyBase = fKind === 'sport' ? [] : (fOnlyMine ? mineStudy() : state.studyRecords);
  const startOffset = -(daysCount - 1);
  const startD = new Date(dateShift(startOffset) + 'T12:00:00');
  const leadBlanks = (startD.getDay() + 6) % 7;
  const cells = [];
  for (let b = 0; b < leadBlanks; b++) cells.push('<span class="cal-blank" aria-hidden="true"></span>');
  for (let i = 0; i < daysCount; i++) {
    const dk = dateShift(startOffset + i);
    const dObj = new Date(dk + 'T12:00:00');
    const dayRuns = cellRunsBase.filter(r => beijingDateOf(r) === dk);
    const dayStudy = cellStudyBase.filter(r => beijingDateOf(r) === dk);
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
  const detailRunsBase = opts ? cellRunsBase : state.records;
  const detailStudyBase = opts ? cellStudyBase : state.studyRecords;
  const selRuns = detailRunsBase.filter(r => beijingDateOf(r) === selectedCalDate);
  const selStudy = detailStudyBase.filter(r => beijingDateOf(r) === selectedCalDate);
  const selKm = total(selRuns), selMin = selRuns.reduce((s, r) => s + (r.minutes || 0), 0);
  const selHrs = totalStudy(selStudy), selStudyMin = totalStudyMinutes(selStudy);
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
        + '<div class="cdc-entry-top"><span class="cdc-who"><i style="background:' + esc(memberColor(r.person)) + '"></i>' + esc(r.person) + '</span><strong>' + studyHoursOf(r).toFixed(1) + ' h</strong><em>' + studyMinutesOf(r) + 'm · ' + esc(r.subject || findTargetTitle(r.targetId)) + '</em><button type="button" class="cdc-jump" data-action="open-record" data-value="study:' + r.id + '">小票 ↗</button></div>'
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
    let lSeconds = totalStudySeconds(allLMonth.filter(r => r.date < minStr));
    const lPts = lRecs.map((r, i) => {
      const seconds = studySecondsOf(r);
      lSeconds += seconds;
      const rHrs = seconds / 3600, lSum = lSeconds / 3600;
      const pct = Math.min(100, lSum / Math.max(1, state.studyGoal) * 100);
      return {
        x: mapX(r.date), y: 224 - (pct / maxPct) * 188, r, person: r.person, kind: 'study', color: '#203f91',
        nodeKey: 'pl-' + r.id + '-' + i, recordKey: 'study:' + r.id,
        heroVal: rHrs.toFixed(1), heroUnit: 'HOURS', cumLabel: '本月累计学习', cumVal: lSum.toFixed(1) + ' h (' + Math.round(pct) + '%)',
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
      { label: '学习达成', val: lastLPct + ' (' + (lSeconds / 3600).toFixed(1) + 'h)' }
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
      ? Math.max(2, ...allMonthly.map(r => studyHoursOf(r)))
      : Math.max(4, ...visibleMembers.map(m => totalStudy(allMonthly.filter(r => r.person === m))));
    const { niceMax, ticks: yTicks } = niceUpperAndTicks(rawMax * 1.12, 'h', 4);
    const board = teamLeaderboard('本月', '按学习');

    seriesList = visibleMembers.map(m => {
      const mPrior = allMonthly.filter(r => r.person === m && r.date < minStr);
      const mRecs = inWindow.filter(r => r.person === m).sort((a, b) => (a.date + a.time).localeCompare(b.date + a.time));
      const clr = memberColor(m);
      const rIdx = board.findIndex(x => x.name === m) + 1;
      let totalSeconds = isSingle ? 0 : totalStudySeconds(mPrior);
      const pts = mRecs.map((r, i) => {
        const seconds = studySecondsOf(r);
        totalSeconds += seconds;
        const rHrs = seconds / 3600, sum = totalSeconds / 3600;
        const plotVal = isSingle ? rHrs : sum;
        return {
          x: mapX(r.date), y: 224 - (plotVal / niceMax) * 188, r, person: m, kind: 'study', color: clr,
          nodeKey: 'st-' + m + '-' + r.id + '-' + i, recordKey: 'study:' + r.id,
          heroVal: rHrs.toFixed(1), heroUnit: 'HOURS', cumLabel: solo ? '累计学习' : ('累计学习 (月榜 #' + rIdx + ')'), cumVal: sum.toFixed(1) + ' h',
          yExact: plotVal.toFixed(1) + 'h',
          pointTag: isSingle ? '单场 ' + rHrs.toFixed(1) + 'h' : '累计 ' + sum.toFixed(1) + 'h (+' + rHrs.toFixed(1) + ')',
          rankLabel: solo ? (m + ' · 学习轨道') : ('学习月榜 #' + rIdx + '/' + board.length)
        };
      });
      const lastVal = isSingle ? (studySecondsOf(mRecs.at(-1)) / 3600).toFixed(1) : (totalSeconds / 3600).toFixed(1);
      return { name: m, endTag: (solo ? '' : '#' + rIdx + ' ') + m + ' ' + lastVal + 'h', color: clr, points: pts, areaGrad: visibleMembers.length === 1 };
    });
    yLabels = yTicks;
    yUnitTitle = isSingle ? 'Y: 单场专注 (h)' : 'Y: 累计学习 (h)';
    chartTitle = isSingle ? (solo ? 'STUDY SINGLE · 单场专注明细线' : 'STUDY SINGLE · 多人单场时长对比') : (solo ? 'STUDY CURVE · 学习累计线性表' : 'STUDY PK CURVE · 多人月度学习竞速');
    const maxHrs = Math.max(0, ...allMonthly.map(r => studyHoursOf(r)));
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
        const ptsDelta = Math.round((isSt ? studyHoursOf(r) * 25 : r.km * 10) + dayBonus + (r.likes || 0) * 5);
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
        heroVal: '+' + ptsDelta, heroUnit: 'PTS · ' + (isSt ? studyHoursOf(r).toFixed(1) + 'h' : r.km.toFixed(1) + 'k'),
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
    const { niceMax, ticks: yTicks } = niceUpperAndTicks(Math.max(3, ...recs.map(r => studyHoursOf(r))) * 1.12, 'h', 4);
    seriesList = visibleMembers.map(m => {
      const mRecs = recs.filter(r => r.person === m);
      const clr = memberColor(m);
      const pts = mRecs.map((r, i) => ({
        x: mapX(r.date), y: 224 - (studyHoursOf(r) / niceMax) * 188, r, person: m, kind: 'study', color: clr,
        nodeKey: 'sf-' + m + '-' + r.id + '-' + i, recordKey: 'study:' + r.id,
        heroVal: studyHoursOf(r).toFixed(1), heroUnit: 'HOURS', cumLabel: '本次专注评级', cumVal: (studyFocusLevels[r.focus]?.[0] || '🧠') + ' ' + (studyFocusLevels[r.focus]?.[1] || '专注'),
        yExact: studyHoursOf(r).toFixed(1) + 'h', pointTag: studyHoursOf(r).toFixed(1) + 'h · ' + (studyFocusLevels[r.focus]?.[1] || '专注'),
        rankLabel: m + ' · 单场专注'
      }));
      const lastH = mRecs.length ? studyHoursOf(mRecs.at(-1)).toFixed(1) : '0.0';
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
  const goalRatio = Math.min(1.35, mt / Math.max(1, state.goal));
  const flameTierLabel = p >= 100 ? 'MAX OVERDRIVE · 已达标爆燃' : p >= 80 ? 'BLAZING · 烈焰冲刺' : p >= 40 ? 'IGNITING · 持续升温' : 'WARMING · 蓄势起燃';
  const presets = [100, 150, 200, 245, 300];

  return '<div class="plan-layout"><div class="plan-left">'
    + '<section class="poster-hero poster-flame poster-compact ' + (p >= 100 ? 'is-goal-cleared' : '') + '" data-wm="' + p + '%" data-goal-ratio="' + goalRatio.toFixed(3) + '" data-goal-pct="' + p + '">'
    + '<div class="poster-meta"><span>[ 03 / 运动目标 · ' + flameTierLabel + ' ]</span><span>' + esc(state.name) + ' · 每周 ' + state.days.length + ' 跑</span></div>'
    + (p >= 100 ? '<div class="goal-stamp is-sport-stamp ' + (performance.now() < flameMegaSurgeUntil ? 'is-slamming' : '') + '"><span>TARGET CLEARED</span><strong>目标达成 ✓</strong></div>' : '')
    + '<div class="plan-hero-row">'
    + '<div class="poster-big-stat"><small>本月运动进度</small><strong>' + p + '<em>%</em></strong></div>'
    + '<div><h2>' + mt.toFixed(1) + ' <em>/ ' + state.goal + ' KM</em></h2><p class="poster-cn">已跑 ' + mt.toFixed(1) + ' 公里 · ' + (remaining ? '还差 ' + remaining.toFixed(1) + ' km 达成目标' : '本月运动目标已达成，火焰全功率燃烧中 ✓') + '</p></div>'
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

  const fc = getStudyFocusCharge();
  const sweepOn = performance.now() < electricSweepUntil;
  const sweepFxHtml = '<div class="electric-border-fx" aria-hidden="true"><i class="eb-top"></i><i class="eb-right"></i><i class="eb-bottom"></i><i class="eb-left"></i></div>';
  const focusMeta = getStudyFocusEntryMeta();
  const ssToday = todayStudySummary();
  const pomoElapsed = getPomoElapsedSec();
  const studyEntryBars = ckEntryBarsMarkup(['study']);

  return '<div class="plan-layout study-layout"><div class="plan-left">'
    + '<section class="poster-hero poster-lightning poster-compact ' + (sweepOn ? 'electric-sweep-active' : '') + '" data-wm="' + p + '%" data-focus-charge="' + fc.chargeNorm.toFixed(3) + '">'
    + sweepFxHtml
    + '<div class="poster-meta"><span>学习目标</span><span>' + activeStudyTargets().length + ' 个目标 · 每周 ' + state.studyDays.length + ' 天</span></div>'
    + '<div class="plan-hero-row">'
    + '<div class="poster-big-stat"><small>本月进度</small><strong>' + p + '<em>%</em></strong></div>'
    + '<div><h2>' + stH.toFixed(1) + ' <em>/ ' + state.studyGoal + ' H</em></h2><p class="poster-cn">' + (remaining ? '还差 ' + remaining.toFixed(1) + ' 小时' : '本月目标已达成') + '</p></div>'
    + '</div>'
    + '<div class="poster-kpis poster-kpis-4">'
    + '<div><small>完成进度</small><strong>' + p + '<em>%</em></strong></div>'
    + '<div><small>已学时长</small><strong>' + stH.toFixed(1) + '<em>H</em></strong></div>'
    + '<div><small>目标时长</small><strong>' + state.studyGoal + '<em>H</em></strong></div>'
    + '<div><small>剩余待学</small><strong>' + remaining.toFixed(1) + '<em>H</em></strong></div>'
    + '</div></section>'
    + '<section class="study-entry-bar" aria-label="学习打卡入口">'
    + '<div class="study-entry-summary"><strong>今日学习 ' + ssToday.minutes + ' 分钟</strong><span>' + ssToday.count + ' 次打卡' + '</span></div>'
    + '<div class="study-entry-actions">'
    + '<button type="button" class="study-entry-btn is-manual" data-action="checkin" data-mode="study" data-focus-key="study:manual-entry">手动补记</button>'
    + '<button type="button" class="study-entry-btn is-focus" data-action="study-focus-entry" data-focus-key="study:focus-entry" aria-label="' + esc(focusMeta.aria) + '">' + focusMeta.label + '</button>'
    + '</div>'
    + '</section>'
    + studyEntryBars
    + '<section class="plan-controls">'
    + '<div class="preset-row">' + presets.map(g => '<button type="button" class="preset-chip ' + (state.studyGoal === g ? 'active' : '') + '" data-action="study-goal-set" data-value="' + g + '">' + g + 'H</button>').join('') + '</div>'
    + '<div class="segments">' + [-10, -5, 5, 10].map(n => '<button type="button" data-action="study-goal" data-value="' + n + '">' + (n > 0 ? '+' : '') + n + ' h</button>').join('') + '</div>'
    + '</section>'
    + render28DayPlanSection('study')
    + '<section class="study-targets-section">'
    + '<div class="week-head"><h3 class="eyebrow">' + icon('target') + ' 学习目标</h3><button type="button" class="add-target-btn" data-action="add-study-target">＋ 新建目标</button></div>'
    + '<div class="study-targets-grid">' + targetCards + '</div>'
    + '</section>'
    + '</div><div class="plan-right">'
    + '<section id="pomodoro-panel" tabindex="-1" class="pomodoro-panel ' + (fc.isFocusing ? 'is-charging ' : '') + (sweepOn ? 'electric-sweep-active' : '') + '" aria-label="专注计时">'
    + sweepFxHtml
    + '<div class="pomo-head"><h3>专注计时</h3><div class="pomo-presets" role="group" aria-label="专注时长预设"><button type="button" class="' + (pomodoroTotal === 1500 ? 'active' : '') + '" data-action="pomo-set" data-value="25">25 分钟</button><button type="button" class="' + (pomodoroTotal === 3000 ? 'active' : '') + '" data-action="pomo-set" data-value="50">50 分钟</button></div></div>'
    + '<div class="pomo-main"><strong id="pomo-clock" aria-live="off">' + formatTimer(getPomoLeftSec()) + '</strong>'
    + '<div class="pomo-ctrl">'
    + '<button type="button" class="pomo-btn primary" data-action="pomo-toggle">' + (pomoSession.state === 'running' ? '暂停' : pomoSession.state === 'paused' ? '继续专注' : '开始专注') + '</button>'
    + '<button type="button" class="pomo-btn" data-action="pomo-reset">重置</button>'
    + '<button type="button" class="pomo-btn accent" data-action="pomo-finish"' + (pomoElapsed < 60 || pomoSession.state === 'saving' ? ' disabled' : '') + '>' + (pomoSession.state === 'saving' ? '保存中…' : '记入学习') + '</button>'
    + '</div></div>'
    + '<div class="pomo-hint" id="pomo-elapsed-hint">已专注 ' + Math.floor(pomoElapsed / 60) + ' 分 ' + (pomoElapsed % 60) + ' 秒 · 满 60 秒可记入</div>'
    + (pomoSession.errorMsg ? '<div class="pomo-error" role="alert"><span>' + esc(pomoSession.errorMsg) + '</span><span class="pomo-error-actions"><button type="button" class="ck-btn ck-btn-retry" data-action="pomo-finish">重试同步</button><button type="button" class="ck-btn ck-btn-ghost" data-action="pomo-save-local">先存本机</button></span></div>' : '')
    + '<div class="pomo-target-select"><label for="pomo-target-sel">学习目标</label><select id="pomo-target-sel" data-action="pomo-target">'
    + (activeStudyTargets().length ? activeStudyTargets() : state.studyTargets).map(t => '<option value="' + esc(t.id) + '" ' + (t.id === pomodoroTargetId ? 'selected' : '') + '>' + esc(t.title) + '</option>').join('')
    + '</select></div></section>'
    + '<div class="blueprint-box">' + lineChart('study') + '</div>'
    + '<div class="next-run"><div class="next-run-left">' + icon('brain') + '<div><span>下次计划学习</span><small>每周 ' + state.studyDays.length + ' 天</small></div></div><strong>' + nextStudy() + '</strong></div>'
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
function rankPeriodDateRange(period = rankPeriod) {
  const t = today();
  if (period === '今天') return { start: t, end: t, text: t };
  if (period === '本周') {
    const start = weekStart();
    const end = dateShift(6 - ((chinaNow().getDay() + 6) % 7));
    const last = [...state.records, ...state.studyRecords].reduce((latest, r) => r.date > latest ? r.date : latest, end);
    return { start, end: last, text: start + ' 至 ' + last };
  }
  if (period === '本月') {
    const start = t.slice(0, 7) + '-01';
    const now = chinaNow();
    const end = dateKey(new Date(now.getFullYear(), now.getMonth() + 1, 0));
    return { start, end, text: start + ' 至 ' + end };
  }
  const allDates = [...state.records, ...state.studyRecords]
    .map(r => r.date)
    .filter(Boolean)
    .sort();
  if (allDates.length) {
    return { start: allDates[0], end: allDates[allDates.length - 1], text: allDates[0] + ' 至 ' + allDates[allDates.length - 1] };
  }
  return { start: t, end: t, text: '全部历史（至 ' + t + '）' };
}

function ranking() {
  const rows = teamLeaderboard(rankPeriod, rankMetric);
  const periodInfo = rankPeriodDateRange(rankPeriod);
  const valOf = r => rankMetric === '综合积分' ? r.score : rankMetric === '按公里' ? r.km : rankMetric === '按学习' ? r.hrs : rankMetric === '按天数' ? r.days : r.likes;
  const maxVal = Math.max(1, ...rows.map(valOf));
  const top = rows[0];
  const topVal = top ? (rankMetric === '综合积分' ? top.score + ' <em>积分</em>' : rankMetric === '按公里' ? top.km.toFixed(1) + ' <em>km</em>' : rankMetric === '按学习' ? top.hrs.toFixed(1) + ' <em>h</em>' : rankMetric === '按天数' ? top.days + ' <em>天</em>' : top.likes + ' <em>赞</em>') : '—';
  const myRuns = mine(), myStudy = mineStudy();
  const bestPace = myRuns.length ? (formatPaceSec(Math.min(...myRuns.map(paceSeconds))) + ' /km') : '—';

  const soloRank = rows.length === 1;
  return '<div class="rank-layout"><div class="rank-left">'
    + '<section class="poster-hero poster-storm poster-compact" data-wm="' + (soloRank ? 'SOLO' : '#1') + '">'
    + '<div class="poster-meta"><span>' + (soloRank ? '个人榜单' : 'PK 榜单') + ' · ' + rankPeriod + '</span><span>' + rankMetric + '</span></div>'
    + '<div class="rank-hero-main"><div><span class="rank-crown-tag">' + icon('crown') + ' ' + (soloRank ? '当前记录' : '榜首') + '</span><h2>' + esc(top?.name || state.name) + '</h2></div><div class="rank-hero-score">' + topVal + '</div></div>'
    + '</section>'
    + '<section class="rank-filters" aria-label="榜单筛选">'
    + '<div class="filter-row"><span class="filter-label">' + icon('calendar') + ' 周期</span>' + subtabs(['今天', '本周', '本月', '总榜'], rankPeriod, 'rank-period', 'equal') + '</div>'
    + '<div class="rank-period-meta" aria-label="统计周期与时区"><span>统计周期：<strong>' + esc(rankPeriod) + '</strong> · ' + esc(periodInfo.text) + '（北京时间）</span></div>'
    + '<div class="filter-row"><span class="filter-label">' + icon('bolt') + ' 维度</span>' + subtabs(['综合积分', '按公里', '按学习', '按天数', '按人气'], rankMetric, 'rank-metric', 'equal', { '综合积分': 'trophy', '按公里': 'shoe', '按学习': 'book', '按天数': 'calendar', '按人气': 'heart' }) + '</div>'
    + (rankMetric === '综合积分' ? '<p class="rank-bonus-note">综合积分含近 7 天自律达成率加分（自律率 × 0.5，不随所选周期变化）。</p>' : '')
    + '</section>'
    + rows.map((r, i) => {
      const clr = memberColor(r.name);
      const val = valOf(r), barPct = val ? Math.max(8, Math.round(val / maxVal * 100)) : 0;
      const result = rankMetric === '综合积分' ? r.score : rankMetric === '按公里' ? r.km.toFixed(1) : rankMetric === '按学习' ? r.hrs.toFixed(1) : rankMetric === '按天数' ? r.days : r.likes;
      const unit = rankMetric === '综合积分' ? '积分' : rankMetric === '按公里' ? 'km' : rankMetric === '按学习' ? 'h' : rankMetric === '按天数' ? '天' : '赞';
      return '<div class="rank-person ' + (i === 0 && val ? 'is-first' : '') + '">'
        + '<span class="place" style="' + (i > 0 ? 'border-color:' + clr + ';color:' + clr : '') + '">' + (val ? (i === 0 ? icon('crown', 'place-ico') : pad(i + 1)) : '—') + '</span>'
        + '<div class="rank-main"><div class="person-head"><strong>' + esc(r.name) + (r.name === state.name ? ' · 我' : '') + '</strong><span class="badge-tag">' + level(r.name) + '</span></div>'
        + PixelProgressBar.renderHtml({ progress: barPct, height: 12, width: '100%', bare: true, color: (i === 0 && val) ? '#e5492b' : clr, className: 'rank-ppb', ariaLabel: r.name + ' 排行进度' })
        + '<p>运动 ' + r.km.toFixed(1) + ' km · 学习 ' + r.hrs.toFixed(1) + ' h · 综合 ' + r.score + ' 积分 · 出勤 ' + r.days + ' 天 · 近7天自律 ' + r.hbRate + '%</p></div>'
        + '<div class="rank-result">' + result + '<small>' + unit + '</small></div></div>';
    }).join('')
    + '<div class="rank-invite"><div>' + icon('users') + '<div><strong>' + (soloRank ? '添加伙伴同榜 PK' : '邀请更多伙伴') + '</strong><small>支持同榜对比运动、学习与积分</small></div></div><button type="button" data-action="add-person">＋ 添加伙伴</button></div>'
    + '</div><div class="rank-right">'
    + '<div class="pace-summary"><div><small>最快配速</small><strong>' + bestPace + '</strong></div><div><small>累计学习</small><strong>' + totalStudy(myStudy).toFixed(1) + ' h</strong></div><div><small>双轨连胜</small><strong>' + dualStreak() + ' 天</strong></div></div>'
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
    + '<section class="poster-hero poster-storm poster-compact" data-wm="' + achPct + '%">'
    + '<div class="poster-meta"><span>[ 06 / 运动 · 学习 · 自律勋章墙 · STORM PIXEL ]</span><span>LV' + lv + ' · ' + level() + ' · ' + count + ' / ' + all.length + ' UNLOCKED</span></div>'
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
      const isComboMilestone = /连续|双轨|长期主义/.test(m[2]);
      return '<button class="medal-card ' + (unlocked && isComboMilestone ? 'is-combo-milestone' : '') + '" data-action="flip" aria-label="' + m[2] + '，点击翻面" aria-pressed="false"><span class="medal-inner">'
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
function departureChart(kindFilter = 'all', customList = null) {
  const list = Array.isArray(customList) ? customList : allUnifiedRecords(kindFilter);
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
        { label: '< 90 分钟', items: list.filter(r => studyMinutesOf(r) < 90), color: '#203f91' },
        { label: '90–150 分钟', items: list.filter(r => studyMinutesOf(r) >= 90 && studyMinutesOf(r) < 150), color: '#e5492b' },
        { label: '150–240 分钟', items: list.filter(r => studyMinutesOf(r) >= 150 && studyMinutesOf(r) < 240), color: '#e4a334' },
        { label: '240+ 深度攻坚', items: list.filter(r => studyMinutesOf(r) >= 240), color: '#262624' }
      ];
    } else if (recordKindFilter === 'sport') {
      rows = [
        { label: '0–5 km', items: list.filter(r => Number(r.km) < 5), color: '#e5492b' },
        { label: '5–10 km', items: list.filter(r => Number(r.km) >= 5 && Number(r.km) < 10), color: '#203f91' },
        { label: '10–21 km', items: list.filter(r => Number(r.km) >= 10 && Number(r.km) < 21.1), color: '#e4a334' },
        { label: '21.1+ 半马', items: list.filter(r => Number(r.km) >= 21.1), color: '#262624' }
      ];
    } else {
      rows = [
        { label: '🏃 短程 <10km', items: list.filter(r => r._kind === 'sport' && Number(r.km) < 10), color: '#e5492b' },
        { label: '🏃 长距 ≥10km', items: list.filter(r => r._kind === 'sport' && Number(r.km) >= 10), color: '#e4a334' },
        { label: '📚 专注 <120m', items: list.filter(r => r._kind === 'study' && studyMinutesOf(r) < 120), color: '#203f91' },
        { label: '📚 深度 ≥120m', items: list.filter(r => r._kind === 'study' && studyMinutesOf(r) >= 120), color: '#262624' }
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

/* ---------- Unified Records Page Shared Data Pipeline & External Record Opener ---------- */
function getRecordsPageDataset() {
  const onlyMine = recordPersonFilter === 'mine';
  const sBase = onlyMine ? mine() : state.records;
  const lBase = onlyMine ? mineStudy() : state.studyRecords;
  const rangeDays = recordRangeFilter === '30d' ? 30 : 7;
  const minDate = recordRangeFilter === 'all' ? '0000-01-01' : dateShift(-(rangeDays - 1));
  const maxDate = today();

  const sList = recordKindFilter === 'study'
    ? []
    : sBase.map(r => ({ ...r, _kind: 'sport', _key: 'sport:' + r.id, _bjDate: beijingDateOf(r) }));
  const lList = recordKindFilter === 'sport'
    ? []
    : lBase.map(r => ({ ...r, _kind: 'study', _key: 'study:' + r.id, _bjDate: beijingDateOf(r) }));

  const allMatchingPersonKind = [...sList, ...lList].sort((a, b) =>
    (b._bjDate + (b.time || '00:00') + String(b.id).padStart(8, '0')).localeCompare(a._bjDate + (a.time || '00:00') + String(a.id).padStart(8, '0'))
  );
  const inRangeList = allMatchingPersonKind.filter(r => r._bjDate >= minDate && r._bjDate <= maxDate);
  const displayList = recordSelectedDate
    ? inRangeList.filter(r => r._bjDate === recordSelectedDate)
    : inRangeList;

  return { onlyMine, rangeDays, minDate, maxDate, allMatchingPersonKind, inRangeList, displayList };
}

function openExternalRecord(key, triggerSelector = '') {
  if (!key) return;
  const allEver = allUnifiedRecords('all', false);
  const target = allEver.find(r => r._key === key);
  if (!target) {
    recordSelectKey = key;
    navigate('records');
    return;
  }

  const changes = [];
  if (recordPersonFilter === 'mine' && target.person !== state.name) {
    recordPersonFilter = 'all';
    changes.push('人员：我 → 全员');
  }
  if (recordKindFilter !== 'all' && recordKindFilter !== target._kind) {
    const prevKind = recordKindFilter === 'sport' ? '运动' : '学习';
    recordKindFilter = 'all';
    changes.push('类型：' + prevKind + ' → 全部');
  }

  const td = beijingDateOf(target);
  const min7 = dateShift(-6);
  const min30 = dateShift(-29);
  if (recordRangeFilter === '7d' && td < min7) {
    if (td >= min30) {
      recordRangeFilter = '30d';
      changes.push('时间：近 7 天 → 近 30 天');
    } else {
      recordRangeFilter = 'all';
      changes.push('时间：近 7 天 → 全部历史（含 ' + td + '）');
    }
  } else if (recordRangeFilter === '30d' && td < min30) {
    recordRangeFilter = 'all';
    changes.push('时间：近 30 天 → 全部历史（含 ' + td + '）');
  }

  recordSelectedDate = td;
  selectedBarDate = td;
  recordSelectKey = key;
  externalFilterNotice = changes.length
    ? '已为指定记录自动放宽筛选（' + changes.join(' · ') + '），以便展示该历史小票'
    : '';

  if (view !== 'records') navigate('records');
  else render(true);

  openReceiptDialog(key, triggerSelector || ('.wall-card[data-value="' + key + '"]'));
}

/* ---------- Interactive Dual-Axis Trend Chart (Daily Bars / Interval Cumulative Line) ---------- */
function recordsTrendChart(dataset) {
  const numDays = recordRangeFilter === '7d' ? 7 : 30;
  const is30d = numDays === 30;
  const isCum = recordTrendMode === 'cum';
  const showSport = recordKindFilter === 'all' || recordKindFilter === 'sport';
  const showStudy = recordKindFilter === 'all' || recordKindFilter === 'study';

  function summarizeDay(dk) {
    const items = dataset.inRangeList.filter(r => r._bjDate === dk);
    const runs = items.filter(r => r._kind === 'sport');
    const st = items.filter(r => r._kind === 'study');
    const km = Math.round(runs.reduce((s, r) => s + (Number(r.km) || 0), 0) * 100) / 100;
    const seconds = totalStudySeconds(st);
    const min = Math.round(seconds / 60);
    const hr = Math.round((seconds / 3600) * 10) / 10;
    const hb = habitRateForDate(dk);
    return { dk, km, seconds, min, hr, runs, st, items, hb };
  }
  const days = Array.from({ length: numDays }, (_, index) => summarizeDay(dateShift(index - numDays + 1)));

  let runKm = 0, runSeconds = 0;
  days.forEach(d => {
    runKm = Math.round((runKm + d.km) * 100) / 100;
    runSeconds += d.seconds;
    d.cumKm = runKm;
    d.cumMin = Math.round(runSeconds / 60);
    d.cumHr = Math.round((runSeconds / 3600) * 10) / 10;
  });

  const maxKmRaw = isCum ? (days[numDays - 1]?.cumKm || 0) : Math.max(0, ...days.map(v => v.km));
  const maxMinRaw = isCum ? (days[numDays - 1]?.cumMin || 0) : Math.max(0, ...days.map(v => v.min));
  const maxKm = Math.max(10, Math.ceil((maxKmRaw * 1.12 || 10) / 5) * 5);
  const maxMin = Math.max(60, Math.ceil((maxMinRaw * 1.12 || 60) / 30) * 30);

  const activeDate = recordSelectedDate || (days.some(d => d.dk === selectedBarDate) ? selectedBarDate : days[numDays - 1].dk);
  const chartDay = days.find(day => day.dk === activeDate);
  const selDay = chartDay || summarizeDay(activeDate);

  const plotLeft = 48, plotRight = 492, plotTop = 30, plotBottom = 142;
  const plotW = plotRight - plotLeft, plotH = plotBottom - plotTop;

  const ySteps = [0, 0.5, 1];
  const gridHtml = ySteps.map(st => {
    const y = plotBottom - st * plotH;
    const kmLbl = (st * maxKm).toFixed(st === 0 ? 0 : 1) + 'k';
    const minLbl = Math.round(st * maxMin) + 'm';
    return '<path class="grid" d="M' + plotLeft + ' ' + y.toFixed(1) + 'H' + plotRight + '"/>'
      + (showSport ? '<text x="' + (plotLeft - 6) + '" y="' + (y + 3).toFixed(1) + '" text-anchor="end" class="axis-tick-sport">' + kmLbl + '</text>' : '')
      + (showStudy ? '<text x="' + (plotRight + 6) + '" y="' + (y + 3).toFixed(1) + '" text-anchor="start" class="axis-tick-study">' + minLbl + '</text>' : '');
  }).join('');

  const axisTitlesHtml =
    (showSport ? '<text x="' + plotLeft + '" y="18" text-anchor="start" class="axis-title-sport">◀ 运动 (KM)</text>' : '')
    + (showStudy ? '<text x="' + plotRight + '" y="18" text-anchor="end" class="axis-title-study">学习 (MIN) ▶</text>' : '')
    + '<text x="' + ((plotLeft + plotRight) / 2).toFixed(1) + '" y="18" text-anchor="middle" class="axis-title-mid">' + (isCum ? '区间累计折线 · 北京时间' : '每日量对比 · 北京时间') + '</text>';

  let chartSvgBody = '';
  const colW = plotW / numDays;

  if (isCum) {
    const getX = i => plotLeft + i * colW + colW / 2;
    const getYKm = v => plotBottom - (v / maxKm) * plotH;
    const getYMin = v => plotBottom - (v / maxMin) * plotH;

    let linesHtml = '';
    if (showSport) {
      const pts = days.map((d, i) => getX(i).toFixed(1) + ',' + getYKm(d.cumKm).toFixed(1)).join(' ');
      const lastD = days[numDays - 1];
      linesHtml += '<polyline points="' + pts + '" fill="none" stroke="#e5492b" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>';
      if (lastD.cumKm > 0) {
        linesHtml += '<text x="' + (getX(numDays - 1) - 4).toFixed(1) + '" y="' + Math.max(plotTop + 10, getYKm(lastD.cumKm) - 7).toFixed(1) + '" text-anchor="end" class="bar-val-s">' + lastD.cumKm.toFixed(1) + 'km</text>';
      }
    }
    if (showStudy) {
      const pts = days.map((d, i) => getX(i).toFixed(1) + ',' + getYMin(d.cumMin).toFixed(1)).join(' ');
      const lastD = days[numDays - 1];
      linesHtml += '<polyline points="' + pts + '" fill="none" stroke="#203f91" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round" stroke-dasharray="' + (showSport ? '5 2' : 'none') + '"/>';
      if (lastD.cumMin > 0) {
        linesHtml += '<text x="' + (getX(numDays - 1) - 4).toFixed(1) + '" y="' + Math.min(plotBottom - 5, getYMin(lastD.cumMin) + 12).toFixed(1) + '" text-anchor="end" class="bar-val-l">' + lastD.cumMin + 'min</text>';
      }
    }

    const colsHtml = days.map((v, i) => {
      const cx = getX(i);
      const isPinned = v.dk === recordSelectedDate;
      const isCur = v.dk === selDay.dk;
      const isToday = i === numDays - 1;
      const dObj = new Date(v.dk + 'T12:00:00');
      const wLabel = isToday ? '今天' : ('周' + '日一二三四五六'[dObj.getDay()]);
      const dateLabel = v.dk.slice(5);
      const showLbl = !is30d || i === 0 || i === numDays - 1 || i % 5 === 0 || isCur;

      let dots = '';
      if (showSport) dots += '<circle cx="' + cx.toFixed(1) + '" cy="' + getYKm(v.cumKm).toFixed(1) + '" r="' + (isCur ? 4.8 : (is30d ? 2.4 : 3.4)) + '" fill="#e5492b" stroke="#f2f1e8" stroke-width="1.5"/>';
      if (showStudy) dots += '<rect x="' + (cx - (isCur ? 4 : (is30d ? 2.2 : 3))).toFixed(1) + '" y="' + (getYMin(v.cumMin) - (isCur ? 4 : (is30d ? 2.2 : 3))).toFixed(1) + '" width="' + (isCur ? 8 : (is30d ? 4.4 : 6)) + '" height="' + (isCur ? 8 : (is30d ? 4.4 : 6)) + '" fill="#203f91" stroke="#f2f1e8" stroke-width="1.4"/>';

      return '<g class="bp-hit bar-col ' + (isPinned ? 'is-selected is-pinned' : isCur ? 'is-selected' : '') + '" data-action="select-date-bar" data-value="' + v.dk + '" data-focus-key="bar:' + v.dk + '" role="button" tabindex="0" aria-pressed="' + isPinned + '" aria-label="' + v.dk + ' 累计运动 ' + v.cumKm.toFixed(1) + ' 公里，累计学习 ' + v.cumMin + ' 分钟，当日 ' + v.items.length + ' 条记录">'
        + '<rect class="bar-hit-bg" x="' + (plotLeft + i * colW).toFixed(1) + '" y="' + plotTop + '" width="' + colW.toFixed(1) + '" height="' + (plotH + 38).toFixed(1) + '" fill="' + (isPinned ? 'rgba(26,26,24,.10)' : isCur ? 'rgba(228,163,52,.14)' : 'transparent') + '" stroke="' + (isPinned ? '#1a1a18' : isCur ? 'rgba(26,26,24,.45)' : 'none') + '" stroke-width="' + (isPinned ? '1.5' : '1') + '"/>'
        + (isCur ? '<line x1="' + cx.toFixed(1) + '" y1="' + plotTop + '" x2="' + cx.toFixed(1) + '" y2="' + plotBottom + '" stroke="#1a1a18" stroke-width="1" stroke-dasharray="2 2" opacity=".45"/>' : '')
        + dots
        + (showLbl ? '<text x="' + cx.toFixed(1) + '" y="' + (plotBottom + 15) + '" text-anchor="middle" class="bar-x-main ' + (isCur ? 'is-active' : '') + '">' + (is30d ? dateLabel : wLabel) + '</text>' : '')
        + (!is30d ? '<text x="' + cx.toFixed(1) + '" y="' + (plotBottom + 28) + '" text-anchor="middle" class="bar-date">' + dateLabel + '</text>' : '')
        + '</g>';
    }).join('');

    chartSvgBody = linesHtml + colsHtml;
  } else {
    const colsHtml = days.map((v, i) => {
      const cx = plotLeft + i * colW;
      const midX = cx + colW / 2;
      const isPinned = v.dk === recordSelectedDate;
      const isCur = v.dk === selDay.dk;
      const isToday = i === numDays - 1;
      const dObj = new Date(v.dk + 'T12:00:00');
      const wLabel = isToday ? '今天' : ('周' + '日一二三四五六'[dObj.getDay()]);
      const dateLabel = v.dk.slice(5);
      const showLbl = !is30d || i === 0 || i === numDays - 1 || i % 5 === 0 || isCur;

      const hKm = v.km > 0 ? Math.max(6, (v.km / maxKm) * plotH) : 0;
      const hMin = v.min > 0 ? Math.max(6, (v.min / maxMin) * plotH) : 0;

      let bars = '';
      if (showSport && showStudy) {
        const bw = is30d ? 5 : 16;
        const gap = is30d ? 1.5 : 4;
        const leftX = midX - bw - gap / 2;
        const rightX = midX + gap / 2;
        bars += hKm
          ? '<rect x="' + leftX.toFixed(1) + '" y="' + (plotBottom - hKm).toFixed(1) + '" width="' + bw + '" rx="1.5" height="' + hKm.toFixed(1) + '" fill="#e5492b"/>'
            + (!is30d ? '<text x="' + (leftX + bw / 2).toFixed(1) + '" y="' + (plotBottom - hKm - 3).toFixed(1) + '" text-anchor="middle" class="bar-val-s">' + (v.km >= 10 ? v.km.toFixed(1) : v.km.toFixed(1)) + 'k</text>' : '')
          : '<rect x="' + leftX.toFixed(1) + '" y="' + (plotBottom - 2) + '" width="' + bw + '" height="2" fill="#d8d5ca"/>';
        bars += hMin
          ? '<rect x="' + rightX.toFixed(1) + '" y="' + (plotBottom - hMin).toFixed(1) + '" width="' + bw + '" rx="1.5" height="' + hMin.toFixed(1) + '" fill="#203f91"/>'
            + (!is30d ? '<text x="' + (rightX + bw / 2).toFixed(1) + '" y="' + (plotBottom - hMin - 3).toFixed(1) + '" text-anchor="middle" class="bar-val-l">' + v.min + 'm</text>' : '')
          : '<rect x="' + rightX.toFixed(1) + '" y="' + (plotBottom - 2) + '" width="' + bw + '" height="2" fill="#d8d5ca"/>';
      } else if (showSport) {
        const bw = is30d ? 8.5 : 26;
        const leftX = midX - bw / 2;
        bars += hKm
          ? '<rect x="' + leftX.toFixed(1) + '" y="' + (plotBottom - hKm).toFixed(1) + '" width="' + bw + '" rx="1.5" height="' + hKm.toFixed(1) + '" fill="' + (isToday ? '#e5492b' : '#c63b21') + '"/>'
            + (!is30d ? '<text x="' + midX.toFixed(1) + '" y="' + (plotBottom - hKm - 3).toFixed(1) + '" text-anchor="middle" class="bar-val-s">' + v.km.toFixed(1) + 'k</text>' : '')
          : '<rect x="' + leftX.toFixed(1) + '" y="' + (plotBottom - 2) + '" width="' + bw + '" height="2" fill="#d8d5ca"/>';
      } else {
        const bw = is30d ? 8.5 : 26;
        const leftX = midX - bw / 2;
        bars += hMin
          ? '<rect x="' + leftX.toFixed(1) + '" y="' + (plotBottom - hMin).toFixed(1) + '" width="' + bw + '" rx="1.5" height="' + hMin.toFixed(1) + '" fill="' + (isToday ? '#203f91' : '#1b357c') + '"/>'
            + (!is30d ? '<text x="' + midX.toFixed(1) + '" y="' + (plotBottom - hMin - 3).toFixed(1) + '" text-anchor="middle" class="bar-val-l">' + v.min + 'm</text>' : '')
          : '<rect x="' + leftX.toFixed(1) + '" y="' + (plotBottom - 2) + '" width="' + bw + '" height="2" fill="#d8d5ca"/>';
      }

      return '<g class="bp-hit bar-col ' + (isPinned ? 'is-selected is-pinned' : isCur ? 'is-selected' : '') + '" data-action="select-date-bar" data-value="' + v.dk + '" data-focus-key="bar:' + v.dk + '" role="button" tabindex="0" aria-pressed="' + isPinned + '" aria-label="' + v.dk + ' 运动 ' + v.km.toFixed(1) + ' 公里，学习 ' + v.min + ' 分钟，共 ' + v.items.length + ' 条记录">'
        + '<rect class="bar-hit-bg" x="' + cx.toFixed(1) + '" y="' + plotTop + '" width="' + colW.toFixed(1) + '" height="' + (plotH + 38).toFixed(1) + '" fill="' + (isPinned ? 'rgba(26,26,24,.10)' : isCur ? 'rgba(228,163,52,.14)' : 'transparent') + '" stroke="' + (isPinned ? '#1a1a18' : isCur ? 'rgba(26,26,24,.45)' : 'none') + '" stroke-width="' + (isPinned ? '1.5' : '1') + '"/>'
        + bars
        + (showLbl ? '<text x="' + midX.toFixed(1) + '" y="' + (plotBottom + 15) + '" text-anchor="middle" class="bar-x-main ' + (isCur ? 'is-active' : '') + '">' + (is30d ? dateLabel : wLabel) + '</text>' : '')
        + (!is30d ? '<text x="' + midX.toFixed(1) + '" y="' + (plotBottom + 28) + '" text-anchor="middle" class="bar-date">' + dateLabel + '</text>' : '')
        + '</g>';
    }).join('');
    chartSvgBody = colsHtml;
  }

  const svg = '<svg class="line-chart dual-axis-trend" viewBox="0 0 540 186" role="img" aria-label="' + (recordPersonFilter === 'mine' ? '本人' : '全员') + '近' + numDays + '天' + (isCum ? '累计折线图' : '每日柱状图') + '，按北京时间归日，方向键或点击选择日期">'
    + gridHtml
    + axisTitlesHtml
    + '<path d="M' + plotLeft + ' ' + plotBottom + 'H' + plotRight + '" stroke="#262624" stroke-width="1.1" opacity=".65"/>'
    + '<path class="cross" d="M12 8V20M6 14H18M528 8V20M522 14H534"/>'
    + chartSvgBody
    + '</svg>';

  const dayPillsHtml = selDay.items.map(item => {
    const isStudy = item._kind === 'study';
    const isAct = item._key === recordSelectKey;
    const syncKey = recordSyncStateKey(item);
    const isAbn = syncKey === 'failed' || syncKey === 'pending';
    const primaryVal = isStudy ? (studyMinutesOf(item) + ' 分钟') : (Number(item.km).toFixed(2) + ' km');
    return '<button type="button" class="inspect-pill ' + (isStudy ? 'is-study' : 'is-sport') + (isAct ? ' is-active' : '') + (isAbn ? ' is-abnormal' : '') + '" data-action="open-receipt-modal" data-value="' + item._key + '" data-focus-key="daypill:' + item._key + '">'
      + '<span>' + (isStudy ? '学习' : '运动') + '</span>'
      + '<span>' + esc(item.time || '--:--') + '</span>'
      + '<span>' + esc(item.person) + '</span>'
      + '<b>' + primaryVal + '</b>'
      + (syncKey === 'failed' ? '<em class="pill-err-dot">失败</em>' : syncKey === 'pending' ? '<em class="pill-pend-dot">待同步</em>' : '')
      + '<span aria-hidden="true">↗</span>'
      + '</button>';
  }).join('');

  const rangeLabel = recordRangeFilter === 'all' ? '全部历史' : ('近 ' + numDays + ' 天');
  const backRangeBtn = recordSelectedDate
    ? '<button type="button" class="btn-back-range" data-action="clear-date-filter">‹ 返回' + rangeLabel + '列表（' + dataset.inRangeList.length + ' 条）</button>'
    : '';

  const inspectorHtml = '<div class="day-inspector" data-inspector-date="' + selDay.dk + '">'
    + '<div class="day-inspector-head">'
    + '<strong>[ ' + selDay.dk + ' · 当日匹配 ' + selDay.items.length + ' 条 ]</strong>'
    + '<span>' + (!chartDay ? '所选日期超出图表范围' : recordSelectedDate ? '已筛选该日列表' : '点击柱列/按回车按日筛选') + '</span>'
    + '</div>'
    + '<div class="day-inspector-stats">'
    + (showSport ? '<span>运动：<b>' + selDay.km.toFixed(2) + ' km</b>（' + selDay.runs.length + ' 次）</span>' : '')
    + (showStudy ? '<span>学习：<b>' + selDay.min + ' 分钟</b> / ' + selDay.hr + ' h（' + selDay.st.length + ' 场）</span>' : '')
    + (isCum && chartDay ? '<span>至当日累计：<b>' + (showSport ? selDay.cumKm.toFixed(1) + ' km' : '') + (showSport && showStudy ? ' · ' : '') + (showStudy ? selDay.cumMin + ' 分钟' : '') + '</b></span>' : '')
    + backRangeBtn
    + '</div>'
    + '<div class="day-inspector-items" aria-label="' + selDay.dk + ' 全部匹配记录小票入口">'
    + (dayPillsHtml || '<span class="inspect-empty">当日在当前筛选下无匹配记录</span>')
    + '</div>'
    + '</div>';

  const legendHtml = (showSport ? '<span><i style="background:#e5492b"></i>运动 KM（左轴）</span>' : '')
    + (showStudy ? '<span><i style="background:#203f91"></i>学习 MIN（右轴）</span>' : '')
    + (recordRangeFilter === 'all' ? '<span>主图展示近 30 天 · 卡墙含历史小票</span>' : '');

  const outOfRangeBanner = !chartDay
    ? '<div class="chart-out-of-range-banner" role="status"><strong>所选日期超出图表范围</strong><span>主图保留近 ' + numDays + ' 天，下方已显示 ' + esc(selDay.dk) + ' 的当日摘要与卡墙筛选。</span></div>'
    : '';
  const cardTitle = (is30d ? '30-DAY' : '7-DAY') + ' DUAL-AXIS // ' + (isCum ? 'CUMULATIVE' : 'DAILY');
  const cardHint = (recordPersonFilter === 'mine' ? esc(state.name) + '（我）' : '全员') + ' · ' + rangeLabel + ' · ' + (isCum ? '区间累计折线' : '每日柱状图');
  return blueprintChartCard(cardTitle, cardHint, outOfRangeBanner + svg + inspectorHtml, '', legendHtml);
}

function moreAnalyticsChart(dataset) {
  if (recordsMoreChartType === '28天热力') {
    return calendarHeatmap(28, { kind: recordKindFilter, onlyMine: recordPersonFilter === 'mine', inRecordsPage: true });
  }
  if (recordsMoreChartType === '黄金时段') {
    return departureChart(recordKindFilter, dataset.inRangeList);
  }
  if (recordsMoreChartType === '强度分布') {
    return interactiveBucketsChart('intensity', dataset.inRangeList);
  }
  return interactiveBucketsChart('feeling', dataset.inRangeList);
}

function dataChart() {
  return recordsTrendChart(getRecordsPageDataset());
}

function buildReceiptCardMarkup(r, seqIndex, totalInList) {
  if (!r) return '<div class="empty">当前筛选下还没有打卡记录。</div>';
  const recPendingOp = r.operationId ? roomPendingOps().find(x => x.operationId === r.operationId) : null;
  const recNeedsRetry = Boolean(recPendingOp);
  const recRetryBtn = recNeedsRetry
    ? '<button type="button" class="ck-btn ck-btn-retry" data-action="retry-sync" data-value="' + esc(r.operationId || '') + '">重试同步</button>'
    : '';
  const rStudySec = r._kind === 'study' ? studySecondsOf(r) : 0;
  const rStudyHrs = r._kind === 'study' ? studyHoursOf(r) : 0;
  const rStudyMin = r._kind === 'study' ? studyMinutesOf(r) : 0;
  const rStudyExact = rStudySec % 60 ? (Math.floor(rStudySec / 60) + '分' + pad(rStudySec % 60) + '秒') : (rStudyMin + ' 分钟');
  const displaySeq = Math.max(1, totalInList - seqIndex);
  const stampNo = pad(displaySeq).padStart(3, '0');
  const syncErrMsg = r.syncError || recPendingOp?.lastError || '';

  if (r._kind === 'study') {
    return '<article class="record-card is-study-receipt">'
      + '<div class="record-stamp"><span>STUDY RECEIPT //' + stampNo + ' ' + syncPillMarkup(r) + '</span><span>' + icon('clock') + ' ' + r._bjDate + ' · ' + esc(r.time || '') + '</span></div>'
      + (syncErrMsg ? '<div class="ck-record-sync-err">同步失败：' + esc(syncErrMsg) + '</div>' : '')
      + '<div class="record-hero-km is-study"><strong>' + rStudyMin + ' <em>MIN</em></strong><span>' + esc(r.person) + ' · ' + rStudyHrs.toFixed(1) + ' h · ' + (studyFocusLevels[r.focus]?.[0] || '🧠') + ' ' + (studyFocusLevels[r.focus]?.[1] || '专注') + '</span></div>'
      + '<div class="record-subject-line">' + icon('book') + ' <strong>' + esc(r.subject || findTargetTitle(r.targetId)) + '</strong></div>'
      + '<div class="record-tags"><span class="badge-tag is-study-tag">学习档案</span>' + (r.tags || []).map(t => '<span>' + esc(t) + '</span>').join('') + '</div>'
      + '<div class="record-numbers"><div><strong>' + rStudyMin + '</strong><small>MIN / 分钟</small></div><div><strong>' + rStudyExact + '</strong><small>EXACT / ' + rStudySec + ' 秒</small></div><div><strong>#' + displaySeq + '</strong><small>LOG / 序号</small></div></div>'
      + '<p class="record-note">“' + esc(r.note || '专注一小时，胜过焦虑一整天。') + '”</p>'
      + (r.photo ? '<img class="record-photo" src="' + r.photo + '" alt="学习笔记照片">' : '')
      + '<div class="record-actions"><button type="button" class="like-btn ' + (r.liked ? 'liked' : '') + '" data-action="like-unified" data-value="' + r._key + '" aria-pressed="' + !!r.liked + '">' + icon('heart') + ' ' + (r.likes || '赞一个') + '</button>' + recRetryBtn + '<button type="button" id="receipt-edit-btn" class="edit-btn" data-action="edit-unified" data-value="' + r._key + '">编辑</button><button type="button" class="delete-btn" data-action="delete-unified" data-value="' + r._key + '">删除这条</button></div>'
      + '</article>';
  }
  return '<article class="record-card">'
    + '<div class="record-stamp"><span>RUN RECEIPT //' + stampNo + ' ' + syncPillMarkup(r) + '</span><span>' + icon('clock') + ' ' + r._bjDate + ' · ' + esc(r.time || '') + '</span></div>'
    + (syncErrMsg ? '<div class="ck-record-sync-err">同步失败：' + esc(syncErrMsg) + '</div>' : '')
    + '<div class="record-hero-km"><strong>' + Number(r.km).toFixed(2) + ' <em>KM</em></strong><span>' + esc(r.person) + ' ' + (feelings[r.feel]?.[0] || '🏃') + ' · ' + (feelings[r.feel]?.[1] || '') + '</span></div>'
    + '<div class="record-tags"><span class="badge-tag">' + level(r.person) + '</span>' + (r.tags || []).map(t => '<span>' + esc(t) + '</span>').join('') + '</div>'
    + '<div class="record-numbers"><div><strong>' + r.minutes + '</strong><small>MIN / 时长</small></div><div><strong>' + pace(r) + '</strong><small>PACE / 配速</small></div><div><strong>#' + displaySeq + '</strong><small>RUN / 序号</small></div></div>'
    + '<p class="record-note">“' + esc(r.note || '今天，也跑完了。') + '”</p>'
    + (r.photo ? '<img class="record-photo" src="' + r.photo + '" alt="本次晨跑照片">' : '')
    + '<div class="record-actions"><button type="button" class="like-btn ' + (r.liked ? 'liked' : '') + '" data-action="like-unified" data-value="' + r._key + '" aria-pressed="' + !!r.liked + '">' + icon('heart') + ' ' + (r.likes || '赞一个') + '</button>' + recRetryBtn + '<button type="button" id="receipt-edit-btn" class="edit-btn" data-action="edit-unified" data-value="' + r._key + '">编辑</button><button type="button" class="delete-btn" data-action="delete-unified" data-value="' + r._key + '">删除这条</button></div>'
    + '</article>';
}

function ensureReceiptDialog() {
  let dlg = $('#record-receipt-dialog');
  if (dlg) return dlg;
  dlg = document.createElement('dialog');
  dlg.id = 'record-receipt-dialog';
  dlg.className = 'receipt-dialog';
  dlg.setAttribute('aria-labelledby', 'receipt-dialog-title');
  dlg.innerHTML = '<div class="receipt-dialog-shell">'
    + '<div class="receipt-dialog-head">'
    + '<span id="receipt-dialog-title">战绩小票详情</span>'
    + '<div class="receipt-dialog-tools">'
    + '<span class="pager" id="receipt-dialog-pager"></span>'
    + '<button type="button" id="receipt-dialog-close" class="receipt-close-btn" aria-label="关闭小票">关闭 ×</button>'
    + '</div></div>'
    + '<div id="receipt-dialog-notice"></div>'
    + '<div id="receipt-dialog-body"></div>'
    + '</div>';
  document.body.appendChild(dlg);

  dlg.addEventListener('click', ev => {
    if (ev.target === dlg) closeReceiptDialog();
  });
  $('#receipt-dialog-close', dlg).addEventListener('click', () => closeReceiptDialog());
  dlg.addEventListener('close', () => {
    restoreFocusBySelector(lastReceiptFocusSelector, '.wall-card.is-selected, .records-filter-panel button');
  });
  return dlg;
}

function restoreFocusBySelector(sel, fallbackSel = '') {
  requestAnimationFrame(() => {
    const el = (sel && document.querySelector(sel)) || (fallbackSel && document.querySelector(fallbackSel));
    if (el && typeof el.focus === 'function') {
      try { el.focus({ preventScroll: false }); } catch { try { el.focus(); } catch {} }
    }
  });
}

function refreshReceiptDialog() {
  const dlg = $('#record-receipt-dialog');
  if (!dlg || !dlg.open) return;
  const dataset = getRecordsPageDataset();
  const list = dataset.displayList;
  let idx = list.findIndex(x => x._key === recordSelectKey);
  let target = idx >= 0 ? list[idx] : dataset.inRangeList.find(x => x._key === recordSelectKey);
  if (!target) {
    const allEver = allUnifiedRecords('all', false).map(x => ({ ...x, _bjDate: beijingDateOf(x) }));
    target = allEver.find(x => x._key === recordSelectKey);
  }
  if (!target) {
    dlg.close();
    return;
  }
  const effectiveList = idx >= 0 ? list : [target];
  const effectiveIdx = idx >= 0 ? idx : 0;

  $('#receipt-dialog-title', dlg).textContent = (target._kind === 'study' ? '学习战绩小票 · ' : '运动战绩小票 · ') + target._bjDate + ' · ' + target.person;
  $('#receipt-dialog-pager', dlg).innerHTML =
    '<button type="button" data-action="record-prev" aria-label="上一条记录" ' + (effectiveIdx <= 0 ? 'disabled' : '') + '>‹</button>'
    + '<span>' + (effectiveIdx + 1) + ' / ' + effectiveList.length + '</span>'
    + '<button type="button" data-action="record-next" aria-label="下一条记录" ' + (effectiveIdx >= effectiveList.length - 1 ? 'disabled' : '') + '>›</button>';
  $('#receipt-dialog-notice', dlg).innerHTML = externalFilterNotice
    ? '<div class="external-filter-notice is-in-dialog" role="status"><span>' + icon('spark') + ' ' + esc(externalFilterNotice) + '</span></div>'
    : '';
  $('#receipt-dialog-body', dlg).innerHTML = buildReceiptCardMarkup(target, effectiveIdx, effectiveList.length);
}

function openReceiptDialog(key, focusSelector = '') {
  if (key) recordSelectKey = key;
  if (focusSelector) lastReceiptFocusSelector = focusSelector;
  const dlg = ensureReceiptDialog();
  if (!dlg.open) dlg.showModal();
  refreshReceiptDialog();
  const closeBtn = $('#receipt-dialog-close', dlg);
  if (closeBtn) closeBtn.focus({ preventScroll: true });
}

function closeReceiptDialog() {
  const dlg = $('#record-receipt-dialog');
  if (dlg && dlg.open) dlg.close('cancel');
}

function recordsPage() {
  const dataset = getRecordsPageDataset();
  const inRangeList = dataset.inRangeList;
  const displayList = dataset.displayList;

  let curIdx = displayList.findIndex(x => x._key === recordSelectKey);
  if (curIdx < 0 && displayList.length) {
    curIdx = 0;
    recordSelectKey = displayList[0]._key;
  }
  const r = curIdx >= 0 ? displayList[curIdx] : null;

  // Interval KPIs driven strictly by inRangeList (shared batch)
  const sportRuns = inRangeList.filter(x => x._kind === 'sport');
  const studyItems = inRangeList.filter(x => x._kind === 'study');
  const sKm = sportRuns.reduce((s, x) => s + (Number(x.km) || 0), 0);
  const stMin = totalStudyMinutes(studyItems);
  const stH = Math.round((totalStudySeconds(studyItems) / 3600) * 10) / 10;
  let paceStr = "--'--\"";
  if (sportRuns.length && sKm > 0) {
    const totMin = sportRuns.reduce((s, x) => s + (Number(x.minutes) || 0), 0);
    const pSec = Math.round((totMin * 60) / sKm);
    paceStr = Math.floor(pSec / 60) + "'" + pad(pSec % 60) + '"';
  }
  const activeDays = new Set(inRangeList.map(x => x._bjDate)).size;

  const rangeText = recordRangeFilter === '30d' ? '近 30 天' : recordRangeFilter === 'all' ? '全部历史' : '近 7 天';
  const personText = recordPersonFilter === 'mine' ? (esc(state.name) + '（我）') : '全员';
  const kindText = recordKindFilter === 'sport' ? '运动' : recordKindFilter === 'study' ? '学习' : '全部';

  const dateGroups = new Map();
  for (const item of displayList) {
    if (!dateGroups.has(item._bjDate)) dateGroups.set(item._bjDate, []);
    dateGroups.get(item._bjDate).push(item);
  }
  const todayDk = today();
  const wallCards = Array.from(dateGroups, ([date, items]) =>
    '<section class="record-day"><h3>' + esc(date) + (date === todayDk ? ' · 今天' : '') + '</h3>'
    + items.map(item => {
      const isStudy = item._kind === 'study';
      const selected = item._key === recordSelectKey;
      const type = isStudy ? '学习' : '运动';
      const value = isStudy ? studyMinutesOf(item) + ' 分钟' : Number(item.km).toFixed(2) + ' km';
      const time = item.time || '';
      const status = recordSyncStateKey(item);
      const statusMeta = syncStatusMeta(status);
      const itemOp = item.operationId ? roomPendingOps().find(x => x.operationId === item.operationId) : null;
      const errMsg = item.syncError || itemOp?.lastError || '';
      const needsRetry = Boolean(itemOp);
      return '<div class="record-row-item ' + (status === 'failed' ? 'is-sync-failed' : (status === 'pending' || status === 'local') ? 'is-sync-pending' : '') + '">'
        + '<button type="button" class="wall-card record-row ' + (isStudy ? 'is-study' : 'is-sport')
        + (selected ? ' is-selected' : '') + (item._key === newlyArchivedRecordKey ? ' is-newly-archived' : '')
        + '" data-action="open-receipt-modal" data-value="' + esc(item._key)
        + '" data-focus-key="wall:' + esc(item._key) + '" aria-pressed="' + selected
        + '" aria-label="' + esc([date, time, type, value, item.person, statusMeta.label, errMsg].filter(Boolean).join('，')) + '">'
        + '<span class="record-row-type">' + type + '</span><strong>' + value + '</strong>'
        + '<span class="record-row-meta">' + esc([time, item.person].filter(Boolean).join(' · ')) + '</span>'
        + '<span class="record-row-sync is-' + statusMeta.key + (statusMeta.key === 'synced' ? ' is-synced-quiet' : '') + '">' + statusMeta.label + '</span>'
        + '<span class="record-row-arrow" aria-hidden="true">›</span></button>'
        + (needsRetry ? '<div class="record-row-sync-bar" role="' + (status === 'failed' ? 'alert' : 'status') + '">'
          + '<span>' + (errMsg ? ('原因：' + esc(errMsg)) : esc(statusMeta.detail)) + '</span>'
          + (item.operationId ? '<button type="button" class="ck-btn ck-btn-retry" data-action="retry-sync" data-value="' + esc(item.operationId) + '">重试同步</button>' : '')
          + '</div>' : '')
        + '</div>';
    }).join('') + '</section>'
  ).join('');

  const externalNoticeHtml = externalFilterNotice
    ? '<div class="external-filter-notice" role="status" aria-live="polite"><span>' + icon('spark') + ' ' + esc(externalFilterNotice) + '</span><button type="button" class="btn-xs" data-action="reset-filter-default">恢复默认筛选</button></div>'
    : '';

  const filterPanelHtml = '<section class="records-filter-panel" id="records-shared-filters" aria-label="记录筛选">'
    + externalNoticeHtml
    + '<div class="filter-row">'
    + '<div class="filter-group"><span class="filter-label">类型</span><div class="mini-subtabs" role="group" aria-label="按类型筛选">'
    + '<button type="button" aria-pressed="' + (recordKindFilter === 'all') + '" class="subtab ' + (recordKindFilter === 'all' ? 'active' : '') + '" data-action="set-record-kind" data-value="all">全部</button>'
    + '<button type="button" aria-pressed="' + (recordKindFilter === 'sport') + '" class="subtab is-sport-tab ' + (recordKindFilter === 'sport' ? 'active' : '') + '" data-action="set-record-kind" data-value="sport">运动</button>'
    + '<button type="button" aria-pressed="' + (recordKindFilter === 'study') + '" class="subtab is-study-tab ' + (recordKindFilter === 'study' ? 'active' : '') + '" data-action="set-record-kind" data-value="study">学习</button>'
    + '</div></div>'
    + '<div class="filter-group"><span class="filter-label">人员</span><div class="mini-subtabs" role="group" aria-label="按人员筛选">'
    + '<button type="button" aria-pressed="' + (recordPersonFilter === 'mine') + '" class="subtab ' + (recordPersonFilter === 'mine' ? 'active' : '') + '" data-action="set-record-person" data-value="mine">我</button>'
    + '<button type="button" aria-pressed="' + (recordPersonFilter === 'all') + '" class="subtab ' + (recordPersonFilter === 'all' ? 'active' : '') + '" data-action="set-record-person" data-value="all">全员</button>'
    + '</div></div>'
    + '</div>'
    + '<div class="filter-row">'
    + '<div class="filter-group"><span class="filter-label">范围</span><div class="mini-subtabs" role="group" aria-label="按时间范围筛选">'
    + '<button type="button" aria-pressed="' + (recordRangeFilter === '7d') + '" class="subtab ' + (recordRangeFilter === '7d' ? 'active' : '') + '" data-action="set-record-range" data-value="7d">近 7 天</button>'
    + '<button type="button" aria-pressed="' + (recordRangeFilter === '30d') + '" class="subtab ' + (recordRangeFilter === '30d' ? 'active' : '') + '" data-action="set-record-range" data-value="30d">近 30 天</button>'
    + (recordRangeFilter === 'all' ? '<button type="button" aria-pressed="true" class="subtab active" data-action="set-record-range" data-value="all">全部历史</button>' : '')
    + '</div></div>'
    + '<div class="filter-group filter-date-group"><label class="filter-label" for="records-date-jump">日期</label>'
    + '<input type="date" id="records-date-jump" name="record-date" class="records-date-input" value="' + esc(recordSelectedDate) + '" max="' + todayDk + '" autocomplete="off">'
    + (recordSelectedDate ? '<button type="button" class="btn-back-range" data-action="clear-date-filter">清除日期</button>' : '')
    + '</div>'
    + '</div>'
    + '</section>';

  const chartModeBarHtml = '<div class="records-chart-mode-bar" role="group" aria-label="切换每日柱或累计折线">'
    + '<span class="filter-label">图表口径</span>'
    + '<div class="mini-subtabs">'
    + '<button type="button" aria-pressed="' + (recordTrendMode === 'daily') + '" class="subtab ' + (recordTrendMode === 'daily' ? 'active' : '') + '" data-action="set-record-trend" data-value="daily">每日量</button>'
    + '<button type="button" aria-pressed="' + (recordTrendMode === 'cum') + '" class="subtab ' + (recordTrendMode === 'cum' ? 'active' : '') + '" data-action="set-record-trend" data-value="cum">累计量</button>'
    + '</div></div>';

  const moreAnalyticsHtml = '<section class="records-more-box" aria-label="更多分析">'
    + '<button type="button" class="records-more-toggle" data-action="toggle-more-analytics" aria-expanded="' + recordsMoreOpen + '">'
    + '<span>' + icon('chart') + ' 更多分析</span>'
    + '<span class="more-toggle-ind">' + (recordsMoreOpen ? '收起 ▲' : '展开 ▼') + '</span>'
    + '</button>'
    + (recordsMoreOpen
      ? '<div class="records-more-body">'
        + subtabs(['28天热力', '黄金时段', '强度分布', '状态感觉'], recordsMoreChartType, 'more-chart-type', 'data-tabs', { '28天热力': 'calendar', '黄金时段': 'clock', '强度分布': 'route', '状态感觉': 'spark' })
        + '<div class="data-chart blueprint-chart">' + moreAnalyticsChart(dataset) + '</div>'
        + '</div>'
      : '')
    + '</section>';

  const dispSportKm = displayList.filter(x => x._kind === 'sport').reduce((s, x) => s + (Number(x.km) || 0), 0);
  const dispStudyMin = totalStudyMinutes(displayList.filter(x => x._kind === 'study'));
  const wallSummaryMetrics = '<span class="wall-kpi-inline">运动 ' + dispSportKm.toFixed(1) + ' km · 学习 ' + dispStudyMin + ' 分钟</span>';
  const wallScopeBarHtml = recordSelectedDate
    ? '<div class="wall-active-filter-bar is-date-focused" role="status"><span>已选日期：<b>' + esc(recordSelectedDate) + (recordSelectedDate === todayDk ? '（今天）' : '') + '</b> · 共 ' + displayList.length + ' 条</span>' + wallSummaryMetrics + '</div>'
    : '<div class="wall-active-filter-bar"><span>当前范围：<b>' + personText + '</b> · <b>' + kindText + '</b> · <b>' + rangeText + '</b>（共 ' + displayList.length + ' 条）</span>' + wallSummaryMetrics + '</div>';

  const anyTodayRecForPerson = allUnifiedRecords('all', recordPersonFilter === 'mine').some(x => beijingDateOf(x) === todayDk);
  const isTodayEmpty = recordSelectedDate === todayDk && !anyTodayRecForPerson;
  const emptyWallHtml = isTodayEmpty
    ? '<div class="empty records-empty" role="status"><p><strong>今天还没有记录</strong></p><div class="records-empty-actions"><button type="button" class="today-act-btn is-sport" data-action="checkin" data-mode="sport">记运动</button><button type="button" class="today-act-btn is-study" data-action="checkin" data-mode="study">记学习</button><button type="button" class="btn-back-range" data-action="clear-date-filter">查看' + rangeText + '记录</button></div></div>'
    : '<div class="empty records-empty" role="status"><p><strong>没有符合筛选条件的记录</strong></p><div class="records-empty-actions">'
      + (recordSelectedDate ? '<button type="button" class="btn-back-range" data-action="clear-date-filter">清除日期</button>' : '')
      + '<button type="button" class="btn-back-range" data-action="reset-filter-default">恢复默认筛选</button>'
      + '</div></div>';

  return filterPanelHtml + '<div class="records-layout"><div class="records-left">'
    + '<section class="poster-hero poster-frost poster-compact" data-wm="LOG">'
    + '<div class="poster-meta" id="records-poster-meta"><span>' + personText + ' · ' + kindText + ' · ' + rangeText + '</span><span>活跃 ' + activeDays + ' 天 · 共 ' + inRangeList.length + ' 条</span></div>'
    + '<div class="poster-kpis poster-kpis-4" id="records-poster-kpis">'
    + '<div><small>区间跑量</small><strong>' + sKm.toFixed(1) + '<em>KM</em></strong></div>'
    + '<div><small>区间学习</small><strong>' + stMin + '<em>MIN</em></strong><span class="kpi-sub">(' + stH + 'H)</span></div>'
    + '<div><small>区间条数</small><strong>' + inRangeList.length + '<em>条</em></strong></div>'
    + '<div><small>区间均配速</small><strong>' + paceStr + '</strong></div>'
    + '</div></section>'
    + '<div id="records-left-dynamic">'
    + chartModeBarHtml
    + '<div class="data-chart blueprint-chart records-main-chart">' + recordsTrendChart(dataset) + '</div>'
    + moreAnalyticsHtml
    + '</div>'
    + '</div><div class="records-right" id="records-right-dynamic">'
    + heading('记录', '<span class="pager"><button type="button" data-action="record-prev" aria-label="上一条记录" ' + (curIdx <= 0 ? 'disabled' : '') + '>‹</button><span>' + (r ? curIdx + 1 : 0) + ' / ' + displayList.length + '</span><button type="button" data-action="record-next" aria-label="下一条记录" ' + (curIdx >= displayList.length - 1 || !displayList.length ? 'disabled' : '') + '>›</button></span>', 'spark')
    + wallScopeBarHtml
    + (displayList.length ? '<div class="record-wall-grid records-wall-scoped" aria-label="按日期分组的记录">' + wallCards + '</div>' : emptyWallHtml)
    + '</div></div>';
}

function updateRecordsPageInPlace() {
  const filters = $('#records-shared-filters');
  const leftDyn = $('#records-left-dynamic');
  const rightDyn = $('#records-right-dynamic');
  const metaEl = $('#records-poster-meta');
  const kpisEl = $('#records-poster-kpis');
  if (view !== 'records' || !filters || !leftDyn || !rightDyn || !metaEl || !kpisEl) {
    render(true);
    return;
  }
  const tmp = document.createElement('div');
  tmp.innerHTML = recordsPage();
  const newFilters = tmp.querySelector('#records-shared-filters');
  const newMeta = tmp.querySelector('#records-poster-meta');
  const newKpis = tmp.querySelector('#records-poster-kpis');
  const newLeft = tmp.querySelector('#records-left-dynamic');
  const newRight = tmp.querySelector('#records-right-dynamic');
  if (newFilters) filters.innerHTML = newFilters.innerHTML;
  if (newMeta) metaEl.innerHTML = newMeta.innerHTML;
  if (newKpis) kpisEl.innerHTML = newKpis.innerHTML;
  if (newLeft) leftDyn.innerHTML = newLeft.innerHTML;
  if (newRight) rightDyn.innerHTML = newRight.innerHTML;
  refreshReceiptDialog();
  syncRecordsHashUrl();
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

  const myCombo = dualStreak();
  const cTier = comboTier(myCombo);
  const nextMilestone = cTier.nextAt || 30;
  const comboGap = cTier.nextAt ? Math.max(0, cTier.nextAt - myCombo) : 0;
  const comboPct = cTier.nextAt ? Math.min(100, Math.round(myCombo / nextMilestone * 100)) : 100;

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
    + '<section class="combo-stage-card tier-' + cTier.tier + '" data-combo-tier="' + cTier.tier + '">'
    + '<canvas class="combo-particles-canvas" aria-hidden="true"></canvas>'
    + '<div class="combo-stage-left">'
    + '<div class="combo-emblem-wrap">' + comboPixelEmblemSvg(cTier, 46) + '</div>'
    + '<div>'
    + '<div class="combo-kicker"><span class="slash-chip">' + cTier.code + '</span><small>' + cTier.label + '</small></div>'
    + '<div class="combo-big-num"><strong>COMBO ×' + myCombo + '</strong><span>连续真实打卡天数</span></div>'
    + '</div></div>'
    + '<div class="combo-stage-right">'
    + '<div class="combo-milestone-row"><span>里程碑阶梯：1 · 3 · 7 · 14 · 30 天</span><strong>' + (cTier.nextAt ? ('距 ' + cTier.nextAt + ' 天升级还差 ' + comboGap + ' 天') : '已登顶最高像素徽记 ✓') + '</strong></div>'
    + PixelProgressBar.renderHtml({ progress: comboPct, height: 14, width: '100%', bare: true, color: cTier.color, className: 'combo-ppb', ariaLabel: 'COMBO 里程碑进度' })
    + '</div>'
    + '</section>'
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
        + (() => { const mDays = dualStreak(n); const mTier = comboTier(mDays); return '<div class="person-card-top"><span class="avatar" style="border-color:' + clr + ';color:' + clr + '">' + esc(n.slice(0, 1)) + '</span><div class="person-meta"><h3>' + esc(n) + (i === 0 ? ' · 我' : '') + '</h3><span class="badge-tag">' + level(n) + ' · 自律 ' + mHb.done + '/' + mHb.total + '</span></div><span class="person-combo-chip tier-' + mTier.tier + '">' + comboPixelEmblemSvg(mTier, 14) + ' COMBO ×' + mDays + '</span>'; })()
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

const renderers = { home, progress, plan, study, ranking, achievements, records: recordsPage, people, more: morePage };
function render(preserveScroll = false) {
  const page = $('#page');
  const prevTop = preserveScroll && page ? page.scrollTop : 0;
  const active = document.activeElement;
  const restoreAction = preserveScroll && page?.contains(active) && active.dataset.focusKey
    && ['home', 'study', 'records', 'ranking'].includes(view)
    ? buildStableFocusSelector(active) : '';
  updateHeader();
  page.dataset.page = view;
  page.innerHTML = '<div class="' + (preserveScroll ? 'page-stay' : 'page-enter') + '" style="display:flex;flex-direction:column;flex:1;min-height:0">' + renderers[view]() + '</div>';
  if (preserveScroll) page.scrollTop = prevTop;
  if (restoreAction) page.querySelector(restoreAction)?.focus({ preventScroll: true });
  const isMoreSubView = MORE_VIEWS.includes(view);
  const activeMoreItem = isMoreSubView ? MORE_ITEMS.find(x => x.id === view) : null;
  $('.bottom-nav').innerHTML = nav.map(([id, label, ico]) => {
    const isExact = id === view;
    const isActive = isExact || (id === 'more' && isMoreSubView);
    const ariaLabel = (id === 'more' && activeMoreItem) ? ('更多，当前在' + activeMoreItem.label + '页') : label;
    return '<button type="button" data-view="' + id + '" class="ck-nav-btn' + (isActive ? ' active' : '') + '" aria-label="' + esc(ariaLabel) + '"' + (isExact ? ' aria-current="page"' : (isActive ? ' aria-current="true"' : '')) + '>' + icon(ico, 'nav-ico') + '<span class="nav-label ck-nav-label">' + label + '</span></button>';
  }).join('');
  clearInterval(quoteTimer);
  if (view === 'home' && !matchMedia('(prefers-reduced-motion: reduce)').matches) quoteTimer = setInterval(nextQuote, 7000);
  if (view === 'records') refreshReceiptDialog();
}
function nextQuote() { quoteIndex = (quoteIndex + 1) % quotes.length; const el = $('#quote'); if (el) el.outerHTML = quoteMarkup(); initPixelMatrices(); }
function buildRecordsHash() {
  const q = new URLSearchParams();
  if (recordKindFilter !== 'all') q.set('kind', recordKindFilter);
  if (recordPersonFilter !== 'mine') q.set('person', recordPersonFilter);
  if (recordRangeFilter !== '7d') q.set('range', recordRangeFilter);
  if (recordTrendMode !== 'daily') q.set('trend', recordTrendMode);
  if (recordSelectedDate) q.set('date', recordSelectedDate);
  const qs = q.toString();
  return '#records' + (qs ? '?' + qs : '');
}
function syncRecordsHashUrl(usePush = false) {
  if (typeof location === 'undefined' || view !== 'records') return;
  const targetHash = buildRecordsHash();
  if (location.hash !== targetHash) {
    try {
      if (usePush) history.pushState(null, '', targetHash);
      else history.replaceState(null, '', targetHash);
    } catch {}
  }
}
function applyRecordsHashQuery(hashStr) {
  if (!hashStr || !hashStr.includes('?')) return false;
  const qs = hashStr.split('?')[1] || '';
  const q = new URLSearchParams(qs);
  let changed = false;
  if (q.has('kind') && ['all', 'sport', 'study'].includes(q.get('kind'))) { recordKindFilter = q.get('kind'); changed = true; }
  if (q.has('person') && ['mine', 'all'].includes(q.get('person'))) { recordPersonFilter = q.get('person'); changed = true; }
  if (q.has('range') && ['7d', '30d', 'all'].includes(q.get('range'))) { recordRangeFilter = q.get('range'); changed = true; }
  if (q.has('trend') && ['daily', 'cum'].includes(q.get('trend'))) { recordTrendMode = q.get('trend'); changed = true; }
  if (q.has('date') && /^\d{4}-\d{2}-\d{2}$/.test(q.get('date'))) {
    recordSelectedDate = q.get('date');
    selectedBarDate = recordSelectedDate;
    changed = true;
  }
  return changed;
}
applyRecordsHashQuery(typeof location !== 'undefined' ? location.hash : '');

function navigate(v, fromPop = false) {
  if (!VALID_VIEWS.includes(v)) v = 'home';
  if (v !== 'records') closeReceiptDialog();
  const prevView = view;
  view = v;
  const targetHash = v === 'records' ? buildRecordsHash() : ('#' + v);
  if (!fromPop && typeof location !== 'undefined' && location.hash !== targetHash) {
    try {
      if (prevView !== v) history.pushState(null, '', targetHash);
      else history.replaceState(null, '', targetHash);
    } catch { location.hash = v; }
  }
  render(false);
  $('#page').scrollTop = 0;
  $('#page').focus({ preventScroll: true });
}
window.addEventListener('hashchange', () => {
  const rawHash = location.hash.replace(/^#/, '');
  const hv = rawHash.split('?')[0];
  if (hv === 'records') applyRecordsHashQuery(location.hash);
  if (VALID_VIEWS.includes(hv)) {
    if (hv !== view) navigate(hv, true);
    else if (hv === 'records') updateRecordsPageInPlace();
  }
});

function buildStableFocusSelector(el) {
  if (!(el instanceof HTMLElement)) return '';
  if (el.dataset && el.dataset.focusKey) return '[data-focus-key="' + el.dataset.focusKey + '"]';
  if (el.id) return '#' + el.id;
  if (el.dataset && el.dataset.action) {
    let sel = '[data-action="' + el.dataset.action + '"]';
    if (el.dataset.mode) sel += '[data-mode="' + el.dataset.mode + '"]';
    if (el.dataset.target) sel += '[data-target="' + el.dataset.target + '"]';
    if (el.dataset.value) sel += '[data-value="' + el.dataset.value + '"]';
    return sel;
  }
  return '';
}

function openEditor(title, body, onSave, button = '保存 →') {
  const dlgCheck = $('#editor');
  if (!dlgCheck || !dlgCheck.open) {
    lastEditorOpener = document.activeElement;
    lastEditorFocusSelector = buildStableFocusSelector(lastEditorOpener);
  }
  dialogSave = onSave;
  $('#editor-title').textContent = title;
  $('#editor-body').innerHTML = body;
  $('#editor-save').textContent = button;
  $('#editor-save').hidden = !onSave;
  const dlg = $('#editor');
  if (!dlg.open) dlg.showModal();
  const firstInput = dlg.querySelector('#editor-body input:not([type="hidden"]), #editor-body select, #editor-body textarea, #editor-body button, #editor-save:not([hidden]), #editor-close');
  if (firstInput && typeof firstInput.focus === 'function') firstInput.focus({ preventScroll: true });
}
$('#editor')?.addEventListener('close', () => {
  if (lastEditorOpener && lastEditorOpener.isConnected && typeof lastEditorOpener.focus === 'function') {
    try { lastEditorOpener.focus(); } catch {}
  } else if (lastEditorFocusSelector) {
    restoreFocusBySelector(lastEditorFocusSelector);
  }
});
$('#editor-close')?.addEventListener('click', () => { pendingImportBackup = null; $('#editor').close('cancel'); });
$('#editor-cancel')?.addEventListener('click', () => { pendingImportBackup = null; $('#editor').close('cancel'); });
$('#editor')?.addEventListener('click', e => { if (e.target === $('#editor')) { pendingImportBackup = null; $('#editor').close('cancel'); } });
$('#editor-form').addEventListener('submit', async e => {
  if (dialogSave) {
    e.preventDefault();
    const res = await dialogSave();
    if (res !== false) $('#editor').close('save');
  }
});
function openRenameEditor() {
  openEditor('你的个人昵称', '<label for="name-input">在运动跑道与学习档案中，怎么称呼你？</label><input id="name-input" value="' + esc(state.name) + '" maxlength="12" required autocomplete="nickname">', () => {
    const name = $('#name-input').value.trim();
    if (!name) { $('#name-input').focus(); return false; }
    if (state.members.includes(name)) { toast('这个名字已在伙伴名单里。'); return false; }
    state.records.forEach(r => { if (r.person === state.name) r.person = name; });
    state.studyRecords.forEach(r => { if (r.person === state.name) r.person = name; });
    const oldName = state.name;
    state.name = name; persist(); render(true); toast('新名字，新起点。');
    queueOrSendWriteOp({ operationId: nextOpId('rename'), coalesceKey: 'rename', kind: 'rename', endpoint: '/rename', method: 'POST', payload: { oldName, newName: name } });
  });
}
if ($('#rename')) $('#rename').onclick = openRenameEditor;

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
  const stopped = motionPaused || reducedMotion.matches || document.hidden;
  const motionLabel = reducedMotion.matches ? '跟随系统：减少动效' : motionPaused ? '开启动效 ▶' : '暂停动效 Ⅱ';
  const motionStatusText = reducedMotion.matches ? '已跟随系统减少动态效果' : (motionPaused ? '已暂停动效' : '动效运行中');
  const motionRow = '<div class="ck-settings-row ck-settings-motion-row">'
    + '<div class="ck-settings-row-info"><strong>动效控制</strong><small id="ck-settings-motion-state">' + motionStatusText + '</small></div>'
    + '<button type="button" class="motion-toggle ck-settings-motion-btn" id="motion-toggle" data-action="toggle-motion" aria-pressed="' + String(stopped) + '"' + (reducedMotion.matches ? ' disabled' : '') + '>' + motionLabel + '</button>'
    + '</div>';
  const renameRow = '<button type="button" class="settings-link ck-settings-rename-btn" id="settings-rename" aria-label="改名字，当前昵称 ' + esc(state.name) + '"><span>✎ 改名字</span><span class="ck-settings-meta">当前：' + esc(state.name) + '</span></button>';
  const modeBadge = isServerOnline
    ? '<div style="margin-bottom:12px;padding:8px 12px;background:#eef7ed;border:1px solid #7bc676;color:#1e4620;font-size:12px;display:flex;align-items:center;justify-content:space-between"><span><strong>● 在线后端已连接</strong> (房间: ' + esc(currentRoomCode) + ')</span><button type="button" id="btn-sync-to-cloud" style="border:1px solid #7bc676;background:#fff;padding:2px 8px;font-size:11px;cursor:pointer">将本地缓存推送到云端 ↑</button></div>'
    : '<div style="margin-bottom:12px;padding:8px 12px;background:#fff8ee;border:1px solid #e4a334;color:#7a4b04;font-size:12px"><strong>○ 离线模式 (localStorage)</strong><br><small>双击打开网页.cmd 或纯本地使用；启动后端后刷新即享 SQLite 真持久化与云端多人同步。</small></div>';

  openEditor('设置与备份', motionRow + renameRow + modeBadge + '<button type="button" class="settings-link" id="export-data">↗ 导出完整数据备份 .json</button><label for="import-data">从备份恢复（将替换当前数据）</label><input id="import-data" type="file" accept=".json,application/json"><button type="button" class="settings-link" id="open-ppb-demo">🧩 像素进度条组件演示 (0%–100% / 不确定状态)</button><a class="settings-link" href="pixel-progress-demo.html" target="_blank">↗ 在独立窗口打开完整组件演示页</a><a class="settings-link" href="film.html">品牌短片</a><button type="button" class="settings-link" id="download-poster">↓ 保存今日双轨打卡海报 .png</button><button type="button" class="settings-link danger" id="clear-records">清空当前运动与学习记录</button>', null);
  syncMotion();
  const firstSettingCtrl = $('#motion-toggle:not(:disabled)') || $('#settings-rename');
  if (firstSettingCtrl) firstSettingCtrl.focus({ preventScroll: true });
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
  if (e.target.id === 'records-date-jump') {
    const val = (e.target.value || '').trim();
    externalFilterNotice = '';
    if (!val) {
      recordSelectedDate = '';
      updateRecordsPageInPlace();
      restoreFocusBySelector('#records-date-jump');
      return;
    }
    recordSelectedDate = val;
    selectedBarDate = val;
    const min7 = dateShift(-6);
    const min30 = dateShift(-29);
    if (recordRangeFilter === '7d' && val < min7) {
      recordRangeFilter = val >= min30 ? '30d' : 'all';
    } else if (recordRangeFilter === '30d' && val < min30) {
      recordRangeFilter = 'all';
    }
    updateRecordsPageInPlace();
    restoreFocusBySelector('#records-date-jump');
    return;
  }
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
  if (hint) hint.textContent = '已专注 ' + Math.floor(elapsed / 60) + ' 分 ' + (elapsed % 60) + ' 秒 · 满 60 秒可记入';
  const finBtn = $('[data-action="pomo-finish"]');
  if (finBtn) finBtn.disabled = elapsed < 60 || pomoSession.state === 'saving';
  const homeNote = $('#home-focus-note');
  if (homeNote) {
    const fm = getStudyFocusEntryMeta();
    homeNote.textContent = fm.stateText ? ('专注计时：' + findTargetTitle(pomodoroTargetId) + ' · ' + fm.stateText) : '';
  }
  const fc = getStudyFocusCharge();
  const lightHero = $('.poster-lightning');
  if (lightHero) lightHero.dataset.focusCharge = fc.chargeNorm.toFixed(3);
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
      triggerElectricSweep(2400);
      triggerLightningSurge(1800);
      toast('专注计时蓄能满格！电流已扫过边框，请点击「记入学习 ✓」落库。');
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
        + '<div class="field-group"><label for="er-min">专注时长（分钟，1–960）</label><input id="er-min" type="number" inputmode="numeric" autocomplete="off" min="1" max="960" value="' + esc(studyMinutesOf(rec) || 60) + '"></div>'
      : '<div class="field-group"><label for="er-km">距离（km，0.1–300）</label><input id="er-km" type="number" inputmode="decimal" autocomplete="off" min="0.1" max="300" step="0.01" value="' + esc(rec.km) + '"></div>'
        + '<div class="field-group"><label for="er-min">时长（分钟）</label><input id="er-min" type="number" inputmode="numeric" autocomplete="off" min="1" max="1440" value="' + esc(rec.minutes) + '"></div>')
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
      const seconds = minVal === studyMinutesOf(rec) ? studySecondsOf(rec) : minVal * 60;
      const tObj = state.studyTargets.find(t => t.id === newTid);
      patchPayload = normalizeStudyRecord({ ...patchPayload, targetId: newTid, subject: tObj?.title || rec.subject, seconds, focus: feelVal });
    } else {
      const kmVal = Math.round(Number($('#er-km').value) * 100) / 100;
      if (!Number.isFinite(kmVal) || kmVal < 0.1 || kmVal > 300) { toast('跑步距离需在 0.1–300 km 之间'); return false; }
      patchPayload = { ...patchPayload, km: kmVal, feel: feelVal };
    }

    const oldDate = beijingDateOf(rec);
    const editOpId = nextOpId('edit');
    const fullPatch = { ...patchPayload, person: state.name, operationId: editOpId };
    if (rec.version) fullPatch.baseVersion = rec.version;
    if (isServerOnline) {
      markSelfOpId(editOpId);
      const res = await serverFetch('/records/' + kind + '/' + id, 'PATCH', fullPatch);
      if (!res.ok) {
        if (res.status === 0 || res.offline) {
          Object.assign(rec, isStudy ? normalizeStudyRecord(patchPayload) : patchPayload, { operationId: editOpId, syncStatus: 'failed', syncError: res.error || '无法连接到服务器' });
          enqueuePendingOp({ operationId: editOpId, coalesceKey: 'edit:' + kind + ':' + id, kind, recordId: rec.id, endpoint: '/records/' + kind + '/' + id, method: 'PATCH', payload: fullPatch, status: 'failed', lastError: rec.syncError });
        } else {
          toast(res.error || '编辑失败');
          return false;
        }
      } else {
        const merged = res.record || patchPayload;
        Object.assign(rec, isStudy ? normalizeStudyRecord(merged) : merged, { syncStatus: 'synced', syncError: '' });
      }
    } else {
      Object.assign(rec, isStudy ? normalizeStudyRecord(patchPayload) : patchPayload, { operationId: editOpId, syncStatus: 'local', syncError: '' });
      enqueuePendingOp({ operationId: editOpId, coalesceKey: 'edit:' + kind + ':' + id, kind, recordId: rec.id, endpoint: '/records/' + kind + '/' + id, method: 'PATCH', payload: fullPatch, status: 'pending', lastError: '' });
    }
    if (oldDate !== dateVal) {
      selectedBarDate = dateVal;
      if (recordSelectedDate === oldDate) {
        const rangeMin = recordRangeFilter === '30d' ? dateShift(-29) : (recordRangeFilter === 'all' ? '0000-01-01' : dateShift(-6));
        recordSelectedDate = dateVal >= rangeMin && dateVal <= today() ? dateVal : '';
      }
    }
    recordSelectKey = (isStudy ? 'study:' : 'sport:') + rec.id;
    recomputeStudyTargetDoneHours();
    persistLocalOnly();
    render(true);
    toast('记录已更新，两天汇总与目标已同步重算！');
  }, '保存修改 →');
}

/* ---------- Global Event Delegation ---------- */
document.addEventListener('click', async e => {
  const navButton = e.target.closest('[data-view]'); if (navButton) {
    if (navButton.dataset.view === 'records' && view !== 'records') {
      recordSelectedDate = '';
      externalFilterNotice = '';
    }
    navigate(navButton.dataset.view);
    return;
  }
  if (e.target.closest('#motion-toggle, [data-action="toggle-motion"]')) { if (!reducedMotion.matches) { motionPaused = !motionPaused; syncMotion(); } return; }
  if (e.target.closest('#settings-rename')) { openRenameEditor(); return; }
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

  const qdot = e.target.closest('[data-quote]'); if (qdot) { e.stopPropagation(); quoteIndex = Number(qdot.dataset.quote); const el = $('#quote'); if (el) el.outerHTML = quoteMarkup(); initPixelMatrices(); syncMotion(); const qTheme = quotes[quoteIndex % quotes.length]?.[1]; if (qTheme === 'flame') triggerFlameSurge(950); else if (qTheme === 'storm') triggerStormSurge(3600); else if (qTheme === 'frost') triggerFrostSurge(3100); else triggerLightningSurge(520); return; }
  if (e.target.closest('#quote') && !e.target.closest('button')) { nextQuote(); syncMotion(); const qTheme = quotes[quoteIndex % quotes.length]?.[1]; if (qTheme === 'flame') triggerFlameSurge(950); else if (qTheme === 'storm') triggerStormSurge(3600); else if (qTheme === 'frost') triggerFrostSurge(3100); else triggerLightningSurge(520); return; }
  if (!e.target.closest('button, a, input, [data-action]')) {
    if (e.target.closest('.poster-flame')) { triggerFlameSurge(1150); }
    else if (e.target.closest('.poster-lightning')) { triggerLightningSurge(950); }
    else if (e.target.closest('.poster-storm')) { triggerStormSurge(3600); }
    else if (e.target.closest('.poster-frost')) { triggerFrostSurge(3100); }
  }

  const b = e.target.closest('[data-action]'); if (!b) return;
  const a = b.dataset.action, v = b.dataset.value;

  if (a === 'checkin') { openCheckin(b.dataset.mode || 'sport', b.dataset.target || null, b.dataset.person || state.name); return; }
  if (a === 'resume-draft') { openCheckin(b.dataset.mode || 'sport'); return; }
  if (a === 'discard-draft') { clearSavedDraft(b.dataset.mode || 'sport'); render(true); toast('已丢弃未完成草稿'); return; }
  if (a === 'retry-sync') { await retryPendingOps(v || null); return; }
  if (a === 'go-view') { navigate(v); return; }
  if (a === 'go-today-records') {
    const t = today();
    recordKindFilter = 'all';
    recordPersonFilter = 'mine';
    recordSelectedDate = t;
    selectedBarDate = t;
    externalFilterNotice = '';
    navigate('records');
    return;
  }
  if (a === 'go-focus') {
    navigate('study');
    $('[data-action="study-focus-entry"]')?.click();
    return;
  }
  if (a === 'study-focus-entry') {
    if (['idle', 'saved', 'paused'].includes(pomoSession.state) && !pomoSession.errorMsg) {
      $('[data-action="pomo-toggle"]')?.click();
    }
    requestAnimationFrame(() => {
      const panel = $('#pomodoro-panel');
      if (panel) panel.scrollIntoView({ behavior: 'auto', block: 'nearest' });
      const btn = $((pomoSession.state === 'completed' || pomoSession.errorMsg) ? '[data-action="pomo-finish"]' : '[data-action="pomo-toggle"]');
      if (btn) btn.focus({ preventScroll: true });
    });
    return;
  }
  if (a === 'toggle-home-bp') { homeBpMode = homeBpMode === 'track' ? 'study' : 'track'; render(true); return; }
  if (a === 'radar-axis') { radarFocusAxis = v; render(true); toast('四维聚焦：' + v); return; }
  if (a === 'home-pick-target') { navigate('study'); toast('已定位到学习目标：' + findTargetTitle(v)); return; }
  if (a === 'bp-focus') { if (!focusAppleRing(v, b.closest('.apple-rings-panel'))) render(true); return; }
  if (a === 'quote-next') { nextQuote(); syncMotion(); const qTheme = quotes[quoteIndex % quotes.length]?.[1]; if (qTheme === 'flame') triggerFlameSurge(950); else if (qTheme === 'storm') triggerStormSurge(3600); else if (qTheme === 'frost') triggerFrostSurge(3100); else triggerLightningSurge(520); return; }
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
  if (a === 'open-record') { openExternalRecord(v, b.dataset.focusKey ? ('[data-focus-key="' + b.dataset.focusKey + '"]') : ''); return; }

  if (a === 'rank-period' || a === 'rank-metric') {
    if (a === 'rank-period') rankPeriod = v;
    else rankMetric = v;
    render(true);
    restoreFocusBySelector('[data-action="' + a + '"][data-value="' + v + '"]');
    return;
  }
  if (a === 'rank-chart-mode') { rankChartMode = v === '学习专注对比' ? 'study' : 'sport'; selectedNodeKey = ''; render(true); return; }

  if (a === 'chart-type') { chartType = v; selectedChartNote = ''; render(true); return; }
  if (a === 'more-chart-type') { recordsMoreChartType = v; selectedChartNote = ''; selectedBucket = null; updateRecordsPageInPlace(); restoreFocusBySelector('[data-action="more-chart-type"][data-value="' + v + '"]'); return; }
  if (a === 'toggle-more-analytics') { recordsMoreOpen = !recordsMoreOpen; updateRecordsPageInPlace(); restoreFocusBySelector('[data-action="toggle-more-analytics"]'); return; }
  if (a === 'record-kind' || a === 'set-record-kind') {
    recordKindFilter = (v === '运动' || v === 'sport') ? 'sport' : (v === '学习' || v === 'study') ? 'study' : 'all';
    selectedChartNote = ''; selectedBucket = null; externalFilterNotice = '';
    updateRecordsPageInPlace();
    restoreFocusBySelector('[data-action="set-record-kind"][data-value="' + recordKindFilter + '"]');
    return;
  }
  if (a === 'set-record-person') {
    recordPersonFilter = v === 'all' ? 'all' : 'mine';
    selectedChartNote = ''; selectedBucket = null; externalFilterNotice = '';
    updateRecordsPageInPlace();
    restoreFocusBySelector('[data-action="set-record-person"][data-value="' + recordPersonFilter + '"]');
    return;
  }
  if (a === 'set-record-range') {
    recordRangeFilter = (v === '30d' || v === 'all') ? v : '7d';
    if (recordSelectedDate && recordRangeFilter !== 'all') {
      const rMin = recordRangeFilter === '30d' ? dateShift(-29) : dateShift(-6);
      if (recordSelectedDate < rMin) recordSelectedDate = '';
    }
    selectedChartNote = ''; selectedBucket = null; externalFilterNotice = '';
    updateRecordsPageInPlace();
    restoreFocusBySelector('[data-action="set-record-range"][data-value="' + recordRangeFilter + '"]');
    return;
  }
  if (a === 'set-record-trend') {
    recordTrendMode = v === 'cum' ? 'cum' : 'daily';
    updateRecordsPageInPlace();
    restoreFocusBySelector('[data-action="set-record-trend"][data-value="' + recordTrendMode + '"]');
    return;
  }
  if (a === 'select-date-bar') {
    recordSelectedDate = v;
    selectedBarDate = v;
    updateRecordsPageInPlace();
    restoreFocusBySelector('[data-action="select-date-bar"][data-value="' + v + '"]');
    return;
  }
  if (a === 'clear-date-filter') {
    recordSelectedDate = '';
    updateRecordsPageInPlace();
    restoreFocusBySelector('#records-date-jump');
    return;
  }
  if (a === 'reset-filter-default') {
    recordKindFilter = 'all'; recordPersonFilter = 'mine'; recordRangeFilter = '7d';
    recordTrendMode = 'daily'; recordSelectedDate = ''; externalFilterNotice = '';
    render(true);
    restoreFocusBySelector('[data-action="set-record-kind"][data-value="all"]');
    toast('已恢复默认筛选（我 · 近 7 天 · 每日量）');
    return;
  }
  if (a === 'open-receipt-modal') {
    const fKey = b.dataset.focusKey;
    const focusSel = fKey ? ('[data-focus-key="' + fKey + '"]') : ('.wall-card[data-value="' + v + '"]');
    recordSelectKey = v;
    render(true);
    openReceiptDialog(v, focusSel);
    return;
  }
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
    if (b.disabled) return;
    const [tid, hStr] = v.split(':'); const hrsRaw = Number(hStr);
    const tObj = state.studyTargets.find(x => x.id === tid);
    if (tObj) {
      b.disabled = true;
      const opId = nextOpId('quick');
      const sec = Math.round(hrsRaw * 3600);
      const qRec = normalizeStudyRecord({
        id: Date.now(), person: state.name, date: today(),
        time: pad(chinaNow().getHours()) + ':' + pad(chinaNow().getMinutes()),
        seconds: sec, source: 'quick', operationId: opId,
        focus: 3, targetId: tid, subject: tObj.title,
        note: '快捷专注记录 +' + hrsRaw + 'h', tags: ['深度工作'], likes: 0, liked: false,
        syncStatus: isServerOnline ? 'pending' : 'local', syncError: ''
      });
      if (isServerOnline) {
        const res = await serverFetch('/records/study', 'POST', { ...qRec, room: currentRoomCode });
        if (!res.ok) {
          qRec.syncStatus = 'failed';
          qRec.syncError = res.error || '服务器未响应';
          insertLocalRecordDedup('study', qRec);
          enqueuePendingOp({ operationId: opId, kind: 'study', recordId: qRec.id, endpoint: '/records/study', method: 'POST', payload: qRec, status: 'failed', lastError: qRec.syncError });
          persistLocalOnly();
          b.disabled = false;
          render(true);
          toast('同步失败：' + qRec.syncError + '（已暂存本机，可点击重试同步）');
          return;
        }
        if (res.record) Object.assign(qRec, normalizeStudyRecord(res.record));
        qRec.syncStatus = 'synced';
        qRec.syncError = '';
      } else {
        enqueuePendingOp({ operationId: opId, kind: 'study', recordId: qRec.id, endpoint: '/records/study', method: 'POST', payload: qRec, status: 'pending', lastError: '' });
      }
      insertLocalRecordDedup('study', qRec);
      const hbArr = state.habitLogs[today()] || [];
      if (state.habits.some(h => h.id === 'hb-3') && !hbArr.includes('hb-3')) state.habitLogs[today()] = [...hbArr, 'hb-3'];
      recomputeStudyTargetDoneHours();
      newlyArchivedRecordKey = 'study:' + qRec.id;
      recordSelectKey = newlyArchivedRecordKey;
      persistLocalOnly();
      b.disabled = false;
      triggerElectricSweep(2600);
      triggerArenaSprint(2600);
      triggerLightningSurge(2000);
      triggerFlameSurge(1800);
      render(true);
      triggerCheckinFeedback({ mode: 'study', value: String(studyMinutesOf(qRec)), unit: '分钟', title: tObj.title, person: state.name, goalHit: totalStudy(monthly(mineStudy())) >= state.studyGoal, recordKey: newlyArchivedRecordKey, syncStatus: qRec.syncStatus, operationId: qRec.operationId });
      celebrate();
    }
    return;
  }

  if (a === 'toggle-archived-targets') { showArchivedTargets = !showArchivedTargets; render(true); return; }
  if (a === 'toggle-archived-habits') { showArchivedHabits = !showArchivedHabits; render(true); return; }

  if (a === 'add-study-target') {
    openEditor('新建学习目标', '<div class="field-group"><label for="st-title">目标名称</label><input id="st-title" maxlength="24" placeholder="例如：高等数学刷题 / 英语精听" required></div><div class="field-group"><label for="st-cat">分类标签</label><input id="st-cat" maxlength="10" value="深度学习"></div><div class="field-group"><label for="st-hrs">本月目标小时数</label><input id="st-hrs" type="number" inputmode="numeric" autocomplete="off" min="1" max="300" value="30"></div>', () => {
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
    openEditor('编辑学习目标', '<div class="field-group"><label for="st-title">目标名称</label><input id="st-title" maxlength="24" value="' + esc(t.title) + '"></div><div class="field-group"><label for="st-cat">分类标签</label><input id="st-cat" maxlength="10" value="' + esc(t.category || '深度学习') + '"></div><div class="form-grid-2"><div class="field-group"><label for="st-hrs">目标小时</label><input id="st-hrs" type="number" inputmode="numeric" autocomplete="off" min="1" max="500" value="' + t.targetHours + '"></div><div class="field-group"><label for="st-dead">周期</label><input id="st-dead" maxlength="12" value="' + esc(t.deadline || '本月') + '"></div></div>', () => {
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
  if (a === 'pomo-save-local') {
    const elapsedSec = getPomoElapsedSec();
    if (elapsedSec < 60) { toast('专注不足 60 秒（当前 ' + elapsedSec + ' 秒），满 60 秒后可记入'); return; }
    const opId = pomoSession.sessionId || nextOpId('pomo');
    const tObj = state.studyTargets.find(x => x.id === pomodoroTargetId) || state.studyTargets[0];
    const pRec = normalizeStudyRecord({
      id: Date.now(), person: state.name, date: today(),
      time: pad(chinaNow().getHours()) + ':' + pad(chinaNow().getMinutes()),
      seconds: elapsedSec, source: 'pomodoro',
      sessionId: opId, operationId: opId,
      focus: 4, targetId: tObj?.id || 'st-1', subject: tObj?.title || '专注计时',
      note: '专注 ' + Math.floor(elapsedSec / 60) + ' 分 ' + (elapsedSec % 60) + ' 秒。',
      tags: ['番茄钟'], likes: 0, liked: false,
      syncStatus: isServerOnline ? 'pending' : 'local', syncError: ''
    });
    enqueuePendingOp({ operationId: opId, kind: 'study', recordId: pRec.id, endpoint: '/records/study', method: 'POST', payload: pRec, status: 'pending', lastError: '' });
    insertLocalRecordDedup('study', pRec);
    const hbArr = state.habitLogs[today()] || [];
    if (state.habits.some(h => h.id === 'hb-3') && !hbArr.includes('hb-3')) state.habitLogs[today()] = [...hbArr, 'hb-3'];
    recomputeStudyTargetDoneHours();
    newlyArchivedRecordKey = 'study:' + pRec.id;
    recordSelectKey = newlyArchivedRecordKey;
    persistLocalOnly();
    stopPomodoro('idle');
    pomoSession = { sessionId: nextOpId('pomo'), targetId: pomodoroTargetId, totalSec: pomoSession.totalSec, state: 'idle', startedAt: 0, pausedAccumMs: 0, pauseStartedAt: 0, completedAt: 0, errorMsg: '' };
    pomodoroLeft = pomoSession.totalSec;
    savePomoSession();
    triggerElectricSweep(2800);
    triggerArenaSprint(2600);
    triggerLightningSurge(2000);
    render(true);
    triggerCheckinFeedback({ mode: 'study', value: String(pRec.minutes), unit: '分钟', title: pRec.subject || '专注计时', person: state.name, goalHit: totalStudy(monthly(mineStudy())) >= state.studyGoal, recordKey: newlyArchivedRecordKey, syncStatus: pRec.syncStatus, operationId: pRec.operationId });
    celebrate();
    return;
  }
  if (a === 'pomo-finish') {
    const elapsedSec = getPomoElapsedSec();
    if (elapsedSec < 60) { toast('专注不足 60 秒（当前 ' + elapsedSec + ' 秒），满 60 秒后可记入'); return; }
    const opId = pomoSession.sessionId || nextOpId('pomo');
    if (pomoSession.state === 'saving' || inFlightOpIds.has(opId)) return;
    if (pomoSession.state === 'running' && !pomoSession.pauseStartedAt) {
      pomoSession.pauseStartedAt = Date.now();
    }
    pomoSession.sessionId = opId;
    stopPomodoro('saving');
    pomoSession.errorMsg = '';
    inFlightOpIds.add(opId);
    savePomoSession(); render(true);

    const tObj = state.studyTargets.find(x => x.id === pomodoroTargetId) || state.studyTargets[0];
    const pRec = normalizeStudyRecord({
      id: Date.now(), person: state.name, date: today(),
      time: pad(chinaNow().getHours()) + ':' + pad(chinaNow().getMinutes()),
      seconds: elapsedSec, source: 'pomodoro',
      sessionId: opId, operationId: opId,
      focus: 4, targetId: tObj?.id || 'st-1', subject: tObj?.title || '专注计时',
      note: '专注 ' + Math.floor(elapsedSec / 60) + ' 分 ' + (elapsedSec % 60) + ' 秒。',
      tags: ['番茄钟'], likes: 0, liked: false,
      syncStatus: isServerOnline ? 'pending' : 'local', syncError: ''
    });
    try {
      if (isServerOnline) {
        const res = await serverFetch('/records/study', 'POST', { ...pRec, room: currentRoomCode });
        if (!res.ok) {
          pomoSession.state = 'paused';
          pomoSession.errorMsg = '同步失败：' + (res.error || '服务器未响应') + '（已保留计时、目标与原操作编号）';
          savePomoSession(); render(true);
          return;
        }
        if (res.record) Object.assign(pRec, normalizeStudyRecord(res.record));
        pRec.syncStatus = 'synced';
        pRec.syncError = '';
      } else {
        pRec.syncStatus = 'local';
        enqueuePendingOp({ operationId: opId, kind: 'study', recordId: pRec.id, endpoint: '/records/study', method: 'POST', payload: pRec, status: 'pending', lastError: '' });
      }
      insertLocalRecordDedup('study', pRec);
      const hbArr = state.habitLogs[today()] || [];
      if (state.habits.some(h => h.id === 'hb-3') && !hbArr.includes('hb-3')) state.habitLogs[today()] = [...hbArr, 'hb-3'];
      recomputeStudyTargetDoneHours();
      newlyArchivedRecordKey = 'study:' + pRec.id;
      recordSelectKey = newlyArchivedRecordKey;
      persistLocalOnly();
      pomoSession = { sessionId: nextOpId('pomo'), targetId: pomodoroTargetId, totalSec: pomoSession.totalSec, state: 'idle', startedAt: 0, pausedAccumMs: 0, pauseStartedAt: 0, completedAt: 0, errorMsg: '' };
      pomodoroLeft = pomoSession.totalSec;
      savePomoSession();
      triggerElectricSweep(2800);
      triggerArenaSprint(2600);
      triggerLightningSurge(2000);
      triggerFlameSurge(1800);
      render(true);
      triggerCheckinFeedback({ mode: 'study', value: String(pRec.minutes), unit: '分钟', title: pRec.subject || '专注计时', person: state.name, goalHit: totalStudy(monthly(mineStudy())) >= state.studyGoal, recordKey: newlyArchivedRecordKey, syncStatus: pRec.syncStatus, operationId: pRec.operationId });
      celebrate();
    } finally {
      inFlightOpIds.delete(opId);
    }
    return;
  }

  if (a === 'toggle-habit-date') {
    const [dk, hid] = v.split(':');
    const arr = state.habitLogs[dk] || [];
    state.habitLogs[dk] = arr.includes(hid) ? arr.filter(id => id !== hid) : [...arr, hid];
    persistLocalOnly(); render(true);
    queueOrSendWriteOp({ operationId: nextOpId('hblog'), coalesceKey: 'hblog:' + state.name + ':' + dk, kind: 'habit-log', endpoint: '/habit-logs', method: 'PUT', payload: { person: state.name, date: dk, habitIds: state.habitLogs[dk] } });
    return;
  }
  if (a === 'toggle-habit') {
    const arr = state.habitLogs[today()] || [];
    state.habitLogs[today()] = arr.includes(v) ? arr.filter(id => id !== v) : [...arr, v];
    persistLocalOnly(); render(true);
    queueOrSendWriteOp({ operationId: nextOpId('hblog'), coalesceKey: 'hblog:' + state.name + ':' + today(), kind: 'habit-log', endpoint: '/habit-logs', method: 'PUT', payload: { person: state.name, date: today(), habitIds: state.habitLogs[today()] } });
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

  const navDataset = getRecordsPageDataset();
  const curList = navDataset.displayList;
  const curIdx = Math.max(0, curList.findIndex(x => x._key === recordSelectKey));
  if (a === 'record-prev' && curIdx > 0) { recordSelectKey = curList[curIdx - 1]._key; render(true); return; }
  if (a === 'record-next' && curIdx < curList.length - 1) { recordSelectKey = curList[curIdx + 1]._key; render(true); return; }
  if (a === 'record-select') {
    recordSelectKey = v;
    render(true);
    openReceiptDialog(v, '.wall-card[data-value="' + v + '"]');
    return;
  }

  if (a === 'like-unified') {
    const [kind, idStr] = v.split(':'), id = Number(idStr);
    const arr = kind === 'study' ? state.studyRecords : state.records;
    const item = arr.find(x => x.id === id);
    if (item) {
      item.liked = !item.liked;
      item.likes = Math.max(0, (item.likes || 0) + (item.liked ? 1 : -1));
      persist(); render(true);
      queueOrSendWriteOp({ operationId: nextOpId('like'), coalesceKey: 'like:' + kind + ':' + id, kind: 'like', endpoint: '/records/' + kind + '/' + id + '/like', method: 'POST', payload: { person: state.name } });
    }
    return;
  }
  if (a === 'edit-unified') { openRecordEditModal(v); return; }
  if (a === 'delete-unified') {
    const [kind, idStr] = v.split(':'), id = Number(idStr);
    openEditor('删除这条打卡记录？', '<p>确认删除选中的' + (kind === 'study' ? '学习（将同步扣减关联目标小时）' : '运动') + '记录？统计图表将同步更新。</p>', async () => {
      const delOpId = nextOpId('del');
      if (isServerOnline) {
        markSelfOpId(delOpId);
        const res = await serverFetch('/records/' + kind + '/' + id, 'DELETE', { person: state.name, operationId: delOpId });
        if (!res.ok && res.status !== 0) { toast(res.error || '删除失败'); return false; }
        if (!res.ok) enqueuePendingOp({ operationId: delOpId, kind: 'delete', endpoint: '/records/' + kind + '/' + id, method: 'DELETE', payload: { person: state.name }, status: 'failed', lastError: res.error || '网络异常' });
      } else {
        enqueuePendingOp({ operationId: delOpId, kind: 'delete', endpoint: '/records/' + kind + '/' + id, method: 'DELETE', payload: { person: state.name }, status: 'pending', lastError: '' });
      }
      if (kind === 'study') state.studyRecords = state.studyRecords.filter(x => x.id !== id);
      else state.records = state.records.filter(x => x.id !== id);
      recomputeStudyTargetDoneHours();
      recordSelectKey = ''; selectedNodeKey = ''; closeReceiptDialog(); persistLocalOnly(); render(true); toast('这条记录已删除。');
    }, '删除记录');
    return;
  }

  if (a === 'remove-person') {
    state.members = state.members.filter(m => m !== v);
    if (chartPersonFilter === v) chartPersonFilter = 'all';
    if (!state.members.length) { dualChartMode = 'personal-dual'; if (progressTab === '多人竞速曲线') progressTab = '双轨线性表'; }
    persist(); render(true); toast('已移除伙伴 ' + v);
    queueOrSendWriteOp({ operationId: nextOpId('memdel'), coalesceKey: 'mem:' + v, kind: 'member', endpoint: '/members/' + encodeURIComponent(v), method: 'DELETE', payload: {} });
    return;
  }
  if (a === 'add-person') openEditor('邀请一位自律同行伙伴', '<label for="person-name">伙伴名字</label><input id="person-name" maxlength="12" placeholder="怎么称呼 TA？" required><p class="hint">添加后即可在排行榜、进度PK、多人折线图与打卡弹窗中共同打卡。</p>', () => {
    const n = $('#person-name').value.trim();
    if (!n || allMembers().includes(n)) { toast('请输入一个不重复的伙伴名字。'); return false; }
    state.members.push(n); if (progressTab === '双轨线性表') progressTab = '多人竞速曲线'; persist(); render(true); toast('伙伴 ' + n + ' 已加入竞技名单！');
    queueOrSendWriteOp({ operationId: nextOpId('memadd'), coalesceKey: 'mem:' + n, kind: 'member', endpoint: '/members', method: 'POST', payload: { name: n } });
  });
});

/* ---------- Unified 5-Step Check-in Modal (Sport + Study + Multi-Person Co-Check-in) ---------- */
function createFreshDraft(mode = 'sport', targetId = null, personName = state.name) {
  const tid = targetId || state.studyTargets[0]?.id || 'st-1';
  const validPerson = allMembers().includes(personName) ? personName : state.name;
  return {
    mode,
    person: validPerson,
    date: today(),
    km: 5,
    ...(mode === 'study' ? { seconds: 90 * 60 } : { seconds: 30 * 60, minutes: 30, hours: 0.5 }),
    targetId: tid,
    feel: 3,
    tags: [],
    note: '',
    photo: '',
    photoStorage: '',
    photoUploading: false,
    photoRestoreWarning: false,
    operationId: nextOpId('chk'),
    saving: false,
    saveState: '',
    saveError: '',
    restoredFromDraft: false,
    time: pad(chinaNow().getHours()) + ':' + pad(chinaNow().getMinutes())
  };
}

function openCheckin(mode = 'sport', targetId = null, personName = state.name, opts = {}) {
  modalPreviousFocus = document.activeElement;
  modalPreviousFocusSelector = buildStableFocusSelector(modalPreviousFocus);
  const saved = (!opts || !opts.fresh) ? getSavedDraft(mode) : null;
  if (saved) {
    draft = {
      ...createFreshDraft(mode, targetId || saved.targetId, personName || saved.person),
      ...saved,
      feel: saved.feel ?? 3,
      mode,
      person: allMembers().includes(saved.person) ? saved.person : state.name,
      targetId: targetId || saved.targetId || state.studyTargets[0]?.id || 'st-1',
      saving: false,
      photoUploading: false,
      photoRestoreWarning: false,
      restoredFromDraft: true
    };
    step = Math.max(0, Math.min(4, Number(saved.step) || 0));
    step = step === 4 ? 4 : 0;
    if (saved.photoInIdb && !draft.photo) {
      const key = draftStorageKey(mode);
      const restoreOpId = draft.operationId;
      draftPhotoIdbGet(key).then(dataUrl => {
        if (!draft || draft.operationId !== restoreOpId) return;
        if (dataUrl) {
          draft.photo = dataUrl;
          draft.photoRestoreWarning = false;
        } else {
          draft.photoRestoreWarning = true;
        }
        drawModal();
      });
    }
  } else {
    step = 0;
    draft = createFreshDraft(mode, targetId, personName);
  }
  $('#app').inert = true; drawModal();
}

function syncDraftFromDom() {
  if (!draft || step === 4) return;
  const date = $('#checkin-date');
  if (date?.validity.valid && date.value) draft.date = date.value;
  const time = $('#start-time');
  if (time?.value) draft.time = time.value;
  const distance = $('#distance-input');
  if (distance?.validity.valid && distance.value) draft.km = Number(distance.value);
  const duration = $('#minutes-input');
  if (duration?.validity.valid && duration.value) {
    const minutes = Number(duration.value);
    if (draft.mode === 'sport') { draft.minutes = minutes; draft.seconds = minutes * 60; }
    else if (minutes !== studyMinutesOf(draft)) setDraftStudySeconds(minutes * 60);
  }
  const note = $('#run-note');
  if (note) draft.note = note.value.trim();
  const target = $('#study-target-select');
  if (target?.value) draft.targetId = target.value;
  const extras = $('#checkin-extras');
  if (extras) draft.extrasOpen = extras.open;
}

function closeCheckin(opts = {}) {
  const discard = Boolean(opts && opts.discard);
  const prevMode = draft ? draft.mode : null;
  if (draft?.saving && !discard) return;
  if (draft) {
    if (discard) {
      clearSavedDraft(draft.mode);
    } else {
      syncDraftFromDom();
      persistCheckinDraft(draft, step);
    }
  }
  draft = null;
  $('#modal-root').innerHTML = '';
  $('#app').inert = false;
  if (!discard && prevMode) render(true);
  if (modalPreviousFocus && modalPreviousFocus.isConnected && typeof modalPreviousFocus.focus === 'function') {
    try { modalPreviousFocus.focus({ preventScroll: true }); } catch { try { modalPreviousFocus.focus(); } catch {} }
  } else if (modalPreviousFocusSelector) {
    restoreFocusBySelector(modalPreviousFocusSelector);
  }
}

function readStep() {
  for (const field of $$('.ck-core input, .ck-core select')) {
    if (!field.reportValidity()) return false;
  }
  syncDraftFromDom();
  return true;
}

function updateCheckinPace() {
  const output = $('#checkin-pace');
  if (!output) return;
  const distance = $('#distance-input'), minutes = $('#minutes-input');
  output.textContent = distance.validity.valid && minutes.validity.valid
    ? pace({ km: Number(distance.value), minutes: Number(minutes.value) }) + ' /km' : '—';
}

function stepMarkup() {
  const isStudy = draft.mode === 'study';
  const draftBanner = draft.restoredFromDraft
    ? '<div class="ck-draft-banner" role="status"><span>已恢复草稿</span><button type="button" class="ck-btn ck-btn-ghost" data-modal="discard-draft">丢弃草稿</button></div>'
    : '';
  const modeBar = draftBanner + '<div class="modal-mode-switch">'
    + '<button type="button" class="' + (!isStudy ? 'active' : '') + '" data-modal="switch-mode" data-value="sport">🏃 运动打卡</button>'
    + '<button type="button" class="' + (isStudy ? 'active' : '') + '" data-modal="switch-mode" data-value="study">📚 学习打卡</button>'
    + '</div>'
    + '<div class="modal-person-row"><span>打卡人</span>'
    + allMembers().map(m => '<button type="button" class="mp-pill ' + (draft.person === m ? 'active' : '') + '" style="--mclr:' + memberColor(m) + '" data-modal="switch-person" data-value="' + esc(m) + '">' + esc(m) + (m === state.name ? ' (我)' : '') + '</button>').join('')
    + '</div>';

  if (step !== 4) {
    const minutes = isStudy ? studyMinutesOf(draft) : draft.minutes;
    const levels = isStudy ? studyFocusLevels : feelings;
    const choices = isStudy ? studyTags : tags;
    const targets = state.studyTargets.map(target => `<option value="${esc(target.id)}" ${target.id === draft.targetId ? 'selected' : ''}>${esc(target.title)}</option>`).join('');
    const quickMinutes = [25, 45, 60, 90].map(value => `<button type="button" class="pill ${value === minutes ? 'selected' : ''}" data-modal="minutes-set" data-value="${value}">${value} 分钟</button>`).join('');
    return modeBar + `<div class="ck-core ${isStudy ? 'ck-study' : 'ck-sport'}">
      <label>记录日期<input required id="checkin-date" type="date" max="${today()}" value="${esc(draft.date)}"></label>
      <label>开始时间<input id="start-time" type="time" value="${esc(draft.time)}"></label>
      ${isStudy ? `<label>学习目标<select id="study-target-select">${targets}</select></label>` : `<label>距离（公里）<input required id="distance-input" type="number" inputmode="decimal" min="0.1" max="300" step="0.01" value="${draft.km}"></label>`}
      <label>时长（分钟）<input required id="minutes-input" type="number" inputmode="numeric" min="1" max="${isStudy ? 960 : 1440}" step="1" value="${minutes}"></label>
      ${isStudy ? `<div class="pills">${quickMinutes}</div>` : `<div class="ck-pace">配速 <output id="checkin-pace">${pace(draft)} /km</output></div>`}
    </div><details id="checkin-extras" ${draft.extrasOpen ? 'open' : ''}><summary>补充记录（体感 / 标签 / 备注 / 照片）</summary>
      <p>${isStudy ? '专注度' : '运动体感'}</p><div class="feel-options">${levels.map(([icon, label], index) => `<button type="button" class="feel-option ${draft.feel === index ? 'selected' : ''}" data-modal="feel" data-value="${index}" aria-pressed="${draft.feel === index}">${icon} ${label}</button>`).join('')}</div>
      <div class="pills">${choices.map(tag => `<button type="button" class="pill ${draft.tags.includes(tag) ? 'selected' : ''}" data-modal="tag" data-value="${esc(tag)}">${esc(tag)}</button>`).join('')}</div>
      <label for="run-note">备注</label><textarea class="note-input" id="run-note" maxlength="200">${esc(draft.note)}</textarea>
      <input type="file" id="photo-file" accept="image/*" hidden><input type="file" id="camera-file" accept="image/*" capture="environment" hidden>
      ${draft.photo ? `<img class="ck-photo-preview" src="${esc(draft.photo)}" alt="打卡照片">` : ''}
      <div class="photo-buttons"><button type="button" data-modal="camera">拍照</button><button type="button" data-modal="album">选择照片</button></div>
      <p class="hint" role="status">${esc(photoStorageHint(draft))}</p></details>`;
  }
  const syncBanner = draft.saveState === 'local-failed'
    ? '<div class="ck-sync-status is-failed" role="alert"><div><strong>本机保存失败</strong>：浏览器存储不可用或空间不足，已保留全部输入与操作编号（<code>' + esc(draft.operationId) + '</code>）。释放空间后可重试保存。</div></div>'
    : draft.saveState === 'failed'
    ? '<div class="ck-sync-status is-failed ck-shake" role="alert"><div><strong>同步失败</strong>：' + esc(draft.saveError || '服务器未响应') + '（已保留全部输入与原操作编号 <code>' + esc(draft.operationId) + '</code>）</div><div class="ck-sync-actions"><button type="button" class="ck-btn ck-btn-retry" data-modal="save">重试同步</button><button type="button" class="ck-btn ck-btn-ghost" data-modal="save-local-pending">先存本机（等待同步）</button></div></div>'
    : draft.saveState === 'pending'
      ? '<div class="ck-sync-status is-pending" role="status"><strong>等待同步</strong>：正在提交到服务器，请勿重复操作…</div>'
      : '<div class="ck-sync-status ' + (isServerOnline ? 'is-synced' : 'is-local') + '" role="status">' + (isServerOnline ? '在线模式：确认保存后将直接同步至服务器' : '离线模式：确认后将先保存在本机浏览器，联网后可同步') + '</div>';

  if (isStudy) {
    const sSec = studySecondsOf(draft), sMin = studyMinutesOf(draft);
    const fObj = studyFocusLevels[draft.feel] || ['🧠', '专注'];
    return draftBanner + '<h3>确认记录</h3><div class="review-ticket is-study-ticket"><strong>' + sMin + ' <span style="font-size:25px;letter-spacing:0">分钟</span></strong><small>' + esc(draft.date) + ' / ' + esc(draft.person) + ' · ' + esc(findTargetTitle(draft.targetId)) + '</small><dl><dt>专注时长</dt><dd>' + sMin + ' MIN（' + sSec + ' 秒）</dd><dt>折合番茄</dt><dd>约 ' + Math.max(1, Math.round(sMin / 25)) + ' 个</dd><dt>专注度</dt><dd>' + fObj[0] + ' ' + fObj[1] + '</dd><dt>照片存储</dt><dd>' + photoTicketLabel(draft) + '</dd></dl></div>' + syncBanner;
  }
  const fObj = feelings[draft.feel] || ['🏃', '舒服'];
  return draftBanner + '<h3>确认记录</h3><div class="review-ticket"><strong>' + draft.km.toFixed(2) + ' <span style="font-size:25px;letter-spacing:0">km</span></strong><small>' + esc(draft.date) + ' / ' + esc(draft.person) + '</small><dl><dt>时长</dt><dd>' + draft.minutes + ' MIN</dd><dt>配速</dt><dd>' + pace(draft) + ' /KM</dd><dt>感觉</dt><dd>' + fObj[0] + ' ' + fObj[1] + '</dd><dt>照片存储</dt><dd>' + photoTicketLabel(draft) + '</dd></dl></div>' + syncBanner;
}

function drawModal() {
  const root = $('#modal-root');
  const saveBtnText = draft.saving ? '同步中…' : (draft.saveState === 'failed' ? '重试同步 ↻' : (draft.saveState === 'local-failed' ? '重试保存 ↻' : '保存打卡 ✓'));
  root.innerHTML = '<div class="modal-overlay"><section class="checkin-modal" role="dialog" aria-modal="true" aria-labelledby="checkin-heading"><div class="sheet-grabber" aria-hidden="true"><span></span></div><div class="modal-header"><h2 id="checkin-heading">' + (draft.mode === 'study' ? '学习打卡' : '运动打卡') + ' · ' + esc(draft.person) + '</h2><button type="button" class="close-modal" data-modal="close" aria-label="关闭弹窗（保留草稿）"><span aria-hidden="true">×</span></button></div><div class="steps" aria-label="第 ' + (step === 4 ? 2 : 1) + ' 步，共 2 步">' + Array.from({ length: 2 }, (_, index) => '<i class="' + (index === 0 || step === 4 ? 'done' : '') + '"></i>').join('') + '</div><div class="step-content">' + stepMarkup() + '</div><div class="step-footer"><button type="button" data-modal="back">' + (step ? '← 上一步' : '× 暂存退出') + '</button><button type="button" data-modal="' + (step === 4 ? 'save' : 'next') + '" ' + (draft.photoUploading || draft.saving ? 'disabled' : '') + '>' + (step === 4 ? saveBtnText : '确认记录 →') + '</button></div></section></div>';
  const overlay = $('.modal-overlay', root), sheet = $('.checkin-modal', root), grab = $('.sheet-grabber', root), header = $('.modal-header', root);
  if (overlay && sheet) {
    overlay.addEventListener('click', ev => { if (ev.target === overlay) closeCheckin(); });
    let startY = 0, curDy = 0, dragging = false;
    const onStart = ev => {
      if (window.innerWidth > 759) return;
      if (ev.target.closest('button, input, select, textarea, a')) return;
      const pt = ev.touches ? ev.touches[0] : ev;
      startY = pt.clientY; curDy = 0; dragging = true; sheet.style.transition = 'none';
    };
    const onMove = ev => {
      if (!dragging) return;
      const pt = ev.touches ? ev.touches[0] : ev;
      curDy = Math.max(0, pt.clientY - startY);
      if (curDy > 4) sheet.style.transform = 'translateY(' + curDy + 'px)';
    };
    const onEnd = () => {
      if (!dragging) return;
      dragging = false;
      sheet.style.transition = 'transform .24s cubic-bezier(.22,1,.36,1)';
      if (curDy > 88) { sheet.style.transform = 'translateY(100%)'; setTimeout(() => closeCheckin(), 180); }
      else { sheet.style.transform = ''; }
    };
    [grab, header].forEach(el => {
      if (!el) return;
      el.addEventListener('touchstart', onStart, { passive: true });
      el.addEventListener('touchmove', onMove, { passive: true });
      el.addEventListener('touchend', onEnd);
    });
  }
  const focusTarget = (step === 4 ? $('[data-modal="save"]') : $('#checkin-date'))
    || $('.step-content button, .step-content input, .step-content select')
    || $('.close-modal');
  if (focusTarget && typeof focusTarget.focus === 'function') focusTarget.focus({ preventScroll: true });
}

function buildCheckinRecord(syncStatus, syncError = '') {
  const record = {
    id: Date.now(), person: draft.person || state.name, date: draft.date, time: draft.time,
    source: 'manual', operationId: draft.operationId,
    note: draft.note, tags: draft.tags, photo: draft.photo, likes: 0, liked: false,
    syncStatus, syncError
  };
  if (draft.mode === 'study') {
    const target = state.studyTargets.find(t => t.id === draft.targetId);
    return normalizeStudyRecord({
      ...record, seconds: draft.seconds, focus: draft.feel, targetId: draft.targetId, subject: target?.title || '自主学习'
    });
  }
  return { ...record, km: draft.km, minutes: draft.minutes, feel: draft.feel };
}

function finalizeCheckinSave(savedMode, savedRec, who) {
  const next = { ...state, records: [...state.records], studyRecords: [...state.studyRecords],
    studyTargets: state.studyTargets.map(target => ({ ...target })), habitLogs: { ...state.habitLogs },
    memberHabitLogs: { ...state.memberHabitLogs } };
  const queued = savedRec.syncStatus !== 'synced';
  if (queued) savedRec.checkinRoom = currentRoomCode;
  insertLocalRecordDedup(savedMode, savedRec, next);
  const date = savedRec.date;
  const logs = who === next.name ? next.habitLogs : (next.memberHabitLogs[who] = { ...next.memberHabitLogs[who] });
  const done = logs[date] || [];
  if (next.habits.some(habit => habit.id === 'hb-3') && !done.includes('hb-3')) logs[date] = [...done, 'hb-3'];
  recomputeStudyTargetDoneHours(next);
  const localSaved = persistLocalOnly(next);
  if (queued && !localSaved) {
    draft.saving = false;
    draft.saveState = 'local-failed';
    persistCheckinDraft(draft, step);
    drawModal();
    return;
  }
  state = next;
  if (queued && !demo) queueSavedCheckin(savedMode, savedRec);
  recordSelectKey = savedMode + ':' + savedRec.id;
  newlyArchivedRecordKey = recordSelectKey;
  const sportGoalHit = savedMode === 'sport' && total(mine(monthly())) >= state.goal;
  const studyGoalHit = savedMode === 'study' && totalStudy(monthly(mineStudy())) >= state.studyGoal;
  const returnFocusSelector = modalPreviousFocusSelector;
  closeCheckin({ discard: true });
  triggerArenaSprint(2600);
  if (savedMode === 'study') {
    triggerElectricSweep(2600);
    triggerLightningSurge(2000);
  } else {
    triggerFlameSurge(sportGoalHit ? 2400 : 1900, sportGoalHit);
    triggerLightningSurge(1200);
  }
  navigate(view);
  triggerCheckinFeedback({
    mode: savedMode,
    value: savedMode === 'study' ? String(studyMinutesOf(savedRec)) : savedRec.km.toFixed(2),
    unit: savedMode === 'study' ? '分钟' : 'km',
    title: savedMode === 'study' ? (savedRec.subject || '学习打卡') : ('配速 ' + pace(savedRec) + ' /km'),
    person: who, date, localSaved,
    goalHit: sportGoalHit || studyGoalHit,
    recordKey: newlyArchivedRecordKey,
    syncStatus: savedRec.syncStatus,
    syncError: savedRec.syncError || '',
    operationId: savedRec.operationId || '',
    returnFocusSelector
  });
  celebrate();
}

$('#modal-root').addEventListener('input', e => {
  if (!draft) return;
  const t = e.target;
  if (t.id === 'distance-input' || t.id === 'minutes-input') updateCheckinPace();
  if (t.id === 'checkin-date') {
    if (t.validity.valid && t.value) {
      draft.date = t.value;
      persistCheckinDraft(draft, step);
    }
  } else if (t.id === 'hours-input' && draft.mode === 'study') {
    const h = Number(t.value);
    if (Number.isFinite(h) && h >= 1 / 60 && h <= 16) {
      setDraftStudySeconds(h * 3600);
      updateStudyDurationPreview('hours');
      persistCheckinDraft(draft, step);
    }
  } else if (t.id === 'distance-input' && draft.mode === 'sport') {
    const n = Number(t.value);
    if (Number.isFinite(n) && n >= 0.1 && n <= 300) {
      draft.km = Math.round(n * 100) / 100;
      $$('[data-modal="distance-set"]').forEach(el => el.classList.toggle('selected', Number(el.dataset.value) === draft.km));
      persistCheckinDraft(draft, step);
    }
  } else if (t.id === 'minutes-input') {
    const n = Number(t.value);
    if (draft.mode === 'study' && Number.isFinite(n) && n >= 1 && n <= 960) {
      setDraftStudySeconds(Math.round(n) * 60);
      updateStudyDurationPreview('minutes');
      persistCheckinDraft(draft, step);
    } else if (draft.mode === 'sport' && Number.isFinite(n) && n >= 1 && n <= 1440) {
      draft.minutes = Math.round(n);
      draft.seconds = draft.minutes * 60;
      persistCheckinDraft(draft, step);
    }
  } else if (t.id === 'start-time') {
    if (t.value) { draft.time = t.value; persistCheckinDraft(draft, step); }
  } else if (t.id === 'run-note') {
    draft.note = t.value;
    persistCheckinDraft(draft, step);
  }
});

$('#modal-root').addEventListener('click', async e => {
  const b = e.target.closest('[data-modal]'); if (!b) return;
  const a = b.dataset.modal, v = b.dataset.value;
  if (!draft || draft.saving) return;
  if (a === 'close') { closeCheckin(); return; }
  if (a === 'discard-draft') {
    const curMode = draft ? draft.mode : 'sport';
    clearSavedDraft(curMode);
    step = 0;
    draft = createFreshDraft(curMode);
    drawModal();
    toast('已丢弃草稿，重新开始填写');
    return;
  }
  if (a === 'switch-mode') {
    if (!draft || draft.mode === v) return;
    syncDraftFromDom();
    persistCheckinDraft(draft, step);
    const savedOther = getSavedDraft(v);
    if (savedOther) {
      draft = { ...createFreshDraft(v, savedOther.targetId, savedOther.person), ...savedOther, feel: savedOther.feel ?? 3, mode: v, saving: false, restoredFromDraft: true };
      step = Math.max(0, Math.min(4, Number(savedOther.step) || 0));
      step = step === 4 ? 4 : 0;
      if (savedOther.photoInIdb && !draft.photo) {
        const k = draftStorageKey(v);
        const rop = draft.operationId;
        draftPhotoIdbGet(k).then(du => {
          if (!draft || draft.operationId !== rop) return;
          if (du) { draft.photo = du; draft.photoRestoreWarning = false; }
          else { draft.photoRestoreWarning = true; }
          drawModal();
        });
      }
    } else {
      draft = createFreshDraft(v, draft.targetId, draft.person);
      step = 0;
    }
    drawModal();
    return;
  }
  if (a === 'switch-person') {
    syncDraftFromDom();
    draft.person = v;
    persistCheckinDraft(draft, step);
    drawModal();
    return;
  }
  if (a === 'back') {
    if (!step) { closeCheckin(); return; }
    syncDraftFromDom();
    step = 0;
    persistCheckinDraft(draft, step);
    drawModal();
    return;
  }
  if (a === 'next') {
    if (!readStep()) return;
    draft.saveState = '';
    draft.saveError = '';
    step = 4;
    persistCheckinDraft(draft, step);
    drawModal();
    return;
  }
  if (a === 'album') { $('#photo-file').click(); return; }
  if (a === 'camera') { $('#camera-file').click(); return; }
  if (a === 'distance-add' || a === 'distance-set') {
    draft.km = a === 'distance-set' ? Number(v) : Math.max(0.1, Math.min(300, Math.round(((Number($('#distance-input').value) || 0) + Number(v)) * 100) / 100));
    $('#distance-input').value = draft.km.toFixed(2);
    $$('[data-modal="distance-set"]').forEach(el => el.classList.toggle('selected', Number(el.dataset.value) === draft.km));
    persistCheckinDraft(draft, step);
    return;
  }
  if (a === 'hours-add' || a === 'hours-set') {
    const seconds = Number(v) * 3600;
    setDraftStudySeconds(a === 'hours-set' ? seconds : draft.seconds + seconds);
    $('#hours-input').value = draftStudyHoursInputValue();
    updateStudyDurationPreview('hours');
    persistCheckinDraft(draft, step);
    return;
  }
  if (a === 'minutes-add' || a === 'minutes-set') {
    const maxM = draft.mode === 'study' ? 960 : 1440;
    const nextM = a === 'minutes-set' ? Number(v) : Math.max(1, Math.min(maxM, (Number($('#minutes-input').value) || 0) + Number(v)));
    $('#minutes-input').value = nextM;
    if (draft.mode === 'study') {
      setDraftStudySeconds(Math.round(nextM) * 60);
      updateStudyDurationPreview('minutes');
    } else {
      draft.minutes = Math.round(nextM);
      draft.seconds = draft.minutes * 60;
    }
    persistCheckinDraft(draft, step);
    return;
  }
  if (a === 'feel') {
    draft.feel = Number(v);
    draft.extrasOpen = true;
    $$('.feel-option').forEach(el => { const active = Number(el.dataset.value) === draft.feel; el.classList.toggle('selected', active); el.setAttribute('aria-pressed', active); });
    const nextBtn = $('[data-modal="next"]');
    if (nextBtn) nextBtn.disabled = false;
    persistCheckinDraft(draft, step);
    return;
  }
  if (a === 'tag') {
    draft.tags = draft.tags.includes(v) ? draft.tags.filter(t => t !== v) : [...draft.tags, v];
    b.classList.toggle('selected', draft.tags.includes(v));
    persistCheckinDraft(draft, step);
    return;
  }
  if (a === 'save-local-pending') {
    if (!draft || draft.saving) return;
    const savedMode = draft.mode;
    const savedRec = buildCheckinRecord('pending', draft.saveError);
    finalizeCheckinSave(savedMode, savedRec, savedRec.person);
    return;
  }
  if (a === 'save') {
    if (!draft || draft.saving || inFlightOpIds.has(draft.operationId)) return;
    if (draft.photoUploading) { toast('照片仍在上传中，请稍候完成后再保存。'); return; }
    draft.saving = true;
    draft.saveState = isServerOnline ? 'pending' : 'local';
    draft.saveError = '';
    const opId = draft.operationId;
    inFlightOpIds.add(opId);
    drawModal();
    const savedMode = draft.mode;
    const endpoint = savedMode === 'study' ? '/records/study' : '/records/sport';
    const savedRec = buildCheckinRecord(draft.saveState);
    const who = savedRec.person;
    try {
      if (isServerOnline) {
        const res = await serverFetch(endpoint, 'POST', { ...savedRec, room: currentRoomCode });
        if (!draft || draft.operationId !== opId) return;
        if (!res.ok) {
          draft.saving = false;
          draft.saveState = 'failed';
          draft.saveError = res.error || '服务器未响应';
          persistCheckinDraft(draft, step);
          drawModal();
          return;
        }
        if (res.record) Object.assign(savedRec, savedMode === 'study' ? normalizeStudyRecord(res.record) : res.record);
        savedRec.syncStatus = 'synced';
        savedRec.syncError = '';
      } else {
        savedRec.syncStatus = 'local';
        savedRec.syncError = '';
      }
      finalizeCheckinSave(savedMode, savedRec, who);
    } finally {
      inFlightOpIds.delete(opId);
    }
  }
});

$('#modal-root').addEventListener('toggle', e => {
  if (draft && e.target.id === 'checkin-extras') {
    draft.extrasOpen = e.target.open;
    persistCheckinDraft(draft, step);
  }
}, true);

$('#modal-root').addEventListener('change', async e => {
  if (!draft) return;
  if (e.target.id === 'study-target-select') {
    draft.targetId = e.target.value;
    persistCheckinDraft(draft, step);
    return;
  }
  if (!['photo-file', 'camera-file'].includes(e.target.id)) return;
  const file = e.target.files[0]; if (!file) return;
  if (!file.type.startsWith('image/')) { toast('请选择图片文件。'); return; }
  const uploadOpId = draft.operationId;
  syncDraftFromDom();
  draft.photoUploading = true;
  draft.photoRestoreWarning = false;
  drawModal();
  if (isServerOnline) {
    try {
      const fd = new FormData();
      fd.append('file', file);
      const upRes = await serverFetch('/uploads', 'POST', fd);
      if (!draft || draft.operationId !== uploadOpId) return;
      if (upRes && upRes.url) {
        draft.photo = upRes.url;
        draft.photoStorage = 'server';
        draft.photoUploading = false;
        persistCheckinDraft(draft, step);
        drawModal();
        return;
      }
    } catch {}
  }
  try {
    const bitmap = await createImageBitmap(file), scale = Math.min(1, 900 / Math.max(bitmap.width, bitmap.height)), c = document.createElement('canvas');
    c.width = Math.round(bitmap.width * scale); c.height = Math.round(bitmap.height * scale);
    c.getContext('2d').drawImage(bitmap, 0, 0, c.width, c.height);
    const dataUrl = c.toDataURL('image/jpeg', .75); bitmap.close();
    if (!draft || draft.operationId !== uploadOpId) return;
    draft.photo = dataUrl;
    draft.photoStorage = isServerOnline ? 'local-fallback' : 'local';
    draft.photoUploading = false;
    persistCheckinDraft(draft, step);
    drawModal();
  } catch {
    if (draft && draft.operationId === uploadOpId) {
      draft.photoUploading = false;
      drawModal();
    }
    toast('这张照片暂时无法读取，请试试 JPG 或 PNG。');
  }
});

document.addEventListener('keydown', e => {
  if (e.target instanceof Element && e.target.matches('[data-action="select-date-bar"]') && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
    const bars = [...document.querySelectorAll('[data-action="select-date-bar"]')];
    const idx = bars.indexOf(e.target);
    if (idx >= 0) {
      e.preventDefault();
      const next = bars[e.key === 'ArrowRight' ? Math.min(bars.length - 1, idx + 1) : Math.max(0, idx - 1)];
      if (next && next !== e.target) next.focus();
    }
    return;
  }
  if (e.target instanceof Element && e.target.matches('[data-point],[data-chart-node],[data-chart-row],[data-action]') && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); e.target.dispatchEvent(new MouseEvent('click', { bubbles: true })); }
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
  const btns = [...document.querySelectorAll('.checkin-cta strong, .dual-cta-half strong, .track-add-btn, .track-mode-switch, .add-person, .add-target-btn, .ndc-btn.primary, .pomo-btn, .motion-toggle')];
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
let stormSurgeUntil = 0;
let frostSurgeUntil = 0;

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

function triggerFlameSurge(durationMs = 1150, mega = false) {
  if (document.body.classList.contains('motion-paused') || (typeof reducedMotion !== 'undefined' && reducedMotion.matches)) return;
  const now = performance.now();
  const clamped = Math.min(2600, Math.max(600, durationMs));
  flameSurgeUntil = Math.max(flameSurgeUntil, now + clamped);
  if (mega) flameMegaSurgeUntil = Math.max(flameMegaSurgeUntil, now + clamped);
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


const STORM_STATIC_PHASE = 2.95;
const STORM_PALETTE = [
  '#070912', // 0: Hollow Eye Abyss & Deep Crevice
  '#0d1222', // 1: Deep Indigo Sky Base
  '#151c33', // 2: Pressure Strata & Cloud Rim
  '#1f2947', // 3: Far Anvil Deck
  '#2c3759', // 4: Outer Trailing Ash-Violet Cloud
  '#3d4970', // 5: Mid Churning Storm Cloud
  '#52608c', // 6: Heavy Storm Slate Body
  '#6d7dab', // 7: Spiral Arm Cloud Wall
  '#90a1cc', // 8: Bright Silver Eyewall
  '#b8c7e8', // 9: Windward Silver Highlight
  '#dce7fa', // 10: Bright Cold Crest
  '#f6faff'  // 11: Cold White Arc & Crest
];


function createStormParticle(modeOverride = null) {
  const roll = Math.random();
  const mode = modeOverride || (roll < 0.40 ? 'inward' : roll < 0.76 ? 'orbit' : 'fling');
  const rNorm = mode === 'inward'
    ? (0.42 + Math.random() * 0.62)
    : mode === 'orbit'
      ? (0.14 + Math.random() * 0.24)
      : (0.24 + Math.random() * 0.36);
  const shapeRoll = Math.random();
  return {
    mode,
    rNorm,
    theta: Math.random() * Math.PI * 2,
    omegaBase: (1.25 + Math.random() * 1.55),
    vrBase: mode === 'inward' ? -(0.16 + Math.random() * 0.16) : mode === 'fling' ? (0.32 + Math.random() * 0.32) : (Math.random() - 0.5) * 0.03,
    shape: shapeRoll < 0.34 ? 'streak3' : shapeRoll < 0.68 ? 'streak2' : 'dot',
    life: Math.random() * 0.4,
    maxLife: 0.9 + Math.random() * 1.1,
    seed: Math.random() * 10
  };
}

function createStormRainDrop(initial = false) {
  return {
    xNorm: Math.random() * 1.15 - 0.08,
    yNorm: initial ? Math.random() : (-0.10 - Math.random() * 0.25),
    speed: 0.90 + Math.random() * 0.80,
    len: 2 + Math.floor(Math.random() * 3),
    depth: Math.random() < 0.42 ? 0 : 1
  };
}


function generateStormBandArc(eyeCx, eyeCy, eyeR, maxR, w, h, startOffsetMs = 0, forcedTheta = null) {
  const baseTheta = forcedTheta !== null ? forcedTheta : (-0.6 + Math.random() * Math.PI * 2.1);
  const r1 = Math.max(eyeR * 1.12, eyeR * (1.15 + Math.random() * 1.45));
  const spanTheta = (0.38 + Math.random() * 0.56) * (Math.random() < 0.5 ? 1 : -1);
  const r2 = Math.min(0.88, r1 + (0.06 + Math.random() * 0.18) * (Math.random() < 0.72 ? 1 : -0.45));
  const segCount = 6 + Math.floor(Math.random() * 4);
  const pts = [];
  for (let i = 0; i <= segCount; i++) {
    const u = i / segCount;
    const th = baseTheta + spanTheta * u + (i > 0 && i < segCount ? (Math.random() - 0.5) * 0.22 : 0);
    const rr = (r1 + (r2 - r1) * u) * maxR + (i > 0 && i < segCount ? (Math.random() - 0.5) * 14 : 0);
    pts.push({
      x: Math.max(6, Math.min(w - 6, eyeCx + Math.cos(th) * rr)),
      y: Math.max(6, Math.min(h - 6, eyeCy + Math.sin(th) * rr * 0.86))
    });
  }
  const segs = [];
  for (let i = 0; i < pts.length - 1; i++) segs.push({ ax: pts[i].x, ay: pts[i].y, bx: pts[i + 1].x, by: pts[i + 1].y, core: 1.0 });
  if (Math.random() < 0.9 && pts.length >= 4) {
    const origin = pts[1 + Math.floor(Math.random() * (pts.length - 3))];
    let fx = origin.x, fy = origin.y;
    const fAng = baseTheta + spanTheta * 0.45 + (Math.random() - 0.5) * 1.3;
    for (let k = 0; k < 3; k++) {
      const nx = Math.max(6, Math.min(w - 6, fx + Math.cos(fAng + (Math.random() - 0.5) * 0.95) * 13));
      const ny = Math.max(6, Math.min(h - 6, fy + Math.sin(fAng + (Math.random() - 0.5) * 0.95) * 11));
      segs.push({ ax: fx, ay: fy, bx: nx, by: ny, core: 0.74 });
      fx = nx; fy = ny;
    }
  }
  return {
    segs,
    startMs: performance.now() - startOffsetMs,
    durMs: 280 + Math.random() * 140
  };
}


const FROST_STATIC_PHASE = 1.65;
const FROST_PALETTE = [
  '#030816', // 0: Polar Abyss & 1px Crystal Edge Contour
  '#07142e', // 1: Deep Arctic Night Sky
  '#0d254f', // 2: Polar Ridge & Cold Shadow
  '#143b78', // 3: Deep Glacier Facet
  '#1d56a3', // 4: Mid Sapphire Ice
  '#2977cc', // 5: Vivid Glacial Blue
  '#3e9ee6', // 6: Sunlit Cyan Ice
  '#62c4f5', // 7: Luminous Frost Cyan
  '#8fe2ff', // 8: Bright Ice Bevel & Dendrite Edge
  '#c4f3ff', // 9: Frosted Mint-White Highlight
  '#e8fbff', // 10: Brilliant Snow Crest
  '#ffffff'  // 11: Pure Specular Crystal & Blizzard Core
];

const FROST_BG_PINES = [
  { x: 0.47, h: 16, crown: 7 },
  { x: 0.54, h: 22, crown: 9 },
  { x: 0.62, h: 18, crown: 7 },
  { x: 0.70, h: 25, crown: 10 },
  { x: 0.79, h: 20, crown: 8 },
  { x: 0.87, h: 27, crown: 10 },
  { x: 0.94, h: 21, crown: 8 }
];

function makeFrostRng(seed) {
  let s = (seed >>> 0) || 1337;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function buildFrostScene(seed) {
  const rng = makeFrostRng(seed);
  const plates = [];
  for (let i = 0; i < 16; i++) {
    const onRightOrRim = i < 12;
    const cx = onRightOrRim ? (rng() < 0.72 ? 0.44 + rng() * 0.58 : rng() * 0.44) : 0.08 + rng() * 0.36;
    const cy = onRightOrRim ? (rng() < 0.52 ? 0.04 + rng() * 0.56 : 0.56 + rng() * 0.46) : 0.14 + rng() * 0.70;
    const thick = (cx > 0.44 || cy < 0.16 || cy > 0.82) ? (0.58 + rng() * 0.42) : (0.20 + rng() * 0.24);
    plates.push({ cx, cy, rx: 0.13 + rng() * 0.16, ry: 0.14 + rng() * 0.18, rot: rng() * Math.PI, thick, bias: rng() * 0.32, facetAng: rng() * Math.PI });
  }
  const dendrites = [];
  const edgeSeeds = [
    { x: 0.99, y: 0.88, ang: -2.42 }, { x: 0.99, y: 0.54, ang: -2.84 }, { x: 0.99, y: 0.16, ang: 2.52 },
    { x: 0.82, y: 0.01, ang: 1.98 }, { x: 0.56, y: 0.01, ang: 1.64 }, { x: 0.24, y: 0.01, ang: 1.24 },
    { x: 0.01, y: 0.12, ang: 0.42 }, { x: 0.01, y: 0.88, ang: -0.44 }, { x: 0.32, y: 0.99, ang: -1.38 },
    { x: 0.62, y: 0.99, ang: -1.78 }, { x: 0.86, y: 0.99, ang: -2.08 }, { x: 0.99, y: 0.34, ang: 2.86 }
  ];
  for (let i = 0; i < edgeSeeds.length; i++) {
    const es = edgeSeeds[i];
    const baseLen = (es.x > 0.48 || es.y > 0.84 || es.y < 0.12) ? (0.24 + rng() * 0.20) : (0.14 + rng() * 0.10);
    const ang = es.ang + (rng() - 0.5) * 0.24;
    const twigs = [];
    const subCount = 4 + Math.floor(rng() * 3);
    for (let j = 0; j < subCount; j++) {
      const tPos = 0.18 + (j / subCount) * 0.68;
      const side = (j % 2 === 0 ? 1 : -1);
      twigs.push({ tPos, dAng: side * (0.50 + rng() * 0.30), lenRatio: 0.38 + rng() * 0.30, microSide: -side * (0.44 + rng() * 0.22) });
    }
    dendrites.push({ x: es.x, y: es.y, ang, len: baseLen, delay: 0.08 + rng() * 0.20, speed: 0.88 + rng() * 0.44, twigs });
  }
  const clusters = [
    { x: 0.74, y: 0.36, cxCompact: 0.84, cyCompact: 0.44, radius: 0.22 + rng() * 0.04, arms: 6, rot: rng() * 0.52, hero: true },
    { x: 0.56, y: 0.23, cxCompact: 0.67, cyCompact: 0.28, radius: 0.13 + rng() * 0.03, arms: 6, rot: rng() * 0.52, hero: false },
    { x: 0.89, y: 0.66, cxCompact: 0.93, cyCompact: 0.72, radius: 0.12 + rng() * 0.03, arms: 6, rot: rng() * 0.52, hero: false },
    { x: 0.62, y: 0.76, cxCompact: 0.74, cyCompact: 0.78, radius: 0.10 + rng() * 0.03, arms: 6, rot: rng() * 0.52, hero: false }
  ];
  const icicles = [
    { bx: 0.78, by: 1.01, ang: -1.62 + (rng() - 0.5) * 0.10, len: 0.72, w: 23, delay: 0.22 },
    { bx: 0.88, by: 1.01, ang: -1.90 + (rng() - 0.5) * 0.12, len: 0.58, w: 18, delay: 0.28 },
    { bx: 0.69, by: 1.01, ang: -1.36 + (rng() - 0.5) * 0.12, len: 0.46, w: 15, delay: 0.34 },
    { bx: 0.58, by: 1.01, ang: -1.50 + (rng() - 0.5) * 0.14, len: 0.32, w: 12, delay: 0.38 },
    { bx: 0.95, by: 1.01, ang: -2.14 + (rng() - 0.5) * 0.12, len: 0.44, w: 15, delay: 0.30 },
    { bx: 1.01, by: 0.68, ang: -2.62 + (rng() - 0.5) * 0.12, len: 0.34, w: 13, delay: 0.26 },
    { bx: 1.01, by: 0.26, ang: 2.66 + (rng() - 0.5) * 0.14, len: 0.28, w: 11, delay: 0.32 },
    { bx: 0.93, by: -0.01, ang: 1.72 + (rng() - 0.5) * 0.10, len: 0.34, w: 13, delay: 0.26 },
    { bx: 0.85, by: -0.01, ang: 1.54 + (rng() - 0.5) * 0.10, len: 0.23, w: 10, delay: 0.34 },
    { bx: 0.75, by: -0.01, ang: 1.66 + (rng() - 0.5) * 0.12, len: 0.28, w: 11, delay: 0.38 },
    { bx: 0.64, by: -0.01, ang: 1.46 + (rng() - 0.5) * 0.10, len: 0.17, w: 8, delay: 0.44 },
    { bx: 0.34, by: -0.01, ang: 1.48 + (rng() - 0.5) * 0.10, len: 0.13, w: 7, delay: 0.46 },
    { bx: 0.05, by: 1.01, ang: -1.16 + (rng() - 0.5) * 0.12, len: 0.22, w: 10, delay: 0.32 }
  ];
  const sparkles = [];
  for (let i = 0; i < 18; i++) {
    sparkles.push({
      nx: 0.36 + rng() * 0.60,
      ny: 0.10 + rng() * 0.82,
      seed: rng() * Math.PI * 2,
      speed: 2.6 + rng() * 3.0
    });
  }
  const frontWaves = {
    rightSpeed: 0.98 + rng() * 0.22,
    bottomSpeed: 0.92 + rng() * 0.22,
    topSpeed: 0.84 + rng() * 0.22,
    leftSpeed: 0.64 + rng() * 0.20,
    phaseA: rng() * 6.28,
    phaseB: rng() * 6.28
  };
  return { seed, plates, dendrites, clusters, icicles, sparkles, frontWaves };
}

function createFrostSnowParticle(layer, initial = false) {
  const speedBase = layer === 0 ? 0.40 : layer === 1 ? 1.38 : 2.25;
  return {
    layer,
    xNorm: Math.random() * 1.36 - 0.18,
    yNorm: initial ? Math.random() : (-0.06 - Math.random() * 0.22),
    vxScale: 0.92 + Math.random() * 0.64,
    vyScale: speedBase * (0.86 + Math.random() * 0.52),
    len: layer === 1 ? (2 + Math.floor(Math.random() * 4)) : 1,
    cross: layer === 2 && Math.random() < 0.42,
    seed: Math.random() * Math.PI * 2
  };
}

function createFrostShard(idx, total, ax, ay, kind) {
  const ang = (idx / total) * Math.PI * 2 + (Math.random() - 0.5) * 0.32;
  const isChunk = kind === 'chunk';
  const spd = isChunk ? (0.46 + Math.random() * 0.76) : (0.72 + Math.random() * 0.98);
  return {
    kind,
    xNorm: ax + (Math.random() - 0.5) * 0.04,
    yNorm: ay + (Math.random() - 0.5) * 0.04,
    vx: Math.cos(ang) * spd,
    vy: Math.sin(ang) * spd * 0.75 - (isChunk ? 0.20 : 0.30),
    life: 0,
    maxLife: isChunk ? (0.76 + Math.random() * 0.40) : (0.56 + Math.random() * 0.38)
  };
}

function evalFrostChoreography(gp) {
  let cover = 0, wind = 1.50, sweep = 0, crystal = 0.26, bloom = 0, hesitate = 0;
  if (gp < 0.15) {
    const u = gp / 0.15, easeOut = 1 - Math.pow(1 - u, 2);
    sweep = Math.sin(u * Math.PI); wind = 1.5 + 2.4 * easeOut; cover = 0.12 * easeOut; crystal = 0.24 + 0.16 * easeOut;
  } else if (gp < 0.46) {
    const u = (gp - 0.15) / 0.31, accel = u * u * (1.5 - 0.5 * u);
    wind = 3.7 - 0.70 * u; cover = 0.12 + 0.48 * accel; crystal = 0.40 + 0.34 * accel; sweep = 0.28 * (1 - u);
  } else if (gp < 0.65) {
    if (gp < 0.56) {
      const u = (gp - 0.46) / 0.10;
      cover = 0.60 + 0.016 * Math.sin(u * Math.PI * 3); wind = 2.95 - 0.45 * u; crystal = 0.74 + 0.05 * u; hesitate = Math.sin(u * Math.PI);
    } else {
      const u = (gp - 0.56) / 0.09, snap = 1 - Math.pow(1 - u, 3);
      cover = 0.60 + 0.32 * snap; wind = 2.5 + 1.25 * Math.sin(u * Math.PI); crystal = 0.79 + 0.18 * snap;
    }
  } else if (gp < 0.84) {
    const u = (gp - 0.65) / 0.19, pulse = Math.sin(u * Math.PI);
    cover = 0.92 + 0.06 * u; wind = 2.75 - 0.65 * u; crystal = 0.97 + 0.16 * pulse; bloom = pulse;
  } else {
    const u = (gp - 0.84) / 0.16, settle = 1 - Math.pow(1 - u, 2);
    cover = 0.98 - 0.05 * settle; wind = 2.20 - 0.55 * settle; crystal = 1.0 - 0.03 * settle; bloom = 0.14 * (1 - settle);
  }
  return { cover, wind, sweep, crystal, bloom, hesitate };
}

function ensureFrostState(canvas) {
  if (!canvas._frostState) {
    const now = performance.now();
    canvas._frostState = {
      mode: 'freeze', freezeStartMs: now, freezeDurMs: 3100,
      scene: buildFrostScene((Date.now() ^ Math.floor(Math.random() * 1e6)) & 0xffffff),
      burstDone: false, shards: [], shockwave: 0,
      snow: [
        ...Array.from({ length: 108 }, () => createFrostSnowParticle(0, true)),
        ...Array.from({ length: 196 }, () => createFrostSnowParticle(1, true)),
        ...Array.from({ length: 54 }, () => createFrostSnowParticle(2, true))
      ],
      windSpeed: 1.6, freezeCover: 0.0, coldSweep: 0.0, crystalGrowth: 0.26,
      burstBloom: 0.0, hesitatePulse: 0.0, glintOffset: -160, nextGlintMs: now + 650, lastTickMs: now
    };
  }
  return canvas._frostState;
}

function triggerFrostSurge(durationMs = 3100) {
  if (document.body.classList.contains('motion-paused') || (typeof reducedMotion !== 'undefined' && reducedMotion.matches)) return;
  const now = performance.now();
  const clamped = Math.min(4200, Math.max(2400, durationMs));
  frostSurgeUntil = Math.max(frostSurgeUntil, now + clamped);
  document.querySelectorAll('.pixel-matrix-canvas[data-pixel-theme="frost"]').forEach(c => {
    const fst = ensureFrostState(c);
    fst.scene = buildFrostScene((Date.now() ^ Math.floor(Math.random() * 1e6)) & 0xffffff);
    fst.mode = 'freeze'; fst.freezeStartMs = now; fst.freezeDurMs = clamped; fst.burstDone = false; fst.shards = []; fst.shockwave = 0;
    drawPixelMatrix(c, pixelPhase);
  });
}

function frostDistToSegSq(px, py, ax, ay, bx, by) {
  const vx = bx - ax, vy = by - ay, lenSq = vx * vx + vy * vy;
  if (lenSq < 0.0001) return (px - ax) * (px - ax) + (py - ay) * (py - ay);
  const t = Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / lenSq));
  const qx = ax + t * vx, qy = ay + t * vy;
  return (px - qx) * (px - qx) + (py - qy) * (py - qy);
}

function sampleFrostSpike(px, py, ax, ay, angle, maxLen, halfW) {
  const cos = Math.cos(angle), sin = Math.sin(angle), dx = px - ax, dy = py - ay;
  const along = dx * cos + dy * sin;
  if (along < -2 || along > maxLen) return null;
  const across = -dx * sin + dy * cos, u = Math.max(0, along / Math.max(1, maxLen));
  const profile = u < 0.16 ? (0.82 + (u / 0.16) * 0.18) : Math.max(0, 1 - Math.pow((u - 0.16) / 0.84, 1.08));
  const curW = Math.max(1.2, halfW * profile), absA = Math.abs(across);
  if (absA > curW) return null;
  const edgeRatio = absA / curW;
  let facet = 0.52;
  if (absA <= 1.75 || u > 0.88) facet = 0.90 + u * 0.10;
  else if (across < 0) facet = 0.62 + edgeRatio * 0.28 + u * 0.10;
  else facet = 0.20 + (1 - edgeRatio) * 0.28 + u * 0.08;
  return { facet: Math.min(1, facet), isRim: (across < 0 && edgeRatio > 0.74) || u > 0.90 };
}

function ensureStormState(canvas) {
  if (!canvas._stormState) {
    const now = performance.now();
    canvas._stormState = {
      particles: Array.from({ length: 76 }, () => createStormParticle()),
      rain: Array.from({ length: 78 }, () => createStormRainDrop(true)),
      arcs: [],
      nextArcMs: now + 280,
      climaxStartMs: now - 300,
      climaxDurMs: 3600,
      nextClimaxMs: now + 5400,
      lastTickMs: now,
      flingBurstDone: false,
      climaxArcDone: false
    };
  }
  return canvas._stormState;
}

function triggerStormSurge(durationMs = 3600) {
  if (document.body.classList.contains('motion-paused') || (typeof reducedMotion !== 'undefined' && reducedMotion.matches)) return;
  const now = performance.now();
  const clamped = Math.min(4200, Math.max(2400, durationMs));
  stormSurgeUntil = Math.max(stormSurgeUntil, now + clamped);
  const canvases = document.querySelectorAll('.pixel-matrix-canvas[data-pixel-theme="storm"]');
  canvases.forEach(c => {
    const st = ensureStormState(c);
    st.climaxStartMs = now;
    st.climaxDurMs = clamped;
    st.nextClimaxMs = now + clamped + 2800;
    st.flingBurstDone = false;
    st.climaxArcDone = false;
    const w = c.clientWidth || 360;
    const h = c.clientHeight || 220;
    st.arcs.push(generateStormBandArc(w * 0.65, h * 0.48, 0.14, Math.hypot(w * 0.60, h * 0.54), w, h, 42));
    drawPixelMatrix(c, pixelPhase);
  });
}

// ==========================================
// 100% 像素矩阵闪电放电 + 贴合分形分支电弧 (1~3 Bolts, 2~4 Forks Each)
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
    const dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth <= 540 ? 1.5 : 2);
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
    const focusCharge = Math.max(0, Math.min(1, parseFloat(canvas.closest('[data-focus-charge]')?.dataset.focusCharge || '0.25')));

    if (!isMotionPaused) {
      if (!st.active && nowMs >= st.nextStrike) {
        st.active = generateRandomLightningBolt(w, h);
        const restBase = 1150 - focusCharge * 620;
        st.nextStrike = nowMs + st.active.duration + restBase + Math.random() * 680;
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
    const skyFlashBoost = strikeIntensity * 0.18 + focusCharge * 0.12;
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
    const dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth <= 540 ? 1.5 : 2);
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

    const goalRatio = Math.max(0.15, Math.min(1.35, parseFloat(canvas.closest('[data-goal-ratio]')?.dataset.goalRatio || '0.65')));
    const goalScale = 0.72 + Math.min(1.15, goalRatio) * 0.42;
    const megaActive = (!isMotionPaused && flameMegaSurgeUntil > nowMs) ? 0.24 : 0;
    const breath = 1.0 + 0.08 * Math.sin(t * 0.92 + fst.seed) + 0.04 * Math.sin(t * 2.05 + 1.1);
    const ampBoost = breath * goalScale + surgeNorm * 0.30 + megaActive;
    const lobeState = FLAME_LOBES.map(L => ({
      x: L.x,
      h: L.h * ampBoost * (0.88 + 0.14 * Math.sin(t * L.speed + L.seed * 2.1)),
      w: L.w * (0.88 + Math.min(1, goalRatio) * 0.18 + surgeNorm * 0.14 + megaActive * 0.3),
      speed: L.speed * (1 + Math.min(1, goalRatio) * 0.15),
      curl: L.curl,
      power: L.power * (0.85 + Math.min(1.1, goalRatio) * 0.24 + megaActive * 0.35),
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


  if (theme === 'storm') {
    const dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth <= 540 ? 1.5 : 2);
    const bw = Math.round(w * dpr);
    const bh = Math.round(h * dpr);
    if (canvas.width !== bw || canvas.height !== bh) {
      canvas.width = bw;
      canvas.height = bh;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, w, h);

    const cell = 4;
    const drawSz = cell - 1;
    const cols = Math.ceil(w / cell);
    const rows = Math.ceil(h / cell);
    const nowMs = performance.now();
    const isMotionPaused = document.body.classList.contains('motion-paused') || (typeof reducedMotion !== 'undefined' && reducedMotion.matches);
    const st = ensureStormState(canvas);
    const t = isMotionPaused ? STORM_STATIC_PHASE : phase;

    if (!isMotionPaused && st.climaxStartMs === 0 && nowMs >= st.nextClimaxMs) {
      st.climaxStartMs = nowMs;
      st.flingBurstDone = false;
      st.climaxArcDone = false;
      st.nextClimaxMs = nowMs + st.climaxDurMs + 2800;
    }
    let climaxP = -1;
    if (!isMotionPaused && st.climaxStartMs > 0) {
      const elapsedC = nowMs - st.climaxStartMs;
      if (elapsedC >= st.climaxDurMs) {
        st.climaxStartMs = 0;
        st.flingBurstDone = false;
        st.climaxArcDone = false;
      } else {
        climaxP = elapsedC / st.climaxDurMs;
      }
    }

    let eyeScale = 1.0;
    let spinBoost = 1.0;
    let flingPulse = 0.0;
    let compressBoost = 0.0;
    let gustPower = 0.28 + 0.16 * Math.sin(t * 1.4);
    if (isMotionPaused) {
      gustPower = 0.28;
    } else if (climaxP >= 0) {
      if (climaxP < 0.22) {
        const u = climaxP / 0.22;
        const ease = 1 - Math.pow(1 - u, 2);
        eyeScale = 1.0 - 0.48 * ease;
        spinBoost = 1.0 + 0.72 * ease;
        compressBoost = 0.22 * ease;
        gustPower = 0.35 + 0.45 * ease;
      } else if (climaxP < 0.50) {
        const u = (climaxP - 0.22) / 0.28;
        eyeScale = 0.52 + 0.08 * Math.sin(u * Math.PI);
        spinBoost = 1.72 + 1.05 * Math.sin(u * Math.PI * 0.9);
        compressBoost = 0.28;
        gustPower = 0.85 + 0.35 * Math.sin(u * Math.PI * 3);
        if (!st.climaxArcDone && u > 0.15) {
          st.climaxArcDone = true;
          st.arcs.push(generateStormBandArc(w * 0.65, h * 0.48, 0.10, Math.hypot(w * 0.60, h * 0.54), w, h, 35));
        }
      } else if (climaxP < 0.76) {
        const u = (climaxP - 0.50) / 0.26;
        flingPulse = Math.sin(u * Math.PI);
        eyeScale = 0.58 + 0.54 * Math.pow(u, 0.72);
        spinBoost = 2.45 - 0.75 * u;
        compressBoost = 0.14 * (1 - u);
        gustPower = 0.95 - 0.30 * u;
        if (!st.flingBurstDone && u > 0.10) {
          st.flingBurstDone = true;
          for (let k = 0; k < 20 && k < st.particles.length; k++) {
            const p = st.particles[(k * 3) % st.particles.length];
            p.mode = 'fling';
            p.rNorm = 0.22 + Math.random() * 0.16;
            p.vrBase = 0.54 + Math.random() * 0.36;
            p.life = 0;
            p.maxLife = 0.85 + Math.random() * 0.45;
          }
        }
      } else {
        const u = (climaxP - 0.76) / 0.24;
        const ease = 1 - Math.pow(1 - u, 2);
        eyeScale = 1.12 - 0.12 * ease;
        spinBoost = 1.70 - 0.70 * ease;
        compressBoost = -0.04 * (1 - ease);
        gustPower = 0.65 - 0.38 * ease;
      }
    }

    const eyeCx = w * (0.65 + 0.015 * Math.sin(t * 0.8));
    const eyeCy = h * (0.48 + 0.018 * Math.cos(t * 0.95));
    const maxR = Math.hypot(w * 0.62, h * 0.55);
    const eyeR = (0.132 + 0.008 * Math.sin(t * 1.4)) * eyeScale;

    if (!isMotionPaused) {
      if (nowMs >= st.nextArcMs) {
        st.arcs.push(generateStormBandArc(eyeCx, eyeCy, eyeR, maxR, w, h, 25));
        const inPeak = climaxP >= 0.18 && climaxP <= 0.64;
        st.nextArcMs = nowMs + (inPeak ? (145 + Math.random() * 195) : (480 + Math.random() * 620));
      }
      st.arcs = st.arcs.filter(arc => (nowMs - arc.startMs) < arc.durMs);
    } else {
      st.arcs = [];
    }

    const activeArcSegs = [];
    let globalSkyFlash = 0;
    for (let ai = 0; ai < st.arcs.length; ai++) {
      const arc = st.arcs[ai];
      const ap = Math.max(0, Math.min(1, (nowMs - arc.startMs) / arc.durMs));
      const flashInt = ap < 0.14 ? (ap / 0.14) : Math.pow(1 - (ap - 0.14) / 0.86, 1.65);
      if (flashInt > 0.04) {
        globalSkyFlash = Math.max(globalSkyFlash, flashInt);
        for (let si = 0; si < arc.segs.length; si++) {
          activeArcSegs.push({ ...arc.segs[si], flashInt });
        }
      }
    }

    const spinPhase = t * 1.28 * spinBoost;
    const bandGrid = new Uint8Array(cols * rows);
    const flashRadiusSq = 54 * 54;
    const coreDistSq = Math.pow(cell * 0.65, 2);
    const haloDistSq = Math.pow(cell * 1.80, 2);

    const evalOuterDeck = (px, py) => {
      const dx = px - eyeCx, dy = py - eyeCy;
      const dist = Math.hypot(dx, dy);
      const theta = Math.atan2(dy, dx);
      const pull = 0.25 * Math.sin(theta * 2.0 - dist * 0.013 + spinPhase * 0.62);
      const wave1 = 0.5 + 0.5 * Math.sin(px * 0.021 + py * 0.012 - t * 1.45 + pull * 2.5);
      const wave2 = 0.5 + 0.5 * Math.cos(px * 0.036 - py * 0.026 + t * 1.05 - pull * 1.7);
      const strata = Math.pow(0.56 * wave1 + 0.44 * wave2, 1.38);
      const topAnvil = Math.max(0, 1.0 - (py / (h * 0.78))) * 0.30;
      const trailShelf = px < eyeCx ? 0.16 * (0.5 + 0.5 * Math.sin(py * 0.044 + px * 0.015 - t * 1.15)) : 0;
      return Math.min(1, strata * 0.62 + topAnvil + trailShelf + globalSkyFlash * 0.34);
    };

    const evalVortexField = (px, py) => {
      const dx = px - eyeCx;
      const dy = (py - eyeCy) * 1.12;
      const dist = Math.hypot(dx, dy);
      const rNorm = dist / Math.max(1, maxR);
      const theta = Math.atan2(dy, dx);
      const shearPull = 1.0 + 0.28 * Math.cos(theta - t * 0.55) + 0.14 * Math.sin(theta * 2 + t * 0.40);
      const rEff = rNorm / shearPull;
      if (rEff < eyeR * 0.85) return 0.0;

      const wallRise = Math.min(1, Math.max(0, (rEff - eyeR * 0.85) / 0.075));
      const logR = Math.log(Math.max(0.05, rEff));
      const warp = 0.40 * Math.sin(theta * 2.0 + logR * 2.6 - t * 0.65) + 0.20 * Math.cos(rEff * 10.5 - t * 1.25);
      const thW = theta + warp;
      const armPrimary = 0.5 + 0.5 * Math.sin(thW * 2.0 - logR * 5.8 + spinPhase);
      const armSecondary = 0.5 + 0.5 * Math.cos(thW * 3.0 - logR * 8.6 + spinPhase * 1.26 + 1.0);
      const armDetail = 0.5 + 0.5 * Math.sin(thW * 5.0 - logR * 12.6 + spinPhase * 0.86 - 0.7);
      const ridgeCore = Math.pow(0.56 * armPrimary + 0.28 * armSecondary + 0.16 * armDetail, 1.42);

      const arcCutA = 0.5 + 0.5 * Math.sin(theta * 3.0 + logR * 3.4 - t * 0.92);
      const arcCutB = 0.5 + 0.5 * Math.cos(theta * 4.0 - logR * 2.2 + t * 0.68);
      const bandMask = Math.min(1, Math.max(0, (0.60 * arcCutA + 0.40 * arcCutB - 0.16) * 1.45));

      const eyewallRing = Math.exp(-Math.pow((rEff - (eyeR * 1.14 + flingPulse * 0.10)) / 0.105, 2.0));
      const outerDecay = Math.max(0, 1.0 - Math.pow(Math.max(0, (rEff - eyeR * 1.02) / 0.82), 1.32));

      const wallMix = eyewallRing * (0.52 + 0.48 * ridgeCore) * (0.80 + 0.20 * bandMask);
      const armMix = outerDecay * ridgeCore * (0.38 + 0.82 * bandMask) * (0.96 + compressBoost);
      const d = wallRise * Math.min(1.0, Math.max(wallMix * 1.06, armMix * 1.14));
      return d < 0.09 ? 0.0 : Math.min(0.995, d);
    };

    for (let y = 0; y < rows; y++) {
      const py = y * cell + cell * 0.5;
      for (let x = 0; x < cols; x++) {
        const px = x * cell + cell * 0.5;
        const bayer = (BAYER4[y & 3][x & 3] + 0.5) / 16;

        const dxE = px - eyeCx, dyE = (py - eyeCy) * 1.12;
        const rEffCheck = Math.hypot(dxE, dyE) / Math.max(1, maxR) / (1.0 + 0.28 * Math.cos(Math.atan2(dyE, dxE) - t * 0.55));
        const inHollowEye = rEffCheck < eyeR * 0.86;

        const vDens = evalVortexField(px, py);
        const lenE = Math.max(8, Math.hypot(dxE, dyE));
        const tx = -dyE / lenE, ty = dxE / lenE;
        const vUp = vDens > 0.09 ? evalVortexField(px - tx * 9 - (dxE / lenE) * 4, py - ty * 9 - (dyE / lenE) * 4) : 0;
        const windwardEdge = vDens > 0.09 ? Math.max(0, vDens - vUp) : 0;

        const bgDens = evalOuterDeck(px, py);
        const bgUp = evalOuterDeck(px - 8, py - 4);
        const bgCrest = Math.max(0, bgDens - bgUp);

        const hSeed = Math.sin(x * 13.71 + y * 61.37 + Math.floor(t * 5.0) * 17.3) * 43758.5453;
        const cellNoise = (hSeed - Math.floor(hSeed) - 0.5) * 0.07;

        let arcBoost = 0, arcCoreHit = false, arcHaloHit = false;
        if (activeArcSegs.length > 0) {
          let minD2 = flashRadiusSq, bestFlash = 0, bestCore = 1;
          for (let s = 0; s < activeArcSegs.length; s++) {
            const sg = activeArcSegs[s];
            const d2 = distToSegSq(px, py, sg.ax, sg.ay, sg.bx, sg.by);
            if (d2 < minD2) { minD2 = d2; bestFlash = sg.flashInt; bestCore = sg.core; }
          }
          if (minD2 <= coreDistSq * bestCore && bestFlash > 0.22) arcCoreHit = true;
          else if (minD2 <= haloDistSq * bestCore && bestFlash > 0.20) arcHaloHit = true;
          if (minD2 < flashRadiusSq) arcBoost = Math.pow(1 - Math.sqrt(minD2) / 54, 1.25) * bestFlash * 0.72;
        }

        let idx = 0;
        if (arcCoreHit) idx = 11;
        else if (arcHaloHit) idx = bayer > 0.35 ? 10 : 11;
        else if (inHollowEye) idx = (rEffCheck > eyeR * 0.62 && bayer > 0.66) ? 1 : 0;
        else if (vDens <= 0.02) {
          const baroWave = 0.5 + 0.5 * Math.sin(px * 0.025 + py * 0.017 - t * 1.4 + globalSkyFlash * 1.8);
          const bgVal = Math.max(0.03, Math.min(0.98, bgDens * 0.68 + bgCrest * 1.55 + baroWave * 0.14 + arcBoost * 0.90 + globalSkyFlash * 0.26));
          const maxBgIdx = globalSkyFlash > 0.25 ? 7 : 5;
          const scaledBg = 1 + bgVal * (maxBgIdx - 0.6);
          const bBand = Math.floor(scaledBg);
          idx = Math.min(maxBgIdx, Math.max(1, bBand + ((scaledBg - bBand) > (0.28 + bayer * 0.48) ? 1 : 0)));
        } else {
          const leftScrim = px < w * 0.30 ? (0.80 + 0.20 * (px / (w * 0.30))) : 1.0;
          const eyewallBoost = Math.exp(-Math.pow((rEffCheck - eyeR * 1.15) / 0.14, 2)) * 0.18;
          const val = Math.max(0.03, Math.min(0.998, ((vDens - 0.06) * 0.96 + windwardEdge * 2.85 + eyewallBoost + cellNoise + arcBoost + globalSkyFlash * 0.16) * leftScrim));
          const scaled = 3.5 + val * 7.8;
          const band = Math.floor(scaled);
          idx = Math.min(11, Math.max(3, band + ((scaled - band) > (0.24 + bayer * 0.46) ? 1 : 0)));
        }
        bandGrid[y * cols + x] = idx;
      }
    }

    for (let y = 0; y < rows; y++) {
      const rowOff = y * cols;
      for (let x = 0; x < cols; x++) {
        let idx = bandGrid[rowOff + x];
        if (idx <= 3) {
          const up = y > 0 ? bandGrid[(y - 1) * cols + x] : 0;
          const dn = y + 1 < rows ? bandGrid[(y + 1) * cols + x] : 0;
          const lf = x > 0 ? bandGrid[rowOff + x - 1] : 0;
          const rt = x + 1 < cols ? bandGrid[rowOff + x + 1] : 0;
          if (up >= 6 || dn >= 6 || lf >= 6 || rt >= 6) idx = 2;
        }
        ctx.fillStyle = STORM_PALETTE[idx];
        ctx.fillRect(x * cell, y * cell, drawSz, drawSz);
      }
    }

    const dt = isMotionPaused ? 0 : Math.min(0.05, Math.max(0.001, (nowMs - st.lastTickMs) / 1000));
    st.lastTickMs = nowMs;
    const drawCell = (gx, gy, colorIdx) => {
      if (gx < 0 || gx >= cols || gy < 0 || gy >= rows) return;
      ctx.fillStyle = STORM_PALETTE[colorIdx];
      ctx.fillRect(gx * cell, gy * cell, drawSz, drawSz);
    };

    const baseSlant = 0.46 + gustPower * 0.58;
    for (let i = 0; i < st.rain.length; i++) {
      const rn = st.rain[i];
      if (!isMotionPaused) {
        const px = rn.xNorm * w;
        const dx = eyeCx - px;
        const pullX = Math.max(-0.45, Math.min(0.85, dx / Math.max(80, w * 0.75))) * (0.35 + gustPower * 0.55);
        rn.yNorm += rn.speed * (0.95 + gustPower * 0.65) * dt;
        rn.xNorm += (rn.speed * baseSlant + pullX * 0.42) * dt;
        if (rn.yNorm > 1.06 || rn.xNorm > 1.15 || rn.xNorm < -0.15) {
          st.rain[i] = createStormRainDrop(false);
          continue;
        }
      }
      const rx = rn.xNorm * w, ry = rn.yNorm * h;
      if (Math.hypot(rx - eyeCx, ry - eyeCy) < eyeR * maxR * 0.76) continue;
      const localLean = baseSlant + ((eyeCx - rx) / Math.max(120, w)) * 0.25;
      const litByArc = globalSkyFlash > 0.30;
      const rainIdx = litByArc ? (rn.depth ? 11 : 9) : (rn.depth ? 9 : 6);
      for (let seg = 0; seg < rn.len; seg++) {
        const gx = Math.floor((rx - seg * cell * localLean * 0.9) / cell);
        const gy = Math.floor((ry - seg * cell * 0.95) / cell);
        drawCell(gx, gy, rainIdx);
      }
    }

    const ptsPool = st.particles;
    for (let i = 0; i < ptsPool.length; i++) {
      const pt = ptsPool[i];
      if (!isMotionPaused) {
        const angVel = pt.omegaBase * spinBoost * (0.48 / Math.max(0.13, pt.rNorm + 0.07));
        pt.theta += angVel * dt;
        const radialMod = pt.mode === 'fling' ? (pt.vrBase + flingPulse * 0.42) : pt.mode === 'inward' ? (pt.vrBase * (1 + compressBoost)) : pt.vrBase;
        pt.rNorm += radialMod * dt;
        pt.life += dt;
        if (pt.life >= pt.maxLife || pt.rNorm < eyeR * 0.88 || pt.rNorm > 1.08) {
          ptsPool[i] = createStormParticle();
          continue;
        }
      }
      const px = eyeCx + Math.cos(pt.theta) * pt.rNorm * maxR;
      const py = eyeCy + Math.sin(pt.theta) * pt.rNorm * maxR * 0.88;
      if (px < 0 || px >= w || py < 0 || py >= h) continue;
      const gx = Math.max(0, Math.min(cols - 1, Math.floor(px / cell)));
      const gy = Math.max(0, Math.min(rows - 1, Math.floor(py / cell)));
      drawCell(gx, gy, (pt.rNorm < eyeR * 1.95 || pt.mode === 'fling') ? 11 : 10);
      if (pt.shape === 'streak2' || pt.shape === 'streak3') {
        const trailCount = pt.shape === 'streak3' ? 2 : 1;
        for (let tr = 1; tr <= trailCount; tr++) {
          drawCell(
            Math.max(0, Math.min(cols - 1, Math.floor((px + Math.sin(pt.theta) * 4 * tr) / cell))),
            Math.max(0, Math.min(rows - 1, Math.floor((py - Math.cos(pt.theta) * 4 * tr) / cell))),
            tr === 1 ? 8 : 6
          );
        }
      }
    }
    return;
  }

  if (theme === 'frost') {
    const dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth <= 540 ? 1.5 : 2);
    const bw = Math.round(w * dpr), bh = Math.round(h * dpr);
    if (canvas.width !== bw || canvas.height !== bh) { canvas.width = bw; canvas.height = bh; }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, w, h);

    const cell = w <= 360 ? 4 : 5, drawSz = cell - 1, cols = Math.ceil(w / cell), rows = Math.ceil(h / cell);
    const nowMs = performance.now();
    const isMotionPaused = document.body.classList.contains('motion-paused') || (typeof reducedMotion !== 'undefined' && reducedMotion.matches);
    const fst = ensureFrostState(canvas);
    const dt = isMotionPaused ? 0 : Math.min(0.05, Math.max(0.001, (nowMs - fst.lastTickMs) / 1000));
    fst.lastTickMs = nowMs;
    const t = isMotionPaused ? FROST_STATIC_PHASE : phase;
    const mobile = w <= 560;
    const isCompactHero = h <= 220;

    if (isMotionPaused) {
      fst.freezeCover = 0.94; fst.windSpeed = 1.65; fst.crystalGrowth = 0.98;
      fst.coldSweep = 0.16; fst.burstBloom = 0.22; fst.hesitatePulse = 0.0; fst.shockwave = 0.0; fst.glintOffset = w * 0.62;
    } else if (fst.mode === 'freeze') {
      const elapsed = Math.max(0, nowMs - fst.freezeStartMs);
      const gp = Math.min(1, elapsed / Math.max(1, fst.freezeDurMs));
      const ch = evalFrostChoreography(gp);
      fst.freezeCover = ch.cover; fst.windSpeed = ch.wind; fst.coldSweep = ch.sweep;
      fst.crystalGrowth = ch.crystal; fst.burstBloom = ch.bloom; fst.hesitatePulse = ch.hesitate;

      if (!fst.burstDone && gp >= 0.66) {
        fst.burstDone = true;
        fst.shockwave = 0.01;
        const burstCount = mobile ? 26 : 48;
        for (let ci = 0; ci < fst.scene.clusters.length; ci++) {
          const cl = fst.scene.clusters[ci];
          const clx = isCompactHero ? cl.cxCompact : cl.x, cly = isCompactHero ? cl.cyCompact : cl.y;
          const perCluster = cl.hero ? Math.round(burstCount * 0.46) : Math.round(burstCount * 0.18);
          for (let i = 0; i < perCluster; i++) {
            fst.shards.push(createFrostShard(i, perCluster, clx, cly, (i % 2 === 0) ? 'chunk' : 'powder'));
          }
        }
      }
      if (fst.shockwave > 0) fst.shockwave = Math.min(1.0, fst.shockwave + dt * 1.85);
      if (gp >= 1) { fst.mode = 'normal'; fst.shockwave = 0; }
    } else {
      const lerpR = Math.min(1, dt * 3.5);
      const surgeBoost = nowMs < frostSurgeUntil ? 0.72 : 0.0;
      fst.windSpeed += ((1.64 + surgeBoost + 0.28 * Math.sin(t * 1.55)) - fst.windSpeed) * lerpR;
      fst.freezeCover += ((0.94 + 0.015 * Math.sin(t * 0.7)) - fst.freezeCover) * lerpR;
      fst.crystalGrowth += ((0.98 + 0.025 * Math.sin(t * 1.1)) - fst.crystalGrowth) * lerpR;
      fst.coldSweep += ((0.32 + 0.24 * Math.sin(t * 1.45)) - fst.coldSweep) * lerpR;
      fst.burstBloom += (0.0 - fst.burstBloom) * lerpR;
      fst.hesitatePulse = 0;
      fst.shockwave = 0;
    }

    if (!isMotionPaused) {
      if (nowMs >= fst.nextGlintMs) {
        fst.glintOffset = -140;
        fst.nextGlintMs = nowMs + (fst.mode === 'normal' ? 1750 : 1050);
      } else {
        fst.glintOffset += dt * 440;
      }
    }

    const bandGrid = new Uint8Array(cols * rows), ownerGrid = new Uint8Array(cols * rows);
    const { frontWaves: fw, plates, dendrites, clusters, icicles, sparkles } = fst.scene;
    const cover = fst.freezeCover;
    const minDim = Math.min(w, h);

    // Precompute feathery rime dendrites (3 tiers)
    const dendriteSegs = [];
    for (let i = 0; i < dendrites.length; i++) {
      const d = dendrites[i];
      const prog = Math.max(0, Math.min(1, (cover - d.delay) * 1.48 * d.speed));
      if (prog <= 0.02) continue;
      const sx = d.x * w, sy = d.y * h, fullL = d.len * minDim * 1.22 * prog;
      const ex = sx + Math.cos(d.ang) * fullL, ey = sy + Math.sin(d.ang) * fullL;
      dendriteSegs.push({ ax: sx, ay: sy, bx: ex, by: ey, r2: 6.2, tier: 1 });
      for (let j = 0; j < d.twigs.length; j++) {
        const tw = d.twigs[j];
        if (prog < tw.tPos) continue;
        const subProg = Math.min(1, (prog - tw.tPos) / Math.max(0.15, 1 - tw.tPos));
        const tx = sx + Math.cos(d.ang) * (fullL * tw.tPos), ty = sy + Math.sin(d.ang) * (fullL * tw.tPos);
        const tLen = fullL * tw.lenRatio * subProg;
        const tex = tx + Math.cos(d.ang + tw.dAng) * tLen, tey = ty + Math.sin(d.ang + tw.dAng) * tLen;
        dendriteSegs.push({ ax: tx, ay: ty, bx: tex, by: tey, r2: 4.0, tier: 2 });
        if (!mobile && subProg > 0.50) {
          const mx = (tx + tex) * 0.5, my = (ty + tey) * 0.5, mLen = tLen * 0.45 * (subProg - 0.42);
          dendriteSegs.push({ ax: mx, ay: my, bx: mx + Math.cos(d.ang + tw.dAng + tw.microSide) * mLen, by: my + Math.sin(d.ang + tw.dAng + tw.microSide) * mLen, r2: 2.6, tier: 3 });
        }
      }
    }

    // Precompute ornate 6-fold snow crystal rosettes with diamond nodes & chevron barbs
    const clusterSegs = [];
    const clusterNodes = [];
    let heroCx = w * 0.74, heroCy = h * 0.36;
    for (let ci = 0; ci < clusters.length; ci++) {
      const cl = clusters[ci];
      const localGrow = cover > 0.46 ? Math.min(1.20, (fst.crystalGrowth - 0.42) / 0.58 + fst.burstBloom * 0.28) : Math.max(0, (cover - 0.22) * 0.72);
      if (localGrow <= 0.05) continue;
      const cx = (isCompactHero ? cl.cxCompact : cl.x) * w, cy = (isCompactHero ? cl.cyCompact : cl.y) * h;
      const rad = cl.radius * (isCompactHero ? Math.min(w * 0.55, h * 1.45) : minDim) * localGrow;
      if (cl.hero) { heroCx = cx; heroCy = cy; }
      const coreR = cl.hero ? Math.max(6.5, rad * 0.14) : Math.max(4.5, rad * 0.13);
      clusterNodes.push({ cx, cy, coreR, rad, hero: cl.hero });
      for (let a = 0; a < cl.arms; a++) {
        const ang = cl.rot + (a / cl.arms) * Math.PI * 2 + (isMotionPaused ? 0 : Math.sin(t * 0.45 + ci) * 0.04);
        const ax2 = cx + Math.cos(ang) * rad, ay2 = cy + Math.sin(ang) * rad;
        clusterSegs.push({ cx, cy, ax: cx, ay: cy, bx: ax2, by: ay2, rad, hero: cl.hero, tier: 1 });
        if (localGrow > 0.36) {
          const b1 = rad * 0.40, b1x = cx + Math.cos(ang) * b1, b1y = cy + Math.sin(ang) * b1, l1 = rad * 0.34;
          clusterSegs.push({ cx, cy, ax: b1x, ay: b1y, bx: b1x + Math.cos(ang + 0.92) * l1, by: b1y + Math.sin(ang + 0.92) * l1, rad, hero: cl.hero, tier: 2 });
          clusterSegs.push({ cx, cy, ax: b1x, ay: b1y, bx: b1x + Math.cos(ang - 0.92) * l1, by: b1y + Math.sin(ang - 0.92) * l1, rad, hero: cl.hero, tier: 2 });
        }
        if (localGrow > 0.62) {
          const b2 = rad * 0.70, b2x = cx + Math.cos(ang) * b2, b2y = cy + Math.sin(ang) * b2, l2 = rad * 0.24;
          clusterSegs.push({ cx, cy, ax: b2x, ay: b2y, bx: b2x + Math.cos(ang + 0.92) * l2, by: b2y + Math.sin(ang + 0.92) * l2, rad, hero: cl.hero, tier: 3 });
          clusterSegs.push({ cx, cy, ax: b2x, ay: b2y, bx: b2x + Math.cos(ang - 0.92) * l2, by: b2y + Math.sin(ang - 0.92) * l2, rad, hero: cl.hero, tier: 3 });
        }
      }
    }

    // Horizon glacial ridge height function (keeps left text zone clear, rises gracefully on right)
    const evalRidgeY = (nx) => {
      const base = isCompactHero ? 0.89 : 0.85;
      const rightRise = Math.max(0, (nx - 0.38) / 0.62) * (isCompactHero ? 0.08 : 0.14);
      const peakA = 0.045 * Math.abs(((nx * 5.2 + 0.3) % 2) - 1);
      const peakB = 0.025 * Math.abs(((nx * 11.4 + 0.7) % 2) - 1);
      return (base - rightRise - peakA - peakB) * h;
    };

    const shockR = fst.shockwave > 0 ? fst.shockwave * Math.hypot(w * 0.55, h * 0.55) : -1;

    for (let y = 0; y < rows; y++) {
      const py = y * cell + cell * 0.5, ny = py / h;
      for (let x = 0; x < cols; x++) {
        const px = x * cell + cell * 0.5, nx = px / w;
        const bayer = (BAYER4[y & 3][x & 3] + 0.5) / 16;

        // Stratum 1: Deep Polar Sky + Shimmering Aurora-Ice Wind Ribbons + Twinkling Stars
        const skyWave1 = 0.5 + 0.5 * Math.sin(nx * 8.5 - ny * 4.2 - t * 1.65 * Math.max(0.8, fst.windSpeed * 0.72));
        const skyWave2 = 0.5 + 0.5 * Math.cos(nx * 15.0 + ny * 6.5 - t * 2.25);
        const auroraCurtain = Math.max(0, 1 - ny * 1.35) * (0.58 * skyWave1 + 0.42 * skyWave2) * (0.65 + 0.35 * nx);
        const squallStrata = fst.coldSweep > 0.02 ? Math.max(0, Math.sin(px * 0.036 - py * 0.024 - t * 4.8)) * fst.coldSweep : 0;
        const skyVal = (nx * 0.32 + (1 - ny) * 0.20) * 0.55 + auroraCurtain * 0.78 + squallStrata * 0.95;

        let idx = skyVal > (0.86 + bayer * 0.30) ? 4 : skyVal > (0.56 + bayer * 0.34) ? 3 : skyVal > (0.28 + bayer * 0.36) ? 2 : 1;
        if (squallStrata > (0.52 + bayer * 0.25)) idx = Math.max(idx, 7);

        // Deterministic twinkling polar night stars in open upper sky
        const starHash = ((x * 73856093) ^ (y * 19349663)) >>> 0;
        if (ny < 0.58 && (starHash % 97) === 0) {
          const twk = 0.5 + 0.5 * Math.sin(t * 3.1 + (starHash % 100));
          if (twk > 0.52) idx = Math.max(idx, twk > 0.84 ? 9 : 7);
        }

        let owner = 0;
        const inTextBox = isCompactHero
          ? (nx < 0.70 && ny > 0.16 && ny < 0.88)
          : (nx < 0.50 && ny > 0.14 && ny < 0.90);

        // Stratum 2: Distant Jagged Glacial Ridge with Sunlit Snow Crest
        const ridgeY = evalRidgeY(nx);
        if (py >= ridgeY) {
          const depth = py - ridgeY;
          if (depth < cell * 1.65) {
            idx = Math.max(idx, (nx > 0.42 && !inTextBox) ? (bayer > 0.35 ? 9 : 8) : (bayer > 0.4 ? 7 : 6));
          } else if (depth < cell * 3.8) {
            idx = Math.max(2, Math.min(idx, bayer > 0.45 ? 4 : 3));
          } else {
            idx = bayer > 0.55 ? 2 : 1;
          }
        }

        // Stratum 3: Advancing Jagged Freeze Front + Faceted Translucent Ice Plates
        const dMin = Math.min((1 - nx) / fw.rightSpeed, (1 - ny) / fw.bottomSpeed, ny / fw.topSpeed, nx / fw.leftSpeed);
        const branchFingers = 0.085 * Math.sin(nx * 19 + fw.phaseA) + 0.072 * Math.cos(ny * 16 + fw.phaseB) + 0.052 * Math.sin((nx - ny) * 24);
        const frontDelta = dMin - (cover * 0.64 + branchFingers);

        if (frontDelta <= 0.028) {
          let best1 = 999, best2 = 999, p1 = null;
          for (let pi = 0; pi < plates.length; pi++) {
            const p = plates[pi], dx = (nx - p.cx) / p.rx, dy = (ny - p.cy) / p.ry;
            const cosR = Math.cos(p.rot), sinR = Math.sin(p.rot);
            const d = Math.hypot(dx * cosR + dy * sinR, (-dx * sinR + dy * cosR) * 1.15) + p.bias * 0.15;
            if (d < best1) { best2 = best1; best1 = d; p1 = p; } else if (d < best2) { best2 = d; }
          }
          if (frontDelta > -0.026 && frontDelta <= 0.024) {
            if ((Math.sin(x * 0.85 + y * 0.72) > -0.28) || fst.hesitatePulse > 0.18) {
              idx = inTextBox ? (bayer > 0.4 ? 8 : 7) : (bayer > 0.30 ? 11 : 9);
              owner = 1;
            }
          } else if (frontDelta <= -0.026) {
            owner = 1;
            const seamGap = best2 - best1;
            if (seamGap < 0.058) {
              idx = seamGap < 0.022 ? 1 : (inTextBox ? 6 : (bayer > 0.30 ? 9 : 8));
            } else if (p1) {
              const effThick = p1.thick * (inTextBox ? 0.34 : 1.0);
              const facetShine = 0.5 + 0.5 * Math.cos((nx - p1.cx) * Math.cos(p1.facetAng) * 8 + (ny - p1.cy) * Math.sin(p1.facetAng) * 8 - t * 1.35);
              const interiorTone = effThick * 0.56 + facetShine * 0.28 + (1 - Math.min(1, best1)) * 0.18;
              if (effThick < 0.42) {
                idx = Math.max(idx, interiorTone > (0.34 + bayer * 0.34) ? 4 : 3);
              } else {
                const squallBoost = (!inTextBox && squallStrata > 0.26) ? 1 : 0;
                const paneIdx = Math.min(8, (interiorTone > (0.70 + bayer * 0.26) ? 7 : interiorTone > (0.46 + bayer * 0.28) ? 6 : interiorTone > (0.26 + bayer * 0.28) ? 5 : 4) + squallBoost);
                idx = Math.max(idx, paneIdx);
              }
            }
          }
        }

        // Radial freeze-climax shockwave ring from hero crystal center
        if (shockR > 0) {
          const distHero = Math.hypot(px - heroCx, py - heroCy);
          if (Math.abs(distHero - shockR) < cell * 2.2 && !inTextBox) {
            idx = Math.max(idx, bayer > 0.35 ? 10 : 8);
          }
        }

        // Stratum 4A: Feathery Rime Frost Dendrites
        for (let di = 0; di < dendriteSegs.length; di++) {
          const s = dendriteSegs[di];
          if (px < Math.min(s.ax, s.bx) - 6 || px > Math.max(s.ax, s.bx) + 6 || py < Math.min(s.ay, s.by) - 6 || py > Math.max(s.ay, s.by) + 6) continue;
          if (frostDistToSegSq(px, py, s.ax, s.ay, s.bx, s.by) <= s.r2) {
            const frostIdx = s.tier === 1 ? (bayer > 0.35 ? 9 : 8) : s.tier === 2 ? 9 : 10;
            if (!inTextBox || s.tier >= 2) idx = Math.max(idx, frostIdx);
            owner = Math.max(owner, 1);
          }
        }

        // Stratum 4B: Ornate 6-Fold Snow Crystal Rosettes (with diamond nodes & glowing core)
        for (let ni = 0; ni < clusterNodes.length; ni++) {
          const cn = clusterNodes[ni];
          const dc = Math.hypot(px - cn.cx, py - cn.cy);
          if (dc <= cn.coreR) {
            idx = dc < cn.coreR * 0.52 ? 11 : 10;
            owner = 2;
          } else if (Math.abs(dc - cn.rad * 0.52) < (cn.hero ? 3.2 : 2.2) && Math.abs((px - cn.cx) * (py - cn.cy)) < cn.rad * cn.rad * 0.18) {
            if (cn.hero && bayer > 0.38) { idx = Math.max(idx, 9); owner = 2; }
          }
        }
        for (let si = 0; si < clusterSegs.length; si++) {
          const sg = clusterSegs[si];
          if (px < Math.min(sg.ax, sg.bx) - 10 || px > Math.max(sg.ax, sg.bx) + 10 || py < Math.min(sg.ay, sg.by) - 10 || py > Math.max(sg.ay, sg.by) + 10) continue;
          const d2 = frostDistToSegSq(px, py, sg.ax, sg.ay, sg.bx, sg.by);
          const armWidth = sg.tier === 1 ? (sg.hero ? 11.5 : 7.5) : sg.tier === 2 ? (sg.hero ? 7.0 : 4.5) : 3.8;
          if (d2 <= armWidth) {
            idx = d2 <= 2.6 ? 11 : (bayer > 0.30 ? 10 : 9);
            owner = 2;
          }
        }

        // Stratum 4C: 3D Faceted Glacier Spires & Hanging Rim Icicles
        let bestSpike = null;
        for (let ii = 0; ii < icicles.length; ii++) {
          const ic = icicles[ii];
          const localScale = Math.max(0, Math.min(1.15, (cover - ic.delay * 0.60) * 1.38)) * (0.76 + fst.crystalGrowth * 0.28);
          if (localScale <= 0.08) continue;
          const sp = sampleFrostSpike(px, py, ic.bx * w, ic.by * h, ic.ang, ic.len * Math.min(w * 0.82, h * 1.15) * localScale, ic.w * (0.88 + localScale * 0.16));
          if (sp && (!bestSpike || sp.facet > bestSpike.facet)) bestSpike = sp;
        }
        if (bestSpike) {
          const onGlint = Math.abs(px * 0.72 + py * 0.68 - fst.glintOffset) < 16 && bestSpike.facet > 0.42;
          const val = Math.min(1, bestSpike.facet + fst.burstBloom * 0.22 + (onGlint ? 0.30 : 0));
          const scaled = 3 + val * 8, band = Math.floor(scaled);
          idx = Math.min(11, Math.max(3, band + ((scaled - band) > (0.32 + bayer * 0.40) ? 1 : 0)));
          if (bestSpike.isRim) idx = Math.max(idx, onGlint ? 11 : 10);
          owner = 2;
        }

        const k = y * cols + x;
        bandGrid[k] = idx; ownerGrid[k] = owner;
      }
    }

    // 1px dark contour separation pass around hero crystal spires & rosettes + grid draw
    for (let y = 0; y < rows; y++) {
      const rOff = y * cols;
      for (let x = 0; x < cols; x++) {
        const k = rOff + x;
        let idx = bandGrid[k];
        if (ownerGrid[k] < 2) {
          const up = y > 0 ? ownerGrid[(y - 1) * cols + x] : 0, dn = y + 1 < rows ? ownerGrid[(y + 1) * cols + x] : 0;
          const lf = x > 0 ? ownerGrid[k - 1] : 0, rt = x + 1 < cols ? ownerGrid[k + 1] : 0;
          if (up === 2 || dn === 2 || lf === 2 || rt === 2) idx = 0;
        }
        ctx.fillStyle = FROST_PALETTE[idx];
        ctx.fillRect(x * cell, y * cell, drawSz, drawSz);
      }
    }

    const drawCell = (gx, gy, colorIdx) => {
      if (gx < 0 || gx >= cols || gy < 0 || gy >= rows) return;
      ctx.fillStyle = FROST_PALETTE[colorIdx];
      ctx.fillRect(gx * cell, gy * cell, drawSz, drawSz);
    };

    // Reactive Wind-Bent Snow-Capped Polar Pines along the glacial horizon
    const pineSway = 0.08 + Math.min(0.42, (fst.windSpeed - 1.1) * 0.14) + 0.05 * Math.sin(t * 2.4);
    const pineStep = isCompactHero ? 2 : 1;
    for (let pi = 0; pi < FROST_BG_PINES.length; pi += pineStep) {
      const tr = FROST_BG_PINES[pi];
      if (mobile && pi % 2 === 1) continue;
      const basePx = tr.x * w, basePy = evalRidgeY(tr.x) + cell * 0.5;
      const treeH = (isCompactHero ? tr.h * 0.52 : tr.h * 1.12);
      const levels = Math.max(4, Math.floor(treeH / cell));
      for (let lv = 0; lv < levels; lv++) {
        const u = lv / levels;
        const leanX = Math.pow(u, 1.35) * pineSway * treeH * 0.85;
        const gx = Math.floor((basePx - leanX) / cell);
        const gy = Math.floor((basePy - lv * cell) / cell);
        const halfSpan = lv < 2 ? 0 : Math.max(0, Math.round((1 - u) * (tr.crown * 0.24)));
        for (let dx = -halfSpan; dx <= halfSpan; dx++) {
          const isSnowCap = (dx <= 0 && u > 0.25 && (lv % 2 === 1 || u > 0.72));
          drawCell(gx + dx, gy, isSnowCap ? (u > 0.75 ? 9 : 8) : (dx === 0 ? 0 : 1));
        }
      }
    }

    // Stratum 5: High-Visibility 3-Layer Blizzard Snow & Cross-Star Pixel Flakes
    const windSlope = 0.82 + fst.windSpeed * 0.38 + 0.18 * Math.sin(t * 1.9);
    const snowCap = mobile ? 0.64 : 1.0;
    for (let i = 0; i < fst.snow.length; i++) {
      if ((i / fst.snow.length) > snowCap) continue;
      const sn = fst.snow[i];
      if (!isMotionPaused) {
        const gust = 1.0 + 0.30 * Math.sin(t * 3.8 + sn.seed), spd = fst.windSpeed * gust;
        sn.yNorm += sn.vyScale * spd * dt;
        sn.xNorm += (sn.vyScale * windSlope * sn.vxScale * spd + 0.065 * Math.sin(t * 3.2 + sn.seed)) * dt;
        if (sn.yNorm > 1.08 || sn.xNorm > 1.16 || sn.xNorm < -0.16) { fst.snow[i] = createFrostSnowParticle(sn.layer, false); continue; }
      }
      const rx = sn.xNorm * w, ry = sn.yNorm * h;
      const inText = isCompactHero ? (sn.xNorm < 0.70 && sn.yNorm > 0.16 && sn.yNorm < 0.88) : (sn.xNorm < 0.48 && sn.yNorm > 0.14 && sn.yNorm < 0.88);
      if (inText && sn.layer >= 1 && i % 3 !== 0) continue;
      const gx = Math.floor(rx / cell), gy = Math.floor(ry / cell);
      if (sn.layer === 0) {
        drawCell(gx, gy, inText ? 5 : 8);
      } else if (sn.layer === 1) {
        const cH = inText ? 7 : (fst.windSpeed > 1.7 ? 11 : 10), cT = inText ? 5 : 8;
        for (let seg = 0; seg < sn.len; seg++) {
          drawCell(Math.floor((rx - seg * cell * windSlope * 0.78) / cell), Math.floor((ry - seg * cell * 0.78) / cell), seg === 0 ? cH : cT);
        }
      } else if (sn.cross && !inText) {
        drawCell(gx, gy, 11);
        drawCell(gx - 1, gy, 9); drawCell(gx + 1, gy, 9);
        drawCell(gx, gy - 1, 10); drawCell(gx, gy + 1, 8);
      } else {
        drawCell(gx, gy, 11); drawCell(gx + 1, gy, 10); drawCell(gx, gy + 1, 9); drawCell(gx + 1, gy + 1, 8);
      }
    }

    // Ambient Twinkling 5-Cell Crystal Sparkles
    for (let si = 0; si < sparkles.length; si++) {
      const sp = sparkles[si];
      const tw = Math.sin(t * sp.speed + sp.seed);
      if (tw < 0.64) continue;
      const gx = Math.floor(sp.nx * cols), gy = Math.floor(sp.ny * rows);
      drawCell(gx, gy, 11);
      if (tw > 0.82) {
        drawCell(gx - 1, gy, 9); drawCell(gx + 1, gy, 9);
        drawCell(gx, gy - 1, 10); drawCell(gx, gy + 1, 10);
      }
    }

    // Stratum 6: Ballistic Shatter Shards & Diamond Dust
    for (let i = fst.shards.length - 1; i >= 0; i--) {
      const sh = fst.shards[i];
      if (!isMotionPaused) {
        sh.xNorm += sh.vx * dt; sh.yNorm += sh.vy * dt;
        sh.vy += (sh.kind === 'chunk' ? 1.55 : 0.95) * dt; sh.vx *= Math.pow(0.32, dt); sh.life += dt;
        if (sh.life >= sh.maxLife || sh.yNorm > 1.06) { fst.shards.splice(i, 1); continue; }
      }
      const gx = Math.floor(sh.xNorm * cols), gy = Math.floor(sh.yNorm * rows);
      const lifeRatio = sh.life / sh.maxLife, cIdx = lifeRatio < 0.35 ? 11 : lifeRatio < 0.72 ? 9 : 7;
      if (sh.kind === 'chunk') {
        drawCell(gx, gy, cIdx);
        if (lifeRatio < 0.75) { drawCell(gx + 1, gy, Math.max(5, cIdx - 1)); drawCell(gx, gy + 1, Math.max(4, cIdx - 2)); }
      } else drawCell(gx, gy, cIdx);
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

function triggerArenaSprint(durationMs = 2600) {
  if (document.body.classList.contains('motion-paused') || (typeof reducedMotion !== 'undefined' && reducedMotion.matches)) return;
  const now = performance.now();
  arenaSprintStart = now;
  arenaSprintUntil = now + durationMs;
  const wrap = $('.pixel-arena-wrap');
  if (wrap) wrap.classList.add('is-sprinting');
  setTimeout(() => {
    const wEl = $('.pixel-arena-wrap');
    if (wEl && performance.now() >= arenaSprintUntil) wEl.classList.remove('is-sprinting');
  }, durationMs + 80);
}

function triggerElectricSweep(durationMs = 2600) {
  if (document.body.classList.contains('motion-paused') || (typeof reducedMotion !== 'undefined' && reducedMotion.matches)) return;
  const now = performance.now();
  electricSweepUntil = Math.max(electricSweepUntil, now + durationMs);
  $$('.poster-lightning, .pomodoro-panel').forEach(el => el.classList.add('electric-sweep-active'));
  setTimeout(() => {
    if (performance.now() >= electricSweepUntil) {
      $$('.poster-lightning, .pomodoro-panel').forEach(el => el.classList.remove('electric-sweep-active'));
    }
  }, durationMs + 80);
}

function arenaStadiumPoint(uRaw) {
  const u = ((uRaw % 1) + 1) % 1;
  const r = 59, cyMid = 107, xLeft = 139.5, xRight = 300.5;
  const straight = xRight - xLeft;
  const halfArc = Math.PI * r;
  const totalLen = straight * 2 + halfArc * 2;
  let d = u * totalLen;
  if (d <= straight * 0.5) {
    return { x: 220 + d, y: cyMid + r };
  }
  d -= straight * 0.5;
  if (d <= halfArc) {
    const a = Math.PI * 0.5 - (d / r);
    return { x: xRight + Math.cos(a) * r, y: cyMid + Math.sin(a) * r };
  }
  d -= halfArc;
  if (d <= straight) {
    return { x: xRight - d, y: cyMid - r };
  }
  d -= straight;
  if (d <= halfArc) {
    const a = -Math.PI * 0.5 - (d / r);
    return { x: xLeft + Math.cos(a) * r, y: cyMid + Math.sin(a) * r };
  }
  d -= halfArc;
  return { x: xLeft + d, y: cyMid + r };
}

function drawArenaCanvas(canvas, nowMs) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.clientWidth || 440;
  const h = canvas.clientHeight || 215;
  if (!w || !h) return;
  const dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth <= 540 ? 1.5 : 2);
  const bw = Math.round(w * dpr), bh = Math.round(h * dpr);
  if (canvas.width !== bw || canvas.height !== bh) { canvas.width = bw; canvas.height = bh; }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, w, h);

  const isPaused = document.body.classList.contains('motion-paused') || (typeof reducedMotion !== 'undefined' && reducedMotion.matches);
  const st = canvas._arenaState || (canvas._arenaState = { sparks: [], lastU: 0, lastMs: nowMs });

  const scale = Math.min(w / 440, h / 215);
  const ox = (w - 440 * scale) / 2;
  const oy = (h - 215 * scale) / 2;
  const toPx = pt => ({ x: ox + pt.x * scale, y: oy + pt.y * scale });

  const sprinting = !isPaused && nowMs < arenaSprintUntil;
  let u;
  if (isPaused) {
    u = 0.16;
  } else if (sprinting) {
    const sp = Math.min(1, Math.max(0, (nowMs - arenaSprintStart) / Math.max(1, arenaSprintUntil - arenaSprintStart)));
    u = sp < 0.5 ? 2 * sp * sp : 1 - Math.pow(-2 * sp + 2, 2) / 2;
  } else {
    u = ((nowMs / 13000) % 1);
  }

  const ambCount = sprinting ? 14 : 7;
  for (let i = 0; i < ambCount; i++) {
    const au = (i / ambCount + (isPaused ? 0 : nowMs * (sprinting ? 0.00018 : 0.00004))) % 1;
    const ap = toPx(arenaStadiumPoint(au));
    const snapX = Math.round(ap.x / 3) * 3;
    const snapY = Math.round((ap.y + ((i % 3) - 1) * 6 * scale) / 3) * 3;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(32, 63, 145, 0.24)' : 'rgba(229, 73, 43, 0.24)';
    ctx.fillRect(snapX, snapY, 3, 3);
  }

  if (!isPaused) {
    const dt = Math.min(0.05, Math.max(0.001, (nowMs - st.lastMs) / 1000));
    st.lastMs = nowMs;
    const head = toPx(arenaStadiumPoint(u));
    const prev = toPx(arenaStadiumPoint(u - 0.006));
    const tx = head.x - prev.x, ty = head.y - prev.y;
    const spawnCount = sprinting ? 3 : (Math.random() < 0.45 ? 1 : 0);
    for (let k = 0; k < spawnCount; k++) {
      if (st.sparks.length < 48) {
        st.sparks.push({
          x: head.x + (Math.random() - 0.5) * 6,
          y: head.y + (Math.random() - 0.5) * 6,
          vx: -tx * (sprinting ? 14 : 6) + (Math.random() - 0.5) * 26,
          vy: -ty * (sprinting ? 14 : 6) - 12 + (Math.random() - 0.5) * 24,
          life: sprinting ? 0.55 : 0.38,
          maxLife: sprinting ? 0.55 : 0.38,
          clr: sprinting ? (k === 0 ? '#e5492b' : k === 1 ? '#f59e0b' : '#0284c7') : (Math.random() < 0.5 ? '#e5492b' : '#d97706')
        });
      }
    }
    for (let i = st.sparks.length - 1; i >= 0; i--) {
      const p = st.sparks[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) { st.sparks.splice(i, 1); continue; }
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.clr;
      const sz = sprinting ? 4 : 3;
      ctx.fillRect(Math.round(p.x / 2) * 2, Math.round(p.y / 2) * 2, sz, sz);
    }
    ctx.globalAlpha = 1;
  } else {
    for (let i = 1; i <= 5; i++) {
      const sp = toPx(arenaStadiumPoint(u - i * 0.011));
      ctx.fillStyle = i <= 2 ? 'rgba(255, 208, 38, 0.75)' : 'rgba(229, 73, 43, 0.48)';
      ctx.fillRect(Math.round(sp.x / 3) * 3 - 2, Math.round((sp.y + (i % 2 ? 4 : -4)) / 3) * 3, 3, 3);
    }
  }

  const trailSteps = sprinting ? 8 : 5;
  const trailStepU = sprinting ? 0.016 : 0.013;
  for (let i = trailSteps; i >= 1; i--) {
    const tp = toPx(arenaStadiumPoint(u - i * trailStepU));
    const ratio = 1 - i / (trailSteps + 1);
    const sz = Math.max(4, Math.round((sprinting ? 10 : 8) * (0.45 + 0.55 * ratio)));
    ctx.globalAlpha = ratio * (sprinting ? 0.78 : 0.54);
    ctx.fillStyle = i <= 2 ? (sprinting ? '#0284c7' : '#f59e0b') : '#e5492b';
    ctx.fillRect(Math.round(tp.x - sz / 2), Math.round(tp.y - sz / 2), sz, sz);
  }
  ctx.globalAlpha = 1;

  const cur = toPx(arenaStadiumPoint(u));
  const coreSize = sprinting ? 11 : 9;
  ctx.fillStyle = '#1a1a18';
  ctx.fillRect(Math.round(cur.x - coreSize / 2) - 2, Math.round(cur.y - coreSize / 2) - 2, coreSize + 4, coreSize + 4);
  ctx.fillStyle = sprinting ? '#0284c7' : '#e5492b';
  ctx.fillRect(Math.round(cur.x - coreSize / 2), Math.round(cur.y - coreSize / 2), coreSize, coreSize);

  if (sprinting) {
    const sp = (nowMs - arenaSprintStart) / Math.max(1, arenaSprintUntil - arenaSprintStart);
    if (sp > 0.84) {
      const fin = toPx({ x: 230, y: 166 });
      const rad = (sp - 0.84) / 0.16 * 34;
      ctx.strokeStyle = 'rgba(255, 208, 38, ' + (1 - (sp - 0.84) / 0.16).toFixed(2) + ')';
      ctx.lineWidth = 2;
      ctx.strokeRect(Math.round(fin.x - rad), Math.round(fin.y - rad), Math.round(rad * 2), Math.round(rad * 2));
    }
  }
}

function drawComboParticlesCanvas(canvas, nowMs) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.clientWidth || 320, h = canvas.clientHeight || 96;
  if (!w || !h) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const bw = Math.round(w * dpr), bh = Math.round(h * dpr);
  if (canvas.width !== bw || canvas.height !== bh) { canvas.width = bw; canvas.height = bh; }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, w, h);

  const tier = Number(canvas.closest('[data-combo-tier]')?.dataset.comboTier || 0);
  const isPaused = document.body.classList.contains('motion-paused') || (typeof reducedMotion !== 'undefined' && reducedMotion.matches);
  const count = tier <= 0 ? 6 : (8 + tier * 5);
  const colors = tier >= 5 ? ['#38bdf8', '#ffd026', '#fffbe0', '#ff5a2f']
    : tier >= 3 ? ['#38bdf8', '#ff6b3d', '#ffd026']
    : tier >= 1 ? ['#ff6b3d', '#ffd026']
    : ['rgba(148,163,184,0.65)', 'rgba(56,189,248,0.55)'];
  const t = isPaused ? 1.2 : nowMs * 0.001;
  for (let i = 0; i < count; i++) {
    const seed = (i * 1.618) % 1;
    const x = ((seed * w * 1.13 + Math.sin(t * 0.9 + i) * 14) % w + w) % w;
    const y = (((h - ((t * (18 + (i % 4) * 7) + i * 29) % (h + 16))) + h) % h);
    const sz = (tier >= 3 && i % 4 === 0) ? 4 : 3;
    ctx.globalAlpha = 0.25 + 0.5 * Math.abs(Math.sin(t * 1.7 + i));
    ctx.fillStyle = colors[i % colors.length];
    ctx.fillRect(Math.round(x / 3) * 3, Math.round(y / 3) * 3, sz, sz);
  }
  ctx.globalAlpha = 1;
}

function updateFeedbackSyncStatus() {
  const retry = $('.fb-retry-btn');
  if (!retry) return;
  const operation = roomPendingOps().find(op => op.operationId === retry.dataset.value);
  const status = syncStatusMeta(operation ? operation.status : 'synced');
  const pill = $('.fb-card .ck-sync-pill');
  const detail = $('.fb-card .fb-sync-detail');
  if (!pill || !detail) return;
  pill.className = 'ck-sync-pill is-' + status.key;
  pill.textContent = status.label;
  detail.className = 'fb-sync-detail is-' + status.key;
  detail.textContent = operation?.lastError || status.detail;
  const stage = $('#fb-stage-tag');
  if (stage?.textContent.startsWith('保存状态')) stage.textContent = '保存状态：' + status.label;
  if (!operation) {
    if (document.activeElement === retry) $('.fb-go-wall')?.focus();
    retry.remove();
  }
}

function triggerCheckinFeedback(opts) {
  const root = $('#feedback-root');
  if (!root) return;
  if (feedbackClearTimer) { clearTimeout(feedbackClearTimer); feedbackClearTimer = 0; }
  if (feedbackAnimId) { cancelAnimationFrame(feedbackAnimId); feedbackAnimId = 0; }

  const isPaused = document.body.classList.contains('motion-paused') || (typeof reducedMotion !== 'undefined' && reducedMotion.matches);
  const isStudy = opts.mode === 'study';
  const targetNum = parseFloat(opts.value) || 0;
  const decimals = String(opts.value).includes('.') ? String(opts.value).split('.')[1].length : 0;
  const comboDays = dualStreak(opts.person || state.name);
  const stampLabel = opts.goalHit ? 'GOAL CLEARED' : (isStudy ? 'STUDY VERIFIED' : 'RUN VERIFIED');

  const syncMeta = syncStatusMeta(opts.syncStatus || (isServerOnline ? 'synced' : 'local'));
  const needsRetry = syncMeta.key === 'failed' || syncMeta.key === 'local' || syncMeta.key === 'pending';
  const syncGuidance = syncMeta.key === 'synced'
    ? (opts.localSaved === false ? '已同步至服务器，但本机副本写入失败（建议清理浏览器空间或导出备份）。' : '已同步至服务器，可在记录页查看。')
    : syncMeta.key === 'failed'
      ? ('同步失败：' + (opts.syncError || '服务器未响应') + '。记录已保留在本机，可点击「重试同步」。')
      : syncMeta.key === 'pending'
        ? '记录已存本机，正在等待同步，可点击「重试同步」。'
        : '离线已保存在本机浏览器，恢复网络后点击「重试同步」即可上传。';

  const prevFbFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const prevFbSelector = opts.returnFocusSelector || buildStableFocusSelector(prevFbFocus);
  const recDate = opts.date || today();
  root.innerHTML = '<div class="fb-backdrop">'
    + '<article class="fb-card ' + (isStudy ? 'is-study' : 'is-sport') + (isPaused ? ' is-instant' : '') + '" role="' + (syncMeta.key === 'failed' ? 'alert' : 'status') + '" aria-label="打卡完成小票">'
    + '<canvas class="fb-particle-canvas" aria-hidden="true"></canvas>'
    + '<div class="fb-top"><span class="slash-chip">' + (isStudy ? '学习小票' : '运动小票') + '</span><span class="ck-sync-pill is-' + syncMeta.key + '">' + syncMeta.label + '</span><button type="button" class="fb-close" aria-label="关闭小票"><span aria-hidden="true">×</span></button></div>'
    + '<div class="fb-score-wrap"><strong id="fb-score-num">' + (isPaused ? esc(opts.value) : (0).toFixed(decimals)) + '</strong><em>' + esc(opts.unit) + '</em></div>'
    + '<div class="fb-sub"><span>' + esc(recDate) + '</span><span>·</span><span>' + esc(opts.person) + '</span><span>·</span><span>' + esc(opts.title) + '</span><span>·</span><b>COMBO ×' + comboDays + '</b></div>'
    + '<div class="fb-stage-tag" id="fb-stage-tag">保存状态：' + esc(syncMeta.label) + (opts.localSaved === false && syncMeta.key === 'synced' ? '（本机未写入）' : '') + '</div>'
    + '<div class="fb-sync-detail is-' + syncMeta.key + (opts.localSaved === false && syncMeta.key === 'synced' ? ' is-local-warn' : '') + '">' + esc(syncGuidance) + '</div>'
    + '<div class="fb-stamp' + (isPaused ? ' is-stamped' : '') + '" id="fb-stamp">' + stampLabel + ' ✓</div>'
    + '<div class="fb-actions">'
    + (needsRetry && opts.operationId ? '<button type="button" class="fb-retry-btn" data-action="retry-sync" data-value="' + esc(opts.operationId) + '">重试同步</button>' : '')
    + '<button type="button" class="fb-again">再记一次</button>'
    + '<button type="button" class="fb-go-wall" data-action="open-record" data-value="' + esc(opts.recordKey || '') + '">查看记录 →</button></div>'
    + '</article></div>';

  const scoreEl = $('#fb-score-num', root);
  const stampEl = $('#fb-stamp', root);
  const pCanvas = $('.fb-particle-canvas', root);
  const closeBtn = $('.fb-close', root);
  const wallBtn = $('.fb-go-wall', root);
  const againBtn = $('.fb-again', root);
  const retryBtn = $('.fb-retry-btn', root);
  const backdropEl = $('.fb-backdrop', root);

  const onFbKeydown = ev => {
    if (ev.key === 'Escape') {
      ev.preventDefault();
      dismiss();
    }
  };
  const dismiss = (dismissOpts = {}) => {
    const restoreFocus = dismissOpts.restoreFocus !== false;
    document.removeEventListener('keydown', onFbKeydown);
    if (feedbackClearTimer) { clearTimeout(feedbackClearTimer); feedbackClearTimer = 0; }
    if (feedbackAnimId) { cancelAnimationFrame(feedbackAnimId); feedbackAnimId = 0; }
    root.innerHTML = '';
    if (!restoreFocus) return;
    if (opts.returnFocusSelector) {
      restoreFocusBySelector(prevFbSelector);
    } else if (prevFbFocus && prevFbFocus.isConnected && prevFbFocus !== document.body) {
      prevFbFocus.focus({ preventScroll: true });
    } else if (prevFbSelector) {
      restoreFocusBySelector(prevFbSelector);
    }
  };
  document.addEventListener('keydown', onFbKeydown);
  if (backdropEl) backdropEl.addEventListener('click', ev => { if (ev.target === backdropEl) dismiss(); });
  if (closeBtn) {
    closeBtn.addEventListener('click', () => dismiss());
  }
  if (wallBtn) {
    wallBtn.addEventListener('click', () => dismiss({ restoreFocus: false }));
    wallBtn.focus({ preventScroll: true });
  } else if (closeBtn) {
    closeBtn.focus({ preventScroll: true });
  }
  if (againBtn) {
    againBtn.addEventListener('click', () => {
      dismiss({ restoreFocus: false });
      openCheckin(opts.mode, null, opts.person);
    });
  }
  if (retryBtn) retryBtn.addEventListener('click', () => dismiss({ restoreFocus: false }));

  if (isPaused) return;

  const parts = Array.from({ length: 24 }, (_, i) => {
    const ang = (i / 24) * Math.PI * 2 + (Math.random() - 0.5) * 0.22;
    const dist = 68 + Math.random() * 54;
    return {
      ang, dist,
      sz: i % 3 === 0 ? 5 : 4,
      clr: isStudy ? (i % 3 === 0 ? '#1a1a18' : i % 2 === 0 ? '#203f91' : '#4a6fd4') : (i % 3 === 0 ? '#1a1a18' : i % 2 === 0 ? '#e5492b' : '#e4a334')
    };
  });

  const t0 = performance.now();
  const stepFb = now => {
    if (!root.firstElementChild) return;
    const elapsed = now - t0;
    const p1 = Math.min(1, elapsed / 380);
    const eased1 = 1 - Math.pow(1 - p1, 3);
    if (scoreEl) scoreEl.textContent = p1 >= 1 ? opts.value : (targetNum * eased1).toFixed(decimals);

    if (pCanvas && pCanvas.getContext) {
      const ctx = pCanvas.getContext('2d');
      const cw = pCanvas.clientWidth || 340, ch = pCanvas.clientHeight || 240;
      if (pCanvas.width !== cw || pCanvas.height !== ch) { pCanvas.width = cw; pCanvas.height = ch; }
      ctx.clearRect(0, 0, cw, ch);
      if (elapsed <= 520) {
        const p2 = Math.min(1, elapsed / 520);
        const cx = cw * 0.5, cy = ch * 0.34;
        parts.forEach(pt => {
          const r = pt.dist * (0.2 + 0.8 * (1 - Math.pow(1 - p2, 2)));
          const x = cx + Math.cos(pt.ang) * r;
          const y = cy + Math.sin(pt.ang) * r * 0.55;
          ctx.globalAlpha = Math.max(0, (1 - p2) * 0.8);
          ctx.fillStyle = pt.clr;
          ctx.fillRect(Math.round(x / 4) * 4, Math.round(y / 4) * 4, pt.sz, pt.sz);
        });
        ctx.globalAlpha = 1;
      }
    }

    if (elapsed >= 220 && stampEl && !stampEl.classList.contains('is-stamped')) {
      stampEl.classList.add('is-stamped');
    }

    if (elapsed < 560) {
      feedbackAnimId = requestAnimationFrame(stepFb);
    } else {
      if (scoreEl) scoreEl.textContent = opts.value;
      if (stampEl) stampEl.classList.add('is-stamped');
      if (pCanvas && pCanvas.getContext) pCanvas.getContext('2d').clearRect(0, 0, pCanvas.width, pCanvas.height);
      feedbackAnimId = 0;
    }
  };
  feedbackAnimId = requestAnimationFrame(stepFb);
}

function initPixelMatrices() {
  [...document.querySelectorAll('.poster-hero')].forEach(hero => {
    if (!hero.querySelector('.pixel-matrix-canvas')) {
      const c = document.createElement('canvas');
      c.className = 'pixel-matrix-canvas';
      c.dataset.pixelTheme = hero.classList.contains('poster-flame') ? 'flame'
        : hero.classList.contains('poster-lightning') ? 'lightning'
        : hero.classList.contains('poster-storm') ? 'storm'
        : hero.classList.contains('poster-frost') ? 'frost'
        : hero.classList.contains('poster-orange') ? 'orange'
        : hero.classList.contains('poster-black') ? 'black'
        : 'blue';
      c.setAttribute('aria-hidden', 'true');
      hero.prepend(c);
    }
  });
  [...document.querySelectorAll('.pixel-matrix-canvas')].forEach(c => drawPixelMatrix(c, pixelPhase));
  const nowDraw = performance.now();
  [...document.querySelectorAll('.arena-fx-canvas')].forEach(c => drawArenaCanvas(c, nowDraw));
  [...document.querySelectorAll('.combo-particles-canvas')].forEach(c => drawComboParticlesCanvas(c, nowDraw));
  requestAnimationFrame(() => {
    const n2 = performance.now();
    [...document.querySelectorAll('.pixel-matrix-canvas')].forEach(c => drawPixelMatrix(c, pixelPhase));
    [...document.querySelectorAll('.arena-fx-canvas')].forEach(c => drawArenaCanvas(c, n2));
    [...document.querySelectorAll('.combo-particles-canvas')].forEach(c => drawComboParticlesCanvas(c, n2));
  });
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
    const arenaCanvases = [...document.querySelectorAll('.arena-fx-canvas')];
    const comboCanvases = [...document.querySelectorAll('.combo-particles-canvas')];
    const nowLoop = performance.now();
    const hasSprint = nowLoop < arenaSprintUntil;
    const hasActiveLightning = nowLoop < lightningSurgeUntil || canvases.some(c => c._lightningState && c._lightningState.active);
    const hasActiveFlameSurge = nowLoop < flameSurgeUntil;
    const hasStorm = canvases.some(c => c.dataset.pixelTheme === 'storm');
    const hasFrost = canvases.some(c => c.dataset.pixelTheme === 'frost');
    const hasActiveStormSurge = nowLoop < stormSurgeUntil || canvases.some(c => c._stormState && c._stormState.arcs.length > 0);
    const hasActiveFrostSurge = nowLoop < frostSurgeUntil || canvases.some(c => c._frostState && c._frostState.mode === 'freeze');
    const hasFlame = canvases.some(c => c.dataset.pixelTheme === 'flame');
    const minInterval = (hasActiveLightning || hasSprint || hasActiveStormSurge || hasActiveFrostSurge) ? 16 : (hasActiveFlameSurge || hasStorm || hasFrost) ? 22 : (hasFlame || arenaCanvases.length) ? 33 : 55;
    if (ts - lastDraw >= minInterval) {
      pixelPhase += hasActiveLightning ? 0.035 : hasFrost ? 0.092 : (hasFlame || hasStorm) ? 0.072 : 0.11;
      canvases.forEach(c => { const r = c.getBoundingClientRect(); if (r.width && r.height && r.bottom >= -40 && r.top <= window.innerHeight + 40) drawPixelMatrix(c, pixelPhase); });
      arenaCanvases.forEach(c => { const r = c.getBoundingClientRect(); if (r.width && r.height && r.bottom >= -40 && r.top <= window.innerHeight + 40) drawArenaCanvas(c, nowLoop); });
      comboCanvases.forEach(c => { const r = c.getBoundingClientRect(); if (r.width && r.height && r.bottom >= -40 && r.top <= window.innerHeight + 40) drawComboParticlesCanvas(c, nowLoop); });
      lastDraw = ts;
    }
    pixelFrameId = requestAnimationFrame(stepFrame);
  };
  pixelFrameId = requestAnimationFrame(stepFrame);
}

let motionPaused = false;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
function syncMotion() {
  const stopped = motionPaused || reducedMotion.matches || document.hidden;
  document.body.classList.toggle('motion-paused', stopped);
  const motionButtons = [...document.querySelectorAll('#motion-toggle, [data-action="toggle-motion"]')];
  const labelText = reducedMotion.matches ? '跟随系统：减少动效' : motionPaused ? '开启动效 ▶' : '暂停动效 Ⅱ';
  motionButtons.forEach(btn => {
    btn.setAttribute('aria-pressed', String(stopped));
    btn.textContent = labelText;
    delete btn.dataset.staggered;
    btn.disabled = reducedMotion.matches;
  });
  const motionStateEl = $('#ck-settings-motion-state');
  if (motionStateEl) {
    motionStateEl.textContent = reducedMotion.matches ? '已跟随系统减少动态效果' : (motionPaused ? '已暂停动效' : '动效运行中');
  }
  enhanceTextStagger();
  clearInterval(quoteTimer);
  if (!stopped && view === 'home') quoteTimer = setInterval(nextQuote, 7000);
  if (stopped) { stopPixelLoop(); const np = performance.now(); [...document.querySelectorAll('.pixel-matrix-canvas')].forEach(c => drawPixelMatrix(c, pixelPhase)); [...document.querySelectorAll('.arena-fx-canvas')].forEach(c => drawArenaCanvas(c, np)); [...document.querySelectorAll('.combo-particles-canvas')].forEach(c => drawComboParticlesCanvas(c, np)); } else startPixelLoop();
}
$('.bottom-nav')?.addEventListener('keydown', e => {
  const btns = [...document.querySelectorAll('.bottom-nav .ck-nav-btn')];
  const idx = btns.indexOf(document.activeElement);
  if (idx === -1 || !btns.length) return;
  let nextIdx = -1;
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextIdx = (idx + 1) % btns.length;
  else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') nextIdx = (idx - 1 + btns.length) % btns.length;
  else if (e.key === 'Home') nextIdx = 0;
  else if (e.key === 'End') nextIdx = btns.length - 1;
  if (nextIdx >= 0) {
    e.preventDefault();
    btns[nextIdx].focus();
  }
});
reducedMotion.addEventListener('change', syncMotion);
document.addEventListener('visibilitychange', syncMotion);
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
  step = 0;
  draft.km = 6.4;
  drawModal();
} else if (checkinParam === 'study') {
  openCheckin('study');
}

// Online/Offline recovery listeners (guarded against embedded/demo iframe)
if (!embedded && !demo && typeof window !== 'undefined') {
  window.addEventListener('offline', () => {
    isServerOnline = false;
    if (sseSource) { try { sseSource.close(); } catch {} sseSource = null; }
    render(true);
  });
  window.addEventListener('online', async () => {
    const ok = await checkServerHealth();
    isServerOnline = !!ok;
    if (isServerOnline) {
      await flushPendingOps();
      updateFeedbackSyncStatus();
      initSSE();
    }
    render(true);
  });
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
        state = mergeRemoteState(remoteState);
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
