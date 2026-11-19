package com.ssc2027.app;

import android.accessibilityservice.AccessibilityService;
import android.content.BroadcastReceiver;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.os.PowerManager;
import android.provider.Settings;
import android.text.TextUtils;
import android.view.accessibility.AccessibilityEvent;
import android.view.inputmethod.InputMethodInfo;
import android.view.inputmethod.InputMethodManager;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.HashSet;
import java.util.Random;
import java.util.Set;

/**
 * Focus Guard.
 * Watches ONLY which app is in the foreground (window-state events). When a guarded social app
 * is opened while a focus session runs, during study hours, or after its daily limit, it draws the
 * roast overlay on top of it. "One more minute" grants a short grace; when it ends the overlay
 * comes back again — again and again.
 * It never reads screen content, typed text or notifications.
 */
public class GuardService extends AccessibilityService {
    static volatile GuardService instance;
    private static final long TICK_MS = 5000;
    private final Handler h = new Handler(Looper.getMainLooper());
    private final Random rnd = new Random();
    private final Set<String> ignore = new HashSet<>();
    private GuardOverlay overlay;
    private String fg = "";
    private long lastTick = 0, enteredAt = 0, lastNudgeAt = 0;
    private boolean screenOn = true;

    private final Runnable tick = new Runnable() {
        @Override public void run() {
            accumulate();
            evaluate(false);
            if (isGuarded(fg) && screenOn) h.postDelayed(this, TICK_MS);
        }
    };

    private final BroadcastReceiver screenRx = new BroadcastReceiver() {
        @Override public void onReceive(Context c, Intent i) {
            String a = i.getAction();
            if (Intent.ACTION_SCREEN_OFF.equals(a)) {
                accumulate();
                screenOn = false;
                h.removeCallbacks(tick);
            } else if (Intent.ACTION_USER_PRESENT.equals(a) || Intent.ACTION_SCREEN_ON.equals(a)) {
                screenOn = true;
                lastTick = System.currentTimeMillis();
                restartTick();
            }
        }
    };

    // ------------------------------------------------------------------ lifecycle
    @Override
    protected void onServiceConnected() {
        super.onServiceConnected();
        instance = this;
        overlay = new GuardOverlay(this);
        ignore.add(getPackageName() + ":overlay");
        ignore.add("com.android.systemui");
        ignore.add("android");
        try {
            InputMethodManager imm = (InputMethodManager) getSystemService(INPUT_METHOD_SERVICE);
            if (imm != null) for (InputMethodInfo i : imm.getInputMethodList()) ignore.add(i.getPackageName());
        } catch (Exception ignored) {}
        IntentFilter f = new IntentFilter();
        f.addAction(Intent.ACTION_SCREEN_OFF);
        f.addAction(Intent.ACTION_SCREEN_ON);
        f.addAction(Intent.ACTION_USER_PRESENT);
        registerReceiver(screenRx, f);
        PowerManager pm = (PowerManager) getSystemService(POWER_SERVICE);
        screenOn = pm == null || pm.isInteractive();
        Store.cleanup(this);
    }

