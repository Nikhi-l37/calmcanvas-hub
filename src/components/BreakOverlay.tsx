import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BreakActivity } from '@/types';

interface BreakOverlayProps {
  activity: BreakActivity;
  onComplete: () => void;
  isVisible: boolean;
}

export const BreakOverlay = ({ activity, onComplete, isVisible }: BreakOverlayProps) => {
  const IconComponent = Icons[activity.icon as keyof typeof Icons] as LucideIcon;

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/95 backdrop-blur-md flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center max-w-lg w-full"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="mb-8"
        >
          {IconComponent && (
            <div className="w-24 h-24 mx-auto bg-gradient-accent rounded-full flex items-center justify-center shadow-accent-glow">
              <IconComponent className="w-12 h-12 text-accent-foreground" />
            </div>
          )}
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4"
        >
          Break Time!
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-xl text-muted-foreground mb-8"
        >
          You've done great work! Time for a quick break.
        </motion.p>

        {/* Activity Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <Card className="p-6 bg-gradient-surface border-primary/20 shadow-glow">
            <h3 className="text-2xl font-bold text-primary mb-3">
              {activity.title}
            </h3>
            <p className="text-muted-foreground text-lg leading-relaxed">
              {activity.description}
            </p>
            <div className="mt-4 text-sm text-muted-foreground">
              Suggested time: {activity.duration} minutes
            </div>
          </Card>
        </motion.div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Button
            onClick={onComplete}
            size="lg"
            className="bg-gradient-primary hover:bg-gradient-primary/90 text-primary-foreground shadow-glow text-lg px-8 py-3"
          >
            I'm Ready to Continue
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};