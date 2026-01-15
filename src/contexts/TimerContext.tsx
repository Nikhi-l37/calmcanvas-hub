import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { breakActivities } from '@/data/breakActivities';
import { App, BreakActivity } from '@/types';
import { LocalStorage } from '@/services/storage';

interface ActiveTimer {
  appId: string;
  appName: string;
  sessionId: string;
  startTime: Date;
  totalDuration: number;
  timeRemaining: number;
  isRunning: boolean;
}

interface TimerContextType {
  activeTimers: Map<string, ActiveTimer>;
  showBreak: boolean;
  currentBreakActivity: BreakActivity | null;
  startTimer: (app: App) => void;
  pauseTimer: (appId: string) => void;
  resumeTimer: (appId: string) => void;
  stopTimer: (appId: string) => void;
  completeBreak: () => void;
  getTimerForApp: (appId: string) => ActiveTimer | undefined;
  triggerNativeBreak: (appId: string) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider = ({ children }: { children: ReactNode }) => {
  const { sendNotification } = useNotifications();

  const [activeTimers, setActiveTimers] = useState<Map<string, ActiveTimer>>(new Map());
  const [showBreak, setShowBreak] = useState(false);
  const [currentBreakActivity, setCurrentBreakActivity] = useState<BreakActivity | null>(null);

  const triggerBreakTime = useCallback((appId: string, sessionId: string) => {
    const randomActivity = breakActivities[Math.floor(Math.random() * breakActivities.length)];
    setCurrentBreakActivity(randomActivity);
    setShowBreak(true);

    // Log session end locally if needed
    console.log(`Session ${sessionId} ended for app ${appId}`);

    sendNotification('Break Time!', {
      body: `Time's up! Take a quick break.`,
      tag: 'break-time'
    });

    // Remove timer from active timers
    setActiveTimers(prev => {
      const newMap = new Map(prev);
      newMap.delete(appId);
      return newMap;
    });
  }, [sendNotification]);

  const triggerNativeBreak = useCallback((appId: string) => {
    setActiveTimers(prev => {
      const timer = prev.get(appId);
      if (!timer) return prev;

      triggerBreakTime(appId, timer.sessionId);
      return prev;
    });
  }, [triggerBreakTime]);


  // Timer countdown logic for all active timers
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTimers(prev => {
        const newMap = new Map(prev);
        let hasChanges = false;

        newMap.forEach((timer, appId) => {
          if (timer.isRunning && timer.timeRemaining > 0) {
            hasChanges = true;
            const newTimeRemaining = timer.timeRemaining - 1;

            if (newTimeRemaining <= 0) {
              // Timer finished
              triggerBreakTime(appId, timer.sessionId);
              newMap.delete(appId);
            } else {
              newMap.set(appId, {
                ...timer,
                timeRemaining: newTimeRemaining
              });
            }
          }
        });

        return hasChanges ? newMap : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [triggerBreakTime]);

  const startTimer = useCallback(async (app: App) => {
    // Check if timer already exists for this app
    // Ensure app.id is treated as string
    const appIdStr = app.id.toString();

    if (activeTimers.has(appIdStr)) {
      return; // Don't start duplicate timer
    }

    const sessionId = Date.now().toString(); // Simple local session ID

    const newTimer: ActiveTimer = {
      appId: appIdStr,
      appName: app.name,
      sessionId,
      startTime: new Date(),
      totalDuration: app.timeLimit * 60,
      timeRemaining: app.timeLimit * 60,
      isRunning: true
    };

    setActiveTimers(prev => new Map(prev).set(appIdStr, newTimer));
  }, [activeTimers]);

  const pauseTimer = useCallback((appId: string) => {
    setActiveTimers(prev => {
      const timer = prev.get(appId);
      if (!timer) return prev;

      const newMap = new Map(prev);
      newMap.set(appId, { ...timer, isRunning: false });
      return newMap;
    });
  }, []);

  const resumeTimer = useCallback((appId: string) => {
    setActiveTimers(prev => {
      const timer = prev.get(appId);
      if (!timer) return prev;

      const newMap = new Map(prev);
      newMap.set(appId, { ...timer, isRunning: true });
      return newMap;
    });
  }, []);

  const stopTimer = useCallback((appId: string) => {
    const timer = activeTimers.get(appId);
    if (!timer) return;

    // Log session end locally
    console.log(`Session ${timer.sessionId} stopped manually`);

    setActiveTimers(prev => {
      const newMap = new Map(prev);
      newMap.delete(appId);
      return newMap;
    });
  }, [activeTimers]);

  const completeBreak = useCallback(async () => {
    setShowBreak(false);

    if (currentBreakActivity) {
      // Save break to local storage
      const breakItem = {
        id: Date.now().toString(),
        duration_seconds: currentBreakActivity.duration * 60,
        activity_type: currentBreakActivity.type,
        break_time: new Date().toISOString()
      };
      LocalStorage.saveBreak(breakItem);
    }

    setCurrentBreakActivity(null);
  }, [currentBreakActivity]);

  const getTimerForApp = useCallback((appId: string) => {
    return activeTimers.get(appId);
  }, [activeTimers]);

  return (
    <TimerContext.Provider
      value={{
        activeTimers,
        showBreak,
        currentBreakActivity,
        startTimer,
        pauseTimer,
        resumeTimer,
        stopTimer,
        completeBreak,
        getTimerForApp,
        triggerNativeBreak,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};