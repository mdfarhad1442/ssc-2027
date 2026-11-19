package com.ssc2027.app;

import android.app.AlarmManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.Random;

/** Fires a study alarm or a "you skipped today" roast, then re-arms itself for tomorrow. */
public class AlarmReceiver extends BroadcastReceiver {
    private static final Random RND = new Random();

    @Override
    public void onReceive(Context c, Intent intent) {
        String time = intent.getStringExtra("time");
        String kind = intent.getStringExtra("kind");
        int idx = intent.getIntExtra("idx", 0);
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        if (time != null && am != null) Alarms.scheduleOne(c, am, idx, time, kind); // next day

        JSONObject cfg = Store.json(c, "alarms");
        JSONObject st = Store.json(c, "state");
        boolean bn = Store.isBn(c);
        boolean isToday = Store.today().equals(st.optString("today"));
        int done = isToday ? st.optInt("done", 0) : 0;
        int total = isToday ? st.optInt("total", 0) : st.optInt("totalNext", 0);
        if (!st.has("today")) return; // no profile yet

        // When the app is open the web app shows its own animated alarm.
        if (MainActivity.isResumed) return;

        if ("miss".equals(kind)) {
            if (done > 0) return; // studied today → no roast
            String body = pick(cfg.optJSONArray("roasts"), bn ? "আজ এখনো একটা টাস্কও করোনি! বইগুলো তোমাকে মিস করছে 🥲" : "Not a single task today! Your books miss you 🥲");
            Notif.show(c, 5100, Notif.CH_ROAST, bn ? "😤 আজ এখনো কিছু পড়োনি!" : "😤 You haven't studied today!", body, "planner");
            return;
        }
        String slot = "";
        JSONObject slots = cfg.optJSONObject("slots");
        if (slots != null && time != null) slot = slots.optString(time, "");
        if (slot.isEmpty()) slot = bn ? "⏰ পড়ার সময় হয়েছে!" : "⏰ Time to study!";
        int left = Math.max(0, total - done);
        String extra = left > 0
                ? (bn ? " আজ বাকি " + Store.bnDigits(String.valueOf(left)) + "টি কাজ।" : " " + left + " tasks left today.")
                : (done > 0 ? (bn ? " আজকের সব কাজ শেষ—চাইলে রিভিশন করো ✨" : " All done today — revise if you like ✨") : "");
        String body = slot + extra;
        if (left > 0 && RND.nextBoolean()) body += "\n" + pick(cfg.optJSONArray("roasts"), "");
        Notif.show(c, 5000 + idx, Notif.CH_ALARM, (bn ? "⏰ পড়ার সময়! · " : "⏰ Study time! · ") + (time == null ? "" : time), body.trim(), "planner");
    }

    static String pick(JSONArray a, String def) {
        if (a == null || a.length() == 0) return def;
        return a.optString(RND.nextInt(a.length()), def);
    }
}
