/* ==========================================================================
   SSC 2027 — v1.2
   • Custom weekly plan editor   (#planedit/<week>)
     – change minutes, move a task to another day, re-order, hide / restore
     – add your own tasks (subject, chapters, type, minutes, repeat on days)
     – everything is stored on the phone and merged over the generated plan
       (see App.plan() in core.js) — one tap resets a week or the whole plan
   • Performance mode (auto / smooth / full animations)
   ========================================================================== */
(function () {
  'use strict';
  const A = window.App, D = window.SSC_DATA;
  const X = A.ui.ext;
  const { L, N, esc } = A;
  const S = () => A.S();
  const $ = (s, r = document) => r.querySelector(s);
  const { SCREENS, AFTER, ACT, U, topbar, ic, confirmBox, subIc, subC, subBg, mins } = X;
  const toast = (...a) => A.ui.toast(...a);
  const refresh = () => A.ui.refresh();
  const C = () => A.customState();
  const changed = () => A.customChanged();

  /* =========================================================================
     PERFORMANCE MODE
     auto  → smooth on the Android app, low-memory phones & reduced-motion
     lite  → decorative loops play briefly then rest, no blur/stagger effects
     full  → every animation, always
     ========================================================================= */
  function liteAuto() {
    try {
      if (A.isApp) return true;
      if (navigator.deviceMemory && navigator.deviceMemory <= 4) return true;
      if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) return true;
      if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
    } catch (e) {}
    return false;
  }
  const perfMode = () => (S().settings && S().settings.perf) || 'auto';
  function applyPerf() {
    const m = perfMode();
    const lite = m === 'lite' || (m === 'auto' && liteAuto());
    document.documentElement.classList.toggle('lite', lite);
  }
  A.applyPerf = applyPerf;
  applyPerf();
  // freeze every CSS animation while the app is in the background
  document.addEventListener('visibilitychange', () => document.documentElement.classList.toggle('paused', document.hidden));
  const PERF_LBL = () => ({ auto: L('অটো', 'Auto'), lite: L('স্মুথ (কম অ্যানিমেশন)', 'Smooth (fewer effects)'), full: L('ফুল অ্যানিমেশন', 'Full animations') });
  A.perfLabel = () => PERF_LBL()[perfMode()] + (perfMode() === 'auto' ? (document.documentElement.classList.contains('lite') ? L(' · স্মুথ চালু', ' · smooth on') : L(' · ফুল', ' · full')) : '');
  ACT.perfMode = () => {
    const order = ['auto', 'lite', 'full']; const s = S().settings;
    s.perf = order[(order.indexOf(perfMode()) + 1) % order.length];
    A.save(); applyPerf(); refresh();
    toast(L('পারফরম্যান্স: ', 'Performance: ') + PERF_LBL()[s.perf], '⚡', 1600);
  };

  /* =========================================================================
     HELPERS
     ========================================================================= */
  const P = () => A.plan();
  const B = () => A.basePlan();
  const weekRange = (w) => D.WEEK_RANGES[w - 1];
  const inWeek = (d, w) => { const [s, e] = weekRange(w); return d >= s && d <= e; };
  const isCustomId = (id) => id.indexOf('@') > 0;
  const splitId = (id) => { const i = id.lastIndexOf('@'); return [id.slice(0, i), +id.slice(i + 1)]; };
  const uid = () => 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  const dayLbl = (d) => { const dt = A.dateOfDay(d); return `${A.wd(dt)}, ${A.fmtDate(dt)}`; };
  const taskIcon = (t) => t.sub ? subIc(t.sub) : t.custom ? '📝' : t.kind === 'reflect' ? '🪞' : t.kind === 'errrev' ? '📒' : t.kind === 'buffer' ? '🌿' : '🎯';
  const KIND_CHOICES = () => [['read', '📖', L('পড়া', 'Study')], ['board', '✍️', L('প্র্যাকটিস', 'Practice')], ['revise', '🔁', L('রিভিশন', 'Revise')], ['test', '📝', L('টেস্ট', 'Test')], ['custom', '⭐', L('অন্যান্য', 'Other')]];
  const MIN_Q = [15, 30, 45, 60, 90, 120];

  function weekCustomized(w) {
    const c = C(), b = B(); if (!b) return false;
    const wk = b.weeks[w - 1];
    for (const dd of wk.days) {
      if (c.order[dd.day]) return true;
      for (const id of dd.ids) if (c.hide[id] || c.move[id] || c.min[id]) return true;
    }
    return Object.values(c.items).some(it => (it.days || []).some(d => inWeek(d, w)));
  }
  A.weekCustomized = weekCustomized;
  const anyCustom = () => { const c = C(); return ['items', 'hide', 'move', 'min', 'order'].some(k => Object.keys(c[k]).length); };
  A.planCustomized = anyCustom;

  function migrateDone(fromId, toId) {
    const st = S();
    if (st.tasks[fromId] && fromId !== toId) { st.tasks[toId] = st.tasks[fromId]; delete st.tasks[fromId]; }
    const c = C(); if (c.min[fromId] && fromId !== toId) { c.min[toId] = c.min[fromId]; delete c.min[fromId]; }
  }
  function dropFromOrders(id) { const c = C(); Object.keys(c.order).forEach(d => { const a = c.order[d]; const i = a.indexOf(id); if (i >= 0) { a.splice(i, 1); if (!a.length) delete c.order[d]; } }); }

  function daySelect(cur) {
    let h = '';
    for (let w = 1; w <= 12; w++) {
      const [s, e] = weekRange(w);
      h += `<optgroup label="${esc(L('সপ্তাহ ', 'Week ') + N(w))}">`;
      for (let d = s; d <= e; d++) h += `<option value="${d}" ${d === cur ? 'selected' : ''}>${esc(L('দিন ', 'Day ') + N(d) + ' · ' + dayLbl(d))}</option>`;
      h += '</optgroup>';
    }
    return `<select id="pe-day" class="select">${h}</select>`;
  }
  const minField = (v) => `<div class="field"><label for="pe-min">${L('সময় (মিনিট)', 'Time (minutes)')}</label>
      <div class="row gap-s"><button class="icon-btn" data-a="peMinStep" data-v="-5" aria-label="-5">−</button><input id="pe-min" class="input center" type="number" inputmode="numeric" min="5" max="480" step="5" value="${v}" style="flex:1;font-weight:700;font-size:18px"><button class="icon-btn" data-a="peMinStep" data-v="5" aria-label="+5">+</button></div>
      <div class="chips-wrap mt-s">${MIN_Q.map(m => `<button class="chip ${+v === m ? 'on' : ''}" data-a="peMinQ" data-v="${m}">${mins(m)}</button>`).join('')}</div></div>`;
  const readMin = () => { const v = Math.round(+($('#pe-min') || {}).value || 0); return Math.max(5, Math.min(480, v || 30)); };

  /* =========================================================================
     SCREEN
     ========================================================================= */
  U.peWeek = U.peWeek || 0;
  function tabsHtml(on) {
    return `<div class="seg full mt-s" role="tablist"><button class="${on === 'roadmap' ? 'on' : ''}" data-a="${on === 'roadmap' ? 'noop' : 'peTab'}" data-to="roadmap" role="tab">🗺️ ${L('রোডম্যাপ', 'Roadmap')}</button><button class="${on === 'planedit' ? 'on' : ''}" data-a="${on === 'planedit' ? 'noop' : 'peTab'}" data-to="planedit" role="tab">✏️ ${L('কাস্টম প্ল্যান', 'Custom plan')}${anyCustom() ? ' <i class="pe-dot"></i>' : ''}</button></div>`;
  }
  A.peTabs = tabsHtml;
  ACT.noop = () => {};
  ACT.peTab = (el) => { const to = el.dataset.to; location.replace('#' + to); };

  SCREENS.planedit = function (arg) {
    if (!S().profile) return '';
    const cw = A.weekOfDay(A.currentDay());
    let w = +arg || U.peWeek || cw; if (!(w >= 1 && w <= 12)) w = cw; U.peWeek = w;
    const p = P(), b = B(), c = C(), wk = p.weeks[w - 1];
    const [s, e] = weekRange(w);
    const all = wk.days.flatMap(dd => dd.ids.map(id => p.tasks[id]));
    const totalMin = all.reduce((a, t) => a + t.min, 0);
    const own = all.filter(t => t.custom).length;
    const hidden = b.weeks[w - 1].days.flatMap(dd => dd.ids).filter(id => c.hide[id]).map(id => b.tasks[id]);
    const custom = weekCustomized(w);
    const un = A.weekUnlocked(w);

    const weekChips = Array.from({ length: 12 }, (_, i) => i + 1).map(n => `<button class="chip ${n === w ? 'on' : ''}" data-a="peWeek" data-w="${n}">${L('সপ্তাহ ', 'W')}${N(n)}${n === cw ? ' 📍' : ''}${weekCustomized(n) ? ' <i class="pe-dot"></i>' : ''}</button>`).join('');

    const days = wk.days.map((dd, di) => {
      const list = dd.ids.map(id => p.tasks[id]);
      const m = list.reduce((a, t) => a + t.min, 0);
      const isReview = di === wk.days.length - 1;
      const load = m > 360 ? `<span class="tag peach">${L('অনেক চাপ!', 'Heavy!')}</span>` : !list.length ? `<span class="tag mint">${L('ফাঁকা', 'Free')}</span>` : '';
      const rows = list.map((t, i) => {
        const done = A.isDone(t.id);
        const mod = t.wr ? `<span class="tag yellow">✍️ ${L('তালিকা', 'List')}</span>` : t.kind === 'write' ? `<span class="tag peach">✍️ ${L('তালিকা দাও', 'Add list')}</span>` : t.custom ? `<span class="tag lav">✏️ ${L('নিজের', 'Mine')}</span>` : (t.moved || c.min[t.id]) ? `<span class="tag lav">✏️ ${L('বদলানো', 'Edited')}</span>` : '';
        return `<div class="pe-row ${done ? 'done' : ''}">
          <span class="pe-ic" style="background:${subBg(t.sub)};color:${subC(t.sub)}">${taskIcon(t)}</span>
          <button class="pe-main" data-a="peTask" data-id="${esc(t.id)}">
            <span class="bold small ellipsis" style="display:block">${done ? '✓ ' : ''}${esc(A.taskTitle(t))}</span>
            <span class="tiny muted ellipsis" style="display:block">${esc(A.taskSubtitle(t))}</span>
            <span class="row gap-s" style="margin-top:4px;flex-wrap:wrap"><span class="tag gray">⏱ ${mins(t.min)}</span>${mod}</span>
          </button>
          <span class="pe-move">
            <button class="icon-btn sm" data-a="peUp" data-id="${esc(t.id)}" data-day="${dd.day}" ${i === 0 ? 'disabled' : ''} aria-label="${L('উপরে', 'Up')}">${ic('chevR', 'xs')}</button>
            <button class="icon-btn sm dn" data-a="peDown" data-id="${esc(t.id)}" data-day="${dd.day}" ${i === list.length - 1 ? 'disabled' : ''} aria-label="${L('নিচে', 'Down')}">${ic('chevR', 'xs')}</button>
          </span>
        </div>`;
      }).join('');
      return `<div class="card tight pe-day ${dd.day === A.rawDay() ? 'today' : ''}">
        <div class="row between">
          <div class="grow"><div class="bold">${esc(dayLbl(dd.day))} ${dd.day === A.rawDay() ? `<span class="tag yellow">${L('আজ', 'Today')}</span>` : ''} ${isReview ? `<span class="tag gray">${L('রিভিউ ডে', 'Review day')}</span>` : ''}</div>
          <div class="tiny muted">${L('দিন ', 'Day ')}${N(dd.day)} · ${N(list.length)}${L('টি কাজ', ' tasks')} · ${mins(m)} ${load}</div></div>
          <button class="btn xs ghost" data-a="peAdd" data-day="${dd.day}">${ic('plus', 'xs')} ${L('কাজ', 'Task')}</button>
        </div>
        ${rows || `<div class="tiny muted" style="padding:10px 2px 2px">${L('এই দিনে কোনো কাজ নেই — বিশ্রাম বা নিজের কাজ যোগ করো 🌿', 'No tasks — rest or add your own 🌿')}</div>`}
      </div>`;
    }).join('');

    return `${topbar(L('কাস্টম প্ল্যান', 'Custom plan'), `${L('সপ্তাহ ', 'Week ')}${N(w)} · ${A.fmtDate(A.dateOfDay(s))} – ${A.fmtDate(A.dateOfDay(e))}`)}
      ${tabsHtml('planedit')}
      <div class="chips mt">${weekChips}</div>
      ${writingCard()}
      <div class="card lav tight mt-s small">💡 ${L('যেকোনো কাজে ট্যাপ করে সময় বদলাও, অন্য দিনে সরাও বা লুকাও। “+ কাজ” দিয়ে নিজের কাজ যোগ করো। মূল প্ল্যান সবসময় নিরাপদ — চাইলে এক ট্যাপে আগের মতো করা যাবে।', 'Tap any task to change its time, move it to another day or hide it. Use “+ Task” to add your own. The original plan is always safe — reset anytime.')}</div>
      <div class="card mt-s">
        <div class="eyebrow">${esc(L(wk.goal || '', wk.goalEn || wk.goal || ''))}</div>
        <div class="split-stats" style="margin-top:8px"><div><b>${N(all.length)}</b><span>${L('মোট কাজ', 'Tasks')}</span></div><div><b>${mins(totalMin)}</b><span>${L('মোট সময়', 'Total time')}</span></div><div><b style="color:var(--lav-600)">${N(own)}</b><span>${L('নিজের কাজ', 'My tasks')}</span></div></div>
        ${!un ? `<div class="banner warn mt-s">${ic('lock', 'sm')}<span>${L('এই সপ্তাহ এখনো লক — তবে আগে থেকেই প্ল্যান সাজিয়ে রাখতে পারো।', 'This week is still locked — but you can plan it ahead.')}</span></div>` : ''}
        ${custom ? `<button class="btn outline block sm mt-s" data-a="peResetWeek" data-w="${w}">↺ ${L('এই সপ্তাহ আগের মতো করো', 'Reset this week')}</button>` : ''}
      </div>
      ${days}
      ${hidden.length ? `<button class="collapse-head mt ${U.peHidden ? 'open' : ''}" data-a="peHiddenToggle"><span>🙈 ${L('লুকানো কাজ', 'Hidden tasks')} (${N(hidden.length)})</span>${ic('chevR', 'sm')}</button>
        ${U.peHidden ? `<div class="card tight">${hidden.map(t => `<div class="pe-row"><span class="pe-ic" style="background:${subBg(t.sub)};color:${subC(t.sub)}">${taskIcon(t)}</span><span class="grow" style="min-width:0"><span class="bold small ellipsis" style="display:block">${esc(A.taskTitle(t))}</span><span class="tiny muted ellipsis" style="display:block">${L('দিন ', 'Day ')}${N(t.day)} · ${esc(A.taskSubtitle(t))}</span></span><button class="btn xs mint" data-a="peUnhide" data-id="${esc(t.id)}">${L('ফিরিয়ে আনো', 'Restore')}</button></div>`).join('')}</div>` : ''}` : ''}
      ${anyCustom() ? `<button class="btn ghost block mt-l" data-a="peResetAll" style="color:#D23C3C">🗑️ ${L('পুরো প্ল্যান রিসেট করো', 'Reset the whole plan')}</button>` : ''}
      <p class="tiny muted center mt">${L('কাস্টম প্ল্যান শুধু তোমার ফোনে সেভ থাকে।', 'Your custom plan is saved only on this phone.')}</p>
      <div style="height:24px"></div>`;
  };
  AFTER.planedit = () => {
    const on = document.querySelector('.chips .chip.on'); if (on && on.scrollIntoView) { try { on.scrollIntoView({ block: 'nearest', inline: 'center' }); } catch (e) {} }
  };

  /* =========================================================================
     SHEETS
     ========================================================================= */
  // Edit an engine-generated task
  function taskSheet(id) {
    const p = P(), c = C();
    const t = p.tasks[id];
    if (!t) return { head: '<div class="grow h3">—</div>', body: '' };
    const base = B().tasks[id] || (t.wr ? { day: t.baseDay, min: t.baseMin } : null);
    const modified = c.move[id] || c.min[id];
    const done = A.isDone(id);
    return {
      head: `<div class="pe-ic lg" style="background:${subBg(t.sub)};color:${subC(t.sub)}">${taskIcon(t)}</div><div class="grow"><div class="eyebrow">${L('দিন ', 'Day ')}${N(t.day)} · ${L('সপ্তাহ ', 'Week ')}${N(t.w)}</div><div class="h3">${esc(A.taskTitle(t))}</div></div>`,
      body: `<p class="small" style="color:var(--ink-2)">${esc(A.taskSubtitle(t))}</p>
        ${done ? `<div class="banner ok mt-s">✓ ${L('এই কাজ সম্পন্ন হয়েছে', 'This task is done')}</div>` : ''}
        <div class="mt">${minField(t.min)}</div>
        <div class="field"><label for="pe-day">${L('কোন দিনে করবে?', 'Which day?')}</label>${daySelect(t.day)}
          ${base && base.day !== t.day ? `<span class="hint">${L('মূল প্ল্যানে ছিল: দিন ', 'Originally: Day ')}${N(base.day)}</span>` : ''}</div>
        <button class="btn primary block mt" data-a="peSaveTask" data-id="${esc(id)}">✓ ${L('সংরক্ষণ করো', 'Save')}</button>
        ${t.kind === 'write' ? `<button class="btn ghost block mt-s" data-a="wrOpen" data-k="${t.sub}:${t.chs[0]}">✍️ ${t.wr ? L('রাইটিং তালিকা এডিট করো', 'Edit writing list') : L('নিজের তালিকা দাও (নামগুলো লেখো)', 'Add your own list')}</button>` : ''}
        <div class="row mt-s">
          ${t.wr ? '' : `<button class="btn outline grow sm" data-a="peHide" data-id="${esc(id)}">🙈 ${L('লুকাও', 'Hide')}</button>`}
          ${modified ? `<button class="btn ghost grow sm" data-a="peResetTask" data-id="${esc(id)}">↺ ${L('আগের মতো', 'Original')}</button>` : ''}
        </div>
        <p class="tiny muted mt-s">${L('লুকানো কাজ নিচের “লুকানো কাজ” থেকে যেকোনো সময় ফিরিয়ে আনা যাবে।', 'Hidden tasks can be restored anytime from “Hidden tasks”.')}</p>
        <div style="height:6px"></div>`
    };
  }

  // Add / edit your own task
  function chapterChips(sub, sel) {
    if (!sub || !D.SUBJECTS[sub]) return `<span class="tiny muted">${L('বিষয় বেছে নিলে অধ্যায় দেখাবে', 'Pick a subject to see chapters')}</span>`;
    return D.SUBJECTS[sub].chapters.map(ch => `<button class="chip ${sel.includes(ch.n) ? 'on' : ''}" data-a="peCh" data-n="${ch.n}" title="${esc(A.chLabel(sub, ch.n))}">${D.SUBJECTS[sub].unit === 'item' ? esc(ch.t.length > 22 ? ch.t.slice(0, 21) + '…' : ch.t) : N(ch.n)}</button>`).join('');
  }
  function formSheet(o) {
    // o = { day, cid?, inst? }
    const c = C(); const it = o.cid ? c.items[o.cid] : null;
    const st = S(); const G = D.GROUPS[st.profile.group];
    const v = it || { title: '', sub: '', chs: [], kind: 'read', min: 45, note: '', days: [o.day] };
    const w = A.weekOfDay(o.inst || o.day);
    const [s, e] = weekRange(w);
    const days = [];
    for (let d = s; d <= e; d++) days.push(d);
    const curMin = o.inst && c.min[o.cid + '@' + o.inst] ? c.min[o.cid + '@' + o.inst] : v.min;
    return {
      head: `<div class="grow"><div class="h2">${it ? L('নিজের কাজ এডিট', 'Edit my task') : L('নতুন কাজ যোগ করো', 'Add a task')}</div><div class="tiny muted">${L('সপ্তাহ ', 'Week ')}${N(w)} · ${L('তোমার মতো করে প্ল্যান সাজাও ✨', 'Plan it your way ✨')}</div></div>`,
      body: `
        <div class="field"><label for="pe-title">${L('কাজের নাম', 'Task name')}</label><input id="pe-title" class="input" maxlength="80" value="${esc(v.title)}" placeholder="${L('যেমন: সূত্র লিখে মুখস্থ, কোচিং হোমওয়ার্ক…', 'e.g. Formula revision, coaching homework…')}"><span class="err" id="pe-err"></span></div>
        <div class="field"><label for="pe-sub">${L('বিষয় (ঐচ্ছিক)', 'Subject (optional)')}</label><select id="pe-sub" class="select" data-a="peSub"><option value="">${L('— সাধারণ কাজ —', '— general —')}</option>${G.subjects.map(k => `<option value="${k}" ${v.sub === k ? 'selected' : ''}>${esc(A.subName(k))}</option>`).join('')}</select></div>
        <div class="field"><label>${L('অধ্যায় (ঐচ্ছিক, একাধিক)', 'Chapters (optional, multiple)')}</label><div class="chips-wrap" id="pe-chs">${chapterChips(v.sub, v.chs || [])}</div></div>
        <div class="field"><label>${L('ধরন', 'Type')}</label><div class="chips-wrap" id="pe-kind">${KIND_CHOICES().map(([k, em, t]) => `<button class="chip ${v.kind === k ? 'on' : ''}" data-a="peKind" data-k="${k}">${em} ${t}</button>`).join('')}</div>
          <span class="hint">${L('অধ্যায়সহ “পড়া/প্র্যাকটিস/টেস্ট/রিভিশন” শেষ করলে মাস্টারির ধাপও টিক হবে।', 'With chapters, finishing Study/Practice/Test/Revise also ticks the mastery step.')}</span></div>
        ${minField(curMin)}
        <div class="field"><label>${o.inst ? L('দিন বদলাও', 'Change day') : L('কোন কোন দিনে? (একাধিক বেছে নিতে পারো)', 'Which days? (pick several to repeat)')}</label>
          <div class="chips-wrap" id="pe-days">${days.map(d => { const on = o.inst ? d === o.inst : (v.days || []).includes(d); return `<button class="chip ${on ? 'on' : ''}" data-a="${o.inst ? 'peDayOne' : 'peDayToggle'}" data-d="${d}">${esc(A.wd(A.dateOfDay(d)))} ${N(A.dateOfDay(d).getDate())}</button>`; }).join('')}</div></div>
        <div class="field"><label for="pe-note">${L('নোট (ঐচ্ছিক)', 'Note (optional)')}</label><input id="pe-note" class="input" maxlength="120" value="${esc(v.note || '')}" placeholder="${L('যেমন: পৃষ্ঠা ৪০–৫৫', 'e.g. pages 40–55')}"></div>
        <button class="btn primary block mt" data-a="peSaveItem" data-cid="${o.cid || ''}" data-inst="${o.inst || ''}">${it ? L('✓ সংরক্ষণ করো', '✓ Save') : L('+ প্ল্যানে যোগ করো', '+ Add to plan')}</button>
        ${it ? `<div class="row mt-s"><button class="btn outline grow sm" data-a="peDelInst" data-cid="${o.cid}" data-inst="${o.inst}" style="color:#D23C3C">🗑️ ${L('এই দিন থেকে মুছো', 'Delete this day')}</button>${(it.days || []).length > 1 ? `<button class="btn ghost grow sm" data-a="peDelItem" data-cid="${o.cid}" style="color:#D23C3C">${L('সব দিন থেকে মুছো', 'Delete all days')}</button>` : ''}</div>` : ''}
        <div style="height:8px"></div>`
    };
  }

  // DOM-only interactions inside the form (no re-render → typed values stay)
  document.addEventListener('change', (e) => {
    const el = e.target; if (!el.dataset || el.dataset.a !== 'peSub') return;
    const box = $('#pe-chs'); if (box) box.innerHTML = chapterChips(el.value, []);
  });

  /* =========================================================================
     ACTIONS
     ========================================================================= */
  const reopenTask = (id) => A.ui.openSheet(() => taskSheet(id));
  Object.assign(ACT, {
    peWeek: (el) => { U.peWeek = +el.dataset.w; U.peHidden = false; location.replace('#planedit/' + U.peWeek); },
    peHiddenToggle: () => { U.peHidden = !U.peHidden; refresh(); },
    peFromTask: (el) => {
      const id = el.dataset.id; const t = P().tasks[id]; if (!t) return;
      A.ui.closeSheet().then(() => { U.peWeek = t.w; A.go('planedit', t.w); setTimeout(() => ACT.peTask({ dataset: { id } }), 380); });
    },
    peTask: (el) => {
      const id = el.dataset.id; const t = P().tasks[id]; if (!t) return;
      if (t.custom) { const [cid, d] = splitId(id); A.ui.openSheet(() => formSheet({ day: d, cid, inst: d })); }
      else reopenTask(id);
    },
    peAdd: (el) => A.ui.openSheet(() => formSheet({ day: +el.dataset.day })),
    peMinQ: (el) => { const i = $('#pe-min'); if (i) i.value = el.dataset.v; el.parentNode.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c === el)); },
    peMinStep: (el) => { const i = $('#pe-min'); if (!i) return; const v = Math.max(5, Math.min(480, (+i.value || 0) + (+el.dataset.v))); i.value = v; i.parentNode.parentNode.querySelectorAll('.chips-wrap .chip').forEach(c => c.classList.toggle('on', +c.dataset.v === v)); },
    peCh: (el) => el.classList.toggle('on'),
    peKind: (el) => el.parentNode.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c === el)),
    peDayToggle: (el) => el.classList.toggle('on'),
    peDayOne: (el) => el.parentNode.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c === el)),

    peSaveTask: (el) => {
      const id = el.dataset.id; const c = C(); const cur = P().tasks[id];
      const b = B().tasks[id] || (cur && cur.wr ? { day: cur.baseDay, min: cur.baseMin } : null); if (!b) return;
      const m = readMin(); const d = +($('#pe-day') || {}).value || b.day;
      if (m === b.min) delete c.min[id]; else c.min[id] = m;
      const prevDay = P().tasks[id] ? P().tasks[id].day : b.day;
      if (d === b.day) delete c.move[id]; else c.move[id] = d;
      if (d !== prevDay) dropFromOrders(id);
      changed(); A.haptic(10);
      A.ui.closeSheet().then(refresh);
      toast(d !== prevDay ? L('কাজটা দিন ', 'Moved to Day ') + N(d) + L('-এ সরানো হলো 📦', ' 📦') : L('সংরক্ষণ হয়েছে ✓', 'Saved ✓'), '✏️', 1600);
    },
    peHide: (el) => {
      const id = el.dataset.id; const c = C(); c.hide[id] = 1; dropFromOrders(id); changed();
      A.ui.closeSheet().then(refresh);
      toast(L('কাজটা লুকানো হলো — নিচে “লুকানো কাজ” থেকে ফেরানো যাবে', 'Hidden — restore it from “Hidden tasks”'), '🙈', 2200);
    },
    peUnhide: (el) => { const c = C(); delete c.hide[el.dataset.id]; changed(); refresh(); toast(L('ফিরিয়ে আনা হলো ✓', 'Restored ✓'), '✨', 1400); },
    peResetTask: (el) => { const id = el.dataset.id; const c = C(); delete c.move[id]; delete c.min[id]; dropFromOrders(id); changed(); A.ui.closeSheet().then(refresh); toast(L('আগের মতো করা হলো', 'Back to original'), '↺', 1400); },

    peUp: (el) => reorder(el, -1),
    peDown: (el) => reorder(el, 1),

    peSaveItem: (el) => {
      const c = C(); const cid0 = el.dataset.cid; const inst = +el.dataset.inst || 0;
      const title = (($('#pe-title') || {}).value || '').trim().slice(0, 80);
      const sub = ($('#pe-sub') || {}).value || '';
      const chs = [...document.querySelectorAll('#pe-chs .chip.on')].map(x => +x.dataset.n).sort((a, b) => a - b);
      const kindEl = $('#pe-kind .chip.on'); const kind = kindEl ? kindEl.dataset.k : 'custom';
      const note = (($('#pe-note') || {}).value || '').trim().slice(0, 120);
      const min = readMin();
      const pick = [...document.querySelectorAll('#pe-days .chip.on')].map(x => +x.dataset.d);
      const err = $('#pe-err');
      if (!title && !sub) { if (err) err.textContent = L('কাজের নাম লিখো বা একটা বিষয় বেছে নাও', 'Write a name or pick a subject'); const t = $('#pe-title'); if (t) { t.classList.add('bad'); t.focus(); } return; }
      if (!pick.length) { toast(L('অন্তত একটা দিন বেছে নাও', 'Pick at least one day'), '📅'); return; }
      if (cid0 && c.items[cid0]) {
        const it = c.items[cid0];
        Object.assign(it, { title, sub, chs, kind, note });
        if (inst) {
          const nd = pick[0];
          if (c.min[cid0 + '@' + inst] || it.days.length > 1) c.min[cid0 + '@' + inst] = min; else it.min = min;
          if (nd !== inst) {
            if (it.days.includes(nd)) { toast(L('ওই দিনে এই কাজ আগে থেকেই আছে', 'Already on that day'), '📅'); return; }
            it.days = it.days.map(d => d === inst ? nd : d);
            migrateDone(cid0 + '@' + inst, cid0 + '@' + nd); dropFromOrders(cid0 + '@' + inst);
          }
          if (it.days.length === 1) { it.min = min; delete c.min[cid0 + '@' + it.days[0]]; }
        }
      } else {
        const id = uid();
        c.items[id] = { id, title, sub, chs, kind, min, note, days: pick.sort((a, b) => a - b), at: Date.now() };
      }
      changed(); A.haptic(12); A.sfx.play('tick');
      A.ui.closeSheet().then(refresh);
      toast(cid0 ? L('সংরক্ষণ হয়েছে ✓', 'Saved ✓') : L(`${N(pick.length)}টি দিনে কাজ যোগ হলো 📝`, `Added to ${pick.length} day(s) 📝`), '✨', 1800);
    },
    peDelInst: async (el) => {
      const c = C(); const cid = el.dataset.cid; const inst = +el.dataset.inst; const it = c.items[cid]; if (!it) return;
      const id = cid + '@' + inst;
      if (A.isDone(id)) A.undoTask(id);
      it.days = it.days.filter(d => d !== inst); delete c.min[id]; dropFromOrders(id);
      if (!it.days.length) delete c.items[cid];
      changed(); A.ui.closeSheet().then(refresh); toast(L('মুছে ফেলা হলো', 'Deleted'), '🗑️', 1400);
    },
    peDelItem: async (el) => {
      const c = C(); const cid = el.dataset.cid; const it = c.items[cid]; if (!it) return;
      await A.ui.closeSheet();
      if (!(await confirmBox(L('সব দিন থেকে মুছবে?', 'Delete from all days?'), L(`“${esc(it.title || A.subName(it.sub))}” ${N(it.days.length)}টি দিন থেকে মুছে যাবে।`, `“${esc(it.title || A.subName(it.sub))}” will be removed from ${it.days.length} days.`), L('মুছে ফেলো', 'Delete'), true))) return;
      it.days.forEach(d => { const id = cid + '@' + d; if (A.isDone(id)) A.undoTask(id); delete c.min[id]; dropFromOrders(id); });
      delete c.items[cid]; changed(); refresh();
    },
    peResetWeek: async (el) => {
      const w = +el.dataset.w;
      if (!(await confirmBox(L(`সপ্তাহ ${N(w)} আগের মতো করবে?`, `Reset week ${w}?`), L('এই সপ্তাহের সব পরিবর্তন ও নিজের কাজ মুছে মূল প্ল্যানে ফিরবে। সম্পন্ন কাজের XP থাকবে।', 'All edits and your own tasks in this week will be removed. XP you earned stays.'), L('রিসেট করো', 'Reset'), true))) return;
      const c = C(), b = B(); const [s, e] = weekRange(w);
      b.weeks[w - 1].days.forEach(dd => dd.ids.forEach(id => { delete c.hide[id]; delete c.move[id]; delete c.min[id]; }));
      // tasks from other weeks that were moved INTO this week go back home too
      Object.keys(c.move).forEach(id => { if (inWeek(+c.move[id], w)) delete c.move[id]; });
      Object.values(c.items).forEach(it => { it.days.filter(d => d >= s && d <= e).forEach(d => delete c.min[it.id + '@' + d]); it.days = it.days.filter(d => d < s || d > e); if (!it.days.length) delete c.items[it.id]; });
      for (let d = s; d <= e; d++) delete c.order[d];
      changed(); refresh(); toast(L('সপ্তাহ আগের মতো করা হলো ↺', 'Week reset ↺'), '↺', 1600);
    },
    peResetAll: async () => {
      if (!(await confirmBox(L('পুরো প্ল্যান রিসেট?', 'Reset the whole plan?'), L('সব সপ্তাহের পরিবর্তন ও নিজের কাজ মুছে যাবে। অর্জিত XP ও সম্পন্ন কাজের রেকর্ড থাকবে।', 'Every edit and custom task will be removed. Your XP and completed records stay.'), L('সব রিসেট করো', 'Reset all'), true))) return;
      const c = C(); ['items', 'hide', 'move', 'min', 'order'].forEach(k => { c[k] = {}; });
      changed(); refresh(); toast(L('মূল প্ল্যানে ফিরে গেছো', 'Back to the original plan'), '↺', 1600);
    }
  });

  /* =========================================================================
     WRITING LISTS — Bangla & English writing parts (#writing)
     Students type the names of the paragraphs / essays / letters / stories they
     will learn; App.plan() spreads them over the chosen weeks.
     ========================================================================= */
  X.PARENT.writing = 'planedit'; X.TAB_OF.writing = 'roadmap';
  const MAX_ITEMS = 30;
  const WR = () => C().writing;
  const wrSubs = () => Object.keys(D.WRITING).filter(sb => (D.GROUPS[S().profile.group].subjects || []).includes(sb));
  const catName = (k) => { const [sb, n] = k.split(':'); const ch = A.chapter(sb, +n); return ch ? ch.t : k; };
  const meta = (k) => D.WRITE_META[k] || { min: 30, ex: [] };
  function wrStats(k) {
    const cat = WR()[k]; const items = cat && cat.items ? cat.items : [];
    const done = items.filter(it => A.isDone('wr-' + it.id)).length;
    return { n: items.length, done, from: cat ? cat.from : 0, to: cat ? cat.to : 0 };
  }
  A.wrStats = wrStats;
  function writingCard() {
    const keys = []; wrSubs().forEach(sb => D.WRITING[sb].forEach(n => keys.push(sb + ':' + n)));
    const filled = keys.filter(k => wrStats(k).n).length;
    return `<button class="card tight mt-s wr-cta tap" data-a="go" data-to="writing">
      <span class="wr-cta-ic">✍️</span>
      <span class="grow" style="min-width:0;text-align:left"><span class="bold" style="display:block">${L('বাংলা ও ইংরেজি রাইটিং তালিকা', 'Bangla & English writing lists')}</span>
      <span class="tiny muted" style="display:block">${filled ? L(`${N(filled)}/${N(keys.length)}টি অংশে তালিকা দেওয়া আছে`, `${filled}/${keys.length} parts have a list`) : L('অনুচ্ছেদ, রচনা, দরখাস্ত, Paragraph, Story… নিজের নামগুলো দাও', 'Paragraphs, essays, letters, stories… add your own names')}</span></span>
      ${ic('chevR', 'sm')}</button>`;
  }
  A.writingCard = writingCard;

  SCREENS.writing = function () {
    if (!S().profile) return '';
    const cw = A.weekOfDay(A.currentDay());
    const groups = wrSubs().map(sb => {
      const rows = D.WRITING[sb].map(n => {
        const k = sb + ':' + n; const st = wrStats(k);
        const sub = st.n ? `${N(st.n)}${L('টি', '')} · ${N(st.done)} ${L('শেষ', 'done')} · ${L('সপ্তাহ ', 'Wk ')}${N(st.from)}–${N(st.to)}` : L('এখনো তালিকা দেওয়া হয়নি — ট্যাপ করে নাম লেখো', 'No list yet — tap to add names');
        return `<button class="menu-item" data-a="wrOpen" data-k="${k}">
          <span class="mi" style="background:${subBg(sb)};color:${subC(sb)}">${st.n ? '📝' : '✍️'}</span>
          <span class="grow" style="min-width:0"><span class="bold small" style="display:block">${esc(catName(k))}</span>
          <span class="tiny ${st.n ? 'muted' : ''}" style="display:block;${st.n ? '' : 'color:var(--peach-600)'}">${sub}</span>
          ${st.n ? `<span class="wr-bar"><i style="width:${Math.round(st.done / st.n * 100)}%;background:${subC(sb)}"></i></span>` : ''}</span>
          ${ic('chevR', 'sm')}</button>`;
      }).join('');
      return `<div class="section-title"><h3>${esc(A.subName(sb))}</h3><span class="tag gray">${L('রাইটিং', 'Writing')}</span></div><div class="menu">${rows}</div>`;
    }).join('');
    return `${topbar(L('রাইটিং তালিকা', 'Writing lists'), L('বাংলা ও ইংরেজির লেখার অংশ নিজের মতো সাজাও', 'Plan your Bangla & English writing'))}
      <div class="card peach tight small mt-s">✍️ ${L('যে অনুচ্ছেদ, রচনা, দরখাস্ত, Paragraph, Story ইত্যাদি শিখবে সেগুলোর নাম দাও। অ্যাপ সেগুলো তোমার বেছে নেওয়া সপ্তাহগুলোতে ভাগ করে প্ল্যানে বসিয়ে দেবে। MCQ, ব্যাকরণ আর পাঠ্যবইয়ের অংশ আগের মতোই প্ল্যানে থাকবে।', 'Type the paragraphs, essays, letters, stories… you will learn. The app spreads them over the weeks you pick. MCQ, grammar and textbook parts stay in the plan as before.')}</div>
      ${groups}
      <p class="tiny muted center mt">${L('এখন সপ্তাহ ', 'Current week ')}${N(cw)} · ${L('তালিকা শুধু তোমার ফোনে সেভ থাকে', 'Saved only on this phone')}</p>
      <div style="height:24px"></div>`;
  };

  function wrSheet(k) {
    const cat = WR()[k]; const m = meta(k); const [sb] = k.split(':');
    const cw = A.weekOfDay(A.currentDay());
    const from = cat ? cat.from : Math.min(cw, 11), to = cat ? cat.to : Math.max(Math.min(cw, 11), 11);
    const min = cat ? cat.min : m.min;
    const items = cat ? cat.items : [];
    const done = items.filter(it => A.isDone('wr-' + it.id)).length;
    const text = items.map(it => it.t).join('\n');
    const opt = (sel) => Array.from({ length: 12 }, (_, i) => i + 1).map(w => { const [s0, e0] = D.WEEK_RANGES[w - 1]; return `<option value="${w}" ${w === sel ? 'selected' : ''}>${L('সপ্তাহ ', 'Week ')}${N(w)}${w === cw ? ' 📍' : ''}</option>`; }).join('');
    const isEn = sb[0] === 'e';
    return {
      head: `<div class="pe-ic lg" style="background:${subBg(sb)};color:${subC(sb)}">✍️</div><div class="grow"><div class="eyebrow">${esc(A.subName(sb))}</div><div class="h3">${esc(catName(k))}</div></div>`,
      body: `
        <div class="field"><label for="wr-list">${L('কোনগুলো শিখবে? প্রতি লাইনে একটা নাম', 'What will you learn? One name per line')}</label>
          <textarea id="wr-list" class="input" rows="7" style="min-height:160px;line-height:1.6" placeholder="${isEn ? 'e.g.\nTraffic Jam\nMobile Phone\nTree Plantation' : 'যেমন:\nবিজয় দিবস\nবৃক্ষরোপণ\nডিজিটাল বাংলাদেশ'}">${esc(text)}</textarea>
          <span class="hint" id="wr-count">${L('সর্বোচ্চ ', 'Max ')}${N(MAX_ITEMS)}${L('টি', '')}</span></div>
        ${m.ex && m.ex.length ? `<div class="field"><label>${L('জনপ্রিয় টপিক — ট্যাপ করলে তালিকায় যোগ হবে', 'Popular topics — tap to add')}</label><div class="chips-wrap" id="wr-sug">${m.ex.map(x => `<button class="chip ${items.some(it => it.t.toLowerCase() === x.toLowerCase()) ? 'on' : ''}" data-a="wrSug" data-t="${esc(x)}">${esc(x)}</button>`).join('')}</div></div>` : ''}
        <div class="field"><label>${L('কোন সপ্তাহগুলোতে ভাগ হবে?', 'Spread over which weeks?')}</label>
          <div class="row gap-s"><select id="wr-from" class="select" style="flex:1">${opt(from)}</select><span class="muted">→</span><select id="wr-to" class="select" style="flex:1">${opt(to)}</select></div></div>
        <div class="field"><label>${L('প্রতিটার জন্য সময়', 'Time for each')}</label><div class="chips-wrap" id="wr-min">${[15, 20, 25, 30, 40, 45, 60].map(v => `<button class="chip ${v === +min ? 'on' : ''}" data-a="wrMin" data-v="${v}">${mins(v)}</button>`).join('')}</div></div>
        <div class="banner info mt" id="wr-prev"></div>
        ${items.length ? `<p class="tiny muted mt-s">✅ ${L('শেষ করেছ: ', 'Done: ')}${N(done)}/${N(items.length)} · ${L('নাম না বদলালে সম্পন্ন অবস্থা থেকে যাবে।', 'Unchanged names keep their done status.')}</p>` : ''}
        <button class="btn primary block mt" data-a="wrSave" data-k="${k}">${items.length ? L('✓ তালিকা আপডেট করো', '✓ Update list') : L('✓ প্ল্যানে বসিয়ে দাও', '✓ Add to my plan')}</button>
        ${items.length ? `<button class="btn ghost block mt-s" data-a="wrClear" data-k="${k}" style="color:#D23C3C">🗑️ ${L('তালিকা মুছে ফেলো', 'Remove this list')}</button>` : ''}
        <div style="height:8px"></div>`
    };
  }
  const parseList = () => {
    const raw = (($('#wr-list') || {}).value || '').split(/\n|;/).map(x => x.replace(/^\s*(?:[-•*]|\d+[.)])\s*/, '').trim().slice(0, 90)).filter(Boolean);
    const out = []; const seen = {};
    raw.forEach(x => { const key = x.toLowerCase(); if (!seen[key]) { seen[key] = 1; out.push(x); } });
    return out;
  };
  function wrPreview() {
    const box = $('#wr-prev'); if (!box) return;
    const n = parseList().length; const f = +($('#wr-from') || {}).value || 1, t = +($('#wr-to') || {}).value || 1;
    const cnt = $('#wr-count');
    if (cnt) { cnt.textContent = L(`${N(n)}টি নাম · সর্বোচ্চ ${N(MAX_ITEMS)}টি`, `${n} names · max ${MAX_ITEMS}`); cnt.style.color = n > MAX_ITEMS ? '#D23C3C' : ''; }
    if (t < f) { box.className = 'banner warn mt'; box.textContent = L('শেষ সপ্তাহ শুরুর সপ্তাহের আগে হতে পারবে না', 'End week can’t be before the start week'); return; }
    if (!n) { box.className = 'banner info mt'; box.textContent = L('নাম লিখলে এখানে দেখাবে প্রতি সপ্তাহে কয়টা করে পড়বে।', 'Type names to see how many per week.'); return; }
    const w = t - f + 1; const per = n / w;
    box.className = 'banner ' + (per > 5 ? 'warn' : 'ok') + ' mt';
    box.textContent = per >= 1
      ? L(`${N(n)}টি লেখা ${N(w)} সপ্তাহে ভাগ হবে — সপ্তাহে প্রায় ${N(Math.ceil(per))}টি করে।`, `${n} items over ${w} weeks — about ${Math.ceil(per)} per week.`) + (per > 5 ? L(' একটু বেশি চাপ! সপ্তাহ বাড়িয়ে দাও।', ' That’s heavy — add more weeks.') : '')
      : L(`${N(n)}টি লেখা ${N(w)} সপ্তাহে ছড়িয়ে যাবে — কয়েক সপ্তাহে একটা করে।`, `${n} items over ${w} weeks — one every few weeks.`);
  }
  document.addEventListener('input', (e) => { if (e.target && e.target.id === 'wr-list') wrPreview(); });
  document.addEventListener('change', (e) => { if (e.target && (e.target.id === 'wr-from' || e.target.id === 'wr-to')) wrPreview(); });

  Object.assign(ACT, {
    wrOpen: (el) => {
      const k = el.dataset.k; if (!k) return;
      const open = () => { A.ui.openSheet(() => wrSheet(k)); setTimeout(wrPreview, 30); };
      open();
    },
    wrSug: (el) => {
      const ta = $('#wr-list'); if (!ta) return; const t = el.dataset.t;
      const lines = ta.value.split('\n').map(x => x.trim()).filter(Boolean);
      const i = lines.findIndex(x => x.toLowerCase() === t.toLowerCase());
      if (i >= 0) { lines.splice(i, 1); el.classList.remove('on'); } else { lines.push(t); el.classList.add('on'); }
      ta.value = lines.join('\n'); wrPreview(); A.haptic(6);
    },
    wrMin: (el) => el.parentNode.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c === el)),
    wrSave: (el) => {
      const k = el.dataset.k; const names = parseList();
      const f = +($('#wr-from') || {}).value || 1, t = +($('#wr-to') || {}).value || 11;
      if (!names.length) { toast(L('অন্তত একটা নাম লেখো', 'Write at least one name'), '✍️'); const ta = $('#wr-list'); if (ta) { ta.classList.add('bad'); ta.focus(); } return; }
      if (names.length > MAX_ITEMS) { toast(L(`সর্বোচ্চ ${N(MAX_ITEMS)}টি নাম দেওয়া যাবে`, `Max ${MAX_ITEMS} names`), '⚠️'); return; }
      if (t < f) { toast(L('সপ্তাহের সীমা ঠিক করো', 'Fix the week range'), '⚠️'); return; }
      const minEl = $('#wr-min .chip.on'); const min = minEl ? +minEl.dataset.v : meta(k).min;
      const old = (WR()[k] && WR()[k].items) || [];
      const byName = {}; old.forEach(it => { byName[it.t.toLowerCase()] = it; });
      const items = names.map(nm => { const o = byName[nm.toLowerCase()]; return o ? { id: o.id, t: nm } : { id: uid(), t: nm }; });
      // removed names: forget their per-task edits (XP already earned stays)
      const keepIds = {}; items.forEach(it => { keepIds[it.id] = 1; });
      old.forEach(it => { if (!keepIds[it.id]) { const id = 'wr-' + it.id; delete C().min[id]; delete C().move[id]; delete C().hide[id]; dropFromOrders(id); } });
      WR()[k] = { items, from: f, to: t, min, at: Date.now() };
      changed(); A.haptic(12); A.sfx.play('done');
      A.ui.closeSheet().then(refresh);
      toast(L(`${N(items.length)}টি লেখা সপ্তাহ ${N(f)}–${N(t)} জুড়ে প্ল্যানে বসানো হলো ✍️`, `${items.length} items planned over weeks ${f}–${t} ✍️`), '✨', 2400);
    },
    wrClear: async (el) => {
      const k = el.dataset.k; await A.ui.closeSheet();
      if (!(await confirmBox(L('তালিকা মুছবে?', 'Remove this list?'), L('এই অংশের তালিকা মুছে আগের সাধারণ রাইটিং কাজে ফিরে যাবে। অর্জিত XP থাকবে।', 'The list is removed and the plan goes back to the general writing task. Earned XP stays.'), L('মুছে ফেলো', 'Remove'), true))) return;
      const cat = WR()[k]; if (cat) cat.items.forEach(it => { const id = 'wr-' + it.id; delete C().min[id]; delete C().move[id]; delete C().hide[id]; dropFromOrders(id); });
      delete WR()[k]; changed(); refresh();
    }
  });

  // Subject screen (Bangla 2nd, English 1st/2nd): shortcut to the writing lists
  const origSubject = SCREENS.subject;
  SCREENS.subject = function (sub) {
    const html = origSubject(sub);
    if (!D.WRITING[sub] || !S().profile) return html;
    const i = html.indexOf('<div class="chips mt">');
    return i < 0 ? html : html.slice(0, i) + writingCard() + html.slice(i);
  };

  function reorder(el, dir) {
    const day = +el.dataset.day, id = el.dataset.id;
    const ids = (P().byDay[day] || []).slice();
    const i = ids.indexOf(id), j = i + dir; if (i < 0 || j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    C().order[day] = ids; changed(); A.haptic(6); refresh();
  }
})();
