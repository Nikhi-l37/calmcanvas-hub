import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface DailyComparisonProps {
  totalTimeToday: number;
  totalTimeYesterday: number;
}

export const DailyComparison = ({ totalTimeToday, totalTimeYesterday }: DailyComparisonProps) => {
  const todayMinutes = Math.round(totalTimeToday / 60);
  const yesterdayMinutes = Math.round(totalTimeYesterday / 60);
  const difference = todayMinutes - yesterdayMinutes;
  const percentageChange = yesterdayMinutes > 0 
    ? Math.round((difference / yesterdayMinutes) * 100) 
    : 0;

  const getTrendIcon = () => {
    if (difference > 0) return TrendingUp;
    if (difference < 0) return TrendingDown;
    return Minus;
  };

  const getTrendColor = () => {
    if (difference > 0) return 'text-destructive';
    if (difference < 0) return 'text-green-500';
    return 'text-muted-foreground';
  };

  const getTrendMessage = () => {
    if (difference > 0) return 'More than yesterday';
    if (difference < 0) return 'Less than yesterday';
    return 'Same as yesterday';
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const TrendIcon = getTrendIcon();

  return (
    <Card className="p-6 bg-gradient-to-br from-background via-background to-muted/20 border-border/40">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">Today vs Yesterday</h3>
          <div className={`flex items-center gap-1 ${getTrendColor()}`}>
            <TrendIcon className="w-4 h-4" />
            {difference !== 0 && (
              <span className="text-xs font-semibold">
                {Math.abs(percentageChange)}%
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-1"
          >
            <p className="text-xs text-muted-foreground">Today</p>
            <p className="text-2xl font-bold">{formatTime(todayMinutes)}</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-1"
          >
            <p className="text-xs text-muted-foreground">Yesterday</p>
            <p className="text-2xl font-bold text-muted-foreground/70">
              {formatTime(yesterdayMinutes)}
            </p>
          </motion.div>
        </div>

        <div className="pt-2 border-t border-border/40">
          <p className={`text-sm font-medium ${getTrendColor()}`}>
            {difference !== 0 && (
              <span className="font-bold">
                {Math.abs(difference)} min {' '}
              </span>
            )}
            {getTrendMessage()}
          </p>
        </div>
      </div>
    </Card>
  );
};
