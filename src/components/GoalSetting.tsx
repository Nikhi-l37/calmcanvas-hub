import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Save, Clock, Calendar, Trophy } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';

interface Goal {
  dailyLimit: number; // in minutes
  weeklyTarget: number; // percentage reduction from current
  breakFrequency: number; // minutes between breaks
}

interface GoalSettingProps {
  currentGoals: Goal;
  onUpdateGoals: (goals: Goal) => void;
  currentUsage: number; // current daily average in minutes
}

export const GoalSetting = ({ currentGoals, onUpdateGoals, currentUsage }: GoalSettingProps) => {
  const [goals, setGoals] = useState<Goal>(currentGoals);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    onUpdateGoals(goals);
    setIsEditing(false);
    toast({
      title: "Goals Updated!",
      description: "Your new screen time goals have been saved.",
    });
  };

  const getRecommendedGoals = (): Goal => {
    return {
      dailyLimit: Math.max(Math.round(currentUsage * 0.8), 30), // 20% reduction
      weeklyTarget: 15, // 15% weekly reduction
      breakFrequency: 25 // 25-minute intervals
    };
  };

  const useRecommended = () => {
    const recommended = getRecommendedGoals();
    setGoals(recommended);
  };

  const calculateWeeklyReduction = () => {
    const currentWeekly = currentUsage * 7;
    const newWeekly = goals.dailyLimit * 7;
    return Math.round(((currentWeekly - newWeekly) / currentWeekly) * 100);
  };

  return (
    <Card className="p-6 bg-gradient-surface border-border/50">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-semibold">Screen Time Goals</h3>
          </div>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
              Edit Goals
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleSave} size="sm">
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
              <Button 
                onClick={() => setIsEditing(false)} 
                variant="outline" 
                size="sm"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>

        {!isEditing ? (
          /* Display Mode */
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-muted/20 rounded-lg"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Daily Limit</span>
                </div>
                <div className="text-2xl font-bold">{goals.dailyLimit}min</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-4 bg-muted/20 rounded-lg"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium">Weekly Target</span>
                </div>
                <div className="text-2xl font-bold">{goals.weeklyTarget}%</div>
                <div className="text-xs text-muted-foreground">reduction</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-4 bg-muted/20 rounded-lg"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-4 h-4 text-warning" />
                  <span className="text-sm font-medium">Break Every</span>
                </div>
                <div className="text-2xl font-bold">{goals.breakFrequency}min</div>
              </motion.div>
            </div>

            <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Your current daily average is <strong>{currentUsage} minutes</strong>. 
                With your goal of <strong>{goals.dailyLimit} minutes</strong>, you're aiming for a{' '}
                <Badge variant="secondary" className="mx-1">
                  {calculateWeeklyReduction()}% reduction
                </Badge>
                this week.
              </p>
            </div>
          </div>
        ) : (
          /* Edit Mode */
          <div className="space-y-6">
            <div className="flex justify-end">
              <Button onClick={useRecommended} variant="outline" size="sm">
                Use Recommended
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="daily-limit">Daily Time Limit (minutes)</Label>
                <div className="mt-2 space-y-2">
                  <Slider
                    value={[goals.dailyLimit]}
                    onValueChange={(value) => setGoals(prev => ({ ...prev, dailyLimit: value[0] }))}
                    max={180}
                    min={15}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>15 min</span>
                    <span className="font-medium">{goals.dailyLimit} minutes</span>
                    <span>3 hours</span>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="weekly-target">Weekly Reduction Target (%)</Label>
                <div className="mt-2 space-y-2">
                  <Slider
                    value={[goals.weeklyTarget]}
                    onValueChange={(value) => setGoals(prev => ({ ...prev, weeklyTarget: value[0] }))}
                    max={50}
                    min={5}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>5%</span>
                    <span className="font-medium">{goals.weeklyTarget}% reduction</span>
                    <span>50%</span>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="break-frequency">Break Reminder Frequency (minutes)</Label>
                <div className="mt-2 space-y-2">
                  <Slider
                    value={[goals.breakFrequency]}
                    onValueChange={(value) => setGoals(prev => ({ ...prev, breakFrequency: value[0] }))}
                    max={60}
                    min={15}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>15 min</span>
                    <span className="font-medium">Every {goals.breakFrequency} minutes</span>
                    <span>60 min</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <p className="text-sm">
                <strong>Preview:</strong> With a {goals.dailyLimit}-minute daily limit, you'll reduce 
                your screen time by approximately {calculateWeeklyReduction()}% from your current usage.
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};