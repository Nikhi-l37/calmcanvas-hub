import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { InstallPWAButton } from '@/components/InstallPWAButton';
import { BreakOverlay } from '@/components/BreakOverlay';
import { useTimer } from '@/contexts/TimerContext';
import { useNativeAppTracking } from '@/hooks/useNativeAppTracking';

export const MainLayout = () => {
  const {
    showBreak,
    currentBreakActivity,
    completeBreak,
  } = useTimer();

  // Enable background tracking for native apps
  useNativeAppTracking();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />

        <div className="flex-1 flex flex-col">
          <header className="border-b border-border flex items-center px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 pt-[env(safe-area-inset-top)] h-[calc(4rem+env(safe-area-inset-top))]">
            <SidebarTrigger />
          </header>

          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-7xl mx-auto space-y-6">
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
