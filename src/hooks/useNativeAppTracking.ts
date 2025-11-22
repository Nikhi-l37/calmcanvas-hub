import { useEffect } from 'react';
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

  useEffect(() => {
    if (!userId || !enabled || !isSupported || trackedApps.length === 0) {
      console.log('Tracking disabled:', { userId: !!userId, enabled, isSupported, appsCount: trackedApps.length });
      return;
    }

    console.log('Starting usage tracking for apps:', trackedApps.map(a => a.name));
    let lastCheck = Date.now();

    const trackUsage = async () => {
      try {
        const now = Date.now();
        const packageNames = trackedApps.map(app => app.packageName);
        
        // Query only for the last 2 minutes to get recent usage
        const stats = await getAppUsageStats(packageNames, 0.0014); // ~2 minutes in days
        
        console.log('Usage stats received:', stats);

        for (const app of trackedApps) {
          const appStats = stats[app.packageName];
          
          if (!appStats) {
            console.log(`No stats for ${app.name}`);
            continue;
          }

          const recentUsageMs = appStats.totalTimeInForeground;
          console.log(`${app.name} recent usage: ${recentUsageMs}ms (${Math.floor(recentUsageMs / 1000)}s)`);
          
          // Only record if there's meaningful usage in the last interval (> 10 seconds)
          if (recentUsageMs > 10000) {
            const durationSeconds = Math.floor(recentUsageMs / 1000);
            
            console.log(`Recording ${app.name}: ${durationSeconds}s`);

            // Create a new session record
            const { data: sessionData, error } = await supabase
              .from('app_sessions')
              .insert({
                user_id: userId,
                app_id: app.id,
                app_name: app.name,
                start_time: new Date(now - recentUsageMs).toISOString(),
                end_time: new Date(now).toISOString(),
                duration_seconds: durationSeconds
              })
              .select('id')
              .single();

            if (error) {
              console.error('Error recording session:', error);
            } else {
              console.log(`Session recorded for ${app.name}: ${durationSeconds}s`);
              
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
                console.log(`Updated daily stats: +${durationSeconds}s`);
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
                console.log(`Created daily stats: ${durationSeconds}s`);
              }
            }
          } else if (recentUsageMs > 0) {
            console.log(`${app.name} usage too short: ${recentUsageMs}ms`);
          }
        }
        
        lastCheck = now;
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
