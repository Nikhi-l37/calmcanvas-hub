import React from 'react';
import { motion } from 'framer-motion';
import { Bell, BellOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface NotificationPermissionProps {
  permission: NotificationPermission;
  onRequestPermission: () => Promise<boolean>;
  onDismiss: () => void;
  isVisible: boolean;
}

export const NotificationPermission: React.FC<NotificationPermissionProps> = ({
  permission,
  onRequestPermission,
  onDismiss,
  isVisible
}) => {
  if (!isVisible || permission === 'granted') {
    return null;
  }

  const handleRequest = async () => {
    await onRequestPermission();
    onDismiss();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4"
    >
      <Card className="p-6 shadow-lg border-primary/20 bg-background/95 backdrop-blur-sm">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Enable Notifications</h3>
              <p className="text-sm text-muted-foreground">Get break reminders</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {permission === 'denied' ? (
          <Alert className="mb-4">
            <BellOff className="w-4 h-4" />
            <AlertTitle>Notifications Blocked</AlertTitle>
            <AlertDescription>
              Please enable notifications in your browser settings to receive break reminders.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              Allow notifications to receive helpful break reminders when your screen time limits are reached.
            </p>
            <div className="flex gap-2">
              <Button onClick={handleRequest} className="flex-1">
                <Bell className="w-4 h-4 mr-2" />
                Enable Notifications
              </Button>
              <Button variant="outline" onClick={onDismiss}>
                Later
              </Button>
            </div>
          </>
        )}
      </Card>
    </motion.div>
  );
};