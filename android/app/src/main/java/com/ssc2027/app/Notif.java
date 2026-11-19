package com.ssc2027.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.BitmapFactory;
import android.media.AudioAttributes;
import android.media.RingtoneManager;
import android.os.Build;

/** Notification channels + a single helper to post notifications that open a route in the app. */
public final class Notif {
    static final String CH_ALARM = "study_alarms";
    static final String CH_ROAST = "roasts";
    static final String CH_GENERAL = "general";
    private Notif() {}

    static void ensureChannels(Context c) {
        if (Build.VERSION.SDK_INT < 26) return;
        NotificationManager nm = c.getSystemService(NotificationManager.class);
        if (nm == null) return;
        NotificationChannel a = new NotificationChannel(CH_ALARM, "পড়ার অ্যালার্ম", NotificationManager.IMPORTANCE_HIGH);
        a.setDescription("রুটিন অনুযায়ী পড়ার সময় মনে করিয়ে দেয়");
        a.enableVibration(true);
        a.setVibrationPattern(new long[]{0, 400, 200, 400, 200, 600});
        a.setSound(RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION),
                new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_NOTIFICATION_EVENT)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build());
        NotificationChannel r = new NotificationChannel(CH_ROAST, "পেঁচু স্যারের রোস্ট 😜", NotificationManager.IMPORTANCE_HIGH);
        r.setDescription("পড়া মিস করলে মজার রোস্ট");
        r.enableVibration(true);
        NotificationChannel g = new NotificationChannel(CH_GENERAL, "সাধারণ", NotificationManager.IMPORTANCE_DEFAULT);
        nm.createNotificationChannel(a);
        nm.createNotificationChannel(r);
        nm.createNotificationChannel(g);
    }

    static boolean allowed(Context c) {
        if (Build.VERSION.SDK_INT >= 33 &&
                c.checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) return false;
        NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
        return nm == null || Build.VERSION.SDK_INT < 24 || nm.areNotificationsEnabled();
    }

    static PendingIntent openApp(Context c, String route, int req) {
        Intent i = new Intent(c, MainActivity.class);
        i.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        i.putExtra(MainActivity.EXTRA_ROUTE, route == null ? "" : route);
        return PendingIntent.getActivity(c, req, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    @SuppressWarnings("deprecation")
    static void show(Context c, int id, String channel, String title, String body, String route) {
        if (!allowed(c)) return;
        ensureChannels(c);
        Notification.Builder b = Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(c, channel) : new Notification.Builder(c);
        b.setSmallIcon(R.drawable.ic_stat)
                .setLargeIcon(BitmapFactory.decodeResource(c.getResources(), R.mipmap.ic_launcher))
                .setContentTitle(title)
                .setContentText(body)
                .setStyle(new Notification.BigTextStyle().bigText(body))
                .setAutoCancel(true)
                .setColor(0xFF7B61FF)
                .setCategory(Notification.CATEGORY_REMINDER)
                .setContentIntent(openApp(c, route, id));
        if (Build.VERSION.SDK_INT < 26) {
            b.setPriority(Notification.PRIORITY_HIGH).setDefaults(Notification.DEFAULT_ALL);
        }
        NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm != null) nm.notify(id, b.build());
    }
}
