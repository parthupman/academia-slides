# Deploy AcademiaSlides to Google Play Store 📱

This guide explains how to deploy the AcademiaSlides web app as a native Android app on the Google Play Store using **Trusted Web Activity (TWA)**.

## What is Trusted Web Activity?

TWA is a way to package your web app (PWA) as a native Android app. Users download it from Play Store, but it runs as a full-screen browser experience with native app capabilities.

## Prerequisites

1. **Deployed Web App**: Your Next.js app must be deployed to a public URL (Vercel)
2. **Google Play Console Account**: $25 one-time fee
3. **Android Studio**: For building the APK/AAB
4. **Digital Asset Links**: For verifying domain ownership

## Step-by-Step Deployment

### Step 1: Deploy Web App to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login and deploy
vercel login
vercel --prod
```

Get your deployed URL: `https://academia-slides.vercel.app`

### Step 2: Update TWA Configuration

1. Edit `android/app/src/main/AndroidManifest.xml`:
   - Replace `academia-slides.vercel.app` with your actual domain

2. Edit `android/app/src/main/res/values/strings.xml`:
   - Replace the domain in `asset_statements`

### Step 3: Generate App Icons

Create app icons in these sizes:
- 48x48 (mdpi)
- 72x72 (hdpi)
- 96x96 (xhdpi)
- 144x144 (xxhdpi)
- 192x192 (xxxhdpi)
- 512x512 (Play Store)

Use a tool like: https://appicon.co/

Place icons in:
```
android/app/src/main/res/mipmap-mdpi/ic_launcher.png
android/app/src/main/res/mipmap-hdpi/ic_launcher.png
android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png
```

### Step 4: Set Up Digital Asset Links

Create a file `public/.well-known/assetlinks.json` in your Next.js app:

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.academiaslides.app",
    "sha256_cert_fingerprints": [
      "YOUR_SHA256_FINGERPRINT_HERE"
    ]
  }
}]
```

**To get SHA256 fingerprint:**
1. Generate a keystore (see Step 5)
2. Run:
```bash
keytool -list -v -keystore my-release-key.keystore -alias my-key-alias
```
3. Copy the SHA256 fingerprint

### Step 5: Generate Signing Keystore

```bash
cd android/app

# Generate keystore
keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000

# Get SHA256 fingerprint for assetlinks.json
keytool -list -v -keystore my-release-key.keystore -alias my-key-alias
```

Store the keystore safely - you need it for all updates!

### Step 6: Build Release AAB

#### Option A: Using Android Studio (Recommended)

1. Open Android Studio
2. Select "Open an existing project"
3. Choose the `android` folder
4. Wait for Gradle sync to complete
5. Build → Generate Signed Bundle/APK
6. Select "Android App Bundle"
7. Choose your keystore
8. Build release AAB

#### Option B: Using Command Line

```bash
cd android

# Make gradlew executable (Linux/Mac)
chmod +x gradlew

# Build release AAB
./gradlew bundleRelease

# Or build APK
./gradlew assembleRelease
```

Output location:
```
android/app/build/outputs/bundle/release/app-release.aab
```

### Step 7: Create Play Store Listing

1. Go to [Google Play Console](https://play.google.com/console)
2. Create new app
3. Fill in app details:
   - App name: AcademiaSlides
   - Short description: AI Research Paper to Presentation
   - Full description: (see below)

**Suggested Description:**
```
Transform your research papers into stunning academic presentations with AI!

AcademiaSlides uses advanced AI to analyze your research papers and automatically generate professional PowerPoint presentations. Perfect for students, researchers, and academics.

Features:
✓ Upload any PDF research paper
✓ AI extracts key information automatically
✓ Choose from 5 professional templates
✓ Customize slide count (5-50 slides)
✓ Download as PowerPoint (.pptx)
✓ Works offline after first load

How it works:
1. Upload your research paper PDF
2. AI analyzes and extracts structure
3. Choose your preferred style
4. Download presentation instantly

AcademiaSlides - Making academic presentations effortless!
```

### Step 8: Upload Assets

Upload these in Play Console:

**Screenshots** (required):
- Phone: 2-8 screenshots (16:9 or 9:16)
- Tablet: Optional but recommended

**Graphics**:
- App icon: 512x512 PNG
- Feature graphic: 1024x500 PNG
- Optional: Promo video (YouTube)

### Step 9: Upload AAB & Release

1. Go to "Production" track
2. Create new release
3. Upload your `app-release.aab`
4. Fill release notes
5. Review and rollout

### Step 10: Test on Device

Before release, test the internal sharing link on a real Android device to ensure TWA works correctly.

## Troubleshooting

### "Site not verified" error
- Ensure `assetlinks.json` is accessible at `https://yourdomain/.well-known/assetlinks.json`
- Check SHA256 fingerprint matches
- Verify `AndroidManifest.xml` domain matches

### App opens in browser instead of TWA
- Check Digital Asset Links are properly configured
- Ensure Chrome is updated on test device

### App won't install
- Check minSdk version (21 = Android 5.0)
- Verify APK/AAB is properly signed

## Alternative: Use Bubblewrap CLI

For easier TWA creation, you can use Bubblewrap:

```bash
# Install bubblewrap
npm i -g @bubblewrap/cli

# Generate TWA
bubblewrap init --manifest https://academia-slides.vercel.app/manifest.json

# Build
bubblewrap build
```

This generates the Android project automatically!

## Updating the App

1. Update web app on Vercel (changes reflect immediately in TWA)
2. For native changes (icons, config):
   - Update files in `android/` folder
   - Increment `versionCode` in `app/build.gradle`
   - Rebuild and upload new AAB

## Need Help?

- [TWA Documentation](https://developer.chrome.com/docs/android/trusted-web-activity/)
- [Digital Asset Links Helper](https://developers.google.com/digital-asset-links/tools/generator)
- [Play Console Help](https://support.google.com/googleplay/android-developer)

---

Good luck with your Play Store launch! 🚀
