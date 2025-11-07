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
    if (!UsageStatsManager) return;
    
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
      
      // Filter out system apps and format the data
      const apps: InstalledApp[] = result.packages
        .filter(pkg => 
          pkg.packageName && 
          !pkg.packageName.startsWith('com.android.') &&
          !pkg.packageName.startsWith('com.google.android.')
        )
        .map(pkg => ({
          packageName: pkg.packageName,
          appName: pkg.appName || pkg.packageName.split('.').pop() || pkg.packageName,
          icon: pkg.icon
        }))
        .sort((a, b) => a.appName.localeCompare(b.appName));
      
      setInstalledApps(apps);
    } catch (error) {
      console.error('Error loading installed apps:', error);
    }
  };

  const getAppUsageStats = async (packageNames: string[], days: number = 1): Promise<Record<string, AppUsageStats>> => {
    if (!UsageStatsManager) return {};
    
    try {
      const endTime = Date.now();
      const startTime = endTime - (days * 24 * 60 * 60 * 1000);
      
      const stats = await UsageStatsManager.queryAndAggregateUsageStats({
        intervalType: 0, // INTERVAL_DAILY
        startTime,
        endTime
      });

      const result: Record<string, AppUsageStats> = {};
      
      for (const packageName of packageNames) {
        if (stats[packageName]) {
          result[packageName] = {
            packageName,
            totalTimeInForeground: stats[packageName].totalTimeInForeground || 0,
            lastTimeUsed: stats[packageName].lastTimeUsed || 0
          };
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error getting usage stats:', error);
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
