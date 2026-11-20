/* ==========================================================================
   SSC 2027 — UI: router, screens, sheets, modals, onboarding, interactions
   ========================================================================== */
(function () {
  'use strict';
  const A = window.App, D = A.D;
  const { L, N, esc, mins } = A;
  const S = () => A.S();
  const $ = (s, r = document) => r.querySelector(s);
  const view = () => $('#view');
  const pctTxt = (p) => N(Math.round(p * 100)) + '%';

  /* ------------------------------ Icons ------------------------------ */
  const UI = {
    home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
    route: '<circle cx="6" cy="19" r="2.5"/><circle cx="18" cy="5" r="2.5"/><path d="M8.5 19H17a3.5 3.5 0 0 0 0-7H7a3.5 3.5 0 0 1 0-7h8.5"/>',
    books: '<path d="M4 19.5V5a2 2 0 0 1 2-2h3v18H6a2 2 0 0 1-2-1.5Z"/><path d="M9 3h4v18H9"/><path d="m14.5 4.2 3.8-1 3.2 16.4-3.8 1z"/>',
    timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 2h6M12 2v3"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    chevR: '<path d="m9 18 6-6-6-6"/>', chevL: '<path d="m15 18-6-6 6-6"/>', chevD: '<path d="m6 9 6 6 6-6"/>',
    check: '<path d="M20 6 9 17l-5-5"/>', plus: '<path d="M12 5v14M5 12h14"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2.5"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    play: '<path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5Z" fill="currentColor" stroke="none"/>',
    pause: '<rect x="6" y="4" width="4" height="16" rx="1.5" fill="currentColor" stroke="none"/><rect x="14" y="4" width="4" height="16" rx="1.5" fill="currentColor" stroke="none"/>',
    reset: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>', stop: '<rect x="5" y="5" width="14" height="14" rx="3"/>',
    skip: '<path d="m5 4 10 8-10 8z"/><path d="M19 5v14"/>', x: '<path d="M18 6 6 18M6 6l12 12"/>',
    copy: '<rect x="9" y="9" width="12" height="12" rx="2.5"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
    users: '<circle cx="9" cy="7" r="4"/><path d="M2 21a7 7 0 0 1 14 0M16 3.1a4 4 0 0 1 0 7.8M22 21a7 7 0 0 0-4-6.3"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
    refresh: '<path d="M21 12a9 9 0 0 1-15 6.7L3 16M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5M3 21v-5h5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    chart: '<path d="M3 3v18h18"/><path d="M7 15v3M12 10v8M17 6v12"/>',
    note: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
    spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/>',
    cloud: '<path d="M17.5 19H9a7 7 0 1 1 6.7-9h1.8a4.5 4.5 0 1 1 0 9Z"/>'
  };
  function ic(name, cls = '') { const p = UI[name] || D.ICONS[name] || UI.spark; return `<svg class="ico ${cls}" viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`; }
  function subIc(sub, cls = '') { const s = D.SUBJECTS[sub]; return ic(s ? s.icon : 'spark', cls); }
  const subC = (sub) => (D.SUBJECTS[sub] ? D.SUBJECTS[sub].c : '#7B61FF');
  const subBg = (sub) => (D.SUBJECTS[sub] ? D.SUBJECTS[sub].bg : '#EEEAFF');
  function ring(pct, size = 56, sw = 6, color = '#7B61FF', label = '', track = '') {
    pct = Math.max(0, Math.min(1, pct || 0));
    const r = (size - sw) / 2, c = +(2 * Math.PI * r).toFixed(2), off = +(c * (1 - pct)).toFixed(2);
    return `<div class="ring" style="width:${size}px;height:${size}px"><svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle class="track" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${sw}" ${track ? `style="stroke:${track}"` : ''}/><circle class="val" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${sw}" stroke="${color}" stroke-dasharray="${c}" stroke-dashoffset="${off}" style="--full:${c}"/></svg><div class="lbl">${label}</div></div>`;
  }
  const bar = (p, cls = '') => `<div class="bar ${cls}"><i style="width:${Math.round(Math.max(0, Math.min(1, p)) * 100)}%"></i></div>`;
  const stars = (n) => `<span class="stars" aria-label="${n} star">${'★'.repeat(n)}<span style="opacity:.25">${'★'.repeat(3 - n)}</span></span>`;
  const avatar = (name, cls = '') => `<div class="avatar ${cls}" style="background:${A.colorFor(name)}">${esc(A.initials(name))}</div>`;
  const topbar = (title, sub = '', right = '') => `<div class="topbar"><button class="icon-btn" data-a="back" aria-label="${L('ফিরে যাও', 'Back')}">${ic('chevL')}</button><div class="title"><div class="h3 ellipsis">${title}</div>${sub ? `<div class="tiny muted ellipsis">${sub}</div>` : ''}</div>${right}</div>`;

  /* ------------------------------ UI memory state ------------------------------ */
  const U = { showAll: false, doneOpen: false, backlogOpen: false, chFilter: 'all', errCat: 'all', errShowMastered: false, lbScope: 'school', lbPeriod: 'week', lbGroup: 'all', openDay: null, justId: null, rev: null, deferredInstall: null, schools: null };
  A.U = U;

  /* ------------------------------ Router ------------------------------ */
  let route = { name: '', arg: null };
  let depth = 0;
  function parseHash() { const h = location.hash.replace(/^#\/?/, ''); const i = h.indexOf('/'); const name = i < 0 ? h : h.slice(0, i); const arg = i < 0 ? null : decodeURIComponent(h.slice(i + 1)); return { name: name || 'home', arg }; }
  function go(name, arg) {
    const h = '#' + name + (arg != null && arg !== '' ? '/' + encodeURIComponent(arg) : '');
    if (location.hash === h) { render(); return; }
    depth++; location.hash = h;
  }
  function back(fallback) {
    if (depth > 0) { depth--; history.back(); }
    else location.replace('#' + (fallback || parentOf(route.name)));
  }
  const PARENT = { planedit: 'roadmap', subject: 'subjects', planner: 'home', leaderboard: 'home', errors: 'profile', tests: 'profile', badges: 'profile', alarms: 'profile', gpa: 'profile', results: 'profile', guard: 'profile', install: 'profile' };
  const parentOf = (n) => PARENT[n] || 'home';
  A.go = go; A.back = back;

  const TAB_OF = { planedit: 'roadmap', home: 'home', planner: 'home', leaderboard: 'home', roadmap: 'roadmap', subjects: 'subjects', subject: 'subjects', focus: 'focus', profile: 'profile', errors: 'profile', tests: 'profile', badges: 'profile', alarms: 'profile', gpa: 'profile', results: 'profile', guard: 'profile', install: 'profile' };
  function navHtml() {
    const items = [['home', 'home', L('হোম', 'Home')], ['roadmap', 'route', L('রোডম্যাপ', 'Roadmap')], ['subjects', 'books', L('বিষয়', 'Subjects')], ['focus', 'timer', L('ফোকাস', 'Focus')], ['profile', 'user', L('প্রোফাইল', 'Profile')]];
    return items.map(([r, i, t]) => `<button data-a="tab" data-to="${r}" aria-label="${t}">${ic(i)}<span>${t}</span></button>`).join('');
  }
  function updateNav() {
    const nav = $('#nav'); if (!nav) return;
    if (!nav.dataset.lang || nav.dataset.lang !== S().settings.lang) { nav.innerHTML = navHtml(); nav.dataset.lang = S().settings.lang; }
    const tab = TAB_OF[route.name] || 'home';
    nav.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.to === tab));
    const t = S().timer;
    const hide = !S().profile || (route.name === 'focus' && t && t.running);
    nav.classList.toggle('hide', hide);
    view().classList.toggle('no-nav', hide);
  }

  let lastRendered = '';
  function render(opts = {}) {
    const v = view();
    if (!S().profile) { document.querySelectorAll('#app > .fab').forEach(f => f.remove()); route = { name: 'onboarding', arg: null }; v.innerHTML = `<div class="screen">${Onb.render()}</div>`; updateNav(); v.scrollTop = opts.keep ? v.scrollTop : 0; Onb.mount(); return; }
    const r = parseHash();
    const same = r.name === route.name && r.arg === route.arg;
    const keep = opts.keep && same;
    const top = v.scrollTop;
    route = r;
    const fn = SCREENS[r.name] || SCREENS.home;
    let html;
    try { html = fn(r.arg); } catch (e) { console.error(e); html = `<div class="empty"><h3>${L('কিছু একটা ভুল হয়েছে', 'Something went wrong')}</h3><p>${esc(e.message)}</p><button class="btn primary mt" data-a="tab" data-to="home">${L('হোমে যাও', 'Go home')}</button></div>`; }
    v.innerHTML = `<div class="screen ${keep ? 'no-anim' : ''}">${html}</div>`;
    v.scrollTop = keep ? top : 0;
    // floating action buttons live outside the scroller so they stay pinned above the nav
    document.querySelectorAll('#app > .fab').forEach(f => f.remove());
    v.querySelectorAll('.fab').forEach(f => { if (keep) f.classList.add('no-anim'); document.getElementById('app').appendChild(f); });
    lastRendered = r.name;
    updateNav();
    if (AFTER[r.name]) AFTER[r.name](r.arg, keep);
  }
  function refresh() { render({ keep: true }); if (SHEET) renderSheet(); }
  A.ui = { render, refresh };

  /* =========================================================================
     SCREENS
     ========================================================================= */
  const SCREENS = {}, AFTER = {};

  /* ------------------------------ HOME ------------------------------ */
  function greet() { const h = new Date().getHours(); if (h < 5) return L('শুভ রাত্রি 🌙', 'Good night 🌙'); if (h < 12) return L('শুভ সকাল ☀️', 'Good morning ☀️'); if (h < 16) return L('শুভ দুপুর 🌤️', 'Good afternoon 🌤️'); if (h < 18) return L('শুভ বিকাল 🌇', 'Good evening 🌇'); return L('শুভ সন্ধ্যা 🌆', 'Good evening 🌆'); }
  SCREENS.home = function () {
    const st = S(), p = st.profile, li = A.levelInfo(), raw = A.rawDay(), cd = A.currentDay();
    const w = A.weekOfDay(cd), ph = A.E.phaseOfWeek(w), P = D.PHASES[ph - 1];
    const tasks = A.todayTasks(); const done = tasks.filter(t => A.isDone(t.id)).length;
    const leftMin = tasks.filter(t => !A.isDone(t.id)).reduce((a, t) => a + t.min, 0);
    const subs = [...new Set(tasks.filter(t => !A.isDone(t.id)).map(t => t.sub).filter(Boolean))].slice(0, 4);
    const overall = A.overallProgress(); const streak = A.streakNow();
    const firstName = esc(String(p.name).split(' ')[0]);
    const due = A.errDue().length;
    const bl = raw > 1 ? A.backlog().length : 0;

    let heroTitle, heroSub;
    if (raw < 1) { heroTitle = L(`যাত্রা শুরু ${N(1 - raw)} দিন পর`, `Journey starts in ${1 - raw} days`); heroSub = L('প্রস্তুত হও—প্রথম ধাপ সবচেয়ে গুরুত্বপূর্ণ।', 'Get ready — the first step matters most.'); }
    else if (raw > 90) { heroTitle = L('৯০ দিনের যাত্রা সম্পন্ন! 🎓', '90-day journey complete! 🎓'); heroSub = L('এখন শুধু রিভিশন আর আত্মবিশ্বাস।', 'Now just revise and stay confident.'); }
    else { heroTitle = L('রোডম্যাপ ', 'Roadmap ') + pctTxt(overall) + L(' সম্পন্ন', ' done'); heroSub = L('ফেজ ', 'Phase ') + N(ph) + ' · ' + L(P.bn, P.en); }

    let mission;
    if (raw < 1) {
      mission = `<div class="mission"><div class="deco"></div><div class="eyebrow">${L('আজকের মিশন', "Today's mission")}</div><div class="h2 mt-s">${L('আগেই শুরু করতে চাও?', 'Want to start early?')}</div><p class="small mt-s" style="opacity:.75">${L('তোমার প্রস্তুতি শুরুর তারিখ: ', 'Start date: ')}${A.fmtDate(A.parseKey(p.startDate))}</p><button class="btn primary block mt" data-a="startToday">${L('আজ থেকেই শুরু করো', 'Start from today')} ${ic('chevR', 'sm')}</button></div>`;
    } else if (raw > 90) {
      mission = `<div class="mission"><div class="deco"></div><div class="eyebrow">${L('ফাইনাল মোড', 'Final mode')}</div><div class="h2 mt-s">${L('ভুলের খাতা রিভিউ করো', 'Review your mistake notebook')}</div><button class="btn primary block mt" data-a="go" data-to="errors">${L('রিভিউ শুরু', 'Start review')} ${ic('chevR', 'sm')}</button></div>`;
    } else {
      const allDone = tasks.length && done === tasks.length;
      mission = `<div class="mission">
        <div class="deco"></div>
        <div class="ring-mini">${ring(tasks.length ? done / tasks.length : 0, 58, 6, '#9C88FF', `<span style="color:#fff;font-size:14px">${N(done)}/${N(tasks.length)}</span>`, 'rgba(255,255,255,.12)')}</div>
        <div class="eyebrow">${L('আজকের মিশন', "Today's mission")} · ${L('দিন ', 'Day ')}${N(raw)}</div>
        <div class="h2 mt-s" style="max-width:72%">${allDone ? L('মিশন সম্পন্ন! 🎉', 'Mission complete! 🎉') : L(`${N(tasks.length - done)}টি কাজ বাকি`, `${tasks.length - done} task${tasks.length - done === 1 ? "" : "s"} left`)}</div>
        <div class="small" style="opacity:.7;margin-top:2px">${allDone ? L('আজ তুমি দারুণ করেছ। চাইলে একটা ফোকাস সেশন দাও।', 'Great work today. Maybe one more focus session?') : L('আনুমানিক সময় ', 'Approx. ') + mins(leftMin)}</div>
        ${subs.length ? `<div class="row gap-s mt" style="flex-wrap:wrap">${subs.map(s => `<span class="sub-dot"><i style="background:${subBg(s)};color:${subC(s)}">${subIc(s)}</i>${esc(A.subName(s, true))}</span>`).join('')}</div>` : ''}
        <button class="btn ${allDone ? 'mint' : 'primary'} block mt" data-a="go" data-to="${allDone ? 'focus' : 'planner'}" style="margin-top:16px">${allDone ? L('ফোকাস সেশন চালাও', 'Start a focus session') : L('পড়া চালিয়ে যাও', 'Continue Study')} ${ic('chevR', 'sm')}</button>
      </div>`;
    }

    // week preview (Sat → Fri)
    const ws = A.parseKey(A.weekStartKey());
    let strip = '';
    for (let i = 0; i < 7; i++) {
      const d = A.addDays(ws, i); const k = A.dateKey(d); const dn = A.diffDays(d, A.parseKey(p.startDate)) + 1;
      const tl = dn >= 1 && dn <= 90 ? A.tasksOfDay(dn) : [];
      const dc = tl.filter(t => A.isDone(t.id)).length;
      const act = st.activity[k];
      const fill = tl.length ? dc / tl.length : (act && (act.t || act.m >= 10) ? 1 : 0);
      const isT = k === A.todayKey();
      strip += `<div class="wday ${isT ? 'today' : ''}"><div class="pillar"><i style="height:${Math.max(fill * 100, fill ? 18 : 0)}%"></i>${fill >= 1 ? `<span class="ck">${ic('check', 'xs')}</span>` : st.streak.shielded[k] ? '<span class="ck">🛡️</span>' : ''}</div>${A.wd(d)}</div>`;
    }

    const showInstall = (U.deferredInstall || isIOS()) && !isStandalone() && !st.ui.installDismissed;
    const notifCard = !st.settings.notif && ['default', 'granted'].includes(A.notifPermission());

    return `
      <div class="blob b1"></div>
      <div class="topbar">
        <button class="tap" data-a="tab" data-to="profile" style="border-radius:50%">${avatar(p.name)}</button>
        <div class="title"><div class="eyebrow">${greet()}</div><div class="h3 ellipsis">${firstName}${L('', '')} 👋</div></div>
        <button class="icon-btn" data-a="go" data-to="alarms" aria-label="${L('অ্যালার্ম', 'Alarms')}">${ic('bell')}${!st.settings.notif ? '<span class="dot"></span>' : ''}</button>
      </div>

      <div class="hero">
        <div class="lamp-glow"></div>
        <img class="illus" src="assets/desk.webp" alt="" width="230" height="160">
        <span class="float-el" style="right:40%;top:18px;animation-delay:-2s">✨</span>
        <div class="day-pill"><b>${L('দিন', 'Day')} ${N(Math.max(0, Math.min(raw, 90)))}</b>${L('/ ৯০', '/ 90')}</div>
        <h2>${heroTitle}</h2>
        <p>${heroSub}</p>
        <div style="max-width:52%;margin-top:12px">${bar(overall)}</div>
      </div>

      <div class="stat-row">
        <button class="stat tap" data-a="go" data-to="badges" style="text-align:left">
          <div class="k">${L('দৈনিক স্ট্রিক', 'Daily streak')}</div>
          <div class="v"><span class="flame">🔥</span> ${N(streak)}<span class="small muted" style="font-weight:600"> ${L('দিন', 'days')}</span></div>
          <div class="tiny muted">${st.streak.shields ? '🛡️×' + N(st.streak.shields) + ' · ' : ''}${L('সেরা ', 'Best ')}${N(Math.max(st.streak.best, streak))}</div>
        </button>
        <button class="stat tap" data-a="go" data-to="badges" style="text-align:left">
          <div class="row between"><div class="k">${L('লেভেল ', 'Level ')}${N(li.level)}</div><div class="tag lav">${N(st.xp)} XP</div></div>
          <div class="bold ellipsis" style="font-size:15px;margin:3px 0 7px">${esc(li.name)}</div>
          ${bar(li.pct)}
          <div class="tiny muted" style="margin-top:5px">${L('পরের লেভেলে আর ', 'Next level in ')}${N(li.toNext)} XP</div>
        </button>
      </div>

      <div class="mt">${mission}</div>
      ${bl ? `<button class="banner warn mt tap" data-a="go" data-to="planner" style="width:100%;text-align:left">🌱 <span>${L(`আগের ${N(bl)}টি কাজ বাকি আছে—চাপ নিও না, সময় পেলে একটা একটা করে শেষ করো।`, `${bl} earlier tasks pending — no stress, finish them one by one.`)}</span></button>` : ''}
      ${notifCard ? `<div class="card tight mt row" style="background:var(--peach-50);box-shadow:none"><div style="font-size:28px">⏰</div><div class="grow"><div class="bold small">${L('পড়ার অ্যালার্ম চালু করো', 'Turn on study alarms')}</div><div class="tiny muted">${L('মিস করলে পেঁচু স্যার মজার রোস্ট পাঠাবে 😜', 'Pechu will roast you if you skip 😜')}</div></div><button class="btn xs peach" data-a="enableNotif">${L('চালু', 'Enable')}</button></div>` : ''}

      <div class="section-title"><h3>${L('এই সপ্তাহ', 'This week')}</h3><button class="tag lav tap" data-a="go" data-to="roadmap">${L('সপ্তাহ ', 'Week ')}${N(w)} ${ic('chevR', 'xs')}</button></div>
      <div class="card"><div class="week-strip">${strip}</div></div>

      <div class="section-title"><h3>${L('দ্রুত যাও', 'Quick access')}</h3></div>
      <div class="quick">
        <button data-a="go" data-to="errors"><span class="qi" style="background:var(--lav-100)">📒</span>${L('ভুলের খাতা', 'Mistakes')}${due ? `<span class="tag peach" style="position:absolute;top:0;right:6px;padding:1px 6px">${N(due)}</span>` : ''}</button>
        <button data-a="go" data-to="tests"><span class="qi" style="background:var(--peach-100)">📊</span>${L('পরীক্ষা', 'Tests')}</button>
        <button data-a="go" data-to="leaderboard"><span class="qi" style="background:var(--mint-100)">🏆</span>${L('প্রতিযোগিতা', 'Compete')}</button>
        <button data-a="go" data-to="badges"><span class="qi" style="background:var(--yellow-100)">🏅</span>${L('ব্যাজ', 'Badges')}</button>
      </div>

      <div class="tip mt-l"><img src="assets/mascot.webp" alt="" width="58" height="66"><div class="bubble"><b>${L('পেঁচু স্যারের টিপস', "Pechu's tip")}:</b> ${esc(D.MSG.tips[new Date().getDate() % D.MSG.tips.length])}</div></div>

      ${showInstall ? `<div class="install mt"><img src="icons/icon-192.png" alt=""><div class="grow"><div class="bold small">${L('অ্যাপ হিসেবে ইনস্টল করো', 'Install as an app')}</div><div class="tiny muted">${L('হোম স্ক্রিন থেকে এক ট্যাপে খুলবে, অফলাইনেও চলবে', 'Opens in one tap, works offline')}</div></div><button class="btn xs primary" data-a="install">${L('ইনস্টল', 'Install')}</button><button class="icon-btn ghost" style="width:34px;height:34px" data-a="dismissInstall" aria-label="close">${ic('x', 'xs')}</button></div>` : ''}
      <p class="center tiny muted mt-l">“${L('এক ধাপ করে পড়ো। পারফেকশনের চেয়ে অগ্রগতি বেশি গুরুত্বপূর্ণ।', 'Study one step at a time. Progress is more important than perfection.')}”</p>
    `;
  };
  AFTER.home = function () {
    const st = S();
    if (st.streak.comebackPending && st.streak.comebackShown !== A.todayKey()) {
      st.streak.comebackShown = A.todayKey(); A.save();
      setTimeout(() => modal({
        img: 'assets/mascot.webp',
        title: L('অনেকদিন পর! 👀', 'Long time no see! 👀'),
        body: `<p class="muted">${esc(A.msgFor('miss'))}</p><p class="mt-s bold">${esc(A.rand(D.MSG.comeback))}</p><p class="small muted mt-s">${L('আজ প্রথম টাস্ক শেষ করলেই কামব্যাক বোনাস +২০ XP 🎁', 'Finish your first task today for a +20 XP comeback bonus 🎁')}</p>`,
        ok: L('চলো শুরু করি 💪', "Let's go 💪"), onOk: () => go('planner')
      }), 500);
    }
  };

  /* ------------------------------ PLANNER ------------------------------ */
  function taskCard(t, o = {}) {
    const done = A.isDone(t.id);
    const K = D.KINDS[t.kind];
    const sub = t.sub;
    return `<div class="task ${done ? 'done' : ''} ${U.justId === t.id ? 'just-done' : ''}">
      <div class="ti" style="background:${subBg(sub)};color:${subC(sub)}">${sub ? subIc(sub) : t.custom ? '📝' : (t.kind === 'reflect' ? '🪞' : t.kind === 'errrev' ? '📒' : t.kind === 'buffer' ? '🌿' : '🎯')}</div>
      <button class="task-body" data-a="taskOpen" data-id="${t.id}">
        <div class="tt ellipsis">${esc(A.taskTitle(t))}</div>
        <div class="ts ellipsis">${esc(A.taskSubtitle(t))}</div>
        <div class="meta"><span class="tag ${K.tone}">${L(K.bn, K.en)}</span><span class="tag gray">⏱ ${mins(t.min)}</span>${t.custom || t.moved ? `<span class="tag lav">✏️ ${t.custom ? L('নিজের', 'Mine') : L('সরানো', 'Moved')}</span>` : ''}${o.showDay ? `<span class="tag yellow">${L('দিন ', 'Day ')}${N(t.day)}</span>` : ''}${!done ? `<span class="tag gray">+${N(A.xpForTask(t))} XP</span>` : ''}</div>
      </button>
      <button class="check ${done ? 'on' : ''}" data-a="toggleTask" data-id="${t.id}" ${o.ro ? 'data-ro="1"' : ''} aria-label="${done ? L('অসম্পন্ন করো', 'Mark undone') : L('সম্পন্ন করো', 'Mark done')}" aria-pressed="${done}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></button>
    </div>`;
  }
  SCREENS.planner = function (arg) {
    const raw = A.rawDay();
    let day = arg ? +arg : Math.min(90, Math.max(1, raw));
    if (!(day >= 1 && day <= 90)) day = 1;
    const p = A.plan(); const w = A.weekOfDay(day); const wk = p.weeks[w - 1];
    const tasks = A.tasksOfDay(day);
    const pend = tasks.filter(t => !A.isDone(t.id)); const dn = tasks.filter(t => A.isDone(t.id));
    const locked = !A.weekUnlocked(w);
    const strip = wk.days.map(dd => {
      const d = A.dateOfDay(dd.day); const tl = dd.ids; const c = tl.filter(A.isDone).length;
      const cls = c === tl.length && tl.length ? 'full' : c ? 'part' : '';
      return `<button class="dchip ${dd.day === day ? 'on' : ''} ${dd.day === raw ? 'today' : ''} ${cls}" data-a="pday" data-day="${dd.day}"><span class="dn">${A.wd(d)}</span><span class="dd">${N(d.getDate())}</span><span class="dp"></span></button>`;
    }).join('');
    const limit = U.showAll ? 99 : 3;
    const shown = pend.slice(0, limit);
    const isToday = day === raw;
    const bl = isToday ? A.backlog() : [];
    const leftMin = pend.reduce((a, t) => a + t.min, 0);
    const d = A.dateOfDay(day);

    return `
      ${topbar(L('দৈনিক প্ল্যানার', 'Daily Planner'), `${A.wdFull(d)}, ${A.fmtDate(d)} · ${L('দিন ', 'Day ')}${N(day)} · ${L('সপ্তাহ ', 'Week ')}${N(w)}`)}
      <div class="day-strip">${strip}</div>
      <div class="card mt-s">
        <div class="row between"><div><div class="eyebrow">${isToday ? L('আজকের অগ্রগতি', "Today's progress") : L('এই দিনের অগ্রগতি', 'Progress for this day')}</div><div class="h2">${N(dn.length)}<span class="muted" style="font-size:16px"> / ${N(tasks.length)} ${L('সম্পন্ন', 'done')}</span></div></div>
        <div class="center"><div class="tiny muted">${L('বাকি সময়', 'Time left')}</div><div class="bold">${mins(leftMin)}</div></div></div>
        <div class="mt-s">${bar(tasks.length ? dn.length / tasks.length : 0, 'mint')}</div>
      </div>
      ${locked ? `<div class="banner warn mt">${ic('lock', 'sm')}<span>${L('এই সপ্তাহ এখনো লক। আগের সপ্তাহের ৮০% শেষ করলে বা নির্ধারিত দিন এলে খুলে যাবে।', 'This week is locked. Finish 80% of the previous week or wait for its start day.')}</span></div>` : ''}

      <div class="section-title"><h3>${pend.length ? L('পরের কাজগুলো', 'Up next') : L('সব কাজ শেষ', 'All done')}</h3><button class="tag lav tap" data-a="go" data-to="planedit" data-arg="${w}">✏️ ${L('প্ল্যান এডিট', 'Edit plan')}</button></div>
      ${pend.length ? shown.map(t => taskCard(t, { ro: locked })).join('') : `<div class="card all-done"><img src="assets/rocket.webp" alt=""><div class="h3">${L('দারুণ! এই দিনের মিশন সম্পন্ন 🎉', 'Awesome! Mission complete 🎉')}</div><p class="muted small mt-s">${L('বাড়তি সময় থাকলে ভুলের খাতা রিভিউ বা একটা ফোকাস সেশন দাও।', 'Got extra time? Review mistakes or do a focus session.')}</p><div class="row mt" style="justify-content:center"><button class="btn sm ghost" data-a="go" data-to="errors">📒 ${L('ভুলের খাতা', 'Mistakes')}</button><button class="btn sm primary" data-a="go" data-to="focus">🎯 ${L('ফোকাস', 'Focus')}</button></div></div>`}
      ${pend.length > 3 ? `<button class="btn outline block mt" data-a="toggleShowAll">${U.showAll ? L('কম দেখাও', 'Show less') : L(`আরও ${N(pend.length - 3)}টি কাজ দেখাও`, `Show ${pend.length - 3} more`)}</button>` : ''}

      ${dn.length ? `<button class="collapse-head mt ${U.doneOpen ? 'open' : ''}" data-a="toggleDone"><span>✅ ${L('সম্পন্ন', 'Completed')} (${N(dn.length)})</span>${ic('chevR', 'sm')}</button>${U.doneOpen ? dn.map(t => taskCard(t)).join('') : ''}` : ''}

      ${bl.length ? `<button class="collapse-head mt ${U.backlogOpen ? 'open' : ''}" data-a="toggleBacklog"><span>🌱 ${L('আগের বাকি কাজ', 'Earlier pending')} (${N(bl.length)})</span>${ic('chevR', 'sm')}</button>${U.backlogOpen ? `<p class="tiny muted mb">${L('পিছিয়ে পড়া স্বাভাবিক। প্রতিদিন ১–২টা করে শেষ করলেই ধরে ফেলবে।', 'Falling behind is normal. Clear 1–2 a day and you will catch up.')}</p>` + bl.slice(0, 12).map(t => taskCard(t, { showDay: true })).join('') : ''}` : ''}
    `;
  };
  AFTER.planner = () => { U.justId = null; };

  /* ------------------------------ ROADMAP ------------------------------ */
  SCREENS.roadmap = function () {
    const st = S(), p = A.plan(), raw = A.rawDay(), cd = A.currentDay(), cw = A.weekOfDay(cd);
    const overall = A.overallProgress();
    let html = `
      <div class="blob b1"></div>
      <div class="topbar"><div class="title"><div class="eyebrow">${L('৯০ দিনের প্রস্তুতি', '90-day preparation')}</div><div class="h1">${L('তোমার যাত্রা', 'Your Journey')}</div></div></div>
      ${A.peTabs ? A.peTabs('roadmap') : ''}
      <div style="height:12px"></div>
      <div class="card row gap-l">
        ${ring(overall, 86, 9, '#7B61FF', `<div><div style="font-size:18px">${pctTxt(overall)}</div><div class="tiny muted" style="font-weight:600">${L('সম্পন্ন', 'done')}</div></div>`)}
        <div class="grow">
          <div class="bold">${L('দিন ', 'Day ')}${N(Math.max(0, Math.min(raw, 90)))} / ${N(90)} · ${L('সপ্তাহ ', 'Week ')}${N(cw)}</div>
          <div class="small muted">${L('পরবর্তী ধাপ: আজকের কাজগুলো শেষ করো', 'Next step: finish today’s tasks')}</div>
          <button class="btn sm primary mt-s" data-a="go" data-to="planner">${L('আজকের কাজ', "Today's tasks")} ${ic('chevR', 'sm')}</button>
        </div>
      </div>`;
    D.PHASES.forEach(P => {
      const pp = A.phaseProgress(P.n); const unlocked = A.weekUnlocked(P.weeks[0]); const trophy = !!st.celebrated.phases[P.n];
      html += `
        <div class="phase-card mt-l" style="background:${P.bg}">
          <img class="trophy ${trophy ? '' : 'locked'}" src="assets/trophy.webp" alt="">
          <div class="row"><div class="ph-num" style="background:${P.c}">${N(P.n)}</div><div class="grow" style="padding-right:60px"><div class="eyebrow">${L('ফেজ ', 'Phase ')}${N(P.n)} · ${L('দিন ', 'Days ')}${N(P.days[0])}–${N(P.days[1])}</div><div class="h3">${L(P.bn, P.en)}</div></div></div>
          <p class="small mt-s" style="color:var(--ink-2)">${L(P.focus, P.focusEn)}</p>
          <div class="row mt-s"><div class="grow">${bar(pp)}</div><span class="small bold">${pctTxt(pp)}</span></div>
          ${!unlocked ? `<div class="tag gray mt-s">${ic('lock', 'xs')} ${L('আনলক হবে দিন ', 'Unlocks on day ')}${N(P.days[0])}</div>` : ''}
        </div>
        <div class="journey">
          <svg class="path" viewBox="0 0 100 400" preserveAspectRatio="none"><path d="M28 0 C28 50, 72 50, 72 100 S28 150, 28 200 S72 250, 72 300 S28 350, 28 400" fill="none" stroke="${P.c}" stroke-opacity=".35" stroke-width="3" stroke-dasharray="2 9" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>`;
      for (let w = P.weeks[0]; w <= P.weeks[1]; w++) {
        const wk = p.weeks[w - 1]; const wp = A.weekProgress(w); const un = A.weekUnlocked(w); const cur = w === cw && raw >= 1 && raw <= 90;
        const tl = A.weekTasks(w); const dc = tl.filter(t => A.isDone(t.id)).length;
        const doneW = !!st.celebrated.weeks[w];
        html += `<button class="wk-node tap ${w % 2 === 0 ? 'right' : ''} ${un ? '' : 'locked'} ${cur ? 'current' : ''}" data-a="openWeek" data-w="${w}">
          <div class="wk-badge">${ring(wp, 54, 5, doneW ? '#1FB383' : P.c, doneW ? '🚀' : un ? `<span style="font-size:15px">${N(w)}</span>` : ic('lock', 'sm'))}</div>
          <div class="grow"><div class="eyebrow">${L('সপ্তাহ ', 'Week ')}${N(w)} · ${L('দিন ', 'Day ')}${N(wk.range[0])}–${N(wk.range[1])}</div><div class="bold small" style="line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${esc(L(wk.goal, wk.goalEn))}</div><div class="tiny muted">${N(dc)}/${N(tl.length)} ${L('কাজ', 'tasks')}${cur ? ' · <b style="color:var(--lav-600)">' + L('চলমান', 'Current') + '</b>' : ''}</div></div>
        </button>`;
      }
      html += `</div><div class="milestone"><span class="m-ico" style="${trophy ? '' : 'filter:grayscale(1);opacity:.5'}">🏆</span>${L('ফেজ ', 'Phase ')}${N(P.n)} ${L('ট্রফি', 'trophy')}${trophy ? ' ✓' : ''}</div>`;
    });
    html += `<p class="center tiny muted">${L('সপ্তাহের ৯০% কাজ শেষ হলে রকেট লঞ্চ হবে 🚀 আর একটি ফেজের সব সপ্তাহ জিতলে ট্রফি 🏆', 'Finish 90% of a week to launch a rocket 🚀 — win all weeks of a phase for a trophy 🏆')}</p>`;
    return html;
  };

  function weekSheet(w) {
    const p = A.plan(), wk = p.weeks[w - 1], st = S();
    const un = A.weekUnlocked(w); const P = D.PHASES[wk.phase - 1];
    const tl = A.weekTasks(w); const dc = tl.filter(t => A.isDone(t.id)).length;
    // subjects & chapters summary
    const bySub = {};
    wk.units.forEach(([sub, chs, kind]) => { if (!sub) return; (bySub[sub] = bySub[sub] || []).push({ chs, kind }); });
    const subHtml = Object.keys(bySub).map(sub => {
      const parts = bySub[sub].map(u => {
        const K = D.KINDS[u.kind === 'cq' ? 'board' : u.kind];
        const lbl = u.kind === 'cq' ? L('CQ মাস্ট', 'CQ must') : L(K.bn, K.en);
        if (!u.chs.length) return lbl;
        const s = D.SUBJECTS[sub];
        const list = s.unit === 'item' ? (u.chs.length > 4 ? N(u.chs.length) + L('টি আইটেম', ' items') : u.chs.map(n => A.chapter(sub, n).t).join(', ')) : L('অধ্যায় ', 'Ch ') + u.chs.map(n => N(n)).join(', ');
        return `${list} <span class="muted">(${lbl})</span>`;
      }).join('<br>');
      return `<div class="row top" style="padding:10px 0;border-bottom:1px solid var(--line-2)"><div class="ti" style="width:36px;height:36px;border-radius:12px;display:grid;place-items:center;background:${subBg(sub)};color:${subC(sub)};flex:none">${subIc(sub, 'sm')}</div><div class="grow"><div class="bold small">${esc(A.subName(sub))}</div><div class="tiny" style="color:var(--ink-2)">${parts}</div></div></div>`;
    }).join('');
    const openDay = U.openDay && wk.days.some(d => d.day === U.openDay) ? U.openDay : (wk.days.find(d => d.day === A.rawDay()) || wk.days[0]).day;
    const days = wk.days.map(dd => {
      const d = A.dateOfDay(dd.day); const c = dd.ids.filter(A.isDone).length; const open = dd.day === openDay;
      const isReview = dd === wk.days[wk.days.length - 1];
      return `<div class="card tight flat" style="margin-top:8px;padding:6px 12px">
        <button class="collapse-head ${open ? 'open' : ''}" data-a="weekDay" data-day="${dd.day}" style="color:var(--ink)"><span>${L('দিন ', 'Day ')}${N(dd.day)} · <span class="muted" style="font-weight:600">${A.wd(d)}, ${A.fmtDate(d)}</span>${isReview ? ' · 🧪' : ''}</span><span class="row gap-s"><span class="tag ${c === dd.ids.length ? 'mint' : 'gray'}">${N(c)}/${N(dd.ids.length)}</span>${ic('chevR', 'sm')}</span></button>
        ${open ? `<div style="padding-bottom:10px">${dd.ids.map(id => taskCard(p.tasks[id], { ro: !un })).join('')}</div>` : ''}
      </div>`;
    }).join('');
    const tests = wk.tests.map(id => {
      const t = p.tests[id]; const r = st.tests[id];
      return `<div class="test-row"><div class="ti" style="width:38px;height:38px;border-radius:12px;display:grid;place-items:center;background:${subBg(t.sub)};color:${subC(t.sub)};flex:none">${subIc(t.sub, 'sm')}</div><div class="grow"><div class="bold small">${esc(A.testTitle(t))}</div><div class="tiny muted">${r ? L('নম্বর: ', 'Score: ') + N(r.got) + '/' + N(r.total) : L('এখনো দেওয়া হয়নি', 'Not taken yet')}</div></div>${r ? `<span class="score-pill" style="background:var(--mint-100);color:var(--mint-600)">${N(A.testPct(r))}%</span>` : `<button class="btn xs ghost" data-a="testEntry" data-id="${id}" ${un ? '' : 'disabled'}>${L('নম্বর লিখো', 'Add score')}</button>`}</div>`;
    }).join('');
    const ref = st.reflections[w];
    return {
      head: `<div class="grow"><div class="eyebrow">${L('ফেজ ', 'Phase ')}${N(wk.phase)} · ${L(P.bn, P.en)}</div><div class="h2">${L('সপ্তাহ ', 'Week ')}${N(w)} <span class="muted" style="font-size:15px;font-weight:600">· ${L('দিন ', 'Day ')}${N(wk.range[0])}–${N(wk.range[1])}</span></div></div>`,
      body: `
        ${!un ? `<div class="banner warn">${ic('lock', 'sm')}<span>${L('এই সপ্তাহ লক করা। আগের সপ্তাহের ৮০% শেষ করলে বা দিন ', 'Locked. Finish 80% of the previous week or wait until day ')}${N(wk.range[0])}${L(' এলে খুলবে। এখন শুধু প্রিভিউ দেখতে পারো।', '. Preview only for now.')}</span></div>` : ''}
        <div class="card ${wk.phase === 1 ? 'lav' : wk.phase === 2 ? 'mint' : 'peach'} mt-s"><div class="eyebrow">🎯 ${L('সাপ্তাহিক লক্ষ্য', 'Weekly goal')}</div><div class="bold mt-s">${esc(L(wk.goal, wk.goalEn))}</div><div class="row mt"><div class="grow">${bar(tl.length ? dc / tl.length : 0)}</div><span class="small bold">${N(dc)}/${N(tl.length)}</span></div></div>
        <div class="section-title"><h3>${L('বিষয় ও অধ্যায়', 'Subjects & chapters')}</h3></div>
        <div class="card tight">${subHtml}</div>
        <div class="section-title"><h3>${L('দৈনিক কাজ', 'Daily tasks')}</h3><button class="tag lav tap" data-a="go" data-to="planedit" data-arg="${w}">✏️ ${L('কাস্টমাইজ', 'Customize')}</button></div>
        ${days}
        <div class="section-title"><h3>${L('সাপ্তাহিক পরীক্ষা', 'Weekly tests')}</h3></div>
        <div class="card tight">${tests || `<p class="muted small">${L('এই সপ্তাহে নির্ধারিত পরীক্ষা নেই', 'No tests this week')}</p>`}</div>
        <div class="section-title"><h3>${L('রিভিউ ও রিফ্লেকশন', 'Review & reflection')}</h3></div>
        <button class="card tight row tap" style="width:100%;text-align:left" data-a="reflect" data-w="${w}" ${un ? '' : 'disabled'}><div style="font-size:30px">${ref ? ['😫', '😕', '😐', '🙂', '🤩'][ref.mood - 1] : '🪞'}</div><div class="grow"><div class="bold small">${ref ? L('রিফ্লেকশন লেখা হয়েছে ✓', 'Reflection saved ✓') : L('এই সপ্তাহ কেমন গেল?', 'How did this week go?')}</div><div class="tiny muted ellipsis">${ref ? esc(ref.good || ref.goal || '') : L('২ মিনিটে নিজের অগ্রগতি ভেবে দেখো', 'Take 2 minutes to reflect')}</div></div>${ic('chevR', 'sm')}</button>
        <div style="height:10px"></div>`
    };
  }

  /* ------------------------------ SUBJECTS ------------------------------ */
  SCREENS.subjects = function () {
    const st = S(), G = D.GROUPS[st.profile.group];
    let tot = 0, all = 0; G.subjects.forEach(s => { const ss = A.subjectStats(s); tot += ss.pct * ss.total; all += ss.total; });
    const mastered = A.masteredChapters();
    return `
      <div class="blob b1"></div>
      <div class="topbar"><div class="title"><div class="eyebrow">${G.emoji} ${L(G.bn + ' বিভাগ', G.en + ' group')}</div><div class="h1">${L('বিষয়সমূহ', 'Subjects')}</div></div></div>
      <div class="card row gap-l">
        ${ring(all ? tot / all : 0, 72, 8, '#1FB383', `<span style="font-size:15px">${pctTxt(all ? tot / all : 0)}</span>`)}
        <div class="grow"><div class="bold">${L('মোট মাস্টারি', 'Overall mastery')}</div><div class="small muted">${N(mastered)} ${L('টি অধ্যায় ৪/৪ ধাপ সম্পন্ন', 'chapters fully mastered')}</div><div class="tiny muted mt-s">${L('প্রতিটি অধ্যায়ে ৪টি ধাপ: মূল বই → বোর্ড → টেস্ট পেপার → রিভিশন', 'Each chapter: Textbook → Board → Test paper → Revision')}</div></div>
      </div>
      <div class="sub-grid mt">
        ${G.subjects.map(s => {
          const ss = A.subjectStats(s); const sd = D.SUBJECTS[s];
          return `<button class="sub-card tap" data-a="go" data-to="subject" data-arg="${s}">
            <span class="shine" style="background:${sd.bg}"></span>
            ${ring(ss.pct, 44, 4.5, sd.c, `<span style="font-size:10.5px">${N(Math.round(ss.pct * 100))}%</span>`)}
            <span class="si" style="background:${sd.bg};color:${sd.c}">${subIc(s)}</span>
            <span class="nm">${esc(A.subName(s))}</span>
            <span class="meta">✓ ${N(ss.done)} · ◐ ${N(ss.started)} · ${L('বাকি ', 'left ')}${N(ss.left)}</span>
          </button>`;
        }).join('')}
      </div>`;
  };

  SCREENS.subject = function (sub) {
    const sd = D.SUBJECTS[sub]; if (!sd) return SCREENS.subjects();
    const ss = A.subjectStats(sub);
    const f = U.chFilter;
    let chs = sd.chapters;
    if (f === 'star3') chs = chs.filter(c => c.s === 3);
    else if (f === 'progress') chs = chs.filter(c => { const k = A.stepCount(sub, c.n); return k > 0 && k < 4; });
    else if (f === 'left') chs = chs.filter(c => A.stepCount(sub, c.n) === 0);
    else if (f === 'done') chs = chs.filter(c => A.stepCount(sub, c.n) === 4);
    const filters = [['all', L('সব', 'All')], ['star3', '★★★ ' + L('CQ মাস্ট', 'CQ must')], ['progress', L('চলমান', 'In progress')], ['left', L('বাকি', 'Not started')], ['done', L('সম্পন্ন', 'Done')]];
    return `
      ${topbar(esc(A.subName(sub)), esc(sd.en))}
      <div class="sub-head" style="background:${sd.bg}">
        <div class="row"><span class="si" style="color:${sd.c}">${subIc(sub, 'lg')}</span><div class="grow"><div class="h2">${esc(A.subName(sub))}</div><div class="small muted">${N(ss.total)} ${sd.unit === 'item' ? L('টি আইটেম', 'items') : L('টি অধ্যায়', 'chapters')}</div></div>${ring(ss.pct, 70, 7, sd.c, `<span style="font-size:15px">${pctTxt(ss.pct)}</span>`, 'rgba(255,255,255,.8)')}</div>
        <div class="split-stats"><div><b style="color:var(--mint-600)">${N(ss.done)}</b><span>${L('সম্পন্ন', 'Done')}</span></div><div><b style="color:${sd.c}">${N(ss.started)}</b><span>${L('চলমান', 'Ongoing')}</span></div><div><b>${N(ss.left)}</b><span>${L('বাকি', 'Left')}</span></div></div>
      </div>
      <div class="row tiny muted mt" style="flex-wrap:wrap;gap:12px"><span>${stars(3)} ${L('CQ মাস্ট', 'CQ must')}</span><span>${stars(2)} ${L('ব্যাকআপ CQ', 'Backup CQ')}</span><span>${stars(1)} ${L('শুধু MCQ/SQ', 'MCQ/SQ only')}</span></div>
      <div class="chips mt">${filters.map(([k, t]) => `<button class="chip ${f === k ? 'on' : ''}" data-a="chFilter" data-f="${k}">${t}</button>`).join('')}</div>
      <div class="mt-s">
        ${chs.length ? chs.map(c => {
          const k = A.stepCount(sub, c.n);
          return `<button class="chap tap ${k === 4 ? 'done' : ''}" data-a="openChapter" data-sub="${sub}" data-n="${c.n}">
            <span class="cn" style="background:${sd.bg};color:${sd.c}">${k === 4 ? '✓' : N(c.n)}</span>
            <span class="grow"><span class="row gap-s">${c.p ? `<span class="tag gray">${esc(c.p)}</span>` : ''}${stars(c.s)}</span><span class="bold small" style="display:block;margin-top:2px;line-height:1.35">${esc(A.chLabel(sub, c.n))}</span>
            <span class="steps-mini">${[1, 2, 3, 4].map(st => `<i style="${A.stepDone(sub, c.n, st) ? 'background:' + sd.c : ''}"></i>`).join('')}</span></span>
            <span class="small bold" style="color:${k ? sd.c : 'var(--muted-2)'}">${N(k * 25)}%</span>
          </button>`;
        }).join('') : `<div class="empty"><img src="assets/books.webp" alt=""><h3>${L('এই ফিল্টারে কিছু নেই', 'Nothing here')}</h3><p>${L('অন্য ফিল্টার বেছে নাও', 'Try another filter')}</p></div>`}
      </div>`;
  };

  function chapterSheet(sub, n) {
    const sd = D.SUBJECTS[sub], c = A.chapter(sub, n), k = A.stepCount(sub, n);
    const nextStep = [1, 2, 3, 4].find(s => !A.stepDone(sub, n, s));
    const errs = S().errors.filter(e => e.sub === sub && +e.ch === +n).length;
    const starTxt = c.s === 3 ? L('CQ + MCQ + SQ মাস্ট ডু', 'CQ + MCQ + SQ must-do') : c.s === 2 ? L('ব্যাকআপ CQ + MCQ', 'Backup CQ + MCQ') : L('শুধু MCQ ও সংক্ষিপ্ত প্রশ্ন', 'MCQ & short questions only');
    return {
      head: `<span class="si" style="width:46px;height:46px;border-radius:15px;display:grid;place-items:center;background:${sd.bg};color:${sd.c};flex:none">${subIc(sub)}</span><div class="grow"><div class="eyebrow">${esc(A.subName(sub))}</div><div class="h3">${esc(A.chLabel(sub, n))}</div></div>`,
      body: `
        <div class="card row gap-l">${ring(k / 4, 76, 8, sd.c, `<div><div style="font-size:17px">${N(k * 25)}%</div><div class="tiny muted">${L('মাস্টারি', 'mastery')}</div></div>`)}<div class="grow"><div>${stars(c.s)}</div><div class="small bold mt-s">${starTxt}</div><div class="tiny muted">${errs ? `📒 ${N(errs)} ${L('টি ভুল লগ করা আছে', 'mistakes logged')}` : L('ধাপগুলো সম্পন্ন করে টিক দাও', 'Tick each step when done')}</div></div></div>
        <div class="section-title"><h3>${L('৪-ধাপ মাস্টারি টাইমলাইন', '4-step mastery timeline')}</h3></div>
        <div class="timeline">
          ${D.STEPS.map(s => {
            const done = A.stepDone(sub, n, s.n);
            return `<div class="tl-step ${done ? 'done' : ''} ${s.n === nextStep ? 'next' : ''}">
              <div class="tl-dot">${s.icon}</div>
              <div class="tl-body">
                <div class="row between"><div class="eyebrow">${L('ধাপ ', 'Step ')}${N(s.n)} · ${L('সময় ', 'time ')}${s.share}</div>${s.n === nextStep ? `<span class="tag lav">${L('পরের ধাপ', 'Next')}</span>` : ''}</div>
                <div class="bold">${L(s.bn, s.en)}</div>
                <div class="small muted" style="margin-top:2px">${L(s.d, s.dEn)}</div>
                <button class="btn xs ${done ? 'outline' : 'mint'} mt-s" data-a="stepToggle" data-sub="${sub}" data-n="${n}" data-s="${s.n}">${done ? L('↺ অসম্পন্ন করো', '↺ Undo') : L('✓ সম্পন্ন', '✓ Mark done')}</button>
              </div></div>`;
          }).join('')}
        </div>
        <div class="row mt-l"><button class="btn ghost grow" data-a="focusOn" data-sub="${sub}" data-n="${n}">🎯 ${L('ফোকাস শুরু', 'Focus')}</button><button class="btn outline grow" data-a="addError" data-sub="${sub}" data-n="${n}">📒 ${L('ভুল যোগ করো', 'Log mistake')}</button></div>
        <div style="height:6px"></div>`
    };
  }

  /* ------------------------------ FOCUS ------------------------------ */
  function fmtT(s) { return N(A.pad2(Math.floor(s / 60))) + ':' + N(A.pad2(s % 60)); }
  SCREENS.focus = function () {
    const st = S(), t = A.timer(); const left = A.timerLeft();
    const running = t.running; const paused = !running && left < t.duration; const isBreak = t.mode === 'break';
    const R = 120, C = 2 * Math.PI * R; const off = C * (1 - (t.duration - left) / t.duration);
    const tf = A.todayFocus();
    const dark = running;
    const subLabel = t.sub ? A.subName(t.sub) : L('বিষয় বেছে নাও', 'Choose a subject');
    const chLabel = t.sub && t.ch ? A.chLabel(t.sub, t.ch) : (t.sub ? L('যেকোনো অধ্যায়', 'Any chapter') : L('ঐচ্ছিক — XP যেকোনোভাবেই পাবে', 'Optional — you earn XP anyway'));
    const presets = [['pomo', L('২৫/৫', '25/5')], ['deep', L('৫০/১০', '50/10')], ['custom', L('কাস্টম', 'Custom')]];
    const dots = Array.from({ length: 4 }, (_, i) => `<i class="${i < (t.cycle % 4) ? 'on' : ''}"></i>`).join('');
    const quiet = [L('ফোন উল্টে রাখো, শুধু তুমি আর বই 📖', 'Flip your phone. Just you and the book 📖'), L('এক ধাপ, শুধু এই সেশনটা 💜', 'One step — just this session 💜'), L('গভীর শ্বাস নাও… তুমি পারবে 🌿', 'Breathe… you can do this 🌿')];
    return `
      <div style="margin:calc(-14px - var(--safe-t)) -18px 0;padding:calc(14px + var(--safe-t)) 18px 30px;min-height:100dvh;position:relative" class="${dark ? 'focus-dark' : ''}">
        <div class="focus-room ${running ? 'running' : ''} ${isBreak ? 'break' : ''}"></div>
        <div style="position:relative;z-index:1">
          <div class="row between">
            <div><div class="eyebrow">${dark ? L('ফোকাস মোড চলছে', 'Focus mode on') : L('মনোযোগের ঘর', 'Distraction-free')}</div><div class="h1">${L('ফোকাস রুম', 'Focus Room')}</div></div>
            ${!running ? `<div class="seg">${presets.map(([k, l]) => `<button class="${st.settings.focusPreset === k ? 'on' : ''}" data-a="preset" data-p="${k}">${l}</button>`).join('')}</div>` : ''}
          </div>
          ${!running ? `<button class="pick tap mt" data-a="pickSubject"><span class="ti" style="width:44px;height:44px;border-radius:14px;display:grid;place-items:center;background:${subBg(t.sub)};color:${subC(t.sub)};flex:none">${t.sub ? subIc(t.sub) : '📚'}</span><span class="grow"><span class="bold small ellipsis" style="display:block">${esc(subLabel)}</span><span class="tiny muted ellipsis" style="display:block">${esc(chLabel)}</span></span>${ic('chevR', 'sm')}</button>` : `<div class="center mt"><div class="bold">${esc(subLabel)}</div><div class="small muted">${esc(t.sub && t.ch ? A.chLabel(t.sub, t.ch) : '')}</div></div>`}
          <div class="focus-wrap">
            <div class="timer-ring ${isBreak ? 'break' : ''} ${running ? 'run breath' : ''}">
              <svg viewBox="0 0 280 280"><circle class="trk" cx="140" cy="140" r="${R}"/><circle id="tPrg" class="prg" cx="140" cy="140" r="${R}" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}"/></svg>
              <div class="orbit"><i></i></div>
              <div class="inner"><div class="time" id="tTime">${fmtT(left)}</div><div class="mode">${isBreak ? L('☕ বিরতি', '☕ Break') : L('🎯 ফোকাস', '🎯 Focus')}</div></div>
            </div>
            <div class="small muted" style="min-height:22px">${running ? esc(quiet[Math.floor(Date.now() / 60000) % quiet.length]) : paused ? L('বিরতি দেওয়া আছে — প্রস্তুত হলে চালু করো', 'Paused — resume when ready') : isBreak ? L('শরীর টানটান করো, পানি খাও 💧', 'Stretch and drink water 💧') : L('শুরু করতে প্লে চাপো', 'Press play to begin')}</div>
            <div class="ctrls">
              <button class="icon-btn ${dark ? 'ghost' : ''}" style="${dark ? 'color:#fff;border-color:rgba(255,255,255,.2)' : ''}" data-a="timerStop" aria-label="${L('শেষ করো', 'Stop')}" ${!running && !paused ? 'disabled style="opacity:.4"' : ''}>${ic('stop', 'sm')}</button>
              <button class="big-play ${running ? 'pause' : ''}" data-a="${running ? 'timerPause' : 'timerStart'}" aria-label="${running ? L('বিরতি', 'Pause') : L('শুরু', 'Start')}">${ic(running ? 'pause' : 'play')}</button>
              <button class="icon-btn ${dark ? 'ghost' : ''}" style="${dark ? 'color:#fff;border-color:rgba(255,255,255,.2)' : ''}" data-a="timerSkip" aria-label="${L('স্কিপ', 'Skip')}">${ic('skip', 'sm')}</button>
            </div>
            <div class="sess-dots">${dots}</div>
            <div class="tiny muted mt-s">${L('৪টি সেশন পর ১৫ মিনিটের লম্বা বিরতি', 'Long 15-min break after 4 sessions')}</div>
          </div>
          ${!running ? `
          <div class="stat-row" style="grid-template-columns:1fr 1fr;margin-top:22px">
            <div class="stat"><div class="k">${L('আজকের ফোকাস', 'Focus today')}</div><div class="v">${mins(tf.m)}</div><div class="tiny muted">${N(tf.n)} ${L('টি সেশন', 'sessions')}</div></div>
            <div class="stat"><div class="k">${L('সেশন রিওয়ার্ড', 'Session reward')}</div><div class="v" style="color:var(--mint-600)">+${N(A.presetMins()[0] + 5)} XP</div><div class="tiny muted">${L('প্রতি মিনিটে ১ XP + বোনাস', '1 XP/min + bonus')}</div></div>
          </div>
          ${st.settings.focusPreset === 'custom' ? `<div class="card tight mt row between"><span class="bold small">${L('কাস্টম সময়', 'Custom length')}</span><div class="row gap-s">${[15, 30, 40, 60, 90].map(m => `<button class="chip ${st.settings.custom === m ? 'on' : ''}" style="height:32px;padding:0 10px" data-a="customMin" data-m="${m}">${N(m)}</button>`).join('')}</div></div>` : ''}
          <div class="card tight mt row"><svg class="lamp" viewBox="0 0 70 70"><circle class="glow" cx="35" cy="46" r="22" fill="#FFE69A" opacity=".55"/><path d="M20 30 L35 14 L50 30 Z" fill="#B9A7FF"/><rect x="33" y="30" width="4" height="26" rx="2" fill="#7B61FF"/><rect x="22" y="56" width="26" height="6" rx="3" fill="#7B61FF"/></svg><div class="grow small" style="color:var(--ink-2)">${L('টাইমার চলার সময় স্ক্রিন জেগে থাকবে এবং নেভিগেশন লুকানো থাকবে—যাতে মনোযোগ না ভাঙে।', 'While running, the screen stays awake and navigation hides — so nothing breaks your focus.')}</div></div>` : ''}
        </div>
      </div>`;
  };
  let focusInt = null;
  AFTER.focus = function () {
    clearInterval(focusInt);
    focusInt = setInterval(() => {
      if (route.name !== 'focus') { clearInterval(focusInt); return; }
      const t = S().timer; if (!t) return;
      const left = A.timerLeft();
      const el = $('#tTime'); if (el) el.textContent = fmtT(left);
      const pr = $('#tPrg'); if (pr) { const C = 2 * Math.PI * 120; pr.style.strokeDashoffset = (C * (1 - (t.duration - left) / t.duration)).toFixed(1); }
      if (t.running && left <= 0) { A.timerCheck(); render({ keep: true }); }
    }, 500);
  };

  /* ------------------------------ PROFILE ------------------------------ */
  SCREENS.profile = function () {
    const st = S(), p = st.profile, li = A.levelInfo(), G = D.GROUPS[p.group];
    const fm = st.focus.sessions.reduce((a, s) => a + s.m, 0);
    const earned = D.BADGES.filter(b => st.badges[b.id]);
    const preview = earned.concat(D.BADGES.filter(b => !st.badges[b.id])).slice(0, 6);
    const syncTxt = !A.hasApi() ? L('লোকাল মোড (সার্ভার সেট করা নেই)', 'Local mode (no server configured)') : st.sync.registered ? (st.sync.lastSync ? L('সর্বশেষ সিঙ্ক: ', 'Last sync: ') + new Date(st.sync.lastSync).toLocaleTimeString(A.isBn() ? 'bn-BD' : 'en-US', { hour: '2-digit', minute: '2-digit' }) : L('রেজিস্টার্ড ✓', 'Registered ✓')) : L('সার্ভারে রেজিস্টার বাকি — অনলাইনে এলে হবে', 'Pending registration — will sync when online');
    const mi = (a, e, bg, t, sub, extra = '') => `<button class="menu-item" data-a="${a}" ${extra}><span class="mi" style="background:${bg}">${e}</span><span class="grow"><span class="bold small" style="display:block">${t}</span>${sub ? `<span class="tiny muted" style="display:block">${sub}</span>` : ''}</span><span class="chev">${ic('chevR', 'sm')}</span></button>`;
    return `
      <div class="blob b1"></div>
      <div class="topbar"><div class="title"><div class="h1">${L('প্রোফাইল', 'Profile')}</div></div><button class="icon-btn" data-a="editProfile" aria-label="edit">${ic('edit', 'sm')}</button></div>
      <div class="id-card">
        <div class="ring-bg"></div>
        <div class="row gap-l" style="position:relative">${avatar(p.name, 'lg')}<div class="grow"><div class="h2" style="color:#fff">${esc(p.name)}</div><div class="small" style="opacity:.9">${esc(p.school)}</div><div class="tiny" style="opacity:.8">${L('রোল ', 'Roll ')}${esc(N(p.roll))} · ${G.emoji} ${L(G.bn, G.en)}${p.district ? ' · ' + esc(p.district) : ''}</div></div></div>
        <div class="row between mt" style="position:relative"><button class="uid tap" data-a="copyId" style="color:#fff">${esc(p.uid)} ${ic('copy', 'xs')}</button><span class="tiny" style="opacity:.85">${L('ইউনিক আইডি', 'Unique ID')}</span></div>
      </div>
      <div class="card mt">
        <div class="row between"><div><div class="eyebrow">${L('লেভেল ', 'Level ')}${N(li.level)}</div><div class="h3">${esc(li.name)}</div></div><div class="tag lav" style="font-size:14px">${N(st.xp)} XP</div></div>
        <div class="mt-s">${bar(li.pct)}</div><div class="tiny muted mt-s">${L('পরের লেভেলে আর ', 'Next level in ')}${N(li.toNext)} XP</div>
      </div>
      <div class="stat-grid mt">
        <div class="stat"><div class="k">🔥 ${L('বর্তমান স্ট্রিক', 'Current streak')}</div><div class="v">${N(A.streakNow())}</div></div>
        <div class="stat"><div class="k">⭐ ${L('সেরা স্ট্রিক', 'Best streak')}</div><div class="v">${N(Math.max(st.streak.best, A.streakNow()))}</div></div>
        <div class="stat"><div class="k">⏳ ${L('মোট ফোকাস', 'Total focus')}</div><div class="v" style="font-size:20px">${mins(fm)}</div></div>
        <div class="stat"><div class="k">✅ ${L('সম্পন্ন কাজ', 'Tasks done')}</div><div class="v">${N(Object.keys(st.tasks).length)}</div></div>
      </div>
      <div class="section-title"><h3>${L('ট্রফি', 'Trophies')}</h3></div>
      ${trophyShelf()}
      <div class="section-title"><h3>${L('ব্যাজ', 'Badges')} <span class="muted small">${N(earned.length)}/${N(D.BADGES.length)}</span></h3><button class="tag lav tap" data-a="go" data-to="badges">${L('সব দেখো', 'See all')} ${ic('chevR', 'xs')}</button></div>
      <div class="badge-grid">${preview.map(badgeHtml).join('')}</div>
      <div class="section-title"><h3>${L('পড়াশোনা', 'Study')}</h3></div>
      <div class="menu">
        ${mi('go', '🏆', 'var(--mint-100)', L('প্রতিযোগিতা জোন', 'Competition zone'), L('স্কুল ও গ্রুপ লিডারবোর্ড', 'School & group leaderboards'), 'data-to="leaderboard"')}
        ${mi('go', '✏️', 'var(--lav-100)', L('কাস্টম প্ল্যান', 'Custom plan'), A.planCustomized && A.planCustomized() ? L('তোমার নিজের মতো সাজানো ✓', 'Customized by you ✓') : L('প্রতি সপ্তাহের কাজ নিজের মতো সাজাও', 'Arrange each week your way'), 'data-to="planedit"')}
        ${mi('go', '✍️', 'var(--yellow-100)', L('রাইটিং তালিকা (বাংলা ও ইংরেজি)', 'Writing lists (Bangla & English)'), L('অনুচ্ছেদ, রচনা, দরখাস্ত, Paragraph, Story…', 'Paragraphs, essays, letters, stories…'), 'data-to="writing"')}
        ${mi('go', '📊', 'var(--peach-100)', L('সাপ্তাহিক পরীক্ষা ও পারফরম্যান্স', 'Weekly tests & performance'), '', 'data-to="tests"')}
        ${mi('go', '📒', 'var(--lav-100)', L('ভুলের খাতা', 'Mistake notebook'), N(A.errDue().length) + L(' টি রিভিউ বাকি', ' due for review'), 'data-to="errors"')}
        ${mi('go', '🧮', 'var(--yellow-100)', L('জিপিএ ক্যালকুলেটর', 'GPA calculator'), st.gpa && st.gpa.last ? L('সর্বশেষ হিসাব: ', 'Last result: ') + 'GPA ' + N(st.gpa.last.toFixed(2)) : L('নম্বর দিয়ে জিপিএ বের করো', 'Find your GPA from marks'), 'data-to="gpa"')}
        ${mi('go', '🏛️', 'var(--blue-100)', L('এসএসসি রেজাল্ট (সরকারি সাইট)', 'SSC results (official sites)'), L('শিক্ষা বোর্ডের ওয়েবসাইট ও SMS পদ্ধতি', 'Education board websites & SMS'), 'data-to="results"')}
      </div>
      <div class="section-title"><h3>${L('সেটিংস', 'Settings')}</h3></div>
      <div class="menu">
        ${mi('go', '⏰', 'var(--peach-100)', L('অ্যালার্ম ও নোটিফিকেশন', 'Alarms & notifications'), st.settings.notif ? L('চালু ✓', 'On ✓') : L('বন্ধ — চালু করো', 'Off — turn on'), 'data-to="alarms"')}
        ${mi('go', '🛡️', '#FFE8E8', L('ফোকাস গার্ড (সোশ্যাল মিডিয়া লক)', 'Focus Guard (social media lock)'), A.isApp ? (st.guard && st.guard.enabled ? L('চালু ✓ · ', 'On ✓ · ') + N((st.guard.apps || []).filter(x => x.on).length) + L(' টি অ্যাপ', ' apps') : L('বন্ধ — চালু করো', 'Off — turn on')) : L('শুধু Android অ্যাপে (APK)', 'Android app (APK) only'), 'data-to="guard"')}
        ${mi('go', '📲', 'var(--mint-100)', L('অ্যাপ ইনস্টল করো', 'Install app'), A.isApp ? L('Android অ্যাপ ব্যবহার করছো ✓', 'Using the Android app ✓') : isStandalone() ? L('ইনস্টল করা আছে ✓ · Android APK দেখো', 'Installed ✓ · see Android APK') : L('ওয়েব অ্যাপ বা Android APK', 'Web app or Android APK'), 'data-to="install"')}
        ${mi('perfMode', '⚡', 'var(--yellow-100)', L('পারফরম্যান্স মোড', 'Performance mode'), A.perfLabel ? A.perfLabel() : '')}
        ${mi('toggleLang', '🌐', 'var(--blue-100)', L('ভাষা: বাংলা', 'Language: English'), L('English-এ পরিবর্তন করো', 'Switch to বাংলা'))}
        ${mi('startDate', '📅', 'var(--yellow-100)', L('প্রস্তুতি শুরুর তারিখ', 'Preparation start date'), A.fmtDate(A.parseKey(p.startDate)) + ' ' + A.parseKey(p.startDate).getFullYear())}
        ${mi('syncNow', '☁️', 'var(--mint-100)', L('সার্ভার সিঙ্ক', 'Server sync'), syncTxt)}
        ${mi('backup', '💾', 'var(--lav-100)', L('ব্যাকআপ ডাউনলোড', 'Download backup'), L('ফোন বদলালে এই ফাইল দিয়ে সব ফিরিয়ে আনো', 'Restore everything on a new phone'))}
        ${mi('restoreFile', '📂', 'var(--blue-100)', L('ব্যাকআপ থেকে রিস্টোর', 'Restore from backup'), '')}
        ${mi('deleteProfile', '🗑️', '#FFE8E8', `<span style="color:#D23C3C">${L('প্রোফাইল ডিলিট করো', 'Delete profile')}</span>`, L('সার্ভার ও ফোন থেকে সব তথ্য মুছে যাবে', 'Removes all data from server & device'))}
      </div>
      <p class="center tiny muted mt-l">SSC 2027 Smart Study Companion · v${esc((A.CFG.VERSION || '1.0.0'))}<br>${L('তথ্য গোপনীয়তা: শুধু নাম, স্কুল, রোল, মোবাইল ও পয়েন্ট সার্ভারে যায়; বাকি সব তোমার ফোনেই থাকে।', 'Privacy: only name, school, roll, mobile & points go to the server; everything else stays on your phone.')}</p>
      <input type="file" id="restoreInput" accept="application/json,.json" class="hidden">
    `;
  };
  function badgeHtml(b) { const on = !!S().badges[b.id]; return `<div class="badge ${on ? '' : 'locked'}"><div class="be">${b.e}</div><div class="bn">${L(b.bn, b.en)}</div><div class="bd">${L(b.d, b.dEn)}</div></div>`; }
  function trophyShelf() {
    const st = S();
    return `<div class="trophy-shelf">${D.PHASES.map(P => `<div class="tr ${st.celebrated.phases[P.n] ? '' : 'locked'}"><img src="assets/trophy.webp" alt="">${L('ফেজ ', 'Phase ')}${N(P.n)}<div class="tiny muted" style="font-weight:600">${L(P.bn, P.en)}</div></div>`).join('')}</div>`;
  }
  SCREENS.badges = function () {
    const st = S(); const earned = D.BADGES.filter(b => st.badges[b.id]).length;
    return `${topbar(L('অর্জন ও ব্যাজ', 'Achievements'), N(earned) + '/' + N(D.BADGES.length) + L(' টি ব্যাজ অর্জিত', ' badges earned'))}
      ${trophyShelf()}
      <div class="section-title"><h3>${L('ব্যাজ সংগ্রহ', 'Badge collection')}</h3></div>
      <div class="badge-grid">${D.BADGES.map(badgeHtml).join('')}</div>
      <div class="card lav mt-l small">💜 ${L('মিস করা দিনের জন্য কোনো শাস্তি নেই। ৭ দিনের স্ট্রিকে একটি “স্ট্রিক শিল্ড” পাবে যা একদিন মিস হলে স্ট্রিক বাঁচায়। ফিরে এলে কামব্যাক বোনাসও আছে!', 'No punishment for missed days. Every 7-day streak earns a shield that saves your streak once. Coming back earns a bonus too!')}</div>`;
  };

  /* ------------------------------ ALARMS / SETTINGS ------------------------------ */
  function appAlarmCard() {
    return `<div class="section-title"><h3>${L('অ্যাপ বন্ধ থাকলেও অ্যালার্ম', 'Alarms when app is closed')}</h3></div>
      <div class="card tight mint">
        <p class="small" style="color:var(--ink-2)">✅ ${L('Android অ্যাপে অ্যালার্ম ফোনের সিস্টেম থেকে বাজে — অ্যাপ বন্ধ থাকলেও, ফোন রিস্টার্ট হলেও। কিছু ফোনে (Xiaomi, Oppo, Vivo, Realme) ব্যাটারি সেভার বন্ধ রাখো।', 'In the Android app alarms ring from the system — even when the app is closed or after a restart. On Xiaomi/Oppo/Vivo/Realme, disable battery saver for this app.')}</p>
        <div class="row mt-s"><button class="btn white sm grow" data-a="nativeSet" data-w="battery">🔋 ${L('ব্যাটারি', 'Battery')}</button><button class="btn white sm grow" data-a="nativeSet" data-w="exact">⏱️ ${L('নির্দিষ্ট সময়', 'Exact alarms')}</button></div>
      </div>`;
  }
  SCREENS.alarms = function () {
    const st = S(), s = st.settings;
    const perm = A.notifPermission();
    const tg = (a, on, extra = '') => `<button class="toggle ${on ? 'on' : ''}" data-a="${a}" ${extra} role="switch" aria-checked="${on}"></button>`;
    const roasts = [['soft', '😇', L('মিষ্টি মোড', 'Sweet'), D.MSG.soft[0]], ['funny', '😂', L('মজার মোড', 'Funny'), D.MSG.funny[0]], ['savage', '🔥', L('রোস্ট মোড', 'Savage roast'), D.MSG.savage[0]]];
    return `${topbar(L('অ্যালার্ম ও নোটিফিকেশন', 'Alarms & notifications'))}
      <div class="card ${perm === 'granted' ? 'mint' : 'peach'} row">
        <div style="font-size:34px">${perm === 'granted' ? '🔔' : '🔕'}</div>
        <div class="grow"><div class="bold">${perm === 'granted' ? L('নোটিফিকেশন চালু আছে', 'Notifications are on') : perm === 'denied' ? L('নোটিফিকেশন ব্লক করা', 'Notifications blocked') : perm === 'unsupported' ? L('এই ব্রাউজারে সাপোর্ট নেই', 'Not supported here') : L('নোটিফিকেশন বন্ধ', 'Notifications off')}</div><div class="tiny muted">${perm === 'denied' ? (A.isApp ? L('ফোনের Settings → Apps → SSC 2027 → Notifications চালু করো', 'Enable in Settings → Apps → SSC 2027 → Notifications') : L('ব্রাউজারের সাইট সেটিংস থেকে Notifications → Allow করো', 'Allow notifications in site settings')) : A.isApp ? L('অ্যাপ বন্ধ থাকলেও ঠিক সময়ে অ্যালার্ম বাজবে ✓', 'Alarms ring on time even when the app is closed ✓') : L('অ্যাপ বন্ধ থাকলেও রিমাইন্ডার পেতে অ্যাপটি ইনস্টল করো', 'Install the app for reminders when closed')}</div></div>
        ${perm !== 'granted' && perm !== 'unsupported' ? `<button class="btn xs peach" data-a="enableNotif">${L('চালু করো', 'Enable')}</button>` : ''}
      </div>
      <div class="section-title"><h3>${L('পড়ার অ্যালার্ম', 'Study alarms')}</h3><button class="tag lav tap" data-a="addReminder">${ic('plus', 'xs')} ${L('নতুন', 'Add')}</button></div>
      <div class="menu">
        ${s.reminders.map((r, i) => `<div class="menu-item"><span class="mi" style="background:var(--lav-100)">⏰</span><span class="grow"><input type="time" class="input" style="height:40px;width:130px;padding:0 10px" value="${r.time}" data-a="remTime" data-i="${i}" aria-label="time"><span class="tiny muted ellipsis" style="display:block;margin-top:4px">${esc(D.MSG.slots[r.time] || L('কাস্টম রিমাইন্ডার', 'Custom reminder'))}</span></span>${tg('remToggle', r.on, `data-i="${i}"`)}${s.reminders.length > 1 ? `<button class="icon-btn ghost" style="width:36px;height:36px;margin-left:6px" data-a="remDel" data-i="${i}" aria-label="delete">${ic('trash', 'xs')}</button>` : ''}</div>`).join('')}
      </div>
      <div class="section-title"><h3>${L('মিস করলে রোস্ট 😜', 'Roast if you skip 😜')}</h3>${tg('missToggle', s.missCheck)}</div>
      <div class="card tight row"><span class="small grow">${L('এই সময়ের মধ্যে একটাও টাস্ক না করলে পেঁচু স্যার রোস্ট পাঠাবে', 'If no task is done by this time, Pechu sends a roast')}</span><input type="time" class="input" style="height:40px;width:120px;padding:0 10px" value="${s.missTime}" data-a="missTime" aria-label="time"></div>
      <div class="opt-cards mt">
        ${roasts.map(([k, e, t, m]) => `<button class="opt ${s.roast === k ? 'on' : ''}" data-a="roast" data-k="${k}"><span class="oe" style="background:var(--lav-50)">${e}</span><span class="grow"><span class="bold" style="display:block">${t}</span><span class="tiny muted" style="display:block">“${esc(m)}”</span></span><span class="radio"></span></button>`).join('')}
      </div>
      <div class="row mt"><button class="btn ghost grow sm" data-a="testAlarm">🔔 ${L('টেস্ট অ্যালার্ম', 'Test alarm')}</button><button class="btn outline grow sm" data-a="testRoast">😜 ${L('একটা রোস্ট দাও', 'Roast me')}</button></div>
      ${A.isApp ? appAlarmCard() : `      <div class="section-title"><h3>${L('অ্যাপ বন্ধ থাকলেও অ্যালার্ম', 'Alarms when app is closed')}</h3></div>
      <div class="card tight">
        <p class="small" style="color:var(--ink-2)">${L('ওয়েব অ্যাপ বন্ধ থাকলে ফোন কিছু সময় ব্রাউজারকে ঘুম পাড়িয়ে রাখে। ১০০% নিশ্চিত অ্যালার্মের জন্য এক ট্যাপে তোমার ফোনের ক্যালেন্ডারে ৯০ দিনের অ্যালার্ম যোগ করে নাও।', 'Phones may sleep closed web apps. For guaranteed alarms, add all 90 days of alarms to your phone calendar in one tap.')}</p>
        <button class="btn primary block mt-s" data-a="ics">📅 ${L('ফোনের ক্যালেন্ডারে অ্যালার্ম যোগ করো', 'Add alarms to phone calendar')}</button>
      </div>
`}
      <div class="section-title"><h3>${L('অন্যান্য', 'Other')}</h3></div>
      <div class="menu">
        <div class="menu-item"><span class="mi" style="background:var(--mint-100)">🔊</span><span class="grow bold small">${L('সাউন্ড ইফেক্ট', 'Sound effects')}</span>${tg('soundToggle', s.sound)}</div>
        <div class="menu-item"><span class="mi" style="background:var(--peach-100)">📳</span><span class="grow bold small">${L('ভাইব্রেশন', 'Haptics')}</span>${tg('hapticToggle', s.haptics)}</div>
      </div>
      <div style="height:20px"></div>`;
  };

  /* ------------------------------ ERRORS ------------------------------ */
  SCREENS.errors = function () {
    const st = S(), C = A.ERR_CATS;
    const due = A.errDue();
    let list = st.errors.filter(e => (U.errCat === 'all' || e.cat === U.errCat) && (U.errShowMastered || !e.mastered));
    const masteredN = st.errors.filter(e => e.mastered).length;
    return `${topbar(L('ভুলের খাতা', 'Mistake Notebook'), L('প্রতিটা ভুল = শেখার একটা সুযোগ ✨', 'Every mistake = a chance to learn ✨'))}
      <div class="card row gap-l" style="background:linear-gradient(130deg,#F3EFFF,#E7F8F0);box-shadow:none">
        <div class="grow"><div class="split-stats" style="margin-top:0"><div><b>${N(st.errors.length)}</b><span>${L('মোট', 'Total')}</span></div><div><b style="color:var(--peach-600)">${N(due.length)}</b><span>${L('রিভিউ বাকি', 'Due')}</span></div><div><b style="color:var(--mint-600)">${N(masteredN)}</b><span>${L('আয়ত্ত', 'Mastered')}</span></div></div>
        ${due.length ? `<button class="btn primary block mt" data-a="startReview">🔁 ${L(`আজ ${N(due.length)}টি রিভিউ করো`, `Review ${due.length} now`)}</button>` : st.errors.length ? `<div class="banner ok mt">✅ ${L('আজকের রিভিউ শেষ! দারুণ।', 'All reviews done for today!')}</div>` : ''}</div>
      </div>
      <div class="chips mt">
        <button class="chip ${U.errCat === 'all' ? 'on' : ''}" data-a="errCat" data-c="all">${L('সব', 'All')}</button>
        ${Object.keys(C).map(k => `<button class="chip ${U.errCat === k ? 'on' : ''}" data-a="errCat" data-c="${k}">${C[k].e} ${L(C[k].bn, C[k].en)}</button>`).join('')}
      </div>
      <div class="row between mt-s"><span class="tiny muted">${N(list.length)} ${L('টি এন্ট্রি', 'entries')}</span><button class="tag gray tap" data-a="toggleMastered">${U.errShowMastered ? L('আয়ত্তগুলো লুকাও', 'Hide mastered') : L('আয়ত্তগুলোও দেখাও', 'Show mastered')}</button></div>
      <div class="mt-s">
        ${list.length ? list.map(e => {
          const c = C[e.cat] || C.note;
          return `<div class="err-card ${e.mastered ? 'mastered' : ''}" style="border-left-color:${c.c}">
            <div class="row between"><div class="row gap-s" style="flex-wrap:wrap"><span class="tag" style="background:${c.bg};color:${c.c}">${c.e} ${L(c.bn, c.en)}</span>${e.sub ? `<span class="tag gray">${esc(A.subName(e.sub, true))}${e.ch ? ' · ' + esc(A.chLabel(e.sub, e.ch, false)) : ''}</span>` : ''}</div>
            <button class="icon-btn ghost" style="width:32px;height:32px;border:0" data-a="errMenu" data-id="${e.id}" aria-label="more">⋯</button></div>
            <div class="q">${esc(e.q)}</div>
            ${e.a ? `<details style="margin-top:6px"><summary class="tiny bold" style="color:var(--lav-600);cursor:pointer">${L('সঠিক উত্তর / নোট দেখো', 'Show answer / note')}</summary><div class="ans">${esc(e.a)}</div></details>` : ''}
            <div class="row between mt-s"><span class="tiny muted">${e.mastered ? L('✓ আয়ত্ত হয়েছে', '✓ Mastered') : e.due <= A.todayKey() ? L('🔁 আজ রিভিউ', '🔁 Review today') : L('পরের রিভিউ: ', 'Next: ') + A.fmtDate(A.parseKey(e.due))} · ${N(e.reviews)}× ${L('রিভিউ', 'reviewed')}</span>
            <div class="row gap-s">${e.mastered ? `<button class="btn xs outline" data-a="errUnmaster" data-id="${e.id}">${L('আবার খোলো', 'Reopen')}</button>` : `<button class="btn xs ghost" data-a="errReview" data-id="${e.id}">↺ ${L('আবার রিভিউ', 'Review again')}</button><button class="btn xs mint" data-a="errMaster" data-id="${e.id}">✓</button>`}</div></div>
          </div>`;
        }).join('') : `<div class="empty"><img src="assets/books.webp" alt=""><h3>${st.errors.length ? L('এই ক্যাটাগরিতে কিছু নেই', 'Nothing in this category') : L('খাতা এখনো খালি', 'Notebook is empty')}</h3><p>${L('প্র্যাকটিসের সময় যে প্রশ্ন ভুল হবে, এখানে লিখে রাখো। পরীক্ষার আগে শুধু এগুলো রিভিশন দিলেই অনেক নম্বর বাঁচবে।', 'Write down every question you get wrong. Revising only these before the exam saves lots of marks.')}</p></div>`}
      </div>
      <button class="fab" data-a="addError">${ic('plus')} ${L('ভুল যোগ করো', 'Add mistake')}</button>
      <div style="height:70px"></div>`;
  };

  function errorForm(pre = {}) {
    const st = S(), G = D.GROUPS[st.profile.group], C = A.ERR_CATS;
    const e = pre.id ? st.errors.find(x => x.id === pre.id) : null;
    const v = e || { cat: pre.cat || 'mcq', sub: pre.sub || '', ch: pre.ch || '', q: '', a: '' };
    const chOpts = (sub) => sub ? D.SUBJECTS[sub].chapters.map(c => `<option value="${c.n}" ${+v.ch === c.n ? 'selected' : ''}>${esc(A.chLabel(sub, c.n))}</option>`).join('') : '';
    return {
      head: `<div class="grow"><div class="h2">${e ? L('ভুল এডিট করো', 'Edit mistake') : L('নতুন ভুল যোগ করো', 'Log a mistake')}</div><div class="tiny muted">${L('ভুল লেখা মানেই অর্ধেক শেখা হয়ে গেল 💜', 'Writing it down is half the learning 💜')}</div></div>`,
      body: `
        <div class="field"><label>${L('ক্যাটাগরি', 'Category')}</label><div class="chips" style="margin:0;padding-left:0;padding-right:0;flex-wrap:wrap">${Object.keys(C).map(k => `<button class="chip ${v.cat === k ? 'on' : ''}" data-a="efCat" data-c="${k}">${C[k].e} ${L(C[k].bn, C[k].en)}</button>`).join('')}</div><input type="hidden" id="ef-cat" value="${v.cat}"></div>
        <div class="field"><label for="ef-sub">${L('বিষয়', 'Subject')}</label><select id="ef-sub" class="select" data-a="efSub"><option value="">${L('— বেছে নাও —', '— choose —')}</option>${G.subjects.map(s => `<option value="${s}" ${v.sub === s ? 'selected' : ''}>${esc(A.subName(s))}</option>`).join('')}</select></div>
        <div class="field"><label for="ef-ch">${L('অধ্যায় (ঐচ্ছিক)', 'Chapter (optional)')}</label><select id="ef-ch" class="select"><option value="">${L('— যেকোনো —', '— any —')}</option>${chOpts(v.sub)}</select></div>
        <div class="field"><label for="ef-q">${L('প্রশ্ন / কী ভুল হয়েছিল?', 'Question / what went wrong?')}</label><textarea id="ef-q" class="input" maxlength="1200" placeholder="${L('যেমন: ত্বরণের একক লিখতে ভুল করেছি...', 'e.g. Wrote the wrong unit of acceleration...')}">${esc(v.q)}</textarea><span class="err hidden" id="ef-qerr">${L('প্রশ্ন বা ভুলটা লিখো', 'Please write the question')}</span></div>
        <div class="field"><label for="ef-a">${L('সঠিক উত্তর / নোট', 'Correct answer / note')}</label><textarea id="ef-a" class="input" maxlength="1500" placeholder="${L('সঠিক উত্তর, সূত্র বা মনে রাখার কৌশল', 'Correct answer, formula or memory trick')}">${esc(v.a)}</textarea></div>
        <button class="btn primary block mt" data-a="saveError" data-id="${e ? e.id : ''}">${e ? L('সংরক্ষণ করো', 'Save') : L('খাতায় যোগ করো (+৩ XP)', 'Add to notebook (+3 XP)')}</button>
        <div style="height:8px"></div>`
    };
  }

  function reviewSheet() {
    const R = U.rev; const st = S();
    const ids = R.ids.filter(id => st.errors.find(e => e.id === id));
    if (R.i >= ids.length) {
      return { head: `<div class="grow h2">${L('রিভিউ শেষ! 🎉', 'Review done! 🎉')}</div>`, body: `<div class="empty"><img src="assets/trophy.webp" alt=""><h3>${L(`${N(R.ok)}টি মনে ছিল, ${N(R.again)}টি আবার দেখবে`, `${R.ok} remembered, ${R.again} to revisit`)}</h3><p>${L('ভুলগুলো ঠিক করতে করতেই তুমি A+ এর দিকে এগোচ্ছ।', 'Fixing mistakes is how you move toward A+.')}</p><button class="btn primary mt" data-a="closeSheet">${L('শেষ', 'Done')}</button></div>` };
    }
    const e = st.errors.find(x => x.id === ids[R.i]); const c = A.ERR_CATS[e.cat] || A.ERR_CATS.note;
    return {
      head: `<div class="grow"><div class="eyebrow">${L('রিভিউ মোড', 'Review mode')}</div><div class="h3">${N(R.i + 1)} / ${N(ids.length)}</div></div>`,
      body: `<div class="bar thin mb"><i style="width:${(R.i / ids.length) * 100}%"></i></div>
        <div class="flash" key="${e.id}">
          <div class="row gap-s"><span class="tag" style="background:${c.bg};color:${c.c}">${c.e} ${L(c.bn, c.en)}</span>${e.sub ? `<span class="tag gray">${esc(A.subName(e.sub, true))}</span>` : ''}</div>
          <div class="h3 mt" style="white-space:pre-wrap">${esc(e.q)}</div>
          ${R.show ? `<div class="ans mt">${esc(e.a || L('(কোনো নোট নেই)', '(no note)'))}</div>` : `<div class="grow"></div><button class="btn ghost block mt" data-a="revShow">👀 ${L('উত্তর দেখো', 'Show answer')}</button>`}
        </div>
        ${R.show ? `<div class="row mt"><button class="btn outline grow" data-a="revAns" data-ok="0">↺ ${L('আবার দেখবো', 'Again')}</button><button class="btn mint grow" data-a="revAns" data-ok="1">✓ ${L('মনে ছিল', 'Got it')}</button></div>` : ''}
        <div style="height:8px"></div>`
    };
  }

  /* ------------------------------ TESTS ------------------------------ */
  SCREENS.tests = function () {
    const st = S(), p = A.plan(); const cw = A.weekOfDay(A.currentDay());
    const all = Object.values(p.tests);
    const taken = all.filter(t => st.tests[t.id]).map(t => Object.assign({}, t, st.tests[t.id], { pct: A.testPct(st.tests[t.id]) })).sort((a, b) => (a.d || '').localeCompare(b.d || '') || a.w - b.w);
    const avg = taken.length ? Math.round(taken.reduce((a, t) => a + t.pct, 0) / taken.length) : 0;
    const last3 = taken.slice(-3), prev3 = taken.slice(-6, -3);
    const delta = last3.length && prev3.length ? Math.round(last3.reduce((a, t) => a + t.pct, 0) / last3.length - prev3.reduce((a, t) => a + t.pct, 0) / prev3.length) : null;
    // weekly averages chart
    const weeks = []; for (let w = 1; w <= 12; w++) { const tw = taken.filter(t => t.w === w); weeks.push(tw.length ? Math.round(tw.reduce((a, t) => a + t.pct, 0) / tw.length) : null); }
    const best = Math.max(...weeks.filter(x => x != null), 0);
    // per subject
    const bySub = {}; taken.forEach(t => { (bySub[t.sub] = bySub[t.sub] || []).push(t.pct); });
    const subAvg = Object.keys(bySub).map(s => ({ s, a: Math.round(bySub[s].reduce((x, y) => x + y, 0) / bySub[s].length) })).sort((a, b) => a.a - b.a);
    const weak = subAvg.filter(x => x.a < 70).slice(0, 2);
    const errCount = {}; st.errors.filter(e => !e.mastered && e.sub).forEach(e => { errCount[e.sub] = (errCount[e.sub] || 0) + 1; });
    const topErr = Object.keys(errCount).sort((a, b) => errCount[b] - errCount[a])[0];
    const fb = !taken.length ? L('প্রথম পরীক্ষাটা দাও—শুরুটা সবসময় সবচেয়ে কঠিন, তারপর সহজ 💜', 'Take your first test — starting is the hardest part 💜')
      : avg >= 80 ? L('অসাধারণ! তুমি গোল্ডেন A+ ট্র্যাকে আছো 🌟', 'Outstanding! You are on the Golden A+ track 🌟')
      : avg >= 60 ? L('ভালো যাচ্ছে! দুর্বল অধ্যায়গুলো একটু ঝালাই করলেই ৮০% ছুঁয়ে ফেলবে 💪', 'Going well! Polish weak chapters to cross 80% 💪')
      : L('চিন্তা নেই—প্রতিটা পরীক্ষা শেখার সুযোগ। ভুলগুলো Error Log-এ তোলো, পরের বার আরও ভালো হবে 🌱', 'No worries — every test is a lesson. Log mistakes and the next one will be better 🌱');
    const curTests = p.weeks[cw - 1].tests.map(id => p.tests[id]);
    const testRow = (t) => { const r = st.tests[t.id]; const pc = A.testPct(r); return `<div class="test-row"><div style="width:38px;height:38px;border-radius:12px;display:grid;place-items:center;background:${subBg(t.sub)};color:${subC(t.sub)};flex:none">${subIc(t.sub, 'sm')}</div><div class="grow" style="min-width:0"><div class="bold small ellipsis">${esc(A.testTitle(t))}</div><div class="tiny muted">${L('সপ্তাহ ', 'Week ')}${N(t.w)}${r ? ' · ' + N(r.got) + '/' + N(r.total) : ' · ' + L('পূর্ণমান ', 'Full marks ') + N(t.total)}</div></div>${r ? `<button class="score-pill tap" data-a="testEntry" data-id="${t.id}" style="background:${pc >= 80 ? 'var(--mint-100)' : pc >= 60 ? 'var(--blue-100)' : 'var(--peach-100)'};color:${pc >= 80 ? 'var(--mint-600)' : pc >= 60 ? '#2468D8' : 'var(--peach-600)'}">${N(pc)}%</button>` : `<button class="btn xs ghost" data-a="testEntry" data-id="${t.id}">${L('নম্বর লিখো', 'Add score')}</button>`}</div>`; };
    const hist = taken.slice().reverse();
    return `${topbar(L('পরীক্ষা ও পারফরম্যান্স', 'Tests & Performance'), N(taken.length) + '/' + N(all.length) + L(' টি পরীক্ষা সম্পন্ন', ' tests done'))}
      <div class="card row gap-l">
        ${ring(avg / 100, 84, 9, avg >= 80 ? '#1FB383' : avg >= 60 ? '#3D8BFF' : '#FF8A5C', `<div><div style="font-size:19px">${N(avg)}%</div><div class="tiny muted">${L('গড়', 'avg')}</div></div>`)}
        <div class="grow"><div class="bold">${L('গড় নম্বর', 'Average score')}</div>${delta != null ? `<div class="tag ${delta >= 0 ? 'mint' : 'peach'} mt-s">${delta >= 0 ? '▲' : '▼'} ${N(Math.abs(delta))}% ${L('শেষ ৩টি পরীক্ষায়', 'last 3 tests')}</div>` : ''}<p class="small muted mt-s">${fb}</p></div>
      </div>
      <div class="section-title"><h3>${L('সাপ্তাহিক উন্নতি', 'Weekly trend')}</h3></div>
      <div class="card"><div class="chart">${weeks.map((v, i) => `<div class="cb ${v != null && v === best ? 'best' : ''}">${v != null ? `<span class="bp">${N(v)}</span>` : ''}<div class="bv" style="height:${v != null ? Math.max(6, v) : 4}%;${v == null ? 'background:var(--line-2)' : ''}"></div><span class="bl">${L('স', 'W')}${N(i + 1)}</span></div>`).join('')}</div></div>
      ${weak.length || topErr ? `<div class="section-title"><h3>${L('যেখানে একটু মনোযোগ দরকার', 'Needs a little attention')}</h3></div>
      <div class="card tight">${weak.map(x => `<div class="test-row"><div style="width:38px;height:38px;border-radius:12px;display:grid;place-items:center;background:${subBg(x.s)};color:${subC(x.s)};flex:none">${subIc(x.s, 'sm')}</div><div class="grow"><div class="bold small">${esc(A.subName(x.s))}</div><div class="tiny muted">${L('গড় ', 'Avg ')}${N(x.a)}% · ${L('★★★ অধ্যায়ের বোর্ড প্রশ্ন আবার করো', 'Redo board Qs of ★★★ chapters')}</div></div><button class="btn xs ghost" data-a="go" data-to="subject" data-arg="${x.s}">${L('দেখো', 'Open')}</button></div>`).join('')}
      ${topErr ? `<div class="test-row"><div style="font-size:26px;width:38px;text-align:center">📒</div><div class="grow"><div class="bold small">${L('সবচেয়ে বেশি ভুল: ', 'Most mistakes: ')}${esc(A.subName(topErr))}</div><div class="tiny muted">${N(errCount[topErr])} ${L('টি ভুল রিভিউর অপেক্ষায়', 'mistakes waiting for review')}</div></div><button class="btn xs ghost" data-a="go" data-to="errors">${L('রিভিউ', 'Review')}</button></div>` : ''}</div>` : ''}
      <div class="section-title"><h3>${L('এই সপ্তাহের পরীক্ষা', "This week's tests")}</h3><span class="tag lav">${L('সপ্তাহ ', 'Week ')}${N(cw)}</span></div>
      <div class="card tight">${curTests.length ? curTests.map(testRow).join('') : `<p class="small muted">${L('এই সপ্তাহে কোনো পরীক্ষা নেই', 'No tests this week')}</p>`}</div>
      <div class="section-title"><h3>${L('আগের পরীক্ষাগুলো', 'Test history')}</h3></div>
      <div class="card tight">${hist.length ? hist.map(testRow).join('') : `<div class="empty" style="padding:10px"><p>${L('এখনো কোনো নম্বর লেখা হয়নি। পরীক্ষা দিয়ে নম্বর লিখলে এখানে উন্নতির গ্রাফ দেখা যাবে।', 'No scores yet. Log your scores to see your progress here.')}</p></div>`}</div>
      <p class="center tiny muted mt">${L('এখানে কোনো র‍্যাংকিং নেই—শুধু তুমি আর তোমার উন্নতি 💜', 'No rankings here — just you and your progress 💜')}</p>`;
  };
  function testSheet(id) {
    const p = A.plan(), t = p.tests[id], r = S().tests[id];
    return {
      head: `<div class="grow"><div class="eyebrow">${L('সপ্তাহ ', 'Week ')}${N(t.w)}</div><div class="h3">${esc(A.testTitle(t))}</div></div>`,
      body: `<div class="row gap-l"><div class="field grow"><label for="ts-got">${L('প্রাপ্ত নম্বর', 'Marks obtained')}</label><input id="ts-got" class="input" type="number" inputmode="decimal" min="0" value="${r ? r.got : ''}" placeholder="0"></div><div class="field grow" style="margin-top:0"><label for="ts-total">${L('পূর্ণমান', 'Full marks')}</label><input id="ts-total" class="input" type="number" inputmode="decimal" min="1" value="${r ? r.total : t.total}"></div></div>
        <span class="err hidden" id="ts-err" style="color:#D23C3C;font-size:13px;font-weight:600">${L('সঠিক নম্বর দাও (প্রাপ্ত ≤ পূর্ণমান)', 'Enter valid marks (obtained ≤ full)')}</span>
        <div class="field"><label for="ts-note">${L('নোট (ঐচ্ছিক)', 'Note (optional)')}</label><input id="ts-note" class="input" maxlength="140" value="${esc(r ? r.note : '')}" placeholder="${L('যেমন: সময় কম পড়েছিল', 'e.g. ran out of time')}"></div>
        <button class="btn primary block mt" data-a="saveTest" data-id="${id}">${r ? L('আপডেট করো', 'Update') : L('সংরক্ষণ করো (+২০ XP)', 'Save (+20 XP)')}</button>
        <div style="height:8px"></div>`
    };
  }

  function reflectSheet(w) {
    const r = S().reflections[w] || {};
    const moods = ['😫', '😕', '😐', '🙂', '🤩'];
    return {
      head: `<div class="grow"><div class="eyebrow">${L('সপ্তাহ ', 'Week ')}${N(w)}</div><div class="h2">${L('রিভিউ ও রিফ্লেকশন', 'Review & Reflection')}</div></div>`,
      body: `<div class="field"><label>${L('এই সপ্তাহ কেমন গেল?', 'How did this week feel?')}</label><div class="row" style="justify-content:space-between">${moods.map((m, i) => `<button class="chip ${r.mood === i + 1 ? 'on' : ''}" style="font-size:24px;height:52px;width:52px;justify-content:center;padding:0" data-a="mood" data-m="${i + 1}">${m}</button>`).join('')}</div><input type="hidden" id="rf-mood" value="${r.mood || ''}"></div>
        <div class="field"><label for="rf-good">${L('কী ভালো হলো? 🌟', 'What went well? 🌟')}</label><textarea id="rf-good" class="input" maxlength="500">${esc(r.good || '')}</textarea></div>
        <div class="field"><label for="rf-imp">${L('কোথায় উন্নতি দরকার? 🔧', 'What to improve? 🔧')}</label><textarea id="rf-imp" class="input" maxlength="500">${esc(r.improve || '')}</textarea></div>
        <div class="field"><label for="rf-goal">${L('আগামী সপ্তাহের ১টি লক্ষ্য 🎯', 'One goal for next week 🎯')}</label><input id="rf-goal" class="input" maxlength="140" value="${esc(r.goal || '')}"></div>
        <button class="btn primary block mt" data-a="saveReflect" data-w="${w}">${L('সংরক্ষণ করো', 'Save')}</button><div style="height:8px"></div>`
    };
  }

  /* ------------------------------ LEADERBOARD ------------------------------ */
  const LB = {};
  function lbKey() { return [U.lbScope, U.lbPeriod, U.lbGroup, S().squad ? S().squad.code : ''].join('|'); }
  async function loadLB(force) {
    const k = lbKey(); const c = LB[k];
    if (!force && c && (c.loading || Date.now() - c.at < 60000)) return;
    LB[k] = { loading: true, at: Date.now(), data: c && c.data };
    if (!A.hasApi()) { LB[k] = { at: Date.now(), data: demoLB(), demo: true }; if (route.name === 'leaderboard') render({ keep: true }); return; }
    try {
      if (S().profile && !S().sync.registered) await A.syncNow();
      else await A.syncNow();
      const p = S().profile;
      const j = await A.api('leaderboard', { scope: U.lbScope, period: U.lbPeriod, group: U.lbGroup, school: p.school, code: S().squad ? S().squad.code : '', uid: p.uid }, 'GET');
      LB[k] = { at: Date.now(), data: j };
    } catch (e) { LB[k] = { at: Date.now() - 50000, data: c && c.data, err: String(e.message || e) }; }
    if (route.name === 'leaderboard') render({ keep: true });
  }
  function demoLB() {
    const p = S().profile; const myXp = U.lbPeriod === 'week' ? A.weekXp() : S().xp;
    const names = ['তাসনিম রহমান', 'আরিফ হোসেন', 'নুসরাত জাহান', 'সাকিব আল হাসান', 'মাহি চৌধুরী', 'রাফিদ ইসলাম', 'ফারিহা আক্তার', 'তানভীর আহমেদ', 'সামিয়া খান', 'ইমরান কবির', 'জান্নাতুল ফেরদৌস', 'রিয়াদ মাহমুদ'];
    const schools = ['চট্টগ্রাম কলেজিয়েট স্কুল', 'ড. খাস্তগীর সরকারি বালিকা উচ্চ বিদ্যালয়', 'বাংলাদেশ মহিলা সমিতি বালিকা উচ্চ বিদ্যালয়', 'সেন্ট প্ল্যাসিডস স্কুল', 'চট্টগ্রাম সরকারি উচ্চ বিদ্যালয়'];
    const mult = U.lbPeriod === 'week' ? 1 : 9;
    let list = names.map((n, i) => ({ name: n, school: U.lbScope === 'school' ? p.school : schools[i % schools.length], xp: Math.round((1400 - i * 95) * mult * (0.9 + (i % 3) * 0.05)), level: 0, streak: 12 - i }));
    list.push({ name: p.name, school: p.school, xp: myXp, streak: A.streakNow(), me: true });
    list.sort((a, b) => b.xp - a.xp); list.forEach((x, i) => { x.r = i + 1; x.level = A.levelOf(x.xp); });
    const me = list.find(x => x.me);
    const sch = schools.concat([p.school]).filter((v, i, a) => a.indexOf(v) === i).map((s, i) => ({ school: s, n: 40 - i * 6, xp: (52000 - i * 6100) * (U.lbPeriod === 'week' ? 0.12 : 1) })).map(x => Object.assign(x, { avg: Math.round(x.xp / x.n) }));
    sch.sort((a, b) => b.xp - a.xp); sch.forEach((x, i) => { x.r = i + 1; x.me = x.school === p.school; });
    return { list: U.lbScope === 'schools' ? [] : list, me, schools: sch, total: list.length, squad: S().squad ? { name: S().squad.name, code: S().squad.code } : null };
  }
  SCREENS.leaderboard = function () {
    const st = S(), p = st.profile;
    const scopes = [['school', '🏫 ' + L('আমার স্কুল', 'My school')], ['schools', '🏆 ' + L('স্কুল র‍্যাংকিং', 'Schools')], ['all', '🇧🇩 ' + L('সারাদেশ', 'National')], ['squad', '👥 ' + L('আমার গ্রুপ', 'My group')]];
    const c = LB[lbKey()];
    let body = '';
    if (U.lbScope === 'squad' && !st.squad) {
      body = `<div class="card mt"><div class="center"><div style="font-size:44px">👥</div><div class="h3">${L('বন্ধুদের নিয়ে স্টাডি গ্রুপ', 'Study group with friends')}</div><p class="small muted mt-s">${L('গ্রুপ তৈরি করে কোডটা বন্ধুদের দাও। একসাথে পড়ো, একসাথে এগোও!', 'Create a group and share the code with friends. Study together, grow together!')}</p></div>
        <div class="field mt"><label for="sq-name">${L('নতুন গ্রুপের নাম', 'New group name')}</label><input id="sq-name" class="input" maxlength="40" placeholder="${L('যেমন: টেন-বি ফিজিক্স গ্যাং', 'e.g. Ten-B Physics Gang')}"></div>
        <button class="btn primary block mt-s" data-a="squadCreate">${L('গ্রুপ তৈরি করো', 'Create group')}</button>
        <div class="row mt-l" style="gap:8px"><div style="flex:1;height:1px;background:var(--line)"></div><span class="tiny muted">${L('অথবা', 'or')}</span><div style="flex:1;height:1px;background:var(--line)"></div></div>
        <div class="field mt"><label for="sq-code">${L('গ্রুপ কোড দিয়ে যোগ দাও', 'Join with a group code')}</label><input id="sq-code" class="input" maxlength="8" placeholder="ABC123" style="text-transform:uppercase;letter-spacing:2px"></div>
        <button class="btn outline block mt-s" data-a="squadJoin">${L('যোগ দাও', 'Join')}</button></div>`;
    } else if (!c || (c.loading && !c.data)) {
      body = `<div class="mt">${'<div class="skel"></div>'.repeat(6)}</div>`;
    } else if (c.err && !c.data) {
      body = `<div class="empty"><div style="font-size:44px">📡</div><h3>${L('সার্ভারে যোগাযোগ হচ্ছে না', 'Could not reach the server')}</h3><p>${L('ইন্টারনেট চেক করে আবার চেষ্টা করো। তোমার পয়েন্ট নিরাপদে ফোনে জমা আছে।', 'Check your internet and retry. Your points are safe on your phone.')}</p><button class="btn primary mt" data-a="lbReload">${L('আবার চেষ্টা', 'Retry')}</button></div>`;
    } else {
      const d = c.data;
      if (U.lbScope === 'schools') {
        const sc = d.schools || [];
        body = sc.length ? sc.map(s => `<div class="lb-row ${s.me ? 'me' : ''}"><span class="rk">${s.r <= 3 ? ['🥇', '🥈', '🥉'][s.r - 1] : N(s.r)}</span><div style="width:40px;height:40px;border-radius:13px;display:grid;place-items:center;background:var(--lav-100);font-size:20px;flex:none">🏫</div><div class="grow" style="min-width:0"><div class="bold small ellipsis">${esc(s.school)}</div><div class="tiny muted">${N(s.n)} ${L('জন শিক্ষার্থী · গড় ', 'students · avg ')}${N(s.avg)} XP</div></div><div class="bold small">${N(s.xp)}<div class="tiny muted" style="font-weight:600;text-align:right">XP</div></div></div>`).join('') : `<div class="empty"><p>${L('এখনো কোনো স্কুলের ডেটা নেই', 'No school data yet')}</p></div>`;
      } else {
        const list = d.list || [];
        const top = list.slice(0, 3);
        const podium = top.length === 3 ? `<div class="podium mt">${[top[1], top[0], top[2]].map((x, i) => { const h = [92, 120, 76][i]; const col = ['#B9A7FF', '#7B61FF', '#FFBFA0'][i]; return `<div class="pod">${avatar(x.name, i === 1 ? '' : 'sm')}<div class="pn ellipsis">${esc(x.name)}</div><div class="px">${N(x.xp)} XP</div><div class="stand" style="height:${h}px;background:${col}">${N(x.r)}</div></div>`; }).join('')}</div>` : '';
        body = (U.lbScope === 'squad' && d.squad ? `<div class="card tight mt row"><div style="font-size:30px">👥</div><div class="grow"><div class="bold">${esc(d.squad.name || st.squad.name)}</div><div class="tiny muted">${L('কোড: ', 'Code: ')}<b style="letter-spacing:1px">${esc(st.squad.code)}</b> · ${N(list.length)} ${L('জন সদস্য', 'members')}</div></div><button class="icon-btn" data-a="squadShare" aria-label="share">${ic('share', 'sm')}</button><button class="icon-btn" data-a="squadLeave" aria-label="leave">${ic('x', 'sm')}</button></div>` : '')
          + podium + `<div class="mt">${list.slice(top.length === 3 ? 3 : 0, 50).map(x => `<div class="lb-row ${x.me ? 'me' : ''}"><span class="rk">${N(x.r)}</span>${avatar(x.name, 'sm')}<div class="grow" style="min-width:0"><div class="bold small ellipsis">${esc(x.name)}${x.me ? ' (' + L('তুমি', 'you') + ')' : ''}</div><div class="tiny muted ellipsis">${U.lbScope === 'school' ? L('লেভেল ', 'Level ') + N(x.level || 1) + ' · 🔥 ' + N(x.streak || 0) : esc(x.school || '')}</div></div><div class="bold small">${N(x.xp)} <span class="tiny muted">XP</span></div></div>`).join('')}</div>`
          + (!list.length ? `<div class="empty"><p>${L('এখনো কেউ নেই—তুমিই প্রথম হও! 🚀', 'No one here yet — be the first! 🚀')}</p></div>` : '');
        if (d.me && !list.slice(0, 50).some(x => x.me)) body += `<div class="me-card"><div class="lb-row me"><span class="rk">${N(d.me.r)}</span>${avatar(p.name, 'sm')}<div class="grow"><div class="bold small">${L('তোমার অবস্থান', 'Your position')}</div><div class="tiny muted">${N(d.me.xp)} XP</div></div></div></div>`;
      }
      if (c.demo) body = `<div class="banner info mt">ℹ️ <span>${L('ডেমো ডেটা দেখানো হচ্ছে। অ্যাডমিন config.js-এ Google Sheet সার্ভারের URL সেট করলে আসল লিডারবোর্ড চালু হবে।', 'Showing demo data. Set the Google Sheet server URL in config.js to enable the real leaderboard.')}</span></div>` + body;
      if (c.err) body = `<div class="banner warn mt">📡 <span>${L('অফলাইন — শেষ সেভ করা তালিকা দেখাচ্ছে', 'Offline — showing last saved list')}</span></div>` + body;
    }
    return `${topbar(L('প্রতিযোগিতা জোন', 'Competition Zone'), L('বন্ধুত্বপূর্ণ প্রতিযোগিতা, একসাথে উন্নতি', 'Friendly competition, growing together'), `<button class="icon-btn" data-a="lbReload" aria-label="refresh">${ic('refresh', 'sm')}</button>`)}
      <div class="chips">${scopes.map(([k, t]) => `<button class="chip ${U.lbScope === k ? 'on' : ''}" data-a="lbScope" data-k="${k}">${t}</button>`).join('')}</div>
      <div class="row between mt-s"><div class="seg"><button class="${U.lbPeriod === 'week' ? 'on' : ''}" data-a="lbPeriod" data-k="week">${L('এই সপ্তাহ', 'This week')}</button><button class="${U.lbPeriod === 'all' ? 'on' : ''}" data-a="lbPeriod" data-k="all">${L('সর্বমোট', 'All time')}</button></div>
      ${U.lbScope === 'all' ? `<select class="select" style="height:44px;width:auto;font-size:14px" data-a="lbGroup"><option value="all">${L('সব বিভাগ', 'All groups')}</option>${Object.keys(D.GROUPS).map(g => `<option value="${g}" ${U.lbGroup === g ? 'selected' : ''}>${L(D.GROUPS[g].bn, D.GROUPS[g].en)}</option>`).join('')}</select>` : ''}</div>
      ${body}
      <p class="center tiny muted mt-l">💜 ${L('মনে রেখো: অন্যের সাথে নয়, গতকালের নিজের সাথে তুলনাই আসল জয়।', 'Remember: the real win is beating yesterday’s you.')}${p.anon ? '' : `<br><button class="tag gray tap mt-s" data-a="toggleAnon">${L('লিডারবোর্ডে আমার নাম লুকাও', 'Hide my name on leaderboards')}</button>`}${p.anon ? `<br><button class="tag lav tap mt-s" data-a="toggleAnon">${L('নাম লুকানো আছে · দেখাও', 'Name hidden · show')}</button>` : ''}</p>`;
  };
  AFTER.leaderboard = () => { loadLB(false); };

  /* =========================================================================
     ONBOARDING
     ========================================================================= */
  const Onb = {
    st: { step: 0, d: { name: '', roll: '', mobile: '', school: '', district: '', group: '', religion: 'islam', startDate: A.todayKey(), anon: false, consent: true }, status: '', errors: {} },
    render() {
      const o = this.st, d = o.d;
      const langBtn = `<button class="chip" data-a="toggleLang" style="position:absolute;right:0;top:0">🌐 ${L('English', 'বাংলা')}</button>`;
      const ind = (n) => `<div class="steps-ind">${[1, 2, 3].map(i => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}</div>`;
      const head = (n, t, s) => `<div class="row" style="margin-bottom:16px"><button class="icon-btn" data-a="onbBack" aria-label="back">${ic('chevL')}</button><div class="grow">${ind(n)}</div></div><div class="h1">${t}</div><p class="muted mt-s">${s}</p>`;
      const err = (k) => o.errors[k] ? `<span class="err">${o.errors[k]}</span>` : '';
      if (o.step === 0) return `<div class="onb" style="position:relative"><div class="blob b1"></div>${langBtn}
        <div class="onb-hero"><img src="assets/mascot.webp" alt="${L('পেঁচু স্যার', 'Pechu')}" width="200" height="230"></div>
        <div class="center mt"><span class="tag lav">SSC 2027 · ${L('৯০ দিনের স্মার্ট রোডম্যাপ', '90-day smart roadmap')}</span><div class="h1 mt">${L('তোমার স্মার্ট স্টাডি সঙ্গী', 'Your Smart Study Companion')}</div><p class="muted mt-s">${L('প্রতিদিন ছোট ছোট ধাপ, গেমের মতো মজা, আর পেঁচু স্যারের মজার রোস্ট—গোল্ডেন A+ এর পথে একসাথে।', 'Small daily steps, game-like fun and funny roasts from Pechu — together toward Golden A+.')}</p></div>
        <div class="row mt-l" style="justify-content:center;gap:18px">${[['🗺️', L('৯০ দিনের রোডম্যাপ', '90-day plan')], ['🎯', L('ফোকাস টাইমার', 'Focus timer')], ['🏆', L('স্কুল লিডারবোর্ড', 'Leaderboards')]].map(([e, t]) => `<div class="center tiny bold" style="width:90px"><div style="width:52px;height:52px;border-radius:18px;background:#fff;box-shadow:var(--sh-1);display:grid;place-items:center;font-size:24px;margin:0 auto 6px">${e}</div>${t}</div>`).join('')}</div>
        <div class="onb-foot"><button class="btn primary block" data-a="onbNext">${L('প্রোফাইল তৈরি করো', 'Create profile')} ${ic('chevR', 'sm')}</button><button class="btn outline block mt-s" data-a="onbRestore">${L('আগের প্রোফাইল ফিরিয়ে আনো', 'Restore previous profile')}</button><p class="center tiny muted mt">“${L('এক ধাপ করে পড়ো। পারফেকশনের চেয়ে অগ্রগতি বেশি গুরুত্বপূর্ণ।', 'Study one step at a time. Progress is more important than perfection.')}”</p></div></div>`;
      if (o.step === 1) return `<div class="onb">${head(1, L('তোমার পরিচয়', 'About you'), L('স্কুল লিডারবোর্ড ও ইউনিক আইডির জন্য এই তথ্যগুলো লাগবে।', 'Needed for your unique ID and school leaderboard.'))}
        <div class="mt-l">
          <div class="field"><label for="f-name">${L('পূর্ণ নাম', 'Full name')}</label><input id="f-name" class="input ${o.errors.name ? 'bad' : ''}" autocomplete="name" maxlength="60" value="${esc(d.name)}" placeholder="${L('যেমন: ইয়াসিন আরাফাত', 'e.g. Yeasin Arafat')}">${err('name')}</div>
          <div class="field"><label for="f-roll">${L('রোল নম্বর', 'Roll number')}</label><input id="f-roll" class="input ${o.errors.roll ? 'bad' : ''}" inputmode="numeric" maxlength="10" value="${esc(d.roll)}" placeholder="${L('যেমন: ১২', 'e.g. 12')}">${err('roll')}</div>
          <div class="field"><label for="f-mobile">${L('মোবাইল নম্বর', 'Mobile number')}</label><input id="f-mobile" class="input ${o.errors.mobile ? 'bad' : ''}" type="tel" inputmode="tel" autocomplete="tel" maxlength="14" value="${esc(d.mobile)}" placeholder="01XXXXXXXXX"><span class="hint">🔒 ${L('মোবাইল নম্বর কখনো লিডারবোর্ডে দেখানো হবে না', 'Your number is never shown publicly')}</span>${err('mobile')}</div>
          <div class="field" style="position:relative"><label for="f-school">${L('স্কুলের নাম', 'School name')}</label><input id="f-school" class="input ${o.errors.school ? 'bad' : ''}" autocomplete="off" maxlength="80" value="${esc(d.school)}" placeholder="${L('পুরো নাম লিখো (তালিকা থেকে বেছে নিতে পারো)', 'Full name (pick from list if shown)')}"><div class="suggest hidden" id="schoolSuggest"></div>${err('school')}</div>
          <div class="field"><label for="f-district">${L('জেলা (ঐচ্ছিক)', 'District (optional)')}</label><select id="f-district" class="select"><option value="">${L('— বেছে নাও —', '— choose —')}</option>${D.DISTRICTS.map(x => `<option ${d.district === x ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
        </div>
        <div class="onb-foot"><button class="btn primary block" data-a="onbNext">${L('পরের ধাপ', 'Next')} ${ic('chevR', 'sm')}</button></div></div>`;
      if (o.step === 2) return `<div class="onb">${head(2, L('তোমার বিভাগ', 'Your group'), L('বিভাগ অনুযায়ী আলাদা স্টাডি প্যানেল ও ৯০ দিনের প্ল্যান অটোমেটিক তৈরি হবে।', 'A dedicated study panel and 90-day plan is generated for your group.'))}
        <div class="opt-cards mt-l">${Object.keys(D.GROUPS).map(g => { const G = D.GROUPS[g]; return `<button class="opt ${d.group === g ? 'on' : ''}" data-a="onbGroup" data-g="${g}"><span class="oe" style="background:${G.bg}">${G.emoji}</span><span class="grow"><span class="bold" style="display:block;font-size:17px">${L(G.bn, G.en)}</span><span class="tiny muted" style="display:block">${L(G.desc, G.descEn)} · ${N(G.subjects.length)} ${L('বিষয়', 'subjects')}</span></span><span class="radio"></span></button>`; }).join('')}</div>
        ${err('group')}
        <div class="field mt-l"><label for="f-rel">${L('ধর্ম শিক্ষা বিষয়', 'Religion subject')}</label><select id="f-rel" class="select">${Object.keys(D.RELIGIONS).map(r => `<option value="${r}" ${d.religion === r ? 'selected' : ''}>${L(D.RELIGIONS[r].bn, D.RELIGIONS[r].en)}</option>`).join('')}</select></div>
        <div class="onb-foot"><button class="btn primary block" data-a="onbNext">${L('পরের ধাপ', 'Next')} ${ic('chevR', 'sm')}</button></div></div>`;
      if (o.step === 3) return `<div class="onb">${head(3, L('শেষ ধাপ', 'Last step'), L('কবে থেকে ৯০ দিনের যাত্রা শুরু করবে?', 'When does your 90-day journey begin?'))}
        <div class="mt-l">
          <div class="field"><label for="f-start">${L('প্রস্তুতি শুরুর তারিখ', 'Start date')}</label><input id="f-start" type="date" class="input" value="${d.startDate}"><span class="hint">${L('পরে প্রোফাইল থেকে পরিবর্তন করা যাবে', 'You can change this later in Profile')}</span></div>
          <div class="card lav mt-l small"><b>⏰ ${L('পড়ার অ্যালার্ম', 'Study alarms')}</b><br>${L('দৈনিক রুটিন অনুযায়ী ৫টি অ্যালার্ম সেট থাকবে: সকাল ৬:০০, ৯:৩০, দুপুর ২:৩০, সন্ধ্যা ৬:০০ ও রাত ৯:৩০। মিস করলে পেঁচু স্যার মজার রোস্ট পাঠাবে 😜', '5 alarms follow the daily routine: 6:00, 9:30, 14:30, 18:00 & 21:30. Skip, and Pechu sends a funny roast 😜')}</div>
          <button class="checkline mt-l ${d.consent ? 'on' : ''}" data-a="onbConsent"><span class="cbx">${ic('check', 'xs')}</span><span>${L('আমি সম্মত যে আমার নাম, স্কুল ও পয়েন্ট লিডারবোর্ডে দেখানো যাবে। মোবাইল নম্বর গোপন থাকবে এবং যেকোনো সময় প্রোফাইল ডিলিট করতে পারবো।', 'I agree my name, school & points may appear on leaderboards. My number stays private and I can delete my profile anytime.')}</span></button>
          <button class="checkline mt ${d.anon ? 'on' : ''}" data-a="onbAnon"><span class="cbx">${ic('check', 'xs')}</span><span>${L('লিডারবোর্ডে আমার নামের বদলে শুধু আদ্যক্ষর দেখাও', 'Show only my initials on leaderboards')}</span></button>
          ${err('consent')}
        </div>
        <div class="onb-foot"><button class="btn primary block" data-a="onbCreate">🚀 ${L('প্রোফাইল তৈরি করো', 'Create my profile')}</button></div></div>`;
      if (o.step === 4) {
        const p = S().profile;
        if (o.status === 'saving' || !p) return `<div class="onb" style="justify-content:center;text-align:center"><img src="assets/rocket.webp" style="width:160px;margin:0 auto;animation:float 1.6s ease-in-out infinite" alt=""><div class="h2 mt">${L('তোমার প্রোফাইল তৈরি হচ্ছে…', 'Creating your profile…')}</div><p class="muted">${L('৯০ দিনের প্ল্যান সাজানো হচ্ছে ✨', 'Arranging your 90-day plan ✨')}</p></div>`;
        const G = D.GROUPS[p.group];
        const msg = o.status === 'ok' ? `<div class="banner ok mt">☁️ <span>${L('সার্ভারে রেজিস্ট্রেশন সম্পন্ন!', 'Registered on the server!')}</span></div>`
          : o.status === 'exists' ? `<div class="banner warn mt">⚠️ <span>${L('এই মোবাইল ও রোল দিয়ে আগে থেকেই একটি প্রোফাইল আছে। আগের পয়েন্ট ফিরিয়ে আনতে চাইলে নিচের বাটনে চাপো।', 'A profile already exists with this mobile & roll. Tap below to restore your previous points.')}</span></div><button class="btn outline block mt-s" data-a="restoreExisting">${L('আগের প্রোফাইল ফিরিয়ে আনো', 'Restore previous profile')}</button>`
          : o.status === 'local' ? `<div class="banner info mt">📱 <span>${L('লোকাল মোডে চলছে। সার্ভার সেট করা হলে পয়েন্ট অটো-সিঙ্ক হবে।', 'Running in local mode. Points will sync once a server is configured.')}</span></div>`
          : `<div class="banner warn mt">📡 <span>${L('এখন সার্ভারে পৌঁছানো যায়নি। চিন্তা নেই—ইন্টারনেট পেলে অটোমেটিক রেজিস্টার হবে।', 'Server unreachable now. No worries — it will register automatically when online.')}</span></div>`;
        return `<div class="onb"><div class="center mt"><div style="font-size:56px;animation:popIn .6s var(--spring)">🎉</div><div class="h1">${L('স্বাগতম, ', 'Welcome, ')}${esc(p.name.split(' ')[0])}!</div><p class="muted">${L('তোমার ', 'Your ')}${L(G.bn, G.en)}${L(' বিভাগের স্টাডি প্যানেল রেডি।', ' study panel is ready.')}</p></div>
          <div class="id-card mt-l"><div class="ring-bg"></div><div class="tiny" style="opacity:.85">${L('তোমার ইউনিক আইডি', 'Your unique ID')}</div><button class="uid tap mt-s" data-a="copyId" style="color:#fff;font-size:20px">${esc(p.uid)} ${ic('copy', 'sm')}</button><div class="mt small" style="opacity:.92">${esc(p.name)} · ${L('রোল ', 'Roll ')}${esc(N(p.roll))}<br>${esc(p.school)}</div></div>
          <p class="tiny muted mt-s center">🔐 ${L('আইডিটা স্ক্রিনশট নিয়ে রাখো—ফোন বদলালে প্রোফাইল ফিরিয়ে আনতে লাগবে।', 'Screenshot this ID — you need it to restore your profile on a new phone.')}</p>
          ${msg}
          <div class="onb-foot"><button class="btn primary block" data-a="onbFinish">${L('যাত্রা শুরু করো', 'Start the journey')} 🚀</button></div></div>`;
      }
      if (o.step === 'restore') return `<div class="onb"><div class="row" style="margin-bottom:16px"><button class="icon-btn" data-a="onbHome" aria-label="back">${ic('chevL')}</button></div>
        <div class="h1">${L('প্রোফাইল ফিরিয়ে আনো', 'Restore profile')}</div><p class="muted mt-s">${L('দুইভাবে ফিরিয়ে আনা যায়:', 'Two ways to restore:')}</p>
        <div class="card mt"><div class="h3">📂 ${L('ব্যাকআপ ফাইল (সব তথ্য)', 'Backup file (everything)')}</div><p class="small muted mt-s">${L('প্রোফাইল → “ব্যাকআপ ডাউনলোড” থেকে পাওয়া .json ফাইল দিলে সব অগ্রগতি, ভুলের খাতা ও নম্বর ফিরে আসবে।', 'The .json file from Profile → Download backup restores all progress.')}</p><button class="btn ghost block mt" data-a="restoreFile">${L('ফাইল বেছে নাও', 'Choose file')}</button><input type="file" id="restoreInput" accept="application/json,.json" class="hidden"></div>
        <div class="card mt"><div class="h3">☁️ ${L('আইডি/রোল + মোবাইল দিয়ে (পয়েন্ট)', 'ID/Roll + mobile (points)')}</div><p class="small muted mt-s">${L('সার্ভার থেকে তোমার প্রোফাইল ও পয়েন্ট ফিরে আসবে।', 'Restores your profile & points from the server.')}</p>
          <div class="field mt"><label for="r-id">${L('ইউনিক আইডি অথবা রোল নম্বর', 'Unique ID or roll number')}</label><input id="r-id" class="input" placeholder="S27-SC-XXXXXX"></div>
          <div class="field"><label for="r-mobile">${L('মোবাইল নম্বর', 'Mobile number')}</label><input id="r-mobile" class="input" type="tel" inputmode="tel" placeholder="01XXXXXXXXX"></div>
          <span class="err hidden" id="r-err"></span>
          <button class="btn primary block mt" data-a="restoreServer">${L('ফিরিয়ে আনো', 'Restore')}</button></div></div>`;
      return '';
    },
    mount() {
      const s = $('#f-school'); if (!s) return;
      const box = $('#schoolSuggest');
      const show = () => {
        const q = s.value.trim().toLowerCase(); const list = (U.schools || []);
        const m = q.length < 2 ? [] : list.filter(x => x.toLowerCase().includes(q)).slice(0, 6);
        box.innerHTML = m.map(x => `<button type="button" data-a="pickSchool" data-v="${esc(x)}">🏫 ${esc(x)}</button>`).join('');
        box.classList.toggle('hidden', !m.length);
      };
      s.addEventListener('input', show); s.addEventListener('focus', show);
      s.addEventListener('blur', () => setTimeout(() => box.classList.add('hidden'), 200));
      if (!U.schools) { U.schools = JSON.parse(localStorage.getItem('ssc27_schools') || '[]'); if (A.hasApi()) A.api('schools', {}, 'GET').then(j => { U.schools = j.schools || []; localStorage.setItem('ssc27_schools', JSON.stringify(U.schools)); }).catch(() => {}); }
    },
    collect() {
      const d = this.st.d; const v = (id) => { const e = $('#' + id); return e ? e.value.trim() : null; };
      const set = (k, id) => { const x = v(id); if (x !== null) d[k] = x; };
      set('name', 'f-name'); set('roll', 'f-roll'); set('mobile', 'f-mobile'); set('school', 'f-school'); set('district', 'f-district'); set('religion', 'f-rel'); set('startDate', 'f-start');
    },
    validate(step) {
      const d = this.st.d, e = {};
      const toEn = (s) => String(s).replace(/[০-৯]/g, c => '০১২৩৪৫৬৭৮৯'.indexOf(c));
      if (step === 1) {
        d.roll = toEn(d.roll).replace(/\D/g, ''); d.mobile = toEn(d.mobile).replace(/[\s-]/g, '').replace(/^\+?88/, '');
        if (d.name.length < 2) e.name = L('নাম কমপক্ষে ২ অক্ষরের হতে হবে', 'Name must be at least 2 characters');
        if (!/^\d{1,10}$/.test(d.roll)) e.roll = L('সঠিক রোল নম্বর দাও', 'Enter a valid roll number');
        if (!/^01[3-9]\d{8}$/.test(d.mobile)) e.mobile = L('সঠিক ১১ ডিজিটের মোবাইল নম্বর দাও (01XXXXXXXXX)', 'Enter a valid 11-digit number (01XXXXXXXXX)');
        if (d.school.length < 3) e.school = L('স্কুলের পুরো নাম লিখো', 'Enter your full school name');
      }
      if (step === 2 && !d.group) e.group = L('একটি বিভাগ বেছে নাও', 'Choose a group');
      if (step === 3 && !d.consent) e.consent = L('এগিয়ে যেতে সম্মতি দাও', 'Please agree to continue');
      this.st.errors = e;
      return !Object.keys(e).length;
    }
  };

  /* =========================================================================
     SHEETS & MODALS & TOAST
     ========================================================================= */
  let SHEET = null; let sheetResolve = null;
  function openSheet(fn) {
    if (SHEET) { SHEET.fn = fn; renderSheet(true); return; }
    const app = $('#app');
    const ov = document.createElement('div'); ov.className = 'overlay'; ov.dataset.a = 'closeSheet';
    const sh = document.createElement('div'); sh.className = 'sheet'; sh.setAttribute('role', 'dialog'); sh.setAttribute('aria-modal', 'true');
    sh.innerHTML = `<div class="grab"></div><div class="sh-head"></div><div class="sh-body"></div>`;
    app.appendChild(ov); app.appendChild(sh);
    SHEET = { fn, ov, sh };
    renderSheet(true);
    requestAnimationFrame(() => { ov.classList.add('show'); sh.classList.add('show'); });
    history.pushState({ sheet: true }, '');
    // swipe down to close
    let y0 = null, dy = 0; const head = sh.querySelector('.grab');
    const onStart = (e) => { y0 = (e.touches ? e.touches[0] : e).clientY; dy = 0; sh.style.transition = 'none'; };
    const onMove = (e) => { if (y0 == null) return; dy = Math.max(0, (e.touches ? e.touches[0] : e).clientY - y0); sh.style.transform = `translateY(${dy}px)`; };
    const onEnd = () => { if (y0 == null) return; sh.style.transition = ''; sh.style.transform = ''; if (dy > 90) closeSheet(); y0 = null; };
    [head, sh.querySelector('.sh-head')].forEach(h => { h.addEventListener('touchstart', onStart, { passive: true }); h.addEventListener('touchmove', onMove, { passive: true }); h.addEventListener('touchend', onEnd); });
  }
  function renderSheet(fresh) {
    if (!SHEET) return;
    const body = SHEET.sh.querySelector('.sh-body'); const top = body.scrollTop;
    const r = SHEET.fn();
    SHEET.sh.querySelector('.sh-head').innerHTML = r.head + `<button class="icon-btn" data-a="closeSheet" aria-label="${L('বন্ধ করো', 'Close')}">${ic('x', 'sm')}</button>`;
    body.innerHTML = r.body;
    body.scrollTop = fresh ? 0 : top;
  }
  function destroySheet() {
    if (!SHEET) return;
    const { ov, sh } = SHEET; SHEET = null;
    ov.classList.remove('show'); sh.classList.remove('show');
    setTimeout(() => { ov.remove(); sh.remove(); }, 420);
    if (sheetResolve) { const r = sheetResolve; sheetResolve = null; r(); }
  }
  function closeSheet() {
    return new Promise((res) => {
      if (!SHEET) return res();
      sheetResolve = res;
      if (history.state && history.state.sheet) history.back(); else destroySheet();
    });
  }
  window.addEventListener('popstate', () => { if (SHEET) destroySheet(); });

  let modalEl = null;
  function modal(o) {
    closeModal(true);
    const app = $('#app');
    const ov = document.createElement('div'); ov.className = 'overlay top';
    const m = document.createElement('div'); m.className = 'modal'; m.setAttribute('role', 'alertdialog');
    m.innerHTML = `${o.img ? `<img class="m-img" src="${o.img}" alt="">` : ''}${o.emoji ? `<div style="font-size:52px">${o.emoji}</div>` : ''}${o.title ? `<div class="h2">${o.title}</div>` : ''}<div class="mt-s">${o.body || ''}</div>
      <div class="col mt">${o.ok ? `<button class="btn ${o.danger ? 'danger' : 'primary'} block" data-m="ok">${o.ok}</button>` : ''}${o.cancel ? `<button class="btn outline block" data-m="cancel">${o.cancel}</button>` : ''}</div>`;
    app.appendChild(ov); app.appendChild(m);
    modalEl = { ov, m, o };
    requestAnimationFrame(() => { ov.classList.add('show'); m.classList.add('show'); });
    m.addEventListener('click', (e) => {
      const b = e.target.closest('[data-m]'); if (!b) return;
      if (b.dataset.m === 'ok') { if (o.onOk && o.onOk(m) === false) return; closeModal(); }
      else { closeModal(); if (o.onCancel) o.onCancel(); }
    });
    ov.addEventListener('click', () => { if (!o.sticky) { closeModal(); if (o.onCancel) o.onCancel(); } });
    if (o.onMount) o.onMount(m);
    return m;
  }
  function closeModal(instant) {
    if (!modalEl) return; const { ov, m } = modalEl; modalEl = null;
    if (instant) { ov.remove(); m.remove(); return; }
    ov.classList.remove('show'); m.classList.remove('show'); setTimeout(() => { ov.remove(); m.remove(); }, 350);
  }
  const confirmBox = (title, body, ok, danger) => new Promise(res => modal({ title, body: `<p class="muted">${body}</p>`, ok, cancel: L('বাতিল', 'Cancel'), danger, onOk: () => res(true), onCancel: () => res(false) }));

  function toast(msg, emoji = '✨', ms = 2600) {
    const box = $('#toasts'); if (!box) return;
    while (box.children.length >= 2) box.firstChild.remove();
    const t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status');
    t.innerHTML = `<span class="te">${emoji}</span><span>${esc(msg)}</span>`;
    box.appendChild(t);
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 320); }, ms);
  }

  const celQueue = []; let celOn = false;
  function celebrate(o) { celQueue.push(o); if (!celOn) nextCel(); }
  function nextCel() {
    const o = celQueue.shift(); if (!o) { celOn = false; return; }
    celOn = true;
    const img = { rocket: 'assets/rocket.webp', trophy: 'assets/trophy.webp', level: 'assets/mascot.webp', focus: 'assets/desk.webp' }[o.type] || 'assets/mascot.webp';
    const el = document.createElement('div'); el.className = 'celebrate ' + o.type;
    el.innerHTML = `<div class="rays"></div><img class="cel-img" src="${img}" alt=""><h2>${esc(o.title)}</h2><p>${esc(o.text || '')}</p>${o.xp ? `<div class="xp-chip">+${N(o.xp)} XP</div>` : ''}<button class="btn white" data-c="close">${L('দারুণ! চালিয়ে যাই', 'Awesome! Keep going')}</button>`;
    $('#app').appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    A.sfx.play(o.type === 'level' || o.type === 'trophy' ? 'level' : 'finish');
    setTimeout(() => A.fx.confetti(o.type === 'focus' ? 70 : 140), 250);
    const close = () => { el.classList.remove('show'); setTimeout(() => { el.remove(); nextCel(); refresh(); }, 350); };
    el.querySelector('[data-c]').addEventListener('click', close);
  }

  function alarmModal(o) {
    A.sfx.alarmStart();
    modal({
      img: o.roast ? 'assets/mascot.webp' : null, emoji: o.roast ? null : '⏰',
      title: o.title, body: `${!o.roast ? '<div class="alarm-bell" style="font-size:0"></div>' : ''}<p style="white-space:pre-line;color:var(--ink-2)">${esc(o.body)}</p>`,
      ok: L('এখনই শুরু করছি 💪', "Starting now 💪"), cancel: L('১০ মিনিট পরে মনে করাও', 'Remind me in 10 min'), sticky: true,
      onOk: () => { A.sfx.alarmStop(); go('planner'); }, onCancel: () => { A.sfx.alarmStop(); A.snooze(10); toast(L('ঠিক আছে, ১০ মিনিট পরে আবার ডাকবো ⏰', 'OK, I will ring again in 10 min ⏰'), '⏰'); }
    });
    const em = document.querySelector('.modal div[style*="font-size:52px"]'); if (em) em.classList.add('alarm-bell');
  }
  Object.assign(A.ui, { toast, celebrate, alarmModal, modal, openSheet, closeSheet });

  /* =========================================================================
     ACTIONS
     ========================================================================= */
  const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  async function copy(text) {
    try { await navigator.clipboard.writeText(text); toast(L('কপি হয়েছে!', 'Copied!'), '📋'); }
    catch (e) { const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); toast(L('কপি হয়েছে!', 'Copied!'), '📋'); } catch (e2) {} ta.remove(); }
  }

  const ACT = {
    tab: (el) => { const to = el.dataset.to; depth = 0; if (route.name === to) { view().scrollTo({ top: 0, behavior: 'smooth' }); return; } location.hash = '#' + to; },
    go: (el) => { const go_ = () => go(el.dataset.to, el.dataset.arg); if (SHEET) closeSheet().then(go_); else go_(); },
    back: () => back(),
    closeSheet: () => closeSheet(),

    // Home
    startToday: () => { S().profile.startDate = A.todayKey(); A.save(); toast(L('যাত্রা শুরু! দিন ১ 🚀', 'Journey started! Day 1 🚀'), '🚀'); render(); },
    enableNotif: async () => { await A.requestNotif(); refresh(); },
    install: async () => {
      if (U.deferredInstall) { U.deferredInstall.prompt(); const r = await U.deferredInstall.userChoice.catch(() => ({})); U.deferredInstall = null; if (r && r.outcome === 'accepted') toast(L('ইনস্টল হচ্ছে! 🎉', 'Installing! 🎉'), '📲'); refresh(); return; }
      modal({ emoji: '📲', title: L('অ্যাপ ইনস্টল করো', 'Install the app'), body: `<div class="small" style="text-align:left;color:var(--ink-2)">${isIOS() ? L('১. Safari-তে নিচের <b>Share</b> (⬆️) বাটনে চাপো<br>২. <b>Add to Home Screen</b> বেছে নাও<br>৩. <b>Add</b> চাপো', '1. Tap <b>Share</b> (⬆️) in Safari<br>2. Choose <b>Add to Home Screen</b><br>3. Tap <b>Add</b>') : L('১. Chrome-এর উপরের ⋮ মেনুতে চাপো<br>২. <b>Install app</b> বা <b>Add to Home screen</b> বেছে নাও<br>৩. <b>Install</b> চাপো', '1. Tap the ⋮ menu in Chrome<br>2. Choose <b>Install app</b> / <b>Add to Home screen</b><br>3. Tap <b>Install</b>')}</div>`, ok: L('বুঝেছি', 'Got it') });
    },
    dismissInstall: () => { S().ui.installDismissed = true; A.save(); refresh(); },

    // Planner & tasks
    pday: (el) => { U.showAll = false; location.replace('#planner/' + el.dataset.day); },
    toggleShowAll: () => { U.showAll = !U.showAll; refresh(); },
    toggleDone: () => { U.doneOpen = !U.doneOpen; refresh(); },
    toggleBacklog: () => { U.backlogOpen = !U.backlogOpen; refresh(); },
    toggleTask: (el, e) => {
      const id = el.dataset.id; const t = A.plan().tasks[id]; if (!t) return;
      if (el.dataset.ro) { A.haptic(30); toast(L('এই সপ্তাহ এখনো লক করা 🔒', 'This week is still locked 🔒'), '🔒'); return; }
      if (A.isDone(id)) { A.undoTask(id); refresh(); return; }
      if (t.kind === 'reflect') { openSheet(() => reflectSheet(t.w)); return; }
      el.classList.add('on', 'anim');
      const card = el.closest('.task'); if (card) card.classList.add('just-done');
      const r = el.getBoundingClientRect();
      A.completeTask(id, e);
      A.fx.confetti(36, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
      U.justId = id;
      if (t.testId && !S().tests[t.testId]) setTimeout(() => toast(L('পরীক্ষার নম্বরটাও লিখে রাখো 📊', 'Log your test score too 📊'), '📊', 2600), 1800);
      clearTimeout(U._rt); U._rt = setTimeout(refresh, 420); // many fast taps → one re-render
    },
    taskOpen: (el) => {
      const t = A.plan().tasks[el.dataset.id]; if (!t) return;
      openSheet(() => {
        const K = D.KINDS[t.kind]; const done = A.isDone(t.id); const un = A.weekUnlocked(t.w);
        const chList = t.chs.map(n => `<div class="row" style="padding:8px 0;border-bottom:1px solid var(--line-2)"><span class="grow small">${esc(A.chLabel(t.sub, n))}</span><span class="row gap-s">${[1, 2, 3, 4].map(s => `<i style="width:16px;height:6px;border-radius:9px;background:${A.stepDone(t.sub, n, s) ? subC(t.sub) : 'var(--line)'}"></i>`).join('')}</span></div>`).join('');
        return {
          head: `<div class="ti" style="width:46px;height:46px;border-radius:15px;display:grid;place-items:center;background:${subBg(t.sub)};color:${subC(t.sub)};flex:none">${t.sub ? subIc(t.sub) : '🎯'}</div><div class="grow"><div class="eyebrow">${L('দিন ', 'Day ')}${N(t.day)} · ${L('সপ্তাহ ', 'Week ')}${N(t.w)}</div><div class="h3">${esc(A.taskTitle(t))}</div></div>`,
          body: `<div class="row gap-s" style="flex-wrap:wrap"><span class="tag ${K.tone}">${L(K.bn, K.en)}</span><span class="tag gray">⏱ ${mins(t.min)}</span><span class="tag mint">+${N(A.xpForTask(t))} XP</span>${done ? `<span class="tag mint">✓ ${L('সম্পন্ন', 'Done')}</span>` : ''}</div>
            <p class="mt" style="color:var(--ink-2)">${esc(A.taskSubtitle(t))}</p>
            ${t.steps.length ? `<div class="card lav tight mt small">💡 ${L('এই কাজ শেষ করলে নিচের অধ্যায়গুলোর ', 'Completing this marks ')}${t.steps.map(s => L('“' + D.STEPS[s - 1].bn + '”', '“' + D.STEPS[s - 1].en + '”')).join(', ')}${L(' ধাপ অটোমেটিক সম্পন্ন হবে।', ' as done for these chapters.')}</div>` : ''}
            ${chList ? `<div class="card tight mt">${chList}</div>` : ''}
            <div class="col mt">
              ${t.testId ? `<button class="btn ghost block" data-a="testEntry" data-id="${t.testId}">📊 ${L('পরীক্ষার নম্বর লিখো', 'Log test score')}</button>` : ''}
              ${t.kind === 'reflect' ? `<button class="btn ghost block" data-a="reflect" data-w="${t.w}">🪞 ${L('রিফ্লেকশন লেখো', 'Write reflection')}</button>` : ''}
              ${t.kind === 'errrev' || t.kind === 'weak' ? `<button class="btn ghost block" data-a="go" data-to="errors">📒 ${L('ভুলের খাতা খোলো', 'Open mistake notebook')}</button>` : ''}
              ${t.sub ? `<button class="btn outline block" data-a="focusOn" data-sub="${t.sub}" data-n="${t.chs[0] || 0}">🎯 ${L('এই কাজে ফোকাস টাইমার চালাও', 'Start focus timer for this')}</button>` : ''}
              ${t.kind === 'write' ? `<button class="btn primary block" data-a="wrOpen" data-k="${t.sub}:${t.chs[0]}">✍️ ${t.wr ? L('রাইটিং তালিকা এডিট করো', 'Edit writing list') : L('নিজের তালিকা দাও (যেমন: ১০টা অনুচ্ছেদের নাম)', 'Add your own list (e.g. 10 paragraph names)')}</button>` : ''}
              <button class="btn ghost block" data-a="peFromTask" data-id="${t.id}">✏️ ${L('প্ল্যানে এডিট করো (সময়/দিন বদলাও)', 'Edit in plan (time/day)')}</button>
              ${t.kind !== 'reflect' ? `<button class="btn ${done ? 'outline' : 'mint'} block" data-a="toggleTaskSheet" data-id="${t.id}" ${un ? '' : 'disabled'}>${done ? L('↺ অসম্পন্ন করো', '↺ Mark undone') : L('✓ সম্পন্ন করো', '✓ Mark complete')}</button>` : ''}
            </div><div style="height:6px"></div>`
        };
      });
    },
    toggleTaskSheet: (el, e) => {
      const id = el.dataset.id;
      if (A.isDone(id)) { A.undoTask(id); refresh(); }
      else { A.completeTask(id, e); A.fx.confetti(60); U.justId = id; closeSheet().then(refresh); }
    },

    // Roadmap
    openWeek: (el) => { const w = +el.dataset.w; U.openDay = null; if (!A.weekUnlocked(w)) { A.haptic(20); toast(L(`সপ্তাহ ${N(w)} লক—প্রিভিউ দেখাচ্ছি 🔒`, `Week ${w} locked — showing preview 🔒`), '🔒', 1800); } openSheet(() => weekSheet(w)); },
    weekDay: (el) => { const d = +el.dataset.day; U.openDay = U.openDay === d ? -1 : d; renderSheet(); },
    reflect: (el) => openSheet(() => reflectSheet(+el.dataset.w)),
    mood: (el) => { $('#rf-mood').value = el.dataset.m; el.parentElement.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c === el)); A.haptic(8); },
    saveReflect: (el) => {
      const w = +el.dataset.w; const st = S();
      const r = { mood: +$('#rf-mood').value || 3, good: $('#rf-good').value.trim(), improve: $('#rf-imp').value.trim(), goal: $('#rf-goal').value.trim(), at: Date.now() };
      st.reflections[w] = r;
      const t = Object.values(A.plan().tasks).find(x => x.w === w && x.kind === 'reflect');
      if (t && !A.isDone(t.id)) A.completeTask(t.id, null, { quiet: true });
      A.checkBadges(); A.save();
      toast(L('রিফ্লেকশন সংরক্ষিত। নিজেকে বোঝাই উন্নতির প্রথম ধাপ 🪞', 'Reflection saved. Knowing yourself is step one 🪞'), '🪞', 3000);
      closeSheet().then(refresh);
    },

    // Subjects
    chFilter: (el) => { U.chFilter = el.dataset.f; refresh(); },
    openChapter: (el) => { const sub = el.dataset.sub, n = +el.dataset.n; openSheet(() => chapterSheet(sub, n)); },
    stepToggle: (el, e) => {
      const sub = el.dataset.sub, n = +el.dataset.n, s = +el.dataset.s;
      const on = !A.stepDone(sub, n, s);
      A.setStep(sub, n, s, on, true);
      if (on) { A.sfx.play('done'); A.haptic(15); A.fx.xpFloat(8, e); if (A.stepCount(sub, n) === 4) { A.fx.confetti(90); toast(L('অধ্যায় মাস্টার! 📘 ৪/৪ ধাপ সম্পন্ন', 'Chapter mastered! 📘'), '🎉', 2600); } }
      else A.sfx.play('tick');
      refresh();
    },
    focusOn: (el) => { const t = A.timer(); if (t.running) { toast(L('একটা সেশন ইতিমধ্যে চলছে', 'A session is already running'), '⏳'); } else { t.sub = el.dataset.sub; t.ch = +el.dataset.n || 0; A.save(); } const g = () => go('focus'); if (SHEET) closeSheet().then(g); else g(); },

    // Focus
    preset: (el) => { if (A.timer().running) return; S().settings.focusPreset = el.dataset.p; A.timerReset('focus'); refresh(); },
    customMin: (el) => { S().settings.custom = +el.dataset.m; A.timerReset('focus'); refresh(); },
    timerStart: () => { A.sfx.unlock(); A.timerStart(); render({ keep: true }); },
    timerPause: () => { A.timerPause(); render({ keep: true }); },
    timerStop: async () => {
      const t = A.timer(); const el = Math.round((t.duration - A.timerLeft()) / 60);
      if (t.mode === 'focus' && el < 10 && el > 0) { const ok = await confirmBox(L('সেশন শেষ করবে?', 'End session?'), L('১০ মিনিটের কম হলে XP যোগ হবে না। আরেকটু চালিয়ে যাবে?', 'Less than 10 minutes earns no XP. Keep going a little longer?'), L('হ্যাঁ, শেষ করো', 'Yes, end it')); if (!ok) return; }
      A.timerStop(); render({ keep: true });
    },
    timerSkip: () => { const t = A.timer(); if (t.mode === 'focus' && t.running) { toast(L('ফোকাস চলাকালীন স্কিপ করা যায় না—আগে পজ বা শেষ করো', 'Pause or stop first'), '🎯'); return; } A.timerReset(t.mode === 'focus' ? 'break' : 'focus'); render({ keep: true }); },
    pickSubject: () => {
      const G = D.GROUPS[S().profile.group];
      let sel = A.timer().sub || '';
      const fn = () => ({
        head: `<div class="grow h2">${sel ? esc(A.subName(sel)) : L('বিষয় বেছে নাও', 'Choose subject')}</div>`,
        body: sel ? `<button class="btn outline sm mb" data-a="pickBack">${ic('chevL', 'sm')} ${L('অন্য বিষয়', 'Other subject')}</button>
          <button class="chap tap" data-a="pickCh" data-n="0"><span class="cn" style="background:${subBg(sel)};color:${subC(sel)}">✱</span><span class="grow bold small">${L('যেকোনো অধ্যায় / সাধারণ পড়া', 'Any chapter / general study')}</span></button>
          ${D.SUBJECTS[sel].chapters.map(c => `<button class="chap tap" data-a="pickCh" data-n="${c.n}"><span class="cn" style="background:${subBg(sel)};color:${subC(sel)}">${N(c.n)}</span><span class="grow"><span class="bold small" style="display:block">${esc(A.chLabel(sel, c.n))}</span>${stars(c.s)}</span><span class="tiny muted">${N(A.stepCount(sel, c.n) * 25)}%</span></button>`).join('')}`
          : `<div class="sub-grid">${G.subjects.map(s => `<button class="sub-card tap" style="min-height:110px" data-a="pickSub" data-s="${s}"><span class="si" style="background:${subBg(s)};color:${subC(s)}">${subIc(s)}</span><span class="nm">${esc(A.subName(s))}</span></button>`).join('')}</div>`
      });
      ACT.pickSub = (b) => { sel = b.dataset.s; renderSheet(true); };
      ACT.pickBack = () => { sel = ''; renderSheet(true); };
      ACT.pickCh = (b) => { const t = A.timer(); t.sub = sel; t.ch = +b.dataset.n; A.save(); closeSheet().then(refresh); };
      openSheet(fn);
    },

    // Errors
    addError: (el) => openSheet(() => errorForm({ sub: el.dataset.sub || '', ch: el.dataset.n || '' })),
    efCat: (el) => { $('#ef-cat').value = el.dataset.c; el.parentElement.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c === el)); },
    saveError: (el) => {
      const q = $('#ef-q').value.trim(); if (!q) { $('#ef-q').classList.add('bad'); $('#ef-qerr').classList.remove('hidden'); $('#ef-q').focus(); return; }
      const data = { cat: $('#ef-cat').value, sub: $('#ef-sub').value, ch: +$('#ef-ch').value || 0, q, a: $('#ef-a').value.trim() };
      if (el.dataset.id) { const e = S().errors.find(x => x.id === el.dataset.id); Object.assign(e, data); A.save(); toast(L('আপডেট হয়েছে', 'Updated'), '✅'); }
      else { A.addError(data); toast(L('খাতায় যোগ হলো! ভুল থেকেই শেখা শুরু 📒', 'Added! Learning starts from mistakes 📒'), '📒'); }
      closeSheet().then(refresh);
    },
    errCat: (el) => { U.errCat = el.dataset.c; refresh(); },
    toggleMastered: () => { U.errShowMastered = !U.errShowMastered; refresh(); },
    errReview: (el, e) => { A.reviewError(el.dataset.id, false); A.fx.xpFloat(2, e); toast(L('ঠিক আছে, কাল আবার দেখাবো 🔁', 'OK, will show again tomorrow 🔁'), '🔁'); refresh(); },
    errMaster: (el, e) => { A.masterError(el.dataset.id, true); A.fx.xpFloat(10, e); A.sfx.play('done'); toast(L('দারুণ! এই ভুল আর হবে না 💪', 'Great! This mistake is history 💪'), '💪'); refresh(); },
    errUnmaster: (el) => { A.masterError(el.dataset.id, false); refresh(); },
    errMenu: (el) => {
      const id = el.dataset.id;
      modal({ title: L('এন্ট্রি', 'Entry'), body: '', ok: L('✏️ এডিট করো', '✏️ Edit'), cancel: L('🗑️ ডিলিট করো', '🗑️ Delete'),
        onOk: () => { setTimeout(() => openSheet(() => errorForm({ id })), 50); },
        onCancel: async () => { const ok = await confirmBox(L('ডিলিট করবে?', 'Delete?'), L('এই এন্ট্রি মুছে যাবে।', 'This entry will be removed.'), L('ডিলিট', 'Delete'), true); if (ok) { const st = S(); st.errors = st.errors.filter(x => x.id !== id); A.save(); refresh(); } } });
    },
    startReview: () => { U.rev = { ids: A.errDue().map(e => e.id), i: 0, show: false, ok: 0, again: 0 }; openSheet(reviewSheet); },
    revShow: () => { U.rev.show = true; renderSheet(); },
    revAns: (el) => { const R = U.rev; const ids = R.ids; const ok = el.dataset.ok === '1'; A.reviewError(ids[R.i], ok); ok ? R.ok++ : R.again++; R.i++; R.show = false; A.sfx.play(ok ? 'done' : 'tick'); renderSheet(true); if (R.i >= ids.length) { A.fx.confetti(80); refresh(); } },

    // Tests
    testEntry: (el) => openSheet(() => testSheet(el.dataset.id)),
    saveTest: (el) => {
      const got = parseFloat($('#ts-got').value), total = parseFloat($('#ts-total').value);
      if (!(total > 0) || !(got >= 0) || got > total) { $('#ts-err').classList.remove('hidden'); return; }
      A.saveTest(el.dataset.id, got, total, $('#ts-note').value.trim());
      const pc = Math.round(got / total * 100);
      toast(pc >= 80 ? L('অসাধারণ! ', 'Outstanding! ') + N(pc) + '% 🌟' : pc >= 60 ? L('ভালো হয়েছে! ', 'Well done! ') + N(pc) + '% 💪' : L('ঠিক আছে, পরের বার আরও ভালো হবে 🌱 ', 'It’s okay, next time will be better 🌱 ') + N(pc) + '%', pc >= 80 ? '🌟' : '📊', 3000);
      if (pc >= 80) A.fx.confetti(80);
      closeSheet().then(refresh);
    },

    // Leaderboard
    lbScope: (el) => { U.lbScope = el.dataset.k; refresh(); },
    lbPeriod: (el) => { U.lbPeriod = el.dataset.k; refresh(); },
    lbReload: () => { loadLB(true); render({ keep: true }); },
    squadCreate: async (el) => {
      const name = $('#sq-name').value.trim(); if (name.length < 2) { $('#sq-name').classList.add('bad'); return; }
      if (!A.hasApi()) { const code = Math.random().toString(36).slice(2, 8).toUpperCase(); S().squad = { code, name }; A.save(); toast(L('ডেমো গ্রুপ তৈরি (সার্ভার সেট করা নেই)', 'Demo group created (no server)'), '👥'); refresh(); return; }
      el.classList.add('loading');
      try { await A.syncNow(); const j = await A.api('createSquad', { uid: S().profile.uid, token: S().profile.token, name }); S().squad = { code: j.code, name }; A.save(); toast(L('গ্রুপ তৈরি হয়েছে! কোড: ', 'Group created! Code: ') + j.code, '🎉', 4000); loadLB(true); }
      catch (e) { toast(L('গ্রুপ তৈরি করা যায়নি: ', 'Could not create group: ') + e.message, '⚠️', 3500); }
      el.classList.remove('loading'); refresh();
    },
    squadJoin: async (el) => {
      const code = $('#sq-code').value.trim().toUpperCase(); if (code.length < 4) { $('#sq-code').classList.add('bad'); return; }
      if (!A.hasApi()) { toast(L('সার্ভার সেট করা না থাকলে গ্রুপে যোগ দেওয়া যায় না', 'Joining needs the server configured'), '⚠️', 3000); return; }
      el.classList.add('loading');
      try { await A.syncNow(); const j = await A.api('joinSquad', { uid: S().profile.uid, token: S().profile.token, code }); S().squad = { code, name: j.name }; A.save(); toast(L('গ্রুপে যোগ দিয়েছ: ', 'Joined: ') + j.name, '👥'); loadLB(true); }
      catch (e) { toast(e.code === 'NOT_FOUND' ? L('এই কোডের কোনো গ্রুপ পাওয়া যায়নি', 'No group with this code') : L('যোগ দেওয়া যায়নি: ', 'Could not join: ') + e.message, '⚠️', 3500); }
      el.classList.remove('loading'); refresh();
    },
    squadShare: async () => {
      const sq = S().squad; const text = L(`আমার SSC 2027 স্টাডি গ্রুপ “${sq.name}”-এ যোগ দাও! কোড: ${sq.code}`, `Join my SSC 2027 study group “${sq.name}”! Code: ${sq.code}`);
      if (navigator.share) { try { await navigator.share({ title: 'SSC 2027 Study Group', text, url: location.origin + location.pathname }); } catch (e) {} } else copy(text);
    },
    squadLeave: async () => {
      const ok = await confirmBox(L('গ্রুপ ছেড়ে দেবে?', 'Leave group?'), L('পরে আবার কোড দিয়ে যোগ দিতে পারবে।', 'You can rejoin later with the code.'), L('ছেড়ে দাও', 'Leave'), true); if (!ok) return;
      if (A.hasApi()) A.api('leaveSquad', { uid: S().profile.uid, token: S().profile.token }).catch(() => {});
      S().squad = null; A.save(); refresh();
    },
    toggleAnon: () => { const p = S().profile; p.anon = !p.anon; A.save(); A.scheduleSync(500); toast(p.anon ? L('লিডারবোর্ডে এখন শুধু আদ্যক্ষর দেখাবে', 'Only initials will be shown now') : L('লিডারবোর্ডে নাম দেখাবে', 'Your name will be shown'), '👤'); setTimeout(() => loadLB(true), 1500); refresh(); },

    // Profile
    copyId: () => copy(S().profile.uid),
    toggleLang: () => { const s = S().settings; s.lang = s.lang === 'en' ? 'bn' : 'en'; document.documentElement.lang = s.lang; A.save(); render({ keep: true }); },
    startDate: () => {
      const p = S().profile;
      modal({ emoji: '📅', title: L('প্রস্তুতি শুরুর তারিখ', 'Start date'), body: `<input type="date" id="sd-in" class="input" value="${p.startDate}"><p class="tiny muted mt-s">${L('তারিখ বদলালে দিন গণনা বদলাবে, কিন্তু সম্পন্ন কাজগুলো থেকে যাবে।', 'Changing the date shifts the day count; completed tasks stay.')}</p>`, ok: L('সংরক্ষণ', 'Save'), cancel: L('বাতিল', 'Cancel'),
        onOk: (m) => { const v = m.querySelector('#sd-in').value; if (!v) return false; p.startDate = v; A.save(); toast(L('তারিখ আপডেট হয়েছে', 'Date updated'), '📅'); refresh(); } });
    },
    syncNow: async () => {
      if (!A.hasApi()) { modal({ emoji: '☁️', title: L('লোকাল মোড', 'Local mode'), body: `<p class="small muted">${L('অ্যাডমিন এখনো Google Sheet সার্ভার সংযুক্ত করেননি। তোমার সব তথ্য ফোনে নিরাপদে আছে; সার্ভার যুক্ত হলে পয়েন্ট অটোমেটিক সিঙ্ক হবে।', 'The admin has not connected the Google Sheet server yet. Your data is safe on this phone and will sync automatically later.')}</p>`, ok: L('ঠিক আছে', 'OK') }); return; }
      toast(L('সিঙ্ক হচ্ছে…', 'Syncing…'), '☁️', 1200);
      const ok = await A.syncNow();
      toast(ok ? L('সিঙ্ক সম্পন্ন ✓', 'Synced ✓') : L('সিঙ্ক হয়নি: ', 'Sync failed: ') + (S().sync.lastError || ''), ok ? '✅' : '⚠️', 3000); refresh();
    },
    backup: () => { const st = S(); A.download('ssc2027-backup-' + st.profile.uid + '-' + A.todayKey() + '.json', JSON.stringify({ app: 'ssc2027', v: 1, exportedAt: new Date().toISOString(), state: st }, null, 1), 'application/json'); toast(L('ব্যাকআপ ডাউনলোড হয়েছে 💾', 'Backup downloaded 💾'), '💾'); },
    restoreFile: () => { const inp = $('#restoreInput'); if (!inp) return; inp.value = ''; inp.onchange = () => { const f = inp.files[0]; if (!f) return; const rd = new FileReader(); rd.onload = async () => { try { const j = JSON.parse(rd.result); const st = j.state || j; if (!st.profile || !st.profile.uid) throw new Error('bad'); if (S().profile) { const ok = await confirmBox(L('রিস্টোর করবে?', 'Restore?'), L('বর্তমান সব তথ্য ব্যাকআপ ফাইলের তথ্য দিয়ে প্রতিস্থাপিত হবে।', 'Current data will be replaced by the backup.'), L('রিস্টোর', 'Restore'), true); if (!ok) return; } A.replaceState(st); toast(L('সব তথ্য ফিরে এসেছে! 🎉', 'Everything restored! 🎉'), '🎉', 3000); depth = 0; location.hash = '#home'; render(); A.scheduleSync(1000); } catch (e) { toast(L('ফাইলটি সঠিক ব্যাকআপ নয়', 'Not a valid backup file'), '⚠️', 3000); } }; rd.readAsText(f); }; inp.click(); },
    editProfile: () => {
      const p = S().profile;
      openSheet(() => ({
        head: `<div class="grow h2">${L('প্রোফাইল এডিট', 'Edit profile')}</div>`,
        body: `<div class="field"><label for="ep-name">${L('নাম', 'Name')}</label><input id="ep-name" class="input" maxlength="60" value="${esc(p.name)}"></div>
          <div class="field"><label for="ep-roll">${L('রোল', 'Roll')}</label><input id="ep-roll" class="input" inputmode="numeric" maxlength="10" value="${esc(p.roll)}"></div>
          <div class="field"><label for="ep-school">${L('স্কুল', 'School')}</label><input id="ep-school" class="input" maxlength="80" value="${esc(p.school)}"></div>
          <div class="field"><label for="ep-district">${L('জেলা', 'District')}</label><select id="ep-district" class="select"><option value="">—</option>${D.DISTRICTS.map(x => `<option ${p.district === x ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
          <div class="field"><label for="ep-rel">${L('ধর্ম শিক্ষা', 'Religion subject')}</label><select id="ep-rel" class="select">${Object.keys(D.RELIGIONS).map(r => `<option value="${r}" ${p.religion === r ? 'selected' : ''}>${L(D.RELIGIONS[r].bn, D.RELIGIONS[r].en)}</option>`).join('')}</select></div>
          <div class="field"><label for="ep-group">${L('বিভাগ', 'Group')}</label><select id="ep-group" class="select">${Object.keys(D.GROUPS).map(g => `<option value="${g}" ${p.group === g ? 'selected' : ''}>${L(D.GROUPS[g].bn, D.GROUPS[g].en)}</option>`).join('')}</select><span class="hint">⚠️ ${L('বিভাগ বদলালে রোডম্যাপের কাজের অগ্রগতি নতুন করে শুরু হবে (XP থেকে যাবে)', 'Changing group restarts roadmap task progress (XP stays)')}</span></div>
          <p class="tiny muted mt">${L('মোবাইল নম্বর ও ইউনিক আইডি পরিবর্তন করা যায় না।', 'Mobile number and unique ID cannot be changed.')}</p>
          <button class="btn primary block mt" data-a="saveProfile">${L('সংরক্ষণ করো', 'Save')}</button><div style="height:8px"></div>`
      }));
    },
    saveProfile: async () => {
      const p = S().profile; const name = $('#ep-name').value.trim(); const school = $('#ep-school').value.trim(); const roll = $('#ep-roll').value.trim().replace(/[০-৯]/g, c => '০১২৩৪৫৬৭৮৯'.indexOf(c)).replace(/\D/g, '');
      if (name.length < 2 || school.length < 3 || !roll) { toast(L('নাম, রোল ও স্কুল সঠিকভাবে লিখো', 'Enter a valid name, roll & school'), '⚠️'); return; }
      const g = $('#ep-group').value;
      if (g !== p.group) { const ok = await confirmBox(L('বিভাগ পরিবর্তন করবে?', 'Change group?'), L('রোডম্যাপের কাজের অগ্রগতি ও অধ্যায়ের ধাপ রিসেট হবে। XP, ব্যাজ ও ভুলের খাতা থেকে যাবে।', 'Roadmap tasks and chapter steps will reset. XP, badges and notebook stay.'), L('পরিবর্তন করো', 'Change'), true); if (!ok) return; const st = S(); st.tasks = {}; st.steps = {}; st.tests = {}; st.celebrated = { weeks: {}, phases: {} }; p.group = g; }
      Object.assign(p, { name, school, roll, district: $('#ep-district').value, religion: $('#ep-rel').value });
      A.save(true);
      if (A.hasApi() && S().sync.registered) A.api('update', A.S().profile && { uid: p.uid, token: p.token, name, school, roll, district: p.district, group: p.group, religion: p.religion }).catch(() => {});
      toast(L('প্রোফাইল আপডেট হয়েছে', 'Profile updated'), '✅');
      closeSheet().then(() => render());
    },
    deleteProfile: () => {
      const word = L('ডিলিট', 'DELETE');
      modal({ emoji: '🗑️', title: L('প্রোফাইল ডিলিট করবে?', 'Delete profile?'),
        body: `<p class="small muted">${L('সার্ভার থেকে তোমার নাম, রোল, মোবাইল ও পয়েন্ট এবং এই ফোন থেকে সব অগ্রগতি মুছে যাবে। এটা আর ফেরানো যাবে না। চাইলে আগে ব্যাকআপ নিয়ে নাও।', 'Your name, roll, mobile & points will be removed from the server and all progress from this phone. This cannot be undone. Download a backup first if you like.')}</p><p class="small bold mt">${L('নিশ্চিত করতে লেখো: ', 'Type to confirm: ')}<span style="color:#D23C3C">${word}</span></p><input id="del-in" class="input mt-s" autocomplete="off">`,
        ok: L('চিরতরে ডিলিট করো', 'Delete forever'), cancel: L('বাতিল', 'Cancel'), danger: true,
        onOk: (m) => {
          const v = m.querySelector('#del-in').value.trim();
          if (v !== word && v.toUpperCase() !== 'DELETE') { m.querySelector('#del-in').classList.add('bad'); return false; }
          const p = S().profile;
          const finish = () => { A.resetAll(); depth = 0; history.replaceState(null, '', location.pathname); Onb.st = { step: 0, d: { name: '', roll: '', mobile: '', school: '', district: '', group: '', religion: 'islam', startDate: A.todayKey(), anon: false, consent: true }, status: '', errors: {} }; render(); toast(L('প্রোফাইল ডিলিট হয়েছে। আবার দেখা হবে 👋', 'Profile deleted. See you again 👋'), '👋', 3000); };
          if (A.hasApi() && S().sync.registered) A.api('delete', { uid: p.uid, token: p.token }).catch(() => {}).finally(finish); else finish();
        } });
    },

    // Alarms settings
    nativeSet: (el) => { if (A.native) A.native.openSettings(el.dataset.w); },
    remToggle: (el) => { const r = S().settings.reminders[+el.dataset.i]; r.on = !r.on; A.save(); A.scheduleNativeTriggers(); refresh(); },
    remDel: (el) => { S().settings.reminders.splice(+el.dataset.i, 1); A.save(); refresh(); },
    addReminder: () => { S().settings.reminders.push({ id: 'r' + Date.now().toString(36), time: '16:00', on: true }); A.save(); refresh(); },
    missToggle: () => { const s = S().settings; s.missCheck = !s.missCheck; A.save(); refresh(); },
    roast: (el) => { S().settings.roast = el.dataset.k; A.save(); A.haptic(8); refresh(); },
    soundToggle: () => { const s = S().settings; s.sound = !s.sound; A.save(); if (s.sound) A.sfx.play('done'); refresh(); },
    hapticToggle: () => { const s = S().settings; s.haptics = !s.haptics; A.save(); A.haptic(20); refresh(); },
    testAlarm: async () => {
      A.sfx.unlock();
      if (A.notifPermission() === 'granted') A.notify(L('⏰ টেস্ট অ্যালার্ম', '⏰ Test alarm'), L('নোটিফিকেশন ঠিকঠাক কাজ করছে! 🎉', 'Notifications are working! 🎉'), { tag: 'test' });
      alarmModal({ title: L('টেস্ট অ্যালার্ম ⏰', 'Test alarm ⏰'), body: D.MSG.slots['06:00'] });
    },
    testRoast: () => { A.sfx.unlock(); const b = A.msgFor('miss'); if (A.notifPermission() === 'granted' && document.visibilityState !== 'visible') A.notify('😤', b); alarmModal({ title: L('পেঁচু স্যার বলছে… 🦉', 'Pechu says… 🦉'), body: b, roast: true }); },
    ics: () => { A.exportICS(); toast(L('ফাইল খুলে “Add/Import” চাপো—ক্যালেন্ডারে অ্যালার্ম যোগ হবে', 'Open the file and tap Add/Import'), '📅', 4500); },

    // Onboarding
    onbNext: () => {
      const o = Onb.st; Onb.collect();
      if (o.step > 0 && !Onb.validate(o.step)) { render({ keep: true }); const b = document.querySelector('.input.bad'); if (b) b.focus(); A.haptic(30); return; }
      o.step++; o.errors = {}; render();
    },
    onbBack: () => { Onb.collect(); const o = Onb.st; o.step = Math.max(0, o.step - 1); o.errors = {}; render(); },
    onbHome: () => { Onb.st.step = 0; render(); },
    onbRestore: () => { Onb.st.step = 'restore'; render(); },
    onbGroup: (el) => { Onb.collect(); Onb.st.d.group = el.dataset.g; Onb.st.errors = {}; A.haptic(8); render({ keep: true }); },
    onbConsent: () => { Onb.collect(); Onb.st.d.consent = !Onb.st.d.consent; render({ keep: true }); },
    onbAnon: () => { Onb.collect(); Onb.st.d.anon = !Onb.st.d.anon; render({ keep: true }); },
    pickSchool: (el) => { const s = $('#f-school'); s.value = el.dataset.v; $('#schoolSuggest').classList.add('hidden'); },
    onbCreate: async () => {
      const o = Onb.st; Onb.collect();
      if (!Onb.validate(3)) { render({ keep: true }); return; }
      const d = o.d; const st = S();
      st.profile = { uid: A.uidGen(d.group), token: A.tokenGen(), name: d.name, roll: d.roll, mobile: d.mobile, school: d.school, district: d.district, group: d.group, religion: d.religion, startDate: d.startDate || A.todayKey(), anon: d.anon, createdAt: Date.now() };
      st.settings.lang = S().settings.lang;
      A.save(true);
      o.step = 4; o.status = 'saving'; route = { name: 'onboarding' };
      // render manually because profile now exists
      view().innerHTML = `<div class="screen">${Onb.render()}</div>`;
      const t0 = Date.now();
      if (A.hasApi()) {
        try { await A.register(); o.status = 'ok'; }
        catch (e) { o.status = e.code === 'EXISTS' ? 'exists' : 'offline'; }
      } else o.status = 'local';
      await new Promise(r => setTimeout(r, Math.max(0, 1200 - (Date.now() - t0))));
      view().innerHTML = `<div class="screen">${Onb.render()}</div>`;
      A.fx.confetti(120);
      A.sfx.unlock(); A.sfx.play('level');
    },
    restoreExisting: async (el) => {
      const p = S().profile; el.classList.add('loading');
      try {
        const j = await A.api('restore', { roll: p.roll, mobile: p.mobile, school: p.school });
        Object.assign(p, { uid: j.profile.uid, token: j.profile.token, name: j.profile.name || p.name });
        S().xp = Math.max(S().xp, +j.profile.xp || 0); S().sync.registered = true; A.save(true);
        Onb.st.status = 'ok'; view().innerHTML = `<div class="screen">${Onb.render()}</div>`; toast(L('আগের প্রোফাইল ফিরে এসেছে!', 'Previous profile restored!'), '🎉');
      } catch (e) { el.classList.remove('loading'); toast(L('ফিরিয়ে আনা যায়নি: ', 'Restore failed: ') + e.message, '⚠️', 3500); }
    },
    restoreServer: async (el) => {
      const idv = $('#r-id').value.trim().toUpperCase(); const mob = $('#r-mobile').value.trim().replace(/[০-৯]/g, c => '০১২৩৪৫৬৭৮৯'.indexOf(c)).replace(/[\s-]/g, '').replace(/^\+?88/, '');
      const err = $('#r-err'); const showErr = (m) => { err.textContent = m; err.classList.remove('hidden'); };
      if (!idv || !/^01[3-9]\d{8}$/.test(mob)) return showErr(L('আইডি/রোল এবং সঠিক মোবাইল নম্বর দাও', 'Enter ID/roll and a valid mobile number'));
      if (!A.hasApi()) return showErr(L('সার্ভার সেট করা নেই। ব্যাকআপ ফাইল ব্যবহার করো।', 'No server configured. Use a backup file.'));
      el.classList.add('loading');
      try {
        const payload = idv.startsWith('S27-') ? { uid: idv, mobile: mob } : { roll: idv.replace(/\D/g, ''), mobile: mob };
        const j = await A.api('restore', payload);
        const pr = j.profile; const st = S();
        st.profile = { uid: pr.uid, token: pr.token, name: pr.name, roll: pr.roll, mobile: mob, school: pr.school, district: pr.district || '', group: pr.group || 'science', religion: pr.religion || 'islam', startDate: pr.startDate || A.todayKey(), anon: !!+pr.anon, createdAt: Date.now() };
        st.xp = +pr.xp || 0; st.sync.registered = true; if (pr.squad) st.squad = { code: pr.squad, name: pr.squadName || pr.squad };
        A.save(true); toast(L('স্বাগতম ফিরে, ', 'Welcome back, ') + pr.name + '! 🎉', '🎉', 3000); depth = 0; location.hash = '#home'; render();
      } catch (e) { el.classList.remove('loading'); showErr(e.code === 'NOT_FOUND' ? L('এই তথ্যে কোনো প্রোফাইল পাওয়া যায়নি', 'No profile found with these details') : L('সমস্যা হয়েছে: ', 'Error: ') + e.message); }
    },
    onbFinish: async () => {
      A.sfx.unlock();
      depth = 0; history.replaceState(null, '', location.pathname + '#home');
      render();
      setTimeout(() => modal({ emoji: '⏰', title: L('পড়ার অ্যালার্ম চালু করবে?', 'Turn on study alarms?'), body: `<p class="small muted">${L('রুটিন অনুযায়ী মনে করিয়ে দেবো, আর ফাঁকি দিলে পেঁচু স্যারের মজার রোস্ট আসবে 😜', 'I will remind you on schedule — and roast you (nicely) if you skip 😜')}</p>`, ok: L('হ্যাঁ, চালু করো', 'Yes, turn on'), cancel: L('পরে', 'Later'), onOk: () => { A.requestNotif().then(() => refresh()); } }), 600);
    }
  };

  // select/inputs that act on change
  document.addEventListener('change', (e) => {
    const el = e.target; const a = el.dataset && el.dataset.a; if (!a) return;
    if (a === 'remTime') { const r = S().settings.reminders[+el.dataset.i]; if (el.value) { r.time = el.value; A.save(); A.scheduleNativeTriggers(); refresh(); } }
    else if (a === 'missTime') { if (el.value) { S().settings.missTime = el.value; A.save(); } }
    else if (a === 'lbGroup') { U.lbGroup = el.value; refresh(); }
    else if (a === 'efSub') { const ch = $('#ef-ch'); const sub = el.value; ch.innerHTML = `<option value="">${L('— যেকোনো —', '— any —')}</option>` + (sub ? D.SUBJECTS[sub].chapters.map(c => `<option value="${c.n}">${esc(A.chLabel(sub, c.n))}</option>`).join('') : ''); }
  });
  document.addEventListener('input', (e) => { if (e.target.classList && e.target.classList.contains('bad')) e.target.classList.remove('bad'); });

  // click delegation
  let lastTap = 0;
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-a]'); if (!el || el.tagName === 'INPUT' || el.tagName === 'SELECT') return;
    if (el.disabled || el.hasAttribute('disabled')) return;
    const a = el.dataset.a; const fn = ACT[a]; if (!fn) return;
    // guard against accidental double taps on the same action
    const now = Date.now(); if (now - lastTap < 220 && el.dataset.lastA === a) return; lastTap = now; el.dataset.lastA = a;
    e.preventDefault();
    try { fn(el, e); } catch (err) { console.error(err); toast(L('কিছু একটা ভুল হয়েছে', 'Something went wrong'), '⚠️'); }
  });

  // tactile ripple
  const RIP = '.btn,.tap,.chip,.icon-btn,.menu-item,.nav button,.opt,.dchip,.seg button,.quick button,.pick,.fab,.big-play,.collapse-head,.task-body,.sub-card,.chap,.wk-node';
  document.addEventListener('pointerdown', (e) => {
    let el = e.target.closest(RIP); if (!el || el.disabled) return;
    A.sfx.unlock();
    // A row (menu-item/card) that merely CONTAINS a control (toggle, time input, delete button)
    // must not ripple/shrink itself — feedback belongs to the inner control only.
    const inner = e.target.closest('[data-a],button,input,select,textarea,a,label,summary');
    if (inner && inner !== el && el.contains(inner)) {
      if (inner.matches(RIP)) el = inner; else return;
    }
    if (el.matches('input,select,textarea')) return;
    const r = el.getBoundingClientRect(); const size = Math.max(r.width, r.height);
    const s = document.createElement('span'); s.className = 'ripple';
    s.style.width = s.style.height = size + 'px'; s.style.left = (e.clientX - r.left - size / 2) + 'px'; s.style.top = (e.clientY - r.top - size / 2) + 'px';
    // quick ripple hosts (.quick button) put the ripple on the icon tile
    const host = el.matches('.quick button') ? (el.querySelector('.qi') || el) : el;
    if (host !== el) { const hr = host.getBoundingClientRect(); const hs = Math.max(hr.width, hr.height); s.style.width = s.style.height = hs + 'px'; s.style.left = (e.clientX - hr.left - hs / 2) + 'px'; s.style.top = (e.clientY - hr.top - hs / 2) + 'px'; }
    host.appendChild(s); setTimeout(() => s.remove(), 650);
    // guaranteed visible press state even on very fast taps (iOS :active is unreliable)
    el.classList.add('pressed'); const t0 = Date.now();
    const up = () => { setTimeout(() => el.classList.remove('pressed'), Math.max(0, 120 - (Date.now() - t0))); document.removeEventListener('pointerup', up, true); document.removeEventListener('pointercancel', up, true); };
    document.addEventListener('pointerup', up, true); document.addEventListener('pointercancel', up, true);
    setTimeout(() => el.classList.remove('pressed'), 900);
  }, { passive: true });
  document.addEventListener('touchstart', () => {}, { passive: true }); // enables :active on iOS Safari

  /* ------------------------------ extension API (extras.js) ------------------------------ */
  A.ui.ext = { SCREENS, AFTER, ACT, U, topbar, bar, ic, avatar, confirmBox, copy, isStandalone, isIOS, closeModal, renderSheet, subIc, subC, subBg, taskCard, mins, PARENT, TAB_OF };

  /* ------------------------------ Android back button ------------------------------ */
  window.SSC_onBack = function () {
    if (document.querySelector('.celebrate')) { const b = document.querySelector('.celebrate [data-c]'); if (b) b.click(); return true; }
    if (modalEl) { if (modalEl.o.sticky) return true; const o = modalEl.o; closeModal(); if (o.onCancel) o.onCancel(); return true; }
    if (SHEET) { closeSheet(); return true; }
    if (!S().profile) { if (Onb.st && Onb.st.step > 0 && ACT.onbBack) { ACT.onbBack(); return true; } return false; }
    if (route.name === 'home') return false;
    if (TAB_OF[route.name] === route.name) { depth = 0; location.hash = '#home'; return true; }
    back(); return true;
  };

  window.addEventListener('hashchange', () => { if (SHEET) destroySheet(); closeModal(true); render(); });
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); U.deferredInstall = e; if (route.name === 'home') refresh(); });
  window.addEventListener('appinstalled', () => { U.deferredInstall = null; toast(L('অ্যাপ ইনস্টল হয়েছে! 🎉', 'App installed! 🎉'), '📲'); });
})();
