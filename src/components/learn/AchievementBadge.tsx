import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Star, Trophy, Crown, Medal, Zap, Target, Flame, BookOpen, CheckCircle2 } from 'lucide-react';
import { BadgeType } from '@/types/learning';

interface AchievementBadgeProps {
  badgeType: BadgeType;
  title: string;
  description: string;
  icon: string;
  earnedAt?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  pointsReward: number;
}

interface BadgeCollectionProps {
  earnedBadges: AchievementBadgeProps[];
  availableBadges: AchievementBadgeProps[];
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  badgeType,
  title,
  description,
  icon,
  earnedAt,
  rarity,
  pointsReward,
}) => {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-500/50 bg-gray-500/5';
      case 'rare': return 'border-blue-500/50 bg-blue-500/5';
      case 'epic': return 'border-purple-500/50 bg-purple-500/5';
      case 'legendary': return 'border-yellow-500/50 bg-yellow-500/5';
      default: return 'border-gray-500/50 bg-gray-500/5';
    }
  };

  const getRarityBadgeColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'rare': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'epic': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'legendary': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const isEarned = !!earnedAt;

  return (
    <Card className={`border-2 transition-all duration-300 ${
      isEarned 
        ? `${getRarityColor(rarity)} hover:shadow-lg` 
        : 'opacity-50 grayscale'
    }`}>
      <CardContent className="p-4 text-center">
        <div className={`text-4xl mb-3 ${!isEarned ? 'grayscale' : ''}`}>
          {icon}
        </div>
        <h3 className="font-semibold text-sm mb-1">{title}</h3>
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {description}
        </p>
        <div className="flex flex-wrap justify-center gap-1 mb-3">
          <Badge variant="outline" className={`text-[10px] ${getRarityBadgeColor(rarity)}`}>
            {rarity.toUpperCase()}
          </Badge>
          <Badge variant="secondary" className="text-[10px]">
            +{pointsReward} pts
          </Badge>
        </div>
        {isEarned ? (
          <div className="space-y-2">
            <Badge variant="outline" className="text-green-400 border-green-500/30">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Earned
            </Badge>
            <div className="text-[10px] text-muted-foreground">
              {new Date(earnedAt).toLocaleDateString()}
            </div>
          </div>
        ) : (
          <Badge variant="secondary" className="text-muted-foreground">
            Not yet earned
          </Badge>
        )}
      </CardContent>
    </Card>
  );
};

export const defaultBadges: AchievementBadgeProps[] = [
  {
    badgeType: 'course_completion',
    title: 'First Course',
    description: 'Complete your first course',
    icon: '🎓',
    rarity: 'common',
    pointsReward: 50,
  },
  {
    badgeType: 'module_mastery',
    title: 'Perfect Score',
    description: 'Get 100% on a quiz',
    icon: '⭐',
    rarity: 'rare',
    pointsReward: 100,
  },
  {
    badgeType: 'streak_7',
    title: 'Week Warrior',
    description: 'Maintain a 7-day learning streak',
    icon: '🔥',
    rarity: 'rare',
    pointsReward: 150,
  },
  {
    badgeType: 'streak_30',
    title: 'Monthly Master',
    description: 'Maintain a 30-day learning streak',
    icon: '🔥🔥🔥',
    rarity: 'epic',
    pointsReward: 500,
  },
  {
    badgeType: 'perfect_quiz',
    title: 'Quiz Master',
    description: 'Get 5 perfect quiz scores',
    icon: '🧠',
    rarity: 'epic',
    pointsReward: 300,
  },
  {
    badgeType: 'early_adopter',
    title: 'Early Adopter',
    description: 'Joined FINHUBAFRICA in the first month',
    icon: '🚀',
    rarity: 'legendary',
    pointsReward: 1000,
  },
  {
    badgeType: 'mentor',
    title: 'Mentor',
    description: 'Help 10 other learners in the community',
    icon: '👨‍🏫',
    rarity: 'epic',
    pointsReward: 400,
  },
  {
    badgeType: 'community_contributor',
    title: 'Community Hero',
    description: 'Contribute to community discussions 50 times',
    icon: '💬',
    rarity: 'rare',
    pointsReward: 250,
  },
  {
    badgeType: 'african_trader',
    title: 'African Markets Expert',
    description: 'Complete all African Markets courses',
    icon: '🌍',
    rarity: 'epic',
    pointsReward: 600,
  },
  {
    badgeType: 'defi_specialist',
    title: 'DeFi Specialist',
    description: 'Complete all DeFi & Web3 courses',
    icon: '🏦',
    rarity: 'epic',
    pointsReward: 600,
  },
];

export const BadgeCollection: React.FC<BadgeCollectionProps> = ({
  earnedBadges,
  availableBadges,
}) => {
  return (
    <div className="space-y-6">
      {/* Earned Badges */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-400" />
          Your Badges ({earnedBadges.length})
        </h3>
        {earnedBadges.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {earnedBadges.map((badge, index) => (
              <AchievementBadge key={index} {...badge} />
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-2">
            <CardContent className="p-8 text-center">
              <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No badges yet</h3>
              <p className="text-sm text-muted-foreground">
                Complete courses and quizzes to earn badges
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Available Badges */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Star className="h-5 w-5 text-blue-400" />
          Available Badges ({availableBadges.length})
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {availableBadges.map((badge, index) => (
            <AchievementBadge key={index} {...badge} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AchievementBadge;