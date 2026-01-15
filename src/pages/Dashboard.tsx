import { motion } from 'framer-motion';
import { useStats } from '@/hooks/useStats';
import { Card } from "@/components/ui/card";
import { AppUsageBreakdown } from "@/components/AppUsageBreakdown";
import { Loader2 } from "lucide-react";

export const Dashboard = () => {
  const { stats, loading } = useStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Track your digital wellbeing and stay focused.
        </p>

      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6 space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Total Screen Time</h3>
          <div className="text-2xl font-bold">
            {Math.floor(stats.totalTimeToday / 3600)}h {Math.floor((stats.totalTimeToday % 3600) / 60)}m
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.totalTimeToday > stats.totalTimeYesterday ? '+' : ''}
            {Math.round(((stats.totalTimeToday - stats.totalTimeYesterday) / (stats.totalTimeYesterday || 1)) * 100)}% from yesterday
          </p>
        </Card>

        <Card className="p-6 space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Apps Used</h3>
          <div className="text-2xl font-bold">{stats.appsUsedToday}</div>
          <p className="text-xs text-muted-foreground">
            {stats.appsUsedToday - stats.appsUsedYesterday} from yesterday
          </p>
        </Card>

        <Card className="p-6 space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Current Streak</h3>
          <div className="text-2xl font-bold">{stats.streak} days</div>
          <p className="text-xs text-muted-foreground">
            Best: {stats.highestStreak} days
          </p>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <AppUsageBreakdown />
      </div>
    </div>
  );
};
