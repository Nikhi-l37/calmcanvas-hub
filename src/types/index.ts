export interface App {
  id: number;
  name: string;
  url: string;
  icon: string;
  color: string;
  timeLimit: number;
  category: AppCategory;
  isActive?: boolean;
  totalTimeUsed?: number;
  lastUsed?: Date;
}

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  avatar: string;
  settings: UserSettings;
  stats: UserStats;
}

export interface UserSettings {
  dailyTimeLimit: number;
  breakDuration: number;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  parentalControls: boolean;
  theme: 'light' | 'dark' | 'auto';
  weeklyReductionTarget: number;
  breakFrequency: number;
}

export interface UserStats {
  totalTimeToday: number;
  appsUsedToday: number;
  breaksToday: number;
  streak: number;
  achievements: Achievement[];
  weeklyProgress: number[];
  lastMotivationalMessage?: string;
  goalsMet: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
}

export interface BreakActivity {
  id: string;
  title: string;
  description: string;
  duration: number;
  type: 'physical' | 'mental' | 'creative' | 'social';
  icon: string;
}

export interface TimerSession {
  appId: number;
  startTime: Date;
  duration: number;
  completed: boolean;
}

export type AppCategory = 'educational' | 'creative' | 'entertainment' | 'social' | 'productivity' | 'other';

export interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}