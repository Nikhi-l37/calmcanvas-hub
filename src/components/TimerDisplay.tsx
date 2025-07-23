import { motion } from 'framer-motion';
import { Clock, Pause, Play, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatDuration } from 'date-fns';

interface TimerDisplayProps {
  appName: string;
  timeRemaining: number;
  totalTime: number;
  isRunning: boolean;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

export const TimerDisplay = ({
  appName,
  timeRemaining,
  totalTime,
  isRunning,
  onPause,
  onResume,
  onStop
}: TimerDisplayProps) => {
  const progress = ((totalTime - timeRemaining) / totalTime) * 100;
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40"
    >
      <Card className="bg-card/95 backdrop-blur-md border-primary/20 shadow-glow p-4 min-w-[320px]">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
              <Clock className="w-6 h-6 text-primary-foreground" />
            </div>
            {/* Progress ring */}
            <svg className="absolute inset-0 w-12 h-12 transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="text-muted opacity-25"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 20}`}
                strokeDashoffset={`${2 * Math.PI * 20 * (1 - progress / 100)}`}
                className="text-primary transition-all duration-1000"
              />
            </svg>
          </div>
          
          <div className="flex-1">
            <div className="text-sm text-muted-foreground">Currently timing</div>
            <div className="font-semibold text-foreground">{appName}</div>
            <div className="text-lg font-mono text-primary">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={isRunning ? onPause : onResume}
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={onStop}
            >
              <Square className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};