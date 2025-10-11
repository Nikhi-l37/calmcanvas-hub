import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSessionTracking } from '@/hooks/useSessionTracking';
import { useNotifications } from '@/hooks/useNotifications';
import { breakActivities } from '@/data/breakActivities';
import { App, TimerSession, BreakActivity } from '@/types';

interface TimerContextType {
  currentTimer: TimerSession | null;
  timeRemaining: number;
  isTimerRunning: boolean;
  showBreak: boolean;
  currentBreakActivity: BreakActivity | null;
  startTimer: (app: App) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  completeBreak: () => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { startSession, endSession, recordBreak } = useSessionTracking(user?.id);
  const { sendNotification } = useNotifications();
  
  const [currentTimer, setCurrentTimer] = useState<TimerSession | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showBreak, setShowBreak] = useState(false);
  const [currentBreakActivity, setCurrentBreakActivity] = useState<BreakActivity | null>(null);

  const triggerBreakTime = useCallback(() => {
    const randomActivity = breakActivities[Math.floor(Math.random() * breakActivities.length)];
    setCurrentBreakActivity(randomActivity);
    setShowBreak(true);
    endSession();

    sendNotification('Break Time!', {
      body: `Time's up! Take a quick break.`,
      tag: 'break-time'
    });
  }, [sendNotification, endSession]);

  // Timer countdown logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            triggerBreakTime();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isTimerRunning, timeRemaining, triggerBreakTime]);

  const startTimer = useCallback((app: App) => {
    const session: TimerSession = {
      appId: app.id,
      startTime: new Date(),
      duration: app.timeLimit * 60,
      completed: false
    };

    setCurrentTimer(session);
    setTimeRemaining(session.duration);
    setIsTimerRunning(true);
    startSession(app.id, app.name);
  }, [startSession]);

  const pauseTimer = useCallback(() => {
    setIsTimerRunning(false);
  }, []);

  const resumeTimer = useCallback(() => {
    setIsTimerRunning(true);
  }, []);

  const stopTimer = useCallback(() => {
    setIsTimerRunning(false);
    endSession();
    setCurrentTimer(null);
    setTimeRemaining(0);
  }, [endSession]);

  const completeBreak = useCallback(async () => {
    setShowBreak(false);
    
    if (currentBreakActivity) {
      await recordBreak(currentBreakActivity.duration * 60, currentBreakActivity.type);
    }
    
    setCurrentBreakActivity(null);
    setCurrentTimer(null);
    setTimeRemaining(0);
  }, [currentBreakActivity, recordBreak]);

  return (
    <TimerContext.Provider
      value={{
        currentTimer,
        timeRemaining,
        isTimerRunning,
        showBreak,
        currentBreakActivity,
        startTimer,
        pauseTimer,
        resumeTimer,
        stopTimer,
        completeBreak,
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
