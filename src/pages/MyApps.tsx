import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useStats } from '@/hooks/useStats';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useNotifications } from '@/hooks/useNotifications';
import { AppCard } from '@/components/AppCard';
import { PasswordConfirmDialog } from '@/components/PasswordConfirmDialog';
import { AddAppDialog } from '@/components/AddAppDialog';
import { defaultApps } from '@/data/defaultApps';
import { useTimer } from '@/contexts/TimerContext';
import { App } from '@/types';

export const MyApps = () => {
  const { user, loading } = useAuth();
  const { stats } = useStats(user?.id);
  const [apps, setApps] = useLocalStorage<App[]>('screenCoachApps', defaultApps);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [appToDelete, setAppToDelete] = useState<number | null>(null);

  const { toast } = useToast();
  const { requestPermission, canSend, permission } = useNotifications();
  const { startTimer } = useTimer();

  const launchApp = useCallback(async (app: App) => {
    if (!canSend && permission === 'default') {
      await requestPermission();
    }

    window.open(app.url, '_blank');
    startTimer(app);

    setApps(prev => prev.map(a => ({
      ...a,
      isActive: a.id === app.id,
      lastUsed: a.id === app.id ? new Date() : a.lastUsed
    })));

    toast({
      title: `Launched ${app.name}`,
      description: `Timer set for ${app.timeLimit} minutes. Enjoy!`
    });
  }, [canSend, requestPermission, toast, startTimer, setApps]);

  const handleAddApp = (newApp: App) => {
    setApps(prev => [...prev, newApp]);
    toast({
      title: "App added!",
      description: `${newApp.name} has been added to your apps.`
    });
  };

  const removeApp = (id: number) => {
    setAppToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDeleteApp = () => {
    if (appToDelete === null) return;
    setApps(prev => prev.filter(app => app.id !== appToDelete));
    setShowDeleteDialog(false);
    setAppToDelete(null);
    toast({
      title: "App removed",
      description: "The app has been removed."
    });
  };

  const updateAppTimeLimit = (id: number, timeLimit: number) => {
    setApps(prev => prev.map(app => 
      app.id === id ? { ...app, timeLimit } : app
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            My Apps
          </h1>
          <p className="text-muted-foreground">
            Launch and manage your apps with time tracking
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} size="lg">
          <Plus className="w-4 h-4 mr-2" />
          Add App
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apps.map(app => (
          <AppCard
            key={app.id}
            app={app}
            onLaunch={launchApp}
            onDelete={removeApp}
          />
        ))}
      </div>

      {showAddDialog && (
        <AddAppDialog
          onAddApp={handleAddApp}
          existingApps={apps}
        />
      )}

      <PasswordConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setAppToDelete(null);
        }}
        onConfirm={confirmDeleteApp}
        title="Delete App"
        description="Please enter your password to confirm deleting this app."
        userEmail={user?.email || ''}
      />
    </div>
  );
};
