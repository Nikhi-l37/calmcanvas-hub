import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Loader2, Smartphone, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { NativeAppSelector } from '@/components/NativeAppSelector';
import { NativeAppCard } from '@/components/NativeAppCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { InstalledApp, useAppUsageTracking } from '@/hooks/useAppUsageTracking';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Capacitor } from '@capacitor/core';
import { useTimer } from '@/contexts/TimerContext';
import { LocalStorage, TrackedApp } from '@/services/storage';
import { LocalNotifications } from '@capacitor/local-notifications';
import { getLocalDateString } from '@/lib/utils';

interface NativeUsageTracker {
  [packageName: string]: number;
}

const MAX_APPS = 10;

const POPULAR_PACKAGES = [
  { pkg: 'com.google.android.youtube', name: 'YouTube' },
  { pkg: 'com.instagram.android', name: 'Instagram' },
  { pkg: 'com.facebook.katana', name: 'Facebook' },
  { pkg: 'com.zhiliaoapp.musically', name: 'TikTok' },
  { pkg: 'com.twitter.android', name: 'X (Twitter)' },
  { pkg: 'com.snapchat.android', name: 'Snapchat' },
  { pkg: 'com.whatsapp', name: 'WhatsApp' }
];

export const MyApps = () => {
  const [trackedApps, setTrackedApps] = useState<TrackedApp[]>([]);
  const [appsLoading, setAppsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();
  const { isSupported, getAppUsageStats, installedApps, loadInstalledApps } = useAppUsageTracking();
  const isNativePlatform = Capacitor.getPlatform() === 'android';
  const { activeTimers, triggerNativeBreak } = useTimer();
  const [lastLoggedUsage, setLastLoggedUsage] = useState<NativeUsageTracker>({});

  useEffect(() => {
    fetchTrackedApps();
    if (isSupported) {
      loadInstalledApps();
    }
    if (isNativePlatform) {
      LocalNotifications.requestPermissions();
    }
  }, [isSupported, isNativePlatform]);

  const fetchTrackedApps = () => {
    try {
      setAppsLoading(true);
      const apps = LocalStorage.getTrackedApps();
      setTrackedApps(apps);
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

  useEffect(() => {
    if (trackedApps.length === 0 || !isSupported) return;
    const packageNames = trackedApps.map(app => app.packageName);
    const checkLimits = async () => {
      const stats = await getAppUsageStats(packageNames, 1);
      const newLastLoggedUsage = { ...lastLoggedUsage };
      for (const app of trackedApps) {
        const appStats = stats[app.packageName];
        const currentTimeUsedSeconds = Math.round((appStats?.totalTimeInForeground || 0) / 1000);
        const timeLimitSeconds = app.timeLimit * 60;
        const lastKnownUsage = lastLoggedUsage[app.packageName] || currentTimeUsedSeconds;

        if (currentTimeUsedSeconds >= timeLimitSeconds) {
          if (lastKnownUsage < timeLimitSeconds) {
            if (activeTimers.has(app.id)) {
              triggerNativeBreak(app.id);
            } else {
              // Trigger Local Notification for background alert
              LocalNotifications.schedule({
                notifications: [{
                  title: `Limit Exceeded: ${app.name}`,
                  body: `You've used your ${app.timeLimit} min limit for today.`,
                  id: Math.floor(Math.random() * 100000),
                  schedule: { at: new Date(Date.now()) },
                  smallIcon: 'ic_stat_icon_config_sample',
                }]
              }).catch(e => console.error('Notification error:', e));

              toast({
                title: `Limit Exceeded for ${app.name}`,
                description: `You've used all your allotted ${app.timeLimit} minutes today.`,
                variant: 'destructive',
                duration: 5000
              });
            }
          }
        }
        newLastLoggedUsage[app.packageName] = currentTimeUsedSeconds;
      }
      setLastLoggedUsage(newLastLoggedUsage);
    };
    checkLimits();
    const interval = setInterval(checkLimits, 30000);
    return () => clearInterval(interval);
  }, [trackedApps, isSupported, activeTimers, triggerNativeBreak, getAppUsageStats, toast, lastLoggedUsage]);

  const handleAddApps = async (selectedApps: InstalledApp[]) => {
    try {
      const packageNames = selectedApps.map(a => a.packageName);
      let currentUsage: Record<string, any> = {};
      if (isSupported) {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        currentUsage = await getAppUsageStats(packageNames, startOfDay.getTime());
      }
      const todayStr = getLocalDateString();
      selectedApps.forEach((app, index) => {
        const appStats = currentUsage[app.packageName];
        const currentSeconds = appStats ? Math.floor(appStats.totalTimeInForeground / 1000) : 0;
        const newApp: TrackedApp = {
          id: (Date.now() + index).toString(),
          name: app.appName,
          packageName: app.packageName,
          timeLimit: 30,
          usageOffset: currentSeconds,
          usageOffsetDate: todayStr
        };
        LocalStorage.addTrackedApp(newApp);
      });
      fetchTrackedApps();
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

  const scanForPopularApps = () => {
    if (installedApps.length === 0) {
      toast({ title: "Scanning...", description: "Please wait while we load your apps." });
      loadInstalledApps();
      return;
    }
    const foundApps: InstalledApp[] = [];
    POPULAR_PACKAGES.forEach(pop => {
      const isInstalled = installedApps.find(app => app.packageName === pop.pkg);
      const isTracked = trackedApps.find(app => app.packageName === pop.pkg);
      if (isInstalled && !isTracked) {
        foundApps.push(isInstalled);
      }
    });
    if (foundApps.length > 0) {
      handleAddApps(foundApps);
      toast({
        title: "Popular Apps Found",
        description: `Added ${foundApps.map(a => a.appName).join(', ')} to your tracking list.`
      });
    } else {
      toast({
        title: "No new popular apps found",
        description: "You're already tracking the popular apps we detected, or they aren't installed."
      });
    }
  };

  const handleDeleteApp = async (packageName: string) => {
    try {
      LocalStorage.removeTrackedApp(packageName);
      fetchTrackedApps();
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

  if (appsLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading your apps...</p>
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
        <div className="flex gap-2">
          {isNativePlatform && (
            <Button onClick={scanForPopularApps} variant="outline" size="sm" className="hidden md:flex">
              <Search className="w-4 h-4 mr-2" />
              Scan Popular
            </Button>
          )}
          {canAddMore && isNativePlatform && (
            <Button onClick={() => setShowAddDialog(true)} size="lg">
              <Plus className="w-4 h-4 mr-2" />
              Add Apps
            </Button>
          )}
        </div>
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
          <div className="flex gap-4 justify-center">
            {isNativePlatform && (
              <Button onClick={scanForPopularApps} variant="outline" size="lg">
                <Search className="w-4 h-4 mr-2" />
                Scan Popular Apps
              </Button>
            )}
            {canAddMore && isNativePlatform && (
              <Button onClick={() => setShowAddDialog(true)} size="lg">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First App
              </Button>
            )}
          </div>
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
              onDelete={() => handleDeleteApp(app.packageName)}
            />
          ))}
        </div>
      )}

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[85vh] overflow-y-auto rounded-lg">
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