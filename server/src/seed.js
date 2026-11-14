const pad = n => String(n).padStart(2, '0');
const chinaNow = () => new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }));
const dateKey = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const dateShift = n => { const d = chinaNow(); d.setDate(d.getDate() + n); return dateKey(d); };
const today = () => dateKey(chinaNow());

const DEFAULT_MEMBERS = ['林舟', '陈默', '苏晴'];

function seedRoom(db, roomCode = 'default') {
  const existing = db.prepare('SELECT code FROM rooms WHERE code = ?').get(roomCode);
  if (existing) return;

  const nowIso = new Date().toISOString();
  db.prepare(`
    INSERT INTO rooms (code, name, goal, days, study_goal, study_days, members, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    roomCode,
    '帅哥',
    245,
    JSON.stringify([1, 2, 6, 0]),
    120,
    JSON.stringify([1, 2, 3, 4, 5, 6]),
    JSON.stringify(DEFAULT_MEMBERS),
    nowIso,
    nowIso
  );

  const defaultTargets = [
    { id: 'st-1', title: '专业核心课精读与笔记', category: '深度阅读', target_hours: 45, done_hours: 18.5, color: '#203f91', deadline: '本月', sort_order: 1 },
    { id: 'st-2', title: '算法题与代码实战训练', category: '编程实践', target_hours: 35, done_hours: 14.0, color: '#e5492b', deadline: '本月', sort_order: 2 },
    { id: 'st-3', title: '英语听力精听与口语复述', category: '语言能力', target_hours: 25, done_hours: 10.5, color: '#0f766e', deadline: '本月', sort_order: 3 },
    { id: 'st-4', title: '复盘输出与错题本整理', category: '知识内化', target_hours: 15, done_hours: 6.0, color: '#c27803', deadline: '本月', sort_order: 4 }
  ];
  const insertTarget = db.prepare(`
    INSERT INTO study_targets (id, room_code, title, category, target_hours, done_hours, color, deadline, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const t of defaultTargets) {
    insertTarget.run(t.id, roomCode, t.title, t.category, t.target_hours, t.done_hours, t.color, t.deadline, t.sort_order);
  }

  const defaultHabits = [
    { id: 'hb-1', title: '06:30 前起床离开被窝', tag: '作息', icon: 'sunrise', sort_order: 1 },
    { id: 'hb-2', title: '手机专注隔离 ≥ 2 小时', tag: '戒断', icon: 'bolt', sort_order: 2 },
    { id: 'hb-3', title: '完成运动或学习任一核心打卡', tag: '行动', icon: 'target', sort_order: 3 },
    { id: 'hb-4', title: '23:30 前入睡 + 今日复盘', tag: '复盘', icon: 'moon', sort_order: 4 }
  ];
  const insertHabit = db.prepare(`
    INSERT INTO habits (id, room_code, title, tag, icon, sort_order)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  for (const h of defaultHabits) {
    insertHabit.run(h.id, roomCode, h.title, h.tag, h.icon, h.sort_order);
  }

  const initialSportRecords = [
    { id: 1004, person: '帅哥', date: dateShift(-1), time: '06:10', km: 21.1, minutes: 120, feel: 4, note: '再多跑一步，风景就不一样。', tags: ['操场'], likes: 2 },
    { id: 1003, person: '帅哥', date: dateShift(-2), time: '06:20', km: 10.0, minutes: 57, feel: 3, note: '十公里，刚刚好。', tags: ['公园'], likes: 1 },
    { id: 1002, person: '帅哥', date: dateShift(-4), time: '06:05', km: 28.5, minutes: 165, feel: 0, note: '长距离慢慢跑。', tags: ['和室友一起'], likes: 1 },
    { id: 1001, person: '帅哥', date: dateShift(-6), time: '06:15', km: 6.4, minutes: 38, feel: 4, note: '早起的人，先看见太阳。', tags: ['操场'], likes: 1 },
    // 林舟
    { id: 3001, person: '林舟', date: dateShift(-7), time: '06:15', km: 12.0, minutes: 66, feel: 3, note: '新一周开跑，呼吸节奏很稳。', tags: ['操场'], likes: 1 },
    { id: 3002, person: '林舟', date: dateShift(-5), time: '06:12', km: 15.2, minutes: 82, feel: 4, note: '五公里后进入巡航状态。', tags: ['公园', '和室友一起'], likes: 2 },
    { id: 3003, person: '林舟', date: dateShift(-3), time: '06:08', km: 18.0, minutes: 96, feel: 4, note: '微风凉爽，配速突破 5′20″。', tags: ['操场'], likes: 2 },
    { id: 3004, person: '林舟', date: dateShift(-1), time: '06:10', km: 16.5, minutes: 88, feel: 3, note: '保持月榜竞争节奏，绝不松懈。', tags: ['公园'], likes: 1 },
    { id: 3005, person: '林舟', date: today(), time: '06:14', km: 10.5, minutes: 55, feel: 4, note: '清晨操场十公里，今天先拔头筹！', tags: ['操场'], likes: 3 },
    // 陈默
    { id: 3101, person: '陈默', date: dateShift(-8), time: '06:30', km: 8.5, minutes: 48, feel: 3, note: '热身到位，小步高频跑完。', tags: ['公园'], likes: 1 },
    { id: 3102, person: '陈默', date: dateShift(-6), time: '06:22', km: 14.0, minutes: 79, feel: 3, note: '雨后跑道干净，体感舒服。', tags: ['降温'], likes: 1 },
    { id: 3103, person: '陈默', date: dateShift(-4), time: '06:18', km: 12.5, minutes: 70, feel: 4, note: '和大家同榜竞争，动力满满。', tags: ['和室友一起'], likes: 2 },
    { id: 3104, person: '陈默', date: dateShift(-2), time: '06:16', km: 16.0, minutes: 89, feel: 3, note: '最后两公里加速收尾。', tags: ['间歇跑'], likes: 1 },
    // 苏晴
    { id: 3201, person: '苏晴', date: dateShift(-7), time: '06:40', km: 7.5, minutes: 44, feel: 4, note: '晨光微亮就出门，今天心情超好。', tags: ['公园'], likes: 2 },
    { id: 3202, person: '苏晴', date: dateShift(-5), time: '06:35', km: 10.2, minutes: 59, feel: 3, note: '稳定跑完十公里。', tags: ['恢复跑'], likes: 1 },
    { id: 3203, person: '苏晴', date: dateShift(-3), time: '06:25', km: 11.8, minutes: 68, feel: 4, note: '跑完顺便去图书馆占座！', tags: ['操场'], likes: 2 },
    { id: 3204, person: '苏晴', date: today(), time: '06:38', km: 8.2, minutes: 46, feel: 4, note: '清晨打卡完成，开启高效一天。', tags: ['操场'], likes: 2 }
  ];
  const insertSport = db.prepare(`
    INSERT INTO records_sport (id, room_code, person, date, time, km, minutes, feel, note, tags, photo, likes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const r of initialSportRecords) {
    insertSport.run(r.id, roomCode, r.person, r.date, r.time, r.km, r.minutes, r.feel, r.note, JSON.stringify(r.tags), '', r.likes, nowIso);
  }

  const initialStudyRecords = [
    { id: 2004, person: '帅哥', date: dateShift(-1), time: '08:30', hours: 2.5, minutes: 150, focus: 4, target_id: 'st-1', subject: '专业核心课精读与笔记', note: '拆解了第三章核心框架，输出 2 页思维导图。', tags: ['深度工作', '笔记'], likes: 2 },
    { id: 2003, person: '帅哥', date: dateShift(-2), time: '19:45', hours: 2.0, minutes: 120, focus: 3, target_id: 'st-2', subject: '算法题与代码实战训练', note: '独立完成 4 道动态规划中等题，边界条件理顺了。', tags: ['刷题', '番茄钟'], likes: 1 },
    { id: 2002, person: '帅哥', date: dateShift(-4), time: '09:15', hours: 1.8, minutes: 108, focus: 3, target_id: 'st-3', subject: '英语听力精听与口语复述', note: '精听两篇播客并跟读 Shadowing 30 分钟。', tags: ['早读', '无手机'], likes: 1 },
    { id: 2001, person: '帅哥', date: dateShift(-6), time: '20:30', hours: 1.5, minutes: 90, focus: 2, target_id: 'st-4', subject: '复盘输出与错题本整理', note: '整理本周错题与代码坑点，明确下周突破项。', tags: ['复盘', '图书馆'], likes: 0 },
    // 林舟
    { id: 4001, person: '林舟', date: dateShift(-7), time: '09:00', hours: 2.2, minutes: 132, focus: 3, target_id: 'st-1', subject: '专业核心课精读与笔记', note: '啃完两篇核心论文并整理框架。', tags: ['图书馆', '笔记'], likes: 1 },
    { id: 4002, person: '林舟', date: dateShift(-5), time: '14:20', hours: 2.5, minutes: 150, focus: 4, target_id: 'st-2', subject: '算法题与代码实战训练', note: '刷通图论专题五道典型题。', tags: ['刷题', '无手机'], likes: 2 },
    { id: 4003, person: '林舟', date: dateShift(-2), time: '09:30', hours: 2.8, minutes: 168, focus: 4, target_id: 'st-1', subject: '专业核心课精读与笔记', note: '闭关三小时无手机，输出完整复习卡片。', tags: ['深度工作', '番茄钟'], likes: 2 },
    { id: 4004, person: '林舟', date: today(), time: '08:50', hours: 1.5, minutes: 90, focus: 4, target_id: 'st-4', subject: '复盘输出与错题本整理', note: '早学先拿 1.5h，双轨领跑！', tags: ['早读', '复盘'], likes: 2 },
    // 陈默
    { id: 4101, person: '陈默', date: dateShift(-8), time: '19:30', hours: 2.0, minutes: 120, focus: 3, target_id: 'st-2', subject: '算法题与代码实战训练', note: '重构了旧项目的核心模块。', tags: ['刷题'], likes: 1 },
    { id: 4102, person: '陈默', date: dateShift(-6), time: '09:00', hours: 3.0, minutes: 180, focus: 4, target_id: 'st-1', subject: '专业核心课精读与笔记', note: '图书馆顶楼全神贯注三小时。', tags: ['图书馆', '深度工作'], likes: 3 },
    { id: 4103, person: '陈默', date: dateShift(-3), time: '20:00', hours: 2.6, minutes: 156, focus: 4, target_id: 'st-2', subject: '算法题与代码实战训练', note: '周赛模拟 AK 三题，复盘了边界处理。', tags: ['刷题', '复盘'], likes: 2 },
    { id: 4104, person: '陈默', date: dateShift(-1), time: '14:00', hours: 2.4, minutes: 144, focus: 3, target_id: 'st-4', subject: '复盘输出与错题本整理', note: '整理系统设计高频知识点。', tags: ['笔记', '番茄钟'], likes: 1 },
    // 苏晴
    { id: 4201, person: '苏晴', date: dateShift(-7), time: '08:15', hours: 1.8, minutes: 108, focus: 4, target_id: 'st-3', subject: '英语听力精听与口语复述', note: 'BBC 新闻听写 + 跟读打卡。', tags: ['早读', '笔记'], likes: 2 },
    { id: 4202, person: '苏晴', date: dateShift(-4), time: '19:00', hours: 2.2, minutes: 132, focus: 3, target_id: 'st-3', subject: '英语听力精听与口语复述', note: '整理学术词汇与句型库。', tags: ['无手机', '图书馆'], likes: 1 },
    { id: 4203, person: '苏晴', date: dateShift(-1), time: '08:40', hours: 2.0, minutes: 120, focus: 4, target_id: 'st-1', subject: '专业核心课精读与笔记', note: '全神贯注，心流在线两小时。', tags: ['深度工作'], likes: 2 }
  ];
  const insertStudy = db.prepare(`
    INSERT INTO records_study (id, room_code, person, date, time, hours, minutes, focus, target_id, subject, note, tags, photo, likes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const s of initialStudyRecords) {
    insertStudy.run(s.id, roomCode, s.person, s.date, s.time, s.hours, s.minutes, s.focus, s.target_id, s.subject, s.note, JSON.stringify(s.tags), '', s.likes, nowIso);
  }

  const initialHabitLogs = [
    { person: '帅哥', date: dateShift(-6), habits: ['hb-1', 'hb-2', 'hb-3'] },
    { person: '帅哥', date: dateShift(-5), habits: ['hb-1', 'hb-2', 'hb-3', 'hb-4'] },
    { person: '帅哥', date: dateShift(-4), habits: ['hb-1', 'hb-3', 'hb-4'] },
    { person: '帅哥', date: dateShift(-3), habits: ['hb-1', 'hb-2', 'hb-3'] },
    { person: '帅哥', date: dateShift(-2), habits: ['hb-1', 'hb-2', 'hb-3', 'hb-4'] },
    { person: '帅哥', date: dateShift(-1), habits: ['hb-1', 'hb-2', 'hb-3', 'hb-4'] },
    // 林舟
    { person: '林舟', date: dateShift(-6), habits: ['hb-1', 'hb-2', 'hb-3', 'hb-4'] },
    { person: '林舟', date: dateShift(-5), habits: ['hb-1', 'hb-2', 'hb-3'] },
    { person: '林舟', date: dateShift(-4), habits: ['hb-1', 'hb-2', 'hb-3', 'hb-4'] },
    { person: '林舟', date: dateShift(-3), habits: ['hb-1', 'hb-2', 'hb-3', 'hb-4'] },
    { person: '林舟', date: dateShift(-2), habits: ['hb-1', 'hb-3', 'hb-4'] },
    { person: '林舟', date: dateShift(-1), habits: ['hb-1', 'hb-2', 'hb-3', 'hb-4'] },
    { person: '林舟', date: today(), habits: ['hb-1', 'hb-2', 'hb-3'] },
    // 陈默
    { person: '陈默', date: dateShift(-6), habits: ['hb-1', 'hb-2', 'hb-3'] },
    { person: '陈默', date: dateShift(-5), habits: ['hb-2', 'hb-3', 'hb-4'] },
    { person: '陈默', date: dateShift(-4), habits: ['hb-1', 'hb-2', 'hb-3'] },
    { person: '陈默', date: dateShift(-3), habits: ['hb-1', 'hb-2', 'hb-3', 'hb-4'] },
    { person: '陈默', date: dateShift(-2), habits: ['hb-1', 'hb-3'] },
    { person: '陈默', date: dateShift(-1), habits: ['hb-1', 'hb-2', 'hb-3', 'hb-4'] },
    { person: '陈默', date: today(), habits: ['hb-1', 'hb-2'] },
    // 苏晴
    { person: '苏晴', date: dateShift(-6), habits: ['hb-1', 'hb-3', 'hb-4'] },
    { person: '苏晴', date: dateShift(-5), habits: ['hb-1', 'hb-2', 'hb-3', 'hb-4'] },
    { person: '苏晴', date: dateShift(-4), habits: ['hb-1', 'hb-2', 'hb-4'] },
    { person: '苏晴', date: dateShift(-3), habits: ['hb-1', 'hb-2', 'hb-3'] },
    { person: '苏晴', date: dateShift(-2), habits: ['hb-1', 'hb-2', 'hb-3', 'hb-4'] },
    { person: '苏晴', date: dateShift(-1), habits: ['hb-1', 'hb-2', 'hb-3', 'hb-4'] },
    { person: '苏晴', date: today(), habits: ['hb-1', 'hb-3'] }
  ];
  const insertHabitLog = db.prepare(`
    INSERT INTO habit_logs (room_code, person, date, habit_ids)
    VALUES (?, ?, ?, ?)
  `);
  for (const hl of initialHabitLogs) {
    insertHabitLog.run(roomCode, hl.person, hl.date, JSON.stringify(hl.habits));
  }
}

module.exports = { seedRoom, DEFAULT_MEMBERS, today, dateShift, chinaNow };
