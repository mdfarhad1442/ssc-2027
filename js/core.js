/* ==========================================================================
   SSC 2027 — Core: state, i18n, gamification, sync, alarms, audio, effects
   ========================================================================== */
(function () {
  'use strict';
  const D = window.SSC_DATA, E = window.SSC_ENGINE;
  const CFG = window.SSC_CONFIG || {};
  const KEY = 'ssc27_state_v1';
  const App = window.App = { D, E, CFG };

  /* ------------------------------ State ------------------------------ */
  const DEFAULT_REMINDERS = [
    { id: 'r1', time: '06:00', on: true }, { id: 'r2', time: '09:30', on: true }, { id: 'r3', time: '14:30', on: true },
    { id: 'r4', time: '18:00', on: true }, { id: 'r5', time: '21:30', on: true }
  ];
  function defaultState() {
    return {
      v: 1, profile: null, xp: 0, xpDay: {}, tasks: {}, steps: {}, tests: {}, reflections: {}, errors: [],
      focus: { sessions: [] }, activity: {},
      streak: { shields: 0, awarded: {}, best: 0, shielded: {}, lastCheck: null, comebackPending: false, comebackShown: null },
      badges: {}, celebrated: { weeks: {}, phases: {} },
      settings: { lang: 'bn', sound: true, haptics: true, notif: false, roast: 'funny', reminders: DEFAULT_REMINDERS.map(r => ({ ...r })), missCheck: true, missTime: '20:30', focusPreset: 'pomo', custom: 40 },
      sync: { registered: false, lastSync: 0, lastError: '' },
      squad: null, fired: {}, timer: null, ui: { installDismissed: false },
      custom: { rev: 0, items: {}, hide: {}, move: {}, min: {}, order: {} }
    };
  }
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaultState();
      const s = JSON.parse(raw);
      const d = defaultState();
      // shallow-merge to survive future additions
      Object.keys(d).forEach(k => { if (s[k] === undefined) s[k] = d[k]; });
      ['streak', 'settings', 'sync', 'celebrated', 'ui', 'focus', 'custom'].forEach(k => { s[k] = Object.assign({}, d[k], s[k] || {}); });
      if (!Array.isArray(s.settings.reminders)) s.settings.reminders = d.settings.reminders;
      return s;
    } catch (e) { console.warn('state load failed', e); return defaultState(); }
  }
  let S = load();
  App.S = () => S;
  let saveT = null;
  function save(now) {
    clearTimeout(saveT);
    const run = () => {
      try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { console.warn(e); }
      mirrorForSW();
      if (App.native) App.native.onSave();
    };
    if (now) run(); else saveT = setTimeout(run, 120);
  }
  App.save = save;
  App.resetAll = function () { localStorage.removeItem(KEY); S = defaultState(); PLAN = null; EFF = null; if ('caches' in window) caches.delete('ssc-state').catch(() => {}); };
  App.replaceState = function (obj) { S = Object.assign(defaultState(), obj); PLAN = null; EFF = null; customState(); save(true); };

  // Small state snapshot readable by the Service Worker (for background nudges)
  function mirrorForSW() {
    if (window.SSCAndroid || !('caches' in window) || !S.profile) return;
    const today = todayKey();
    const t = todayTasks();
    const snap = {
      name: S.profile.name, lang: S.settings.lang, roast: S.settings.roast, today,
      done: t.filter(x => isDone(x.id)).length, total: t.length, lastActive: lastActiveDate(),
      reminders: S.settings.reminders, missTime: S.settings.missTime, missCheck: S.settings.missCheck, ts: Date.now()
    };
    caches.open('ssc-state').then(c => c.put(new Request('./__state.json'), new Response(JSON.stringify(snap), { headers: { 'Content-Type': 'application/json' } }))).catch(() => {});
  }

  /* ------------------------------ i18n ------------------------------ */
  const BN_DIG = '০১২৩৪৫৬৭৮৯';
  const isBn = () => S.settings.lang !== 'en';
  const L = (bn, en) => (isBn() ? bn : (en == null ? bn : en));
  const N = (x) => { const s = String(x); return isBn() ? s.replace(/[0-9]/g, d => BN_DIG[d]) : s; };
  const pad2 = (n) => String(n).padStart(2, '0');
  const WD_BN = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];
  const WD_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const WDF_BN = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
  const MO_BN = ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'];
  const MO_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const wd = (d) => L(WD_BN[d.getDay()], WD_EN[d.getDay()]);
  const wdFull = (d) => L(WDF_BN[d.getDay()], d.toLocaleDateString('en-US', { weekday: 'long' }));
  const fmtDate = (d) => N(d.getDate()) + ' ' + L(MO_BN[d.getMonth()], MO_EN[d.getMonth()]);
  const mins = (m) => { m = Math.round(m); if (m < 60) return N(m) + L(' মি.', ' min'); const h = Math.floor(m / 60), r = m % 60; return N(h) + L(' ঘ.', 'h') + (r ? ' ' + N(r) + L(' মি.', 'm') : ''); };
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  Object.assign(App, { L, N, pad2, wd, wdFull, fmtDate, mins, esc, isBn });

  /* ------------------------------ Dates ------------------------------ */
  const dateKey = (d) => d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  const todayKey = () => dateKey(new Date());
  const parseKey = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const diffDays = (a, b) => Math.round((parseKey(dateKey(a)) - parseKey(dateKey(b))) / 86400000);
  function weekStartKey(d) { d = d || new Date(); const back = (d.getDay() + 1) % 7; return dateKey(addDays(d, -back)); } // Saturday start
  Object.assign(App, { dateKey, todayKey, parseKey, addDays, diffDays, weekStartKey });

  /* ------------------------------ Plan ------------------------------ */
  let PLAN = null, EFF = null, EFFKEY = '';
  function basePlan() {
    if (!S.profile) return null;
    if (!PLAN || PLAN.group !== S.profile.group) PLAN = E.generate(S.profile.group);
    return PLAN;
  }
  /* Custom plan overlay: the generated 90-day plan stays untouched; the student's edits
     (hide / move / minutes / order / own tasks) are applied on top and cached by revision. */
  function customState() {
    const c = S.custom || (S.custom = {});
    ['items', 'hide', 'move', 'min', 'order', 'writing'].forEach(k => { if (!c[k] || typeof c[k] !== 'object') c[k] = {}; });
    if (typeof c.rev !== 'number') c.rev = 0;
    return c;
  }
  function plan() {
    const b = basePlan(); if (!b) return null;
    const c = customState();
    const key = b.group + ':' + c.rev;
    if (EFF && EFFKEY === key) return EFF;
    EFF = applyCustom(b, c); EFFKEY = key;
    return EFF;
  }
  function applyCustom(b, c) {
    const empty = (o) => { for (const k in o) return false; return true; };
    const WR = c.writing || {};
    const wrKeys = Object.keys(WR).filter(k => WR[k] && Array.isArray(WR[k].items) && WR[k].items.length);
    if (empty(c.items) && empty(c.hide) && empty(c.move) && empty(c.min) && empty(c.order) && !wrKeys.length) return b;
    const wrSet = {}; wrKeys.forEach(k => { wrSet[k] = 1; });
    const tasks = {}; const byDay = {};
    const push = (t) => { (byDay[t.day] = byDay[t.day] || []).push(t.id); };
    for (let d = 1; d <= 90; d++) {
      (b.byDay[d] || []).forEach(id => {
        const t = b.tasks[id]; if (c.hide[id]) return;
        if (t.kind === 'write' && wrSet[t.sub + ':' + t.chs[0]]) return; // replaced by the student's own list
        let nt = t; const mv = +c.move[id], mn = +c.min[id];
        if (mv || mn) { nt = Object.assign({}, t); if (mv >= 1 && mv <= 90) { nt.day = mv; nt.w = weekOfDay(mv); nt.moved = true; } if (mn > 0) nt.min = mn; }
        tasks[id] = nt;
      });
    }
    // Writing lists (paragraphs, essays, letters…) → spread evenly over the chosen weeks
    wrKeys.forEach((k, ci) => {
      const cat = WR[k]; const sub = k.split(':')[0], n = +k.split(':')[1];
      if (!D.SUBJECTS[sub]) return;
      const from = Math.min(12, Math.max(1, +cat.from || 1)), to = Math.min(12, Math.max(from, +cat.to || 11));
      const nW = to - from + 1, P = cat.items.length;
      const wkOf = cat.items.map((_, i) => Math.floor(i * nW / P));
      const per = new Array(nW).fill(0); wkOf.forEach(x => per[x]++);
      const seen = new Array(nW).fill(0);
      const bm = Math.max(5, +cat.min || (D.WRITE_META[k] || {}).min || D.KINDS.write.min);
      cat.items.forEach((it, i) => {
        const wi = wkOf[i], w = from + wi; const [s0, e0] = D.WEEK_RANGES[w - 1];
        const study = Math.max(1, e0 - s0); // keep the weekly review day light
        const dIdx = (Math.floor((seen[wi]++ + 0.5) * study / per[wi]) + ci * 2) % study;
        const baseDay = s0 + dIdx; const id = 'wr-' + it.id;
        if (c.hide[id]) return;
        const mv = +c.move[id], mn = +c.min[id];
        const day = mv >= 1 && mv <= 90 ? mv : baseDay;
        tasks[id] = { id, wr: true, wrKey: k, title: String(it.t || ''), sub, chs: [n], kind: 'write', min: mn > 0 ? mn : bm, baseMin: bm, baseDay, day, w: weekOfDay(day), moved: day !== baseDay, steps: D.KINDS.write.steps.slice() };
      });
    });
    Object.values(c.items).forEach(it => {
      const K = D.KINDS[it.kind] ? it.kind : 'custom';
      (it.days || []).forEach(d => {
        if (!(d >= 1 && d <= 90)) return;
        const id = it.id + '@' + d;
        tasks[id] = { id, cid: it.id, custom: true, title: it.title || '', note: it.note || '', sub: it.sub || '', chs: (it.chs || []).slice(), kind: K, min: +c.min[id] || it.min || 30, steps: it.sub && it.chs && it.chs.length ? D.KINDS[K].steps.slice() : [], day: d, w: weekOfDay(d) };
      });
    });
    Object.values(tasks).forEach(push);
    Object.keys(byDay).forEach(d => {
      const ord = c.order[d];
      if (ord && ord.length) { const pos = {}; ord.forEach((id, i) => { pos[id] = i; }); byDay[d].sort((x, y) => (x in pos ? pos[x] : 1e3) - (y in pos ? pos[y] : 1e3)); }
    });
    const weeks = b.weeks.map(wk => Object.assign({}, wk, { days: wk.days.map(dd => ({ day: dd.day, ids: byDay[dd.day] || [] })) }));
    return Object.assign({}, b, { tasks, byDay, weeks, totalTasks: Object.keys(tasks).length, customized: true });
  }
  function customChanged() { customState().rev++; save(); }
  App.plan = plan; App.basePlan = basePlan; App.customState = customState; App.customChanged = customChanged;
  function rawDay() { if (!S.profile) return 1; return diffDays(new Date(), parseKey(S.profile.startDate)) + 1; }
  function currentDay() { return Math.min(90, Math.max(1, rawDay())); }
  function dateOfDay(n) { return addDays(parseKey(S.profile.startDate), n - 1); }
  function weekOfDay(day) { return D.WEEK_RANGES.findIndex(([s, e]) => day >= s && day <= e) + 1 || 12; }
  const isDone = (id) => !!S.tasks[id];
  function tasksOfDay(day) { const p = plan(); return (p.byDay[day] || []).map(id => p.tasks[id]); }
  function todayTasks() { if (!S.profile) return []; const r = rawDay(); if (r < 1 || r > 90) return []; return tasksOfDay(r); }
  function weekTasks(w) { const p = plan(); return p.weeks[w - 1].days.flatMap(d => d.ids.map(id => p.tasks[id])); }
  function weekProgress(w) { const t = weekTasks(w); return t.length ? t.filter(x => isDone(x.id)).length / t.length : 0; }
  function phaseProgress(ph) { const P = D.PHASES[ph - 1]; let d = 0, n = 0; for (let w = P.weeks[0]; w <= P.weeks[1]; w++) { const t = weekTasks(w); n += t.length; d += t.filter(x => isDone(x.id)).length; } return n ? d / n : 0; }
  function overallProgress() { const p = plan(); const ids = Object.keys(p.tasks); return ids.length ? ids.filter(isDone).length / ids.length : 0; }
  function weekUnlocked(w) { if (w === 1) return true; const s = D.WEEK_RANGES[w - 1][0]; return rawDay() >= s || weekProgress(w - 1) >= 0.8 || !!S.celebrated.weeks[w - 1]; }
  function backlog() {
    const r = Math.min(rawDay(), 91); const out = [];
    for (let d = 1; d < r; d++) tasksOfDay(d).forEach(t => { if (!isDone(t.id) && t.kind !== 'reflect' && t.kind !== 'buffer') out.push(t); });
    return out;
  }
  Object.assign(App, { rawDay, currentDay, dateOfDay, weekOfDay, isDone, tasksOfDay, todayTasks, weekTasks, weekProgress, phaseProgress, overallProgress, weekUnlocked, backlog });

  /* ------------------------ Subjects & chapters ------------------------ */
  function subName(k, short) {
    if (!k) return L('সব বিষয়', 'All subjects');
    const s = D.SUBJECTS[k];
    if (k === 'rel' && S.profile && S.profile.religion && D.RELIGIONS[S.profile.religion]) { const r = D.RELIGIONS[S.profile.religion]; return short ? L('ধর্ম', 'Religion') : L(r.bn, r.en); }
    return short ? L(s.short, s.en) : L(s.bn, s.en);
  }
  function chapter(sub, n) { return D.SUBJECTS[sub].chapters[n - 1]; }
  function chLabel(sub, n, withTitle = true) {
    const c = chapter(sub, n); if (!c) return '';
    const s = D.SUBJECTS[sub];
    if (s.unit === 'item') return c.t;
    if (sub === 'rel' && S.profile && S.profile.religion !== 'islam') return L('অধ্যায় ', 'Chapter ') + N(pad2(n));
    return L('অধ্যায় ', 'Ch ') + N(pad2(n)) + (withTitle ? ': ' + c.t : '');
  }
  const stepBits = (sub, n) => S.steps[sub + ':' + n] || 0;
  const stepDone = (sub, n, st) => !!(stepBits(sub, n) & (1 << (st - 1)));
  const stepCount = (sub, n) => { const b = stepBits(sub, n); return (b & 1) + ((b >> 1) & 1) + ((b >> 2) & 1) + ((b >> 3) & 1); };
  function subjectStats(sub) {
    const chs = D.SUBJECTS[sub].chapters; let steps = 0, done = 0, started = 0;
    chs.forEach(c => { const k = stepCount(sub, c.n); steps += k; if (k === 4) done++; else if (k > 0) started++; });
    return { pct: steps / (chs.length * 4), done, started, left: chs.length - done - started, total: chs.length };
  }
  function masteredChapters() { let n = 0; Object.keys(S.steps).forEach(k => { const b = S.steps[k]; if ((b & 15) === 15) n++; }); return n; }
  function setStep(sub, n, st, on, award) {
    const k = sub + ':' + n; const b = S.steps[k] || 0; const bit = 1 << (st - 1);
    const was = !!(b & bit);
    if (was === on) return 0;
    S.steps[k] = on ? (b | bit) : (b & ~bit);
    if (!S.steps[k]) delete S.steps[k];
    let xp = 0;
    if (award) { xp = on ? 8 : -8; addXp(xp, null, true); }
    if (on && (S.steps[k] & 15) === 15) { checkBadges(); }
    save();
    return xp;
  }
  Object.assign(App, { subName, chapter, chLabel, stepBits, stepDone, stepCount, subjectStats, masteredChapters, setStep });

  function taskTitle(t) {
    if (t.wr) return t.title;
    if (t.custom) return t.title || (t.sub ? subName(t.sub) : L('নিজের কাজ', 'My task'));
    return subName(t.sub);
  }
  function taskSubtitle(t) {
    if (t.wr) { const ch = chapter(t.sub, t.chs[0]); return subName(t.sub, true) + ' · ' + (ch ? ch.t : ''); }
    if (t.kind === 'write' && t.chs.length === 1) { const ch = chapter(t.sub, t.chs[0]); return (ch ? ch.t : '') + L(' — নিজের তালিকা দাও ✍️', ' — add your own list ✍️'); }
    if (t.custom) {
      const parts = [];
      if (t.title && t.sub) parts.push(subName(t.sub, true));
      if (t.sub && t.chs.length) parts.push(t.chs.length === 1 ? chLabel(t.sub, t.chs[0]) : L('অধ্যায় ', 'Ch ') + t.chs.map(n => N(n)).join(', '));
      if (t.note) parts.push(t.note);
      return parts.join(' · ') || L('তোমার নিজের যোগ করা কাজ', 'A task you added');
    }
    if (t.kind === 'model') return L('পূর্ণাঙ্গ সিলেবাস · বোর্ড স্ট্যান্ডার্ড', 'Full syllabus · board standard');
    if (t.kind === 'wtest') { const ts = plan().tests[t.testId]; return testTitle(ts); }
    if (t.kind === 'recall') return L('সব সূত্র, সংজ্ঞা, চিত্র ও সাজেশন ঝালাই', 'All formulas, definitions & diagrams');
    if (t.kind === 'weak') return L('Error Log থেকে সবচেয়ে দুর্বল টপিকগুলো', 'Weakest topics from your error log');
    if (t.kind === 'reflect') return L('এই সপ্তাহ কেমন গেল? ২ মিনিটে লিখে ফেলো', 'How did this week go? Write in 2 min');
    if (t.kind === 'errrev') return L('এই সপ্তাহের ভুলগুলো আরেকবার দেখে নাও', "Review this week's mistakes");
    if (t.kind === 'buffer') return L('বাকি থাকা কাজ শেষ করো বা আগের অধ্যায় ঝালাই', 'Catch up on pending work or revise');
    if (t.kind === 'prac') return L('ব্যবহারিক খাতা লেখা ও পরীক্ষণ রিভিশন', 'Practical notebook & experiments');
    if (!t.chs.length) return '';
    const s = D.SUBJECTS[t.sub];
    if (s.unit === 'item') return t.chs.map(n => chapter(t.sub, n).t).join(' · ');
    if (t.chs.length === 1) return chLabel(t.sub, t.chs[0]);
    return L('অধ্যায় ', 'Ch ') + t.chs.map(n => N(n)).join(', ');
  }
  function testTitle(ts) {
    if (!ts) return '';
    const kind = ts.type === 'model' ? L('মডেল টেস্ট', 'Model test') : ts.type === 'half' ? L('হাফ-বুক / টেস্ট পেপার', 'Half-book / test paper') : L('সাপ্তাহিক পরীক্ষা', 'Weekly test');
    return subName(ts.sub) + ' — ' + kind;
  }
  const xpForTask = (t) => t.custom ? Math.max(5, Math.min(25, Math.round(t.min / 4))) : Math.max(10, Math.min(60, Math.round(t.min / 3)));
  const CUSTOM_XP_DAY = 150;
  Object.assign(App, { taskTitle, taskSubtitle, testTitle, xpForTask });

  /* ---------------------------- XP & Levels ---------------------------- */
  const xpNeed = (L_) => 60 * (L_ - 1) * L_;
  function levelOf(xp) { let l = 1; while (xpNeed(l + 1) <= xp) l++; return l; }
  function levelInfo(xp = S.xp) {
    const l = levelOf(xp), a = xpNeed(l), b = xpNeed(l + 1);
    const nm = D.LEVEL_NAMES[Math.min(l - 1, D.LEVEL_NAMES.length - 1)];
    return { level: l, name: L(nm[0], nm[1]), into: xp - a, span: b - a, pct: (xp - a) / (b - a), toNext: b - xp };
  }
  function addXp(n, evt, silent) {
    if (!n) return;
    const before = levelOf(S.xp);
    S.xp = Math.max(0, S.xp + n);
    const k = todayKey(); S.xpDay[k] = Math.max(0, (S.xpDay[k] || 0) + n);
    if (n > 0 && evt) App.fx.xpFloat(n, evt);
    const after = levelOf(S.xp);
    if (after > before) setTimeout(() => App.ui.celebrate({ type: 'level', title: L('লেভেল আপ! ', 'Level up! ') + N(after), text: levelInfo().name, xp: 0 }), silent ? 300 : 900);
    checkBadges();
    scheduleSync();
    save();
  }
  function weekXp() { const ws = weekStartKey(); return Object.keys(S.xpDay).filter(k => k >= ws).reduce((a, k) => a + S.xpDay[k], 0); }
  Object.assign(App, { levelInfo, addXp, weekXp, levelOf });

  /* ------------------------------ Streak ------------------------------ */
  function isActive(k) { const a = S.activity[k]; return !!((a && (a.t > 0 || a.m >= 10)) || S.streak.shielded[k]); }
  function streakNow() {
    let d = new Date(); if (!isActive(dateKey(d))) d = addDays(d, -1);
    let c = 0; while (isActive(dateKey(d)) && c < 400) { c++; d = addDays(d, -1); }
    return c;
  }
  function lastActiveDate() { const ks = Object.keys(S.activity).filter(k => S.activity[k].t > 0 || S.activity[k].m >= 10).sort(); return ks.length ? ks[ks.length - 1] : null; }
  function bumpActivity(field, delta) {
    const k = todayKey(); const a = S.activity[k] || (S.activity[k] = { t: 0, m: 0 });
    a[field] = Math.max(0, (a[field] || 0) + delta);
    const s = streakNow();
    if (s > S.streak.best) S.streak.best = s;
    if (s >= 7) {
      const start = dateKey(addDays(new Date(isActive(todayKey()) ? new Date() : addDays(new Date(), -1)), -(s - 1)));
      const key = start + ':' + Math.floor(s / 7);
      if (!S.streak.awarded[key]) {
        S.streak.awarded[key] = 1;
        if (S.streak.shields < 2) { S.streak.shields++; App.ui.toast(L('৭ দিনের স্ট্রিক! একটা স্ট্রিক শিল্ড পেলে 🛡️', '7-day streak! You earned a streak shield 🛡️'), '🛡️'); }
      }
    }
    if (delta > 0 && S.streak.comebackPending) {
      S.streak.comebackPending = false;
      award('comeback');
      setTimeout(() => { addXp(20, null, true); App.ui.toast(L('কামব্যাক বোনাস +২০ XP! ফিরে আসার জন্য ধন্যবাদ 💪', 'Comeback bonus +20 XP 💪'), '💪'); }, 700);
    }
  }
  function dailyCheck() {
    if (!S.profile) return;
    const today = todayKey();
    if (S.streak.lastCheck === today) return;
    S.streak.lastCheck = today;
    const y = dateKey(addDays(new Date(), -1)), yy = dateKey(addDays(new Date(), -2));
    const last = lastActiveDate();
    if (last && !isActive(y) && last < y) {
      if (isActive(yy) && S.streak.shields > 0) {
        S.streak.shields--; S.streak.shielded[y] = 1;
        setTimeout(() => App.ui.toast(L('গতকাল মিস হয়েছিল, কিন্তু স্ট্রিক শিল্ড তোমার স্ট্রিক বাঁচিয়েছে 🛡️', 'Missed yesterday — a shield saved your streak 🛡️'), '🛡️', 4500), 1200);
      } else {
        S.streak.comebackPending = true;
      }
    }
    // clean old fired alarm keys
    Object.keys(S.fired).forEach(k => { if (!k.startsWith(today)) delete S.fired[k]; });
    save();
  }
  Object.assign(App, { streakNow, isActive, dailyCheck, lastActiveDate, bumpActivity });

  /* ------------------------------ Tasks ------------------------------ */
  function completeTask(id, evt, opts = {}) {
    const p = plan(); const t = p.tasks[id]; if (!t || isDone(id)) return;
    let xp = xpForTask(t);
    if (t.custom) {
      // own tasks give a little XP, capped per day so the leaderboard stays fair
      const k = todayKey(); let used = 0;
      for (const tid in S.tasks) { const r = S.tasks[tid]; if (r.c && r.d === k) used += r.xp || 0; }
      xp = Math.max(0, Math.min(xp, CUSTOM_XP_DAY - used));
    }
    S.tasks[id] = { at: Date.now(), d: todayKey(), xp };
    if (t.custom) S.tasks[id].c = 1;
    (t.steps || []).forEach(st => t.chs.forEach(n => setStep(t.sub, n, st, true, false)));
    bumpActivity('t', 1);
    addXp(xp, evt);
    if (new Date().getHours() < 7) award('early');
    App.sfx.play('done'); App.haptic(18);
    if (!opts.quiet) App.ui.toast(isBn() ? rand(D.MSG.done) : rand(['Great! One more step 🚀', 'Awesome! Keep going ✨', 'Nice! Small steps, big progress 💜']), '✨', 1600);
    checkMilestones(t.w);
    save();
  }
  function undoTask(id) {
    const r = S.tasks[id]; if (!r) return;
    delete S.tasks[id];
    S.xp = Math.max(0, S.xp - (r.xp || 0));
    if (S.xpDay[r.d]) S.xpDay[r.d] = Math.max(0, S.xpDay[r.d] - (r.xp || 0));
    const a = S.activity[r.d]; if (a) a.t = Math.max(0, a.t - 1);
    App.sfx.play('tick'); App.haptic(8);
    scheduleSync(); save();
  }
  // Rocket/trophy bonuses need most of the original week to still be in the plan
  // (hiding tasks is allowed, but it can't be used to farm the +100 XP week bonus).
  function weekFair(w) {
    const b = basePlan(); if (!b || !b.weeks[w - 1]) return true;
    const baseN = b.weeks[w - 1].days.reduce((a, d) => a + d.ids.filter(id => b.tasks[id].kind !== 'write').length, 0);
    const keep = weekTasks(w).filter(t => !t.custom && t.kind !== 'write').length;
    return keep >= Math.ceil(baseN * 0.6);
  }
  App.weekFair = weekFair;
  function checkMilestones(w) {
    if (!w) return;
    if (!S.celebrated.weeks[w] && weekProgress(w) >= 0.9 && weekFair(w)) {
      S.celebrated.weeks[w] = Date.now();
      award('week1');
      setTimeout(() => { addXp(100, null, true); App.ui.celebrate({ type: 'rocket', title: L('সপ্তাহ ', 'Week ') + N(w) + L(' জয়! 🚀', ' conquered! 🚀'), text: L('দারুণ ধারাবাহিকতা! পরের সপ্তাহের রকেট রেডি।', 'Amazing consistency! Next rocket is ready.'), xp: 100 }); }, 650);
    }
    D.PHASES.forEach(P => {
      if (S.celebrated.phases[P.n]) return;
      let all = true; for (let x = P.weeks[0]; x <= P.weeks[1]; x++) if (!S.celebrated.weeks[x]) all = false;
      if (all) {
        S.celebrated.phases[P.n] = Date.now();
        setTimeout(() => { addXp(300, null, true); App.ui.celebrate({ type: 'trophy', title: L('ফেজ ', 'Phase ') + N(P.n) + L(' ট্রফি জিতেছ! 🏆', ' trophy unlocked! 🏆'), text: L(P.bn, P.en) + L(' সম্পন্ন। তুমি অসাধারণ!', ' complete. You are amazing!'), xp: 300 }); }, 3800);
      }
    });
    save();
  }
  Object.assign(App, { completeTask, undoTask, checkMilestones });

  /* ------------------------------ Badges ------------------------------ */
  function award(id) {
    if (S.badges[id]) return false;
    S.badges[id] = Date.now();
    const b = D.BADGES.find(x => x.id === id);
    if (b) setTimeout(() => App.ui.toast(L('নতুন ব্যাজ: ', 'New badge: ') + L(b.bn, b.en), b.e, 3000), 400);
    save();
    return true;
  }
  function checkBadges() {
    const done = Object.keys(S.tasks).length;
    if (done >= 1) award('first_task');
    if (done >= 50) award('tasks50');
    if (done >= 150) award('tasks150');
    const st = Math.max(streakNow(), S.streak.best);
    if (st >= 3) award('streak3'); if (st >= 7) award('streak7'); if (st >= 21) award('streak21'); if (st >= 45) award('streak45');
    const fm = S.focus.sessions.reduce((a, s) => a + s.m, 0);
    if (S.focus.sessions.length) award('focus1'); if (fm >= 600) award('focus10h'); if (fm >= 3000) award('focus50h');
    const mc = masteredChapters(); if (mc >= 1) award('chapter1'); if (mc >= 10) award('chapter10');
    if (S.errors.length >= 10) award('error10');
    if (S.errors.filter(e => e.mastered).length >= 10) award('errfix10');
    const ts = Object.values(S.tests); if (ts.length) award('test1'); if (ts.some(t => t.total && t.got / t.total >= 0.8)) award('test80');
    if (Object.keys(S.reflections).length >= 4) award('reflect4');
    const lv = levelOf(S.xp); if (lv >= 5) award('level5'); if (lv >= 10) award('level10');
  }
  Object.assign(App, { award, checkBadges });

  /* ------------------------------ Helpers ------------------------------ */
  const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
  App.rand = rand;
  App.haptic = (ms) => { if (!S.settings.haptics) return; if (App.native) return App.native.vibrate(ms); if (navigator.vibrate) try { navigator.vibrate(ms); } catch (e) {} };
  App.uidGen = function (group) {
    const A = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    const r = new Uint8Array(6); (window.crypto || {}).getRandomValues ? crypto.getRandomValues(r) : r.forEach((_, i) => r[i] = Math.random() * 255);
    return 'S27-' + (D.GROUPS[group] ? D.GROUPS[group].code : 'XX') + '-' + Array.from(r).map(x => A[x % A.length]).join('');
  };
  App.tokenGen = function () { const r = new Uint8Array(16); crypto.getRandomValues(r); return Array.from(r).map(x => x.toString(16).padStart(2, '0')).join(''); };
  App.colorFor = function (str) { const c = ['#7B61FF', '#1FB383', '#FF8A5C', '#3D8BFF', '#D2457A', '#0B9DB0', '#A855D6', '#E0A100']; let h = 0; for (const ch of String(str)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return c[h % c.length]; };
  App.initials = (name) => { const p = String(name || '?').trim().split(/\s+/); return (p[0] || '?').slice(0, 1).toUpperCase() + (p[1] ? p[1].slice(0, 1).toUpperCase() : ''); };
  App.schoolKey = (s) => String(s || '').toLowerCase().replace(/[০-৯]/g, d => BN_DIG.indexOf(d)).replace(/[\s.,'"()\-_/]+/g, '').replace(/school|highschool|বিদ্যালয়|উচ্চবিদ্যালয়/g, m => m.includes('school') ? 'school' : 'বিদ্যালয়');

  /* ------------------------------ Sync / API ------------------------------ */
  const hasApi = () => !!(CFG.API_URL && /^https:\/\//.test(CFG.API_URL));
  App.hasApi = hasApi;
  async function api(action, payload = {}, method = 'POST', timeout = 15000) {
    if (!hasApi()) throw new Error('NO_API');
    const ctl = new AbortController(); const tm = setTimeout(() => ctl.abort(), timeout);
    try {
      let res;
      if (method === 'GET') {
        const q = new URLSearchParams(Object.assign({ action }, payload)).toString();
        res = await fetch(CFG.API_URL + '?' + q, { method: 'GET', signal: ctl.signal, redirect: 'follow' });
      } else {
        res = await fetch(CFG.API_URL, { method: 'POST', body: JSON.stringify(Object.assign({ action }, payload)), headers: { 'Content-Type': 'text/plain;charset=utf-8' }, signal: ctl.signal, redirect: 'follow' });
      }
      const j = await res.json();
      if (!j.ok) { const e = new Error(j.error || 'SERVER_ERROR'); e.code = j.code; throw e; }
      return j;
    } finally { clearTimeout(tm); }
  }
  App.api = api;
  function profilePayload() {
    const p = S.profile;
    return { uid: p.uid, token: p.token, name: p.name, roll: p.roll, school: p.school, district: p.district || '', mobile: p.mobile, group: p.group, religion: p.religion, anon: p.anon ? 1 : 0, startDate: p.startDate || '' };
  }
  async function register() {
    const j = await api('register', profilePayload());
    if (j.uid && j.uid !== S.profile.uid) S.profile.uid = j.uid;
    S.sync.registered = true; S.sync.lastError = ''; save(true);
    return j;
  }
  App.register = register;
  let syncT = null, syncing = false;
  function scheduleSync(delay = 6000) { clearTimeout(syncT); syncT = setTimeout(syncNow, delay); }
  async function syncNow() {
    if (!S.profile || !hasApi() || syncing || !navigator.onLine) return false;
    syncing = true;
    try {
      if (!S.sync.registered) await register();
      const li = levelInfo();
      const j = await api('sync', { uid: S.profile.uid, token: S.profile.token, xp: S.xp, level: li.level, streak: streakNow(), weekXp: weekXp(), weekKey: weekStartKey(), anon: S.profile.anon ? 1 : 0, squad: S.squad ? S.squad.code : '' });
      S.sync.lastSync = Date.now(); S.sync.lastError = '';
      if (j.rank) S.sync.rank = j.rank;
      save();
      return true;
    } catch (e) {
      S.sync.lastError = String(e.message || e);
      if (e.code === 'NOT_FOUND') S.sync.registered = false;
      save();
      return false;
    } finally { syncing = false; }
  }
  App.syncNow = syncNow; App.scheduleSync = scheduleSync;
  function beaconSync() {
    if (!S.profile || !hasApi() || !S.sync.registered || !navigator.sendBeacon) return;
    try {
      const li = levelInfo();
      const body = JSON.stringify({ action: 'sync', uid: S.profile.uid, token: S.profile.token, xp: S.xp, level: li.level, streak: streakNow(), weekXp: weekXp(), weekKey: weekStartKey(), anon: S.profile.anon ? 1 : 0, squad: S.squad ? S.squad.code : '' });
      navigator.sendBeacon(CFG.API_URL, new Blob([body], { type: 'text/plain;charset=utf-8' }));
    } catch (e) {}
  }
  App.beaconSync = beaconSync;

  /* ------------------------------ Audio ------------------------------ */
  let actx = null, alarmLoop = null;
  function ctx() { if (!actx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; actx = new C(); } if (actx.state === 'suspended') actx.resume(); return actx; }
  let liveTones = 0;
  function tone(freq, start, dur, type = 'sine', vol = 0.18) {
    if (liveTones > 14) return; // rapid taps: never pile up audio nodes
    const c = ctx(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain();
    liveTones++; o.onended = () => { liveTones = Math.max(0, liveTones - 1); try { o.disconnect(); g.disconnect(); } catch (e) {} };
    o.type = type; o.frequency.setValueAtTime(freq, c.currentTime + start);
    g.gain.setValueAtTime(0.0001, c.currentTime + start);
    g.gain.exponentialRampToValueAtTime(vol, c.currentTime + start + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur);
    o.connect(g); g.connect(c.destination); o.start(c.currentTime + start); o.stop(c.currentTime + start + dur + 0.05);
  }
  App.sfx = {
    unlock() { try { ctx(); } catch (e) {} },
    play(name) {
      if (!S.settings.sound) return;
      const now = Date.now(); this._last = this._last || {};
      if (now - (this._last[name] || 0) < 90) return; this._last[name] = now;
      try {
        if (name === 'tick') tone(660, 0, 0.08, 'triangle', 0.08);
        else if (name === 'done') { tone(784, 0, 0.12, 'triangle', 0.14); tone(1175, 0.08, 0.2, 'triangle', 0.12); }
        else if (name === 'level') [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.3, 'triangle', 0.14));
        else if (name === 'start') { tone(440, 0, 0.12, 'sine', 0.12); tone(660, 0.1, 0.18, 'sine', 0.12); }
        else if (name === 'finish') [659, 784, 988, 1319].forEach((f, i) => tone(f, i * 0.13, 0.4, 'sine', 0.16));
        else if (name === 'pop') tone(520, 0, 0.06, 'sine', 0.06);
      } catch (e) {}
    },
    alarmStart() {
      this.alarmStop();
      const ring = () => { try { [880, 1046, 880, 1046, 1318].forEach((f, i) => tone(f, i * 0.16, 0.14, 'square', 0.07)); } catch (e) {} if (navigator.vibrate) try { navigator.vibrate([300, 120, 300]); } catch (e) {} };
      ring(); alarmLoop = setInterval(ring, 1700);
      setTimeout(() => this.alarmStop(), 60000);
    },
    alarmStop() { if (alarmLoop) { clearInterval(alarmLoop); alarmLoop = null; } }
  };

  /* ------------------------------ Effects ------------------------------ */
  App.fx = {
    xpFloat(n, evt) {
      const live = document.querySelectorAll('.xp-float');
      if (live.length >= 3) live[0].remove();
      const x = evt && evt.clientX ? evt.clientX : window.innerWidth / 2;
      const y = evt && evt.clientY ? evt.clientY : window.innerHeight / 2;
      const el = document.createElement('div');
      el.className = 'xp-float'; el.textContent = '+' + N(n) + ' XP';
      el.style.left = x + 'px'; el.style.top = (y - 20) + 'px';
      document.body.appendChild(el); setTimeout(() => el.remove(), 1200);
    },
    // One shared particle system: new bursts are ADDED to the running animation (capped),
    // the canvas is only resized when the viewport changes — no memory spikes on rapid taps.
    _cf: null,
    confetti(amount = 90, origin) {
      const cv = document.getElementById('fx'); if (!cv) return;
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (document.hidden) return;
      const lite = document.documentElement.classList.contains('lite');
      const st = this._cf || (this._cf = { ps: [], raf: 0, c: null, w: 0, h: 0, dpr: 1 });
      // Measure the CONTAINER, never the canvas itself: a canvas' layout size follows its pixel
      // buffer, so measuring it and multiplying by devicePixelRatio grew the buffer ~3× on every
      // task completion → after a few taps the renderer ran out of memory and the app crashed.
      const host = cv.parentElement || document.body;
      const r = host.getBoundingClientRect();
      const dpr = Math.min(lite ? 1.25 : 2, window.devicePixelRatio || 1);
      const W = Math.min(2048, Math.max(1, Math.round(r.width * dpr))), H = Math.min(4096, Math.max(1, Math.round(r.height * dpr)));
      if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; st.c = null; }
      if (!st.c) st.c = cv.getContext('2d');
      st.w = r.width; st.h = r.height; st.dpr = dpr;
      const MAX = lite ? 110 : 200;
      amount = Math.min(Math.round(amount * (lite ? 0.6 : 1)), MAX);
      const cols = ['#7B61FF', '#1FB383', '#FF8A5C', '#FFD15C', '#3D8BFF', '#F78FB3'];
      const ox = origin ? origin.x - r.left : r.width / 2, oy = origin ? origin.y - r.top : r.height * 0.35;
      for (let k = 0; k < amount; k++) st.ps.push({ x: ox, y: oy, vx: (Math.random() - 0.5) * 9, vy: -Math.random() * 10 - 3, s: 5 + Math.random() * 6, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, c: cols[(Math.random() * cols.length) | 0], shape: Math.random() > 0.5, a: 0 });
      if (st.ps.length > MAX) st.ps.splice(0, st.ps.length - MAX);
      if (st.raf) return;
      const step = () => {
        const c = st.c; if (!c) { st.raf = 0; st.ps.length = 0; return; }
        c.setTransform(st.dpr, 0, 0, st.dpr, 0, 0);
        c.clearRect(0, 0, st.w, st.h);
        let keep = 0;
        for (let k = 0; k < st.ps.length; k++) {
          const p = st.ps[k]; p.a++; p.vy += 0.28; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
          if (p.a >= 130 || p.y > st.h + 30) continue;
          st.ps[keep++] = p;
          c.save(); c.translate(p.x, p.y); c.rotate(p.r); c.fillStyle = p.c; c.globalAlpha = Math.max(0, 1 - p.a / 130);
          if (p.shape) c.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); else { c.beginPath(); c.arc(0, 0, p.s / 3, 0, 6.283); c.fill(); }
          c.restore();
        }
        st.ps.length = keep;
        if (keep && !document.hidden) st.raf = requestAnimationFrame(step);
        else { st.raf = 0; st.ps.length = 0; c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cv.width, cv.height); }
      };
      st.raf = requestAnimationFrame(step);
    }
  };

  /* ------------------------------ Notifications & Alarms ------------------------------ */
  function msgFor(kind) {
    const lvl = S.settings.roast;
    const pool = kind === 'miss' ? (lvl === 'soft' ? D.MSG.soft : lvl === 'savage' ? D.MSG.savage.concat(D.MSG.funny) : D.MSG.funny) : D.MSG.soft;
    return rand(pool);
  }
  App.msgFor = msgFor;
  async function notify(title, body, opts = {}) {
    if (App.native) return App.native.notify(title, body, opts);
    if (!('Notification' in window) || Notification.permission !== 'granted') return false;
    const o = { body, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', tag: opts.tag || 'ssc', renotify: true, vibrate: [200, 100, 200], data: { url: opts.url || './#planner' } };
    try {
      const reg = 'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistration() : null;
      if (reg) { await reg.showNotification(title, o); return true; }
      new Notification(title, o); return true;
    } catch (e) { try { new Notification(title, o); return true; } catch (e2) { return false; } }
  }
  App.notify = notify;
  async function requestNotif() {
    if (App.native) return App.native.requestNotif();
    if (!('Notification' in window)) { App.ui.toast(L('এই ব্রাউজারে নোটিফিকেশন সাপোর্ট নেই। অ্যাপ ইনস্টল করে চেষ্টা করো।', 'Notifications not supported in this browser.'), '⚠️', 4000); return false; }
    let p = Notification.permission;
    if (p === 'default') p = await Notification.requestPermission();
    S.settings.notif = p === 'granted'; save();
    if (p === 'granted') { scheduleNativeTriggers(); registerPeriodic(); }
    else if (p === 'denied') App.ui.toast(L('নোটিফিকেশন ব্লক করা আছে। ব্রাউজার সেটিংস থেকে Allow করো।', 'Notifications are blocked. Allow them in browser settings.'), '🔕', 4500);
    return p === 'granted';
  }
  App.requestNotif = requestNotif;
  App.notifPermission = function () {
    if (App.native) return App.native.notifPermission();
    return 'Notification' in window ? Notification.permission : 'unsupported';
  };

  function hhmm(d) { return pad2(d.getHours()) + ':' + pad2(d.getMinutes()); }
  function minutesOf(t) { const [h, m] = t.split(':').map(Number); return h * 60 + m; }
  function alarmTick() {
    if (!S.profile) return;
    const now = new Date(); const nowM = now.getHours() * 60 + now.getMinutes(); const today = todayKey();
    const list = S.settings.reminders.filter(r => r.on).map(r => ({ ...r, kind: 'slot' }));
    if (S.snooze && S.snooze.d === today) list.push({ id: 'snooze', time: S.snooze.time, kind: 'slot' });
    if (S.settings.missCheck) list.push({ id: 'miss', time: S.settings.missTime || '20:30', kind: 'miss' });
    list.forEach(r => {
      const m = minutesOf(r.time); const key = today + '|' + r.id + '|' + r.time;
      if (nowM >= m && nowM < m + 6 && !S.fired[key]) {
        S.fired[key] = 1; save();
        if (r.id === 'snooze') S.snooze = null;
        fireAlarm(r);
      }
    });
  }
  function fireAlarm(r) {
    if (App.native && document.visibilityState !== 'visible') return; // native AlarmManager handles background alarms
    const t = todayTasks(); const left = t.filter(x => !isDone(x.id)).length;
    if (r.kind === 'miss') {
      if (t.length === 0 || t.some(x => isDone(x.id))) return; // already studied today → no roast
      const body = msgFor('miss');
      if (document.visibilityState === 'visible') App.ui.alarmModal({ title: L('পেঁচু স্যার রেগে আছে 🦉', 'Pechu is watching 🦉'), body, roast: true });
      else notify(L('আজ এখনো কিছু পড়োনি! 😤', "You haven't studied today! 😤"), body, { tag: 'miss' });
      return;
    }
    const slotMsg = D.MSG.slots[r.time] || L('⏰ পড়ার সময় হয়েছে!', '⏰ Time to study!');
    const extra = left > 0 ? L(` আজ বাকি ${N(left)}টি কাজ।`, ` ${left} tasks left today.`) : L(' আজকের সব কাজ শেষ—চাইলে রিভিশন করো ✨', ' All tasks done — revise if you like ✨');
    const body = slotMsg + extra + (left > 0 && Math.random() < 0.5 ? '\n' + msgFor(S.settings.roast === 'soft' ? 'soft' : 'miss') : '');
    if (document.visibilityState === 'visible') App.ui.alarmModal({ title: L('পড়ার অ্যালার্ম', 'Study alarm') + ' · ' + r.time, body });
    else notify(L('⏰ পড়ার সময়!', '⏰ Study time!'), body, { tag: 'slot-' + r.id });
  }
  App.fireAlarm = fireAlarm;
  App.snooze = function (mins_ = 10) { const d = new Date(Date.now() + mins_ * 60000); S.snooze = { d: todayKey(), time: hhmm(d) }; save(); };

  // Experimental: Notification Triggers (fires even when app is closed, where supported)
  async function scheduleNativeTriggers() {
    if (App.native) return App.native.scheduleAlarms();
    try {
      if (!('showTrigger' in Notification.prototype) || Notification.permission !== 'granted' || typeof TimestampTrigger === 'undefined') return;
      const reg = await navigator.serviceWorker.getRegistration(); if (!reg) return;
      const now = Date.now();
      S.settings.reminders.filter(r => r.on).forEach(r => {
        const [h, m] = r.time.split(':').map(Number);
        for (let i = 0; i < 3; i++) {
          const d = new Date(); d.setDate(d.getDate() + i); d.setHours(h, m, 0, 0);
          if (d.getTime() <= now) continue;
          reg.showNotification(L('⏰ পড়ার সময়!', '⏰ Study time!'), { tag: 'trg-' + r.id + '-' + i, body: D.MSG.slots[r.time] || msgFor('soft'), showTrigger: new TimestampTrigger(d.getTime()), icon: 'icons/icon-192.png', data: { url: './#planner' } });
        }
      });
    } catch (e) {}
  }
  async function registerPeriodic() {
    if (App.native) return;
    try {
      const reg = await navigator.serviceWorker.ready;
      if (!('periodicSync' in reg)) return;
      const st = await navigator.permissions.query({ name: 'periodic-background-sync' });
      if (st.state === 'granted') await reg.periodicSync.register('ssc-nudge', { minInterval: 3 * 60 * 60 * 1000 });
    } catch (e) {}
  }
  App.scheduleNativeTriggers = scheduleNativeTriggers;
  App.registerPeriodic = registerPeriodic;

  // ICS export → native phone calendar alarms (works 100% even when the app is closed)
  App.exportICS = function () {
    const start = parseKey(S.profile.startDate);
    const fmt = (d) => d.getFullYear() + pad2(d.getMonth() + 1) + pad2(d.getDate());
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//SSC2027//Study Companion//BN', 'CALSCALE:GREGORIAN', 'X-WR-CALNAME:SSC 2027 স্টাডি অ্যালার্ম'];
    S.settings.reminders.filter(r => r.on).forEach(r => {
      const [h, m] = r.time.split(':');
      const first = start < new Date() ? new Date() : start;
      const left = Math.max(1, 90 - (rawDay() - 1));
      lines.push('BEGIN:VEVENT', 'UID:' + S.profile.uid + '-' + r.id + '@ssc2027', 'DTSTAMP:' + fmt(new Date()) + 'T000000Z',
        'DTSTART;TZID=Asia/Dhaka:' + fmt(first) + 'T' + h + m + '00', 'DURATION:PT30M', 'RRULE:FREQ=DAILY;COUNT=' + left,
        'SUMMARY:' + (D.MSG.slots[r.time] || '⏰ পড়ার সময়!').replace(/[,;]/g, ' '),
        'DESCRIPTION:' + rand(D.MSG.funny).replace(/[,;\n]/g, ' ') + ' — SSC 2027 Study Companion',
        'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:পড়ার সময়!', 'TRIGGER:PT0M', 'END:VALARM', 'END:VEVENT');
    });
    lines.push('END:VCALENDAR');
    download('ssc2027-study-alarms.ics', lines.join('\r\n'), 'text/calendar');
  };
  function download(name, text, type) {
    if (App.native) return App.native.saveFile(name, text, type);
    const blob = new Blob([text], { type }); const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 500);
  }
  App.download = download;

  /* ------------------------------ Focus timer ------------------------------ */
  const PRESETS = { pomo: [25, 5], deep: [50, 10], custom: null };
  App.PRESETS = PRESETS;
  function presetMins() { const p = S.settings.focusPreset; if (p === 'custom') { const c = S.settings.custom || 40; return [c, c >= 50 ? 10 : 5]; } return PRESETS[p] || PRESETS.pomo; }
  App.presetMins = presetMins;
  function timer() {
    if (!S.timer) { const [f] = presetMins(); S.timer = { mode: 'focus', running: false, duration: f * 60, remaining: f * 60, endAt: 0, cycle: 0, sub: '', ch: 0, startedAt: 0 }; }
    return S.timer;
  }
  App.timer = timer;
  function timerLeft() { const t = timer(); return t.running ? Math.max(0, Math.round((t.endAt - Date.now()) / 1000)) : t.remaining; }
  App.timerLeft = timerLeft;
  let wakeLock = null;
  async function keepAwake(on) {
    if (App.native) return App.native.keepAwake(on);
    try {
      if (on && 'wakeLock' in navigator && !wakeLock) { wakeLock = await navigator.wakeLock.request('screen'); wakeLock.addEventListener('release', () => { wakeLock = null; }); }
      if (!on && wakeLock) { await wakeLock.release(); wakeLock = null; }
    } catch (e) {}
  }
  App.keepAwake = keepAwake;
  App.timerStart = function () {
    const t = timer(); if (t.running) return;
    if (!t.startedAt) t.startedAt = Date.now();
    t.endAt = Date.now() + t.remaining * 1000; t.running = true;
    App.sfx.play('start'); App.haptic(15); keepAwake(true); save(true);
  };
  App.timerPause = function () { const t = timer(); if (!t.running) return; t.remaining = timerLeft(); t.running = false; App.haptic(10); keepAwake(false); save(true); };
  App.timerReset = function (mode) {
    const t = timer(); const [f, b] = presetMins(); t.mode = mode || 'focus'; t.running = false;
    t.duration = (t.mode === 'focus' ? f : (t.cycle > 0 && t.cycle % 4 === 0 ? 15 : b)) * 60; t.remaining = t.duration; t.startedAt = 0; keepAwake(false); save(true);
  };
  App.timerStop = function () {
    const t = timer();
    const elapsed = Math.round((t.duration - timerLeft()) / 60);
    if (t.mode === 'focus' && elapsed >= 10) { recordFocus(elapsed, true); }
    App.timerReset('focus');
    return elapsed;
  };
  function recordFocus(m, partial) {
    const t = timer();
    S.focus.sessions.push({ d: todayKey(), at: Date.now(), m, sub: t.sub, ch: t.ch });
    if (S.focus.sessions.length > 600) S.focus.sessions = S.focus.sessions.slice(-600);
    bumpActivity('m', m);
    const xp = m + (partial ? 0 : 5);
    addXp(xp, null, true);
    checkBadges();
    App.ui.celebrate({ type: 'focus', title: partial ? L('ভালো চেষ্টা! 👏', 'Nice effort! 👏') : L('ফোকাস সেশন সম্পন্ন! 🎯', 'Focus session complete! 🎯'), text: L(`${N(m)} মিনিট মনোযোগ দিয়ে পড়েছ। এখন একটু বিরতি নাও ☕`, `You focused for ${m} minutes. Take a short break ☕`), xp });
  }
  App.timerCheck = function () {
    const t = S.timer; if (!t || !t.running) return false;
    if (timerLeft() > 0) return false;
    t.running = false; keepAwake(false);
    if (t.mode === 'focus') {
      t.cycle++;
      const m = Math.round(t.duration / 60);
      App.sfx.play('finish');
      if (document.visibilityState !== 'visible') notify(L('🎯 সেশন শেষ! +', '🎯 Session done! +') + N(m + 5) + ' XP', L('দারুণ! এখন ৫ মিনিট বিরতি নাও।', 'Great! Take a 5 minute break.'), { tag: 'focus', url: './#focus' });
      recordFocus(m, false);
      App.timerReset('break');
    } else {
      App.sfx.play('done');
      if (document.visibilityState !== 'visible') notify(L('⏰ বিরতি শেষ!', '⏰ Break over!'), L('চলো, পরের সেশন শুরু করি 💪', "Let's start the next session 💪"), { tag: 'focus', url: './#focus' });
      else App.ui.toast(L('বিরতি শেষ! পরের সেশনের জন্য রেডি? 💪', 'Break over! Ready for the next session? 💪'), '⏰', 3500);
      App.timerReset('focus');
    }
    save(true);
    return true;
  };
  App.todayFocus = function () { const k = todayKey(); const ss = S.focus.sessions.filter(s => s.d === k); return { m: ss.reduce((a, s) => a + s.m, 0), n: ss.length }; };

  /* ------------------------------ Errors (mistake notebook) ------------------------------ */
  const BOX = [1, 3, 7, 14, 30];
  App.ERR_CATS = {
    mcq: { bn: 'ভুল MCQ', en: 'Wrong MCQ', e: '🔘', c: '#7B61FF', bg: '#EEEAFF' },
    cq: { bn: 'CQ ভুল', en: 'CQ mistake', e: '📝', c: '#F06A38', bg: '#FFE6DA' },
    formula: { bn: 'সূত্র ভুল', en: 'Formula', e: '🧮', c: '#2468D8', bg: '#DCEBFF' },
    concept: { bn: 'দুর্বল কনসেপ্ট', en: 'Weak concept', e: '🧩', c: '#C23A6E', bg: '#FDE5EF' },
    short: { bn: 'কঠিন SQ', en: 'Hard short Q', e: '❓', c: '#A57A00', bg: '#FFF3CC' },
    note: { bn: 'নিজের নোট', en: 'Personal note', e: '📌', c: '#12936A', bg: '#D8F5E9' }
  };
  App.errDue = () => S.errors.filter(e => !e.mastered && e.due <= todayKey());
  App.addError = function (e) {
    S.errors.unshift(Object.assign({ id: 'e' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), created: Date.now(), box: 0, reviews: 0, due: dateKey(addDays(new Date(), 1)), mastered: false }, e));
    addXp(3, null, true); checkBadges(); save();
  };
  App.reviewError = function (id, ok) {
    const e = S.errors.find(x => x.id === id); if (!e) return;
    e.reviews++; e.box = ok ? Math.min(4, e.box + 1) : 0;
    e.due = dateKey(addDays(new Date(), BOX[e.box])); e.last = Date.now();
    addXp(ok ? 5 : 2, null, true); save();
  };
  App.masterError = function (id, on = true) {
    const e = S.errors.find(x => x.id === id); if (!e) return;
    if (e.mastered === on) return;
    e.mastered = on; addXp(on ? 10 : -10, null, true); checkBadges(); save();
  };

  /* ------------------------------ Tests ------------------------------ */
  App.saveTest = function (id, got, total, note) {
    const first = !S.tests[id];
    S.tests[id] = { got: +got, total: +total, d: todayKey(), note: note || '' };
    if (first) addXp(20, null, true);
    const p = plan(); const t = Object.values(p.tasks).find(x => x.testId === id);
    if (t && !isDone(t.id)) completeTask(t.id, null, { quiet: true });
    checkBadges(); save();
  };
  App.testPct = (r) => (r && r.total ? Math.round(r.got / r.total * 100) : 0);

  /* ------------------------------ Boot hooks ------------------------------ */
  App.startLoops = function () {
    setInterval(() => { alarmTick(); if (S.timer && S.timer.running) { if (App.timerCheck()) App.ui.refresh(); } }, 1000 * 15);
    setTimeout(alarmTick, 2500);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') { dailyCheck(); alarmTick(); if (App.timerCheck()) App.ui.refresh(); if (S.timer && S.timer.running) keepAwake(true); scheduleSync(1500); }
      else { save(true); beaconSync(); }
    });
    window.addEventListener('online', () => scheduleSync(1000));
    window.addEventListener('pagehide', () => save(true));
  };
})();
