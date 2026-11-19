package com.ssc2027.app;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.WindowManager;
import android.webkit.ConsoleMessage;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import org.json.JSONObject;

import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

/**
 * Hosts the SSC 2027 web app (bundled in assets/www) inside a WebView.
 * Files are served from https://appassets.androidplatform.net/ so localStorage,
 * fetch() to Google Apps Script and all modern web APIs behave like on a real website.
 */
public class MainActivity extends Activity {
    static final String HOST = "appassets.androidplatform.net";
    static final String BASE = "https://" + HOST + "/";
    static final String EXTRA_ROUTE = "route";
    static final String EXTRA_GUARD_RETURN = "guardReturn";
    static volatile boolean isResumed = false;

    private static final int REQ_FILE = 11, REQ_SAVE = 12, REQ_NOTIF = 13;
    private WebView web;
    private WebBridge bridge;
    private ValueCallback<Uri[]> fileCb;
    private String pendingSaveText;
    private int pendingNotifCb = -1;

    @SuppressLint({"SetJavaScriptEnabled", "AddJavascriptInterface"})
    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        Notif.ensureChannels(this);
        if ((getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0) WebView.setWebContentsDebuggingEnabled(true);

        web = new WebView(this);
        web.setBackgroundColor(0xFFFFFBF7);
        web.setOverScrollMode(View.OVER_SCROLL_NEVER);
        web.setVerticalScrollBarEnabled(false);
        web.setHorizontalScrollBarEnabled(false);
        if (Build.VERSION.SDK_INT >= 26) web.setRendererPriorityPolicy(WebView.RENDERER_PRIORITY_IMPORTANT, true);
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setTextZoom(100);
        s.setSupportZoom(false);
        s.setSupportMultipleWindows(false);
        s.setJavaScriptCanOpenWindowsAutomatically(false);
        s.setUserAgentString(s.getUserAgentString() + " SSC2027App/" + versionName());

        bridge = new WebBridge(this, web);
        web.addJavascriptInterface(bridge, "SSCAndroid");
        web.setWebViewClient(new AppClient());
        web.setWebChromeClient(new AppChrome());

        handleIntent(getIntent());
        if (state != null) web.restoreState(state);
        else web.loadUrl(BASE + "index.html");
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleIntent(intent);
        js("window.SSCNative&&SSCNative.onRoute()");
    }

    private void handleIntent(Intent i) {
        if (i == null) return;
        String r = i.getStringExtra(EXTRA_ROUTE);
        if (r != null && !r.isEmpty()) {
            Store.setRoute(this, r, i.getBooleanExtra(EXTRA_GUARD_RETURN, false));
            i.removeExtra(EXTRA_ROUTE);
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        isResumed = true;
        web.onResume();
        js("window.SSCNative&&SSCNative.onResume()");
    }

    @Override
    protected void onPause() {
        isResumed = false;
        js("window.SSCNative&&SSCNative.onPause()");
        web.onPause();
        super.onPause();
    }

    @Override
    protected void onDestroy() {
        isResumed = false;
        if (web != null) {
            web.removeJavascriptInterface("SSCAndroid");
            web.destroy();
        }
        super.onDestroy();
    }

    @SuppressWarnings("deprecation")
    @Override
    public void onBackPressed() {
        web.evaluateJavascript("(window.SSC_onBack&&window.SSC_onBack())?'1':'0'", v -> {
            if (v != null && v.contains("1")) return;
            moveTaskToBack(true);
        });
    }

    void js(String code) {
        if (web == null) return;
        web.post(() -> web.evaluateJavascript(code, null));
    }

    // ------------------------------------------------------------------ helpers used by the bridge
    void keepScreenOn(boolean on) {
        runOnUiThread(() -> {
            if (on) getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            else getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        });
    }

    void requestNotifPermission(int cb) {
        runOnUiThread(() -> {
            if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                pendingNotifCb = cb;
                requestPermissions(new String[]{android.Manifest.permission.POST_NOTIFICATIONS}, REQ_NOTIF);
            } else {
                bridge.resolve(cb, "\"" + (Notif.allowed(this) ? "granted" : "denied") + "\"");
            }
        });
    }

    @Override
    public void onRequestPermissionsResult(int req, String[] perms, int[] res) {
        super.onRequestPermissionsResult(req, perms, res);
        if (req == REQ_NOTIF && pendingNotifCb >= 0) {
            boolean ok = res.length > 0 && res[0] == PackageManager.PERMISSION_GRANTED;
            bridge.resolve(pendingNotifCb, ok ? "\"granted\"" : "\"denied\"");
            pendingNotifCb = -1;
        }
    }

