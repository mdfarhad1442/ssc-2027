package com.ssc2027.app;

import android.animation.Animator;
import android.animation.AnimatorSet;
import android.animation.ObjectAnimator;
import android.animation.PropertyValuesHolder;
import android.animation.ValueAnimator;
import android.content.Context;
import android.graphics.Color;
import android.graphics.PixelFormat;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Handler;
import android.os.Looper;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.view.animation.AccelerateDecelerateInterpolator;
import android.view.animation.LinearInterpolator;
import android.view.animation.OvershootInterpolator;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

/**
 * The full-screen "roast" overlay drawn on top of social apps by the accessibility service.
 * Built in code (no XML) so it is light and fully animated:
 * floating emoji, a bobbing owl, a pop-in speech bubble with a shake, and a countdown
 * before the "one more minute" button unlocks.
 */
final class GuardOverlay {
    static final int NONE = 0, BLOCK = 1, NUDGE = 2;

    interface Actions {
        void onReturn();
        void onHome();
        void onGrace();
        void onDismiss();
    }

    private final Context ctx;
    private final WindowManager wm;
    private final Handler h = new Handler(Looper.getMainLooper());
    private final List<Animator> anims = new ArrayList<>();
    private final Random rnd = new Random();
    private View root;
    private int kind = NONE;
    private String pkg = "", reason = "";
    private TextView reasonView, countdownBtn;
    private Runnable countdown;

    GuardOverlay(Context c) {
        ctx = c;
        wm = (WindowManager) c.getSystemService(Context.WINDOW_SERVICE);
    }

    boolean isShowing() { return root != null; }
    int kind() { return kind; }
    String pkg() { return pkg; }
    String reason() { return reason; }

    void updateReason(String text) { if (reasonView != null) reasonView.setText(text); }

