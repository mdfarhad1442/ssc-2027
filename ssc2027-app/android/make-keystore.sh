#!/usr/bin/env bash
# ----------------------------------------------------------------------------
# একবারই চালাও: APK সাইন করার নিজস্ব কী (keystore) তৈরি করে, আর GitHub Secrets-এ
# বসানোর জন্য base64 টেক্সট দেখায়। (Java/keytool লাগবে — Android Studio বা JDK)
# ব্যবহার:  bash android/make-keystore.sh
# ----------------------------------------------------------------------------
set -e
ALIAS="${1:-ssc2027}"
FILE="ssc2027-release.jks"
read -r -s -p "একটা শক্ত পাসওয়ার্ড দাও (কমপক্ষে ৬ অক্ষর): " PASS; echo
keytool -genkeypair -v -keystore "$FILE" -alias "$ALIAS" -keyalg RSA -keysize 2048 -validity 10000 \
  -storepass "$PASS" -keypass "$PASS" -dname "CN=SSC 2027, OU=Study, O=SSC2027, C=BD"
echo
echo "✅ $FILE তৈরি হয়েছে — এটা নিরাপদে রেখে দাও (হারালে আপডেট দেওয়া যাবে না)।"
echo
echo "GitHub → Settings → Secrets and variables → Actions → New repository secret:"
echo "  SSC_KEYSTORE_BASE64  = (নিচের লম্বা টেক্সট পুরোটা)"
echo "  SSC_KEYSTORE_PASSWORD = তোমার পাসওয়ার্ড"
echo "  SSC_KEY_ALIAS        = $ALIAS"
echo "  SSC_KEY_PASSWORD     = তোমার পাসওয়ার্ড"
echo "-------------------------------------------------------------"
if base64 --help 2>&1 | grep -q -- '-w'; then base64 -w0 "$FILE"; else base64 "$FILE" | tr -d '\n'; fi
echo
echo "-------------------------------------------------------------"
