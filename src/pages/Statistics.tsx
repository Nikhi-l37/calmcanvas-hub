import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useStats } from '@/hooks/useStats';
import { Card } from '@/components/ui/card';
import { Loader2, TrendingUp, Calendar, Award } from 'lucide-react';

export const Statistics = () => {
  const { user, loading } = useAuth();
  const { stats, loading: statsLoading } = useStats(user?.id);

  if (loading || statsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const maxWeeklyTime = Math.max(...stats.weeklyProgress, 1);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
          Statistics
        </h1>
        <p className="text-muted-foreground">
          Detailed insights into your screen time patterns
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Weekly Total</h3>
          </div>
          <p className="text-3xl font-bold">
            {Math.round(stats.weeklyProgress.reduce((a, b) => a + b, 0))} min
          </p>
          <p className="text-sm text-muted-foreground mt-2">Last 7 days</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-green-500/10">
              <Calendar className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold">Average Daily</h3>
          </div>
          <p className="text-3xl font-bold">
            {Math.round(stats.weeklyProgress.reduce((a, b) => a + b, 0) / 7)} min
          </p>
          <p className="text-sm text-muted-foreground mt-2">Per day this week</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-orange-500/10">
              <Award className="w-6 h-6 text-orange-500" />
            </div>
            <h3 className="text-lg font-semibold">Current Streak</h3>
          </div>
          <p className="text-3xl font-bold">{stats.streak} days</p>
          <p className="text-sm text-muted-foreground mt-2">Keep it up!</p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-6">Weekly Activity</h3>
        <div className="space-y-4">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
            <div key={day} className="flex items-center gap-4">
              <span className="w-12 text-sm font-medium text-muted-foreground">{day}</span>
              <div className="flex-1 h-8 bg-muted/30 rounded-lg overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(stats.weeklyProgress[index] / maxWeeklyTime) * 100}%` }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-primary to-primary/60"
                />
              </div>
              <span className="w-16 text-sm font-semibold text-right">
                {stats.weeklyProgress[index]} min
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
