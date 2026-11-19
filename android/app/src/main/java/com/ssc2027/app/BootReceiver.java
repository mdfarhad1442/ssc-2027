package com.ssc2027.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** Re-arms study alarms after a reboot, app update or time change. */
public class BootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context c, Intent intent) {
        Notif.ensureChannels(c);
        Alarms.scheduleAll(c);
    }
}
