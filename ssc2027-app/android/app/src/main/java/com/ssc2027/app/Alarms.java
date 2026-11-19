package com.ssc2027.app;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.Calendar;

/**
 * Real Android alarms for the study reminders (work even when the app is closed / phone restarted).
 * The web app sends its reminder list via the bridge; we keep one exact alarm per reminder.
 */
public final class Alarms {
    private Alarms() {}
    private static final int BASE_REQ = 7100;

    static void scheduleAll(Context c) {
        JSONObject cfg = Store.json(c, "alarms");
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;
        // cancel previous
        int prev = Store.p(c).getInt("alarmCount", 0);
        for (int i = 0; i < prev + 2; i++) am.cancel(pi(c, i, null, null));
        JSONArray list = cfg.optJSONArray("reminders");
        int n = 0;
        if (list != null) {
            for (int i = 0; i < list.length(); i++) {
                JSONObject r = list.optJSONObject(i);
                if (r == null || !r.optBoolean("on", true)) continue;
                scheduleOne(c, am, n++, r.optString("time"), "slot");
            }
        }
        if (cfg.optBoolean("missCheck", true) && cfg.has("missTime")) scheduleOne(c, am, n++, cfg.optString("missTime"), "miss");
        Store.p(c).edit().putInt("alarmCount", n).apply();
    }

    static void scheduleOne(Context c, AlarmManager am, int idx, String hhmm, String kind) {
        int m = Store.minutesOfDay(hhmm);
        if (m < 0) return;
        Calendar cal = Calendar.getInstance();
        cal.set(Calendar.HOUR_OF_DAY, m / 60);
        cal.set(Calendar.MINUTE, m % 60);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        if (cal.getTimeInMillis() <= System.currentTimeMillis() + 2000) cal.add(Calendar.DAY_OF_YEAR, 1);
        PendingIntent p = pi(c, idx, hhmm, kind);
        long at = cal.getTimeInMillis();
        try {
            if (Build.VERSION.SDK_INT >= 31 && !am.canScheduleExactAlarms()) {
                am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, p);
            } else if (Build.VERSION.SDK_INT >= 23) {
                am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, p);
            } else {
                am.setExact(AlarmManager.RTC_WAKEUP, at, p);
            }
        } catch (SecurityException e) {
            am.set(AlarmManager.RTC_WAKEUP, at, p);
        }
    }

    static PendingIntent pi(Context c, int idx, String time, String kind) {
        Intent i = new Intent(c, AlarmReceiver.class);
        i.setAction("com.ssc2027.app.ALARM_" + idx);
        if (time != null) i.putExtra("time", time);
        if (kind != null) i.putExtra("kind", kind);
        i.putExtra("idx", idx);
        return PendingIntent.getBroadcast(c, BASE_REQ + idx, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    static boolean exactAllowed(Context c) {
        if (Build.VERSION.SDK_INT < 31) return true;
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        return am != null && am.canScheduleExactAlarms();
    }
}
