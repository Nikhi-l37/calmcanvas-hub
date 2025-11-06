import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useStats } from '@/hooks/useStats';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/useNotifications';
import { AppCard } from '@/components/AppCard';
import { PasswordConfirmDialog } from '@/components/PasswordConfirmDialog';
import { AddAppDialog } from '@/components/AddAppDialog';
import { defaultApps } from '@/data/defaultApps';
import { useTimer } from '@/contexts/TimerContext';
import { App } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export const MyApps = () => {
  const { user, loading } = useAuth();
  const { stats } = useStats(user?.id);
  const [apps, setApps] = useState<App[]>([]);
  const [appsLoading, setAppsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [appToDelete, setAppToDelete] = useState<number | null>(null);

  const { toast } = useToast();
  const { requestPermission, canSend, permission } = useNotifications();
  const { startTimer } = useTimer();

  useEffect(() => {
    if (user) {
      fetchUserApps();
    }
  }, [user]);

  const fetchUserApps = async () => {
    if (!user) return;
    
    try {
      setAppsLoading(true);
      const { data, error } = await supabase
        .from('user_apps')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const userApps: App[] = data.map(app => ({
          id: app.app_id,
          name: app.name,
          url: app.url,
          icon: app.icon,
          color: 'blue',
          category: 'other' as const,
          timeLimit: app.time_limit,
          isActive: app.is_active,
          lastUsed: app.last_used ? new Date(app.last_used) : undefined
        }));
        setApps(userApps);
      } else {
        // First time user - add default apps
        await addDefaultApps();
      }
    } catch (error) {
      console.error('Error fetching apps:', error);
      toast({
        title: "Error loading apps",
        description: "Could not load your apps. Please try again.",
        variant: "destructive"
      });
    } finally {
      setAppsLoading(false);
    }
  };

  const addDefaultApps = async () => {
    if (!user) return;
    
    try {
      const appsToInsert = defaultApps.map(app => ({
        user_id: user.id,
        app_id: app.id,
        name: app.name,
        url: app.url,
        icon: app.icon,
        time_limit: app.timeLimit,
        is_active: false
      }));

      const { error } = await supabase
        .from('user_apps')
        .insert(appsToInsert);

      if (error) throw error;
      
      await fetchUserApps();
    } catch (error) {
      console.error('Error adding default apps:', error);
    }
  };

  const launchApp = useCallback(async (app: App) => {
    if (!canSend && permission === 'default') {
      await requestPermission();
    }

    window.open(app.url, '_blank');
    startTimer(app);

    // Update app in database
    if (user) {
      await supabase
        .from('user_apps')
        .update({
          is_active: true,
          last_used: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('app_id', app.id);

      // Set all other apps to inactive
      await supabase
        .from('user_apps')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .neq('app_id', app.id);
    }

    setApps(prev => prev.map(a => ({
      ...a,
      isActive: a.id === app.id,
      lastUsed: a.id === app.id ? new Date() : a.lastUsed
    })));

    toast({
      title: `Launched ${app.name}`,
      description: `Timer set for ${app.timeLimit} minutes. Enjoy!`
    });
  }, [canSend, requestPermission, toast, startTimer, user]);

  const handleAddApp = async (newApp: App) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_apps')
        .insert({
          user_id: user.id,
          app_id: newApp.id,
          name: newApp.name,
          url: newApp.url,
          icon: newApp.icon,
          time_limit: newApp.timeLimit,
          is_active: false
        });

      if (error) throw error;

      setApps(prev => [...prev, newApp]);
      toast({
        title: "App added!",
        description: `${newApp.name} has been added to your apps.`
      });
    } catch (error) {
      console.error('Error adding app:', error);
      toast({
        title: "Error",
        description: "Could not add app. Please try again.",
        variant: "destructive"
      });
    }
  };

  const removeApp = (id: number) => {
    setAppToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDeleteApp = async () => {
    if (appToDelete === null || !user) return;

    try {
      const { error } = await supabase
        .from('user_apps')
        .delete()
        .eq('user_id', user.id)
        .eq('app_id', appToDelete);

      if (error) throw error;

      setApps(prev => prev.filter(app => app.id !== appToDelete));
      setShowDeleteDialog(false);
      setAppToDelete(null);
      toast({
        title: "App removed",
        description: "The app has been removed."
      });
    } catch (error) {
      console.error('Error deleting app:', error);
      toast({
        title: "Error",
        description: "Could not delete app. Please try again.",
        variant: "destructive"
      });
    }
  };

  const updateAppTimeLimit = async (id: number, timeLimit: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_apps')
        .update({ time_limit: timeLimit })
        .eq('user_id', user.id)
        .eq('app_id', id);

      if (error) throw error;

      setApps(prev => prev.map(app => 
        app.id === id ? { ...app, timeLimit } : app
      ));
    } catch (error) {
      console.error('Error updating time limit:', error);
    }
  };

  if (loading || appsLoading) {
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

      <AddAppDialog
        isOpen={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAddApp={handleAddApp}
        existingApps={apps}
      />

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
