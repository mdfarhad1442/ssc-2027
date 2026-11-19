package com.ssc2027.app;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.Bundle;
import android.text.TextUtils;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

/**
 * In-app browser for the official result websites (education boards etc.).
 * Opens them "embedded" inside the app with a clean header, progress bar and an
 * "open in browser" fallback — no iframe restrictions apply here.
 */
public class ResultBrowserActivity extends Activity {
    private WebView web;
    private TextView titleV, urlV;
    private ProgressBar bar;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        String url = getIntent().getStringExtra("url");
        String title = getIntent().getStringExtra("title");
        if (url == null) { finish(); return; }

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(0xFFFFFBF7);

        LinearLayout top = new LinearLayout(this);
        top.setOrientation(LinearLayout.HORIZONTAL);
        top.setGravity(Gravity.CENTER_VERTICAL);
        top.setPadding(dp(10), dp(8), dp(10), dp(8));
        top.setBackgroundColor(0xFFFFFBF7);
        top.setElevation(dp(2));

        TextView close = iconBtn("✕");
        close.setOnClickListener(v -> finish());
        top.addView(close, new LinearLayout.LayoutParams(dp(42), dp(42)));

        LinearLayout tcol = new LinearLayout(this);
        tcol.setOrientation(LinearLayout.VERTICAL);
        tcol.setPadding(dp(10), 0, dp(6), 0);
        titleV = new TextView(this);
        titleV.setTextSize(TypedValue.COMPLEX_UNIT_SP, 15);
        titleV.setTypeface(Typeface.DEFAULT_BOLD);
        titleV.setTextColor(0xFF1D1A2F);
        titleV.setSingleLine(true);
        titleV.setEllipsize(TextUtils.TruncateAt.END);
        titleV.setText(TextUtils.isEmpty(title) ? "লোড হচ্ছে…" : title);
        urlV = new TextView(this);
        urlV.setTextSize(TypedValue.COMPLEX_UNIT_SP, 11.5f);
        urlV.setTextColor(0xFF1FB383);
        urlV.setSingleLine(true);
        urlV.setEllipsize(TextUtils.TruncateAt.MIDDLE);
        urlV.setText("🔒 " + host(url));
        tcol.addView(titleV);
        tcol.addView(urlV);
        top.addView(tcol, new LinearLayout.LayoutParams(0, -2, 1f));

        TextView reload = iconBtn("⟳");
        reload.setOnClickListener(v -> web.reload());
        top.addView(reload, new LinearLayout.LayoutParams(dp(42), dp(42)));
        TextView ext = iconBtn("↗");
        ext.setOnClickListener(v -> {
            try { startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(web.getUrl()))); }
            catch (Exception e) { Toast.makeText(this, "ব্রাউজার পাওয়া যায়নি", Toast.LENGTH_SHORT).show(); }
        });
        LinearLayout.LayoutParams elp = new LinearLayout.LayoutParams(dp(42), dp(42));
        elp.leftMargin = dp(6);
        top.addView(ext, elp);
        root.addView(top, new LinearLayout.LayoutParams(-1, -2));

        bar = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        bar.setMax(100);
        bar.setProgressTintList(android.content.res.ColorStateList.valueOf(0xFF7B61FF));
        root.addView(bar, new LinearLayout.LayoutParams(-1, dp(3)));

        FrameLayout holder = new FrameLayout(this);
        web = new WebView(this);
        holder.addView(web, new FrameLayout.LayoutParams(-1, -1));
        root.addView(holder, new LinearLayout.LayoutParams(-1, 0, 1f));
        setContentView(root);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);
        s.setBuiltInZoomControls(true);
        s.setDisplayZoomControls(false);
        s.setSupportZoom(true);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);

        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) {
                String sc = r.getUrl().getScheme();
                if ("http".equals(sc) || "https".equals(sc)) return false;
                try { startActivity(new Intent(Intent.ACTION_VIEW, r.getUrl())); } catch (Exception ignored) {}
                return true;
            }

            @Override
            public void onPageFinished(WebView v, String u) {
                urlV.setText((u != null && u.startsWith("https") ? "🔒 " : "⚠️ ") + host(u));
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView v, int p) {
                bar.setProgress(p);
                bar.setVisibility(p >= 100 ? View.INVISIBLE : View.VISIBLE);
            }

            @Override
            public void onReceivedTitle(WebView v, String t) {
                if (!TextUtils.isEmpty(t)) titleV.setText(t);
            }
        });
        // Marksheet PDFs & downloads → system browser / download manager
        web.setDownloadListener((u, ua, cd, mime, len) -> {
            try { startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(u))); } catch (Exception ignored) {}
        });
        web.loadUrl(url);
    }

    @SuppressWarnings("deprecation")
    @Override
    public void onBackPressed() {
        if (web != null && web.canGoBack()) web.goBack();
        else super.onBackPressed();
    }

    @Override
    protected void onDestroy() {
        if (web != null) web.destroy();
        super.onDestroy();
    }

    private static String host(String u) {
        try { return Uri.parse(u).getHost(); } catch (Exception e) { return u; }
    }

    private TextView iconBtn(String s) {
        TextView t = new TextView(this);
        t.setText(s);
        t.setGravity(Gravity.CENTER);
        t.setTextSize(TypedValue.COMPLEX_UNIT_SP, 18);
        t.setTextColor(0xFF1D1A2F);
        GradientDrawable g = new GradientDrawable();
        g.setColor(Color.WHITE);
        g.setCornerRadius(dp(14));
        g.setStroke(dp(1), 0xFFECE8F5);
        t.setBackground(g);
        t.setClickable(true);
        return t;
    }

    private int dp(float v) {
        return Math.round(TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, v, getResources().getDisplayMetrics()));
    }
}
