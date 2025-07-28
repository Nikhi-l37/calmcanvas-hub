import React from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, Minus, Target, Clock, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { UserStats } from '@/types';

interface ProgressTrackerProps {
  stats: UserStats;
  dailyGoal: number; // in minutes
  weeklyProgress?: number[];
}

export const ProgressTracker = ({ stats, dailyGoal, weeklyProgress = [] }: ProgressTrackerProps) => {
  const dailyUsageMinutes = Math.round(stats.totalTimeToday / 60);
  const progressPercentage = Math.min((dailyUsageMinutes / dailyGoal) * 100, 100);
  const isOnTrack = dailyUsageMinutes <= dailyGoal;
  const remainingTime = Math.max(dailyGoal - dailyUsageMinutes, 0);

  // Calculate weekly trend
  const getWeeklyTrend = () => {
    if (weeklyProgress.length < 2) return 'stable';
    const recent = weeklyProgress.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const previous = weeklyProgress.slice(-6, -3).reduce((a, b) => a + b, 0) / 3;
    if (recent < previous * 0.9) return 'improving';
    if (recent > previous * 1.1) return 'increasing';
    return 'stable';
  };

  const weeklyTrend = getWeeklyTrend();

  const getTrendIcon = () => {
    switch (weeklyTrend) {
      case 'improving': return TrendingDown;
      case 'increasing': return TrendingUp;
      default: return Minus;
    }
  };

  const getTrendColor = () => {
    switch (weeklyTrend) {
      case 'improving': return 'text-success';
      case 'increasing': return 'text-warning';
      default: return 'text-muted-foreground';
    }
  };

  const getTrendMessage = () => {
    switch (weeklyTrend) {
      case 'improving': return 'Screen time decreasing';
      case 'increasing': return 'Screen time increasing';
      default: return 'Screen time stable';
    }
  };

  const TrendIcon = getTrendIcon();

  return (
    <Card className="p-6 bg-gradient-surface border-border/50">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Daily Progress</h3>
          <Badge variant={isOnTrack ? "default" : "destructive"}>
            {isOnTrack ? "On Track" : "Over Limit"}
          </Badge>
        </div>

        {/* Daily Progress Bar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Screen time today</span>
            <span className="font-medium">
              {dailyUsageMinutes}min / {dailyGoal}min
            </span>
          </div>
          
          <Progress 
            value={progressPercentage} 
            className="h-3"
          />
          
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{remainingTime}min remaining</span>
            </div>
            {stats.breaksToday > 0 && (
              <div className="flex items-center gap-1 text-success">
                <Zap className="w-4 h-4" />
                <span>{stats.breaksToday} breaks taken</span>
              </div>
            )}
          </div>
        </div>

        {/* Weekly Trend */}
        <div className="pt-4 border-t border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendIcon className={`w-4 h-4 ${getTrendColor()}`} />
              <span className="text-sm font-medium">{getTrendMessage()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                {stats.streak} day streak
              </span>
            </div>
          </div>
        </div>

        {/* Weekly Mini Chart */}
        {weeklyProgress.length > 0 && (
          <div className="space-y-2">
            <span className="text-sm font-medium text-muted-foreground">Last 7 days</span>
            <div className="flex items-end gap-1 h-16">
              {weeklyProgress.slice(-7).map((time, index) => {
                const height = Math.max((time / Math.max(...weeklyProgress.slice(-7))) * 100, 5);
                const isToday = index === weeklyProgress.slice(-7).length - 1;
                return (
                  <motion.div
                    key={index}
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex-1 rounded-t ${
                      isToday ? 'bg-primary' : 'bg-muted'
                    } min-h-[4px]`}
                    title={`${Math.round(time)}min`}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};