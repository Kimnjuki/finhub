import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { LearningPath } from '@/types/learning';
import { ChevronRight, Lock, CheckCircle2, Coins, Users, Clock, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LearningPathCardProps {
  path: LearningPath;
  progress: number;
  enrolledCount: number;
  isLocked: boolean;
  totalReward: number;
}

const LearningPathCard: React.FC<LearningPathCardProps> = ({
  path,
  progress,
  enrolledCount,
  isLocked,
  totalReward,
}) => {
  const navigate = useNavigate();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'Intermediate': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'Advanced': return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'Expert': return 'bg-red-500/10 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  const getLevelIcon = (level: number) => {
    const icons = ['🎓', '📈', '🚀', '🏦', '🌍', '🏆'];
    return icons[level - 1] || '📚';
  };

  return (
    <Card
      className={`border-border/30 transition-all duration-300 hover:shadow-lg cursor-pointer group ${
        isLocked ? 'opacity-60' : 'hover:border-blue-500/30 hover:shadow-blue-500/10'
      }`}
      onClick={() => !isLocked && navigate(`/learn?path=${path.id}`)}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="text-4xl flex-shrink-0">{path.icon || getLevelIcon(path.level)}</div>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h3 className="font-semibold text-lg group-hover:text-blue-400 transition-colors">
                  {path.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className={`text-[10px] ${getDifficultyColor(path.difficulty)}`}>
                    {path.difficulty}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    Level {path.level}
                  </Badge>
                </div>
              </div>
              {isLocked ? (
                <Lock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              ) : progress === 100 ? (
                <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />
              ) : (
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-blue-400 transition-colors flex-shrink-0" />
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {path.description}
            </p>

            {/* Stats */}
            <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                {path.totalCourses} courses
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {path.estimatedDuration}
              </span>
              <span className="flex items-center gap-1">
                <Coins className="h-3 w-3" />
                Earn ${totalReward}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {enrolledCount.toLocaleString()}
              </span>
            </div>

            {/* Progress */}
            {!isLocked && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {/* Skills */}
            <div className="flex flex-wrap gap-1 mt-4">
              {path.skills.slice(0, 3).map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-[10px]">
                  {skill}
                </Badge>
              ))}
              {path.skills.length > 3 && (
                <Badge variant="secondary" className="text-[10px]">
                  +{path.skills.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LearningPathCard;