import { motion } from 'framer-motion';
import { Coffee, Activity, Brain, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Break {
  id: string;
  duration_seconds: number;
  activity_type: string | null;
  break_time: string;
}

const activityIcons: Record<string, any> = {
  physical: Activity,
  mental: Brain,
  social: Users,
  creative: Coffee,
};

export const BreakHistory = () => {
  const { user } = useAuth();
  const [breaks, setBreaks] = useState<Break[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const fetchBreaks = async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data } = await supabase
        .from('breaks')
        .select('*')
        .eq('user_id', user.id)
        .gte('break_time', `${today}T00:00:00`)
        .order('break_time', { ascending: false })
        .limit(5);

      if (data) {
        setBreaks(data);
      }
      setLoading(false);
    };

    fetchBreaks();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('breaks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'breaks',
          filter: `user_id=eq.${user.id}`,
        },
        () => fetchBreaks()
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
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted rounded" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-background via-background to-green-500/5 border-border/40">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-green-500/10">
            <Coffee className="w-4 h-4 text-green-500" />
          </div>
          <h3 className="text-lg font-semibold">Recent Breaks</h3>
        </div>

        {breaks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Coffee className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No breaks today</p>
            <p className="text-xs mt-1">Complete a session to take breaks</p>
          </div>
        ) : (
          <div className="space-y-2">
            {breaks.map((breakItem, index) => {
              const Icon = breakItem.activity_type 
                ? activityIcons[breakItem.activity_type] || Coffee
                : Coffee;
              
              return (
                <motion.div
                  key={breakItem.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="p-2 rounded-full bg-green-500/10">
                    <Icon className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium capitalize">
                      {breakItem.activity_type || 'Break'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTime(breakItem.break_time)}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {formatDuration(breakItem.duration_seconds)}
                  </span>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
};
