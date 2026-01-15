import { useEffect, useState, useCallback } from 'react';
import { useAppUsageTracking } from './useAppUsageTracking';
import { LocalStorage, TrackedApp, DailyUsage } from '@/services/storage';
import { useTimer } from '@/contexts/TimerContext';

export const useNativeAppTracking = () => {
  const { getAppUsageStats, isSupported } = useAppUsageTracking();
  const [trackedApps, setTrackedApps] = useState<TrackedApp[]>([]);
  const [isTracking, setIsTracking] = useState(false);

  const { triggerNativeBreak } = useTimer();
  const [continuousUsage, setContinuousUsage] = useState<Record<string, number>>({});

  // Load tracked apps
  useEffect(() => {
    const loadApps = () => {
      const apps = LocalStorage.getTrackedApps();
      // Check if apps list changed to avoid unnecessary re-renders/logs
      setTrackedApps(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(apps)) {
          console.log('Tracked apps updated:', apps.length);
          return apps;
        }
        return prev;
      });
    };

    loadApps();
    // Poll for changes in tracked apps (in case added via another component)
    const interval = setInterval(loadApps, 2000);
    return () => clearInterval(interval);
  }, []);

  const syncUsage = useCallback(async () => {
    if (!isSupported || trackedApps.length === 0) return;

    try {
      const now = new Date();
      const settings = LocalStorage.getSettings();
      const breakFrequencySeconds = (settings.breakFrequency || 15) * 60; // Default 15 mins

      // Get local date string YYYY-MM-DD
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;

      // Get start of day in local time
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

      // 1. Get actual usage from Android for today
      const packageNames = trackedApps.map(app => app.packageName);
      console.log('Syncing usage for packages:', packageNames);

      const androidStats = await getAppUsageStats(packageNames, startOfDay.getTime());

      // 2. Aggregate stats
      let totalTime = 0;
      const appsUsage: Record<string, number> = {};
      const newContinuousUsage = { ...continuousUsage };

      // We need to fetch the PREVIOUS usage to calculate delta
      const prevDailyUsage = LocalStorage.getDailyUsage(todayStr);
      const prevAppsUsage = prevDailyUsage?.apps || {};

      for (const app of trackedApps) {
        const stat = androidStats[app.packageName];
        if (stat) {
          let seconds = Math.floor(stat.totalTimeInForeground / 1000);

          // Apply offset if applicable (only for today)
          if (app.usageOffset && app.usageOffsetDate === todayStr) {
            seconds = Math.max(0, seconds - app.usageOffset);
          }

          appsUsage[app.packageName] = seconds;
          totalTime += seconds;

          // Calculate Delta
          const prevSeconds = prevAppsUsage[app.packageName] || 0;
          const delta = seconds - prevSeconds;

          if (delta > 0) {
            // Usage increased, add to continuous usage
            const currentContinuous = (newContinuousUsage[app.packageName] || 0) + delta;
            newContinuousUsage[app.packageName] = currentContinuous;

            console.log(`Usage delta for ${app.name}: +${delta}s. Continuous: ${currentContinuous}s / ${breakFrequencySeconds}s`);

            // Check for break
            if (currentContinuous >= breakFrequencySeconds) {
              console.log(`Triggering break for ${app.name}!`);
              triggerNativeBreak(app.id);
              newContinuousUsage[app.packageName] = 0; // Reset after break
            }
          } else {
            // No usage in this poll interval, reset continuous usage?
            // Actually, we should probably only reset if it's been idle for a while, 
            // but for now, let's assume if delta is 0, they aren't using it.
            // However, aggressive polling might return 0 delta if interval is small.
            // Let's keep it simple: if delta is 0 for a few cycles, we might reset.
            // For now, we WON'T reset on 0 delta to avoid resetting during brief pauses.
            // We will rely on the user taking a break to reset it? 
            // Or maybe we reset if they switch apps?
            // Let's reset if delta is 0, implying they stopped using it.
            if (delta === 0) {
              // Optional: Reset if we want "continuous" to mean "without stopping"
              // newContinuousUsage[app.packageName] = 0; 
            }
          }
        }
      }

      setContinuousUsage(newContinuousUsage);

      // 3. Save to Local Storage
      const dailyUsage: DailyUsage = {
        date: todayStr,
        totalTime,
        apps: appsUsage
      };

      LocalStorage.saveDailyUsage(dailyUsage);

    } catch (error) {
      console.error('Error in syncUsage:', error);
    }
  }, [trackedApps, isSupported, getAppUsageStats, continuousUsage, triggerNativeBreak]);

  useEffect(() => {
    if (!isSupported || trackedApps.length === 0) {
      setIsTracking(false);
      return;
    }

    setIsTracking(true);

    // Prune old data on startup
    LocalStorage.pruneOldData();

    // Initial sync
    syncUsage();

    let intervalId: NodeJS.Timeout;

    const startPolling = () => {
      // Sync every minute if visible, every 5 minutes if hidden
      const delay = document.hidden ? 5 * 60 * 1000 : 60 * 1000;

      clearInterval(intervalId);
      intervalId = setInterval(syncUsage, delay);
    };

    startPolling();

    // Handle visibility changes
    const handleVisibilityChange = () => {
      startPolling();
      if (!document.hidden) {
        // Immediate sync when coming back to foreground
        syncUsage();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isSupported, trackedApps.length, syncUsage]);

  return { isTracking };
};
