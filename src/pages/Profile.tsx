import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Settings as SettingsIcon, Trash2, Check, X, Loader2, Edit2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LocalStorage, UserSettings } from '@/services/storage';
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
} from "@/components/ui/alert-dialog";

export const Profile = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<UserSettings>({ dailyGoal: 120, theme: 'system' });
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    const savedSettings = LocalStorage.getSettings();
    setSettings(savedSettings);
    setEditedName(savedSettings.name || '');
  };

  const handleSaveName = () => {
    const newSettings = { ...settings, name: editedName };
    LocalStorage.saveSettings(newSettings);
    setSettings(newSettings);
    setIsEditing(false);
    toast({
      title: "Settings updated",
      description: "Your name has been updated successfully."
    });
  };

  const handleClearData = () => {
    LocalStorage.clearAll();
    toast({
      title: "Data cleared",
      description: "All your data has been reset.",
      variant: "destructive"
    });
    // Reload to reset state
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
          Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your app preferences and data
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-6 max-w-2xl space-y-8">

          {/* Profile Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <User className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Profile</h2>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              {isEditing ? (
                <div className="flex gap-2">
                  <Input
                    id="name"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    placeholder="Enter your name"
                  />
                  <Button size="icon" onClick={handleSaveName}>
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="outline" onClick={() => setIsEditing(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    id="name"
                    value={settings.name || 'User'}
                    disabled
                  />
                  <Button size="icon" variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                This name will be used to greet you on the dashboard.
              </p>
            </div>
          </div>

          {/* Data Management Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <SettingsIcon className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Data Management</h2>
            </div>

            <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-full bg-destructive/10">
                  <Trash2 className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <h3 className="font-medium text-destructive">Clear All Data</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    This will permanently delete all your tracked apps, usage history, streaks, and settings. This action cannot be undone.
                  </p>
                </div>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full sm:w-auto">
                    Reset App Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your
                      local data and reset the application to its initial state.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Yes, delete everything
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

        </Card>
      </motion.div>
    </div>
  );
};
