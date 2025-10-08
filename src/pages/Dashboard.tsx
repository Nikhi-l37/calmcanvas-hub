import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useStats } from '@/hooks/useStats';
import { StatsOverview } from '@/components/StatsOverview';
import { DailyComparison } from '@/components/DailyComparison';
import { ProgressTracker } from '@/components/ProgressTracker';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Loader2 } from 'lucide-react';

export const Dashboard = () => {
  const { user, loading } = useAuth();
  const { stats, loading: statsLoading } = useStats(user?.id);
  const [goals] = useLocalStorage('screenTimeGoals', {
    dailyLimit: 90,
    weeklyTarget: 15,
    breakFrequency: 25
  });

  if (loading || statsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Overview of your screen time and progress
        </p>
      </motion.div>

      <StatsOverview 
        totalTimeToday={stats.totalTimeToday}
        appsUsedToday={stats.appsUsedToday}
        breaksToday={stats.breaksToday}
        streak={stats.streak}
      />

      <DailyComparison 
        totalTimeToday={stats.totalTimeToday}
        totalTimeYesterday={stats.totalTimeYesterday}
      />

      <ProgressTracker 
        totalTimeToday={stats.totalTimeToday}
        breaksToday={stats.breaksToday}
        streak={stats.streak}
        dailyGoal={goals.dailyLimit}
        weeklyProgress={stats.weeklyProgress}
      />
    </div>
  );
};
