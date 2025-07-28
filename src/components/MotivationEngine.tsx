import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Target, Flame, TrendingDown, LineChart, Eye, User, Droplets, Activity, Calendar, Coffee, Scale } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MotivationalMessage } from '@/data/motivationalContent';

interface MotivationEngineProps {
  message: MotivationalMessage | null;
  onDismiss: () => void;
  isVisible: boolean;
}

const iconMap = {
  Trophy, Target, Flame, TrendingDown, LineChart, Eye, User, Droplets, Activity, Calendar, Coffee, Scale
};

export const MotivationEngine = ({ message, onDismiss, isVisible }: MotivationEngineProps) => {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (isVisible && message) {
      setShouldShow(true);
    }
  }, [isVisible, message]);

  const handleDismiss = () => {
    setShouldShow(false);
    setTimeout(onDismiss, 300);
  };

  if (!message) return null;

  const IconComponent = iconMap[message.icon as keyof typeof iconMap] || Trophy;
  
  const getBadgeVariant = (category: string) => {
    switch (category) {
      case 'achievement': return 'default';
      case 'encouragement': return 'secondary';
      case 'tip': return 'outline';
      case 'guidance': return 'destructive';
      default: return 'default';
    }
  };

  const getCardStyle = (type: string) => {
    switch (type) {
      case 'goal_achieved':
      case 'milestone':
        return 'bg-gradient-accent border-accent/50';
      case 'streak':
        return 'bg-gradient-warm border-warning/50';
      case 'improvement':
        return 'bg-gradient-cool border-primary/50';
      case 'daily_tip':
        return 'bg-gradient-surface border-muted/50';
      default:
        return 'bg-gradient-surface border-border/50';
    }
  };

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <Card className={`p-8 max-w-md w-full relative ${getCardStyle(message.type)} shadow-lg`}>
              <Button
                onClick={handleDismiss}
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>

              <div className="text-center space-y-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center"
                >
                  <IconComponent className="w-8 h-8 text-primary" />
                </motion.div>

                <div className="space-y-3">
                  <Badge variant={getBadgeVariant(message.category)} className="mb-2">
                    {message.category.charAt(0).toUpperCase() + message.category.slice(1)}
                  </Badge>
                  
                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl font-bold text-foreground"
                  >
                    {message.title}
                  </motion.h3>
                  
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-muted-foreground leading-relaxed"
                  >
                    {message.message}
                  </motion.p>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button
                    onClick={handleDismiss}
                    className="w-full bg-primary hover:bg-primary/90"
                    size="lg"
                  >
                    Continue
                  </Button>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};