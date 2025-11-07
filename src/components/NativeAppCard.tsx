import { Play, Pause, Square } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useTimer } from '@/contexts/TimerContext';

interface NativeAppCardProps {
  appId: number;
  appName: string;
  packageName: string;
  timeLimit: number;
  className?: string;
}

export const NativeAppCard = ({ appId, appName, packageName, timeLimit, className }: NativeAppCardProps) => {
  const { getTimerForApp, pauseTimer, resumeTimer, stopTimer } = useTimer();
  const activeTimer = getTimerForApp(appId);

  const handlePause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeTimer) {
      pauseTimer(appId);
    }
  };

  const handleResume = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeTimer) {
      resumeTimer(appId);
    }
  };

  const handleStop = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeTimer) {
      stopTimer(appId);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl aspect-square",
        "bg-gradient-surface border border-border/50",
        "transition-all duration-200 hover:border-primary/50 hover:shadow-lg",
        className
      )}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      
      {/* Timer controls overlay */}
      {activeTimer && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-2 z-20">
          <div className="text-white text-2xl font-bold mb-2">
            {formatTime(activeTimer.timeRemaining)}
          </div>
          <div className="flex gap-2">
            {activeTimer.isRunning ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={handlePause}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <Pause className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleResume}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <Play className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={handleStop}
              className="bg-red-500/80 hover:bg-red-600/80 text-white"
            >
              <Square className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
      
      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center text-3xl font-bold text-white mb-3 shadow-lg">
          {appName.charAt(0).toUpperCase()}
        </div>
        <h3 className="font-semibold text-sm md:text-base text-center leading-tight text-foreground">
          {appName}
        </h3>
        <p className="text-xs text-muted-foreground mt-1 text-center truncate w-full px-2">
          {packageName}
        </p>
        <div className="mt-2 text-xs text-muted-foreground">
          {timeLimit}min limit
        </div>
      </div>

      {/* Status indicator */}
      {activeTimer && (
        <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full animate-pulse z-30" />
      )}
    </div>
  );
};
