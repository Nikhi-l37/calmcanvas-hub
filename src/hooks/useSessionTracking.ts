import { useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSessionTracking = (userId: string | undefined) => {
  const currentSessionRef = useRef<string | null>(null);
  const { toast } = useToast();

  const startSession = useCallback(async (appId: number, appName: string): Promise<string | null> => {
    if (!userId) return null;

    try {
      const { data, error } = await supabase
        .from('app_sessions')
        .insert({
          user_id: userId,
          app_id: appId,
          app_name: appName,
        })
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error starting session:', error);
      return null;
    }
  }, [userId]);

  const endSession = useCallback(async (sessionId?: string) => {
    if (!userId) return;
    if (!sessionId && !currentSessionRef.current) return;

    try {
      const targetSessionId = sessionId || currentSessionRef.current;
      
      // Get session start time
      const { data: session } = await supabase
        .from('app_sessions')
        .select('start_time, app_id, app_name')
        .eq('id', targetSessionId)
        .single();

      if (session) {
        const endTime = new Date();
        const startTime = new Date(session.start_time);
        const durationSeconds = Math.round((endTime.getTime() - startTime.getTime()) / 1000);

        // Update session
        await supabase
          .from('app_sessions')
          .update({
            end_time: endTime.toISOString(),
            duration_seconds: durationSeconds,
          })
          .eq('id', targetSessionId);

        // Update daily stats
        const today = new Date().toISOString().split('T')[0];
        const { data: existingStats } = await supabase
          .from('daily_stats')
          .select('*')
          .eq('user_id', userId)
          .eq('date', today)
          .maybeSingle();

      if (existingStats) {
        // Check if this is a new app for today
        const { data: todaySessions } = await supabase
          .from('app_sessions')
          .select('app_id')
          .eq('user_id', userId)
          .gte('start_time', `${today}T00:00:00`)
          .lt('start_time', `${today}T23:59:59`);
        
        const uniqueApps = new Set(todaySessions?.map(s => s.app_id) || []);
        
        await supabase
          .from('daily_stats')
          .update({
            total_time_seconds: existingStats.total_time_seconds + durationSeconds,
            apps_used: uniqueApps.size,
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
            breaks_taken: 0,
          });
      }

        // Update streak
        await updateStreak(userId, today);
      }

      if (!sessionId) {
        currentSessionRef.current = null;
      }
    } catch (error) {
      console.error('Error ending session:', error);
    }
  }, [userId]);

  const recordBreak = useCallback(async (durationSeconds: number, activityType?: string) => {
    if (!userId) return;

    try {
      await supabase
        .from('breaks')
        .insert({
          user_id: userId,
          duration_seconds: durationSeconds,
          activity_type: activityType,
        });

      // Update daily stats
      const today = new Date().toISOString().split('T')[0];
      const { data: existingStats } = await supabase
        .from('daily_stats')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .maybeSingle();

      if (existingStats) {
        await supabase
          .from('daily_stats')
          .update({
            breaks_taken: existingStats.breaks_taken + 1,
          })
          .eq('id', existingStats.id);
      }

      toast({
        title: 'Break Recorded',
        description: `${Math.round(durationSeconds / 60)} minute break completed!`,
      });
    } catch (error) {
      console.error('Error recording break:', error);
    }
  }, [userId, toast]);

  return {
    startSession,
    endSession,
    recordBreak,
  };
};

async function updateStreak(userId: string, today: string) {
  const { data: streak } = await supabase
    .from('user_streaks')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (!streak) {
    // Create new streak
    await supabase
      .from('user_streaks')
      .insert({
        user_id: userId,
        current_streak: 1,
        longest_streak: 1,
        highest_streak: 1,
        last_activity_date: today,
      });
  } else {
    const lastActivity = streak.last_activity_date;
    let newStreak = streak.current_streak;

    if (lastActivity === yesterdayStr) {
      // Continue streak
      newStreak += 1;
    } else if (lastActivity !== today) {
      // Reset streak if more than 1 day gap
      newStreak = 1;
    }

    const newHighestStreak = Math.max(newStreak, streak.highest_streak || 0);

    await supabase
      .from('user_streaks')
      .update({
        current_streak: newStreak,
        longest_streak: Math.max(newStreak, streak.longest_streak),
        highest_streak: newHighestStreak,
        last_activity_date: today,
      })
      .eq('user_id', userId);
  }

  // Update daily completions
  await supabase
    .from('daily_completions')
    .upsert({
      user_id: userId,
      date: today,
      completed: true,
      total_time_seconds: 60, // Mark as completed with at least 1 minute
    }, {
      onConflict: 'user_id,date'
    });
}
