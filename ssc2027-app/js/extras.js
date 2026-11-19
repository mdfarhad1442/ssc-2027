/* ==========================================================================
   SSC 2027 — v1.1 extras
   • GPA calculator          (#gpa)
   • Official result links   (#results)
   • Focus Guard settings    (#guard)   — social media lock (Android app)
   • Install page            (#install) — web app + Android APK
   ========================================================================== */
(function () {
  'use strict';
  const A = window.App, D = window.SSC_DATA;
  const X = A.ui.ext;
  const { L, N, esc } = A;
  const S = () => A.S();
  const $ = (s, r = document) => r.querySelector(s);
  const { SCREENS, AFTER, ACT, U, topbar, ic, confirmBox } = X;
  const toast = (...a) => A.ui.toast(...a);
  const refresh = () => A.ui.refresh();
  const tg = (a, on, extra = '') => `<button class="toggle ${on ? 'on' : ''}" data-a="${a}" ${extra} role="switch" aria-checked="${on}"></button>`;
  const bnTime = (t) => (A.isBn() ? String(t || '').replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]) : t);

  /* =========================================================================
     GPA CALCULATOR
     ========================================================================= */
  const GRADES = [[80, 'A+', 5], [70, 'A', 4], [60, 'A-', 3.5], [50, 'B', 3], [40, 'C', 2], [33, 'D', 1], [0, 'F', 0]];
  const GP_OF = { 'A+': 5, A: 4, 'A-': 3.5, B: 3, C: 2, D: 1, F: 0 };
  const gradeOf = (pct) => GRADES.find(g => pct >= g[0]);
  const GCOL = { 'A+': ['#E7F8F1', '#0F9D6E'], A: ['#EAF3FF', '#2468D8'], 'A-': ['#EEEAFF', '#5B45E0'], B: ['#FFF6DB', '#A57A00'], C: ['#FFEEDF', '#C25A1D'], D: ['#FDE5EF', '#C23A6E'], F: ['#FFE8E8', '#D23C3C'] };

  function gpaSubjects() {
    const p = S().profile || {}; const grp = p.group || 'science';
    const sub = (k, full = 100) => ({ k, bn: (D.SUBJECTS[k] || {}).bn || k, en: (D.SUBJECTS[k] || {}).en || k, full });
    const rel = D.RELIGIONS[p.religion] || D.RELIGIONS.islam;
    const base = [
      { k: 'ban', bn: 'বাংলা (১ম + ২য় পত্র)', en: 'Bangla (1st + 2nd)', full: 200 },
      { k: 'eng', bn: 'ইংরেজি (১ম + ২য় পত্র)', en: 'English (1st + 2nd)', full: 200 },
      sub('gm'), sub('ict', 50), { k: 'rel', bn: rel.bn, en: rel.en, full: 100 }
    ];
    if (grp === 'science') return { list: base.concat([sub('bgs'), sub('phy'), sub('che'), sub('bio'), sub('hm')]), fourth: 'hm' };
    const extra4 = { k: 'opt', bn: '৪র্থ বিষয় (কৃষি/গার্হস্থ্য/উ.গণিত ইত্যাদি)', en: '4th subject (Agri/Home Sci/H.Math…)', full: 100 };
    if (grp === 'business') return { list: base.concat([sub('sci'), sub('acc'), sub('fin'), sub('bent'), extra4]), fourth: 'opt' };
    return { list: base.concat([sub('sci'), sub('his'), sub('geo'), sub('civ'), sub('eco'), extra4]), fourth: 'opt' };
  }
  function gpaState() {
    const st = S();
    if (!st.gpa || st.gpa.group !== (st.profile && st.profile.group)) {
      const def = gpaSubjects();
      st.gpa = { group: st.profile && st.profile.group, mode: 'marks', m: {}, g: {}, fourth: def.fourth, skip: {}, last: st.gpa ? st.gpa.last : null };
      if (st.profile && st.profile.group === 'humanities') st.gpa.skip = { eco: true }; // pick 3 of 4 group subjects
    }
    return st.gpa;
  }
  function gpaCalc() {
    const g = gpaState(); const { list } = gpaSubjects();
    const rows = []; let comp = 0, sum = 0, fail = false, missing = 0, fourthRow = null;
    list.forEach(s => {
      if (g.skip[s.k]) return;
      let pct = null, grade = null;
      if (g.mode === 'marks') {
        const v = g.m[s.k];
        if (v !== undefined && v !== '' && !isNaN(+v)) { pct = Math.max(0, Math.min(100, (+v / s.full) * 100)); grade = gradeOf(pct); }
      } else if (g.g[s.k]) { const gr = g.g[s.k]; grade = [0, gr, GP_OF[gr]]; }
      const r = { s, pct, grade, fourth: g.fourth === s.k };
      rows.push(r);
      if (r.fourth) { fourthRow = r; return; }
      comp++;
      if (!grade) { missing++; return; }
      sum += grade[2]; if (grade[2] === 0) fail = true;
    });
    const filled = comp - missing;
    const bonus = fourthRow && fourthRow.grade ? Math.max(0, fourthRow.grade[2] - 2) : 0;
    const raw = filled ? (sum + bonus) / filled : 0;
    const gpa = fail ? 0 : Math.min(5, raw);
    const noFourth = fail ? 0 : (filled ? Math.min(5, sum / filled) : 0);
    return { rows, gpa, noFourth, bonus, fail, missing, filled, comp, fourthRow };
  }
  const letterOf = (gpa, fail) => (fail ? 'F' : gpa >= 5 ? 'A+' : gpa >= 4 ? 'A' : gpa >= 3.5 ? 'A-' : gpa >= 3 ? 'B' : gpa >= 2 ? 'C' : gpa >= 1 ? 'D' : 'F');
  const fix2 = (x) => (Math.floor(x * 100 + 1e-6) / 100).toFixed(2);

  function gpaResultHtml() {
    const r = gpaCalc();
    if (!r.filled) return `<div class="gpa-hero empty"><div class="gpa-big">—</div><div><div class="bold">${L('নম্বর দিলেই জিপিএ দেখাবে', 'Enter marks to see your GPA')}</div><div class="tiny muted">${L('নিচের বিষয়গুলোতে প্রাপ্ত নম্বর লিখো', 'Type the marks you got below')}</div></div></div>`;
    const lt = letterOf(r.gpa, r.fail); const [bg, fg] = GCOL[lt];
    const pct = r.gpa / 5;
    const msg = r.fail ? L('একটা বিষয়ে F মানেই পুরো জিপিএ শূন্য 😬 ওই বিষয়টাকে আগে বাঁচাও!', 'One F makes the whole GPA zero 😬 Rescue that subject first!')
      : r.gpa >= 5 ? L('গোল্ডেন লেভেল! এভাবেই ধরে রাখো 🏆', 'Golden level! Keep it up 🏆')
        : r.gpa >= 4.5 ? L('প্রায় চলে এসেছ! আর কয়েকটা বিষয় ঠেলা দিলেই A+ 🚀', 'So close! Push a few subjects for A+ 🚀')
          : r.gpa >= 4 ? L('ভালো অবস্থান — দুর্বল বিষয়ে আরেকটু সময় দাও 💪', 'Good spot — give weak subjects more time 💪')
            : L('চিন্তা নেই, ৯০ দিনের রোডম্যাপ ধরে চললেই উন্নতি হবে 🌱', 'No worries — follow the 90-day roadmap and you will improve 🌱');
    return `<div class="gpa-hero" style="--gbg:${bg};--gfg:${fg}">
        <div class="gpa-ring" style="background:conic-gradient(${fg} ${pct * 360}deg, rgba(255,255,255,.6) 0)"><div><div class="gpa-big">${N(fix2(r.gpa))}</div><div class="tiny bold" style="color:${fg}">GPA</div></div></div>
        <div class="grow"><div class="gpa-letter" style="background:${fg}">${lt}</div>
          <div class="small mt-s" style="color:var(--ink-2)">${msg}</div>
          ${r.fourthRow && r.fourthRow.grade ? `<div class="tiny muted mt-s">${L('৪র্থ বিষয় ছাড়া: ', 'Without 4th subject: ')}<b>${N(fix2(r.noFourth))}</b> · ${L('৪র্থ বিষয় থেকে বোনাস: ', '4th subject bonus: ')}<b>+${N(r.bonus)}</b> GP</div>` : ''}
          ${r.missing ? `<div class="tiny mt-s" style="color:#C25A1D">⚠️ ${N(r.missing)}${L(' টি বিষয়ের নম্বর বাকি — এটা আংশিক হিসাব', ' subject(s) missing — partial result')}</div>` : ''}
        </div></div>`;
  }
  function gpaTipsHtml() {
    const g = gpaState(); if (g.mode !== 'marks') return '';
    const r = gpaCalc();
    const near = r.rows.filter(x => x.grade && x.pct != null && x.pct < 80).map(x => ({ x, need: Math.ceil(x.s.full * 0.8 - (+g.m[x.s.k])) })).sort((a, b) => a.need - b.need).slice(0, 3);
    if (!near.length) return '';
    return `<div class="card tight mt"><div class="bold small">🎯 ${L('A+ এর সবচেয়ে কাছে যে বিষয়গুলো', 'Closest to A+')}</div>
      ${near.map(n => `<div class="row between mt-s small"><span class="ellipsis">${esc(L(n.x.s.bn, n.x.s.en))}</span><span class="tag mint">+${N(n.need)} ${L('নম্বর লাগবে', 'marks needed')}</span></div>`).join('')}</div>`;
  }
  function gradeChip(row) {
    if (!row.grade) return `<span class="gchip" style="background:var(--line-2);color:var(--muted)">—</span>`;
    const [bg, fg] = GCOL[row.grade[1]];
    return `<span class="gchip" style="background:${bg};color:${fg}">${row.grade[1]}<small>${N(row.grade[2])}</small></span>`;
  }

  SCREENS.gpa = function () {
    const g = gpaState(); const { list } = gpaSubjects(); const r = gpaCalc();
    const rowsBy = {}; r.rows.forEach(x => { rowsBy[x.s.k] = x; });
    const isHum = S().profile.group === 'humanities';
    return `${topbar(L('জিপিএ ক্যালকুলেটর', 'GPA calculator'), L('এসএসসি গ্রেডিং পদ্ধতি অনুযায়ী', 'Official SSC grading system'), `<button class="icon-btn" data-a="gpaInfo" aria-label="info">ℹ️</button>`)}
      <div id="gpa-res">${gpaResultHtml()}</div>
      <div class="row between mt">
        <div class="seg"><button class="${g.mode === 'marks' ? 'on' : ''}" data-a="gpaMode" data-m="marks">${L('নম্বর দিয়ে', 'By marks')}</button><button class="${g.mode === 'grade' ? 'on' : ''}" data-a="gpaMode" data-m="grade">${L('গ্রেড দিয়ে', 'By grade')}</button></div>
        <button class="tag gray tap" data-a="gpaReset">${ic('reset', 'xs')} ${L('মুছে দাও', 'Clear')}</button>
      </div>
      <div class="menu mt gpa-list">
        ${list.map(s => {
          const row = rowsBy[s.k] || { s, grade: null }; const skip = !!g.skip[s.k]; const four = g.fourth === s.k;
          const input = g.mode === 'marks'
            ? `<input class="input gpa-in" type="number" inputmode="numeric" min="0" max="${s.full}" placeholder="${L('নম্বর', 'marks')}" value="${esc(g.m[s.k] != null ? g.m[s.k] : '')}" data-gk="${s.k}" data-full="${s.full}" ${skip ? 'disabled' : ''} aria-label="${esc(L(s.bn, s.en))}">`
            : `<select class="select gpa-in" data-gg="${s.k}" ${skip ? 'disabled' : ''}><option value="">—</option>${Object.keys(GP_OF).map(k => `<option ${g.g[s.k] === k ? 'selected' : ''}>${k}</option>`).join('')}</select>`;
          return `<div class="menu-item gpa-row ${skip ? 'skip' : ''}">
            <span class="grow" style="min-width:0"><span class="bold small ellipsis" style="display:block">${esc(L(s.bn, s.en))}</span>
              <span class="tiny muted">${g.mode === 'marks' ? L('পূর্ণমান ', 'Full ') + N(s.full) + ' · ' : ''}${four ? `<b style="color:var(--peach-600)">${L('৪র্থ বিষয়', '4th subject')}</b>` : L('আবশ্যিক', 'Compulsory')}</span>
              <span class="row gap-s" style="margin-top:6px">
                ${(s.k !== 'ban' && s.k !== 'eng' && s.k !== 'gm' && s.k !== 'ict' && s.k !== 'rel' && s.k !== 'bgs' && s.k !== 'sci') ? `<button class="mini-chip ${four ? 'on' : ''}" data-a="gpaFourth" data-k="${s.k}">${four ? '✓ ' : ''}${L('৪র্থ', '4th')}</button>` : ''}
                ${isHum && ['his', 'geo', 'civ', 'eco', 'opt'].includes(s.k) ? `<button class="mini-chip ${skip ? '' : 'on'}" data-a="gpaSkip" data-k="${s.k}">${skip ? L('নেই', 'Not taken') : L('আছে ✓', 'Taken ✓')}</button>` : ''}
              </span>
            </span>
            <span class="gpa-inbox">${input}</span>
            <span id="gc-${s.k}">${skip ? '' : gradeChip(row)}</span>
          </div>`;
        }).join('')}
      </div>
      <div id="gpa-tips">${gpaTipsHtml()}</div>
      <div class="card lav mt small">
        <div class="bold">📐 ${L('হিসাবের নিয়ম', 'How it is calculated')}</div>
        <div class="grade-table mt-s">${GRADES.map(([m, gr, gp], i) => `<div><b>${gr}</b><span>${N(m)}–${N(i === 0 ? 100 : GRADES[i - 1][0] - 1)}</span><i>${N(gp)}</i></div>`).join('')}</div>
        <p class="tiny mt-s" style="color:var(--ink-2)">${L('জিপিএ = আবশ্যিক বিষয়গুলোর গ্রেড পয়েন্টের গড়। ৪র্থ বিষয়ে ২-এর বেশি যত পয়েন্ট, শুধু ততটুকু যোগ হয়। সর্বোচ্চ ৫.০০। কোনো আবশ্যিক বিষয়ে F হলে জিপিএ ০ (ফেল)। বাংলা ও ইংরেজির দুই পত্র মিলিয়ে ২০০ নম্বরে একটি গ্রেড; ICT ৫০ নম্বরে।', 'GPA = average grade point of compulsory subjects. From the 4th subject only points above 2 are added. Max 5.00. Any F in a compulsory subject makes GPA 0 (fail). Bangla & English papers are combined out of 200; ICT is out of 50.')}</p>
      </div>
      <button class="btn ghost block mt" data-a="go" data-to="results">🏛️ ${L('অফিসিয়াল রেজাল্ট দেখার সাইট', 'Official result websites')}</button>
      <div style="height:20px"></div>`;
  };
  function gpaLive() {
    const r = gpaCalc();
    const box = $('#gpa-res'); if (box) box.innerHTML = gpaResultHtml();
    r.rows.forEach(x => { const el = $('#gc-' + x.s.k); if (el) el.innerHTML = gradeChip(x); });
    const tips = $('#gpa-tips'); if (tips) tips.innerHTML = gpaTipsHtml();
    const g = gpaState(); g.last = r.filled && !r.missing ? r.gpa : g.last; A.save();
  }
  document.addEventListener('input', (e) => {
    const el = e.target;
    if (el.dataset && el.dataset.gk) {
      const full = +el.dataset.full; let v = el.value.replace(/[০-৯]/g, c => '০১২৩৪৫৬৭৮৯'.indexOf(c));
      if (v !== '' && +v > full) { v = String(full); el.value = v; }
      if (v !== '' && +v < 0) { v = '0'; el.value = v; }
      gpaState().m[el.dataset.gk] = v; gpaLive();
    }
  });
  document.addEventListener('change', (e) => {
    const el = e.target;
    if (el.dataset && el.dataset.gg) { gpaState().g[el.dataset.gg] = el.value; gpaLive(); }
  });
  Object.assign(ACT, {
    gpaMode: (el) => { gpaState().mode = el.dataset.m; A.save(); refresh(); },
    gpaFourth: (el) => { const g = gpaState(); g.fourth = g.fourth === el.dataset.k ? '' : el.dataset.k; if (g.skip[el.dataset.k]) delete g.skip[el.dataset.k]; A.save(); refresh(); gpaLive(); },
    gpaSkip: (el) => { const g = gpaState(); const k = el.dataset.k; if (g.skip[k]) delete g.skip[k]; else { g.skip[k] = true; if (g.fourth === k) g.fourth = ''; } A.save(); refresh(); gpaLive(); },
    gpaReset: async () => { if (!(await confirmBox(L('সব নম্বর মুছে দেবে?', 'Clear all marks?'), L('এই ক্যালকুলেটরের সব ইনপুট মুছে যাবে।', 'All inputs in this calculator will be cleared.'), L('মুছে দাও', 'Clear'), true))) return; const g = gpaState(); g.m = {}; g.g = {}; g.last = null; A.save(); refresh(); },
    gpaInfo: () => A.ui.modal({ emoji: '🧮', title: L('জিপিএ কীভাবে হিসাব হয়?', 'How is GPA calculated?'), body: `<div class="small" style="text-align:left;color:var(--ink-2);line-height:1.7">${L('১. প্রতিটি বিষয়ের নম্বর থেকে গ্রেড পয়েন্ট (৮০+ = ৫, ৭০+ = ৪, ৬০+ = ৩.৫, ৫০+ = ৩, ৪০+ = ২, ৩৩+ = ১)।<br>২. আবশ্যিক বিষয়গুলোর পয়েন্ট যোগ করো।<br>৩. ৪র্থ বিষয়ের পয়েন্ট থেকে ২ বাদ দিয়ে বাকিটা যোগ করো (যেমন A+ = ৫ → +৩)।<br>৪. আবশ্যিক বিষয়ের সংখ্যা দিয়ে ভাগ করো। ৫-এর বেশি হলে ৫.০০।<br><br>উদাহরণ: ৯টি আবশ্যিক বিষয়ে মোট ৪২ পয়েন্ট + ৪র্থ বিষয়ে A (৪ → +২) = ৪৪ ÷ ৯ = <b>৪.৮৮</b>', '1. Marks → grade point (80+ = 5, 70+ = 4, 60+ = 3.5, 50+ = 3, 40+ = 2, 33+ = 1).<br>2. Add points of compulsory subjects.<br>3. Add the 4th subject’s points above 2 (A+ = 5 → +3).<br>4. Divide by the number of compulsory subjects. Capped at 5.00.<br><br>Example: 42 points in 9 compulsory + 4th subject A (4 → +2) = 44 ÷ 9 = <b>4.88</b>')}</div>`, ok: L('বুঝেছি', 'Got it') })
  });

  /* =========================================================================
     OFFICIAL SSC RESULT LINKS
     ========================================================================= */
  const PORTALS = [
    { u: 'http://www.educationboardresults.gov.bd/', name: 'educationboardresults.gov.bd', bn: 'শিক্ষা বোর্ড রেজাল্ট — মূল সরকারি পোর্টাল', en: 'Education Board Results — main official portal', d: L('পরীক্ষা (SSC/Dakhil), সাল, বোর্ড, রোল ও রেজিস্ট্রেশন নম্বর দিলেই গ্রেডশিট', 'Exam, year, board, roll & registration → grade sheet'), e: '🏛️', bg: 'var(--lav-100)', tag: L('সবচেয়ে জনপ্রিয়', 'Most used') },
    { u: 'https://eboardresults.com/', name: 'eboardresults.com', bn: 'ওয়েব বেজড রেজাল্ট — বিষয়ভিত্তিক নম্বরসহ', en: 'Web based result — subject-wise marks', d: L('পূর্ণ মার্কশিট, প্রতিষ্ঠান (EIIN) ও কেন্দ্রভিত্তিক রেজাল্ট', 'Full marksheet, institution (EIIN) & centre results'), e: '📑', bg: 'var(--mint-100)', tag: L('মার্কশিট', 'Marksheet') },
    { u: 'https://www.eduboardresults.gov.bd/', name: 'eduboardresults.gov.bd', bn: 'শিক্ষা বোর্ড — রেজাল্ট ও পুনঃনিরীক্ষণ', en: 'Education boards — results & re-scrutiny', d: L('রেজাল্ট, প্রতিষ্ঠানের ফলাফল ও খাতা পুনঃনিরীক্ষণের তথ্য', 'Results, institution results & re-scrutiny info'), e: '🔎', bg: 'var(--peach-100)', tag: L('বিকল্প', 'Alternate') }
  ];
  const BOARDS = [
    { c: 'DHA', bn: 'ঢাকা', en: 'Dhaka', u: 'https://dhakaeducationboard.gov.bd/', d: ['ঢাকা', 'গাজীপুর', 'নারায়ণগঞ্জ', 'নরসিংদী', 'মুন্সিগঞ্জ', 'মানিকগঞ্জ', 'টাঙ্গাইল', 'কিশোরগঞ্জ', 'ফরিদপুর', 'গোপালগঞ্জ', 'মাদারীপুর', 'রাজবাড়ী', 'শরীয়তপুর'] },
    { c: 'CHI', bn: 'চট্টগ্রাম', en: 'Chattogram', u: 'https://bise-ctg.gov.bd/', d: ['চট্টগ্রাম', 'কক্সবাজার', 'রাঙামাটি', 'খাগড়াছড়ি', 'বান্দরবান'] },
    { c: 'COM', bn: 'কুমিল্লা', en: 'Cumilla', u: 'https://comillaboard.gov.bd/', d: ['কুমিল্লা', 'ব্রাহ্মণবাড়িয়া', 'চাঁদপুর', 'নোয়াখালী', 'ফেনী', 'লক্ষ্মীপুর'] },
    { c: 'RAJ', bn: 'রাজশাহী', en: 'Rajshahi', u: 'https://rajshahieducationboard.gov.bd/', d: ['রাজশাহী', 'নাটোর', 'নওগাঁ', 'চাঁপাইনবাবগঞ্জ', 'পাবনা', 'সিরাজগঞ্জ', 'বগুড়া', 'জয়পুরহাট'] },
    { c: 'JES', bn: 'যশোর', en: 'Jashore', u: 'https://www.jessoreboard.gov.bd/', d: ['যশোর', 'খুলনা', 'সাতক্ষীরা', 'বাগেরহাট', 'কুষ্টিয়া', 'চুয়াডাঙ্গা', 'মেহেরপুর', 'ঝিনাইদহ', 'মাগুরা', 'নড়াইল'] },
    { c: 'BAR', bn: 'বরিশাল', en: 'Barishal', u: 'https://www.barisalboard.gov.bd/', d: ['বরিশাল', 'ভোলা', 'পটুয়াখালী', 'বরগুনা', 'ঝালকাঠি', 'পিরোজপুর'] },
    { c: 'SYL', bn: 'সিলেট', en: 'Sylhet', u: 'https://sylhetboard.gov.bd/', d: ['সিলেট', 'মৌলভীবাজার', 'হবিগঞ্জ', 'সুনামগঞ্জ'] },
    { c: 'DIN', bn: 'দিনাজপুর', en: 'Dinajpur', u: 'https://dinajpureducationboard.gov.bd/', d: ['দিনাজপুর', 'ঠাকুরগাঁও', 'পঞ্চগড়', 'নীলফামারী', 'রংপুর', 'গাইবান্ধা', 'কুড়িগ্রাম', 'লালমনিরহাট'] },
    { c: 'MYM', bn: 'ময়মনসিংহ', en: 'Mymensingh', u: 'https://mymensingheducationboard.gov.bd/', d: ['ময়মনসিংহ', 'জামালপুর', 'শেরপুর', 'নেত্রকোনা'] },
    { c: 'MAD', bn: 'মাদ্রাসা (দাখিল)', en: 'Madrasah (Dakhil)', u: 'https://bmeb.gov.bd/', d: [] },
    { c: 'TEC', bn: 'কারিগরি (SSC ভোকেশনাল)', en: 'Technical (SSC Vocational)', u: 'https://www.bteb.gov.bd/', d: [] }
  ];
  function resState() {
    const st = S();
    if (!st.result) {
      const dist = st.profile && st.profile.district; const b = BOARDS.find(x => x.d.includes(dist));
      st.result = { board: b ? b.c : '', roll: '', reg: '', year: '2027' };
    }
    return st.result;
  }
  function openLink(url, title) {
    if (A.native) { A.native.openInApp(url, title || ''); return; }
    const w = window.open(url, '_blank', 'noopener'); if (!w) location.href = url;
  }
  function smsText() {
    const r = resState(); const roll = (r.roll || '').trim() || '123456'; const y = r.year || '2027';
    if (r.board === 'MAD') return `DAKHIL MAD ${roll} ${y}`;
    return `SSC ${r.board || 'CHI'} ${roll} ${y}`;
  }
  function smsHref() { const body = encodeURIComponent(smsText()); return /iphone|ipad|ipod/i.test(navigator.userAgent) ? `sms:16222&body=${body}` : `sms:16222?body=${body}`; }

  SCREENS.results = function () {
    const r = resState(); const board = BOARDS.find(b => b.c === r.board);
    return `${topbar(L('এসএসসি রেজাল্ট', 'SSC results'), L('সরকারি শিক্ষা বোর্ডের অফিসিয়াল লিংক', 'Official education board links'))}
      <div class="res-hero">
        <div class="grow"><div class="eyebrow" style="color:rgba(255,255,255,.85)">SSC 2027</div><div class="h2" style="color:#fff">${L('রেজাল্টের দিন এক ট্যাপেই', 'One tap on result day')}</div>
        <div class="small" style="opacity:.92;margin-top:4px">${L('সম্ভাব্য প্রকাশ: ২০২৭ সালের মাঝামাঝি (তারিখ শিক্ষা মন্ত্রণালয় ঘোষণা করবে)। লিংকগুলো এখানে সেভ করা রইলো।', 'Expected mid-2027 (the ministry announces the date). All links are saved here.')}</div></div>
        <div class="res-emoji">🎓</div>
      </div>
      <div class="section-title"><h3>${L('অফিসিয়াল রেজাল্ট পোর্টাল', 'Official result portals')}</h3></div>
      <div class="col">
        ${PORTALS.map(p => `<button class="link-card tap" data-a="openLink" data-u="${p.u}" data-t="${esc(L(p.bn, p.en))}">
          <span class="mi" style="background:${p.bg}">${p.e}</span>
          <span class="grow" style="min-width:0"><span class="bold small" style="display:block;line-height:1.35">${esc(L(p.bn, p.en))}</span>
          <span class="tiny muted" style="display:block">${esc(p.d)}</span>
          <span class="row gap-s" style="margin-top:6px"><span class="url-pill">🔒 ${p.name}</span><span class="tag ${p === PORTALS[0] ? 'lav' : 'gray'}">${p.tag}</span></span></span>
          <span class="chev">${ic('chevR', 'sm')}</span></button>`).join('')}
      </div>
      <div class="section-title"><h3>${L('আমার রেজাল্টের তথ্য', 'My result details')}</h3></div>
      <div class="card">
        <p class="tiny muted">${L('রোল ও রেজিস্ট্রেশন এখানে লিখে রাখো — রেজাল্টের দিন কপি করে সাইটে বসাতে সুবিধা হবে। (শুধু তোমার ফোনেই থাকে)', 'Save your roll & registration here to copy-paste on result day. (Stays on your phone only)')}</p>
        <div class="field mt-s"><label for="rs-board">${L('শিক্ষা বোর্ড', 'Education board')}</label><select id="rs-board" class="select" data-a="rsField" data-k="board"><option value="">${L('— বোর্ড বেছে নাও —', '— choose board —')}</option>${BOARDS.map(b => `<option value="${b.c}" ${r.board === b.c ? 'selected' : ''}>${L(b.bn, b.en)} (${b.c})</option>`).join('')}</select></div>
        <div class="row" style="gap:10px;margin-top:14px">
          <div class="field grow" style="margin:0"><label for="rs-roll">${L('রোল নম্বর', 'Roll no.')}</label><div class="row gap-s"><input id="rs-roll" class="input" inputmode="numeric" maxlength="8" placeholder="123456" value="${esc(r.roll)}" data-rk="roll"><button class="icon-btn" data-a="rsCopy" data-k="roll" aria-label="copy">${ic('copy', 'sm')}</button></div></div>
        </div>
        <div class="field" style="margin-top:14px"><label for="rs-reg">${L('রেজিস্ট্রেশন নম্বর', 'Registration no.')}</label><div class="row gap-s"><input id="rs-reg" class="input" inputmode="numeric" maxlength="12" placeholder="2513xxxxxx" value="${esc(r.reg)}" data-rk="reg"><button class="icon-btn" data-a="rsCopy" data-k="reg" aria-label="copy">${ic('copy', 'sm')}</button></div></div>
      </div>
      <div class="section-title"><h3>📱 ${L('ইন্টারনেট ছাড়া SMS-এ রেজাল্ট', 'Result by SMS (no internet)')}</h3></div>
      <div class="card peach">
        <div class="sms-box"><div class="tiny muted">${L('মেসেজ লিখো', 'Type')}</div><div class="sms-code" id="sms-code">${esc(smsText())}</div><div class="tiny muted">${L('পাঠাও ', 'Send to ')}<b style="color:var(--ink)">16222</b></div></div>
        <p class="tiny mt-s" style="color:var(--ink-2)">${L('যেকোনো অপারেটর থেকে পাঠানো যায় (চার্জ প্রায় ২.৫০ টাকা)। রেজাল্ট প্রকাশের সাথে সাথে ফিরতি SMS-এ গ্রেড চলে আসবে।', 'Works from any operator (~Tk 2.50). The grade arrives by reply SMS as soon as results are published.')}</p>
        <div class="row mt-s"><a class="btn peach sm grow" href="${smsHref()}" id="sms-link">✉️ ${L('SMS অ্যাপে খুলো', 'Open in SMS app')}</a><button class="btn white sm" data-a="rsCopySms">${ic('copy', 'xs')} ${L('কপি', 'Copy')}</button></div>
      </div>
      <div class="section-title"><h3>${L('শিক্ষা বোর্ডের ওয়েবসাইট', 'Education board websites')}</h3></div>
      <div class="board-grid">
        ${BOARDS.map(b => `<button class="board-tile tap ${r.board === b.c ? 'on' : ''}" data-a="openLink" data-u="${b.u}" data-t="${esc(L(b.bn, b.en))}"><span class="bt-code">${b.c}</span><span class="bold small">${L(b.bn, b.en)}</span><span class="tiny muted ellipsis">${b.u.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}</span></button>`).join('')}
      </div>
      <div class="card lav mt small">
        <div class="bold">💡 ${L('রেজাল্টের দিনের টিপস', 'Result-day tips')}</div>
        <ul class="tips-list">
          <li>${L('প্রথম ঘণ্টায় সাইট ধীর হয় — তখন SMS সবচেয়ে দ্রুত।', 'Sites are slow in the first hour — SMS is fastest then.')}</li>
          <li>${L('একটা সাইট না খুললে অন্যটা চেষ্টা করো; সব একই সরকারি ডেটা দেখায়।', 'If one site fails, try another — they show the same official data.')}</li>
          <li>${L('সাধারণত রেজাল্ট প্রকাশের দিন দুপুর ২টার পর অনলাইনে পাওয়া যায়; স্কুলেও তালিকা আসে।', 'Online results usually appear after 2 PM on result day; schools also get the list.')}</li>
          <li>${L('শুধু .gov.bd ও উপরের সাইটগুলো ব্যবহার করো — "আগে রেজাল্ট দেবো" টাইপ ফেক সাইট/পেজ থেকে সাবধান!', 'Use only .gov.bd and the sites above — beware of fake “early result” pages!')}</li>
        </ul>
      </div>
      <p class="center tiny muted mt">${board ? L('তোমার বোর্ড: ', 'Your board: ') + L(board.bn, board.en) + ' · ' : ''}${A.native ? L('লিংকগুলো অ্যাপের ভেতরেই খুলবে ↗', 'Links open inside the app ↗') : L('লিংকগুলো নতুন ট্যাবে খুলবে ↗', 'Links open in a new tab ↗')}</p>
      <div style="height:16px"></div>`;
  };
  document.addEventListener('input', (e) => {
    const el = e.target; if (!el.dataset || !el.dataset.rk) return;
    const v = el.value.replace(/[০-৯]/g, c => '০১২৩৪৫৬৭৮৯'.indexOf(c)).replace(/\D/g, '');
    if (v !== el.value) el.value = v;
    resState()[el.dataset.rk] = v; A.save();
    const sc = $('#sms-code'); if (sc) sc.textContent = smsText();
    const sl = $('#sms-link'); if (sl) sl.setAttribute('href', smsHref());
  });
  document.addEventListener('change', (e) => {
    const el = e.target; if (!el.dataset || el.dataset.a !== 'rsField') return;
    resState()[el.dataset.k] = el.value; A.save(); refresh();
  });
  Object.assign(ACT, {
    openLink: (el) => openLink(el.dataset.u, el.dataset.t),
    rsCopy: (el) => { const v = resState()[el.dataset.k]; if (!v) { toast(L('আগে নম্বরটা লিখো', 'Type the number first'), '✍️'); return; } X.copy(v); },
    rsCopySms: () => X.copy(smsText())
  });

  /* =========================================================================
     FOCUS GUARD (Android APK) — social media lock with roast overlay
     ========================================================================= */
  const SUGGEST = [
    ['com.facebook.katana', 'Facebook', '📘'], ['com.facebook.lite', 'Facebook Lite', '📘'], ['com.facebook.orca', 'Messenger', '💬'],
    ['com.zhiliaoapp.musically', 'TikTok', '🎵'], ['com.ss.android.ugc.trill', 'TikTok', '🎵'], ['com.instagram.android', 'Instagram', '📸'],
    ['com.google.android.youtube', 'YouTube', '▶️'], ['com.whatsapp', 'WhatsApp', '🟢'], ['com.snapchat.android', 'Snapchat', '👻'],
    ['org.telegram.messenger', 'Telegram', '✈️'], ['com.dts.freefireth', 'Free Fire', '🔥'], ['com.dts.freefiremax', 'Free Fire MAX', '🔥'],
    ['com.tencent.ig', 'PUBG Mobile', '🎯'], ['com.imo.android.imoim', 'imo', '📞'], ['com.twitter.android', 'X (Twitter)', '✖️'], ['video.like', 'Likee', '💃']
  ];
  const EMOJI_OF = Object.fromEntries(SUGGEST.map(x => [x[0], x[2]]));
  function defaultGuard() {
    return { enabled: false, apps: [], strict: false, graceMax: 3, graceMin: 2, waitSec: 10, lockFocus: true, schedule: { on: true, from: '16:00', to: '22:00', mode: 'block' }, nudgeEvery: 2, nudgeAlways: false, nudgeWait: 5 };
  }
  function G() { const st = S(); if (!st.guard) st.guard = defaultGuard(); else { const d = defaultGuard(); Object.keys(d).forEach(k => { if (st.guard[k] === undefined) st.guard[k] = d[k]; }); } return st.guard; }
  A.guardState = G;
  A.guardMessages = function () {
    const bn = A.isBn();
    const fb = bn ? ['ফেসবুকে সবার পোস্ট দেখে কী হবে? নিজের রেজাল্টের পোস্টটা সুন্দর করতে পড়ো 😎', 'নিউজফিড শেষ হয় না, কিন্তু SSC-র তারিখ ঠিকই চলে আসে ⏳', 'ফেসবুক তোমাকে মিস করবে না, কিন্তু বোর্ড পরীক্ষা তোমাকে ছাড়বে না 📚']
      : ['Scrolling others’ posts? Study so your result post looks great 😎', 'The feed never ends, but SSC day surely comes ⏳'];
    const yt = bn ? ['“শুধু একটা ভিডিও” — এটা কিন্তু ১৪ নম্বর ভিডিও 😑', 'পড়ার ভিডিও দেখছ তো? নাকি শর্টস? 👀', 'ইউটিউবের অ্যালগরিদম তোমার GPA নিয়ে চিন্তিত না 🤷']
      : ['“Just one video” — that is video number 14 😑', 'Study videos, or Shorts? 👀'];
    const tt = bn ? ['টিকটকের ডান্স শিখে বোর্ড পরীক্ষায় নম্বর আসবে না 💃❌', '১৫ সেকেন্ডের ভিডিও × ১০০ = তোমার একটা পুরো অধ্যায় 📚', 'ট্রেন্ড পরে ধরবে, আগে সূত্রটা ধরো 🧪']
      : ['TikTok dances do not earn board marks 💃❌', '15-sec videos × 100 = one whole chapter 📚'];
    const ig = bn ? ['রিলস দেখার চেয়ে রিভিশন বেশি কাজের 🔁', 'স্টোরিতে সবাই হাসছে, রেজাল্টের দিন হাসবে যে পড়ছে 😌'] : ['Revision beats Reels 🔁', 'Stories fade, results stay 😌'];
    const game = bn ? ['বুয়াহ পরে, আগে A+ 🏆', 'গেমে র‍্যাংক পুশ না, পড়ায় র‍্যাংক পুশ করো 🎯', 'হেডশট দিতে চাও? আগে প্রশ্নটার হেডশট দাও ✍️'] : ['Booyah later, A+ first 🏆', 'Push rank in studies, not in games 🎯'];
    const chat = bn ? ['গ্রুপ চ্যাট পরে, আগে পড়ার চ্যাপ্টার 📖', '“কী করিস?” — উত্তর হওয়া উচিত “পড়ি” 😏'] : ['Group chat later, chapter first 📖', '“wyd?” — answer should be “studying” 😏'];
    const apps = {};
    ['com.facebook.katana', 'com.facebook.lite'].forEach(p => { apps[p] = fb; });
    ['com.google.android.youtube'].forEach(p => { apps[p] = yt; });
    ['com.zhiliaoapp.musically', 'com.ss.android.ugc.trill', 'video.like'].forEach(p => { apps[p] = tt; });
    ['com.instagram.android'].forEach(p => { apps[p] = ig; });
    ['com.dts.freefireth', 'com.dts.freefiremax', 'com.tencent.ig'].forEach(p => { apps[p] = game; });
    ['com.facebook.orca', 'com.whatsapp', 'org.telegram.messenger', 'com.imo.android.imoim'].forEach(p => { apps[p] = chat; });
    const general = bn ? [
      '{app} খুলে কী পাবে? লাইক? বোর্ড পরীক্ষায় লাইক গুনে নম্বর দেয় না 😏',
      'পেঁচু স্যার দেখছে… {app} বন্ধ করো, বই খোলো 🦉',
      'তোমার ক্লাসের টপার এখন অংক করছে, আর তুমি {app}-এ? 🤨',
      'এই স্ক্রল করার এনার্জি দিয়ে একটা সৃজনশীল লিখে ফেলা যেত ✍️',
      'আম্মু যদি এখন দেখত তুমি {app} চালাচ্ছ… 👀🩴',
      'রেজাল্টের দিন {app} তোমাকে GPA 5 দেবে না, বই দেবে 😌',
      'SSC 2027 তোমার জন্য অপেক্ষা করছে, {app} না 📚'
    ] : [
      'What will {app} give you? Likes? Boards don’t grade likes 😏',
      'Pechu is watching… close {app}, open a book 🦉',
      'Your class topper is solving math. You’re on {app}? 🤨',
      'That scrolling energy could write a whole creative answer ✍️',
      '{app} won’t give you GPA 5 on result day. Books will 😌'
    ];
    const focus = bn ? ['ফোকাস সেশনের মাঝখানে {app}? টাইমারটা কাঁদছে 😢', 'আর একটু! সেশন শেষ হলে {app} পালাবে না, কথা দিচ্ছি 🤝', 'মনোযোগ ভাঙলে আবার ফিরতে ২৩ মিনিট লাগে — এখন না 🧠']
      : ['{app} in the middle of a focus session? The timer is crying 😢', 'Almost there! {app} won’t run away, promise 🤝'];
    const nudge = bn ? ['এখনো পড়ার সময় চলছে… {app} নিয়ে আর কতক্ষণ? ⏰', '“২ মিনিট” বলে ২০ মিনিট হয়ে গেলো না তো? 😏', 'পেঁচু স্যার আবার খোঁচা দিচ্ছে: বই খোলো! 🦉👉📖', 'স্ক্রল থামাও, স্কোর বাড়াও 📈']
      : ['It’s still study time… how long on {app}? ⏰', '“2 minutes” became 20, right? 😏', 'Pechu pokes again: open the book! 🦉👉📖'];
    if (S().settings.roast === 'savage') general.push(...D.MSG.savage.slice(0, 4));
    return { general, focus, nudge, apps };
  };

  function appIcon(pkg) { const i = U.appIcons && U.appIcons[pkg]; return i ? `<img src="${i}" alt="" class="app-ic">` : `<span class="app-ic e">${EMOJI_OF[pkg] || '📱'}</span>`; }
  const fmtMin = (sec) => N(Math.round((sec || 0) / 60));
  function permRow(ok, emoji, title, sub, act, btn) {
    return `<div class="menu-item"><span class="mi" style="background:${ok ? 'var(--mint-100)' : '#FFE8E8'}">${ok ? '✅' : emoji}</span><span class="grow"><span class="bold small" style="display:block">${title}</span><span class="tiny muted" style="display:block">${sub}</span></span>${ok ? `<span class="tag mint">${L('ঠিক আছে', 'OK')}</span>` : `<button class="btn xs peach" data-a="gOpen" data-w="${act}">${btn}</button>`}</div>`;
  }

  function guardWebHtml() {
    return `${topbar(L('ফোকাস গার্ড', 'Focus Guard'), L('সোশ্যাল মিডিয়া লক', 'Social media lock'))}
      <div class="guard-hero">
        <img src="assets/mascot.webp" alt="" class="gh-owl">
        <div class="h2" style="color:#fff">${L('ফেসবুক-টিকটকে হারিয়ে যাও?', 'Lost in Facebook & TikTok?')}</div>
        <p class="small" style="opacity:.92;margin-top:6px">${L('Android অ্যাপে পেঁচু স্যার পড়ার সময় সোশ্যাল মিডিয়া খুললেই স্ক্রিনের উপর মজার রোস্ট দিয়ে আটকে দেবে — আর প্রতি ১–৩ মিনিট পর পর মনে করিয়ে দেবে “এখনো পড়ার সময়!”', 'In the Android app, Pechu covers social apps with a funny roast during study time — and reminds you every 1–3 minutes: “Still study time!”')}</p>
      </div>
      <div class="menu mt">
        ${[['⏱️', L('প্রতিটি অ্যাপের জন্য দৈনিক সময়সীমা', 'Daily time limit per app'), L('যেমন ফেসবুক দিনে ৩০ মিনিট', 'e.g. Facebook 30 min/day')],
          ['🕓', L('অ্যাপ খোলার অনুমোদিত সময়', 'Allowed hours per app'), L('যেমন ইউটিউব শুধু রাত ৯–১০টা', 'e.g. YouTube only 9–10 PM')],
          ['📚', L('পড়ার সময় পুরো লক', 'Full lock during study hours'), L('বিকাল ৪টা–রাত ১০টা ইত্যাদি', 'e.g. 4 PM–10 PM')],
          ['🎯', L('ফোকাস টাইমার চললে সব বন্ধ', 'Everything locked during Focus timer'), ''],
          ['😜', L('মজার রোস্ট ওভারলে + বারবার খোঁচা', 'Funny roast overlay + repeated nudges'), L('প্রতি ১–৩ মিনিট পর পর', 'every 1–3 minutes')]].map(([e, t, s]) => `<div class="menu-item"><span class="mi" style="background:var(--lav-100)">${e}</span><span class="grow"><span class="bold small" style="display:block">${t}</span>${s ? `<span class="tiny muted">${s}</span>` : ''}</span></div>`).join('')}
      </div>
      <div class="card peach mt small">ℹ️ ${L('ব্রাউজার বা iPhone অন্য অ্যাপ নিয়ন্ত্রণ করতে দেয় না, তাই এই ফিচার শুধু Android APK-তে কাজ করে। তোমার সব অগ্রগতি ব্যাকআপ দিয়ে APK-তে নিয়ে যেতে পারবে।', 'Browsers and iPhones cannot control other apps, so this works only in the Android APK. You can move all progress to the APK with a backup.')}</div>
      <button class="btn primary block mt" data-a="go" data-to="install">📲 ${L('Android অ্যাপ (APK) নাও', 'Get the Android app (APK)')}</button>
      <div style="height:20px"></div>`;
  }

  SCREENS.guard = function () {
    if (!A.native) return guardWebHtml();
    const g = G(); const P = A.native.perms(); const stats = A.native.guardStats();
    const usage = U.guardUsage || {};
    const accOk = !!P.accessibility;
    const ready = accOk && g.enabled;
    const onApps = g.apps.filter(a => a.on);
    const totalSec = onApps.reduce((s, a) => s + (+usage[a.pkg] || 0), 0);
    const sch = g.schedule;
    const seg = (act, cur, vals, fmt) => `<div class="seg">${vals.map(v => `<button class="${cur === v ? 'on' : ''}" data-a="${act}" data-v="${v}">${fmt(v)}</button>`).join('')}</div>`;
    return `${topbar(L('ফোকাস গার্ড', 'Focus Guard'), L('সোশ্যাল মিডিয়া লক · পেঁচু স্যার পাহারায়', 'Social media lock · Pechu on duty'))}
      <div class="guard-hero ${ready ? 'on' : ''}">
        <div class="row between" style="position:relative">
          <div class="grow"><div class="eyebrow" style="color:rgba(255,255,255,.85)">${ready ? L('পাহারা চলছে', 'Guard active') : L('পাহারা বন্ধ', 'Guard off')}</div>
            <div class="h2" style="color:#fff">${ready ? L('পেঁচু স্যার ডিউটিতে 🦉', 'Pechu is on duty 🦉') : L('ফোকাস গার্ড চালু করো', 'Turn on Focus Guard')}</div></div>
          <button class="toggle big ${g.enabled ? 'on' : ''}" data-a="gEnable" role="switch" aria-checked="${g.enabled}"></button>
        </div>
        <div class="gh-stats">
          <div><b>${N(stats.blocks || 0)}</b><span>${L('বার আটকানো', 'blocked')}</span></div>
          <div><b>${N(stats.returns || 0)}</b><span>${L('বার পড়ায় ফেরা', 'back to study')}</span></div>
          <div><b>${fmtMin(totalSec)}</b><span>${L('মি. সোশ্যাল', 'min social')}</span></div>
        </div>
      </div>
      ${g.enabled && !accOk ? `<div class="card peach mt row"><div style="font-size:30px">⚠️</div><div class="grow small"><b>${L('Accessibility পারমিশন লাগবে', 'Accessibility permission needed')}</b><div class="tiny muted">${L('এটা ছাড়া কোন অ্যাপ খোলা হলো বোঝা যায় না', 'Needed to detect which app is open')}</div></div><button class="btn xs peach" data-a="gAccess">${L('চালু করো', 'Enable')}</button></div>` : ''}

      <div class="section-title"><h3>${L('যেসব অ্যাপ আটকাবে', 'Apps to guard')} <span class="muted small">${N(onApps.length)}</span></h3><button class="tag lav tap" data-a="gAddApps">${ic('plus', 'xs')} ${L('অ্যাপ যোগ করো', 'Add apps')}</button></div>
      ${g.apps.length ? `<div class="menu">${g.apps.map((a, i) => {
        const used = +usage[a.pkg] || 0; const lim = +a.limit || 0; const pct = lim ? Math.min(1, used / (lim * 60)) : 0;
        const rules = [lim ? L('দিনে ', '') + N(lim) + L(' মি.', ' min/day') : L('দৈনিক লিমিট নেই', 'no daily limit'), a.allow && a.allow.on ? '🕓 ' + bnTime(a.allow.from) + '–' + bnTime(a.allow.to) : ''].filter(Boolean).join(' · ');
        return `<div class="menu-item app-row" data-a="gApp" data-i="${i}" role="button" tabindex="0"><span class="row grow" style="gap:12px;min-width:0;text-align:left">${appIcon(a.pkg)}<span class="grow" style="min-width:0"><span class="bold small ellipsis" style="display:block">${esc(a.name)}</span><span class="tiny muted ellipsis" style="display:block">${L('আজ ', 'Today ')}${fmtMin(used)}${L(' মি. · ', ' min · ')}${rules}</span>${lim ? `<span class="app-bar"><i style="width:${pct * 100}%;background:${pct >= 1 ? '#D23C3C' : pct >= .8 ? 'var(--peach-500)' : 'var(--mint-500)'}"></i></span>` : ''}</span></span>${tg('gAppToggle', a.on, `data-i="${i}"`)}</div>`;
      }).join('')}</div>` : `<div class="card tight center"><div style="font-size:34px">📵</div><div class="bold small mt-s">${L('এখনো কোনো অ্যাপ যোগ করোনি', 'No apps added yet')}</div><p class="tiny muted">${L('ফেসবুক, টিকটক, ইউটিউব, ফ্রি ফায়ার… যেগুলো সময় খায়', 'Facebook, TikTok, YouTube, Free Fire… the time-eaters')}</p><button class="btn primary sm mt-s" data-a="gAddApps">${L('অ্যাপ বেছে নাও', 'Choose apps')}</button></div>`}

      <div class="section-title"><h3>📚 ${L('পড়ার সময় (সব অ্যাপ লক)', 'Study hours (lock all)')}</h3>${tg('gSchOn', sch.on)}</div>
      <div class="card tight ${sch.on ? '' : 'dim'}">
        <div class="row between"><span class="small bold">${L('শুরু', 'From')}</span><input type="time" class="input" style="height:40px;width:130px;padding:0 10px" value="${sch.from}" data-gt="from"></div>
        <div class="row between mt-s"><span class="small bold">${L('শেষ', 'To')}</span><input type="time" class="input" style="height:40px;width:130px;padding:0 10px" value="${sch.to}" data-gt="to"></div>
        <div class="row between mt"><span class="small bold">${L('এই সময়ে', 'During this time')}</span>${seg('gSchMode', sch.mode, ['block', 'nudge'], v => v === 'block' ? L('পুরো লক 🔒', 'Full lock 🔒') : L('শুধু খোঁচা 👉', 'Nudge only 👉'))}</div>
        <p class="tiny muted mt-s">${sch.mode === 'block' ? L('এই সময়ে তালিকার অ্যাপ খুললেই রোস্টসহ লক স্ক্রিন আসবে।', 'Guarded apps show the roast lock screen during these hours.') : L('অ্যাপ চালানো যাবে, কিন্তু প্রতি কয়েক মিনিট পর পর পেঁচু স্যার স্ক্রিনে এসে খোঁচা দেবে।', 'Apps open, but Pechu pops up every few minutes to poke you.')}</p>
      </div>

      <div class="section-title"><h3>⏰ ${L('“এখনো পড়ার সময়” খোঁচা', '“Still study time” nudges')}</h3></div>
      <div class="card tight">
        <div class="row between"><span class="small bold">${L('প্রতি', 'Every')}</span>${seg('gNudge', g.nudgeEvery, [1, 2, 3, 5], v => N(v) + L(' মি.', 'm'))}</div>
        <div class="row between mt"><span class="small grow">${L('পড়ার সময়ের বাইরেও খোঁচা দাও', 'Nudge outside study hours too')}</span>${tg('gNudgeAlways', g.nudgeAlways)}</div>
        <p class="tiny muted mt-s">${L('লক না থাকলেও সোশ্যাল অ্যাপ চালানোর সময় এই বিরতিতে মজার রিমাইন্ডার স্ক্রিনের উপর আসবে।', 'While using a guarded app, a funny reminder pops up at this interval.')}</p>
      </div>

      <div class="section-title"><h3>🎯 ${L('অন্যান্য নিয়ম', 'More rules')}</h3></div>
      <div class="menu">
        <div class="menu-item"><span class="mi" style="background:var(--lav-100)">⏳</span><span class="grow"><span class="bold small" style="display:block">${L('ফোকাস টাইমার চললে সব লক', 'Lock all during Focus timer')}</span><span class="tiny muted">${L('সেশনের মাঝে কোনো ছাড় নেই', 'No exceptions mid-session')}</span></span>${tg('gLockFocus', g.lockFocus !== false)}</div>
        <div class="menu-item"><span class="mi" style="background:#FFE8E8">🧱</span><span class="grow"><span class="bold small" style="display:block">${L('কড়া মোড', 'Strict mode')}</span><span class="tiny muted">${L('“আর ২ মিনিট প্লিজ” বাটন থাকবে না', 'No “just 2 more minutes” button')}</span></span>${tg('gStrict', g.strict)}</div>
      </div>
      ${!g.strict ? `<div class="card tight mt">
        <div class="row between"><span class="small bold">${L('ছাড়ের সময়', 'Grace length')}</span>${seg('gGraceMin', g.graceMin, [1, 2, 3, 5], v => N(v) + L(' মি.', 'm'))}</div>
        <div class="row between mt"><span class="small bold">${L('দিনে কতবার', 'Times / day')}</span>${seg('gGraceMax', g.graceMax, [1, 2, 3, 5], v => N(v) + '×')}</div>
        <p class="tiny muted mt-s">${L('ছাড় শেষ হলেই আবার লক স্ক্রিন ফিরে আসবে 😈', 'When grace ends, the lock screen comes right back 😈')}</p>
      </div>` : ''}

      <div class="section-title"><h3>🧪 ${L('টেস্ট করে দেখো', 'Try it')}</h3></div>
      <div class="row"><button class="btn ghost grow sm" data-a="gTest" data-k="block">🔒 ${L('লক স্ক্রিন', 'Lock screen')}</button><button class="btn outline grow sm" data-a="gTest" data-k="nudge">👉 ${L('খোঁচা', 'Nudge')}</button></div>

      <div class="section-title"><h3>🔐 ${L('পারমিশন', 'Permissions')}</h3></div>
      <div class="menu">
        ${permRow(accOk, '♿', L('Accessibility সার্ভিস', 'Accessibility service'), L('কোন অ্যাপ খোলা হয়েছে বোঝার জন্য (আবশ্যক)', 'Detects the open app (required)'), 'accessibility', L('চালু করো', 'Enable'))}
        ${permRow(P.notif === 'granted', '🔔', L('নোটিফিকেশন', 'Notifications'), L('অ্যালার্ম ও লিমিট সতর্কতা', 'Alarms & limit warnings'), 'notif', L('চালু করো', 'Enable'))}
        ${permRow(!!P.battery, '🔋', L('ব্যাটারি অপটিমাইজেশন বন্ধ', 'Battery optimisation off'), L('ফোন যেন গার্ডকে ঘুম পাড়িয়ে না দেয়', 'So the phone doesn’t kill the guard'), 'battery', L('ঠিক করো', 'Fix'))}
        ${permRow(!!P.usage, '📊', L('ইউসেজ অ্যাক্সেস (ঐচ্ছিক)', 'Usage access (optional)'), L('আজকের সঠিক স্ক্রিন-টাইম দেখাতে', 'Shows exact screen time today'), 'usage', L('দাও', 'Allow'))}
      </div>
      <div class="card lav mt small">🔒 ${L('গোপনীয়তা: ফোকাস গার্ড শুধু কোন অ্যাপ সামনে আছে সেটা দেখে। স্ক্রিনের লেখা, মেসেজ বা পাসওয়ার্ড পড়ে না, কোথাও কিছু পাঠায় না।', 'Privacy: Focus Guard only sees which app is in front. It never reads screen text, messages or passwords, and sends nothing anywhere.')}</div>
      <div style="height:20px"></div>`;
  };
  AFTER.guard = function (arg, keep) {
    if (!A.native || keep) return;
    A.native.usageToday().then(u => { if (!u) return; const was = JSON.stringify(U.guardUsage || {}); U.guardUsage = u; if (JSON.stringify(u) !== was && location.hash === '#guard') refresh(); });
    if (!U.appList) loadApps(false);
  };
  function loadApps(force) {
    if (U.appLoading || (U.appList && !force)) return Promise.resolve(U.appList);
    U.appLoading = A.native.listApps().then(list => {
      U.appLoading = null; U.appList = Array.isArray(list) ? list : [];
      U.appIcons = U.appIcons || {}; U.appList.forEach(a => { if (a.icon) U.appIcons[a.pkg] = a.icon; });
      if (location.hash === '#guard') refresh();
      return U.appList;
    });
    return U.appLoading;
  }
  function pushG() { A.save(); if (A.native) A.native.pushGuard(); refresh(); }

  function appsSheet() {
    const g = G(); const have = new Set(g.apps.map(a => a.pkg));
    const list = U.appList;
    const q = (U.appQ || '').toLowerCase();
    let body;
    if (!list) body = `<div class="center" style="padding:40px 0"><div class="spinner"></div><p class="small muted mt">${L('ফোনের অ্যাপগুলো খোঁজা হচ্ছে…', 'Finding apps on your phone…')}</p></div>`;
    else {
      const shown = list.filter(a => !q || a.name.toLowerCase().includes(q));
      const social = shown.filter(a => a.social), other = shown.filter(a => !a.social);
      const item = (a) => `<button class="pick-app ${have.has(a.pkg) ? 'on' : ''}" data-a="gPick" data-p="${esc(a.pkg)}" data-n="${esc(a.name)}">${appIcon(a.pkg)}<span class="grow ellipsis small bold">${esc(a.name)}</span><span class="check-dot">${have.has(a.pkg) ? '✓' : ''}</span></button>`;
      body = `<input class="input" placeholder="🔎 ${L('অ্যাপ খুঁজো', 'Search apps')}" value="${esc(U.appQ || '')}" id="app-q" autocomplete="off">
        ${social.length ? `<div class="eyebrow mt">${L('সময় খেকো অ্যাপ (প্রস্তাবিত)', 'Time-eaters (suggested)')}</div><div class="col mt-s" style="gap:6px">${social.map(item).join('')}</div>` : ''}
        ${other.length ? `<div class="eyebrow mt">${L('অন্যান্য অ্যাপ', 'Other apps')}</div><div class="col mt-s" style="gap:6px">${other.map(item).join('')}</div>` : ''}
        ${!shown.length ? `<p class="center small muted mt">${L('কিছু পাওয়া যায়নি', 'Nothing found')}</p>` : ''}
        <div style="height:10px"></div>`;
    }
    return { head: `<div class="grow"><div class="h2">${L('অ্যাপ বেছে নাও', 'Choose apps')}</div><div class="tiny muted">${L('ট্যাপ করলেই যোগ/বাদ হবে', 'Tap to add/remove')}</div></div>`, body };
  }
  function appSheet(i) {
    const g = G(); const a = g.apps[i]; if (!a) return { head: '', body: '' };
    const used = +(U.guardUsage || {})[a.pkg] || 0; const al = a.allow || { on: false, from: '21:00', to: '22:00' };
    const lims = [0, 10, 15, 20, 30, 45, 60, 90, 120];
    return {
      head: `<div class="row grow" style="gap:12px">${appIcon(a.pkg)}<div class="grow"><div class="h3">${esc(a.name)}</div><div class="tiny muted">${L('আজ ব্যবহার: ', 'Used today: ')}${fmtMin(used)}${L(' মিনিট', ' min')}</div></div></div>`,
      body: `<div class="bold small">⏱️ ${L('দৈনিক সময়সীমা', 'Daily time limit')}</div>
        <div class="chips-wrap mt-s">${lims.map(m => `<button class="chip ${(+a.limit || 0) === m ? 'on' : ''}" data-a="gLimit" data-i="${i}" data-m="${m}">${m ? N(m) + L(' মি.', ' min') : L('লিমিট নেই', 'None')}</button>`).join('')}</div>
        <p class="tiny muted mt-s">${L('লিমিট শেষ হলে সারাদিন এই অ্যাপ খুললেই রোস্ট স্ক্রিন। ৮০% হলে আগেই সতর্ক করবো।', 'After the limit, the app shows the roast screen for the rest of the day. You get a warning at 80%.')}</p>
        <div class="row between mt-l"><div><div class="bold small">🕓 ${L('শুধু এই সময়ে খোলা যাবে', 'Allowed only during')}</div><div class="tiny muted">${L('বাকি সময় পুরো লক', 'Locked at all other times')}</div></div>${tg('gAllowOn', al.on, `data-i="${i}"`)}</div>
        <div class="card tight mt-s ${al.on ? '' : 'dim'}" style="box-shadow:none;border:1px solid var(--line)">
          <div class="row between"><span class="small bold">${L('শুরু', 'From')}</span><input type="time" class="input" style="height:40px;width:130px;padding:0 10px" value="${al.from}" data-ga="from" data-i="${i}"></div>
          <div class="row between mt-s"><span class="small bold">${L('শেষ', 'To')}</span><input type="time" class="input" style="height:40px;width:130px;padding:0 10px" value="${al.to}" data-ga="to" data-i="${i}"></div>
        </div>
        <button class="btn danger block mt-l" data-a="gRemove" data-i="${i}">${ic('trash', 'xs')} ${L('তালিকা থেকে বাদ দাও', 'Remove from list')}</button>
        <div style="height:10px"></div>`
    };
  }
  document.addEventListener('input', (e) => {
    if (e.target.id === 'app-q') { U.appQ = e.target.value; const pos = e.target.selectionStart; A.ui.openSheet(appsSheet); const n = $('#app-q'); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch (er) {} } }
  });
  document.addEventListener('change', (e) => {
    const el = e.target; if (!el.dataset) return;
    if (el.dataset.gt && el.value) { G().schedule[el.dataset.gt] = el.value; pushG(); }
    if (el.dataset.ga && el.value) { const a = G().apps[+el.dataset.i]; if (!a) return; a.allow = a.allow || { on: true, from: '21:00', to: '22:00' }; a.allow[el.dataset.ga] = el.value; pushG(); }
  });
  function accessGuide() {
    const r13 = A.native && A.native.perms().restricted;
    A.ui.modal({
      img: 'assets/mascot.webp', title: L('Accessibility চালু করো', 'Enable Accessibility'),
      body: `<div class="small" style="text-align:left;color:var(--ink-2);line-height:1.75">${L('১. নিচের বাটনে চাপলে সেটিংস খুলবে<br>২. <b>Installed apps / Downloaded apps</b> → <b>SSC 2027 ফোকাস গার্ড</b><br>৩. সুইচ <b>On</b> করো → <b>Allow</b>', '1. Tap the button to open Settings<br>2. <b>Installed / Downloaded apps</b> → <b>SSC 2027 Focus Guard</b><br>3. Switch <b>On</b> → <b>Allow</b>')}
        ${r13 ? `<div class="card peach tight mt-s tiny" style="line-height:1.6">⚠️ ${L('সুইচ ধূসর/“Restricted setting” দেখালে: Settings → Apps → SSC 2027 → উপরে ডানে ⋮ → <b>Allow restricted settings</b> → তারপর আবার চেষ্টা করো।', 'If it is greyed out / “Restricted setting”: Settings → Apps → SSC 2027 → ⋮ (top right) → <b>Allow restricted settings</b>, then try again.')}</div>` : ''}
        <div class="tiny muted mt-s">🔒 ${L('আমরা শুধু কোন অ্যাপ খোলা আছে সেটা দেখি — কোনো লেখা পড়ি না।', 'We only see which app is open — never any text.')}</div></div>`,
      ok: L('সেটিংস খুলো', 'Open settings'), cancel: L('পরে', 'Later'),
      onOk: () => { A.native.openSettings('accessibility'); }
    });
  }
  Object.assign(ACT, {
    gEnable: () => {
      const g = G(); g.enabled = !g.enabled; pushG();
      if (g.enabled) {
        if (!A.native.perms().accessibility) setTimeout(accessGuide, 250);
        else toast(L('ফোকাস গার্ড চালু! পেঁচু স্যার পাহারায় 🦉', 'Focus Guard on! Pechu is on duty 🦉'), '🛡️');
        if (!g.apps.length) setTimeout(() => { if (A.native.perms().accessibility) ACT.gAddApps(); }, 600);
      }
    },
    gAccess: () => accessGuide(),
    gOpen: (el) => { const w = el.dataset.w; if (w === 'notif' && A.native.perms().notif !== 'denied') { A.native.requestNotif().then(refresh); return; } A.native.openSettings(w); },
    gAddApps: () => { U.appQ = ''; A.ui.openSheet(appsSheet); loadApps(false).then(() => A.ui.openSheet(appsSheet)); },
    gPick: (el) => {
      const g = G(); const pkg = el.dataset.p; const i = g.apps.findIndex(a => a.pkg === pkg);
      if (i >= 0) g.apps.splice(i, 1);
      else g.apps.push({ pkg, name: el.dataset.n, limit: 30, on: true, allow: { on: false, from: '21:00', to: '22:00' } });
      A.save(); A.native.pushGuard(); A.haptic(8); refresh();
    },
    gApp: (el) => A.ui.openSheet(() => appSheet(+el.dataset.i)),
    gAppToggle: (el) => { const a = G().apps[+el.dataset.i]; if (a) { a.on = !a.on; pushG(); } },
    gLimit: (el) => { const a = G().apps[+el.dataset.i]; if (a) { a.limit = +el.dataset.m; pushG(); } },
    gAllowOn: (el) => { const a = G().apps[+el.dataset.i]; if (!a) return; a.allow = a.allow || { on: false, from: '21:00', to: '22:00' }; a.allow.on = !a.allow.on; pushG(); },
    gRemove: (el) => { G().apps.splice(+el.dataset.i, 1); A.ui.closeSheet().then(pushG); },
    gSchOn: () => { const s = G().schedule; s.on = !s.on; pushG(); },
    gSchMode: (el) => { G().schedule.mode = el.dataset.v; pushG(); },
    gNudge: (el) => { G().nudgeEvery = +el.dataset.v; pushG(); },
    gNudgeAlways: () => { const g = G(); g.nudgeAlways = !g.nudgeAlways; pushG(); },
    gLockFocus: () => { const g = G(); g.lockFocus = g.lockFocus === false; pushG(); },
    gStrict: () => { const g = G(); g.strict = !g.strict; pushG(); },
    gGraceMin: (el) => { G().graceMin = +el.dataset.v; pushG(); },
    gGraceMax: (el) => { G().graceMax = +el.dataset.v; pushG(); },
    gTest: (el) => {
      A.native.pushGuard();
      const ok = A.native.testOverlay(el.dataset.k);
      if (!ok) accessGuide(); else toast(L('এভাবেই দেখাবে! 👀', 'This is how it looks! 👀'), '🧪', 2500);
    }
  });
  // language change → guard messages follow
  const _toggleLang = ACT.toggleLang;
  ACT.toggleLang = (...a) => { _toggleLang(...a); if (A.native) { A.native.pushGuard(); A.native.scheduleAlarms(); } };
  const _roast = ACT.roast;
  ACT.roast = (...a) => { _roast(...a); if (A.native) { A.native.pushGuard(); A.native.scheduleAlarms(); } };

  /* =========================================================================
     INSTALL PAGE — web app + Android APK
     ========================================================================= */
  SCREENS.install = function () {
    const apk = (A.CFG && A.CFG.APK_URL) || '';
    const standalone = X.isStandalone(); const ios = X.isIOS();
    const isAndroid = /android/i.test(navigator.userAgent);
    const info = A.native ? A.native.info() : null;
    const yes = '<span class="cmp y">✓</span>', no = '<span class="cmp n">—</span>';
    return `${topbar(L('অ্যাপ ইনস্টল করো', 'Install the app'), L('ওয়েব অ্যাপ বা Android APK — যেটা সুবিধা', 'Web app or Android APK — your choice'))}
      ${A.native ? `<div class="card mint row"><div style="font-size:34px">✅</div><div class="grow"><div class="bold">${L('তুমি Android অ্যাপ ব্যবহার করছো', 'You are using the Android app')}</div><div class="tiny muted">${L('ভার্সন ', 'Version ')}${esc(info.version || '')} · Android SDK ${esc(String(info.sdk || ''))}</div></div></div>` : ''}

      <div class="inst-card">
        <div class="row" style="gap:14px"><div class="inst-ic" style="background:var(--lav-100)">🌐</div><div class="grow"><div class="h3">${L('ওয়েব অ্যাপ (PWA)', 'Web app (PWA)')}</div><div class="tiny muted">${L('Android, iPhone, ল্যাপটপ — সব জায়গায়', 'Android, iPhone, laptop — everywhere')}</div></div>${standalone ? `<span class="tag mint">${L('ইনস্টলড ✓', 'Installed ✓')}</span>` : ''}</div>
        <p class="small mt-s" style="color:var(--ink-2)">${L('ব্রাউজার থেকেই হোম স্ক্রিনে যোগ করো। ছোট সাইজ, অটো আপডেট, অফলাইনেও চলে।', 'Add to home screen right from the browser. Tiny, auto-updating, works offline.')}</p>
        ${A.native ? '' : standalone ? `<div class="tiny muted mt-s">${L('এই ডিভাইসে ইনস্টল করা আছে 🎉', 'Already installed on this device 🎉')}</div>` : `<button class="btn primary block mt" data-a="install">📲 ${L('হোম স্ক্রিনে ইনস্টল করো', 'Install to home screen')}</button>`}
      </div>

      <div class="inst-card apk">
        <div class="row" style="gap:14px"><div class="inst-ic" style="background:#E7F8F1">🤖</div><div class="grow"><div class="h3">${L('Android অ্যাপ (APK)', 'Android app (APK)')}</div><div class="tiny muted">${L('সব ফিচার + ফোকাস গার্ড + নিশ্চিত অ্যালার্ম', 'Everything + Focus Guard + reliable alarms')}</div></div><span class="tag peach">${L('নতুন', 'New')}</span></div>
        <ul class="tips-list plain mt-s">
          <li>🛡️ ${L('সোশ্যাল মিডিয়া লক — পড়ার সময় রোস্ট স্ক্রিন দিয়ে আটকায়', 'Social media lock with roast screen during study time')}</li>
          <li>⏰ ${L('অ্যাপ বন্ধ থাকলেও ঠিক সময়ে অ্যালার্ম ও রোস্ট নোটিফিকেশন', 'Alarms & roast notifications even when closed')}</li>
          <li>🏛️ ${L('রেজাল্ট সাইট অ্যাপের ভেতরেই খোলে', 'Result sites open inside the app')}</li>
          <li>🔄 ${L('একই প্রোফাইল, পয়েন্ট ও লিডারবোর্ড', 'Same profile, points & leaderboard')}</li>
        </ul>
        ${A.native ? (apk ? `<button class="btn outline block mt" data-a="apkGet">🔄 ${L('নতুন ভার্সন আছে কিনা দেখো', 'Check for a new version')}</button>` : '') :
          ios ? `<div class="card peach tight mt small">🍎 ${L('iPhone-এ APK চলে না — উপরের ওয়েব অ্যাপটাই ব্যবহার করো।', 'APKs do not run on iPhone — use the web app above.')}</div>` :
            apk ? `<button class="btn mint block mt" data-a="apkGet">⬇️ ${L('APK ডাউনলোড করো', 'Download APK')}</button>` :
              `<div class="card lav tight mt small">📦 ${L('APK ফাইলটি তোমার স্কুল/অ্যাডমিনের কাছ থেকে নাও (GitHub Releases থেকে বিল্ড হয়)। অ্যাডমিন config.js-এ APK_URL বসালে এখানে সরাসরি ডাউনলোড বাটন আসবে।', 'Get the APK from your school/admin (built via GitHub Releases). When the admin sets APK_URL in config.js, a direct download button appears here.')}</div>`}
        ${!A.native && !ios ? `<details class="mt"><summary class="small bold">${L('APK কীভাবে ইনস্টল করবো?', 'How to install the APK?')}</summary>
          <ol class="steps small">
            <li>${L('APK ফাইল ডাউনলোড করো', 'Download the APK file')}</li>
            <li>${L('ফাইলে ট্যাপ করো → “Unknown apps / অজানা উৎস” অনুমতি চাইলে <b>Allow from this source</b> দাও', 'Tap the file → if asked, <b>Allow from this source</b>')}</li>
            <li>${L('<b>Install</b> চাপো (Play Protect সতর্ক করলে “Install anyway”)', 'Tap <b>Install</b> (if Play Protect warns: “Install anyway”)')}</li>
            <li>${L('এখানকার প্রোফাইল ভাষা নিতে: প্রোফাইল → <b>ব্যাকআপ ডাউনলোড</b> → অ্যাপে <b>রিস্টোর</b>। অথবা আইডি + মোবাইল দিয়ে সার্ভার থেকে ফিরিয়ে আনো।', 'To move progress: Profile → <b>Download backup</b> → <b>Restore</b> in the app. Or restore from the server with ID + mobile.')}</li>
          </ol></details>` : ''}
        ${!A.native && !isAndroid && !ios ? `<p class="tiny muted mt-s">💻 ${L('APK শুধু Android ফোনে চলে।', 'APKs run on Android phones only.')}</p>` : ''}
      </div>

      <div class="section-title"><h3>${L('তুলনা', 'Comparison')}</h3></div>
      <div class="card tight cmp-table">
        <div class="cmp-row head"><span></span><span>${L('ওয়েব', 'Web')}</span><span>APK</span></div>
        ${[[L('৯০ দিনের রোডম্যাপ, টাইমার, XP সব', 'Roadmap, timer, XP — all'), yes, yes], [L('iPhone / ল্যাপটপ', 'iPhone / laptop'), yes, no], [L('অফলাইনে চলে', 'Works offline'), yes, yes], [L('অ্যাপ বন্ধ থাকলেও নিশ্চিত অ্যালার্ম', 'Guaranteed alarms when closed'), '<span class="cmp m">~</span>', yes], [L('সোশ্যাল মিডিয়া লক', 'Social media lock'), no, yes], [L('অটো আপডেট', 'Auto update'), yes, L('নতুন APK', 'new APK')]].map(([t, a, b]) => `<div class="cmp-row"><span>${t}</span><span>${a}</span><span>${b}</span></div>`).join('')}
      </div>
      <div style="height:20px"></div>`;
  };
  ACT.apkGet = () => { const u = A.CFG.APK_URL; if (!u) return; if (A.native) A.native.openUrl(u, false); else location.href = u; };
})();
