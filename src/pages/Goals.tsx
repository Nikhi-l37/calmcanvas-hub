import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useStats } from '@/hooks/useStats';
import { GoalSetting } from '@/components/GoalSetting';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Loader2 } from 'lucide-react';

export const Goals = () => {
  const { user, loading } = useAuth();
  const { stats, loading: statsLoading } = useStats(user?.id);
  const [goals, setGoals] = useLocalStorage('screenTimeGoals', {
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
          Goals & Settings
        </h1>
        <p className="text-muted-foreground">
          Set your daily goals and manage your screen time targets
        </p>
      </motion.div>

      <GoalSetting
        currentGoals={goals}
        onUpdateGoals={setGoals}
        currentUsage={Math.round(stats.totalTimeToday / 60)}
      />
    </div>
  );
};
