import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

// Dynamic import for the plugin - will only work on Android
let UsageStatsManager: any = null;

if (Capacitor.getPlatform() === 'android') {
  import('@capgo/capacitor-android-usagestatsmanager')
    .then(module => {
      UsageStatsManager = module.CapacitorUsageStatsManager;
    })
    .catch(err => console.warn('Android UsageStats plugin not available:', err));
}

export interface InstalledApp {
  packageName: string;
  appName: string;
  icon?: string;
}

export interface AppUsageStats {
  packageName: string;
  totalTimeInForeground: number;
  lastTimeUsed: number;
}

export const useAppUsageTracking = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [installedApps, setInstalledApps] = useState<InstalledApp[]>([]);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if running on Android
    setIsSupported(Capacitor.getPlatform() === 'android');

    if (Capacitor.getPlatform() === 'android') {
      checkPermission();
    }
  }, []);

  const checkPermission = async () => {
    if (!UsageStatsManager) {
      console.warn('UsageStatsManager not available, retrying...');
      setTimeout(checkPermission, 1000); // Retry after 1 second
      return;
    }

    try {
      const result = await UsageStatsManager.isUsageStatsPermissionGranted();
      setHasPermission(result.granted);

      if (result.granted) {
        await loadInstalledApps();
      }
    } catch (error) {
      console.error('Error checking permission:', error);
    }
  };

  const requestPermission = async () => {
    if (!UsageStatsManager) return;

    try {
      await UsageStatsManager.openUsageStatsSettings();
      // Check permission again after user returns from settings
      setTimeout(checkPermission, 1000);
    } catch (error) {
      console.error('Error requesting permission:', error);
    }
  };

  const loadInstalledApps = async () => {
    if (!UsageStatsManager) return;

    try {
      const result = await UsageStatsManager.queryAllPackages();
      console.log('Raw packages from device:', result.packages.length);

      // Filter to show only user-installed apps
      const apps: InstalledApp[] = result.packages
        .filter((app: any) => {
          if (!app.packageName || !app.appName) return false;

          // Exclude specific system packages and components
          const systemPackages = [
            'com.android.systemui',
            'com.android.settings',
            'com.android.providers',
            'com.android.launcher',
            'com.android.inputmethod',
            'com.android.vending.setup',
            'com.google.android.gms',
            'com.google.android.gsf',
            'com.google.android.ext',
            'com.google.android.overlay',
            'com.google.android.packageinstaller',
            'com.google.android.permissioncontroller',
            'com.google.mainline',
            'android.auto_generated',
            'app.lovable.efbe28a2ea794dd8a955a30390665a53'
          ];

          if (systemPackages.some((pkg: string) => app.packageName.startsWith(pkg))) {
            return false;
          }

          // Exclude system component names
          const systemNames = [
            'android system',
            'system ui',
            'main components',
            'support components',
            'services',
            'package installer',
            'android auto',
            'webview',
            'calmcanvas-hub'
          ];

          const lowerAppName = app.appName.toLowerCase();
          if (systemNames.some((name: string) => lowerAppName.includes(name))) {
            return false;
          }

          return true;
        })
        .map((pkg: any) => ({
          packageName: pkg.packageName,
          appName: pkg.appName || pkg.packageName.split('.').pop() || pkg.packageName,
          icon: pkg.icon
        }))
        .sort((a: InstalledApp, b: InstalledApp) => a.appName.localeCompare(b.appName));

      console.log('Filtered to', apps.length, 'apps');
      setInstalledApps(apps);
    } catch (error) {
      console.error('Error loading installed apps:', error);
    }
  };

  const getAppUsageStats = async (packageNames: string[], startTime?: number): Promise<Record<string, AppUsageStats>> => {
    if (!UsageStatsManager) return {};

    try {
      const endTime = Date.now();
      // Default to 24 hours ago if no start time provided
      const actualStartTime = startTime || (endTime - (24 * 60 * 60 * 1000));

      console.log(`[useAppUsageTracking] Querying usage stats from ${new Date(actualStartTime).toLocaleString()} to ${new Date(endTime).toLocaleString()}`);

      const stats = await UsageStatsManager.queryAndAggregateUsageStats({
        beginTime: actualStartTime,
        endTime
      });

      console.log('[useAppUsageTracking] Raw stats received:', JSON.stringify(stats).substring(0, 500) + '...');

      const result: Record<string, AppUsageStats> = {};

      for (const packageName of packageNames) {
        if (stats[packageName]) {
          console.log(`[useAppUsageTracking] Found stats for ${packageName}:`, stats[packageName]);
          result[packageName] = {
            packageName,
            totalTimeInForeground: stats[packageName].totalTimeInForeground || 0,
            lastTimeUsed: stats[packageName].lastTimeUsed || 0
          };
        } else {
          console.log(`[useAppUsageTracking] No stats found for ${packageName}`);
        }
      }

      return result;
    } catch (error) {
      console.error('[useAppUsageTracking] Error getting usage stats:', error);
      return {};
    }
  };

  return {
    isSupported,
    hasPermission,
    installedApps,
    requestPermission,
    checkPermission,
    getAppUsageStats,
    loadInstalledApps
  };
};
