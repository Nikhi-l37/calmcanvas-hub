# Screen Coach - Native Mobile App Setup

## Overview
Screen Coach has been transformed into a **native Android app** that automatically tracks your device app usage in real-time, even when apps run in the background.

## Key Features Implemented
✅ **Automatic App Tracking** - No manual timers needed
✅ **Background Monitoring** - Tracks apps even when running in background
✅ **5 App Limit** - Focus on your most important apps to monitor
✅ **Device App Discovery** - Select from your installed apps
✅ **Real-time Usage Stats** - Polls usage data every 30 seconds
✅ **No Delete Option** - Apps remain tracked (as requested)

## Setup Instructions

### Step 1: Export to GitHub
1. Click "Export to GitHub" button in Lovable
2. Clone the repository to your local machine:
```bash
git clone <your-repo-url>
cd calmcanvas-hub
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Initialize Capacitor (Already Done)
The Capacitor configuration is already set up in `capacitor.config.ts`

### Step 4: Add Android Platform
```bash
npx cap add android
```

### Step 5: Update AndroidManifest.xml
Add these permissions to `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.PACKAGE_USAGE_STATS" 
                 tools:ignore="ProtectedPermissions" />
<uses-permission android:name="android.permission.QUERY_ALL_PACKAGES" 
                 tools:ignore="QueryAllPackagesPermission" />
```

### Step 6: Build and Sync
```bash
npm run build
npx cap sync
```

### Step 7: Run on Android
```bash
npx cap run android
```

This will open Android Studio. Click the "Run" button to install on an emulator or connected device.

## How It Works

### On First Launch (Android)
1. User sees "Permission Required" screen
2. Tap "Grant Permission" to open system settings
3. Enable "Usage Access" for Screen Coach
4. App loads list of installed apps from your device

### Adding Apps to Track
1. Tap "Add Apps" button (shows remaining slots)
2. Browse or search your installed apps
3. Select up to 5 apps total
4. Tap "Add X Apps" to start tracking

### Automatic Tracking
- The app polls usage statistics every 30 seconds
- It detects when tracked apps are in foreground/background
- Usage time is automatically calculated and stored
- No need to manually start/stop timers!

### View on Web
- The web version shows instructions for setting up the mobile app
- Native features only work on Android devices
- iOS is not supported due to Apple's privacy restrictions

## Important Notes

### Android Only
This feature **only works on Android** because:
- iOS severely restricts access to other app's usage data
- Apple's Screen Time API requires special entitlements
- Android's UsageStatsManager provides full access

### Privacy & Permissions
- The app only tracks apps you explicitly select
- Usage data is stored in your Supabase database
- Package names and usage times are the only data collected
- The PACKAGE_USAGE_STATS permission is required by Android

### Development vs Production
- During development, the app connects to the Lovable sandbox URL
- For production, update the `server.url` in `capacitor.config.ts` to your deployed domain
- Then run `npx cap sync` again

## Troubleshooting

### Permission Not Working
- Go to Settings → Apps → Screen Coach → Advanced → Usage Access
- Manually enable the permission

### Apps Not Showing
- Make sure permission is granted
- Check that you're running on a physical Android device or emulator
- System apps are filtered out automatically

### Usage Not Tracking
- Ensure you're on Android (check status indicator in app)
- Verify permission is still enabled
- Check console logs for any errors

## Future Development

After git pulling updates:
```bash
npm install
npx cap sync
npx cap run android
```

## Questions?
- Check Capacitor docs: https://capacitorjs.com
- Android UsageStats plugin: https://github.com/Cap-go/capacitor-android-usagestatsmanager
