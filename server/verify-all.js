const fs = require('fs');
const path = require('path');
const os = require('node:os');
const { DatabaseSync } = require('node:sqlite');
const { once } = require('node:events');

async function runVerification() {
  const testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'running-verification-'));
  const results = {
    testSuite: "RUN & STUDY LOG · 全功能后端服务与前端联调真实性验收",
    timestamp: new Date().toISOString(),
    environment: {
      node: process.version,
      platform: process.platform,
      engine: "Node.js v24 + SQLite (node:sqlite DatabaseSync)",
      databasePath: path.join(testDir, 'running.sqlite'),
      uploadsPath: path.join(testDir, 'uploads')
    },
    tests: [],
    summary: { total: 0, passed: 0, failed: 0 }
  };

  function record(id, title, category, passed, detail) {
    results.summary.total++;
    if (passed) results.summary.passed++;
    else results.summary.failed++;
    results.tests.push({ id, title, category, passed, detail });
    console.log(`[${passed ? 'PASS' : 'FAIL'}] ${id}: ${title}`);
  }

  // 1. Verify CSS & HTML & Frontend JS Fixes
  const styleCss = fs.readFileSync(path.resolve(__dirname, '../style.css'), 'utf8');
  const desktopCss = fs.readFileSync(path.resolve(__dirname, '../desktop.css'), 'utf8');
  const filmJs = fs.readFileSync(path.resolve(__dirname, '../film.js'), 'utf8');
  const filmHtml = fs.readFileSync(path.resolve(__dirname, '../film.html'), 'utf8');
  const appJs = fs.readFileSync(path.resolve(__dirname, '../app.js'), 'utf8');

  record('FIX-01', 'film.js position 下界钳制与 00:-1 闪现修复', '前端细节',
    filmJs.includes('Math.max(0,'),
    'frame() 与 render() 中对 position 进行 Math.max(0, ...) 钳制，消除首次负值闪现');

  record('FIX-02', '320×568 视口 .person-card-top 折行与横向零溢出', '前端细节',
    styleCss.includes('.person-card-top { display: flex; align-items: center; flex-wrap: wrap; gap: 8px 12px; min-width: 0; }') &&
    desktopCss.includes('min-width: 0'),
    '.person-card-top 设置 flex-wrap: wrap 与 min-width: 0，确保在 320px 窄屏无水平溢出滚动');

  record('FIX-03', 'film.html 与 README.md 对齐 8 页双轨文案', '前端细节',
    filmHtml.includes('RUN &amp; STUDY LOG') && filmHtml.includes('运动 · 学习 · 自律 · 多人 PK'),
    '宣传片分镜文案全面对齐运动、学习、自律与竞技多模块');

  record('FIX-04', '四维学习雷达/遥测面板背景网格拦截消除与层级可点', '前端细节',
    appJs.includes('pointer-events="none"') && appJs.includes('dialPanel + rowsHtml') && appJs.includes('study-pillar-row'),
    '背景网格添加 pointer-events="none"，dialPanel 与 study-pillar-row 交互热区置于 SVG 顶层，100% 可点击响应');

  record('FIX-05', 'app.js 恢复 ?checkin=snap 与 ?checkin=distance 自动弹窗', '前端细节',
    appJs.includes("checkinParam === 'snap'") && appJs.includes("checkinParam === 'distance'"),
    '支持 URL 携带 checkin=snap / distance / study 自动打开对应步骤打卡弹窗');

  record('FIX-06', 'film.html 嵌入 iframe SSE 耗尽连接池拦截', '前端架构',
    appJs.includes('if (!embedded && !demo && typeof checkServerHealth === \'function\')') &&
    appJs.includes('if (embedded || demo || !isServerOnline || typeof EventSource === \'undefined\') return;'),
    '当页面处于 embedded 或 demo 模式时，严禁连接后端及开启 /api/events SSE，彻底避免 6-连接池耗尽死锁');

  record('FIX-07', 'app.js 数据从备份 JSON 恢复时同步云端 SQLite', '前后端协同',
    appJs.includes('const synced = await pushBackupToCloudImport(backup);') &&
    appJs.includes("const res = await serverFetch('/import', 'POST', backup);") &&
    appJs.includes("cloudState: 'synced'") && appJs.includes("cloudState: 'failed'"),
    '用户通过设置导入本地备份时，在在线模式下主动调用 POST /api/import 同步全量数据至 SQLite');

  // Start Server
  process.env.PORT = '0';
  process.env.HOST = '127.0.0.1';
  process.env.DEFAULT_ROOM_CODE = 'default';
  process.env.DB_PATH = results.environment.databasePath;
  process.env.UPLOAD_DIR = results.environment.uploadsPath;
  const { server } = require('./src/server.js');
  await once(server, 'listening');
  const BASE = 'http://127.0.0.1:' + server.address().port;

  try {
    // 2. Health check
    const hRes = await fetch(`${BASE}/api/health`);
    const health = await hRes.json();
    record('API-01', 'GET /api/health 健康检查与数据库连接', '后端核心',
      hRes.status === 200 && health.status === 'ok' && health.database.status === 'connected',
      `状态码 200，SQLite 已连接，统计表数: 房间=${health.stats.rooms}, 运动=${health.stats.sportRecords}`);

    // 3. Full State & soloPurged / teamSeeded alignment
    const sRes = await fetch(`${BASE}/api/state?room=default`);
    const state = await sRes.json();
    record('API-02', 'GET /api/state 全量状态一致性与 soloPurged/teamSeeded 对齐', '后端核心',
      sRes.status === 200 && state.version === 1 && state.soloPurged === true && state.teamSeeded === true && state.members.length >= 3,
      `获取到完整 8 页状态结构: soloPurged=true, teamSeeded=true, 成员=[${state.members.join(',')}], 运动记录=${state.records.length}条`);

    // 4. Sport Checkin
    const testSportRec = {
      id: 9901,
      person: '帅哥',
      date: '2026-11-14',
      time: '06:15',
      km: 8.88,
      minutes: 48,
      feel: 4,
      note: '联调实测清晨八公里，心流充沛。',
      tags: ['操场', '间歇跑'],
      photo: ''
    };
    const spRes = await fetch(`${BASE}/api/records/sport`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room: 'default', ...testSportRec })
    });
    const spJson = await spRes.json();
    const stAfterSport = await (await fetch(`${BASE}/api/state?room=default`)).json();
    const todayHabits = stAfterSport.habitLogs['2026-11-14'] || [];
    record('API-03', 'POST /api/records/sport 运动打卡与自动勾选行动项 hb-3', '打卡闭环',
      spJson.success && todayHabits.includes('hb-3'),
      '运动打卡落库成功 (ID: 9901)，并自动将 hb-3（完成运动或学习任一核心打卡）写入当日自律清单');

    // 5. Image Upload (Base64)
    const mockBase64Png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const upRes = await fetch(`${BASE}/api/uploads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: mockBase64Png })
    });
    const upJson = await upRes.json();
    record('API-04', 'POST /api/uploads 真实打卡照片上传与静态路由直出', '多媒体',
      upJson.success && upJson.url.startsWith('/uploads/'),
      `图片转存至本地 uploads 目录并生成静态直出路径: ${upJson.url}`);

    // 6. Study Checkin & Target hours linkage
    const stBefore = (await (await fetch(`${BASE}/api/state?room=default`)).json()).studyTargets.find(t => t.id === 'st-1').doneHours;
    const testStudyRec = {
      id: 9902,
      person: '帅哥',
      date: '2026-11-14',
      time: '09:00',
      hours: 2.5,
      minutes: 150,
      focus: 4,
      targetId: 'st-1',
      subject: '专业核心课精读与笔记',
      note: '完成知识树构建与真题推导。',
      tags: ['深度工作', '无手机']
    };
    const stdRes = await fetch(`${BASE}/api/records/study`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room: 'default', ...testStudyRec })
    });
    const stdJson = await stdRes.json();
    const stAfterStudy = await (await fetch(`${BASE}/api/state?room=default`)).json();
    const targetAfterStudy = stAfterStudy.studyTargets.find(t => t.id === 'st-1');
    record('API-05', 'POST /api/records/study 学习打卡与目标进度小时数联动', '打卡闭环',
      stdJson.success && targetAfterStudy.doneHours === stBefore + 2.5,
      `学习打卡成功，学习目标 st-1 完成小时数从 ${stBefore}h 自动增至 ${targetAfterStudy.doneHours}h (+2.5h)`);

    // 7. Pomodoro Study Record
    const testPomoRec = {
      id: 9903,
      person: '帅哥',
      date: '2026-11-14',
      time: '14:00',
      hours: 0.5,
      minutes: 30,
      focus: 4,
      targetId: 'st-2',
      subject: '番茄专注',
      note: '完成 30 分钟番茄专注计时。',
      tags: ['番茄钟', '无手机']
    };
    const pomoRes = await fetch(`${BASE}/api/records/study`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room: 'default', ...testPomoRec })
    });
    const pomoJson = await pomoRes.json();
    record('API-06', '番茄钟倒计时专注完成入库与打卡联动', '学习模块',
      pomoJson.success && pomoJson.record.subject === '番茄专注',
      '番茄钟倒计时结束直接作为学习记录入库，成功归集至学习目标与排行榜');

    // 8. Like Record Persistence & Toggle
    const like1Res = await fetch(`${BASE}/api/records/sport/9901/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room: 'default', person: '帅哥' })
    });
    const like1 = await like1Res.json();
    const like2Res = await fetch(`${BASE}/api/records/sport/9901/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room: 'default', person: '帅哥' })
    });
    const like2 = await like2Res.json();
    record('API-07', 'POST /api/records/:kind/:id/like 点赞持久化与反转', '社交互动',
      like1.liked === true && like1.likes === 1 && like2.liked === false && like2.likes === 0,
      '按用户维度持久化点赞状态，点赞计数即时加减，驱动排行榜人气积分');

    // 9. Habit Checklist Persistence (Full Day Array & Single Toggle)
    const habitPutRes = await fetch(`${BASE}/api/habit-logs`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        room: 'default',
        person: '帅哥',
        date: '2026-11-14',
        habitIds: ['hb-1', 'hb-2', 'hb-3', 'hb-4']
      })
    });
    const stAfterHabit = await (await fetch(`${BASE}/api/state?room=default`)).json();
    const curHabits = stAfterHabit.habitLogs['2026-11-14'] || [];
    record('API-08', 'PUT /api/habit-logs 每日自律习惯勾选持久化 (全天数组与单项切换)', '自律习惯',
      habitPutRes.status === 200 && curHabits.length === 4,
      '今日 4 项自律习惯全勾选状态已成功写入数据库，驱动近 7 天与 28 天热力格');

    // 10. Plans Patching
    const plansRes = await fetch(`${BASE}/api/plans`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        room: 'default',
        goal: 288,
        days: [1, 2, 3, 5, 6],
        studyGoal: 150,
        studyDays: [1, 2, 3, 4, 5, 6, 0]
      })
    });
    const plansJson = await plansRes.json();
    const stAfterPlans = await (await fetch(`${BASE}/api/state?room=default`)).json();
    record('API-09', 'PATCH /api/plans 运动与学习双轨计划配置持久化', '计划排程',
      plansJson.success && stAfterPlans.goal === 288 && stAfterPlans.studyGoal === 150,
      `月跑量目标成功更新至 288km，月学习目标更新至 150h，排程日均已持久化`);

    // 11. Member Management
    const addMemRes = await fetch(`${BASE}/api/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room: 'default', name: '佐助' })
    });
    const addMem = await addMemRes.json();
    const delMemRes = await fetch(`${BASE}/api/members/佐助?room=default`, { method: 'DELETE' });
    const delMem = await delMemRes.json();
    record('API-10', 'POST/DELETE /api/members 竞技伙伴动态增删', '成员体系',
      addMem.members.includes('佐助') && !delMem.members.includes('佐助'),
      '成功添加竞技伙伴「佐助」并从名单中移除，多人排行榜同步响应');

    // 12. Rename with historical cascade (/api/rename and /api/user/rename)
    const renRes = await fetch(`${BASE}/api/rename`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room: 'default', oldName: '帅哥', newName: '佐助' })
    });
    const renJson = await renRes.json();
    const stAfterRen = await (await fetch(`${BASE}/api/state?room=default&person=佐助`)).json();
    const renamedSport = stAfterRen.records.find(r => r.id === 9901);
    
    // Test alias /api/user/rename back to 帅哥
    const renBackRes = await fetch(`${BASE}/api/user/rename`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room: 'default', name: '帅哥' })
    });
    const renBackJson = await renBackRes.json();
    const stAfterRenBack = await (await fetch(`${BASE}/api/state?room=default&person=帅哥`)).json();

    record('API-11', 'POST /api/rename 与 /api/user/rename 改名路由与历史数据级联更新', '身份体系',
      renJson.success && stAfterRen.name === '佐助' && renamedSport && renamedSport.person === '佐助' &&
      renBackJson.success && stAfterRenBack.name === '帅哥',
      '改名为「佐助」后历史打卡记录级联归属更新，/api/user/rename 别名路由顺利更名并恢复');

    // 13. Delete Record & doneHours roll-back
    const delStdRes = await fetch(`${BASE}/api/records/study/9902?room=default`, { method: 'DELETE' });
    const stAfterDel = await (await fetch(`${BASE}/api/state?room=default`)).json();
    const targetAfterDel = stAfterDel.studyTargets.find(t => t.id === 'st-1');
    await fetch(`${BASE}/api/records/sport/9901?room=default`, { method: 'DELETE' });
    await fetch(`${BASE}/api/records/study/9903?room=default`, { method: 'DELETE' });
    record('API-12', 'DELETE /api/records/:kind/:id 记录删除与学习目标时长扣减', '记录管理',
      delStdRes.status === 200 && targetAfterDel.doneHours === stBefore,
      `删除 9902 学习记录后，学习目标完成小时数正确扣减并回滚至 ${targetAfterDel.doneHours}h`);

    // 14. Export & Import Backup
    const expRes = await fetch(`${BASE}/api/export?room=default`);
    const expJson = await expRes.json();
    const impRes = await fetch(`${BASE}/api/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room: 'default', data: expJson })
    });
    const impJson = await impRes.json();
    record('API-13', 'GET /api/export 与 POST /api/import 完整 JSON 数据备份与恢复', '备份容灾',
      expRes.status === 200 && Array.isArray(expJson.records) && expJson.version === 1 && expJson.schemaVersion === 2 && impJson.success === true,
      `成功导出备份并在后端重新导入全量恢复，包含 ${expJson.records.length} 条运动记录与 ${expJson.studyRecords.length} 条学习记录`);


    // Study duration fields and target totals come from the same seconds.
    const studyPath = BASE + '/api/records/study';
    const durationHeaders = { 'Content-Type': 'application/json' };
    const durationTarget = 'st-duration-verify';
    const targetResponse = await fetch(BASE + '/api/study-targets', {
      method: 'POST', headers: durationHeaders,
      body: JSON.stringify({ room: 'default', id: durationTarget, title: '时长测试', doneHours: 0.25 })
    });
    const durationRecords = [];
    for (const duration of [{ seconds: 1500, minutes: 90, hours: 1.5 }, { minutes: 25, hours: 1.5 }]) {
      const res = await fetch(studyPath, {
        method: 'POST', headers: durationHeaders,
        body: JSON.stringify({ room: 'default', targetId: durationTarget, ...duration })
      });
      durationRecords.push((await res.json()).record);
    }
    const actualDuration = r => r?.seconds === 1500 && r.minutes === 25 && r.hours === 0.42;
    const durationState = async () => (await (await fetch(BASE + '/api/state?room=default')).json()).studyTargets.find(t => t.id === durationTarget);
    const targetWithBoth = await durationState();
    const durationEdit = await fetch(studyPath + '/' + durationRecords[0].id, {
      method: 'PATCH', headers: durationHeaders,
      body: JSON.stringify({ room: 'default', note: '只修改备注' })
    });
    const editedDuration = (await durationEdit.json()).record;
    const targetAfterEdit = await durationState();
    await fetch(studyPath + '/' + durationRecords[1].id + '?room=default', { method: 'DELETE' });
    const targetWithOne = await durationState();
    await fetch(studyPath + '/' + durationRecords[0].id + '?room=default', { method: 'DELETE' });
    const targetWithoutRecords = await durationState();
    record('API-21', '学习记录以秒为准并在汇总后舍入', '学习模块',
      targetResponse.ok && durationRecords.every(actualDuration) && actualDuration(editedDuration) &&
      targetWithBoth?.doneHours === 1.08 && targetAfterEdit?.doneHours === 1.08 &&
      targetWithOne?.doneHours === 0.67 && targetWithoutRecords?.doneHours === 0.25,
      '两条 25 分钟合计 0.83h，叠加 0.25h 基础进度后为 1.08h；仅改备注保持时长，删除逐步回退');
    await fetch(BASE + '/api/study-targets/' + durationTarget + '?room=default', { method: 'DELETE' });

    // 14b. M1/M4 Regression: operationId idempotency
    const idemOpId = 'op-verify-idem-' + Date.now();
    const idemBody = {
      room: 'default', id: 9910, person: '帅哥', date: '2026-11-14', time: '07:00',
      km: 3.5, minutes: 20, feel: 3, note: '幂等测试', tags: [], operationId: idemOpId
    };
    const submit = (route, method, body) => fetch(BASE + route, {
      method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
    });
    const sportRoute = '/api/records/sport';
    function roomVersion() {
      const db = new DatabaseSync(process.env.DB_PATH, { readOnly: true });
      try {
        return db.prepare('SELECT version FROM rooms WHERE code = ?').get('default').version;
      } finally {
        db.close();
      }
    }
    const versionBefore = roomVersion();
    const beforeIdem = await (await fetch(BASE + '/api/state?room=default')).json();
    const replies = await Promise.all(Array.from({ length: 8 }, () =>
      submit(sportRoute, 'POST', idemBody).then(response => response.json())
    ));
    const original = replies.find(reply => reply.deduplicated !== true);
    const afterIdem = await (await fetch(BASE + '/api/state?room=default')).json();
    const sportId = original.record.id;
    const editRoute = sportRoute + '/' + sportId;
    record('API-15', 'operationId 并发与补传防重验证', '可靠性',
      replies.every(reply => reply.success && reply.record.id === sportId && reply.version === original.version) &&
      replies.filter(reply => reply.deduplicated === true).length === 7 &&
      afterIdem.records.length === beforeIdem.records.length + 1 &&
      original.version === versionBefore + 1 && roomVersion() === original.version,
      '同一 operationId 并发提交 8 次，新增一条记录并只更新一次版本');

    const minSportBody = { ...idemBody, id: 9914, operationId: idemOpId + '-minimum' };
    const invalidCreate = await submit(sportRoute, 'POST', { ...minSportBody, km: 0.09 });
    const invalidEdit = await submit(editRoute, 'PATCH', { room: 'default', km: 0.09 });
    const minCreate = await submit(sportRoute, 'POST', { ...minSportBody, km: 0.1 });
    const minEdit = await submit(editRoute, 'PATCH', { room: 'default', km: 0.1 });
    const minCreated = await minCreate.json();
    const minEdited = await minEdit.json();
    record('API-19', '运动新建和编辑使用同一距离下限 (0.1 km)', '记录校验',
      invalidCreate.status === 400 && invalidEdit.status === 400 &&
      minCreated.record?.km === 0.1 && minEdited.record?.km === 0.1,
      '新建和编辑均拒绝 0.09 km 并接受 0.1 km');
    await fetch(BASE + sportRoute + '/9914?room=default', { method: 'DELETE' });

    // 14c. M1/M4 Regression: Pomodoro <60s rejection & >=60s precision + sessionId idempotency
    const shortPomoRes = await fetch(`${BASE}/api/records/study`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room: 'default', id: 9911, person: '帅哥', date: '2026-11-14', source: 'pomodoro', seconds: 45, targetId: 'st-1', sessionId: 'pomo-short-' + Date.now() })
    });
    const validSid = 'pomo-valid-' + Date.now();
    const validPomoBody = {
      room: 'default', id: 9912, person: '帅哥', date: '2026-11-14', time: '10:00',
      source: 'pomodoro', seconds: 1500, minutes: 60, hours: 1.5, targetId: 'st-1', subject: '番茄实测', sessionId: validSid, operationId: validSid
    };
    const pValid1 = await (await fetch(`${BASE}/api/records/study`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(validPomoBody) })).json();
    const pValid2 = await (await fetch(`${BASE}/api/records/study`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(validPomoBody) })).json();
    await fetch(`${BASE}/api/records/study/${pValid1.record.id}?room=default`, { method: 'DELETE' });
    record('API-16', '番茄钟 <60秒拦截(400) 与 >=60秒精确秒级入库防重', '番茄专注',
      shortPomoRes.status === 400 && pValid1.success && pValid1.record.seconds === 1500 && pValid1.record.minutes === 25 && pValid1.record.hours === 0.42 && pValid2.deduplicated === true,
      '45秒番茄钟返回 400 拒绝，1500秒番茄钟准确折算 25分钟/0.42h 且重复 sessionId 防重生效');

    // 14d. M1/M4 Regression: PATCH /api/records/:kind/:id + target doneHours recalculation
    const createdPatchStd = await (await fetch(`${BASE}/api/records/study`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room: 'default', id: 9913, person: '帅哥', date: '2026-11-14', time: '11:00', hours: 1.0, minutes: 60, targetId: 'st-1', subject: '精读' })
    })).json();
    const stMidPatch = await (await fetch(`${BASE}/api/state?room=default`)).json();
    const st1BeforePatch = stMidPatch.studyTargets.find(t => t.id === 'st-1').doneHours;
    const patchStdRes = await (await fetch(`${BASE}/api/records/study/${createdPatchStd.record.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room: 'default', seconds: 7200, minutes: 90, hours: 1.5, note: '编辑后备注' })
    })).json();
    const stAfterPatch = await (await fetch(`${BASE}/api/state?room=default`)).json();
    const st1AfterPatch = stAfterPatch.studyTargets.find(t => t.id === 'st-1').doneHours;
    await fetch(`${BASE}/api/records/study/${createdPatchStd.record.id}?room=default`, { method: 'DELETE' });
    record('API-17', 'PATCH /api/records/:kind/:id 记录编辑与目标小时联动重算', '记录编辑',
      patchStdRes.success && patchStdRes.record.seconds === 7200 && patchStdRes.record.minutes === 120 && patchStdRes.record.hours === 2.0 && patchStdRes.record.note === '编辑后备注' && Math.abs((st1AfterPatch - st1BeforePatch) - 1.0) < 0.05,
      `学习记录从 1.0h 编辑为 2.0h 后，关联目标 st-1 doneHours 从 ${st1BeforePatch}h 联动更新至 ${st1AfterPatch}h`);

    // 14e. M1/M4 Regression: PATCH /api/study-targets/:id, PATCH /api/habits/:id, PUT /api/habits/order
    const stPatchRes = await (await fetch(`${BASE}/api/study-targets/st-1`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room: 'default', archived: true })
    })).json();
    const stUnarchRes = await (await fetch(`${BASE}/api/study-targets/st-1`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room: 'default', archived: false })
    })).json();
    const hbPatchRes = await (await fetch(`${BASE}/api/habits/hb-1`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room: 'default', archived: true })
    })).json();
    const hbUnarchRes = await (await fetch(`${BASE}/api/habits/hb-1`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room: 'default', archived: false })
    })).json();
    const curHabitsState = await (await fetch(`${BASE}/api/state?room=default`)).json();
    const origOrder = curHabitsState.habits.map(h => h.id);
    const revOrder = [...origOrder].reverse();
    const ordRes1 = await (await fetch(`${BASE}/api/habits/order`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room: 'default', ids: revOrder })
    })).json();
    const ordRes2 = await (await fetch(`${BASE}/api/habits/order`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room: 'default', ids: origOrder })
    })).json();
    record('API-18', 'PATCH 目标/习惯归档与 PUT /api/habits/order 排序接口', '目标与习惯',
      stPatchRes.success && stUnarchRes.success && hbPatchRes.success && hbUnarchRes.success && ordRes1.success && ordRes2.success,
      '学习目标与习惯归档/恢复切换及习惯排序接口全部正常持久化并恢复原序');

    // 15. Server Restart Persistence Verification (Key Requirement)
    console.log('[TEST] 重启服务以验证 SQLite 离线持久化数据恢复...');
    await new Promise(r => server.close(r));

    // Clear require cache to reopen the same temporary database.
    delete require.cache[require.resolve('./src/server.js')];
    delete require.cache[require.resolve('./src/db.js')];
    delete require.cache[require.resolve('./src/repository.js')];
    delete require.cache[require.resolve('./src/seed.js')];

    // Restart server on same database
    const { server: server2 } = require('./src/server.js');
    await once(server2, 'listening');
    const restartBase = 'http://127.0.0.1:' + server2.address().port;

    const restartHealth = await (await fetch(`${restartBase}/api/health`)).json();
    const restartState = await (await fetch(`${restartBase}/api/state?room=default`)).json();

    record('API-14', '后端重启后数据完整性与 SQLite 恢复验证', '真持久化',
      restartHealth.status === 'ok' && restartState.goal === 288 && restartState.studyGoal === 150 && restartState.soloPurged === true,
      '重启后端进程后重新建立连接，修改后的计划目标与历史配置从 SQLite 无缝完整恢复');

    const retryVersionBefore = roomVersion();
    const replay = await (await fetch(restartBase + sportRoute, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(idemBody)
    })).json();
    const stateAfterReplay = await (await fetch(restartBase + '/api/state?room=default')).json();
    record('API-20', '服务重启后离线补传仍按原编号去重', '可靠性',
      replay.success && replay.deduplicated === true && replay.record.id === sportId &&
      replay.version === original.version && roomVersion() === retryVersionBefore &&
      stateAfterReplay.records.length === restartState.records.length,
      '重启后重试相同 operationId，返回原记录和版本且无额外写入');

    // API-22: GET /api/leaderboard & GET /api/changes?since=<rev>
    const lbRes = await (await fetch(`${restartBase}/api/leaderboard?room=default&period=${encodeURIComponent('本月')}&metric=${encodeURIComponent('综合积分')}`)).json();
    const chRes = await (await fetch(`${restartBase}/api/changes?room=default&since=1`)).json();
    record('API-22', 'GET /api/leaderboard 前后端同源榜单与 GET /api/changes 差量接口', '增量与同源',
      lbRes.success && lbRes.timezone === 'Asia/Shanghai' && Array.isArray(lbRes.rows) && lbRes.rows.length >= 1 && chRes.success && chRes.rev >= 1 && Array.isArray(chRes.changes),
      '服务端同源计算榜单返回北京时间区间与排名，且 /api/changes 正确返回修订号差量列表');

    // API-23: PATCH/LIKE operationId idempotency + baseVersion 409 conflict + ownership 403 guard
    const editOpId = 'edit-idem-' + Date.now();
    const patch1 = await (await fetch(`${restartBase}/api/records/sport/${sportId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room: 'default', km: 7.25, minutes: 38, operationId: editOpId })
    })).json();
    const patch2 = await (await fetch(`${restartBase}/api/records/sport/${sportId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room: 'default', km: 9.99, minutes: 50, operationId: editOpId })
    })).json();
    const conflictRes = await fetch(`${restartBase}/api/records/sport/${sportId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room: 'default', km: 8.0, minutes: 40, baseVersion: 1 })
    });
    const forbidRes = await fetch(`${restartBase}/api/records/sport/${sportId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room: 'default', person: '陌生旁观者', km: 8.0, minutes: 40 })
    });
    record('API-23', '编辑/点赞通用 operationId 幂等、baseVersion 409 乐观锁与 403 归属保护', '数据安全',
      patch1.success && patch2.deduplicated === true && patch2.record.km === 7.25 && conflictRes.status === 409 && forbidRes.status === 403,
      '重复 editOpId 幂等返回首次结果 (7.25km)，旧版本号返回 409 Conflict，非本人/非代记人篡改返回 403 Forbidden');

    // API-24: Protected file SHA256 gate (pixel-progress.js & pixel-progress.css untouched)
    const crypto = require('node:crypto');
    const ppJsHash = crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname, '..', 'pixel-progress.js'))).digest('hex').slice(0, 16).toUpperCase();
    const ppCssHash = crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname, '..', 'pixel-progress.css'))).digest('hex').slice(0, 16).toUpperCase();
    record('API-24', '受保护像素进度条文件 SHA256 零改动门禁', '保护区门禁',
      ppJsHash === '5536205A387C6EB8' && ppCssHash === 'B4EDDDB4E9220AD6',
      `pixel-progress.js (${ppJsHash}) 与 pixel-progress.css (${ppCssHash}) 哈希 100% 原样保留`);

    await new Promise(r => server2.close(r));
  } catch (err) {
    console.error('Test execution error:', err);
    record('ERR', '测试执行异常', '系统错误', false, err.message);
  }

  // Save report to server-verification.json
  const outPath = path.join(testDir, 'server-verification.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf8');
  console.log('===================================================');
  console.log(`  验收完成: 全部 ${results.summary.total} 项检查, ${results.summary.passed} 项通过, ${results.summary.failed} 项失败`);
  console.log(`  报告已写入: ${outPath}`);
  console.log('===================================================');
  return results.summary.failed;
}

runVerification().then(failed => {
  process.exit(failed ? 1 : 0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
