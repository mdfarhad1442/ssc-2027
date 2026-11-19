/* Boot */
(function () {
  'use strict';
  const A = window.App;
  document.documentElement.lang = A.S().settings.lang === 'en' ? 'en' : 'bn';
  A.dailyCheck();
  A.ui.render();
  A.startLoops();
  if (A.S().profile) { A.scheduleSync(3000); }

  // Inside the Android app the files are bundled in the APK → no service worker needed (and none left behind)
  if (A.isApp && 'serviceWorker' in navigator) navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister())).catch(() => {});
  if (!A.isApp && 'serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').then((reg) => {
        if (A.S().settings.notif) { A.scheduleNativeTriggers(); A.registerPeriodic(); }
        const notifyUpdate = (w) => {
          A.ui.modal({ emoji: '✨', title: A.L('নতুন আপডেট এসেছে!', 'Update available!'), body: '<p class="small muted">' + A.L('নতুন ফিচার ও ঠিকঠাক করা হয়েছে। এখনই আপডেট করবে?', 'New features and fixes are ready. Update now?') + '</p>', ok: A.L('আপডেট করো', 'Update'), cancel: A.L('পরে', 'Later'), onOk: () => { w.postMessage('skipWaiting'); } });
        };
        if (reg.waiting && navigator.serviceWorker.controller) notifyUpdate(reg.waiting);
        reg.addEventListener('updatefound', () => {
          const w = reg.installing; if (!w) return;
          w.addEventListener('statechange', () => { if (w.state === 'installed' && navigator.serviceWorker.controller) notifyUpdate(w); });
        });
        setInterval(() => reg.update().catch(() => {}), 60 * 60 * 1000);
      }).catch((e) => console.warn('SW failed', e));
      let reloaded = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => { if (reloaded) return; reloaded = true; location.reload(); });
      navigator.serviceWorker.addEventListener('message', (e) => { if (e.data && e.data.go) location.hash = e.data.go; });
    });
  }
})();