    // ------------------------------------------------------------------ BLOCK
    void showBlock(String pkg, String reason, String pill, String title, String msg, String reasonText, String usageLine,
                   String returnLabel, String homeLabel, String graceLabel, String graceNote, int waitSec, Actions a) {
        hide();
        this.kind = BLOCK; this.pkg = pkg; this.reason = reason;
        boolean bn = Store.isBn(ctx);

        FrameLayout fr = new FrameLayout(ctx);
        GradientDrawable bg = new GradientDrawable(GradientDrawable.Orientation.TOP_BOTTOM,
                new int[]{0xFF1E1250, 0xFF3B2496, 0xFF6A4DF5});
        fr.setBackground(bg);
        fr.setOnTouchListener((v, e) -> true); // swallow every touch → the app below can't be used

        // floating emoji particles
        FrameLayout particles = new FrameLayout(ctx);
        fr.addView(particles, new FrameLayout.LayoutParams(-1, -1));
        String[] em = {"📚", "✏️", "⏰", "📖", "🧠", "💯", "📝", "🎯", "😤", "🦉"};
        int sw = ctx.getResources().getDisplayMetrics().widthPixels;
        int sh = ctx.getResources().getDisplayMetrics().heightPixels;
        for (int i = 0; i < 12; i++) {
            TextView t = new TextView(ctx);
            t.setText(em[rnd.nextInt(em.length)]);
            t.setTextSize(TypedValue.COMPLEX_UNIT_SP, 18 + rnd.nextInt(16));
            t.setAlpha(0f);
            FrameLayout.LayoutParams lp = new FrameLayout.LayoutParams(-2, -2);
            lp.leftMargin = rnd.nextInt(Math.max(1, sw - dp(40)));
            lp.topMargin = sh;
            particles.addView(t, lp);
            ObjectAnimator up = ObjectAnimator.ofPropertyValuesHolder(t,
                    PropertyValuesHolder.ofFloat(View.TRANSLATION_Y, 0f, -sh - dp(80)),
                    PropertyValuesHolder.ofFloat(View.ROTATION, -20f + rnd.nextInt(40), -20f + rnd.nextInt(40)));
            up.setDuration(7000 + rnd.nextInt(6000));
            up.setStartDelay(rnd.nextInt(5000));
            up.setRepeatCount(ValueAnimator.INFINITE);
            up.setInterpolator(new LinearInterpolator());
            ObjectAnimator fade = ObjectAnimator.ofFloat(t, View.ALPHA, 0f, .55f, .55f, 0f);
            fade.setDuration(up.getDuration());
            fade.setStartDelay(up.getStartDelay());
            fade.setRepeatCount(ValueAnimator.INFINITE);
            up.start(); fade.start();
            anims.add(up); anims.add(fade);
        }

        ScrollView sv = new ScrollView(ctx);
        sv.setFillViewport(true);
        sv.setVerticalScrollBarEnabled(false);
        LinearLayout col = new LinearLayout(ctx);
        col.setOrientation(LinearLayout.VERTICAL);
        col.setGravity(Gravity.CENTER_HORIZONTAL | Gravity.CENTER_VERTICAL);
        col.setPadding(dp(24), dp(36), dp(24), dp(28));
        sv.addView(col, new ScrollView.LayoutParams(-1, -1));
        fr.addView(sv, new FrameLayout.LayoutParams(-1, -1));

        TextView pillV = text(pill, 13, Color.WHITE, true);
        pillV.setBackground(round(0x33FFFFFF, 99, 0));
        pillV.setPadding(dp(14), dp(6), dp(14), dp(6));
        col.addView(pillV, wrap());

        ImageView owl = new ImageView(ctx);
        owl.setImageResource(R.drawable.owl);
        owl.setAdjustViewBounds(true);
        LinearLayout.LayoutParams olp = new LinearLayout.LayoutParams(-2, dp(150));
        olp.topMargin = dp(18);
        col.addView(owl, olp);

        LinearLayout bubble = new LinearLayout(ctx);
        bubble.setOrientation(LinearLayout.VERTICAL);
        bubble.setBackground(round(Color.WHITE, 26, 0));
        bubble.setPadding(dp(20), dp(18), dp(20), dp(18));
        bubble.setElevation(dp(10));
        TextView titleV = text(title, 21, 0xFF1D1A2F, true);
        titleV.setGravity(Gravity.CENTER);
        TextView msgV = text(msg, 16, 0xFF4A4560, false);
        msgV.setGravity(Gravity.CENTER);
        msgV.setLineSpacing(0, 1.15f);
        LinearLayout.LayoutParams mlp = wrapFull(); mlp.topMargin = dp(8);
        bubble.addView(titleV, wrapFull());
        bubble.addView(msgV, mlp);
        LinearLayout.LayoutParams blp = new LinearLayout.LayoutParams(-1, -2);
        blp.topMargin = dp(10);
        col.addView(bubble, blp);

        reasonView = text(reasonText, 14.5f, Color.WHITE, true);
        reasonView.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams rlp = wrapFull(); rlp.topMargin = dp(16);
        col.addView(reasonView, rlp);
        if (usageLine != null && !usageLine.isEmpty()) {
            TextView u = text(usageLine, 12.5f, 0xCCFFFFFF, false);
            u.setGravity(Gravity.CENTER);
            LinearLayout.LayoutParams ulp = wrapFull(); ulp.topMargin = dp(4);
            col.addView(u, ulp);
        }

        TextView ret = button(returnLabel, Color.WHITE, 0xFF4B2FD0, 0);
        LinearLayout.LayoutParams b1 = new LinearLayout.LayoutParams(-1, dp(56)); b1.topMargin = dp(22);
        col.addView(ret, b1);
        ret.setOnClickListener(v -> a.onReturn());

        TextView home = button(homeLabel, 0x00000000, Color.WHITE, 0x99FFFFFF);
        LinearLayout.LayoutParams b2 = new LinearLayout.LayoutParams(-1, dp(52)); b2.topMargin = dp(10);
        col.addView(home, b2);
        home.setOnClickListener(v -> a.onHome());

        if (graceLabel != null) {
            countdownBtn = button(graceLabel, 0x22FFFFFF, 0x88FFFFFF, 0);
            countdownBtn.setTextSize(TypedValue.COMPLEX_UNIT_SP, 14);
            LinearLayout.LayoutParams b3 = new LinearLayout.LayoutParams(-1, dp(46)); b3.topMargin = dp(10);
            col.addView(countdownBtn, b3);
            if (graceNote != null) {
                TextView gn = text(graceNote, 11.5f, 0xAAFFFFFF, false);
                gn.setGravity(Gravity.CENTER);
                LinearLayout.LayoutParams glp = wrapFull(); glp.topMargin = dp(6);
                col.addView(gn, glp);
            }
            startCountdown(countdownBtn, graceLabel, Math.max(3, waitSec), a::onGrace);
        }

        add(fr, true);

        // entrance animation
        col.setAlpha(0f);
        col.setTranslationY(dp(40));
        col.animate().alpha(1f).translationY(0).setDuration(450).setInterpolator(new AccelerateDecelerateInterpolator()).start();
        bubble.setScaleX(.7f); bubble.setScaleY(.7f);
        bubble.animate().scaleX(1f).scaleY(1f).setStartDelay(200).setDuration(550).setInterpolator(new OvershootInterpolator(2.2f))
                .withEndAction(() -> shake(bubble)).start();
        bob(owl);
        pulse(ret);
    }

