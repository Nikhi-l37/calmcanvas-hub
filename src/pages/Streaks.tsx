import { motion } from 'framer-motion';
import { Flame, Trophy, TrendingUp, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useStats } from '@/hooks/useStats';
import { StreakCalendar } from '@/components/StreakCalendar';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const Streaks = () => {
  const { user, loading } = useAuth();
  const { stats } = useStats(user?.id);
  const [highestStreak, setHighestStreak] = useState(0);
  const [loadingStreak, setLoadingStreak] = useState(true);

  useEffect(() => {
    const fetchHighestStreak = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('user_streaks')
          .select('highest_streak, current_streak')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;
        
        if (data) {
          setHighestStreak(data.highest_streak || 0);
        }
      } catch (error) {
        console.error('Error fetching highest streak:', error);
      } finally {
        setLoadingStreak(false);
      }
    };

    fetchHighestStreak();

    // Set up realtime subscription
    const channel = supabase
      .channel('streak-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_streaks',
          filter: `user_id=eq.${user?.id}`,
        },
        () => fetchHighestStreak()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  if (loading || loadingStreak) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const streakStats = [
    {
      icon: Flame,
      label: 'Current Streak',
      value: stats.streak,
      subtext: 'days',
      gradient: 'from-orange-500/20 to-red-500/20',
      iconColor: 'text-orange-500',
      description: 'Your active streak'
    },
    {
      icon: Trophy,
      label: 'Highest Streak',
      value: highestStreak,
      subtext: 'days',
      gradient: 'from-yellow-500/20 to-amber-500/20',
      iconColor: 'text-yellow-500',
      description: 'Personal best'
    },
    {
      icon: TrendingUp,
      label: 'This Month',
      value: stats.weeklyProgress.filter(m => m > 0).length,
      subtext: 'active days',
      gradient: 'from-green-500/20 to-emerald-500/20',
      iconColor: 'text-green-500',
      description: 'Last 7 days'
    }
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
          Streak Tracking
        </h1>
        <p className="text-muted-foreground">
          Track your consistency and build lasting habits
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {streakStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`p-6 bg-gradient-to-br ${stat.gradient} border-border/40 backdrop-blur-sm relative overflow-hidden group hover:border-primary/30 transition-all duration-200`}>
              <div className="absolute inset-0 bg-gradient-to-br from-background/80 to-background/60 -z-10" />
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className={`p-3 rounded-full bg-background/50 ${stat.iconColor} w-fit`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
                    <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                    <div className="text-xs text-muted-foreground/60">{stat.description}</div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {user?.id && <StreakCalendar userId={user.id} />}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="text-lg font-semibold">How Streaks Work</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Use any app for at least 1 minute each day to maintain your streak</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Missing a day will reset your current streak, but your highest streak is saved forever</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Completed days show in green on the calendar - build your consistency!</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Today's date is highlighted - complete your activity to keep the streak alive</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
