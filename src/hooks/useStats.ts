import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UserStats {
  totalTimeToday: number;
  appsUsedToday: number;
  breaksToday: number;
  streak: number;
  weeklyProgress: number[];
}

export const useStats = (userId: string | undefined) => {
  const [stats, setStats] = useState<UserStats>({
    totalTimeToday: 0,
    appsUsedToday: 0,
    breaksToday: 0,
    streak: 0,
    weeklyProgress: [0, 0, 0, 0, 0, 0, 0],
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) return;

    const fetchStats = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];

        // Fetch today's stats
        const { data: dailyStats } = await supabase
          .from('daily_stats')
          .select('*')
          .eq('user_id', userId)
          .eq('date', today)
          .maybeSingle();

        // Fetch streak
        const { data: streakData } = await supabase
          .from('user_streaks')
          .select('current_streak')
          .eq('user_id', userId)
          .maybeSingle();

        // Fetch weekly progress (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        const { data: weeklyData } = await supabase
          .from('daily_stats')
          .select('total_time_seconds, date')
          .eq('user_id', userId)
          .gte('date', sevenDaysAgo.toISOString().split('T')[0])
          .order('date', { ascending: true });

        const weeklyProgress = weeklyData?.map(d => Math.round(d.total_time_seconds / 60)) || [];
        while (weeklyProgress.length < 7) {
          weeklyProgress.unshift(0);
        }

        setStats({
          totalTimeToday: dailyStats?.total_time_seconds || 0,
          appsUsedToday: dailyStats?.apps_used || 0,
          breaksToday: dailyStats?.breaks_taken || 0,
          streak: streakData?.current_streak || 0,
          weeklyProgress: weeklyProgress.slice(-7),
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        toast({
          title: 'Error',
          description: 'Failed to load statistics',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Set up realtime subscription for stats updates
    const channel = supabase
      .channel('stats-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_stats',
          filter: `user_id=eq.${userId}`,
        },
        () => fetchStats()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_streaks',
          filter: `user_id=eq.${userId}`,
        },
        () => fetchStats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, toast]);

  return { stats, loading };
};