    @Override
    public void onAccessibilityEvent(AccessibilityEvent e) {
        if (e == null || e.getEventType() != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return;
        CharSequence p = e.getPackageName();
        if (p == null) return;
        String pkg = p.toString();
        if (ignore.contains(pkg)) return;
        if (pkg.equals(getPackageName())) {
            // our own overlay window also fires events — only real activities count
            CharSequence cls = e.getClassName();
            if (cls == null || !cls.toString().startsWith(getPackageName() + ".")) return;
        }
        if (pkg.equals(fg)) return;
        accumulate();
        fg = pkg;
        long now = System.currentTimeMillis();
        lastTick = now;
        enteredAt = now;
        if (!isGuarded(pkg)) {
            if (overlay != null && overlay.isShowing()) overlay.hide();
            h.removeCallbacks(tick);
            return;
        }
        evaluate(true);
        restartTick();
    }

    @Override public void onInterrupt() {}

    @Override
    public void onDestroy() {
        instance = null;
        h.removeCallbacksAndMessages(null);
        if (overlay != null) overlay.hide();
        try { unregisterReceiver(screenRx); } catch (Exception ignored) {}
        super.onDestroy();
    }

    @Override
    public boolean onUnbind(Intent intent) {
        instance = null;
        if (overlay != null) overlay.hide();
        return super.onUnbind(intent);
    }

    // ------------------------------------------------------------------ public hooks
    /** Called by the bridge after config / focus-lock changes. */
    static void refresh() {
        GuardService s = instance;
        if (s == null) return;
        s.h.post(() -> { s.evaluate(false); s.restartTick(); });
    }

    static boolean isEnabled(Context c) {
        if (instance != null) return true;
        try {
            String on = Settings.Secure.getString(c.getContentResolver(), Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES);
            if (TextUtils.isEmpty(on)) return false;
            ComponentName me = new ComponentName(c, GuardService.class);
            for (String s : on.split(":")) {
                ComponentName cn = ComponentName.unflattenFromString(s);
                if (me.equals(cn)) return true;
            }
        } catch (Exception ignored) {}
        return false;
    }

    /** Preview the overlay from the settings screen. */
    static boolean test(String kind) {
        GuardService s = instance;
        if (s == null) return false;
        s.h.post(() -> s.showTest(kind));
        return true;
    }

    // ------------------------------------------------------------------ core logic
    private void restartTick() {
        h.removeCallbacks(tick);
        if (isGuarded(fg) && screenOn) h.postDelayed(tick, TICK_MS);
    }

    private boolean isGuarded(String pkg) {
        JSONObject cfg = Store.guard(this);
        return cfg.optBoolean("enabled", false) && Store.guardApp(cfg, pkg) != null;
    }

    private void accumulate() {
        long now = System.currentTimeMillis();
        if (lastTick > 0 && screenOn && isGuarded(fg)) {
            boolean blocked = overlay != null && overlay.isShowing() && overlay.kind() == GuardOverlay.BLOCK;
            long d = Math.min(now - lastTick, TICK_MS * 2) / 1000;
            if (!blocked && d > 0) Store.addUsage(this, fg, d);
        }
        lastTick = now;
    }

    private void evaluate(boolean entered) {
        if (overlay == null) return;
        JSONObject cfg = Store.guard(this);
        JSONObject app = cfg.optBoolean("enabled", false) ? Store.guardApp(cfg, fg) : null;
        if (app == null) {
            if (overlay.isShowing() && !"test".equals(overlay.reason())) overlay.hide();
            return;
        }
        if (overlay.isShowing() && "test".equals(overlay.reason())) return;
        long now = System.currentTimeMillis();
        String name = app.optString("name", "এই অ্যাপ");
        long usedSec = Store.usage(this, fg);
        int limit = app.optInt("limit", 0);
        boolean strict = cfg.optBoolean("strict", false);
        int graceMax = cfg.optInt("graceMax", 3);
        boolean graceOk = !strict && Store.count(this, "grace") < graceMax;
        long lock = Store.studyLockUntil(this);

        if (lock > now) { block("focus", app, name, usedSec, limit, false, cfg, lock); return; }
        if (Store.graceUntil(this, fg) > now) {
            if (overlay.isShowing() && overlay.kind() == GuardOverlay.BLOCK) overlay.hide();
            return;
        }
        if (limit > 0 && usedSec >= limit * 60L) { block("limit", app, name, usedSec, limit, graceOk, cfg, 0); return; }
        JSONObject allow = app.optJSONObject("allow");
        if (allow != null && allow.optBoolean("on", false) && !Store.inWindow(allow.optString("from"), allow.optString("to"))) {
            block("window", app, name, usedSec, limit, graceOk, cfg, 0); return;
        }
        JSONObject sch = cfg.optJSONObject("schedule");
        boolean inStudy = sch != null && sch.optBoolean("on", false) && Store.inWindow(sch.optString("from"), sch.optString("to"));
        if (inStudy && "block".equals(sch.optString("mode"))) { block("study", app, name, usedSec, limit, graceOk, cfg, 0); return; }

        if (overlay.isShowing() && overlay.kind() == GuardOverlay.BLOCK) overlay.hide();

        // early warning at 80% of the limit (once per app per day)
        if (limit > 0 && usedSec >= limit * 48L && Store.count(this, "warn:" + fg) == 0) {
            Store.inc(this, "warn:" + fg);
            long leftMin = Math.max(1, (limit * 60L - usedSec) / 60);
            boolean bn = Store.isBn(this);
            Notif.show(this, 6000, Notif.CH_ROAST,
                    bn ? "⚠️ " + name + "-এ আর " + Store.num(this, leftMin) + " মিনিট বাকি" : "⚠️ " + leftMin + " min left on " + name,
                    bn ? "লিমিট শেষ হলেই পেঁচু স্যার দরজা বন্ধ করে দেবে 🦉🔒" : "When the limit ends, Pechu locks the door 🦉🔒", "guard");
        }

        // repeated nudges during study hours
        int every = Math.max(1, Math.min(10, cfg.optInt("nudgeEvery", 2)));
        boolean nudgeAlways = cfg.optBoolean("nudgeAlways", false);
        if ((inStudy || nudgeAlways) && !overlay.isShowing()) {
            boolean due = entered ? (now - lastNudgeAt > 60_000) : (now - lastNudgeAt >= every * 60_000L && now - enteredAt >= every * 60_000L - 1000);
            if (due) nudge(app, name, usedSec, cfg);
        }
    }

    private void block(String reason, JSONObject app, String name, long usedSec, int limit, boolean graceOk, JSONObject cfg, long lockUntil) {
        boolean bn = Store.isBn(this);
        long usedMin = usedSec / 60;
        String reasonText;
        String title;
        if ("focus".equals(reason)) {
            long left = Math.max(1, (lockUntil - System.currentTimeMillis() + 59_999) / 60_000);
            title = bn ? "🎯 ফোকাস সেশন চলছে!" : "🎯 Focus session running!";
            reasonText = bn ? "সেশন শেষ হতে আর " + Store.num(this, left) + " মিনিট — এখন " + name + " না, বই!" : left + " min left in your session — books now, not " + name + "!";
        } else if ("limit".equals(reason)) {
            title = bn ? "⛔ আজকের " + name + " কোটা শেষ!" : "⛔ Today's " + name + " quota is over!";
            reasonText = bn ? "আজকের লিমিট " + Store.num(this, limit) + " মিনিট — তুমি চালিয়েছ " + Store.num(this, usedMin) + " মিনিট" : "Daily limit " + limit + " min — you've used " + usedMin + " min";
        } else if ("window".equals(reason)) {
            JSONObject al = app.optJSONObject("allow");
            String from = al == null ? "" : al.optString("from"), to = al == null ? "" : al.optString("to");
            title = bn ? "🚫 এখন " + name + "-এর সময় না!" : "🚫 Not " + name + " time!";
            reasonText = bn ? name + " খোলা যাবে শুধু " + Store.bnDigits(from) + "–" + Store.bnDigits(to) + "-এর মধ্যে" : name + " is allowed only " + from + "–" + to;
        } else {
            JSONObject sch = cfg.optJSONObject("schedule");
            String from = sch == null ? "" : sch.optString("from"), to = sch == null ? "" : sch.optString("to");
            title = bn ? "📚 এখন পড়ার সময়!" : "📚 It's study time!";
            reasonText = bn ? "পড়ার সময় " + Store.bnDigits(from) + "–" + Store.bnDigits(to) + "। এই সময়ে " + name + " বন্ধ।" : "Study hours " + from + "–" + to + ". " + name + " is closed now.";
        }
        // Same overlay already up → only refresh the line (e.g. focus minutes left)
        if (overlay.isShowing() && overlay.kind() == GuardOverlay.BLOCK && fg.equals(overlay.pkg()) && reason.equals(overlay.reason())) {
            overlay.updateReason(reasonText);
            return;
        }
        Store.inc(this, "blocks");
        String msg = pickMsg(cfg, reason, fg, name);
        int graceMin = Math.max(1, Math.min(5, cfg.optInt("graceMin", 1)));
        int graceLeft = Math.max(0, cfg.optInt("graceMax", 3) - Store.count(this, "grace"));
        String pill = (bn ? "🛡️ ফোকাস গার্ড · " : "🛡️ Focus Guard · ") + name;
        String usage = limit > 0 && !"limit".equals(reason)
                ? (bn ? "আজ " + name + ": " + Store.num(this, usedMin) + "/" + Store.num(this, limit) + " মিনিট" : "Today on " + name + ": " + usedMin + "/" + limit + " min")
                : (bn ? "আজ " + Store.num(this, Store.count(this, "blocks")) + " বার আটকানো হয়েছে 😏" : "Blocked " + Store.count(this, "blocks") + " times today 😏");
        String ret = bn ? "📚 পড়তে ফিরে যাই  (+৫ XP)" : "📚 Back to study  (+5 XP)";
        String home = bn ? "🏠 হোম স্ক্রিনে যাই" : "🏠 Go to home screen";
        String grace = graceOk ? (bn ? "😩 আর " + Store.num(this, graceMin) + " মিনিট দাও প্লিজ" : "😩 Just " + graceMin + " more min please") : null;
        String graceNote = graceOk ? (bn ? "আজ আর " + Store.num(this, graceLeft) + " বার নেওয়া যাবে — তারপর আবার এই স্ক্রিন!" : graceLeft + " left today — then this screen returns!") : null;
        final String pkgNow = fg;
        overlay.showBlock(pkgNow, reason, pill, title, msg, reasonText, usage, ret, home, grace, graceNote,
                cfg.optInt("waitSec", 10), new GuardOverlay.Actions() {
                    @Override public void onReturn() { goStudy(); }
                    @Override public void onHome() { overlay.hide(); performGlobalAction(GLOBAL_ACTION_HOME); }
                    @Override public void onGrace() {
                        Store.inc(GuardService.this, "grace");
                        Store.setGrace(GuardService.this, pkgNow, System.currentTimeMillis() + graceMin * 60_000L);
                        overlay.hide();
                        restartTick();
                    }
                    @Override public void onDismiss() { overlay.hide(); }
                });
    }

    private void nudge(JSONObject app, String name, long usedSec, JSONObject cfg) {
        lastNudgeAt = System.currentTimeMillis();
        Store.inc(this, "nudges");
        boolean bn = Store.isBn(this);
        String msg = pickMsg(cfg, "nudge", fg, name);
        String sub = bn ? "আজ " + name + "-এ " + Store.num(this, usedSec / 60) + " মিনিট হয়ে গেছে" : usedSec / 60 + " min on " + name + " today";
        overlay.showNudge(fg, bn ? "⏰ এখনো পড়ার সময়!" : "⏰ It's still study time!", msg, sub,
                bn ? "📚 পড়তে যাই (+৫ XP)" : "📚 Go study (+5 XP)",
                bn ? "ঠিক আছে, বুঝেছি 😒" : "Okay, got it 😒",
                cfg.optInt("nudgeWait", 5), new GuardOverlay.Actions() {
                    @Override public void onReturn() { goStudy(); }
                    @Override public void onHome() { overlay.hide(); }
                    @Override public void onGrace() { overlay.hide(); }
                    @Override public void onDismiss() { overlay.hide(); lastNudgeAt = System.currentTimeMillis(); }
                });
    }

    private void goStudy() {
        overlay.hide();
        Store.inc(this, "returns");
        Store.setRoute(this, "focus", true);
        Intent i = new Intent(this, MainActivity.class);
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        i.putExtra(MainActivity.EXTRA_ROUTE, "focus");
        i.putExtra(MainActivity.EXTRA_GUARD_RETURN, true);
        try { startActivity(i); } catch (Exception e) { performGlobalAction(GLOBAL_ACTION_HOME); }
    }

    private void showTest(String kind) {
        boolean bn = Store.isBn(this);
        JSONObject cfg = Store.guard(this);
        String name = "Facebook";
        if ("nudge".equals(kind)) {
            overlay.showNudge("test", bn ? "⏰ এখনো পড়ার সময়!" : "⏰ It's still study time!", pickMsg(cfg, "nudge", "com.facebook.katana", name),
                    bn ? "এটা শুধু একটা প্রিভিউ 😉" : "This is just a preview 😉",
                    bn ? "📚 পড়তে যাই" : "📚 Go study", bn ? "ঠিক আছে, বুঝেছি 😒" : "Okay, got it 😒", 3, testActions());
        } else {
            overlay.showBlock("test", "test", (bn ? "🛡️ ফোকাস গার্ড · " : "🛡️ Focus Guard · ") + name,
                    bn ? "⛔ আজকের Facebook কোটা শেষ!" : "⛔ Today's Facebook quota is over!",
                    pickMsg(cfg, "limit", "com.facebook.katana", name),
                    bn ? "এটা শুধু একটা প্রিভিউ — আসল অ্যাপে এভাবেই আসবে" : "Just a preview — this is how it appears over real apps",
                    "", bn ? "📚 পড়তে ফিরে যাই  (+৫ XP)" : "📚 Back to study  (+5 XP)", bn ? "🏠 বন্ধ করো" : "🏠 Close",
                    bn ? "😩 আর ১ মিনিট দাও প্লিজ" : "😩 Just 1 more min please", bn ? "প্রিভিউ মোড" : "Preview mode", 4, testActions());
        }
    }

    private GuardOverlay.Actions testActions() {
        return new GuardOverlay.Actions() {
            @Override public void onReturn() { overlay.hide(); }
            @Override public void onHome() { overlay.hide(); }
            @Override public void onGrace() { overlay.hide(); }
            @Override public void onDismiss() { overlay.hide(); }
        };
    }

    // ------------------------------------------------------------------ messages
    private static final String[] DEF_BN = {
            "{app} স্ক্রল করে GPA 5 আসে না, আসে শুধু চোখের নিচে কালি 👀",
            "নিউজফিড কখনো শেষ হবে না, কিন্তু পরীক্ষার দিন ঠিকই চলে আসবে! 📅",
            "তুমি {app} চালাচ্ছ, আর তোমার প্রতিদ্বন্দ্বী এখন একটা অধ্যায় শেষ করল 😏",
            "এই রিলস দেখে বোর্ড পরীক্ষায় একটা নম্বরও বাড়বে না, গ্যারান্টি দিলাম 🦉",
            "বইগুলো টেবিলে বসে কাঁদছে, আর তুমি {app}-এ হাসছ? 🥲",
            "আর একটা ভিডিও… আর একটা… এভাবেই ৩ ঘণ্টা গায়েব হয়ে যায় 🫠",
            "ফোন রাখো, কলম ধরো — ভবিষ্যতের তুমি ধন্যবাদ দেবে 💜",
            "{app} তোমাকে রেজাল্ট দেবে না, বই দেবে। সিদ্ধান্ত তোমার 😌"
    };
    private static final String[] DEF_EN = {
            "Scrolling {app} won't give you GPA 5 — just dark circles 👀",
            "The feed never ends, but exam day will come for sure! 📅",
            "You're on {app} while your rival just finished a chapter 😏",
            "Put the phone down, pick up the pen — future you says thanks 💜"
    };

    private String pickMsg(JSONObject cfg, String reason, String pkg, String name) {
        JSONObject m = cfg.optJSONObject("msgs");
        JSONArray pool = null;
        if (m != null) {
            JSONObject apps = m.optJSONObject("apps");
            JSONArray ap = apps == null ? null : apps.optJSONArray(pkg);
            if (ap != null && ap.length() > 0 && rnd.nextBoolean()) pool = ap;
            if (pool == null) pool = m.optJSONArray("focus".equals(reason) ? "focus" : "nudge".equals(reason) ? "nudge" : "general");
            if (pool == null || pool.length() == 0) pool = m.optJSONArray("general");
        }
        String s;
        if (pool != null && pool.length() > 0) s = pool.optString(rnd.nextInt(pool.length()));
        else {
            String[] d = Store.isBn(this) ? DEF_BN : DEF_EN;
            s = d[rnd.nextInt(d.length)];
        }
        return s.replace("{app}", name);
    }

    @SuppressWarnings("unused")
    private static boolean atLeast(int sdk) { return Build.VERSION.SDK_INT >= sdk; }
}
