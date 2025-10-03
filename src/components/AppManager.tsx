import { Trash2, Edit, Clock } from 'lucide-react';
import { App } from '@/types';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';

interface AppManagerProps {
  apps: App[];
  onDeleteApp: (appId: number) => void;
}

export const AppManager = ({ apps, onDeleteApp }: AppManagerProps) => {
  const customApps = apps.filter(app => app.id > 100); // Custom apps have IDs > 100

  if (customApps.length === 0) return null;

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Your Custom Apps</h3>
        <Badge variant="secondary">{customApps.length} apps</Badge>
      </div>
      
      <div className="grid gap-3">
        {customApps.map((app) => (
          <div
            key={app.id}
            className="flex items-center gap-3 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
          >
            <div className={`${app.color} p-2 rounded-lg`}>
              <Clock className="w-5 h-5 text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate">{app.name}</h4>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>Limit: {app.timeLimit}min</span>
                {app.totalTimeUsed !== undefined && (
                  <span>• Used: {formatTime(app.totalTimeUsed)}</span>
                )}
              </div>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0 hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete {app.name}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove this app from your list. All tracking data will be lost.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDeleteApp(app.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ))}
      </div>
    </div>
  );
};