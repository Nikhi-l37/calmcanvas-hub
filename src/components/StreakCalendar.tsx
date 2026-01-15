import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LocalStorage } from '@/services/storage';

interface DayCompletion {
  date: string;
  completed: boolean;
  isToday: boolean;
  hasData?: boolean;
}

export const StreakCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [completions, setCompletions] = useState<Map<string, boolean>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompletions();
  }, [currentDate]);

  const fetchCompletions = () => {
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      const lastDay = new Date(year, month + 1, 0).getDate();

      const completionMap = new Map<string, boolean>();

      for (let day = 1; day <= lastDay; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dailyUsage = LocalStorage.getDailyUsage(dateStr);

        // If we have data, valid if checkDailySuccess is true
        if (dailyUsage) {
          const isSuccess = LocalStorage.checkDailySuccess(dateStr);
          completionMap.set(dateStr, isSuccess);
        }
      }

      setCompletions(completionMap);
    } catch (error) {
      console.error('Error fetching completions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date): DayCompletion[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: DayCompletion[] = [];
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // Add empty days for alignment
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ date: '', completed: false, isToday: false });
    }

    // Add actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const hasData = completions.has(dateStr);
      days.push({
        date: dateStr,
        completed: completions.get(dateStr) || false,
        isToday: dateStr === todayStr,
        hasData // Add this property to DayCompletion interface logic below
      });
    }

    return days;
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    const today = new Date();
    if (nextMonth <= today) {
      setCurrentDate(nextMonth);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const days = getDaysInMonth(currentDate);
  const canGoNext = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1) <= new Date();

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Activity Calendar</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPreviousMonth}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium min-w-[120px] text-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={goToNextMonth}
            disabled={!canGoNext}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.01 }}
            className={cn(
              "aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-200",
              day.date === '' && "invisible",
              // Today
              day.isToday && day.hasData && day.completed && "bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg scale-110 ring-2 ring-green-400",
              day.isToday && day.hasData && !day.completed && "bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg scale-110 ring-2 ring-red-400",
              day.isToday && !day.hasData && "bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-lg scale-110 ring-2 ring-blue-400",

              // Past days
              !day.isToday && day.hasData && day.completed && "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-700",
              !day.isToday && day.hasData && !day.completed && "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-700",
              !day.isToday && !day.hasData && day.date && "bg-muted/50 text-muted-foreground hover:bg-muted"
            )}
          >
            {day.date && new Date(day.date).getDate()}
          </motion.div>
        ))}
      </div>

      <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-br from-green-500 to-emerald-600"></div>
          <span className="text-xs text-muted-foreground">Success (&lt;1h/app)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-br from-red-500 to-rose-600"></div>
          <span className="text-xs text-muted-foreground">Limit Exceeded</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-muted/50"></div>
          <span className="text-xs text-muted-foreground">No Data</span>
        </div>
      </div>
    </Card>
  );
};
