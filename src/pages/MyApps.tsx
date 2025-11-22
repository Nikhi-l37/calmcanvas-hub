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
import { useTimer } from '@/contexts/TimerContext';
import { useSessionTracking } from '@/hooks/useSessionTracking'; // <-- ADDED

interface TrackedApp {
  id: number;
  name: string;
  packageName: string;
  timeLimit: number;
}

// NEW INTERFACE to track the last known total time from the native tracker
interface NativeUsageTracker {
    [packageName: string]: number; // Stores last reported totalTimeInForeground (in seconds)
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

  const { startSession, endSession } = useSessionTracking(user?.id); // <-- ADDED HOOK
  const { activeTimers, triggerNativeBreak } = useTimer();
  
  // NEW STATE: Tracks the last time logged to prevent double counting
  const [lastLoggedUsage, setLastLoggedUsage] = useState<NativeUsageTracker>({}); 

  useEffect(() => {
    if (user) {
      fetchTrackedApps();
    } else if (!loading) {
      setAppsLoading(false);
    }
  }, [user, loading]);

  const fetchTrackedApps = async () => {
    if (!user) {
      setAppsLoading(false);
      return;
    }
    
    try {
      setAppsLoading(true);
      const { data, error } = await supabase
        .from('user_apps')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(MAX_APPS);

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      if (data && data.length > 0) {
        const apps: TrackedApp[] = data.map(app => ({
          id: app.app_id,
          name: app.name,
          packageName: app.url, // Using URL field to store package name
          timeLimit: app.time_limit
        }));
        setTrackedApps(apps);
      } else {
        setTrackedApps([]);
      }
    } catch (error) {
      console.error('Error fetching tracked apps:', error);
      setTrackedApps([]);
      toast({
        title: "Error loading apps",
        description: "Could not load your tracked apps.",
        variant: "destructive"
      });
    } finally {
      setAppsLoading(false);
    }
  };


  // MODIFIED: Polling logic to sync native app usage and record time
  useEffect(() => {
    if (!user || trackedApps.length === 0 || !isSupported) return;

    const packageNames = trackedApps.map(app => app.packageName);
    
    const syncNativeAppUsage = async () => {
      // Query usage stats for the entire day (1 day)
      const stats = await getAppUsageStats(packageNames, 1); 
      
      const newLastLoggedUsage = { ...lastLoggedUsage };

      for (const app of trackedApps) {
        const appStats = stats[app.packageName];
        // Convert total foreground time from ms to seconds
        const currentTimeUsedSeconds = Math.round((appStats?.totalTimeInForeground || 0) / 1000);
        const timeLimitSeconds = app.timeLimit * 60;
        
        // Determine how much NEW time has been used since the last check
        const lastKnownUsage = lastLoggedUsage[app.packageName] || currentTimeUsedSeconds;
        const incrementalTime = currentTimeUsedSeconds - lastKnownUsage;

        // --------------------------------------------------------
        // 1. LOGGING USAGE TIME (Creates/Ends a session for the last 30 seconds)
        // --------------------------------------------------------
        if (incrementalTime > 0) {
            // A. Start a temporary session to get a session ID
            const sessionId = await startSession(app.id, app.name);
            
            if (sessionId) {
                // B. End the session immediately with the incremental duration.
                // NOTE: endSession logs the time and updates stats/streaks.
                await endSession(sessionId, incrementalTime); 
                
                // C. Update the last logged time to prevent double counting next time.
                newLastLoggedUsage[app.packageName] = currentTimeUsedSeconds; 
            }
        }
        
        // --------------------------------------------------------
        // 2. ENFORCEMENT (Triggering a Break if limit is exceeded)
        // --------------------------------------------------------
        if (currentTimeUsedSeconds >= timeLimitSeconds) {
            // Check if the app just crossed the limit now
            if (lastKnownUsage < timeLimitSeconds) {
              if (activeTimers.has(app.id)) {
                  // If a manual timer (web-based) is running, force the break.
                  triggerNativeBreak(app.id); 
              } else { 
                  // App just crossed the limit, and no manual timer was running.
                  toast({
                      title: `Limit Exceeded for ${app.name}`,
                      description: `You've used all your allotted ${app.timeLimit} minutes today.`,
                      variant: 'destructive',
                      duration: 5000 
                  });
              }
            }
            // Ensure the tracker reflects current usage even after the limit is hit
            newLastLoggedUsage[app.packageName] = currentTimeUsedSeconds;
        } else {
             // If not over the limit, just set the new usage time
             newLastLoggedUsage[app.packageName] = currentTimeUsedSeconds;
        }
      }
      
      // Update the state for the next interval check
      setLastLoggedUsage(newLastLoggedUsage); 
    };

    syncNativeAppUsage();
    const interval = setInterval(syncNativeAppUsage, 30000); 

    return () => clearInterval(interval);
  }, [user, trackedApps, isSupported, activeTimers, triggerNativeBreak, getAppUsageStats, toast, lastLoggedUsage, startSession, endSession]);
  

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
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading your apps...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Smartphone className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Sign in required</h2>
        <p className="text-muted-foreground">Please sign in to track your apps</p>
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
          <h3 className="text-lg font-semibold">No Apps Tracked Yet</h3>
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