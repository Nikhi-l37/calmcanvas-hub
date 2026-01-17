import { useEffect, useState, useCallback } from 'react';
import { useAppUsageTracking } from './useAppUsageTracking';
import { LocalStorage, TrackedApp, DailyUsage } from '@/services/storage';
import { useTimer } from '@/contexts/TimerContext';
import { LocalNotifications } from '@capacitor/local-notifications';

export const useNativeAppTracking = () => {
  const { getAppUsageStats, isSupported } = useAppUsageTracking();
  const [trackedApps, setTrackedApps] = useState<TrackedApp[]>([]);
  const [isTracking, setIsTracking] = useState(false);

  // Track which apps we have already warned about today to avoid spamming
  const [warnedApps, setWarnedApps] = useState<Record<string, boolean>>({});

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

      // Get start of day in local time (Add 1 second to strictly exclude yesterday)
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 1, 0);

      // 1. Get actual usage from Android for today
      const packageNames = trackedApps.map(app => app.packageName);
      console.log(`Syncing usage for packages since ${startOfDay.toLocaleString()}`);

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

          // --- SELF-HEALING LOGIC ---
          // If usage is greater than time elapsed today, it includes yesterday's data (Weekly/Cumulative bucket).
          // We treat the excess as a "healing offset" (baseline) for today.

          const msSinceMidnight = now.getTime() - startOfDay.getTime();
          const secondsSinceMidnight = msSinceMidnight / 1000;
          const SANITY_BUFFER = 60 * 15; // 15 mins buffer

          if (seconds > (secondsSinceMidnight + SANITY_BUFFER)) {
            console.warn(`[Sanity] ${app.name} usage (${seconds}s) > elapsed time (${secondsSinceMidnight}s). Auto-correcting.`);

            // Check if we already have a dynamic offset for today
            // We can reuse the existing usageOffset structure or create a temporary one.
            // For simplicity/robustness, let's update the app's persistent offset.

            // Calculate how much "extra" time there is. 
            // Ideally we want usage to be 0 if this is the first check, 
            // but if they legit used it for 10 mins, we can't know perfectly.
            // Best bet: Set offset such that current usage becomes 0 (or close to 0).
            // But we only want to do this ONCE per day/anomaly.

            // Since we can't update 'app' prop easily from here without triggering re-renders loop,
            // we will calculate a local adjustment. 

            // Better Approach: Use LocalStorage to store daily fixes.
            const healingKey = `healing_${todayStr}_${app.packageName}`;
            const storedHealing = localStorage.getItem(healingKey);
            let healingOffset = storedHealing ? parseInt(storedHealing) : 0;

            if (!healingOffset) {
              // First time detecting glitch today. Set offset = current raw value.
              // This assumes the discrepancy > elapsed means we prefer to start from 0 than show 18 hours.
              healingOffset = seconds;
              localStorage.setItem(healingKey, healingOffset.toString());
              console.log(`[Sanity] Created healing offset for ${app.name}: -${healingOffset}s`);
            }

            seconds = Math.max(0, seconds - healingOffset);
          } else {
            // If we have a healing offset, we still need to apply it!
            const healingKey = `healing_${todayStr}_${app.packageName}`;
            const storedHealing = localStorage.getItem(healingKey);
            if (storedHealing) {
              seconds = Math.max(0, seconds - parseInt(storedHealing));
            }
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
          }

          // --- STREAK WARNING LOGIC ---
          // 50 minutes = 3000 seconds. Limit is 60 minutes (3600 seconds).
          const WARNING_THRESHOLD = 3000;

          // Check if we passed the warning threshold AND haven't warned yet
          if (seconds >= WARNING_THRESHOLD && seconds < 3600 && !warnedApps[app.packageName]) {
            console.log(`Triggering Streak Warning for ${app.name}`);

            // Send Notification
            LocalNotifications.schedule({
              notifications: [{
                title: `⚠️ Steak Risk: ${app.name}`,
                body: `You've used ${app.name} for 50m. Only 10m left before you lose your streak!`,
                id: Math.floor(Math.random() * 100000),
                schedule: { at: new Date(Date.now() + 1000) }, // 1 second from now
                smallIcon: 'ic_stat_flame', // fallback icon
                actionTypeId: "",
                extra: null
              }]
            }).catch(err => console.error("Failed to schedule notification", err));

            // Mark as warned so we don't spam
            setWarnedApps(prev => ({ ...prev, [app.packageName]: true }));
          }
          // Reset warning flag if usage drops (e.g. new day reset)
          if (seconds < 100) {
            // If usage is basically 0, reset the warning for tomorrow
            setWarnedApps(prev => {
              const copy = { ...prev };
              delete copy[app.packageName];
              return copy;
            });
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
