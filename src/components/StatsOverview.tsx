import { motion } from 'framer-motion';
import { Clock, Target, Trophy, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { UserStats } from '@/types';

interface StatsOverviewProps {
  stats: UserStats;
}

export const StatsOverview = ({ stats }: StatsOverviewProps) => {
  const statItems = [
    {
      icon: Clock,
      label: 'Today',
      value: `${Math.round(stats.totalTimeToday / 60)}min`,
      color: 'text-primary'
    },
    {
      icon: Target,
      label: 'Apps Used',
      value: stats.appsUsedToday.toString(),
      color: 'text-accent'
    },
    {
      icon: Zap,
      label: 'Breaks',
      value: stats.breaksToday.toString(),
      color: 'text-warning'
    },
    {
      icon: Trophy,
      label: 'Streak',
      value: `${stats.streak} days`,
      color: 'text-success'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {statItems.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="p-4 bg-gradient-surface border-border/50 hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-muted/20 ${item.color}`}>
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">{item.label}</div>
                <div className="font-bold text-lg">{item.value}</div>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};