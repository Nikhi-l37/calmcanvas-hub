
import { LucideIcon, Trash2, Play, Pause, Square } from 'lucide-react';
import * as Icons from 'lucide-react';
import { App } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useTimer } from '@/contexts/TimerContext';

interface AppCardProps {
  app: App;
  onLaunch: (app: App) => void;
  onDelete?: (id: number) => void;
  className?: string;
}

export const AppCard = ({ app, onLaunch, onDelete, className }: AppCardProps) => {
  const IconComponent = Icons[app.icon as keyof typeof Icons] as LucideIcon;
  const { getTimerForApp, pauseTimer, resumeTimer, stopTimer } = useTimer();
  const activeTimer = getTimerForApp(app.id);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && app.id > 100) {
      onDelete(app.id);
    }
  };

  const handlePause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeTimer) {
      pauseTimer(app.id);
    }
  };

  const handleResume = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeTimer) {
      resumeTimer(app.id);
    }
  };

  const handleStop = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeTimer) {
      stopTimer(app.id);
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
        "group relative cursor-pointer overflow-hidden rounded-2xl aspect-square",
        "bg-gradient-surface border border-border/50",
        "transition-all duration-200 hover:border-primary/50 hover:shadow-lg",
        app.color,
        className
      )}
      onClick={() => onLaunch(app)}
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

      {/* Delete button - only for custom apps */}
      {onDelete && app.id > 100 && !activeTimer && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-destructive/80 hover:bg-destructive text-destructive-foreground"
          onClick={handleDelete}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      )}
      
      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center p-6 text-white">
        {IconComponent && (
          <IconComponent className="w-12 h-12 md:w-16 md:h-16 mb-3 drop-shadow-lg" />
        )}
        <h3 className="font-semibold text-sm md:text-base text-center leading-tight">
          {app.name}
        </h3>
        <div className="mt-2 text-xs opacity-80">
          {app.timeLimit}min
        </div>
      </div>

      {/* Status indicator */}
      {activeTimer && (
        <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full animate-pulse z-30" />
      )}
    </div>
  );
};