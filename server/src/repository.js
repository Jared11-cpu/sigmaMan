const { seedRoom, today, DEFAULT_MEMBERS } = require('./seed');

class RunningRepository {
  constructor(db) {
    this.db = db;
  }

  ensureRoom(roomCode = 'default') {
    seedRoom(this.db, roomCode);
    return this.db.prepare('SELECT * FROM rooms WHERE code = ?').get(roomCode);
  }

  getState(roomCode = 'default', requestingPerson = null) {
    const room = this.ensureRoom(roomCode);
    const viewer = requestingPerson || room.name;

    const targets = this.db.prepare('SELECT * FROM study_targets WHERE room_code = ? ORDER BY sort_order ASC, id ASC').all(roomCode).map(t => ({
      id: t.id,
      title: t.title,
      category: t.category,
      targetHours: t.target_hours,
      doneHours: t.done_hours,
      color: t.color,
      deadline: t.deadline
    }));

    const habits = this.db.prepare('SELECT * FROM habits WHERE room_code = ? ORDER BY sort_order ASC, id ASC').all(roomCode).map(h => ({
      id: h.id,
      title: h.title,
      tag: h.tag,
      icon: h.icon
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
      likes: r.likes,
      liked: sportLikes.has(r.id)
    }));

    const studyRecords = this.db.prepare('SELECT * FROM records_study WHERE room_code = ? ORDER BY date DESC, time DESC, id DESC').all(roomCode).map(r => ({
      id: r.id,
      person: r.person,
      date: r.date,
      time: r.time,
      hours: r.hours,
      minutes: r.minutes,
      focus: r.focus,
      targetId: r.target_id,
      subject: r.subject,
      note: r.note,
      tags: JSON.parse(r.tags || '[]'),
      photo: r.photo,
      likes: r.likes,
      liked: studyLikes.has(r.id)
    }));

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

    return {
      version: 1,
      teamSeeded: true,
      soloPurged: true,
      roomCode: room.code,
      name: room.name,
      goal: room.goal,
      days: JSON.parse(room.days || '[1,2,6,0]'),
      studyGoal: room.study_goal,
      studyDays: JSON.parse(room.study_days || '[1,2,3,4,5,6]'),
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
    this.ensureRoom(roomCode);
    const id = Number(data.id) || Date.now();
    const date = data.date || today();
    const time = data.time || '06:10';
    const km = Math.round(Number(data.km) * 100) / 100;
    const minutes = Math.round(Number(data.minutes) || 30);
    const feel = Number(data.feel ?? 3);
    const person = String(data.person || '帅哥').trim();
    const note = String(data.note || '').trim();
    const tags = JSON.stringify(Array.isArray(data.tags) ? data.tags : []);
    const photo = String(data.photo || '');
    const nowIso = new Date().toISOString();

    this.db.prepare(`
      INSERT INTO records_sport (id, room_code, person, date, time, km, minutes, feel, note, tags, photo, likes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
    `).run(id, roomCode, person, date, time, km, minutes, feel, note, tags, photo, nowIso);

    this.linkHabitAction(roomCode, person, date);
    return { id, person, date, time, km, minutes, feel, note, tags: JSON.parse(tags), photo, likes: 0, liked: false };
  }

  deleteSportRecord(roomCode, id) {
    this.db.prepare('DELETE FROM records_sport WHERE room_code = ? AND id = ?').run(roomCode, Number(id));
    this.db.prepare('DELETE FROM record_likes WHERE room_code = ? AND kind = ? AND record_id = ?').run(roomCode, 'sport', Number(id));
    return true;
  }

  addStudyRecord(roomCode, data) {
    this.ensureRoom(roomCode);
    const id = Number(data.id) || Date.now();
    const date = data.date || today();
    const time = data.time || '09:00';
    const hours = Math.round(Number(data.hours) * 10) / 10;
    const minutes = Math.round(Number(data.minutes) || Math.round(hours * 60));
    const focus = Number(data.focus ?? 3);
    const targetId = String(data.targetId || 'st-1');
    const subject = String(data.subject || '自主学习').trim();
    const person = String(data.person || '帅哥').trim();
    const note = String(data.note || '').trim();
    const tags = JSON.stringify(Array.isArray(data.tags) ? data.tags : []);
    const photo = String(data.photo || '');
    const nowIso = new Date().toISOString();

    this.db.prepare(`
      INSERT INTO records_study (id, room_code, person, date, time, hours, minutes, focus, target_id, subject, note, tags, photo, likes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
    `).run(id, roomCode, person, date, time, hours, minutes, focus, targetId, subject, note, tags, photo, nowIso);

    this.db.prepare(`
      UPDATE study_targets
      SET done_hours = ROUND(done_hours + ?, 1)
      WHERE room_code = ? AND id = ?
    `).run(hours, roomCode, targetId);

    this.linkHabitAction(roomCode, person, date);
    return { id, person, date, time, hours, minutes, focus, targetId, subject, note, tags: JSON.parse(tags), photo, likes: 0, liked: false };
  }

  deleteStudyRecord(roomCode, id) {
    const rec = this.db.prepare('SELECT target_id, hours FROM records_study WHERE room_code = ? AND id = ?').get(roomCode, Number(id));
    if (rec) {
      this.db.prepare(`
        UPDATE study_targets
        SET done_hours = MAX(0, ROUND(done_hours - ?, 1))
        WHERE room_code = ? AND id = ?
      `).run(rec.hours, roomCode, rec.target_id);
    }
    this.db.prepare('DELETE FROM records_study WHERE room_code = ? AND id = ?').run(roomCode, Number(id));
    this.db.prepare('DELETE FROM record_likes WHERE room_code = ? AND kind = ? AND record_id = ?').run(roomCode, 'study', Number(id));
    return true;
  }

  toggleLike(roomCode, kind, recordId, person) {
    this.ensureRoom(roomCode);
    const existing = this.db.prepare('SELECT 1 FROM record_likes WHERE room_code = ? AND kind = ? AND record_id = ? AND person = ?').get(roomCode, kind, Number(recordId), person);
    const table = kind === 'study' ? 'records_study' : 'records_sport';

    if (existing) {
      this.db.prepare('DELETE FROM record_likes WHERE room_code = ? AND kind = ? AND record_id = ? AND person = ?').run(roomCode, kind, Number(recordId), person);
      this.db.prepare(`UPDATE ${table} SET likes = MAX(0, likes - 1) WHERE room_code = ? AND id = ?`).run(roomCode, Number(recordId));
      const row = this.db.prepare(`SELECT likes FROM ${table} WHERE room_code = ? AND id = ?`).get(roomCode, Number(recordId));
      return { liked: false, likes: row ? row.likes : 0 };
    } else {
      const nowIso = new Date().toISOString();
      this.db.prepare('INSERT INTO record_likes (room_code, kind, record_id, person, created_at) VALUES (?, ?, ?, ?, ?)').run(roomCode, kind, Number(recordId), person, nowIso);
      this.db.prepare(`UPDATE ${table} SET likes = likes + 1 WHERE room_code = ? AND id = ?`).run(roomCode, Number(recordId));
      const row = this.db.prepare(`SELECT likes FROM ${table} WHERE room_code = ? AND id = ?`).get(roomCode, Number(recordId));
      return { liked: true, likes: row ? row.likes : 1 };
    }
  }

  addStudyTarget(roomCode, data) {
    this.ensureRoom(roomCode);
    const id = data.id || 'st-' + Date.now();
    const title = String(data.title || '').trim();
    const category = String(data.category || '综合').trim();
    const targetHours = Number(data.targetHours) || 30;
    const doneHours = Number(data.doneHours) || 0;
    const color = data.color || '#203f91';
    const deadline = data.deadline || '本月';
    const maxOrder = this.db.prepare('SELECT MAX(sort_order) as m FROM study_targets WHERE room_code = ?').get(roomCode);
    const sortOrder = (maxOrder && maxOrder.m ? maxOrder.m : 0) + 1;

    this.db.prepare(`
      INSERT INTO study_targets (id, room_code, title, category, target_hours, done_hours, color, deadline, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, roomCode, title, category, targetHours, doneHours, color, deadline, sortOrder);

    return { id, title, category, targetHours, doneHours, color, deadline };
  }

  deleteStudyTarget(roomCode, id) {
    this.db.prepare('DELETE FROM study_targets WHERE room_code = ? AND id = ?').run(roomCode, id);
    return true;
  }

  addHabit(roomCode, data) {
    this.ensureRoom(roomCode);
    const id = data.id || 'hb-' + Date.now();
    const title = String(data.title || '').trim();
    const tag = String(data.tag || '自律').trim();
    const icon = String(data.icon || 'star').trim();
    const maxOrder = this.db.prepare('SELECT MAX(sort_order) as m FROM habits WHERE room_code = ?').get(roomCode);
    const sortOrder = (maxOrder && maxOrder.m ? maxOrder.m : 0) + 1;

    this.db.prepare(`
      INSERT INTO habits (id, room_code, title, tag, icon, sort_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, roomCode, title, tag, icon, sortOrder);

    return { id, title, tag, icon };
  }

  deleteHabit(roomCode, id) {
    this.db.prepare('DELETE FROM habits WHERE room_code = ? AND id = ?').run(roomCode, id);
    return true;
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
    return arr;
  }
  _oldUpdate(roomCode, person, date, habitIds) {
    this.ensureRoom(roomCode);
    const arr = Array.isArray(habitIds) ? habitIds : [];
    this.db.prepare(`
      INSERT INTO habit_logs (room_code, person, date, habit_ids)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(room_code, person, date) DO UPDATE SET habit_ids = excluded.habit_ids
    `).run(roomCode, person, date, JSON.stringify(arr));
    return true;
  }

  updatePlans(roomCode, data) {
    const room = this.ensureRoom(roomCode);
    const goal = Number.isFinite(data.goal) ? Number(data.goal) : room.goal;
    const days = Array.isArray(data.days) ? JSON.stringify(data.days) : room.days;
    const studyGoal = Number.isFinite(data.studyGoal) ? Number(data.studyGoal) : room.study_goal;
    const studyDays = Array.isArray(data.studyDays) ? JSON.stringify(data.studyDays) : room.study_days;
    const nowIso = new Date().toISOString();

    this.db.prepare(`
      UPDATE rooms
      SET goal = ?, days = ?, study_goal = ?, study_days = ?, updated_at = ?
      WHERE code = ?
    `).run(goal, days, studyGoal, studyDays, nowIso, roomCode);

    return { goal, days: JSON.parse(days), studyGoal, studyDays: JSON.parse(studyDays) };
  }

  addMember(roomCode, name) {
    const room = this.ensureRoom(roomCode);
    const members = JSON.parse(room.members || '[]');
    const trimmed = String(name || '').trim();
    if (trimmed && !members.includes(trimmed) && trimmed !== room.name) {
      members.push(trimmed);
      this.db.prepare('UPDATE rooms SET members = ?, updated_at = ? WHERE code = ?').run(
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
    this.db.prepare('UPDATE rooms SET members = ?, updated_at = ? WHERE code = ?').run(
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
    if (!trimmedNew) throw new Error('新名字不能为空');

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

    return { oldName: trimmedOld, newName: trimmedNew, name: trimmedNew };
  }

  clearRecords(roomCode) {
    this.ensureRoom(roomCode);
    this.db.prepare('DELETE FROM records_sport WHERE room_code = ?').run(roomCode);
    this.db.prepare('DELETE FROM records_study WHERE room_code = ?').run(roomCode);
    this.db.prepare('DELETE FROM record_likes WHERE room_code = ?').run(roomCode);
    this.db.prepare('UPDATE study_targets SET done_hours = 0 WHERE room_code = ?').run(roomCode);
    return true;
  }

  importState(roomCode, raw) {
    if (!raw || typeof raw !== 'object') throw new Error('导入数据格式不正确');
    const nowIso = new Date().toISOString();

    const name = String(raw.name || '帅哥').trim();
    const goal = Number.isFinite(raw.goal) ? Number(raw.goal) : 245;
    const days = JSON.stringify(Array.isArray(raw.days) ? raw.days : [1, 2, 6, 0]);
    const studyGoal = Number.isFinite(raw.studyGoal) ? Number(raw.studyGoal) : 120;
    const studyDays = JSON.stringify(Array.isArray(raw.studyDays) ? raw.studyDays : [1, 2, 3, 4, 5, 6]);
    const members = JSON.stringify(Array.isArray(raw.members) ? raw.members : DEFAULT_MEMBERS);

    this.db.prepare(`
      INSERT INTO rooms (code, name, goal, days, study_goal, study_days, members, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(code) DO UPDATE SET
        name = excluded.name,
        goal = excluded.goal,
        days = excluded.days,
        study_goal = excluded.study_goal,
        study_days = excluded.study_days,
        members = excluded.members,
        updated_at = excluded.updated_at
    `).run(roomCode, name, goal, days, studyGoal, studyDays, members, nowIso, nowIso);

    this.db.prepare('DELETE FROM records_sport WHERE room_code = ?').run(roomCode);
    this.db.prepare('DELETE FROM records_study WHERE room_code = ?').run(roomCode);
    this.db.prepare('DELETE FROM study_targets WHERE room_code = ?').run(roomCode);
    this.db.prepare('DELETE FROM habits WHERE room_code = ?').run(roomCode);
    this.db.prepare('DELETE FROM habit_logs WHERE room_code = ?').run(roomCode);
    this.db.prepare('DELETE FROM record_likes WHERE room_code = ?').run(roomCode);

    if (Array.isArray(raw.studyTargets)) {
      const ins = this.db.prepare('INSERT INTO study_targets (id, room_code, title, category, target_hours, done_hours, color, deadline, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
      raw.studyTargets.forEach((t, i) => {
        ins.run(t.id || 'st-' + (i + 1), roomCode, t.title || '学习目标', t.category || '自选', Number(t.targetHours) || 30, Number(t.doneHours) || 0, t.color || '#203f91', t.deadline || '本月', i + 1);
      });
    }

    if (Array.isArray(raw.habits)) {
      const ins = this.db.prepare('INSERT INTO habits (id, room_code, title, tag, icon, sort_order) VALUES (?, ?, ?, ?, ?, ?)');
      raw.habits.forEach((h, i) => {
        ins.run(h.id || 'hb-' + (i + 1), roomCode, h.title || '习惯项', h.tag || '行动', h.icon || 'star', i + 1);
      });
    }

    if (Array.isArray(raw.records)) {
      const ins = this.db.prepare('INSERT INTO records_sport (id, room_code, person, date, time, km, minutes, feel, note, tags, photo, likes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
      raw.records.forEach(r => {
        ins.run(Number(r.id) || Date.now(), roomCode, r.person || name, r.date || today(), r.time || '06:10', Number(r.km) || 5, Number(r.minutes) || 30, Number(r.feel ?? 3), r.note || '', JSON.stringify(r.tags || []), r.photo || '', Number(r.likes || 0), nowIso);
      });
    }

    if (Array.isArray(raw.studyRecords)) {
      const ins = this.db.prepare('INSERT INTO records_study (id, room_code, person, date, time, hours, minutes, focus, target_id, subject, note, tags, photo, likes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
      raw.studyRecords.forEach(s => {
        ins.run(Number(s.id) || Date.now(), roomCode, s.person || name, s.date || today(), s.time || '09:00', Number(s.hours) || 1.5, Number(s.minutes) || 90, Number(s.focus ?? 3), s.targetId || 'st-1', s.subject || '自习', s.note || '', JSON.stringify(s.tags || []), s.photo || '', Number(s.likes || 0), nowIso);
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

    return true;
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
