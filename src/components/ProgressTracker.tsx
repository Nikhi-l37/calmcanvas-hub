import React from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, Minus, Target, Clock, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ProgressTrackerProps {
  totalTimeToday: number;
  breaksToday: number;
  streak: number;
  dailyGoal: number;
  weeklyProgress: number[];
}

export const ProgressTracker = ({ totalTimeToday, breaksToday, streak, dailyGoal, weeklyProgress }: ProgressTrackerProps) => {
  const dailyUsageMinutes = Math.round(totalTimeToday / 60);
  const progressPercentage = Math.min((dailyUsageMinutes / dailyGoal) * 100, 100);
  const isOnTrack = dailyUsageMinutes <= dailyGoal;
  const remainingTime = Math.max(dailyGoal - dailyUsageMinutes, 0);

  // Calculate weekly trend
  const getWeeklyTrend = () => {
    if (!weeklyProgress || weeklyProgress.length < 2) return 'stable';
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
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-border/40 backdrop-blur-sm">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-full ${isOnTrack ? 'bg-green-500/20 text-green-500' : 'bg-orange-500/20 text-orange-500'}`}>
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Daily Goal</h3>
              <p className="text-sm text-muted-foreground">
                {dailyUsageMinutes} of {dailyGoal} min
              </p>
            </div>
          </div>
          <div className={`text-3xl font-bold ${isOnTrack ? 'text-green-500' : 'text-orange-500'}`}>
            {Math.round(progressPercentage)}%
          </div>
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
            {breaksToday > 0 && (
              <div className="flex items-center gap-1 text-green-500">
                <Zap className="w-4 h-4" />
                <span>{breaksToday} breaks taken</span>
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
                {streak} day streak
              </span>
            </div>
          </div>
        </div>

        {/* Weekly Mini Chart */}
        {weeklyProgress && weeklyProgress.length > 0 && (
          <div className="space-y-2">
            <span className="text-sm font-medium text-muted-foreground">Last 7 days</span>
            <div className="flex items-end gap-1.5 h-20">
              {weeklyProgress.slice(-7).map((time, index) => {
                const maxTime = Math.max(...weeklyProgress.slice(-7), 1);
                const height = Math.max((time / maxTime) * 100, 5);
                const isToday = index === weeklyProgress.slice(-7).length - 1;
                return (
                  <motion.div
                    key={index}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: `${height}%`, opacity: 1 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className={`flex-1 rounded-t transition-colors ${
                      isToday ? 'bg-primary' : 'bg-muted/60'
                    } min-h-[6px] relative group`}
                    title={`${Math.round(time)}min`}
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-background border border-border rounded px-1.5 py-0.5 text-xs font-medium whitespace-nowrap">
                      {Math.round(time)}m
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground/60">
              <span>6 days ago</span>
              <span>Today</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};