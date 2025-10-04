import { motion } from 'framer-motion';
import { Clock, Target, Trophy, Flame } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface StatsOverviewProps {
  totalTimeToday: number;
  appsUsedToday: number;
  breaksToday: number;
  streak: number;
}

export const StatsOverview = ({ totalTimeToday, appsUsedToday, breaksToday, streak }: StatsOverviewProps) => {
  const statItems = [
    {
      icon: Clock,
      label: 'Screen Time',
      value: `${Math.round(totalTimeToday / 60)}m`,
      subtext: 'today',
      gradient: 'from-blue-500/20 to-cyan-500/20',
      iconColor: 'text-blue-500',
    },
    {
      icon: Target,
      label: 'Apps',
      value: appsUsedToday.toString(),
      subtext: 'accessed',
      gradient: 'from-purple-500/20 to-pink-500/20',
      iconColor: 'text-purple-500',
    },
    {
      icon: Trophy,
      label: 'Breaks',
      value: breaksToday.toString(),
      subtext: 'taken',
      gradient: 'from-green-500/20 to-emerald-500/20',
      iconColor: 'text-green-500',
    },
    {
      icon: Flame,
      label: 'Streak',
      value: streak.toString(),
      subtext: 'days',
      gradient: 'from-orange-500/20 to-red-500/20',
      iconColor: 'text-orange-500',
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {statItems.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className={`p-4 bg-gradient-to-br ${item.gradient} border-border/40 backdrop-blur-sm relative overflow-hidden group hover:border-primary/30 transition-all duration-300`}>
            <div className="absolute inset-0 bg-gradient-to-br from-background/80 to-background/60 -z-10" />
            <div className="flex flex-col items-center text-center space-y-2">
              <div className={`p-2.5 rounded-full bg-background/50 ${item.iconColor}`}>
                <item.icon className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="text-2xl font-bold tracking-tight">{item.value}</div>
                <div className="text-xs text-muted-foreground font-medium">{item.label}</div>
                <div className="text-[10px] text-muted-foreground/60">{item.subtext}</div>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};