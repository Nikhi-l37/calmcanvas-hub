import { useState, useEffect } from 'react';
import { LocalStorage } from '@/services/storage';
import { useToast } from '@/hooks/use-toast';

export interface UserStats {
  totalTimeToday: number;
  appsUsedToday: number;
  breaksToday: number;
  totalTimeYesterday: number;
  appsUsedYesterday: number;
  breaksYesterday: number;
  streak: number;
  highestStreak: number;
  weeklyProgress: number[];
}

export const useStats = () => {
  const [stats, setStats] = useState<UserStats>({
    totalTimeToday: 0,
    appsUsedToday: 0,
    breaksToday: 0,
    totalTimeYesterday: 0,
    appsUsedYesterday: 0,
    breaksYesterday: 0,
    streak: 0,
    highestStreak: 0,
    weeklyProgress: [0, 0, 0, 0, 0, 0, 0],
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [dailyBreakGoal, setDailyBreakGoal] = useState(5);

  useEffect(() => {
    const fetchStats = () => {
      try {
        // Helper to get local YYYY-MM-DD string
        const getLocalDateString = (date: Date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };

        const today = getLocalDateString(new Date());

        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterdayStr = getLocalDateString(yesterdayDate);

        // Fetch today's stats
        const dailyStats = LocalStorage.getDailyUsage(today);
        const todayBreaks = LocalStorage.getBreaks(today);

        // Fetch yesterday's stats
        const yesterdayStats = LocalStorage.getDailyUsage(yesterdayStr);
        const yesterdayBreaks = LocalStorage.getBreaks(yesterdayStr);

        // Fetch streak
        const streak = LocalStorage.getStreak();

        // Fetch settings
        const settings = LocalStorage.getSettings();
        setDailyBreakGoal(settings.dailyBreakGoal || 5);

        // Fetch weekly progress (last 7 days including today)
        const weeklyProgress = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = getLocalDateString(date);
          const dayStats = LocalStorage.getDailyUsage(dateStr);
          weeklyProgress.push(dayStats ? Math.round(dayStats.totalTime / 60) : 0);
        }

        setStats({
          totalTimeToday: dailyStats?.totalTime || 0,
          appsUsedToday: dailyStats ? Object.keys(dailyStats.apps).length : 0,
          breaksToday: todayBreaks.length,
          totalTimeYesterday: yesterdayStats?.totalTime || 0,
          appsUsedYesterday: yesterdayStats ? Object.keys(yesterdayStats.apps).length : 0,
          breaksYesterday: yesterdayBreaks.length,
          streak: streak,
          highestStreak: streak, // Simplified for now
          weeklyProgress: weeklyProgress,
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

    // Poll for updates (since we don't have realtime subscription anymore)
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [toast]);

  return { stats, loading, dailyBreakGoal };
};
