# 📱 Chatum Mobile (React Native / Android APK)

A native **React Native (Expo)** mobile application for **Chatum**, supporting real-time WebSocket messaging, channel switching, typing indicators, presence tracking, and profile photo upload.

---

## 📦 How to Generate Standalone Android `.apk` File

EAS Build builds a standalone `.apk` directly in the cloud (no local Android SDK / Android Studio required).

### Step 1: Install EAS CLI
```bash
npm install -g eas-cli
```

### Step 2: Login to Expo
```bash
npx eas login
```
*(If you don't have an Expo account, create a free one at [expo.dev](https://expo.dev)).*

### Step 3: Build the Android `.apk`
```bash
cd mobile
npx eas build -p android --profile preview
```

### Step 4: Download & Install
When the build completes, EAS will print a direct **APK download link** (and QR code) in your terminal.
1. Download the `.apk` file to your Android phone.
2. Tap the downloaded file to install **Chatum** on your device.

---

## 🏃 Testing Locally on Device or Emulator

### Run with Expo Go:
1. Install **Expo Go** from Google Play Store on your Android phone.
2. In the terminal:
   ```bash
   cd mobile
   npm install
   npx expo start
   ```
3. Scan the QR code with your phone camera or Expo Go app to launch Chatum live!
