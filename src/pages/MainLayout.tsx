import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { InstallPWAButton } from '@/components/InstallPWAButton';
import { NotificationPermission } from '@/components/NotificationPermission';
import { MotivationEngine } from '@/components/MotivationEngine';
import { TimerDisplay } from '@/components/TimerDisplay';
import { BreakOverlay } from '@/components/BreakOverlay';
import { useAuth } from '@/hooks/useAuth';
import { useTimer } from '@/contexts/TimerContext';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Loader2 } from 'lucide-react';

export const MainLayout = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [apps] = useLocalStorage('screenCoachApps', []);
  const {
    currentTimer,
    timeRemaining,
    isTimerRunning,
    showBreak,
    currentBreakActivity,
    pauseTimer,
    resumeTimer,
    stopTimer,
    completeBreak,
  } = useTimer();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Exit notification
  useEffect(() => {
    let exitNotificationSent = false;

    const sendExitNotification = async () => {
      if (user?.email && !exitNotificationSent) {
        exitNotificationSent = true;
        
        try {
          await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-exit-notification`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: user.email,
                timestamp: new Date().toISOString(),
              }),
              keepalive: true,
            }
          );
        } catch (error) {
          console.error('Failed to send exit notification:', error);
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        sendExitNotification();
      }
    };

    const handleBeforeUnload = () => {
      sendExitNotification();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border flex items-center px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
            <SidebarTrigger />
          </header>

          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-7xl mx-auto space-y-6">
              {currentTimer && (
                <TimerDisplay
                  appName={apps.find((a: any) => a.id === currentTimer.appId)?.name || ''}
                  timeRemaining={timeRemaining}
                  totalTime={currentTimer.duration}
                  isRunning={isTimerRunning}
                  onPause={pauseTimer}
                  onResume={resumeTimer}
                  onStop={stopTimer}
                />
              )}
              
              <Outlet />
            </div>
          </main>
        </div>

        <InstallPWAButton />
        
        <BreakOverlay
          activity={currentBreakActivity}
          onComplete={completeBreak}
          isVisible={showBreak}
        />
      </div>
    </SidebarProvider>
  );
};
