import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppUsageTracking } from './useAppUsageTracking';

interface TrackedApp {
  id: number;
  name: string;
  packageName: string;
}

export const useNativeAppTracking = (
  userId: string | undefined,
  trackedApps: TrackedApp[],
  enabled: boolean
) => {
  const { getAppUsageStats, isSupported } = useAppUsageTracking();

  const lastUsageRef = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!userId || !enabled || !isSupported || trackedApps.length === 0) {
      console.log('Tracking disabled:', { userId: !!userId, enabled, isSupported, appsCount: trackedApps.length });
      return;
    }

    console.log('Starting usage tracking for apps:', trackedApps.map(a => a.name));

    const trackUsage = async () => {
      try {
        const now = Date.now();
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const packageNames = trackedApps.map(app => app.packageName);

        // Query stats from start of day to get cumulative total
        const stats = await getAppUsageStats(packageNames, startOfDay.getTime());

        console.log('Usage stats received:', stats);

        for (const app of trackedApps) {
          const appStats = stats[app.packageName];

          if (!appStats) {
            continue;
          }

          const currentTotalTime = appStats.totalTimeInForeground;
          const lastTotalTime = lastUsageRef.current[app.packageName] || 0;

          // If this is the first check, just store the current total and continue
          // We don't want to record the entire day's usage as a single session right now
          if (lastTotalTime === 0 && currentTotalTime > 0) {
            console.log(`Initializing baseline for ${app.name}: ${currentTotalTime}ms`);
            lastUsageRef.current[app.packageName] = currentTotalTime;
            continue;
          }

          const deltaMs = currentTotalTime - lastTotalTime;

          if (deltaMs > 1000) { // Only record if > 1 second usage
            const durationSeconds = Math.floor(deltaMs / 1000);

            console.log(`Recording ${app.name} delta: ${durationSeconds}s`);

            // Update baseline
            lastUsageRef.current[app.packageName] = currentTotalTime;

            // Create a new session record
            const { error } = await supabase
              .from('app_sessions')
              .insert({
                user_id: userId,
                app_id: app.id,
                app_name: app.name,
                start_time: new Date(now - deltaMs).toISOString(),
                end_time: new Date(now).toISOString(),
                duration_seconds: durationSeconds
              });

            if (error) {
              console.error('Error recording session:', error);
            } else {
              // Update daily stats
              const today = new Date().toISOString().split('T')[0];

              const { data: existingStats } = await supabase
                .from('daily_stats')
                .select('*')
                .eq('user_id', userId)
                .eq('date', today)
                .single();

              if (existingStats) {
                await supabase
                  .from('daily_stats')
                  .update({
                    total_time_seconds: existingStats.total_time_seconds + durationSeconds,
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', existingStats.id);
              } else {
                await supabase
                  .from('daily_stats')
                  .insert({
                    user_id: userId,
                    date: today,
                    total_time_seconds: durationSeconds,
                    apps_used: 1,
                    breaks_taken: 0
                  });
              }
            }
          }
        }
      } catch (error) {
        console.error('Error tracking usage:', error);
      }
    };

    // Track immediately after 5 seconds to allow time for permission
    const initialTimer = setTimeout(trackUsage, 5000);

    // Then track every 2 minutes
    const interval = setInterval(trackUsage, 120000); // 2 minutes

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [userId, trackedApps, enabled, isSupported, getAppUsageStats]);
};