    // ------------------------------------------------------------------ NUDGE
    void showNudge(String pkg, String title, String msg, String sub, String returnLabel, String okLabel, int waitSec, Actions a) {
        hide();
        this.kind = NUDGE; this.pkg = pkg; this.reason = "nudge";

        FrameLayout fr = new FrameLayout(ctx);
        fr.setBackgroundColor(0xD9140F2E);
        fr.setOnTouchListener((v, e) -> true);

        LinearLayout card = new LinearLayout(ctx);
        card.setOrientation(LinearLayout.VERTICAL);
        card.setGravity(Gravity.CENTER_HORIZONTAL);
        card.setBackground(round(0xFFFFFBF7, 30, 0));
        card.setPadding(dp(22), dp(20), dp(22), dp(20));
        card.setElevation(dp(16));
        FrameLayout.LayoutParams clp = new FrameLayout.LayoutParams(-1, -2, Gravity.CENTER);
        clp.leftMargin = clp.rightMargin = dp(22);
        fr.addView(card, clp);

        ImageView owl = new ImageView(ctx);
        owl.setImageResource(R.drawable.owl);
        owl.setAdjustViewBounds(true);
        card.addView(owl, new LinearLayout.LayoutParams(-2, dp(110)));

        TextView t = text(title, 20, 0xFF1D1A2F, true); t.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams tlp = wrapFull(); tlp.topMargin = dp(8);
        card.addView(t, tlp);
        TextView m = text(msg, 15.5f, 0xFF4A4560, false); m.setGravity(Gravity.CENTER); m.setLineSpacing(0, 1.15f);
        LinearLayout.LayoutParams mlp = wrapFull(); mlp.topMargin = dp(6);
        card.addView(m, mlp);
        if (sub != null && !sub.isEmpty()) {
            TextView s = text(sub, 12.5f, 0xFF7B61FF, true); s.setGravity(Gravity.CENTER);
            s.setBackground(round(0xFFEEEAFF, 99, 0));
            s.setPadding(dp(12), dp(5), dp(12), dp(5));
            LinearLayout.LayoutParams slp = wrap(); slp.topMargin = dp(10);
            card.addView(s, slp);
        }
        TextView ret = button(returnLabel, 0xFF7B61FF, Color.WHITE, 0);
        LinearLayout.LayoutParams b1 = new LinearLayout.LayoutParams(-1, dp(52)); b1.topMargin = dp(16);
        card.addView(ret, b1);
        ret.setOnClickListener(v -> a.onReturn());
        countdownBtn = button(okLabel, 0xFFF1EEF9, 0xFF9A95AE, 0);
        LinearLayout.LayoutParams b2 = new LinearLayout.LayoutParams(-1, dp(48)); b2.topMargin = dp(8);
        card.addView(countdownBtn, b2);
        startCountdown(countdownBtn, okLabel, Math.max(2, waitSec), a::onDismiss);

        add(fr, true);
        card.setScaleX(.6f); card.setScaleY(.6f); card.setAlpha(0f);
        card.animate().scaleX(1f).scaleY(1f).alpha(1f).setDuration(500).setInterpolator(new OvershootInterpolator(1.8f))
                .withEndAction(() -> shake(card)).start();
        bob(owl);
    }

    // ------------------------------------------------------------------ helpers
    private void startCountdown(TextView btn, String label, int secs, Runnable onTap) {
        final int[] left = {secs};
        btn.setEnabled(false);
        btn.setText(label + "  (" + Store.num(ctx, left[0]) + ")");
        countdown = new Runnable() {
            @Override public void run() {
                if (root == null) return;
                left[0]--;
                if (left[0] <= 0) {
                    btn.setEnabled(true);
                    btn.setText(label);
                    btn.setAlpha(1f);
                    if (kind == NUDGE) {
                        btn.setBackground(round(0xFFEEEAFF, 18, 0));
                        btn.setTextColor(0xFF5B3FE0);
                    } else {
                        btn.setBackground(round(0x33FFFFFF, 18, 0));
                        btn.setTextColor(Color.WHITE);
                    }
                    btn.setOnClickListener(v -> onTap.run());
                } else {
                    btn.setText(label + "  (" + Store.num(ctx, left[0]) + ")");
                    h.postDelayed(this, 1000);
                }
            }
        };
        h.postDelayed(countdown, 1000);
    }

