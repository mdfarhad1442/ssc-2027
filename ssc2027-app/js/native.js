/* ==========================================================================
   SSC 2027 — Android app bridge (only active inside the APK)
   When the web app runs inside the Android app, window.SSCAndroid exists.
   This file connects alarms, notifications, files, the focus timer and the
   Focus Guard (social media lock) to native Android features.
   On a normal browser this file does nothing.
   ========================================================================== */
(function () {
  'use strict';
  const A = window.App;
  const B = window.SSCAndroid;
  A.isApp = !!B;
  if (!B) return;
  document.documentElement.classList.add('in-app');
  const D = window.SSC_DATA;
  const L = (bn, en) => A.L(bn, en);

  // ---------- async callback plumbing (Java → JS) ----------
  let seq = 0; const pending = {};
  const call = (method, ...args) => new Promise((res) => {
    const id = ++seq; pending[id] = res;
    try { B[method](id, ...args); } catch (e) { delete pending[id]; res(null); }
    setTimeout(() => { if (pending[id]) { delete pending[id]; res(null); } }, 20000);
  });
  const parse = (s, d) => { try { return JSON.parse(s); } catch (e) { return d; } };

  window.SSCNative = {
    cb(id, json) { const r = pending[id]; if (r) { delete pending[id]; r(parse(json, json)); } },
    onResume() { try { A.dailyCheck(); } catch (e) {} handleRoute(); if (A.ui && A.ui.refresh) { const n = (location.hash || '').replace('#', '').split('/')[0]; if (['guard', 'alarms', 'install', 'focus', 'home', 'profile'].includes(n)) A.ui.refresh(); } },
    onPause() { pushState(true); },
    onRoute() { handleRoute(); },
    saved(ok) { if (A.ui && A.ui.toast) A.ui.toast(ok ? L('ফাইল সেভ হয়েছে ✓', 'File saved ✓') : L('সেভ বাতিল হয়েছে', 'Save cancelled'), ok ? '💾' : 'ℹ️'); }
  };

  function handleRoute() {
    const r = parse(B.consumeRoute(), {}) || {};
    if (r.guardReturn && A.S().profile) {
      const st = A.S(); const k = A.todayKey();
      st.guardBonus = st.guardBonus && st.guardBonus.d === k ? st.guardBonus : { d: k, n: 0 };
      if (st.guardBonus.n < 3) {
        st.guardBonus.n++; A.addXp(5, null, true); A.save();
        setTimeout(() => A.ui && A.ui.toast(L('সোশ্যাল মিডিয়া ছেড়ে ফিরে আসার বোনাস +৫ XP 💪', 'Comeback-from-social bonus +5 XP 💪'), '🛡️', 3500), 400);
      } else setTimeout(() => A.ui && A.ui.toast(L('দারুণ সিদ্ধান্ত! চলো একটা ফোকাস সেশন শুরু করি 🎯', 'Great choice! Start a focus session 🎯'), '🛡️', 3000), 400);
    }
    if (r.route && A.S().profile) { if (location.hash !== '#' + r.route) location.hash = '#' + r.route; }
  }

  // ---------- state mirror for native alarms & study lock ----------
  let lastLock = -1; let stateT = null;
  function pushState(now) {
    const run = () => {
      const st = A.S(); if (!st.profile) return;
      try {
        const tasks = A.todayTasks ? A.todayTasks() : [];
        const done = tasks.filter(t => A.isDone(t.id)).length;
        B.syncState(JSON.stringify({ today: A.todayKey(), done: done + (A.todayFocus ? (A.todayFocus().m >= 10 ? 1 : 0) : 0), total: tasks.length, lang: st.settings.lang, name: st.profile.name, roast: st.settings.roast }));
      } catch (e) {}
      // focus timer → study lock for Focus Guard
      const t = st.timer; const g = st.guard || {};
      const until = t && t.running && t.mode === 'focus' && g.lockFocus !== false ? t.endAt : 0;
      if (until !== lastLock) { lastLock = until; try { B.setStudyLock(until, t && t.sub ? A.subName(t.sub) : ''); } catch (e) {} }
    };
    clearTimeout(stateT);
    if (now) run(); else stateT = setTimeout(run, 400);
  }

  // ---------- public native API used by core.js / ui.js ----------
  A.native = {
    call, parse,
    info: () => parse(B.info(), {}),
    perms: () => parse(B.permState(), {}),
    notifPermission() { return (A.native.perms().notif) || 'default'; },
    async requestNotif() {
      const r = await call('requestNotif');
      const ok = r === 'granted';
      A.S().settings.notif = ok; A.save();
      if (ok) A.native.scheduleAlarms();
      else { A.ui.toast(L('নোটিফিকেশন বন্ধ আছে। সেটিংস থেকে চালু করো।', 'Notifications are off. Enable them in settings.'), '🔕', 4000); setTimeout(() => B.openSettings('notif'), 900); }
      return ok;
    },
    notify(title, body, opts = {}) { try { B.notify(title, body, opts.tag || 'ssc', (opts.url || '').split('#')[1] || 'planner'); return true; } catch (e) { return false; } },
    scheduleAlarms() {
      const s = A.S().settings;
      const slots = {}; s.reminders.forEach(r => { slots[r.time] = D.MSG.slots[r.time] || L('⏰ পড়ার সময় হয়েছে! আজকের কাজগুলো শুরু করো।', '⏰ Time to study! Start today’s tasks.'); });
      const lvl = s.roast; const roasts = lvl === 'soft' ? D.MSG.soft : lvl === 'savage' ? D.MSG.savage.concat(D.MSG.funny) : D.MSG.funny;
      try { B.scheduleAlarms(JSON.stringify({ reminders: s.reminders.map(r => ({ id: r.id, time: r.time, on: r.on && s.notif !== false })), missCheck: s.missCheck && s.notif !== false, missTime: s.missTime || '20:30', slots, roasts, lang: s.lang })); } catch (e) {}
      pushState(true);
    },
    saveFile(name, text, type) { B.saveFile(name, type || 'application/octet-stream', text); },
    keepAwake(on) { try { B.keepScreenOn(!!on); } catch (e) {} },
    vibrate(ms) { try { B.vibrate(Math.round(ms)); } catch (e) {} },
    openUrl(url, inApp) { B.openUrl(url, !!inApp); },
    openInApp(url, title) { B.openInApp(url, title || ''); },
    copy(text) { try { B.copyText(text); return true; } catch (e) { return false; } },
    share(text) { B.share(text); },
    openSettings(w) { B.openSettings(w); },
    // Focus Guard
    guardStats: () => parse(B.guardStats(), {}),
    listApps: () => call('listApps'),
    usageToday: () => call('usageToday'),
    testOverlay: (k) => B.testOverlay(k || 'block'),
    pushGuard() {
      const g = A.S().guard; if (!g) return;
      const msgs = A.guardMessages ? A.guardMessages() : {};
      try { B.setGuardConfig(JSON.stringify(Object.assign({}, g, { msgs, lang: A.S().settings.lang }))); } catch (e) {}
    },
    onSave() { pushState(false); }
  };

  // re-arm alarms & guard config on every launch (cheap, idempotent)
  setTimeout(() => { if (A.S().profile) { A.native.scheduleAlarms(); A.native.pushGuard(); handleRoute(); } }, 1200);
})();