    void saveFile(String name, String mime, String text) {
        runOnUiThread(() -> {
            pendingSaveText = text;
            Intent i = new Intent(Intent.ACTION_CREATE_DOCUMENT);
            i.addCategory(Intent.CATEGORY_OPENABLE);
            i.setType(mime == null || mime.isEmpty() ? "application/octet-stream" : mime);
            i.putExtra(Intent.EXTRA_TITLE, name);
            try {
                startActivityForResult(i, REQ_SAVE);
            } catch (ActivityNotFoundException e) {
                Toast.makeText(this, "ফাইল সেভ করা যায়নি", Toast.LENGTH_SHORT).show();
            }
        });
    }

    void openInApp(String url, String title) {
        runOnUiThread(() -> {
            Intent i = new Intent(this, ResultBrowserActivity.class);
            i.putExtra("url", url);
            i.putExtra("title", title);
            startActivity(i);
        });
    }

    void openExternal(String url) {
        runOnUiThread(() -> {
            try {
                Intent i = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(i);
            } catch (Exception e) {
                Toast.makeText(this, "খোলা যায়নি: " + url, Toast.LENGTH_SHORT).show();
            }
        });
    }

    @Override
    protected void onActivityResult(int req, int code, Intent data) {
        super.onActivityResult(req, code, data);
        if (req == REQ_FILE) {
            if (fileCb != null) fileCb.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(code, data));
            fileCb = null;
        } else if (req == REQ_SAVE) {
            boolean ok = false;
            if (code == RESULT_OK && data != null && data.getData() != null && pendingSaveText != null) {
                try (OutputStream os = getContentResolver().openOutputStream(data.getData())) {
                    if (os != null) { os.write(pendingSaveText.getBytes(StandardCharsets.UTF_8)); ok = true; }
                } catch (Exception e) { Log.e("SSC", "save failed", e); }
            }
            pendingSaveText = null;
            js("window.SSCNative&&SSCNative.saved(" + ok + ")");
        }
    }

    private String versionName() {
        try { return getPackageManager().getPackageInfo(getPackageName(), 0).versionName; } catch (Exception e) { return "1"; }
    }

    // ------------------------------------------------------------------ WebView clients
    private static final Map<String, String> MIME = new HashMap<>();
    static {
        MIME.put("html", "text/html"); MIME.put("js", "application/javascript"); MIME.put("css", "text/css");
        MIME.put("json", "application/json"); MIME.put("webmanifest", "application/manifest+json");
        MIME.put("png", "image/png"); MIME.put("webp", "image/webp"); MIME.put("jpg", "image/jpeg"); MIME.put("svg", "image/svg+xml");
        MIME.put("woff2", "font/woff2"); MIME.put("ico", "image/x-icon"); MIME.put("txt", "text/plain");
    }

    private class AppClient extends WebViewClient {
        @Override
        public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest req) {
            Uri u = req.getUrl();
            if (!HOST.equals(u.getHost())) return null;
            String path = u.getPath() == null || u.getPath().equals("/") ? "/index.html" : u.getPath();
            String ext = path.contains(".") ? path.substring(path.lastIndexOf('.') + 1).toLowerCase(Locale.US) : "";
            String mime = MIME.containsKey(ext) ? MIME.get(ext) : "application/octet-stream";
            Map<String, String> headers = new HashMap<>();
            // html/js/css must always be fresh after an app update; images & fonts can be cached
            boolean asset = mime.startsWith("image/") || mime.startsWith("font/") || ext.equals("woff2") || ext.equals("woff");
            headers.put("Cache-Control", asset ? "max-age=604800" : "no-cache");
            headers.put("Access-Control-Allow-Origin", "*");
            try {
                InputStream in = getAssets().open("www" + path);
                boolean text = mime.startsWith("text/") || mime.contains("javascript") || mime.contains("json");
                return new WebResourceResponse(mime, text ? "UTF-8" : null, 200, "OK", headers, in);
            } catch (Exception e) {
                return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found", headers, null);
            }
        }

        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
            Uri u = req.getUrl();
            if (HOST.equals(u.getHost())) return false;
            String scheme = u.getScheme() == null ? "" : u.getScheme();
            if (scheme.equals("http") || scheme.equals("https")) {
                openInApp(u.toString(), "");
            } else {
                openExternal(u.toString());
            }
            return true;
        }

        @Override
        public boolean onRenderProcessGone(WebView view, android.webkit.RenderProcessGoneDetail detail) {
            recreate();
            return true;
        }
    }

    private class AppChrome extends WebChromeClient {
        @Override
        public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> cb, FileChooserParams params) {
            if (fileCb != null) fileCb.onReceiveValue(null);
            fileCb = cb;
            try {
                Intent i = params.createIntent();
                i.setType("*/*");
                startActivityForResult(i, REQ_FILE);
            } catch (Exception e) {
                fileCb = null;
                return false;
            }
            return true;
        }

        @Override
        public boolean onConsoleMessage(ConsoleMessage m) {
            Log.d("SSC-JS", m.message() + " @" + m.sourceId() + ":" + m.lineNumber());
            return true;
        }
    }

    static String q(String s) { return JSONObject.quote(s == null ? "" : s); }
}