    private void add(View v, boolean touchable) {
        int type = WindowManager.LayoutParams.TYPE_ACCESSIBILITY_OVERLAY;
        int flags = WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN
                | WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE
                | WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED;
        if (!touchable) flags |= WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE;
        WindowManager.LayoutParams lp = new WindowManager.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT, type, flags, PixelFormat.TRANSLUCENT);
        lp.gravity = Gravity.TOP | Gravity.START;
        try {
            wm.addView(v, lp);
            root = v;
        } catch (Exception e) {
            root = null;
            kind = NONE;
        }
    }

    void hide() {
        h.removeCallbacksAndMessages(null);
        for (Animator an : anims) an.cancel();
        anims.clear();
        if (root != null) {
            try { wm.removeViewImmediate(root); } catch (Exception ignored) {}
        }
        root = null;
        kind = NONE;
        pkg = "";
        reason = "";
        reasonView = null;
        countdownBtn = null;
    }

    private void bob(View v) {
        ObjectAnimator a = ObjectAnimator.ofFloat(v, View.TRANSLATION_Y, 0f, -dp(10));
        a.setDuration(1300);
        a.setRepeatMode(ValueAnimator.REVERSE);
        a.setRepeatCount(ValueAnimator.INFINITE);
        a.setInterpolator(new AccelerateDecelerateInterpolator());
        ObjectAnimator r = ObjectAnimator.ofFloat(v, View.ROTATION, -4f, 4f);
        r.setDuration(1700);
        r.setRepeatMode(ValueAnimator.REVERSE);
        r.setRepeatCount(ValueAnimator.INFINITE);
        a.start(); r.start();
        anims.add(a); anims.add(r);
    }

    private void pulse(View v) {
        ObjectAnimator a = ObjectAnimator.ofPropertyValuesHolder(v,
                PropertyValuesHolder.ofFloat(View.SCALE_X, 1f, 1.035f),
                PropertyValuesHolder.ofFloat(View.SCALE_Y, 1f, 1.035f));
        a.setDuration(900);
        a.setRepeatMode(ValueAnimator.REVERSE);
        a.setRepeatCount(ValueAnimator.INFINITE);
        a.setStartDelay(900);
        a.start();
        anims.add(a);
    }

    private void shake(View v) {
        ObjectAnimator s = ObjectAnimator.ofFloat(v, View.ROTATION, 0, -3, 3, -2, 2, 0);
        s.setDuration(500);
        AnimatorSet set = new AnimatorSet();
        set.play(s);
        set.start();
        anims.add(set);
    }

    private TextView text(String s, float sp, int color, boolean bold) {
        TextView t = new TextView(ctx);
        t.setText(s);
        t.setTextSize(TypedValue.COMPLEX_UNIT_SP, sp);
        t.setTextColor(color);
        if (bold) t.setTypeface(Typeface.DEFAULT_BOLD);
        return t;
    }

    private TextView button(String s, int bg, int fg, int stroke) {
        TextView b = text(s, 16, fg, true);
        b.setGravity(Gravity.CENTER);
        b.setBackground(round(bg, 18, stroke));
        b.setClickable(true);
        b.setFocusable(true);
        b.setOnTouchListener((v, e) -> {
            if (!v.isEnabled()) return false;
            if (e.getAction() == MotionEvent.ACTION_DOWN) v.animate().scaleX(.96f).scaleY(.96f).setDuration(90).start();
            else if (e.getAction() == MotionEvent.ACTION_UP || e.getAction() == MotionEvent.ACTION_CANCEL)
                v.animate().scaleX(1f).scaleY(1f).setDuration(140).start();
            return false;
        });
        return b;
    }

    private GradientDrawable round(int color, int radiusDp, int strokeColor) {
        GradientDrawable g = new GradientDrawable();
        g.setColor(color);
        g.setCornerRadius(dp(radiusDp));
        if (strokeColor != 0) g.setStroke(dp(1.5f), strokeColor);
        return g;
    }

    private LinearLayout.LayoutParams wrap() { return new LinearLayout.LayoutParams(-2, -2); }
    private LinearLayout.LayoutParams wrapFull() { return new LinearLayout.LayoutParams(-1, -2); }

    private int dp(float v) {
        return Math.round(TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, v, ctx.getResources().getDisplayMetrics()));
    }
}
