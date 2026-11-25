/**
 * RUN & STUDY LOG · Shared PK Leaderboard & Period Calculation (Beijing Time UTC+8)
 * Works identically in browser (window.RunStudyScore) and Node.js (require).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.RunStudyScore = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function pad(n) { return String(n).padStart(2, '0'); }

  function chinaNow(refDate) {
    const base = refDate ? new Date(refDate) : new Date();
    return new Date(base.toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }));
  }

  function dateKey(d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  function today(refDate) {
    return dateKey(chinaNow(refDate));
  }

  function dateShift(offsetDays, refDate) {
    const d = chinaNow(refDate);
    d.setDate(d.getDate() + offsetDays);
    return dateKey(d);
  }

  function weekStart(refDate) {
    const d = chinaNow(refDate);
    const day = (d.getDay() + 6) % 7; // Monday = 0
    return dateShift(-day, refDate);
  }

  function studySecondsOf(r) {
    if (!r) return 0;
    const sec = Number(r.seconds);
    if (Number.isFinite(sec) && sec > 0) return Math.round(sec);
    const min = Number(r.minutes);
    if (Number.isFinite(min) && min > 0) return Math.round(min * 60);
    const hrs = Number(r.hours);
    if (Number.isFinite(hrs) && hrs > 0) return Math.round(hrs * 3600);
    return 0;
  }

  function roundedStudyHours(val) {
    const num = Number(val);
    if (!Number.isFinite(num) || num <= 0) return 0;
    return Math.round(num * 100) / 100;
  }

  function totalSportKm(list) {
    return (list || []).reduce((s, r) => s + (Number(r.km) || 0), 0);
  }

  function totalStudyHours(list) {
    const totalSec = (list || []).reduce((s, r) => s + studySecondsOf(r), 0);
    return roundedStudyHours(totalSec / 3600);
  }

  function activeHabits(state) {
    return ((state && state.habits) || []).filter(h => !h.archived);
  }

  function habitRateForPerson(state, name, dk) {
    const list = activeHabits(state);
    const totalH = Math.max(1, list.length);
    const doneIds = (name === state.name)
      ? ((state.habitLogs && state.habitLogs[dk]) || [])
      : ((state.memberHabitLogs && state.memberHabitLogs[name] && state.memberHabitLogs[name][dk]) || []);
    const validDone = list.filter(h => doneIds.includes(h.id)).length;
    return { done: validDone, total: list.length, pct: Math.round(validDone / totalH * 100) };
  }

  function weeklyHabitPct(state, name, refDate) {
    let sum = 0;
    for (let i = 0; i < 7; i++) {
      sum += habitRateForPerson(state, name, dateShift(-i, refDate)).pct;
    }
    return Math.round(sum / 7);
  }

  function dualStreak(state, name, refDate) {
    const t = today(refDate);
    const dates = new Set([
      ...((state.records || []).filter(r => r.person === name).map(r => r.date)),
      ...((state.studyRecords || []).filter(r => r.person === name).map(r => r.date))
    ]);
    let s = 0;
    const start = dates.has(t) ? 0 : -1;
    for (let i = start; dates.has(dateShift(i, refDate)); i--) s++;
    return s;
  }

  function allMembersOf(state) {
    const owner = (state && state.name) || '帅哥';
    const members = Array.isArray(state && state.members) ? state.members.filter(Boolean) : [];
    return [owner, ...members.filter(m => m !== owner)];
  }

  function computePeriodDateRange(state, period, refDate) {
    const t = today(refDate);
    const records = (state && state.records) || [];
    const studyRecords = (state && state.studyRecords) || [];
    if (period === '今天') return { start: t, end: t, text: t, timezone: 'Asia/Shanghai' };
    if (period === '本周') {
      const start = weekStart(refDate);
      const end = dateShift(6 - ((chinaNow(refDate).getDay() + 6) % 7), refDate);
      const last = [...records, ...studyRecords].reduce((latest, r) => (r && r.date > latest ? r.date : latest), end);
      return { start, end: last, text: start + ' 至 ' + last, timezone: 'Asia/Shanghai' };
    }
    if (period === '本月') {
      const start = t.slice(0, 7) + '-01';
      const now = chinaNow(refDate);
      const end = dateKey(new Date(now.getFullYear(), now.getMonth() + 1, 0));
      return { start, end, text: start + ' 至 ' + end, timezone: 'Asia/Shanghai' };
    }
    const allDates = [...records, ...studyRecords].map(r => r && r.date).filter(Boolean).sort();
    if (allDates.length) {
      return { start: allDates[0], end: allDates[allDates.length - 1], text: allDates[0] + ' 至 ' + allDates[allDates.length - 1], timezone: 'Asia/Shanghai' };
    }
    return { start: t, end: t, text: '全部历史（至 ' + t + '）', timezone: 'Asia/Shanghai' };
  }

  function computeLeaderboard(state, period = '本月', metric = '综合积分', refDate) {
    const t = today(refDate);
    const ws = weekStart(refDate);
    const filterBy = list => (list || []).filter(r =>
      period === '总榜' || (period === '今天' ? r.date === t : period === '本周' ? r.date >= ws : (r.date || '').slice(0, 7) === t.slice(0, 7))
    );
    const sRecords = filterBy(state.records);
    const lRecords = filterBy(state.studyRecords);
    const rows = allMembersOf(state).map(name => {
      const sList = sRecords.filter(r => r.person === name);
      const lList = lRecords.filter(r => r.person === name);
      const km = totalSportKm(sList);
      const hrs = totalStudyHours(lList);
      const days = new Set([...sList.map(r => r.date), ...lList.map(r => r.date)]).size;
      const likes = sList.reduce((s, r) => s + (r.likes || 0), 0) + lList.reduce((s, r) => s + (r.likes || 0), 0);
      const hbRate = weeklyHabitPct(state, name, refDate);
      const score = Math.round(km * 10 + hrs * 25 + days * 15 + likes * 5 + hbRate * 0.5);
      return { name, sList, lList, km, hrs, days, likes, hbRate, score, streak: dualStreak(state, name, refDate) };
    }).sort((a, b) =>
      metric === '综合积分' ? b.score - a.score
      : metric === '按公里' ? b.km - a.km
      : metric === '按学习' ? b.hrs - a.hrs
      : metric === '按天数' ? b.days - a.days
      : b.likes - a.likes
    );
    return {
      period,
      metric,
      timezone: 'Asia/Shanghai',
      bonusNote: '综合积分含近 7 天自律达成率加分（自律率 × 0.5，不随所选周期变化）。',
      periodRange: computePeriodDateRange(state, period, refDate),
      rows
    };
  }

  return {
    chinaNow,
    dateKey,
    today,
    dateShift,
    weekStart,
    studySecondsOf,
    roundedStudyHours,
    totalSportKm,
    totalStudyHours,
    weeklyHabitPct,
    dualStreak,
    computePeriodDateRange,
    computeLeaderboard
  };
});
