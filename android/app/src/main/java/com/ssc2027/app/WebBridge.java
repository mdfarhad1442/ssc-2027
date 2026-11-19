package com.ssc2027.app;

import android.app.AppOpsManager;
import android.app.usage.UsageEvents;
import android.app.usage.UsageStatsManager;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.drawable.Drawable;
import android.net.Uri;
import android.os.Build;
import android.os.PowerManager;
import android.os.Process;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.provider.Settings;
import android.util.Base64;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/** JavaScript ⇄ Android bridge, exposed to the web app as window.SSCAndroid. */
public class WebBridge {
    private final MainActivity act;
    private final WebView web;
    private final Context app;

    /** Well-known distracting apps — shown first in the Focus Guard list. */
    static final Set<String> SOCIAL = new HashSet<>(Arrays.asList(
            "com.facebook.katana", "com.facebook.lite", "com.facebook.orca", "com.facebook.mlite",
            "com.instagram.android", "com.instagram.lite", "com.zhiliaoapp.musically", "com.ss.android.ugc.trill",
            "com.zhiliaoapp.musically.go", "com.google.android.youtube", "app.revanced.android.youtube",
            "com.whatsapp", "com.whatsapp.w4b", "com.snapchat.android", "org.telegram.messenger", "org.thunderdog.challegram",
            "com.twitter.android", "video.like", "com.imo.android.imoim", "com.imo.android.imoimbeta",
            "com.pinterest", "com.reddit.frontpage", "com.discord", "com.netflix.mediaclient",
            "com.dts.freefireth", "com.dts.freefiremax", "com.tencent.ig", "com.pubg.imobile", "com.activision.callofduty.shooter",
            "com.supercell.clashofclans", "com.mobile.legends", "com.kiloo.subwaysurf", "com.roblox.client",
            "com.likee.video", "com.bigo.live", "sg.bigo.live", "com.threads.android", "com.instagram.barcelona",
            "com.viber.voip", "com.linkedin.android", "com.google.android.apps.youtube.music", "com.mxtech.videoplayer.ad"
    ));

    WebBridge(MainActivity a, WebView w) {
        act = a;
        web = w;
        app = a.getApplicationContext();
    }

    void resolve(int id, String json) {
        web.post(() -> web.evaluateJavascript("window.SSCNative&&SSCNative.cb(" + id + "," + MainActivity.q(json) + ")", null));
    }

    // ------------------------------------------------------------------ info & permissions
    @JavascriptInterface
    public String info() {
        try {
            JSONObject o = new JSONObject();
            o.put("version", app.getPackageManager().getPackageInfo(app.getPackageName(), 0).versionName);
            o.put("sdk", Build.VERSION.SDK_INT);
            o.put("brand", Build.BRAND);
            o.put("model", Build.MODEL);
            return o.toString();
        } catch (Exception e) {
            return "{}";
        }
    }

    @JavascriptInterface
    public String permState() {
        try {
            JSONObject o = new JSONObject();
            boolean notif = Notif.allowed(app);
            o.put("notif", notif ? "granted" : (Store.p(app).getBoolean("askedNotif", false) ? "denied" : "default"));
            o.put("accessibility", GuardService.isEnabled(app));
            o.put("running", GuardService.instance != null);
            o.put("usage", hasUsage());
            PowerManager pm = (PowerManager) app.getSystemService(Context.POWER_SERVICE);
            o.put("battery", pm != null && pm.isIgnoringBatteryOptimizations(app.getPackageName()));
            o.put("exact", Alarms.exactAllowed(app));
            o.put("sdk", Build.VERSION.SDK_INT);
            o.put("restricted", Build.VERSION.SDK_INT >= 33);
            return o.toString();
        } catch (Exception e) {
            return "{}";
        }
    }

    @JavascriptInterface
    public void requestNotif(int cb) {
        Store.p(app).edit().putBoolean("askedNotif", true).apply();
        act.requestNotifPermission(cb);
    }

