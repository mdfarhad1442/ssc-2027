/* ==========================================================================
   Plan engine — converts the 12-week plan into concrete, stable daily tasks.
   Pure functions (no DOM) so it can be tested in Node as well.
   ========================================================================== */
(function (root) {
  'use strict';
  const D = root.SSC_DATA;

  function chunk(arr, n) {
    const out = [];
    for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
    return out;
  }

  function phaseOfWeek(w) { return w <= 4 ? 1 : w <= 8 ? 2 : 3; }

  function generate(groupKey) {
    const plan = D.buildPlan(groupKey);
    const tasks = {};
    const tests = {};
    const weeks = [];

    plan.forEach((wk) => {
      const w = wk.n;
      const phase = phaseOfWeek(w);
      const [s, e] = D.WEEK_RANGES[w - 1];
      const studyDays = e - s; // last day = review day
      const groups = []; // each group = array of task objects that belong together
      const unitQueues = [];
      const weekTests = [];

      wk.units.forEach((u, ui) => {
        const [sub, chs, kind, size] = u;
        const q = [];
        const K = D.KINDS;
        if (kind === 'cq') {
          chs.forEach((c) => {
            q.push([
              { id: `w${w}u${ui}c${c}r`, sub, chs: [c], kind: 'read', min: K.read.min, steps: [1] },
              { id: `w${w}u${ui}c${c}b`, sub, chs: [c], kind: 'board', min: K.board.min, steps: [2] }
            ]);
          });
        } else if (['lite', 'lang', 'test', 'revise', 'write'].includes(kind)) {
          chunk(chs, size || 1).forEach((part, pi) => {
            q.push([{ id: `w${w}u${ui}p${pi}`, sub, chs: part, kind, min: K[kind].min * part.length, steps: K[kind].steps.slice() }]);
          });
        } else if (kind === 'model') {
          const tid = `t${w}-${weekTests.length + 1}`;
          weekTests.push({ id: tid, w, sub, type: 'model', total: 100 });
          q.push([{ id: `w${w}u${ui}m`, sub, chs: [], kind: 'model', min: K.model.min, steps: [], testId: tid }]);
        } else {
          q.push([{ id: `w${w}u${ui}${kind}`, sub, chs: [], kind, min: K[kind].min, steps: [] }]);
        }
        unitQueues.push(q);
      });

      // Round-robin interleave subjects for variety, keep chapter order inside each subject
      let added = true;
      while (added) {
        added = false;
        unitQueues.forEach((q) => { if (q.length) { groups.push(q.shift()); added = true; } });
      }

      // Distribute groups across study days, balancing minutes
      const dayLists = Array.from({ length: studyDays }, () => []);
      let remaining = groups.reduce((a, g) => a + g.reduce((x, t) => x + t.min, 0), 0);
      let gi = 0;
      for (let d = 0; d < studyDays; d++) {
        const daysLeft = studyDays - d;
        const target = remaining / daysLeft;
        let mins = 0;
        while (gi < groups.length) {
          const gm = groups[gi].reduce((x, t) => x + t.min, 0);
          const isLastDay = d === studyDays - 1;
          if (!isLastDay && dayLists[d].length && mins + gm > target * 1.2) break;
          dayLists[d].push(...groups[gi]);
          mins += gm; remaining -= gm; gi++;
          if (!isLastDay && mins >= target) break;
        }
      }

      dayLists.forEach((l, i) => { if (!l.length) l.push({ id: `w${w}buf${i}`, sub: '', chs: [], kind: 'buffer', min: D.KINDS.buffer.min, steps: [] }); });

      // Weekly tests for phase 1–2 (on review day)
      if (wk.tests) {
        wk.tests.forEach((sub) => {
          const tid = `t${w}-${weekTests.length + 1}`;
          weekTests.push({ id: tid, w, sub, type: phase === 1 ? 'weekly' : 'half', total: phase === 1 ? 50 : 75 });
        });
      }
      const review = [];
      weekTests.filter(t => t.type !== 'model').forEach((t) => {
        review.push({ id: `w${w}${t.id}`, sub: t.sub, chs: [], kind: 'wtest', min: 60, steps: [], testId: t.id });
      });
      review.push({ id: `w${w}err`, sub: '', chs: [], kind: 'errrev', min: 20, steps: [] });
      review.push({ id: `w${w}ref`, sub: '', chs: [], kind: 'reflect', min: 10, steps: [] });
      dayLists.push(review);

      const days = [];
      dayLists.forEach((list, idx) => {
        const day = s + idx;
        list.forEach((t) => { t.day = day; t.w = w; tasks[t.id] = t; });
        days.push({ day, ids: list.map(t => t.id) });
      });
      weekTests.forEach(t => { tests[t.id] = t; });

      weeks.push({ n: w, phase, range: [s, e], goal: wk.goal, goalEn: wk.goalEn, units: wk.units, days, tests: weekTests.map(t => t.id) });
    });

    const byDay = {};
    Object.values(tasks).forEach(t => { (byDay[t.day] = byDay[t.day] || []).push(t.id); });
    return { group: groupKey, weeks, tasks, tests, byDay, totalTasks: Object.keys(tasks).length };
  }

  root.SSC_ENGINE = { generate, phaseOfWeek };
})(typeof window !== 'undefined' ? window : globalThis);
