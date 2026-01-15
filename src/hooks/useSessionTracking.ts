import { useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { LocalStorage } from '@/services/storage';

interface ActiveSession {
  id: string;
  appId: string;
  appName: string;
  startTime: Date;
}

export const useSessionTracking = (userId: string | undefined) => {
  // We don't use userId anymore but keep the signature for compatibility
  const currentSessionRef = useRef<ActiveSession | null>(null);
  const { toast } = useToast();

  const startSession = useCallback(async (appId: string, appName: string): Promise<string | null> => {
    const sessionId = Date.now().toString();
    currentSessionRef.current = {
      id: sessionId,
      appId: appId.toString(), // Ensure string
      appName,
      startTime: new Date()
    };
    return sessionId;
  }, []);

  const endSession = useCallback(async (sessionId?: string, forcedDurationSeconds?: number) => {
    const session = currentSessionRef.current;
    if (!session && !sessionId) return;

    // If a specific sessionId is provided but doesn't match current, we can't really do much 
    // without a persistent session store. For now, we assume single active session.
    if (sessionId && session && session.id !== sessionId) return;

    if (session) {
      let durationSeconds: number;

      if (forcedDurationSeconds !== undefined) {
        durationSeconds = forcedDurationSeconds;
      } else {
        const endTime = new Date();
        durationSeconds = Math.round((endTime.getTime() - session.startTime.getTime()) / 1000);
      }

      if (durationSeconds > 0) {
        const today = new Date().toISOString().split('T')[0];
        const dailyUsage = LocalStorage.getDailyUsage(today) || {
          date: today,
          totalTime: 0,
          apps: {}
        };

        dailyUsage.totalTime += durationSeconds;
        dailyUsage.apps[session.appName] = (dailyUsage.apps[session.appName] || 0) + durationSeconds;

        LocalStorage.saveDailyUsage(dailyUsage);
      }

      currentSessionRef.current = null;
    }
  }, []);

  const recordBreak = useCallback(async (durationSeconds: number, activityType?: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const breakItem = {
        id: Date.now().toString(),
        duration_seconds: durationSeconds,
        activity_type: activityType || 'break',
        break_time: new Date().toISOString()
      };

      LocalStorage.saveBreak(breakItem);

      toast({
        title: 'Break Recorded',
        description: `${Math.round(durationSeconds / 60)} minute break completed!`,
      });
    } catch (error) {
      console.error('Error recording break:', error);
    }
  }, [toast]);

  return {
    startSession,
    endSession,
    recordBreak,
  };
};