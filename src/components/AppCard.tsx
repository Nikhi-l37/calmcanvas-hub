import { motion } from 'framer-motion';
import { LucideIcon, Trash2 } from 'lucide-react';
import * as Icons from 'lucide-react';
import { App } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface AppCardProps {
  app: App;
  onLaunch: (app: App) => void;
  onDelete?: (id: number) => void;
  className?: string;
}

export const AppCard = ({ app, onLaunch, onDelete, className }: AppCardProps) => {
  const IconComponent = Icons[app.icon as keyof typeof Icons] as LucideIcon;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && app.id > 100) {
      onDelete(app.id);
    }
  };

  return (
    <motion.div
      whileHover={{ 
        scale: 1.05,
        y: -8,
        boxShadow: 'var(--shadow-glow)'
      }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-2xl aspect-square",
        "bg-gradient-surface border border-border/50",
        "transition-all duration-300 hover:border-primary/50",
        app.color,
        className
      )}
      onClick={() => onLaunch(app)}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Delete button - only for custom apps */}
      {onDelete && app.id > 100 && (
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
      {app.isActive && (
        <div className="absolute top-2 right-2 w-3 h-3 bg-success rounded-full animate-pulse" />
      )}
    </motion.div>
  );
};