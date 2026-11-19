package com.ssc2027.app;

import android.content.Context;
import android.content.SharedPreferences;

import org.json.JSONArray;
import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;
import java.util.Map;

/**
 * Small persistent store shared by the WebView bridge, the Focus Guard
 * accessibility service and the alarm receivers.
 * Everything stays on the phone — nothing here is ever uploaded.
 */
public final class Store {
    private static final String NAME = "ssc_native";
    private Store() {}

    static SharedPreferences p(Context c) {
        return c.getApplicationContext().getSharedPreferences(NAME, Context.MODE_PRIVATE);
    }

    static String today() {
        return new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date());
    }

    static JSONObject json(Context c, String key) {
        try {
            String s = p(c).getString(key, null);
            return s == null ? new JSONObject() : new JSONObject(s);
        } catch (Exception e) {
            return new JSONObject();
        }
    }

    static void putJson(Context c, String key, String json) {
        p(c).edit().putString(key, json).apply();
    }

    // ---------------- Guard config ----------------
    static JSONObject guard(Context c) { return json(c, "guard"); }

    static JSONObject guardApp(JSONObject cfg, String pkg) {
        JSONArray apps = cfg.optJSONArray("apps");
        if (apps == null || pkg == null) return null;
        for (int i = 0; i < apps.length(); i++) {
            JSONObject a = apps.optJSONObject(i);
            if (a != null && pkg.equals(a.optString("pkg")) && a.optBoolean("on", true)) return a;
        }
        return null;
    }

    // ---------------- Study lock (focus timer) ----------------
    static long studyLockUntil(Context c) { return p(c).getLong("studyLockUntil", 0); }

    static void setStudyLock(Context c, long until, String label) {
        p(c).edit().putLong("studyLockUntil", until).putString("studyLabel", label == null ? "" : label).apply();
    }

    static String studyLabel(Context c) { return p(c).getString("studyLabel", ""); }

    // ---------------- Usage (seconds per app per day) ----------------
    static long usage(Context c, String pkg) { return p(c).getLong("u:" + today() + ":" + pkg, 0); }

    static void addUsage(Context c, String pkg, long seconds) {
        if (seconds <= 0) return;
        String k = "u:" + today() + ":" + pkg;
        SharedPreferences sp = p(c);
        sp.edit().putLong(k, sp.getLong(k, 0) + seconds).apply();
    }

    static JSONObject usageToday(Context c) {
        JSONObject o = new JSONObject();
        String pre = "u:" + today() + ":";
        for (Map.Entry<String, ?> e : p(c).getAll().entrySet()) {
            if (e.getKey().startsWith(pre) && e.getValue() instanceof Long) {
                try { o.put(e.getKey().substring(pre.length()), e.getValue()); } catch (Exception ignored) {}
            }
        }
        return o;
    }

    /** Removes usage/counter keys older than today (called once a day). */
    static void cleanup(Context c) {
        SharedPreferences sp = p(c);
        String t = today();
        if (t.equals(sp.getString("lastCleanup", ""))) return;
        SharedPreferences.Editor ed = sp.edit();
        for (String k : sp.getAll().keySet()) {
            if ((k.startsWith("u:") || k.startsWith("cnt:")) && !k.contains(t)) ed.remove(k);
        }
        ed.putString("lastCleanup", t).apply();
    }

    // ---------------- Daily counters ----------------
    static int count(Context c, String name) { return p(c).getInt("cnt:" + today() + ":" + name, 0); }

    static int inc(Context c, String name) {
        String k = "cnt:" + today() + ":" + name;
        SharedPreferences sp = p(c);
        int v = sp.getInt(k, 0) + 1;
        sp.edit().putInt(k, v).apply();
        return v;
    }

    // ---------------- Grace ("one more minute") ----------------
    static long graceUntil(Context c, String pkg) { return p(c).getLong("grace:" + pkg, 0); }

    static void setGrace(Context c, String pkg, long until) { p(c).edit().putLong("grace:" + pkg, until).apply(); }

    // ---------------- Pending route for the web app ----------------
    static void setRoute(Context c, String route, boolean guardReturn) {
        p(c).edit().putString("route", route).putBoolean("guardReturn", guardReturn).apply();
    }

    static String consumeRoute(Context c) {
        SharedPreferences sp = p(c);
        String r = sp.getString("route", "");
        boolean g = sp.getBoolean("guardReturn", false);
        sp.edit().remove("route").remove("guardReturn").apply();
        try {
            return new JSONObject().put("route", r).put("guardReturn", g).toString();
        } catch (Exception e) {
            return "{}";
        }
    }

    // ---------------- Helpers ----------------
    static int minutesOfDay(String hhmm) {
        try {
            String[] p = hhmm.split(":");
            return Integer.parseInt(p[0]) * 60 + Integer.parseInt(p[1]);
        } catch (Exception e) {
            return -1;
        }
    }

    static int nowMinutes() {
        Calendar c = Calendar.getInstance();
        return c.get(Calendar.HOUR_OF_DAY) * 60 + c.get(Calendar.MINUTE);
    }

    /** true if now is inside [from, to) — supports windows that cross midnight. */
    static boolean inWindow(String from, String to) {
        int f = minutesOfDay(from), t = minutesOfDay(to), n = nowMinutes();
        if (f < 0 || t < 0 || f == t) return false;
        return f < t ? (n >= f && n < t) : (n >= f || n < t);
    }

    static String bnDigits(String s) {
        char[] bn = {'০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'};
        StringBuilder b = new StringBuilder();
        for (char ch : s.toCharArray()) b.append(ch >= '0' && ch <= '9' ? bn[ch - '0'] : ch);
        return b.toString();
    }

    static boolean isBn(Context c) { return !"en".equals(json(c, "state").optString("lang", "bn")); }

    static String num(Context c, long n) { return isBn(c) ? bnDigits(String.valueOf(n)) : String.valueOf(n); }
}
