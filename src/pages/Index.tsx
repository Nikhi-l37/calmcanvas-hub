import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Plus, X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useNotifications } from '@/hooks/useNotifications';
import { AppCard } from '@/components/AppCard';
import { InstallPWAButton } from '@/components/InstallPWAButton';
import { TimerDisplay } from '@/components/TimerDisplay';
import { BreakOverlay } from '@/components/BreakOverlay';
import { StatsOverview } from '@/components/StatsOverview';
import { NotificationPermission } from '@/components/NotificationPermission';
import { MotivationEngine } from '@/components/MotivationEngine';
import { ProgressTracker } from '@/components/ProgressTracker';
import { GoalSetting } from '@/components/GoalSetting';
import { AddAppDialog } from '@/components/AddAppDialog';
import { AppManager } from '@/components/AppManager';
import { defaultApps, availableIcons, availableColors } from '@/data/defaultApps';
import { breakActivities } from '@/data/breakActivities';
import { getMotivationalMessage, getDailyTip, MotivationalMessage } from '@/data/motivationalContent';
import { App, UserStats, BreakActivity, TimerSession } from '@/types';

const Index = () => {
  const [apps, setApps] = useLocalStorage<App[]>('screenCoachApps', defaultApps);
  const [stats, setStats] = useLocalStorage<UserStats>('userStats', {
    totalTimeToday: 0,
    appsUsedToday: 0,
    breaksToday: 0,
    streak: 0,
    achievements: [],
    weeklyProgress: [],
    goalsMet: false
  });
  
  const [goals, setGoals] = useLocalStorage('screenTimeGoals', {
    dailyLimit: 90, // 90 minutes default
    weeklyTarget: 15, // 15% reduction
    breakFrequency: 25 // every 25 minutes
  });
  
  const [currentTimer, setCurrentTimer] = useState<TimerSession | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showBreak, setShowBreak] = useState(false);
  const [currentBreakActivity, setCurrentBreakActivity] = useState<BreakActivity | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [motivationalMessage, setMotivationalMessage] = useState<MotivationalMessage | null>(null);
  const [showMotivation, setShowMotivation] = useState(false);
  const [newApp, setNewApp] = useState({
    name: '',
    url: '',
    timeLimit: 30,
    icon: 'Globe',
    color: 'bg-blue-500'
  });

  const { toast } = useToast();
  const { requestPermission, sendNotification, canSend, permission } = useNotifications();

  // Check notification permission on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (permission === 'default') {
        setShowNotificationPrompt(true);
      }
    }, 2000); // Show after 2 seconds
    
    return () => clearTimeout(timer);
  }, [permission]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            triggerBreakTime();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isTimerRunning, timeRemaining]);

  const launchApp = useCallback(async (app: App) => {
    // Request notification permission if not granted
    if (!canSend && permission === 'default') {
      const granted = await requestPermission();
      if (!granted) {
        setShowNotificationPrompt(true);
      }
    }

    // Open the app
    window.open(app.url, '_blank');

    // Start timer
    const session: TimerSession = {
      appId: app.id,
      startTime: new Date(),
      duration: app.timeLimit * 60,
      completed: false
    };

    setCurrentTimer(session);
    setTimeRemaining(session.duration);
    setIsTimerRunning(true);

    // Update app usage stats
    setStats(prev => {
      const newStats = {
        ...prev,
        appsUsedToday: prev.appsUsedToday + 1
      };
      
      // Show daily tip on first app launch
      if (prev.appsUsedToday === 0) {
        const tip = getDailyTip();
        setTimeout(() => {
          setMotivationalMessage(tip);
          setShowMotivation(true);
        }, 3000);
      }
      
      return newStats;
    });

    // Update app status
    setApps(prev => prev.map(a => ({
      ...a,
      isActive: a.id === app.id,
      lastUsed: a.id === app.id ? new Date() : a.lastUsed
    })));

    toast({
      title: `Launched ${app.name}`,
      description: `Timer set for ${app.timeLimit} minutes. Enjoy!`
    });
  }, [canSend, requestPermission, toast, setStats, setApps]);

  const triggerBreakTime = useCallback(() => {
    const randomActivity = breakActivities[Math.floor(Math.random() * breakActivities.length)];
    setCurrentBreakActivity(randomActivity);
    setShowBreak(true);

    // Send notification
    sendNotification('Break Time!', {
      body: `Time's up! Come back to Screen Coach for a quick break activity.`,
      tag: 'break-time'
    });

    // Update stats
    setStats(prev => {
      const newTotalTime = prev.totalTimeToday + (currentTimer?.duration || 0);
      const newStats = {
        ...prev,
        breaksToday: prev.breaksToday + 1,
        totalTimeToday: newTotalTime
      };

      // Check for achievements and show motivational messages
      const dailyGoalMet = Math.round(newTotalTime / 60) <= goals.dailyLimit;
      if (dailyGoalMet && !prev.goalsMet) {
        const message = getMotivationalMessage('goal_achieved');
        if (message) {
          setTimeout(() => {
            setMotivationalMessage(message);
            setShowMotivation(true);
          }, 2000);
        }
        newStats.goalsMet = true;
      }

      // Check for streak milestones
      if (prev.streak > 0 && [3, 7, 14, 30].includes(prev.streak)) {
        const message = getMotivationalMessage('streak', { streak: prev.streak });
        if (message) {
          setTimeout(() => {
            setMotivationalMessage(message);
            setShowMotivation(true);
          }, 1500);
        }
      }

      return newStats;
    });
  }, [sendNotification, setStats, currentTimer, goals.dailyLimit]);

  const handleBreakComplete = useCallback(() => {
    setShowBreak(false);
    setCurrentBreakActivity(null);
    setCurrentTimer(null);
    setTimeRemaining(0);
    
    // Reset app active states
    setApps(prev => prev.map(app => ({ ...app, isActive: false })));

    toast({
      title: "Break completed!",
      description: "Great job taking care of yourself. Ready for another activity?"
    });
  }, [setApps, toast]);

  const pauseTimer = () => setIsTimerRunning(false);
  const resumeTimer = () => setIsTimerRunning(true);
  const stopTimer = () => {
    setIsTimerRunning(false);
    setCurrentTimer(null);
    setTimeRemaining(0);
    setApps(prev => prev.map(app => ({ ...app, isActive: false })));
    toast({ title: "Timer stopped", description: "Session ended early." });
  };

  const addNewApp = () => {
    if (!newApp.name || !newApp.url) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      new URL(newApp.url);
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid website URL.",
        variant: "destructive"
      });
      return;
    }

    const app: App = {
      id: Date.now(),
      name: newApp.name,
      url: newApp.url,
      icon: newApp.icon,
      color: newApp.color,
      timeLimit: newApp.timeLimit,
      category: 'other'
    };

    setApps(prev => [...prev, app]);
    setNewApp({
      name: '',
      url: '',
      timeLimit: 30,
      icon: 'Globe',
      color: 'bg-blue-500'
    });

    toast({
      title: "App added!",
      description: `${app.name} has been added to your dashboard.`
    });
  };

  const handleAddApp = (newApp: App) => {
    setApps(prev => [...prev, newApp]);
  };

  const removeApp = (id: number) => {
    setApps(prev => prev.filter(app => app.id !== id));
    toast({
      title: "App removed",
      description: "The app has been removed from your dashboard."
    });
  };

  const updateAppTimeLimit = (id: number, timeLimit: number) => {
    setApps(prev => prev.map(app => 
      app.id === id ? { ...app, timeLimit } : app
    ));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <InstallPWAButton />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 relative"
        >
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            Screen Coach Hub
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Smart screen time management • Works as Website & App
          </p>
          
          <Button
            onClick={() => setShowSettings(!showSettings)}
            variant="outline"
            className="absolute top-0 right-0"
          >
            <Settings className="w-4 h-4 mr-2" />
            Manage Apps
          </Button>
        </motion.header>

        {/* Stats Overview */}
        <StatsOverview stats={stats} />

        {/* Progress and Goals Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <ProgressTracker 
            stats={stats} 
            dailyGoal={goals.dailyLimit}
            weeklyProgress={stats.weeklyProgress}
          />
          <GoalSetting
            currentGoals={goals}
            onUpdateGoals={setGoals}
            currentUsage={Math.round(stats.totalTimeToday / 60) || 60}
          />
        </div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {showSettings ? (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {/* App Management */}
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-6">Manage Your Apps</h2>
                <div className="space-y-4">
                  {apps.map(app => (
                    <div key={app.id} className="flex items-center gap-4 p-4 bg-muted/20 rounded-lg">
                      <div className={`w-12 h-12 rounded-lg ${app.color} flex items-center justify-center text-white`}>
                        <span className="text-lg font-bold">{app.name[0]}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{app.name}</h3>
                        <p className="text-sm text-muted-foreground">{app.url}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={app.timeLimit}
                          onChange={(e) => updateAppTimeLimit(app.id, parseInt(e.target.value) || 0)}
                          className="w-20"
                          min="1"
                          max="120"
                        />
                        <span className="text-sm text-muted-foreground">min</span>
                        <Button
                          onClick={() => removeApp(app.id)}
                          variant="destructive"
                          size="sm"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Add New App */}
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-6">Add New App</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="app-name">App Name</Label>
                    <Input
                      id="app-name"
                      value={newApp.name}
                      onChange={(e) => setNewApp(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., YouTube Kids"
                    />
                  </div>
                  <div>
                    <Label htmlFor="app-url">Website URL</Label>
                    <Input
                      id="app-url"
                      type="url"
                      value={newApp.url}
                      onChange={(e) => setNewApp(prev => ({ ...prev, url: e.target.value }))}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="time-limit">Time Limit (minutes)</Label>
                    <Input
                      id="time-limit"
                      type="number"
                      value={newApp.timeLimit}
                      onChange={(e) => setNewApp(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 30 }))}
                      min="1"
                      max="120"
                    />
                  </div>
                  <div>
                    <Label htmlFor="app-icon">Icon</Label>
                    <Select value={newApp.icon} onValueChange={(value) => setNewApp(prev => ({ ...prev, icon: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableIcons.map(icon => (
                          <SelectItem key={icon} value={icon}>
                            {icon.replace(/([A-Z])/g, ' $1').trim()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="app-color">Color</Label>
                    <Select value={newApp.color} onValueChange={(value) => setNewApp(prev => ({ ...prev, color: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(availableColors).map(([name, className]) => (
                          <SelectItem key={className} value={className}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={addNewApp} className="mt-4 w-full" size="lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Add App
                </Button>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="apps"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {/* App Grid */}
              <div className="space-y-8">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {apps.map((app, index) => (
                    <motion.div
                      key={app.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <AppCard app={app} onLaunch={launchApp} />
                    </motion.div>
                  ))}
                  
                  {/* Add App Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: apps.length * 0.1 }}
                  >
                    <AddAppDialog onAddApp={handleAddApp} existingApps={apps} />
                  </motion.div>
                </div>

                {/* App Manager - Shows custom apps list with delete option */}
                <AppManager apps={apps} onDeleteApp={removeApp} />
              </div>

              {apps.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16"
                >
                  <p className="text-xl text-muted-foreground mb-4">
                    No apps configured yet
                  </p>
                  <Button onClick={() => setShowSettings(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First App
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Timer Display */}
      {currentTimer && (
        <TimerDisplay
          appName={apps.find(app => app.id === currentTimer.appId)?.name || 'Unknown App'}
          timeRemaining={timeRemaining}
          totalTime={currentTimer.duration}
          isRunning={isTimerRunning}
          onPause={pauseTimer}
          onResume={resumeTimer}
          onStop={stopTimer}
        />
      )}

      {/* Break Overlay */}
      <BreakOverlay
        activity={currentBreakActivity}
        onComplete={handleBreakComplete}
        isVisible={showBreak}
      />

      {/* Notification Permission */}
      <NotificationPermission
        permission={permission}
        onRequestPermission={requestPermission}
        onDismiss={() => setShowNotificationPrompt(false)}
        isVisible={showNotificationPrompt}
      />

      {/* Motivation Engine */}
      <MotivationEngine
        message={motivationalMessage}
        onDismiss={() => {
          setShowMotivation(false);
          setMotivationalMessage(null);
        }}
        isVisible={showMotivation}
      />
    </div>
  );
};

export default Index;