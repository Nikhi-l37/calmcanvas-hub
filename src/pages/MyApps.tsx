import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Loader2, Smartphone } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { NativeAppSelector } from '@/components/NativeAppSelector';
import { NativeAppCard } from '@/components/NativeAppCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { InstalledApp, useAppUsageTracking } from '@/hooks/useAppUsageTracking';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Capacitor } from '@capacitor/core';

interface TrackedApp {
  id: number;
  name: string;
  packageName: string;
  timeLimit: number;
}

const MAX_APPS = 5;

export const MyApps = () => {
  const { user, loading } = useAuth();
  const [trackedApps, setTrackedApps] = useState<TrackedApp[]>([]);
  const [appsLoading, setAppsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();
  const { isSupported, getAppUsageStats } = useAppUsageTracking();
  const isNativePlatform = Capacitor.getPlatform() === 'android';

  useEffect(() => {
    if (user) {
      fetchTrackedApps();
    }
  }, [user]);

  // Poll for usage stats every 30 seconds when apps are being tracked
  useEffect(() => {
    if (!user || trackedApps.length === 0 || !isSupported) return;

    const interval = setInterval(async () => {
      const packageNames = trackedApps.map(app => app.packageName);
      const stats = await getAppUsageStats(packageNames, 1);
      
      // Update session tracking based on usage stats
      for (const app of trackedApps) {
        const appStats = stats[app.packageName];
        if (appStats && appStats.totalTimeInForeground > 0) {
          // App is being used - track the session
          console.log(`${app.name} usage: ${appStats.totalTimeInForeground}ms`);
        }
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [user, trackedApps, isSupported]);

  const fetchTrackedApps = async () => {
    if (!user) return;
    
    try {
      setAppsLoading(true);
      const { data, error } = await supabase
        .from('user_apps')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(MAX_APPS);

      if (error) throw error;

      if (data && data.length > 0) {
        const apps: TrackedApp[] = data.map(app => ({
          id: app.app_id,
          name: app.name,
          packageName: app.url, // Using URL field to store package name
          timeLimit: app.time_limit
        }));
        setTrackedApps(apps);
      }
    } catch (error) {
      console.error('Error fetching tracked apps:', error);
      toast({
        title: "Error loading apps",
        description: "Could not load your tracked apps.",
        variant: "destructive"
      });
    } finally {
      setAppsLoading(false);
    }
  };

  const handleAddApps = async (selectedApps: InstalledApp[]) => {
    if (!user) return;

    try {
      const appsToInsert = selectedApps.map((app, index) => ({
        user_id: user.id,
        app_id: Date.now() + index, // Generate unique ID
        name: app.appName,
        url: app.packageName, // Store package name in URL field
        icon: 'Smartphone',
        time_limit: 30, // Default 30 minutes
        is_active: false
      }));

      const { error } = await supabase
        .from('user_apps')
        .insert(appsToInsert);

      if (error) throw error;

      await fetchTrackedApps();
      setShowAddDialog(false);
      
      toast({
        title: "Apps added!",
        description: `${selectedApps.length} ${selectedApps.length === 1 ? 'app' : 'apps'} added for tracking.`
      });
    } catch (error) {
      console.error('Error adding apps:', error);
      toast({
        title: "Error",
        description: "Could not add apps. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteApp = async (appId: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_apps')
        .delete()
        .eq('app_id', appId)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchTrackedApps();
      
      toast({
        title: "App removed",
        description: "App has been removed from tracking."
      });
    } catch (error) {
      console.error('Error deleting app:', error);
      toast({
        title: "Error",
        description: "Could not remove app. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading || appsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const canAddMore = trackedApps.length < MAX_APPS;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            Tracked Apps
          </h1>
          <p className="text-muted-foreground">
            {isNativePlatform 
              ? `Tracking ${trackedApps.length} of ${MAX_APPS} apps automatically`
              : 'Native app tracking requires Android mobile app'
            }
          </p>
        </div>
        {canAddMore && isNativePlatform && (
          <Button onClick={() => setShowAddDialog(true)} size="lg">
            <Plus className="w-4 h-4 mr-2" />
            Add Apps ({trackedApps.length}/{MAX_APPS})
          </Button>
        )}
      </motion.div>

      {!isNativePlatform && (
        <Alert>
          <Smartphone className="h-4 w-4" />
          <AlertDescription>
            To use automatic app tracking, you need to:
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Export this project to GitHub</li>
              <li>Run <code className="bg-muted px-1 rounded">npm install</code></li>
              <li>Run <code className="bg-muted px-1 rounded">npx cap add android</code></li>
              <li>Run <code className="bg-muted px-1 rounded">npm run build && npx cap sync</code></li>
              <li>Run <code className="bg-muted px-1 rounded">npx cap run android</code></li>
            </ol>
          </AlertDescription>
        </Alert>
      )}

      {trackedApps.length === 0 ? (
        <div className="text-center py-12">
          <Smartphone className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Apps Tracked Yet</h3>
          <p className="text-muted-foreground mb-4">
            {isNativePlatform 
              ? 'Add apps from your device to start tracking screen time automatically'
              : 'Install the mobile app to track your device apps'
            }
          </p>
          {canAddMore && isNativePlatform && (
            <Button onClick={() => setShowAddDialog(true)} size="lg">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First App
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trackedApps.map(app => (
            <NativeAppCard
              key={app.id}
              appId={app.id}
              appName={app.name}
              packageName={app.packageName}
              timeLimit={app.timeLimit}
              onDelete={handleDeleteApp}
            />
          ))}
        </div>
      )}

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Apps to Track</DialogTitle>
            <DialogDescription>
              Select up to {MAX_APPS - trackedApps.length} more apps from your device to track their usage time.
            </DialogDescription>
          </DialogHeader>
          <NativeAppSelector
            onSelectApps={handleAddApps}
            maxApps={MAX_APPS}
            currentAppsCount={trackedApps.length}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