    @JavascriptInterface
    public void openSettings(String which) {
        Intent i;
        String pkg = app.getPackageName();
        switch (which == null ? "" : which) {
            case "accessibility":
                i = new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS);
                break;
            case "usage":
                i = new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS);
                break;
            case "battery":
                i = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS, Uri.parse("package:" + pkg));
                break;
            case "notif":
                if (Build.VERSION.SDK_INT >= 26) {
                    i = new Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).putExtra(Settings.EXTRA_APP_PACKAGE, pkg);
                } else {
                    i = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:" + pkg));
                }
                break;
            case "exact":
                i = Build.VERSION.SDK_INT >= 31
                        ? new Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM, Uri.parse("package:" + pkg))
                        : new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:" + pkg));
                break;
            default:
                i = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:" + pkg));
        }
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        try {
            act.startActivity(i);
        } catch (Exception e) {
            try {
                act.startActivity(new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:" + pkg)).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK));
            } catch (Exception ignored) {}
        }
    }

    private boolean hasUsage() {
        try {
            AppOpsManager ops = (AppOpsManager) app.getSystemService(Context.APP_OPS_SERVICE);
            int mode = Build.VERSION.SDK_INT >= 29
                    ? ops.unsafeCheckOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, Process.myUid(), app.getPackageName())
                    : ops.checkOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, Process.myUid(), app.getPackageName());
            return mode == AppOpsManager.MODE_ALLOWED;
        } catch (Exception e) {
            return false;
        }
    }

    // ------------------------------------------------------------------ notifications & alarms
    @JavascriptInterface
    public void notify(String title, String body, String tag, String route) {
        int id = 4000 + Math.abs((tag == null ? "ssc" : tag).hashCode() % 900);
        Notif.show(app, id, tag != null && tag.contains("miss") ? Notif.CH_ROAST : Notif.CH_ALARM, title, body, route);
    }

    @JavascriptInterface
    public void scheduleAlarms(String json) {
        Store.putJson(app, "alarms", json);
        Alarms.scheduleAll(app);
    }

    @JavascriptInterface
    public void syncState(String json) {
        Store.putJson(app, "state", json);
    }

    // ------------------------------------------------------------------ focus guard
    @JavascriptInterface
    public void setGuardConfig(String json) {
        Store.putJson(app, "guard", json);
        GuardService.refresh();
    }

    @JavascriptInterface
    public String getGuardConfig() {
        return Store.guard(app).toString();
    }

    @JavascriptInterface
    public void setStudyLock(double untilMs, String label) {
        Store.setStudyLock(app, (long) untilMs, label);
        GuardService.refresh();
    }

    @JavascriptInterface
    public String guardStats() {
        try {
            JSONObject o = new JSONObject();
            o.put("usage", Store.usageToday(app));
            o.put("blocks", Store.count(app, "blocks"));
            o.put("grace", Store.count(app, "grace"));
            o.put("returns", Store.count(app, "returns"));
            o.put("nudges", Store.count(app, "nudges"));
            o.put("running", GuardService.instance != null);
            return o.toString();
        } catch (Exception e) {
            return "{}";
        }
    }

    @JavascriptInterface
    public boolean testOverlay(String kind) {
        return GuardService.test(kind);
    }

    /** Launchable apps with small icons (async, social apps first). */
    private static volatile String appsCache = null;
    private static volatile long appsCacheAt = 0;

    @JavascriptInterface
    public void listApps(int cb) {
        String cached = appsCache;
        if (cached != null && System.currentTimeMillis() - appsCacheAt < 120000) { resolve(cb, cached); return; }
        new Thread(() -> {
            JSONArray out = new JSONArray();
            try {
                PackageManager pm = app.getPackageManager();
                Intent main = new Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_LAUNCHER);
                List<ResolveInfo> list = pm.queryIntentActivities(main, 0);
                List<JSONObject> items = new ArrayList<>();
                Set<String> seen = new HashSet<>();
                for (ResolveInfo ri : list) {
                    String pkg = ri.activityInfo.packageName;
                    if (pkg.equals(app.getPackageName()) || !seen.add(pkg)) continue;
                    JSONObject o = new JSONObject();
                    o.put("pkg", pkg);
                    o.put("name", ri.loadLabel(pm).toString());
                    o.put("social", SOCIAL.contains(pkg));
                    o.put("icon", iconB64(ri.loadIcon(pm)));
                    items.add(o);
                }
                Collections.sort(items, (a, b) -> {
                    boolean sa = a.optBoolean("social"), sb = b.optBoolean("social");
                    if (sa != sb) return sa ? -1 : 1;
                    return a.optString("name").compareToIgnoreCase(b.optString("name"));
                });
                for (JSONObject o : items) out.put(o);
            } catch (Exception ignored) {}
            appsCache = out.toString(); appsCacheAt = System.currentTimeMillis();
            resolve(cb, appsCache);
        }).start();
    }

    private String iconB64(Drawable d) {
        try {
            int s = 72;
            Bitmap b = Bitmap.createBitmap(s, s, Bitmap.Config.ARGB_8888);
            Canvas c = new Canvas(b);
            d.setBounds(0, 0, s, s);
            d.draw(c);
            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            b.compress(Bitmap.CompressFormat.PNG, 90, bos);
            b.recycle();
            return "data:image/png;base64," + Base64.encodeToString(bos.toByteArray(), Base64.NO_WRAP);
        } catch (Exception e) {
            return "";
        }
    }

    /** Today's foreground minutes per app (system usage stats if allowed, else Focus Guard's own count). */
    @JavascriptInterface
    public void usageToday(int cb) {
        new Thread(() -> {
            JSONObject res = new JSONObject();
            try {
                if (hasUsage()) {
                    UsageStatsManager um = (UsageStatsManager) app.getSystemService(Context.USAGE_STATS_SERVICE);
                    Calendar c = Calendar.getInstance();
                    c.set(Calendar.HOUR_OF_DAY, 0); c.set(Calendar.MINUTE, 0); c.set(Calendar.SECOND, 0); c.set(Calendar.MILLISECOND, 0);
                    long start = c.getTimeInMillis(), now = System.currentTimeMillis();
                    UsageEvents ev = um.queryEvents(start, now);
                    Map<String, Long> open = new HashMap<>();
                    Map<String, Long> total = new HashMap<>();
                    UsageEvents.Event e = new UsageEvents.Event();
                    while (ev.hasNextEvent()) {
                        ev.getNextEvent(e);
                        String p = e.getPackageName();
                        int t = e.getEventType();
                        if (t == UsageEvents.Event.MOVE_TO_FOREGROUND) {
                            open.put(p, e.getTimeStamp());
                        } else if (t == UsageEvents.Event.MOVE_TO_BACKGROUND) {
                            Long s = open.remove(p);
                            if (s != null) total.put(p, (total.containsKey(p) ? total.get(p) : 0L) + (e.getTimeStamp() - s));
                        }
                    }
                    for (Map.Entry<String, Long> o : open.entrySet()) {
                        total.put(o.getKey(), (total.containsKey(o.getKey()) ? total.get(o.getKey()) : 0L) + (now - o.getValue()));
                    }
                    for (Map.Entry<String, Long> t : total.entrySet()) {
                        if (t.getValue() >= 30_000) res.put(t.getKey(), t.getValue() / 1000);
                    }
                    res.put("_source", "system");
                } else {
                    res = Store.usageToday(app);
                    res.put("_source", "guard");
                }
            } catch (Exception ignored) {}
            resolve(cb, res.toString());
        }).start();
    }

    // ------------------------------------------------------------------ misc device features
    @JavascriptInterface
    public void keepScreenOn(boolean on) { act.keepScreenOn(on); }

    @JavascriptInterface
    @SuppressWarnings("deprecation")
    public void vibrate(int ms) {
        try {
            Vibrator v = (Vibrator) app.getSystemService(Context.VIBRATOR_SERVICE);
            if (v == null) return;
            if (Build.VERSION.SDK_INT >= 26) v.vibrate(VibrationEffect.createOneShot(Math.max(5, ms), VibrationEffect.DEFAULT_AMPLITUDE));
            else v.vibrate(ms);
        } catch (Exception ignored) {}
    }

    @JavascriptInterface
    public void openUrl(String url, boolean inApp) {
        if (url == null) return;
        if (inApp && (url.startsWith("https://") || url.startsWith("http://"))) act.openInApp(url, "");
        else act.openExternal(url);
    }

    @JavascriptInterface
    public void openInApp(String url, String title) { act.openInApp(url, title); }

    @JavascriptInterface
    public void saveFile(String name, String mime, String text) { act.saveFile(name, mime, text); }

    @JavascriptInterface
    public void copyText(String text) {
        ClipboardManager cm = (ClipboardManager) app.getSystemService(Context.CLIPBOARD_SERVICE);
        if (cm != null) cm.setPrimaryClip(ClipData.newPlainText("SSC 2027", text));
    }

    @JavascriptInterface
    public void share(String text) {
        Intent i = new Intent(Intent.ACTION_SEND).setType("text/plain").putExtra(Intent.EXTRA_TEXT, text);
        Intent c = Intent.createChooser(i, "শেয়ার করো");
        c.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        try { act.startActivity(c); } catch (Exception ignored) {}
    }

    @JavascriptInterface
    public String consumeRoute() { return Store.consumeRoute(app); }
}
