/* ==========================================================================
   অ্যাডমিন কনফিগারেশন (Admin configuration)
   --------------------------------------------------------------------------
   Google Apps Script ওয়েব অ্যাপ ডিপ্লয় করার পর পাওয়া URL এখানে বসাও।
   (backend/Code.gs ফাইল ও README.md-তে ধাপে ধাপে নির্দেশনা আছে)

   উদাহরণ:
   API_URL: 'https://script.google.com/macros/s/AKfycb..../exec'

   খালি রাখলে অ্যাপ "লোকাল মোডে" চলবে — সব ফিচার কাজ করবে, শুধু
   লিডারবোর্ডে ডেমো ডেটা দেখাবে।
   ========================================================================== */
window.SSC_CONFIG = {
  API_URL: 'https://script.google.com/macros/s/AKfycbwKbQ8VdBpB4OdhF8zER_7uTddeGRtCphOQd1fx9x867gKOWPZsiFtQ7R8WP3GnAs3-QQ/exec',
  // Android APK ডাউনলোড লিংক (GitHub Releases)। GitHub-এ বিল্ড করার পর এভাবে বসাও:
  // 'https://github.com/<তোমার-ইউজারনেম>/<রিপো-নাম>/releases/latest/download/SSC2027.apk'
  // খালি রাখলে "ইনস্টল" পেজে ডাউনলোড বাটনের বদলে নির্দেশনা দেখাবে।
  APK_URL: 'https://github.com/mdfarhad1442/ssc-2027/releases/download/v1.2.0/SSC2027.apk',
  VERSION: '1.2.0'
};
