export interface TrackedApp {
    id: string;
    name: string;
    packageName: string;
    timeLimit: number; // in minutes
    category?: string;
    usageOffset?: number; // seconds of usage already on device when added
    usageOffsetDate?: string; // date when offset was captured (YYYY-MM-DD)
}

export interface DailyUsage {
    date: string; // YYYY-MM-DD
    totalTime: number; // in seconds
    apps: Record<string, number>; // packageName -> seconds
}

export interface Break {
    id: string;
    duration_seconds: number;
    activity_type: string | null;
    break_time: string; // ISO string
}

export interface UserSettings {
    dailyGoal: number; // in minutes
    weeklyTarget?: number; // percentage reduction
    breakFrequency?: number; // in minutes
    dailyBreakGoal?: number; // target number of breaks per day
    theme: 'light' | 'dark' | 'system';
    name?: string;
}

const STORAGE_KEYS = {
    TRACKED_APPS: 'screenCoachApps',
    DAILY_USAGE: 'screenCoachDailyUsage',
    BREAKS: 'screenCoachBreaks',
    SETTINGS: 'screenCoachSettings',
    STREAKS: 'screenCoachStreaks',
    VERSION: 'screenCoachVersion'
};

// Storage schema/version for the local-only digital wellbeing app.
// Bump this when we make breaking changes so any old data is cleared.
const CURRENT_VERSION = '2.0.0';

export const LocalStorage = {
    init: () => {
        const storedVersion = localStorage.getItem(STORAGE_KEYS.VERSION);
        if (storedVersion !== CURRENT_VERSION) {
            console.log('Storage version mismatch. Clearing all data for fresh start.');
            LocalStorage.clearAll();
            localStorage.setItem(STORAGE_KEYS.VERSION, CURRENT_VERSION);
        }
    },

    // Tracked Apps
    getTrackedApps: (): TrackedApp[] => {
        const data = localStorage.getItem(STORAGE_KEYS.TRACKED_APPS);
        return data ? JSON.parse(data) : [];
    },

    saveTrackedApps: (apps: TrackedApp[]) => {
        localStorage.setItem(STORAGE_KEYS.TRACKED_APPS, JSON.stringify(apps));
    },

    addTrackedApp: (app: TrackedApp) => {
        const apps = LocalStorage.getTrackedApps();
        if (!apps.find(a => a.packageName === app.packageName)) {
            apps.push(app);
            LocalStorage.saveTrackedApps(apps);
        }
    },

    removeTrackedApp: (packageName: string) => {
        const apps = LocalStorage.getTrackedApps();
        const newApps = apps.filter(a => a.packageName !== packageName);
        LocalStorage.saveTrackedApps(newApps);
    },

    // Daily Usage
    getDailyUsage: (date: string): DailyUsage | null => {
        try {
            const allUsage = JSON.parse(localStorage.getItem(STORAGE_KEYS.DAILY_USAGE) || '{}');
            return allUsage?.[date] || null;
        } catch (e) {
            return null;
        }
    },

    saveDailyUsage: (usage: DailyUsage) => {
        const allUsage = JSON.parse(localStorage.getItem(STORAGE_KEYS.DAILY_USAGE) || '{}');
        allUsage[usage.date] = usage;
        localStorage.setItem(STORAGE_KEYS.DAILY_USAGE, JSON.stringify(allUsage));
    },

    // Settings
    getSettings: (): UserSettings => {
        const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        try {
            const parsed = data ? JSON.parse(data) : null;
            return parsed || { dailyGoal: 120, dailyBreakGoal: 5, theme: 'system' };
        } catch (e) {
            return { dailyGoal: 120, dailyBreakGoal: 5, theme: 'system' };
        }
    },

    saveSettings: (settings: UserSettings) => {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    },

    // Breaks
    getBreaks: (date: string): Break[] => {
        const allBreaks = JSON.parse(localStorage.getItem(STORAGE_KEYS.BREAKS) || '[]');
        return allBreaks.filter((b: Break) => b.break_time.startsWith(date));
    },

    saveBreak: (breakItem: Break) => {
        const allBreaks = JSON.parse(localStorage.getItem(STORAGE_KEYS.BREAKS) || '[]');
        allBreaks.push(breakItem);
        localStorage.setItem(STORAGE_KEYS.BREAKS, JSON.stringify(allBreaks));
    },

    // Streaks
    checkDailySuccess: (date: string): boolean => {
        const usage = LocalStorage.getDailyUsage(date);
        if (!usage) return false;

        const ONE_HOUR = 3600;
        const apps = usage.apps || {};

        // Check if ANY app exceeds limit
        return !Object.values(apps).some(seconds => seconds > ONE_HOUR);
    },

    getStreak: (): number => {
        // Calculate current streak from daily usage
        const getLocalDateString = (date: Date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        let streak = 0;
        const checkDate = new Date();

        // Check backwards from today
        while (true) {
            const dateStr = getLocalDateString(checkDate);
            const usage = LocalStorage.getDailyUsage(dateStr);

            if (usage) {
                // Check success condition: All apps < 1 hour
                if (LocalStorage.checkDailySuccess(dateStr)) {
                    streak++;
                    // Go back one day
                    checkDate.setDate(checkDate.getDate() - 1);
                } else {
                    // Streak broken by overuse
                    break;
                }
            } else {
                // No data, end of history
                break;
            }
        }

        return streak;
    },

    clearAll: () => {
        Object.values(STORAGE_KEYS).forEach(key => {
            if (key !== STORAGE_KEYS.VERSION) {
                localStorage.removeItem(key);
            }
        });
    },

    pruneOldData: (daysToKeep: number = 30) => {
        try {
            // Prune daily usage
            const allUsage = JSON.parse(localStorage.getItem(STORAGE_KEYS.DAILY_USAGE) || '{}');
            const now = new Date();
            const cutoffDate = new Date(now.setDate(now.getDate() - daysToKeep));

            let usageChanged = false;
            Object.keys(allUsage).forEach(dateStr => {
                const date = new Date(dateStr);
                if (date < cutoffDate) {
                    delete allUsage[dateStr];
                    usageChanged = true;
                }
            });

            if (usageChanged) {
                localStorage.setItem(STORAGE_KEYS.DAILY_USAGE, JSON.stringify(allUsage));
                console.log('Pruned old usage data');
            }

            // Prune breaks
            const allBreaks = JSON.parse(localStorage.getItem(STORAGE_KEYS.BREAKS) || '[]');
            const originalLength = allBreaks.length;
            const newBreaks = allBreaks.filter((b: Break) => {
                const breakDate = new Date(b.break_time);
                return breakDate >= cutoffDate;
            });

            if (newBreaks.length < originalLength) {
                localStorage.setItem(STORAGE_KEYS.BREAKS, JSON.stringify(newBreaks));
                console.log(`Pruned ${originalLength - newBreaks.length} old break records`);
            }
        } catch (error) {
            console.error('Error pruning data:', error);
        }
    }
};

// Initialize on load
LocalStorage.init();
