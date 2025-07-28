export interface MotivationalMessage {
  id: string;
  type: 'goal_achieved' | 'streak' | 'improvement' | 'daily_tip' | 'milestone';
  title: string;
  message: string;
  icon: string;
  category: 'encouragement' | 'tip' | 'achievement' | 'guidance';
}

export const motivationalMessages: MotivationalMessage[] = [
  // Goal achieved messages
  {
    id: 'goal_1',
    type: 'goal_achieved',
    title: 'Daily Goal Achieved!',
    message: 'You successfully stayed within your screen time limit today. Keep up the great work!',
    icon: 'Target',
    category: 'achievement'
  },
  {
    id: 'goal_2',
    type: 'goal_achieved',
    title: 'Perfect Balance!',
    message: 'You maintained a healthy balance between screen time and breaks today.',
    icon: 'Scale',
    category: 'achievement'
  },
  
  // Streak messages
  {
    id: 'streak_1',
    type: 'streak',
    title: '3-Day Streak!',
    message: 'You\'re building great habits! Three days of healthy screen time management.',
    icon: 'Flame',
    category: 'encouragement'
  },
  {
    id: 'streak_2',
    type: 'streak',
    title: 'Week Champion!',
    message: 'Amazing! You\'ve maintained healthy screen habits for a full week!',
    icon: 'Trophy',
    category: 'achievement'
  },
  
  // Improvement messages
  {
    id: 'improve_1',
    type: 'improvement',
    title: 'Great Progress!',
    message: 'You reduced your screen time by 15% compared to yesterday. Small steps lead to big changes!',
    icon: 'TrendingDown',
    category: 'encouragement'
  },
  {
    id: 'improve_2',
    type: 'improvement',
    title: 'Consistency Pays Off!',
    message: 'Your average daily screen time this week is lower than last week. Keep it up!',
    icon: 'LineChart',
    category: 'encouragement'
  },
  
  // Daily tips
  {
    id: 'tip_1',
    type: 'daily_tip',
    title: 'Break Activity Tip',
    message: 'Try the 20-20-20 rule: Every 20 minutes, look at something 20 feet away for 20 seconds.',
    icon: 'Eye',
    category: 'tip'
  },
  {
    id: 'tip_2',
    type: 'daily_tip',
    title: 'Posture Reminder',
    message: 'Remember to sit up straight and keep your screen at eye level to avoid neck strain.',
    icon: 'User',
    category: 'tip'
  },
  {
    id: 'tip_3',
    type: 'daily_tip',
    title: 'Hydration Check',
    message: 'Don\'t forget to stay hydrated! Keep a water bottle nearby during screen time.',
    icon: 'Droplets',
    category: 'tip'
  },
  {
    id: 'tip_4',
    type: 'daily_tip',
    title: 'Movement Matters',
    message: 'Stand up and stretch for 2-3 minutes between apps to keep your body active.',
    icon: 'Activity',
    category: 'tip'
  },
  
  // Milestone messages
  {
    id: 'milestone_1',
    type: 'milestone',
    title: 'First Week Complete!',
    message: 'Congratulations on completing your first week with Screen Coach!',
    icon: 'Calendar',
    category: 'achievement'
  },
  {
    id: 'milestone_2',
    type: 'milestone',
    title: '100 Breaks Taken!',
    message: 'You\'ve taken 100 healthy breaks! Your eyes and body thank you.',
    icon: 'Coffee',
    category: 'achievement'
  }
];

export const getMotivationalMessage = (type: MotivationalMessage['type'], context?: any): MotivationalMessage | null => {
  const messages = motivationalMessages.filter(msg => msg.type === type);
  if (messages.length === 0) return null;
  
  // For streaks, customize the message based on actual streak count
  if (type === 'streak' && context?.streak) {
    const streak = context.streak;
    if (streak === 3) {
      return messages.find(msg => msg.id === 'streak_1') || messages[0];
    } else if (streak >= 7) {
      return messages.find(msg => msg.id === 'streak_2') || messages[0];
    }
  }
  
  // Return random message for the type
  return messages[Math.floor(Math.random() * messages.length)];
};

export const getDailyTip = (): MotivationalMessage => {
  const tips = motivationalMessages.filter(msg => msg.type === 'daily_tip');
  return tips[Math.floor(Math.random() * tips.length)];
};