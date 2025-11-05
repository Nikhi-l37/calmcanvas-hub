import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSessionTracking } from '@/hooks/useSessionTracking';
import { useNotifications } from '@/hooks/useNotifications';
import { breakActivities } from '@/data/breakActivities';
import { App, TimerSession, BreakActivity } from '@/types';

interface ActiveTimer {
  appId: number;
  appName: string;
  sessionId: string;
  startTime: Date;
  totalDuration: number;
  timeRemaining: number;
  isRunning: boolean;
}

interface TimerContextType {
  activeTimers: Map<number, ActiveTimer>;
  showBreak: boolean;
  currentBreakActivity: BreakActivity | null;
  startTimer: (app: App) => void;
  pauseTimer: (appId: number) => void;
  resumeTimer: (appId: number) => void;
  stopTimer: (appId: number) => void;
  completeBreak: () => void;
  getTimerForApp: (appId: number) => ActiveTimer | undefined;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { startSession, endSession, recordBreak } = useSessionTracking(user?.id);
  const { sendNotification } = useNotifications();
  
  const [activeTimers, setActiveTimers] = useState<Map<number, ActiveTimer>>(new Map());
  const [showBreak, setShowBreak] = useState(false);
  const [currentBreakActivity, setCurrentBreakActivity] = useState<BreakActivity | null>(null);

  const triggerBreakTime = useCallback((appId: number, sessionId: string) => {
    const randomActivity = breakActivities[Math.floor(Math.random() * breakActivities.length)];
    setCurrentBreakActivity(randomActivity);
    setShowBreak(true);
    endSession(sessionId);

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
  }, [sendNotification, endSession]);

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
    if (activeTimers.has(app.id)) {
      return; // Don't start duplicate timer
    }

    const sessionId = await startSession(app.id, app.name);
    if (!sessionId) return;

    const newTimer: ActiveTimer = {
      appId: app.id,
      appName: app.name,
      sessionId,
      startTime: new Date(),
      totalDuration: app.timeLimit * 60,
      timeRemaining: app.timeLimit * 60,
      isRunning: true
    };

    setActiveTimers(prev => new Map(prev).set(app.id, newTimer));
  }, [startSession, activeTimers]);

  const pauseTimer = useCallback((appId: number) => {
    setActiveTimers(prev => {
      const timer = prev.get(appId);
      if (!timer) return prev;
      
      const newMap = new Map(prev);
      newMap.set(appId, { ...timer, isRunning: false });
      return newMap;
    });
  }, []);

  const resumeTimer = useCallback((appId: number) => {
    setActiveTimers(prev => {
      const timer = prev.get(appId);
      if (!timer) return prev;
      
      const newMap = new Map(prev);
      newMap.set(appId, { ...timer, isRunning: true });
      return newMap;
    });
  }, []);

  const stopTimer = useCallback((appId: number) => {
    const timer = activeTimers.get(appId);
    if (!timer) return;

    endSession(timer.sessionId);
    
    setActiveTimers(prev => {
      const newMap = new Map(prev);
      newMap.delete(appId);
      return newMap;
    });
  }, [activeTimers, endSession]);

  const completeBreak = useCallback(async () => {
    setShowBreak(false);
    
    if (currentBreakActivity) {
      await recordBreak(currentBreakActivity.duration * 60, currentBreakActivity.type);
    }
    
    setCurrentBreakActivity(null);
  }, [currentBreakActivity, recordBreak]);

  const getTimerForApp = useCallback((appId: number) => {
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
