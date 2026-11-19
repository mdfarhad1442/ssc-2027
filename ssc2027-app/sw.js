/* SSC 2027 — Service Worker (offline-first + background nudges) */
const VERSION = 'ssc27-v1.2.0';
const CORE = [
  './', './index.html', './manifest.webmanifest', './css/styles.css',
  './js/config.js', './js/data.js', './js/engine.js', './js/core.js', './js/native.js', './js/ui.js', './js/extras.js', './js/custom.js', './js/main.js',
  './fonts/HindSiliguri-Regular.woff2', './fonts/HindSiliguri-SemiBold.woff2', './fonts/HindSiliguri-Bold.woff2',
  './assets/mascot.webp', './assets/desk.webp', './assets/rocket.webp', './assets/trophy.webp', './assets/books.webp',
  './icons/icon-192.png', './icons/icon-512.png', './icons/favicon.png', './icons/apple-touch-icon.png'
];
const ROASTS = [
  'পড়ার টেবিল তোমাকে মিস করছে 🥲 বইগুলো ধুলো জমাচ্ছে, আর তুমি জমাচ্ছ রিলস!',
  'ফোন স্ক্রল করে GPA 5 আসে না, আসে শুধু চোখের নিচে কালি 👀',
  'নিউটন আপেল পড়তে দেখে মহাকর্ষ আবিষ্কার করেছিল, আর তুমি আপেল খেয়ে ঘুমিয়ে পড়লে 🍎😴',
  'আজকের টাস্ক: অনেক। তোমার কমপ্লিট: ০। গণিত তো পারো, হিসাবটা মিলাও 😏',
  'স্ট্রিক ভেঙে যাচ্ছে! ২০ মিনিট পড়লেই বাঁচবে—ডাক্তার পেঁচুর প্রেসক্রিপশন 🩺',
  'তোমার পড়ার গতি দেখে শামুকও ওভারটেক করে চলে গেল 🐌💨'
];
const SOFT = ['এক ধাপ, শুধু এক ধাপ 💜 ২৫ মিনিট পড়ে এসো', 'তুমি পারবে! আজকের প্রথম টাস্কটা শুরু করো 🌱'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(CORE)));
});
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== VERSION && k !== 'ssc-state').map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('message', (e) => { if (e.data === 'skipWaiting') self.skipWaiting(); });

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // API & external: network only
  if (url.pathname.endsWith('/__state.json')) return;
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      const cache = await caches.open(VERSION);
      try {
        const fresh = await fetch(req);
        if (fresh && fresh.ok) cache.put('./index.html', fresh.clone());
        return fresh;
      } catch (err) {
        return (await cache.match('./index.html')) || (await cache.match('./')) || Response.error();
      }
    })());
    return;
  }
  // stale-while-revalidate for static assets
  e.respondWith((async () => {
    const cache = await caches.open(VERSION);
    const hit = await cache.match(req, { ignoreSearch: true });
    const net = fetch(req).then((res) => { if (res && res.ok && res.type === 'basic') cache.put(req, res.clone()); return res; }).catch(() => null);
    return hit || (await net) || Response.error();
  })());
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const target = (e.notification.data && e.notification.data.url) || './#planner';
  e.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of all) {
      if ('focus' in c) { await c.focus(); try { c.postMessage({ go: target.split('#')[1] ? '#' + target.split('#')[1] : '#home' }); } catch (err) {} return; }
    }
    if (self.clients.openWindow) await self.clients.openWindow(target);
  })());
});

async function readState() {
  try { const c = await caches.open('ssc-state'); const r = await c.match('./__state.json'); return r ? await r.json() : null; } catch (e) { return null; }
}
async function markNudged(key) {
  const c = await caches.open('ssc-state'); await c.put('./__nudged.json', new Response(JSON.stringify({ key })));
}
async function lastNudged() {
  try { const c = await caches.open('ssc-state'); const r = await c.match('./__nudged.json'); return r ? (await r.json()).key : null; } catch (e) { return null; }
}
function todayKey() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }

async function nudge() {
  const st = await readState(); if (!st) return;
  const now = new Date(); const h = now.getHours();
  if (h < 8 || h > 22) return; // never at night
  const today = todayKey();
  const slot = today + (h < 14 ? '-am' : h < 19 ? '-pm' : '-eve');
  if ((await lastNudged()) === slot) return;
  const studiedToday = st.today === today && st.done > 0;
  if (studiedToday) return;
  const pool = st.roast === 'soft' ? SOFT : ROASTS;
  const body = (st.today !== today ? 'আজ তো অ্যাপটাই খোলোনি! ' : '') + pool[Math.floor(Math.random() * pool.length)];
  await self.registration.showNotification(h < 14 ? '⏰ পড়ার সময় হয়েছে!' : '😤 আজ এখনো কিছু পড়োনি!', { body, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', tag: 'nudge', renotify: true, data: { url: './#planner' } });
  await markNudged(slot);
}
self.addEventListener('periodicsync', (e) => { if (e.tag === 'ssc-nudge') e.waitUntil(nudge()); });

// Ready for future server push (e.g. Firebase Cloud Messaging)
self.addEventListener('push', (e) => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch (err) { d = { body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.title || 'SSC 2027', { body: d.body || ROASTS[0], icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', data: { url: d.url || './#planner' } }));
});
