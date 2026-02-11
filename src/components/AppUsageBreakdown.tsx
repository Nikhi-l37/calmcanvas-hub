import { motion } from 'framer-motion';
import { Clock, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useEffect, useState } from 'react';
import { LocalStorage } from '@/services/storage';
import { getLocalDateString } from '@/lib/utils';

interface AppSession {
  app_name: string;
  duration_seconds: number;
}

export const AppUsageBreakdown = () => {
  const [appSessions, setAppSessions] = useState<AppSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppUsage = () => {
      const todayStr = getLocalDateString();

      const dailyUsage = LocalStorage.getDailyUsage(todayStr);

      if (dailyUsage && dailyUsage.apps) {
        // Convert map to array
        const sessions = Object.entries(dailyUsage.apps).map(([packageName, seconds]) => {
          // Try to find app name from tracked apps
          const trackedApps = LocalStorage.getTrackedApps();
          const app = trackedApps.find(a => a.packageName === packageName);
          return {
            app_name: app ? app.name : packageName,
            duration_seconds: seconds
          };
        });

        const sorted = sessions
          .sort((a, b) => b.duration_seconds - a.duration_seconds)
          .slice(0, 5);

        setAppSessions(sorted);
      } else {
        setAppSessions([]);
      }
      setLoading(false);
    };

    fetchAppUsage();

    // Poll for updates
    const interval = setInterval(fetchAppUsage, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/3" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted rounded" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const totalTime = appSessions.reduce((acc, curr) => acc + curr.duration_seconds, 0);

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (mins < 60) return `${mins}m ${remainingSeconds}s`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}m`;
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-background via-background to-accent/5 border-border/40">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10">
              <Clock className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">App Usage Today</h3>
          </div>
          <span className="text-sm text-muted-foreground">
            {formatDuration(totalTime)} total
          </span>
        </div>

        {appSessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ExternalLink className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No app usage today</p>
            <p className="text-xs mt-1">Launch an app to start tracking</p>
          </div>
        ) : (
          <div className="space-y-3">
            {appSessions.map((session, index) => {
              const percentage = totalTime > 0 ? (session.duration_seconds / totalTime) * 100 : 0;
              return (
                <motion.div
                  key={session.app_name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium truncate flex-1">
                      {session.app_name}
                    </span>
                    <span className="text-muted-foreground ml-2">
                      {formatDuration(session.duration_seconds)}
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
};
