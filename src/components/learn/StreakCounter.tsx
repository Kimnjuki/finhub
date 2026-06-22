import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Flame, Calendar, TrendingUp, Target, Zap, Crown, Award } from 'lucide-react';

interface StreakCounterProps {
  currentStreak: number;
  longestStreak: number;
  streakMilestones: StreakMilestone[];
  lastActiveDate?: string;
  todayGoal: number;
  todayProgress: number;
}

interface StreakMilestone {
  days: number;
  reward: number;
  icon: string;
  title: string;
  description: string;
}

const StreakCounter: React.FC<StreakCounterProps> = ({
  currentStreak,
  longestStreak,
  streakMilestones,
  lastActiveDate,
  todayGoal,
  todayProgress,
}) => {
  const nextMilestone = streakMilestones.find(m => m.days > currentStreak) || streakMilestones[streakMilestones.length - 1];
  const currentMilestone = [...streakMilestones].reverse().find(m => m.days <= currentStreak) || streakMilestones[0];
  const progressToNext = Math.min(currentStreak / nextMilestone.days, 1);
  const daysRemaining = nextMilestone.days - currentStreak;

  const getStreakEmoji = (streak: number) => {
    if (streak >= 100) return '🔥🔥🔥';
    if (streak >= 30) return '🔥🔥';
    if (streak >= 7) return '🔥';
    if (streak >= 3) return '⭐';
    return '💪';
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return 'text-orange-400';
    if (streak >= 7) return 'text-yellow-400';
    if (streak >= 3) return 'text-blue-400';
    return 'text-muted-foreground';
  };

  const isStreakAtRisk = () => {
    if (!lastActiveDate) return false;
    const lastActive = new Date(lastActiveDate);
    const today = new Date();
    const diffTime = today.getTime() - lastActive.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 1 && diffDays < 2; // About to break
  };

  const todayProgressPercentage = (todayProgress / todayGoal) * 100;

  return (
    <div className="space-y-4">
      {/* Main Streak Card */}
      <Card className={`border-border/50 bg-gradient-to-br ${
        currentStreak >= 30 
          ? 'from-orange-500/10 to-red-500/10' 
          : currentStreak >= 7 
          ? 'from-yellow-500/10 to-orange-500/10'
          : 'from-muted/5 to-muted/10'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Flame className={`h-6 w-6 ${getStreakColor(currentStreak)}`} />
                <span className={`text-2xl font-bold ${getStreakColor(currentStreak)}`}>
                  {currentStreak}
                </span>
                <span className="text-sm font-normal text-muted-foreground">day streak</span>
              </CardTitle>
              <CardDescription className="mt-1">
                {getStreakEmoji(currentStreak)} Keep the momentum going!
              </CardDescription>
            </div>
            <Crown className={`h-6 w-6 ${currentStreak >= 7 ? 'text-yellow-400' : 'text-muted-foreground'}`} />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Streak Warning */}
          {isStreakAtRisk() && (
            <Card className="border-red-500/30 bg-red-500/5">
              <CardContent className="p-3 flex items-center gap-3">
                <Zap className="h-5 w-5 text-red-400 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-red-400">Streak at risk!</div>
                  <div className="text-xs text-muted-foreground">
                    Complete a lesson today to maintain your streak
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Progress to Next Milestone */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Target className="h-3 w-3" />
                Next milestone: {nextMilestone.title}
              </span>
              <span className="font-medium">
                {daysRemaining > 0 ? `${daysRemaining} days` : 'Reached!'}
              </span>
            </div>
            <Progress value={progressToNext * 100} className="h-2" />
            <div className="text-xs text-muted-foreground">
              Reward: +{nextMilestone.reward} points
            </div>
          </div>

          {/* Today's Goal */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Today's Goal
              </span>
              <span className="font-medium">
                {todayProgress}/{todayGoal} lessons
              </span>
            </div>
            <Progress value={todayProgressPercentage} className="h-2" />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-lg font-bold text-yellow-400">{longestStreak}</div>
              <div className="text-xs text-muted-foreground">Longest Streak</div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-lg font-bold text-purple-400">
                {streakMilestones.filter(m => currentStreak >= m.days).length}
              </div>
              <div className="text-xs text-muted-foreground">Milestones Met</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Streak Milestones */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Award className="h-4 w-4 text-yellow-400" />
            Streak Milestones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {streakMilestones.map((milestone, index) => {
              const achieved = currentStreak >= milestone.days;
              return (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-2 rounded-lg ${
                    achieved ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-muted/20'
                  }`}
                >
                  <div className={`text-2xl flex-shrink-0 ${achieved ? '' : 'grayscale opacity-50'}`}>
                    {milestone.icon}
                  </div>
                  <div className="flex-1">
                    <div className={`text-sm font-medium ${achieved ? 'text-yellow-400' : 'text-muted-foreground'}`}>
                      {milestone.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {milestone.days} day streak
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <Badge variant="secondary" className="text-xs">
                      +{milestone.reward} pts
                    </Badge>
                    {achieved && (
                      <Badge variant="outline" className="text-[10px] text-green-400 border-green-500/30 mt-1">
                        Earned
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Streak Tips */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Streak Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <TrendingUp className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
              <span>Complete at least one lesson per day to maintain your streak</span>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <span>Your streak resets if you miss a full day (24 hours)</span>
            </div>
            <div className="flex items-start gap-2">
              <Zap className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <span>Longer streaks earn bonus points and special badges</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const defaultStreakMilestones: StreakMilestone[] = [
  {
    days: 3,
    reward: 15,
    icon: '⭐',
    title: 'Consistent Learner',
    description: 'Completed 3 day streak',
  },
  {
    days: 7,
    reward: 50,
    icon: '🔥',
    title: 'Week Warrior',
    description: 'Completed 7 day streak',
  },
  {
    days: 14,
    reward: 150,
    icon: '🔥🔥',
    title: 'Two Week Champion',
    description: 'Completed 14 day streak',
  },
  {
    days: 30,
    reward: 500,
    icon: '🔥🔥🔥',
    title: 'Monthly Master',
    description: 'Completed 30 day streak',
  },
  {
    days: 60,
    reward: 1500,
    icon: '👑',
    title: 'Dedication King',
    description: 'Completed 60 day streak',
  },
  {
    days: 100,
    reward: 3000,
    icon: '🏆',
    title: 'Centurion',
    description: 'Completed 100 day streak',
  },
];

export default StreakCounter;