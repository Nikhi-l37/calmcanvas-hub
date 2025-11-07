import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Check, AlertCircle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAppUsageTracking, InstalledApp } from '@/hooks/useAppUsageTracking';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NativeAppSelectorProps {
  onSelectApps: (apps: InstalledApp[]) => void;
  maxApps: number;
  currentAppsCount: number;
}

export const NativeAppSelector = ({ onSelectApps, maxApps, currentAppsCount }: NativeAppSelectorProps) => {
  const { isSupported, hasPermission, installedApps, requestPermission, loadInstalledApps } = useAppUsageTracking();
  const [selectedApps, setSelectedApps] = useState<InstalledApp[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (hasPermission) {
      loadInstalledApps();
    }
  }, [hasPermission]);

  const remainingSlots = maxApps - currentAppsCount;
  const canSelectMore = selectedApps.length < remainingSlots;

  const filteredApps = installedApps.filter(app =>
    app.appName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.packageName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleApp = (app: InstalledApp) => {
    if (selectedApps.find(a => a.packageName === app.packageName)) {
      setSelectedApps(selectedApps.filter(a => a.packageName !== app.packageName));
    } else if (canSelectMore) {
      setSelectedApps([...selectedApps, app]);
    }
  };

  const handleAddApps = () => {
    onSelectApps(selectedApps);
    setSelectedApps([]);
  };

  if (!isSupported) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Native app tracking is only supported on Android devices. 
          This feature requires a native mobile app installation.
        </AlertDescription>
      </Alert>
    );
  }

  if (!hasPermission) {
    return (
      <Card className="p-6 space-y-4">
        <div className="text-center space-y-4">
          <Settings className="h-12 w-12 mx-auto text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold mb-2">Permission Required</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Screen Coach needs permission to access app usage statistics to track your screen time.
            </p>
          </div>
          <Button onClick={requestPermission} size="lg">
            Grant Permission
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          You can add up to {remainingSlots} more {remainingSlots === 1 ? 'app' : 'apps'}. 
          Selected: {selectedApps.length}
        </AlertDescription>
      </Alert>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search installed apps..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <ScrollArea className="h-[400px] rounded-md border">
        <div className="p-4 space-y-2">
          {filteredApps.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No apps found
            </p>
          ) : (
            filteredApps.map((app) => {
              const isSelected = selectedApps.find(a => a.packageName === app.packageName);
              const isDisabled = !isSelected && !canSelectMore;

              return (
                <motion.div
                  key={app.packageName}
                  whileHover={{ scale: isDisabled ? 1 : 1.02 }}
                  whileTap={{ scale: isDisabled ? 1 : 0.98 }}
                >
                  <Card
                    className={`p-4 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : isDisabled
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => !isDisabled && toggleApp(app)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-surface flex items-center justify-center text-xl">
                          {app.appName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-medium">{app.appName}</h4>
                          <p className="text-xs text-muted-foreground">{app.packageName}</p>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-4 h-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {selectedApps.length > 0 && (
        <Button onClick={handleAddApps} className="w-full" size="lg">
          Add {selectedApps.length} {selectedApps.length === 1 ? 'App' : 'Apps'}
        </Button>
      )}
    </div>
  );
};
