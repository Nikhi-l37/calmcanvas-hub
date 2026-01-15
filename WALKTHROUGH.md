# Refactoring to Local Storage Walkthrough

This walkthrough details the changes made to transition the CalmCanvas Hub application from a Supabase-backed architecture to a local-first, offline-capable application using `localStorage`.

## Key Changes

1.  **Storage Service**: Created `src/services/storage.ts` to handle all data persistence (User Settings, Tracked Apps, Daily Usage, Breaks, Streaks).
2.  **Authentication Removal**: Removed all Supabase authentication logic, redirects, and providers. The app is now open and does not require login.
3.  **Component Refactoring**:
    *   **Dashboard**: Updated to display data from local storage. Fixed a bug in time display (seconds vs minutes).
    *   **Statistics**: Integrated `ProgressTracker` and updated charts to use local data.
    *   **Goals**: Refactored to manage daily goals via local settings.
    *   **Profile (Settings)**: Converted to a Settings page to manage user name and clear app data.
    *   **MyApps**: Updated to use local storage for tracking apps.
    *   **BreakHistory**: Refactored to fetch and display breaks from local storage.
4.  **Hooks Refactoring**:
    *   `useSessionTracking`: Now manages sessions locally and updates daily usage.
    *   `useNativeAppTracking`: Syncs native app usage to local storage.
    *   `useStats`: Fetches statistics from local storage.

## Verification Steps

### 1. Initial Load
- Open the application.
- You should land directly on the **Dashboard** without being asked to login.
- The dashboard should show 0h 0m screen time (if fresh).

### 2. Settings & Profile
- Navigate to the **Profile** page (now Settings).
- Enter your name and save.
- Verify the name persists after reload.
- **Clear Data**: Use the "Reset App Data" button to clear all local data. This will reload the page and reset everything.

### 3. Goals
- Navigate to the **Goals** page.
- Update your Daily Goal (e.g., to 150 minutes).
- Navigate to **Dashboard** or **Statistics** and verify the goal is reflected (e.g., in the Progress Tracker).

### 4. App Tracking
- Navigate to **Apps**.
- Add a new app to track (if on Android, select installed apps; if on web, add a manual tracker if available).
- Verify the app appears in the list.

### 5. Statistics
- Navigate to **Statistics**.
- Check the "Weekly Activity" chart. It should show labels for the last 7 days (e.g., Sun, Mon, Tue...).
- Check the "Weekly Total" and "Average Daily" cards.
# Refactoring to Local Storage Walkthrough

This walkthrough details the changes made to transition the CalmCanvas Hub application from a Supabase-backed architecture to a local-first, offline-capable application using `localStorage`.

## Key Changes

1.  **Storage Service**: Created `src/services/storage.ts` to handle all data persistence (User Settings, Tracked Apps, Daily Usage, Breaks, Streaks).
2.  **Authentication Removal**: Removed all Supabase authentication logic, redirects, and providers. The app is now open and does not require login.
3.  **Component Refactoring**:
    *   **Dashboard**: Updated to display data from local storage. Fixed a bug in time display (seconds vs minutes).
    *   **Statistics**: Integrated `ProgressTracker` and updated charts to use local data.
    *   **Goals**: Refactored to manage daily goals via local settings.
    *   **Profile (Settings)**: Converted to a Settings page to manage user name and clear app data.
    *   **MyApps**: Updated to use local storage for tracking apps.
    *   **BreakHistory**: Refactored to fetch and display breaks from local storage.
4.  **Hooks Refactoring**:
    *   `useSessionTracking`: Now manages sessions locally and updates daily usage.
    *   `useNativeAppTracking`: Syncs native app usage to local storage.
    *   `useStats`: Fetches statistics from local storage.

## Verification Steps

### 1. Initial Load
- Open the application.
- You should land directly on the **Dashboard** without being asked to login.
- The dashboard should show 0h 0m screen time (if fresh).

### 2. Settings & Profile
- Navigate to the **Profile** page (now Settings).
- Enter your name and save.
- Verify the name persists after reload.
- **Clear Data**: Use the "Reset App Data" button to clear all local data. This will reload the page and reset everything.

### 3. Goals
- Navigate to the **Goals** page.
- Update your Daily Goal (e.g., to 150 minutes).
- Navigate to **Dashboard** or **Statistics** and verify the goal is reflected (e.g., in the Progress Tracker).

### 4. App Tracking
- Navigate to **Apps**.
- Add a new app to track (if on Android, select installed apps; if on web, add a manual tracker if available).
- Verify the app appears in the list.

### 5. Statistics
- Navigate to **Statistics**.
- Check the "Weekly Activity" chart. It should show labels for the last 7 days (e.g., Sun, Mon, Tue...).
- Check the "Weekly Total" and "Average Daily" cards.

### 6. Breaks
- If you can trigger a break (e.g., via a timer or manually if implemented), do so.
- Check the **Dashboard** to see the "Breaks Taken" count increase.
- Check the **Break History** section on the Dashboard to see the recorded break.

### 7. Data Wipe & Fresh Start
The app now includes a mechanism to wipe legacy data and ensure a fresh "Digital Wellbeing" start.
1.  **Reload the App**: On the first load after this update, the app will automatically clear old data if the storage version doesn't match.
2.  **Manual Clear**: Go to **Settings** -> **Danger Zone** -> **Clear All Data** to manually reset everything.
3.  **Verify**: Check that the Dashboard stats are zeroed out and "My Apps" list is empty.

### 8. Popular Apps Scanning
To easily add tracking for common social media apps:
1.  Go to **My Apps**.
2.  Click the **Scan Popular** button (visible on Android/Native mode).
3.  The app will check for installed packages like YouTube, Instagram, TikTok, etc.
4.  If found, they will be automatically added to your tracking list.

### 9. Troubleshooting YouTube Tracking
If YouTube usage is not showing:
1.  Ensure you have added "YouTube" via the **Scan Popular** button or manually.
2.  Open the YouTube app on your device and use it for at least 1 minute.
3.  Return to the Screen Coach app.
4.  Wait up to 1 minute for the background sync to update the stats.
5.  Check the **Dashboard** or **My Apps** page for updated time.

## Technical Notes

- **Data Persistence**: All data is stored in the browser's `localStorage`. Clearing browser data will reset the app.
- **Offline Capable**: The app no longer makes network requests to Supabase.
- **Android Integration**: The native app tracking still relies on the Capacitor plugin, but now syncs data to `localStorage` instead of the cloud.
