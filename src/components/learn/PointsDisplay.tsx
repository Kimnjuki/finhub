import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Coins, TrendingUp, Award, Zap, Star, Crown } from 'lucide-react';

interface PointsDisplayProps {
  totalPointsEarned: number;
  currentStreak: number;
  longestStreak: number;
  coursesCompleted: number;
  certificatesEarned: number;
  nextMilestone: number;
  level: number;
}

const PointsDisplay: React.FC<PointsDisplayProps> = ({
  totalPointsEarned,
  currentStreak,
  longestStreak,
  coursesCompleted,
  certificatesEarned,
  nextMilestone,
  level,
}) => {
  const progressPercentage = (totalPointsEarned / nextMilestone) * 100;
  const pointsRemaining = Math.max(0, nextMilestone - totalPointsEarned);

  const getLevelTitle = (level: number) => {
    switch (level) {
      case 1: return 'Novice Learner';
      case 2: return 'Apprentice';
      case 3: return 'Scholar';
      case 4: return 'Expert';
      case 5: return 'Master';
      case 6: return 'Grandmaster';
      default: return 'Learner';
    }
  };

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'text-gray-400';
      case 2: return 'text-green-400';
      case 3: return 'text-blue-400';
      case 4: return 'text-purple-400';
      case 5: return 'text-yellow-400';
      case 6: return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Points Card */}
      <Card className="border-border/50 bg-gradient-to-br from-yellow-500/5 to-orange-500/5">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Coins className="h-5 w-5 text-yellow-400" />
                <span className="text-yellow-400">{totalPointsEarned.toLocaleString()}</span>
                <span className="text-sm font-normal text-muted-foreground">points</span>
              </CardTitle>
              <CardDescription className="mt-1">
                Level {level} • {getLevelTitle(level)}
              </CardDescription>
            </div>
            <div className={`text-2xl font-bold ${getLevelColor(level)}`}>
              {level < 6 && <Crown className="h-6 w-6" />}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress to Next Level */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {level < 6 
                  ? `${pointsRemaining.toLocaleString()} points to Level ${level + 1}`
                  : 'Maximum level reached!'
                }
              </span>
              <span className="font-medium">
                {nextMilestone.toLocaleString()}
              </span>
            </div>
            <Progress value={Math.min(progressPercentage, 100)} className="h-2" />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-center gap-1 text-orange-400 mb-1">
                <Zap className="h-4 w-4" />
              </div>
              <div className="text-lg font-bold">{currentStreak}</div>
              <div className="text-xs text-muted-foreground">Day Streak</div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-center gap-1 text-blue-400 mb-1">
                <Award className="h-4 w-4" />
              </div>
              <div className="text-lg font-bold">{coursesCompleted}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-center gap-1 text-yellow-400 mb-1">
                <Star className="h-4 w-4" />
              </div>
              <div className="text-lg font-bold">{certificatesEarned}</div>
              <div className="text-xs text-muted-foreground">Certificates</div>
            </div>
          </div>

          {/* Streak Info */}
          <div className="flex items-center justify-between p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-400" />
              <span className="text-sm">
                Longest streak: <span className="font-bold text-orange-400">{longestStreak} days</span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How to Earn Points */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">How to Earn Points</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Complete a lesson</span>
              <Badge variant="secondary" className="text-xs">+5 pts</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Pass a quiz</span>
              <Badge variant="secondary" className="text-xs">+10 pts</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Perfect quiz score</span>
              <Badge variant="secondary" className="text-xs">+15 pts</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Complete a course</span>
              <Badge variant="secondary" className="text-xs">+50 pts</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Daily login streak</span>
              <Badge variant="secondary" className="text-xs">+2 pts/day</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Earn a certificate</span>
              <Badge variant="secondary" className="text-xs">+100 pts</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PointsDisplay;