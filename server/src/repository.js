const { seedRoom, today, DEFAULT_MEMBERS } = require('./seed');

function badRequest(msg) {
  const e = new Error(msg);
  e.statusCode = 400;
  return e;
}

function isValidDateStr(s) {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function roundHours(n) {
  return Math.round(n * 100) / 100;
}

function sportMetrics(kmInput, minutesInput) {
  const km = Number(kmInput);
  const minutes = Number(minutesInput);
  if (!Number.isFinite(km) || km < 0.1 || km > 300) throw badRequest('跑步距离须在 0.1–300 km 之间');
  if (!Number.isFinite(minutes) || minutes < 1 || minutes > 1440) throw badRequest('跑步时长须在 1–1440 分钟之间');
  return { km: Math.round(km * 100) / 100, minutes: Math.round(minutes) };
}

function savedStudySeconds(data) {
  for (const [value, factor] of [[data.seconds, 1], [data.minutes, 60], [data.hours, 3600]]) {
    const number = Number(value);
    if (Number.isFinite(number) && number > 0) return Math.round(number * factor);
  }
  return 0;
}

function studyMetrics(seconds) {
  const minutes = seconds > 0 ? Math.max(1, Math.round(seconds / 60)) : 0;
  return { seconds, minutes, hours: roundHours(seconds / 3600) };
}

function studyDuration(data, existing) {
  if (existing && data.seconds === undefined && data.minutes === undefined && data.hours === undefined) {
    return studyMetrics(savedStudySeconds(existing));
  }

  let rawSeconds;
  if (data.seconds !== undefined) rawSeconds = Number(data.seconds);
  else if (data.minutes !== undefined) rawSeconds = Number(data.minutes) * 60;
  else rawSeconds = Number(data.hours) * 3600;

  if (!Number.isFinite(rawSeconds) || rawSeconds < 60 || rawSeconds > 16 * 3600) {
    if (data.source === 'pomodoro' && rawSeconds < 60) throw badRequest('专注不足 60 秒，暂不记入学习记录');
    throw badRequest('学习时长须在 1 分钟至 16 小时之间');
  }
  return studyMetrics(Math.round(rawSeconds));
}

class RunningRepository {
  constructor(db) {
    this.db = db;
  }

  runTx(fn) {
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const res = fn();
      this.db.exec('COMMIT');
      return res;
    } catch (err) {
      try { this.db.exec('ROLLBACK'); } catch {}
      throw err;
    }
  }

  ensureRoom(roomCode = 'default') {
    seedRoom(this.db, roomCode);
    return this.db.prepare('SELECT * FROM rooms WHERE code = ?').get(roomCode);
  }

  bumpVersion(roomCode) {
    const nowIso = new Date().toISOString();
    this.db.prepare('UPDATE rooms SET version = COALESCE(version, 1) + 1, updated_at = ? WHERE code = ?').run(nowIso, roomCode);
    const row = this.db.prepare('SELECT version FROM rooms WHERE code = ?').get(roomCode);
    return row ? row.version : 1;
  }

  getProcessedOp(roomCode, opId) {
    if (!opId) return null;
    const row = this.db.prepare('SELECT result_json FROM processed_ops WHERE room_code = ? AND op_id = ?').get(roomCode, String(opId));
    if (!row) return null;
    try { return JSON.parse(row.result_json); } catch { return null; }
  }

  saveProcessedOp(roomCode, opId, resultObj) {
    if (!opId) return;
    this.db.prepare(`
      INSERT OR REPLACE INTO processed_ops (room_code, op_id, result_json, created_at)
      VALUES (?, ?, ?, ?)
    `).run(roomCode, String(opId), JSON.stringify(resultObj), new Date().toISOString());
  }

  getStudyTargets(roomCode, person) {
    const records = this.db.prepare('SELECT target_id, seconds, minutes, hours FROM records_study WHERE room_code = ? AND person = ?').all(roomCode, person);
    const secondsByTarget = new Map();
    for (const record of records) {
      secondsByTarget.set(record.target_id, (secondsByTarget.get(record.target_id) || 0) + savedStudySeconds(record));
    }
    return this.db.prepare('SELECT * FROM study_targets WHERE room_code = ? ORDER BY sort_order ASC, id ASC').all(roomCode).map(t => ({
      id: t.id,
      title: t.title,
      category: t.category,
      targetHours: t.target_hours,
      doneHours: Math.max(0, roundHours((t.base_hours || 0) + (secondsByTarget.get(t.id) || 0) / 3600)),
      baseHours: t.base_hours || 0,
      color: t.color,
      deadline: t.deadline,
      archived: Boolean(t.archived)
    }));
  }

  getState(roomCode = 'default', requestingPerson = null) {
    const room = this.ensureRoom(roomCode);
    const viewer = requestingPerson || room.name;

    const targets = this.getStudyTargets(roomCode, room.name);

    const habits = this.db.prepare('SELECT * FROM habits WHERE room_code = ? ORDER BY sort_order ASC, id ASC').all(roomCode).map(h => ({
      id: h.id,
      title: h.title,
      tag: h.tag,
      icon: h.icon,
      archived: Boolean(h.archived)
    }));

    const sportLikes = new Set(
      this.db.prepare('SELECT record_id FROM record_likes WHERE room_code = ? AND kind = ? AND person = ?')
        .all(roomCode, 'sport', viewer).map(r => r.record_id)
    );
    const studyLikes = new Set(
      this.db.prepare('SELECT record_id FROM record_likes WHERE room_code = ? AND kind = ? AND person = ?')
        .all(roomCode, 'study', viewer).map(r => r.record_id)
    );

    const sportRecords = this.db.prepare('SELECT * FROM records_sport WHERE room_code = ? ORDER BY date DESC, time DESC, id DESC').all(roomCode).map(r => ({
      id: r.id,
      person: r.person,
      date: r.date,
      time: r.time,
      km: r.km,
      minutes: r.minutes,
      feel: r.feel,
      note: r.note,
      tags: JSON.parse(r.tags || '[]'),
      photo: r.photo,
      source: r.source || 'manual',
      likes: r.likes,
      liked: sportLikes.has(r.id)
    }));

    const studyRecords = this.db.prepare('SELECT * FROM records_study WHERE room_code = ? ORDER BY date DESC, time DESC, id DESC').all(roomCode).map(r => {
      return {
        id: r.id,
        person: r.person,
        date: r.date,
        time: r.time,
        ...studyMetrics(savedStudySeconds(r)),
        focus: r.focus,
        targetId: r.target_id,
        subject: r.subject,
        note: r.note,
        tags: JSON.parse(r.tags || '[]'),
        photo: r.photo,
        source: r.source || 'manual',
        likes: r.likes,
        liked: studyLikes.has(r.id)
      };
    });

    const habitLogs = {};
    const memberHabitLogs = {};
    const rawLogs = this.db.prepare('SELECT * FROM habit_logs WHERE room_code = ?').all(roomCode);
    for (const log of rawLogs) {
      const arr = JSON.parse(log.habit_ids || '[]');
      if (log.person === room.name) {
        habitLogs[log.date] = arr;
      } else {
        if (!memberHabitLogs[log.person]) memberHabitLogs[log.person] = {};
        memberHabitLogs[log.person][log.date] = arr;
      }
    }

    let sportDatePlan = {};
    let studyDatePlan = {};
    try { sportDatePlan = JSON.parse(room.sport_date_plan || '{}'); } catch {}
    try { studyDatePlan = JSON.parse(room.study_date_plan || '{}'); } catch {}

    return {
      version: 1,
      dataVersion: room.version || 1,
      teamSeeded: true,
      soloPurged: true,
      roomCode: room.code,
      name: room.name,
      goal: room.goal,
      days: JSON.parse(room.days || '[1,2,6,0]'),
      studyGoal: room.study_goal,
      studyDays: JSON.parse(room.study_days || '[1,2,3,4,5,6]'),
      sportDatePlan,
      studyDatePlan,
      members: JSON.parse(room.members || '[]'),
      studyTargets: targets,
      habits,
      habitLogs,
      memberHabitLogs,
      records: sportRecords,
      studyRecords
    };
  }

  linkHabitAction(roomCode, person, date) {
    const existing = this.db.prepare('SELECT habit_ids FROM habit_logs WHERE room_code = ? AND person = ? AND date = ?').get(roomCode, person, date);
    let arr = [];
    if (existing) {
      try { arr = JSON.parse(existing.habit_ids || '[]'); } catch { arr = []; }
    }
    if (!arr.includes('hb-3')) {
      arr.push('hb-3');
      this.db.prepare(`
        INSERT INTO habit_logs (room_code, person, date, habit_ids)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(room_code, person, date) DO UPDATE SET habit_ids = excluded.habit_ids
      `).run(roomCode, person, date, JSON.stringify(arr));
    }
  }

  addSportRecord(roomCode, data) {
    const room = this.ensureRoom(roomCode);
    const opId = data.operationId || data.idempotencyKey;

    return this.runTx(() => {
      const prev = this.getProcessedOp(roomCode, opId);
      if (prev) return { ...prev, deduplicated: true };

      const { km, minutes } = sportMetrics(data.km, data.minutes);
      const date = data.date || today();
      if (!isValidDateStr(date)) throw badRequest('日期格式须为 YYYY-MM-DD');

      const id = Number(data.id) || Date.now();
      const time = String(data.time || '06:10').slice(0, 5);
      const feel = Math.max(0, Math.min(4, Number(data.feel ?? 3)));
      const person = String(data.person || room.name || '帅哥').trim();
      if (!person) throw badRequest('打卡人不能为空');
      const note = String(data.note || '').trim().slice(0, 300);
      const tags = JSON.stringify(Array.isArray(data.tags) ? data.tags : []);
      const photo = String(data.photo || '');
      const source = String(data.source || 'manual');
      const nowIso = new Date().toISOString();

      const existingById = this.db.prepare('SELECT id FROM records_sport WHERE room_code = ? AND id = ?').get(roomCode, id);
      const finalId = existingById ? Date.now() + Math.floor(Math.random() * 1000) : id;
      this.db.prepare(`
        INSERT INTO records_sport (id, room_code, person, date, time, km, minutes, feel, note, tags, photo, source, likes, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
      `).run(finalId, roomCode, person, date, time, km, minutes, feel, note, tags, photo, source, nowIso);

      this.linkHabitAction(roomCode, person, date);
      const version = this.bumpVersion(roomCode);
      const record = { id: finalId, person, date, time, km, minutes, feel, note, tags: JSON.parse(tags), photo, source, likes: 0, liked: false };
      this.saveProcessedOp(roomCode, opId, { record, version });
      return { record, version };
    });
  }

  updateSportRecord(roomCode, id, data) {
    const recId = Number(id);
    const existing = this.db.prepare('SELECT * FROM records_sport WHERE room_code = ? AND id = ?').get(roomCode, recId);
    if (!existing) throw badRequest('未找到该运动记录');

    const { km, minutes } = sportMetrics(
      data.km === undefined ? existing.km : data.km,
      data.minutes === undefined ? existing.minutes : data.minutes
    );
    const date = data.date !== undefined ? String(data.date) : existing.date;
    const time = data.time !== undefined ? String(data.time).slice(0, 5) : existing.time;
    const feel = data.feel !== undefined ? Math.max(0, Math.min(4, Number(data.feel))) : existing.feel;
    const note = data.note !== undefined ? String(data.note).trim().slice(0, 300) : existing.note;
    const tags = data.tags !== undefined ? JSON.stringify(Array.isArray(data.tags) ? data.tags : []) : existing.tags;

    if (!isValidDateStr(date)) throw badRequest('日期格式不正确');

    return this.runTx(() => {
      this.db.prepare(`
        UPDATE records_sport
        SET date = ?, time = ?, km = ?, minutes = ?, feel = ?, note = ?, tags = ?
        WHERE room_code = ? AND id = ?
      `).run(date, time, km, minutes, feel, note, tags, roomCode, recId);
      const version = this.bumpVersion(roomCode);
      return {
        record: {
          id: recId, person: existing.person, date, time, km, minutes, feel, note,
          tags: JSON.parse(tags), photo: existing.photo, source: existing.source || 'manual', likes: existing.likes
        },
        version
      };
    });
  }

  deleteSportRecord(roomCode, id) {
    return this.runTx(() => {
      this.db.prepare('DELETE FROM records_sport WHERE room_code = ? AND id = ?').run(roomCode, Number(id));
      this.db.prepare('DELETE FROM record_likes WHERE room_code = ? AND kind = ? AND record_id = ?').run(roomCode, 'sport', Number(id));
      const version = this.bumpVersion(roomCode);
      return { version };
    });
  }

  addStudyRecord(roomCode, data) {
    const room = this.ensureRoom(roomCode);
    const opId = data.operationId || data.sessionId || data.idempotencyKey;

    return this.runTx(() => {
      const prev = this.getProcessedOp(roomCode, opId);
      if (prev) return { ...prev, deduplicated: true };

      const source = String(data.source || 'manual');
      const { seconds, minutes, hours } = studyDuration(data);

      const date = data.date || today();
      if (!isValidDateStr(date)) throw badRequest('日期格式须为 YYYY-MM-DD');

      const id = Number(data.id) || Date.now();
      const time = String(data.time || '09:00').slice(0, 5);
      const focus = Math.max(0, Math.min(4, Number(data.focus ?? 3)));
      const targetId = String(data.targetId || 'st-1');
      const subject = String(data.subject || '自主学习').trim() || '自主学习';
      const person = String(data.person || room.name || '帅哥').trim();
      if (!person) throw badRequest('打卡人不能为空');
      const note = String(data.note || '').trim().slice(0, 300);
      const tags = JSON.stringify(Array.isArray(data.tags) ? data.tags : []);
      const photo = String(data.photo || '');
      const nowIso = new Date().toISOString();

      const existingById = this.db.prepare('SELECT id FROM records_study WHERE room_code = ? AND id = ?').get(roomCode, id);
      const finalId = existingById ? Date.now() + Math.floor(Math.random() * 1000) : id;
      this.db.prepare(`
        INSERT INTO records_study (id, room_code, person, date, time, hours, minutes, seconds, focus, target_id, subject, note, tags, photo, source, likes, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
      `).run(finalId, roomCode, person, date, time, hours, minutes, seconds, focus, targetId, subject, note, tags, photo, source, nowIso);

      this.linkHabitAction(roomCode, person, date);
      const version = this.bumpVersion(roomCode);
      const record = { id: finalId, person, date, time, hours, minutes, seconds, focus, targetId, subject, note, tags: JSON.parse(tags), photo, source, likes: 0, liked: false };
      this.saveProcessedOp(roomCode, opId, { record, version });
      return { record, version };
    });
  }

  updateStudyRecord(roomCode, id, data) {
    this.ensureRoom(roomCode);
    const recId = Number(id);
    const existing = this.db.prepare('SELECT * FROM records_study WHERE room_code = ? AND id = ?').get(roomCode, recId);
    if (!existing) throw badRequest('未找到该学习记录');

    const { seconds, minutes, hours } = studyDuration(data, existing);
    const date = data.date !== undefined ? String(data.date) : existing.date;
    const time = data.time !== undefined ? String(data.time).slice(0, 5) : existing.time;
    const focus = data.focus !== undefined ? Math.max(0, Math.min(4, Number(data.focus))) : existing.focus;
    const targetId = data.targetId !== undefined ? String(data.targetId) : existing.target_id;
    const subject = data.subject !== undefined ? String(data.subject).trim() : existing.subject;
    const note = data.note !== undefined ? String(data.note).trim().slice(0, 300) : existing.note;
    const tags = data.tags !== undefined ? JSON.stringify(Array.isArray(data.tags) ? data.tags : []) : existing.tags;

    if (!isValidDateStr(date)) throw badRequest('日期格式不正确');

    return this.runTx(() => {
      this.db.prepare(`
        UPDATE records_study
        SET date = ?, time = ?, hours = ?, minutes = ?, seconds = ?, focus = ?, target_id = ?, subject = ?, note = ?, tags = ?
        WHERE room_code = ? AND id = ?
      `).run(date, time, hours, minutes, seconds, focus, targetId, subject, note, tags, roomCode, recId);

      const version = this.bumpVersion(roomCode);
      return {
        record: {
          id: recId, person: existing.person, date, time, hours, minutes, seconds, focus, targetId, subject, note,
          tags: JSON.parse(tags), photo: existing.photo, source: existing.source || 'manual', likes: existing.likes
        },
        version
      };
    });
  }

  deleteStudyRecord(roomCode, id) {
    this.ensureRoom(roomCode);
    return this.runTx(() => {
      this.db.prepare('DELETE FROM records_study WHERE room_code = ? AND id = ?').run(roomCode, Number(id));
      this.db.prepare('DELETE FROM record_likes WHERE room_code = ? AND kind = ? AND record_id = ?').run(roomCode, 'study', Number(id));
      const version = this.bumpVersion(roomCode);
      return { version };
    });
  }

  toggleLike(roomCode, kind, recordId, person) {
    this.ensureRoom(roomCode);
    const existing = this.db.prepare('SELECT 1 FROM record_likes WHERE room_code = ? AND kind = ? AND record_id = ? AND person = ?').get(roomCode, kind, Number(recordId), person);
    const table = kind === 'study' ? 'records_study' : 'records_sport';

    return this.runTx(() => {
      if (existing) {
        this.db.prepare('DELETE FROM record_likes WHERE room_code = ? AND kind = ? AND record_id = ? AND person = ?').run(roomCode, kind, Number(recordId), person);
        this.db.prepare(`UPDATE ${table} SET likes = MAX(0, likes - 1) WHERE room_code = ? AND id = ?`).run(roomCode, Number(recordId));
        const row = this.db.prepare(`SELECT likes FROM ${table} WHERE room_code = ? AND id = ?`).get(roomCode, Number(recordId));
        const version = this.bumpVersion(roomCode);
        return { liked: false, likes: row ? row.likes : 0, version };
      } else {
        const nowIso = new Date().toISOString();
        this.db.prepare('INSERT INTO record_likes (room_code, kind, record_id, person, created_at) VALUES (?, ?, ?, ?, ?)').run(roomCode, kind, Number(recordId), person, nowIso);
        this.db.prepare(`UPDATE ${table} SET likes = likes + 1 WHERE room_code = ? AND id = ?`).run(roomCode, Number(recordId));
        const row = this.db.prepare(`SELECT likes FROM ${table} WHERE room_code = ? AND id = ?`).get(roomCode, Number(recordId));
        const version = this.bumpVersion(roomCode);
        return { liked: true, likes: row ? row.likes : 1, version };
      }
    });
  }

  addStudyTarget(roomCode, data) {
    this.ensureRoom(roomCode);
    const id = data.id || 'st-' + Date.now();
    const title = String(data.title || '').trim();
    if (!title) throw badRequest('目标名称不能为空');
    const category = String(data.category || '综合').trim();
    const targetHours = Number(data.targetHours) || 30;
    const doneHours = Number(data.doneHours) || 0;
    const color = data.color || '#203f91';
    const deadline = data.deadline || '本月';
    const maxOrder = this.db.prepare('SELECT MAX(sort_order) as m FROM study_targets WHERE room_code = ?').get(roomCode);
    const sortOrder = (maxOrder && maxOrder.m ? maxOrder.m : 0) + 1;

    this.db.prepare(`
      INSERT INTO study_targets (id, room_code, title, category, target_hours, done_hours, base_hours, color, deadline, archived, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
    `).run(id, roomCode, title, category, targetHours, doneHours, doneHours, color, deadline, sortOrder);
    const version = this.bumpVersion(roomCode);

    return { id, title, category, targetHours, doneHours, baseHours: doneHours, color, deadline, archived: false, version };
  }

  updateStudyTarget(roomCode, id, data) {
    const room = this.ensureRoom(roomCode);
    const existing = this.db.prepare('SELECT * FROM study_targets WHERE room_code = ? AND id = ?').get(roomCode, id);
    if (!existing) throw badRequest('未找到该学习目标');
    const title = data.title !== undefined ? String(data.title).trim() : existing.title;
    if (!title) throw badRequest('目标名称不能为空');
    const category = data.category !== undefined ? String(data.category).trim() : existing.category;
    const targetHours = data.targetHours !== undefined ? Math.max(1, Number(data.targetHours)) : existing.target_hours;
    const deadline = data.deadline !== undefined ? String(data.deadline).trim() : existing.deadline;
    const archived = data.archived !== undefined ? (data.archived ? 1 : 0) : (existing.archived || 0);

    this.db.prepare(`
      UPDATE study_targets
      SET title = ?, category = ?, target_hours = ?, deadline = ?, archived = ?
      WHERE room_code = ? AND id = ?
    `).run(title, category, targetHours, deadline, archived, roomCode, id);
    const version = this.bumpVersion(roomCode);
    return {
      target: this.getStudyTargets(roomCode, room.name).find(t => t.id === id),
      version
    };
  }

  deleteStudyTarget(roomCode, id) {
    this.db.prepare('DELETE FROM study_targets WHERE room_code = ? AND id = ?').run(roomCode, id);
    const version = this.bumpVersion(roomCode);
    return { version };
  }

  addHabit(roomCode, data) {
    this.ensureRoom(roomCode);
    const id = data.id || 'hb-' + Date.now();
    const title = String(data.title || '').trim();
    if (!title) throw badRequest('习惯名称不能为空');
    const tag = String(data.tag || '自律').trim();
    const icon = String(data.icon || 'bolt').trim();
    const maxOrder = this.db.prepare('SELECT MAX(sort_order) as m FROM habits WHERE room_code = ?').get(roomCode);
    const sortOrder = (maxOrder && maxOrder.m ? maxOrder.m : 0) + 1;

    this.db.prepare(`
      INSERT INTO habits (id, room_code, title, tag, icon, archived, sort_order)
      VALUES (?, ?, ?, ?, ?, 0, ?)
    `).run(id, roomCode, title, tag, icon, sortOrder);
    const version = this.bumpVersion(roomCode);

    return { id, title, tag, icon, archived: false, version };
  }

  updateHabit(roomCode, id, data) {
    const existing = this.db.prepare('SELECT * FROM habits WHERE room_code = ? AND id = ?').get(roomCode, id);
    if (!existing) throw badRequest('未找到该自律习惯');
    const title = data.title !== undefined ? String(data.title).trim() : existing.title;
    if (!title) throw badRequest('习惯名称不能为空');
    const tag = data.tag !== undefined ? String(data.tag).trim() : existing.tag;
    const archived = data.archived !== undefined ? (data.archived ? 1 : 0) : (existing.archived || 0);
    const sortOrder = data.sortOrder !== undefined ? Number(data.sortOrder) : existing.sort_order;
    this.db.prepare('UPDATE habits SET title = ?, tag = ?, archived = ?, sort_order = ? WHERE room_code = ? AND id = ?')
      .run(title, tag, archived, sortOrder, roomCode, id);
    const version = this.bumpVersion(roomCode);
    return { habit: { id, title, tag, icon: existing.icon, archived: Boolean(archived) }, version };
  }

  reorderHabits(roomCode, ids) {
    if (!Array.isArray(ids)) throw badRequest('排序列表格式不正确');
    return this.runTx(() => {
      const upd = this.db.prepare('UPDATE habits SET sort_order = ? WHERE room_code = ? AND id = ?');
      ids.forEach((id, i) => upd.run(i + 1, roomCode, String(id)));
      const version = this.bumpVersion(roomCode);
      return { version };
    });
  }

  deleteHabit(roomCode, id) {
    this.db.prepare('DELETE FROM habits WHERE room_code = ? AND id = ?').run(roomCode, id);
    const version = this.bumpVersion(roomCode);
    return { version };
  }

  getHabitLogsForPerson(roomCode, person, date) {
    const room = this.ensureRoom(roomCode);
    const p = person || room.name;
    const d = date || today();
    const row = this.db.prepare('SELECT habit_ids FROM habit_logs WHERE room_code = ? AND person = ? AND date = ?').get(roomCode, p, d);
    if (!row) return [];
    try { return JSON.parse(row.habit_ids || '[]'); } catch { return []; }
  }

  updateHabitLogs(roomCode, person, date, habitIds) {
    const room = this.ensureRoom(roomCode);
    const p = person || room.name;
    const d = date || today();
    const arr = Array.isArray(habitIds) ? habitIds : [];
    this.db.prepare(`
      INSERT INTO habit_logs (room_code, person, date, habit_ids)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(room_code, person, date) DO UPDATE SET habit_ids = excluded.habit_ids
    `).run(roomCode, p, d, JSON.stringify(arr));
    this.bumpVersion(roomCode);
    return arr;
  }

  updatePlans(roomCode, data) {
    const room = this.ensureRoom(roomCode);
    const goal = Number.isFinite(data.goal) ? Number(data.goal) : room.goal;
    const days = Array.isArray(data.days) ? JSON.stringify(data.days) : room.days;
    const studyGoal = Number.isFinite(data.studyGoal) ? Number(data.studyGoal) : room.study_goal;
    const studyDays = Array.isArray(data.studyDays) ? JSON.stringify(data.studyDays) : room.study_days;
    const sportDatePlan = data.sportDatePlan && typeof data.sportDatePlan === 'object' ? JSON.stringify(data.sportDatePlan) : (room.sport_date_plan || '{}');
    const studyDatePlan = data.studyDatePlan && typeof data.studyDatePlan === 'object' ? JSON.stringify(data.studyDatePlan) : (room.study_date_plan || '{}');
    const nowIso = new Date().toISOString();

    this.db.prepare(`
      UPDATE rooms
      SET goal = ?, days = ?, study_goal = ?, study_days = ?, sport_date_plan = ?, study_date_plan = ?, version = COALESCE(version, 1) + 1, updated_at = ?
      WHERE code = ?
    `).run(goal, days, studyGoal, studyDays, sportDatePlan, studyDatePlan, nowIso, roomCode);

    return {
      goal,
      days: JSON.parse(days),
      studyGoal,
      studyDays: JSON.parse(studyDays),
      sportDatePlan: JSON.parse(sportDatePlan),
      studyDatePlan: JSON.parse(studyDatePlan)
    };
  }

  addMember(roomCode, name) {
    const room = this.ensureRoom(roomCode);
    const members = JSON.parse(room.members || '[]');
    const trimmed = String(name || '').trim();
    if (trimmed && !members.includes(trimmed) && trimmed !== room.name) {
      members.push(trimmed);
      this.db.prepare('UPDATE rooms SET members = ?, version = COALESCE(version, 1) + 1, updated_at = ? WHERE code = ?').run(
        JSON.stringify(members),
        new Date().toISOString(),
        roomCode
      );
    }
    return members;
  }

  removeMember(roomCode, name) {
    const room = this.ensureRoom(roomCode);
    let members = JSON.parse(room.members || '[]');
    members = members.filter(m => m !== name);
    this.db.prepare('UPDATE rooms SET members = ?, version = COALESCE(version, 1) + 1, updated_at = ? WHERE code = ?').run(
      JSON.stringify(members),
      new Date().toISOString(),
      roomCode
    );
    return members;
  }

  renamePerson(roomCode, oldName, newName) {
    const room = this.ensureRoom(roomCode);
    const trimmedOld = String(oldName || room.name || '').trim();
    const trimmedNew = String(newName || '').trim();
    if (!trimmedNew) throw badRequest('新名字不能为空');

    return this.runTx(() => {
      if (room.name === trimmedOld) {
        this.db.prepare('UPDATE rooms SET name = ?, updated_at = ? WHERE code = ?').run(
          trimmedNew,
          new Date().toISOString(),
          roomCode
        );
      }

      let members = JSON.parse(room.members || '[]');
      if (members.includes(trimmedOld)) {
        members = members.map(m => (m === trimmedOld ? trimmedNew : m));
        this.db.prepare('UPDATE rooms SET members = ?, updated_at = ? WHERE code = ?').run(
          JSON.stringify(members),
          new Date().toISOString(),
          roomCode
        );
      }

      this.db.prepare('UPDATE records_sport SET person = ? WHERE room_code = ? AND person = ?').run(trimmedNew, roomCode, trimmedOld);
      this.db.prepare('UPDATE records_study SET person = ? WHERE room_code = ? AND person = ?').run(trimmedNew, roomCode, trimmedOld);
      this.db.prepare('UPDATE habit_logs SET person = ? WHERE room_code = ? AND person = ?').run(trimmedNew, roomCode, trimmedOld);
      this.db.prepare('UPDATE record_likes SET person = ? WHERE room_code = ? AND person = ?').run(trimmedNew, roomCode, trimmedOld);
      const version = this.bumpVersion(roomCode);

      return { oldName: trimmedOld, newName: trimmedNew, name: trimmedNew, version };
    });
  }

  clearRecords(roomCode) {
    this.ensureRoom(roomCode);
    return this.runTx(() => {
      this.db.prepare('DELETE FROM records_sport WHERE room_code = ?').run(roomCode);
      this.db.prepare('DELETE FROM records_study WHERE room_code = ?').run(roomCode);
      this.db.prepare('DELETE FROM record_likes WHERE room_code = ?').run(roomCode);
      const version = this.bumpVersion(roomCode);
      return { version };
    });
  }

  importState(roomCode, raw) {
    if (!raw || typeof raw !== 'object' || !Array.isArray(raw.records) || !Array.isArray(raw.studyRecords || [])) {
      throw badRequest('导入数据格式不正确：缺少必要的记录列表');
    }
    const nowIso = new Date().toISOString();

    const name = String(raw.name || '帅哥').trim();
    if (!name || name.length > 16) throw badRequest('导入失败：用户名无效');
    const goal = Number.isFinite(raw.goal) ? Number(raw.goal) : 245;
    const days = JSON.stringify(Array.isArray(raw.days) ? raw.days : [1, 2, 6, 0]);
    const studyGoal = Number.isFinite(raw.studyGoal) ? Number(raw.studyGoal) : 120;
    const studyDays = JSON.stringify(Array.isArray(raw.studyDays) ? raw.studyDays : [1, 2, 3, 4, 5, 6]);
    const members = JSON.stringify(Array.isArray(raw.members) ? raw.members : DEFAULT_MEMBERS);
    const sportDatePlan = JSON.stringify(raw.sportDatePlan && typeof raw.sportDatePlan === 'object' ? raw.sportDatePlan : {});
    const studyDatePlan = JSON.stringify(raw.studyDatePlan && typeof raw.studyDatePlan === 'object' ? raw.studyDatePlan : {});

    return this.runTx(() => {
      this.db.prepare(`
        INSERT INTO rooms (code, name, goal, days, study_goal, study_days, members, sport_date_plan, study_date_plan, version, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
        ON CONFLICT(code) DO UPDATE SET
          name = excluded.name,
          goal = excluded.goal,
          days = excluded.days,
          study_goal = excluded.study_goal,
          study_days = excluded.study_days,
          members = excluded.members,
          sport_date_plan = excluded.sport_date_plan,
          study_date_plan = excluded.study_date_plan,
          version = COALESCE(rooms.version, 1) + 1,
          updated_at = excluded.updated_at
      `).run(roomCode, name, goal, days, studyGoal, studyDays, members, sportDatePlan, studyDatePlan, nowIso, nowIso);

      this.db.prepare('DELETE FROM records_sport WHERE room_code = ?').run(roomCode);
      this.db.prepare('DELETE FROM records_study WHERE room_code = ?').run(roomCode);
      this.db.prepare('DELETE FROM study_targets WHERE room_code = ?').run(roomCode);
      this.db.prepare('DELETE FROM habits WHERE room_code = ?').run(roomCode);
      this.db.prepare('DELETE FROM habit_logs WHERE room_code = ?').run(roomCode);
      this.db.prepare('DELETE FROM record_likes WHERE room_code = ?').run(roomCode);

      if (Array.isArray(raw.habits)) {
        const ins = this.db.prepare('INSERT INTO habits (id, room_code, title, tag, icon, archived, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)');
        raw.habits.forEach((h, i) => {
          ins.run(h.id || 'hb-' + (i + 1), roomCode, h.title || '习惯项', h.tag || '行动', h.icon || 'bolt', h.archived ? 1 : 0, i + 1);
        });
      }

      if (Array.isArray(raw.records)) {
        const ins = this.db.prepare('INSERT INTO records_sport (id, room_code, person, date, time, km, minutes, feel, note, tags, photo, source, likes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        raw.records.forEach(r => {
          const rid = Number(r.id);
          if (!Number.isFinite(rid)) throw badRequest('运动记录 ID 无效');
          ins.run(rid, roomCode, r.person || name, r.date || today(), r.time || '06:10', Number(r.km) || 5, Number(r.minutes) || 30, Number(r.feel ?? 3), r.note || '', JSON.stringify(r.tags || []), r.photo || '', r.source || 'manual', Number(r.likes || 0), nowIso);
        });
      }

      const secondsByTarget = new Map();
      if (Array.isArray(raw.studyRecords)) {
        const ins = this.db.prepare('INSERT INTO records_study (id, room_code, person, date, time, hours, minutes, seconds, focus, target_id, subject, note, tags, photo, source, likes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        raw.studyRecords.forEach(s => {
          const sid = Number(s.id);
          if (!Number.isFinite(sid)) throw badRequest('学习记录 ID 无效');
          const { seconds, minutes, hours } = studyMetrics(savedStudySeconds(s) || 90 * 60);
          const person = s.person || name;
          const targetId = s.targetId || 'st-1';
          ins.run(sid, roomCode, person, s.date || today(), s.time || '09:00', hours, minutes, seconds, Number(s.focus ?? 3), targetId, s.subject || '自习', s.note || '', JSON.stringify(s.tags || []), s.photo || '', s.source || 'manual', Number(s.likes || 0), nowIso);
          if (person === name) secondsByTarget.set(targetId, (secondsByTarget.get(targetId) || 0) + seconds);
        });
      }

      if (Array.isArray(raw.studyTargets)) {
        const ins = this.db.prepare('INSERT INTO study_targets (id, room_code, title, category, target_hours, done_hours, base_hours, color, deadline, archived, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        raw.studyTargets.forEach((t, i) => {
          const id = t.id || 'st-' + (i + 1);
          const linkedHours = (secondsByTarget.get(id) || 0) / 3600;
          const baseHours = Number.isFinite(t.baseHours) ? t.baseHours : Math.max(0, roundHours((Number(t.doneHours) || 0) - linkedHours));
          const doneHours = Math.max(0, roundHours(baseHours + linkedHours));
          ins.run(id, roomCode, t.title || '学习目标', t.category || '自选', Number(t.targetHours) || 30, doneHours, baseHours, t.color || '#203f91', t.deadline || '本月', t.archived ? 1 : 0, i + 1);
        });
      }

      const insHl = this.db.prepare('INSERT INTO habit_logs (room_code, person, date, habit_ids) VALUES (?, ?, ?, ?)');
      if (raw.habitLogs && typeof raw.habitLogs === 'object') {
        Object.entries(raw.habitLogs).forEach(([d, arr]) => {
          insHl.run(roomCode, name, d, JSON.stringify(Array.isArray(arr) ? arr : []));
        });
      }
      if (raw.memberHabitLogs && typeof raw.memberHabitLogs === 'object') {
        Object.entries(raw.memberHabitLogs).forEach(([member, dates]) => {
          if (dates && typeof dates === 'object') {
            Object.entries(dates).forEach(([d, arr]) => {
              insHl.run(roomCode, member, d, JSON.stringify(Array.isArray(arr) ? arr : []));
            });
          }
        });
      }

      const row = this.db.prepare('SELECT version FROM rooms WHERE code = ?').get(roomCode);
      return { version: row ? row.version : 1 };
    });
  }

  getStats() {
    const rooms = this.db.prepare('SELECT COUNT(*) as c FROM rooms').get().c;
    const sportRecords = this.db.prepare('SELECT COUNT(*) as c FROM records_sport').get().c;
    const studyRecords = this.db.prepare('SELECT COUNT(*) as c FROM records_study').get().c;
    const studyTargets = this.db.prepare('SELECT COUNT(*) as c FROM study_targets').get().c;
    const habits = this.db.prepare('SELECT COUNT(*) as c FROM habits').get().c;
    return { rooms, sportRecords, studyRecords, studyTargets, habits };
  }
}

module.exports = { RunningRepository };
