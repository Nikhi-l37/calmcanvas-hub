import { motion } from 'framer-motion';
import { Clock, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface AppSession {
  app_name: string;
  app_id: number;
  duration_seconds: number;
}

export const AppUsageBreakdown = () => {
  const { user } = useAuth();
  const [appSessions, setAppSessions] = useState<AppSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const fetchAppUsage = async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data } = await supabase
        .from('app_sessions')
        .select('app_name, app_id, duration_seconds')
        .eq('user_id', user.id)
        .gte('start_time', `${today}T00:00:00`)
        .lt('start_time', `${today}T23:59:59`)
        .not('duration_seconds', 'is', null);

      if (data) {
        // Aggregate by app_name
        const aggregated = data.reduce((acc: Record<string, AppSession>, curr) => {
          if (!acc[curr.app_name]) {
            acc[curr.app_name] = {
              app_name: curr.app_name,
              app_id: curr.app_id,
              duration_seconds: 0,
            };
          }
          acc[curr.app_name].duration_seconds += curr.duration_seconds || 0;
          return acc;
        }, {});

        const sorted = Object.values(aggregated)
          .sort((a, b) => b.duration_seconds - a.duration_seconds)
          .slice(0, 5);
        
        setAppSessions(sorted);
      }
      setLoading(false);
    };

    fetchAppUsage();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('app-usage-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'app_sessions',
          filter: `user_id=eq.${user.id}`,
        },
        () => fetchAppUsage()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

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
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m`;
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
