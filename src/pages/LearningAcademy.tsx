import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  GraduationCap, BookOpen, Award, Trophy, Star, Search, Play, CheckCircle, Lock, TrendingUp,
  Clock, DollarSign, ChevronRight, Sparkles, Zap, Brain, BookMarked, BarChart3, Shield,
  Wallet, Coins, Gem, Users, Flame, Target, Crown, Medal, ArrowUpRight, Globe, CheckCircle2,
  LayoutDashboard, Medal as MedalIcon, FileText, Code, Activity
} from 'lucide-react';
import { learningPaths, courses, getCourseById, getCoursesByPath, getPathById } from '@/data/curriculumData';
import { getLessonsForCourse } from '@/data/lessonsData';
import { UserProgress } from '@/types/learning';
import { useAuth } from '@/hooks/useAuth';
import LessonViewer from '@/components/learn/LessonViewer';
import QuizEngine from '@/components/learn/QuizEngine';
import PaperTradingSimulation from '@/components/learn/PaperTradingSimulation';
import PointsDisplay from '@/components/learn/PointsDisplay';
import StreakCounter from '@/components/learn/StreakCounter';
import AchievementBadge, { defaultBadges, BadgeCollection } from '@/components/learn/AchievementBadge';
import { defaultStreakMilestones } from '@/components/learn/StreakCounter';

const LearningAcademy: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('paths');
  const [selectedPathId, setSelectedPathId] = useState<string | null>(searchParams.get('path'));
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [courseLessons, setCourseLessons] = useState<any[]>([]);
  const [showCertificates, setShowCertificates] = useState(false);
  const [showGamification, setShowGamification] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  const [activeSimulation, setActiveSimulation] = useState<any>(null);
 
   // Simulate user progress from auth context
  const [userProgress, setUserProgress] = useState<UserProgress>({
    userId: user?.id || '',
    enrolledCourses: [],
    completedLessons: [],
    completedCourses: [],
    quizAttempts: [],
    certificates: [],
    totalPointsEarned: 42,
    currentStreak: 5,
    longestStreak: 12,
    lastActiveDate: new Date().toISOString(),
    learningPathProgress: {
      'path-1': 15,
      'path-2': 0,
      'path-3': 0,
      'path-4': 0,
      'path-5': 0,
      'path-6': 0,
    },
    skillLevels: {},
  });

  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  // Calculate enrolled count (simulate based on course data)
  const getEnrolledCount = (courseId: string): number => {
    const course = getCourseById(courseId);
    if (!course) return 0;
    return Math.floor(course.enrollmentCount * (0.8 + Math.random() * 0.4));
  };

  const getPathEnrolledCount = (pathId: string): number => {
    const pathCourses = getCoursesByPath(pathId);
    return pathCourses.reduce((sum, c) => sum + getEnrolledCount(c.id), 0);
  };

  const getPathProgress = (pathId: string): number => {
    return userProgress.learningPathProgress[pathId] || 0;
  };

  const getTotalRewardForPath = (pathId: string): number => {
    const pathCourses = getCoursesByPath(pathId);
    return pathCourses.reduce((sum, c) => sum + c.reward, 0);
  };

  const isPathLocked = (path: typeof learningPaths[0]): boolean => {
    if (!path.prerequisites || path.prerequisites.length === 0) return false;
    return path.prerequisites.some(preReqId => getPathProgress(preReqId) < 50);
  };

  const getPathCompletionPercentage = (pathId: string): number => {
    const pathCourses = getCoursesByPath(pathId);
    if (pathCourses.length === 0) return 0;
    const completedCount = pathCourses.filter(c => 
      userProgress.completedCourses.includes(c.id)
    ).length;
    return Math.floor((completedCount / pathCourses.length) * 100);
  };

  const handleLessonComplete = (lessonId: string) => {
    setCompletedLessons(prev => {
      const next = new Set([...prev, lessonId]);
      setUserProgress(prev => {
        const newPoints = prev.totalPointsEarned + 5;
        const updated = {
          ...prev,
          totalPointsEarned: newPoints,
          lastActiveDate: new Date().toISOString(),
        };
        if (selectedCourseId && courseLessons.length > 0) {
          const allDone = courseLessons.every(l => next.has(l.id));
          if (allDone && !prev.completedCourses.includes(selectedCourseId)) {
            updated.completedCourses = [...prev.completedCourses, selectedCourseId];
            updated.totalPointsEarned = newPoints + 50;
            if (selectedCourse) {
              const pathId = selectedCourse.learningPathId;
              const pathCourses = getCoursesByPath(pathId);
              const completedInPath = pathCourses.filter(c => updated.completedCourses.includes(c.id)).length;
              updated.learningPathProgress = {
                ...prev.learningPathProgress,
                [pathId]: Math.floor((completedInPath / pathCourses.length) * 100),
              };
              if (completedInPath === pathCourses.length && !prev.certificates.includes(pathId)) {
                updated.certificates = [...prev.certificates, pathId];
                updated.totalPointsEarned += 100;
              }
            }
          }
        }
        return updated;
      });
      return next;
    });
  };

  const handleQuizComplete = (score: number, passed: boolean, timeSpent: number) => {
    if (passed) {
      setUserProgress(prev => ({
        ...prev,
        totalPointsEarned: prev.totalPointsEarned + 10,
        quizAttempts: [...prev.quizAttempts, {
          quizId: 'quiz-1',
          score,
          passed,
          timeSpent,
          answers: {},
          completedAt: new Date().toISOString(),
        }],
      }));
    }
    setActiveQuiz(null);
  };

  const handleSimulationComplete = (profitLoss: number, trades: number) => {
    if (profitLoss > 0) {
      setUserProgress(prev => ({
        ...prev,
        totalPointsEarned: prev.totalPointsEarned + 20,
      }));
    }
    setActiveSimulation(null);
  };

  const handleStartQuiz = (quiz: any) => {
    setActiveQuiz(quiz);
  };

  // Filter paths based on search
  const filteredPaths = useMemo(() => {
    if (!search) return learningPaths;
    const searchLower = search.toLowerCase();
    return learningPaths.filter(path => 
      path.title.toLowerCase().includes(searchLower) ||
      path.description.toLowerCase().includes(searchLower) ||
      path.skills.some(skill => skill.toLowerCase().includes(searchLower))
    );
  }, [search]);

  // Filter courses based on search and selected path
  const filteredCourses = useMemo(() => {
    let coursesToFilter = selectedPathId 
      ? getCoursesByPath(selectedPathId)
      : courses;

    if (search) {
      const searchLower = search.toLowerCase();
      coursesToFilter = coursesToFilter.filter(course =>
        course.title.toLowerCase().includes(searchLower) ||
        course.description.toLowerCase().includes(searchLower) ||
        course.skills.some(skill => skill.toLowerCase().includes(searchLower)) ||
        course.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    return coursesToFilter;
  }, [search, selectedPathId]);

  const selectedCourse = useMemo(() => 
    selectedCourseId ? getCourseById(selectedCourseId) : null,
    [selectedCourseId]
  );

  const selectedPath = useMemo(() =>
    selectedPathId ? getPathById(selectedPathId) : null,
    [selectedPathId]
  );

  // Handle path selection from URL params
  useEffect(() => {
    if (selectedPathId) {
      setActiveTab('courses');
    }
  }, [selectedPathId]);

  // Load lessons when course is selected
  useEffect(() => {
    if (selectedCourseId && selectedCourse) {
      const lessons = getLessonsForCourse(selectedCourseId, selectedCourse.title);
      setCourseLessons(lessons);
    }
  }, [selectedCourseId, selectedCourse]);

  const currentLessonIndex = useMemo(() => {
    if (!activeLessonId || courseLessons.length === 0) return -1;
    return courseLessons.findIndex(l => l.id === activeLessonId);
  }, [activeLessonId, courseLessons]);

  const level = Math.min(6, Math.floor(userProgress.totalPointsEarned / 100) + 1);
  const nextLevelPoints = level * 100;

  return (
    <>
      <SEOHead 
        title="Learning Academy - Free Crypto & Trading Education | FINHUBAFRICA"
        description="Master cryptocurrency trading with FINHUBAFRICA's world-class learning platform. 30+ courses, interactive quizzes, certifications, and earn rewards while you learn."
      />
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-border/40">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/5 to-green-500/10" />
          <div className="container mx-auto px-4 py-16 relative">
            <div className="text-center max-w-4xl mx-auto">
              <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30 mb-4 px-4 py-1.5">
                <GraduationCap className="h-4 w-4 mr-1" /> Africa's #1 Learning Platform
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold mb-6">
                Learn Crypto.{' '}
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Master Trading.
                </span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                From complete beginner to professional trader. 150+ courses, interactive simulations, 
                certifications, and earn crypto rewards while you learn.
              </p>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Card className="border-blue-500/20 bg-blue-500/5">
                  <CardContent className="p-4 text-center">
                    <BookOpen className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-400">150+</div>
                    <div className="text-xs text-muted-foreground">Courses</div>
                  </CardContent>
                </Card>
                <Card className="border-purple-500/20 bg-purple-500/5">
                  <CardContent className="p-4 text-center">
                    <Trophy className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-400">6</div>
                    <div className="text-xs text-muted-foreground">Certifications</div>
                  </CardContent>
                </Card>
                <Card className="border-green-500/20 bg-green-500/5">
                  <CardContent className="p-4 text-center">
                    <Users className="h-6 w-6 text-green-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-400">50K+</div>
                    <div className="text-xs text-muted-foreground">Active Learners</div>
                  </CardContent>
                </Card>
                <Card className="border-yellow-500/20 bg-yellow-500/5">
                  <CardContent className="p-4 text-center">
                    <Coins className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-yellow-400">$500K+</div>
                    <div className="text-xs text-muted-foreground">Rewards Paid</div>
                  </CardContent>
                </Card>
              </div>

              {/* User Progress Summary */}
              <div className="flex flex-wrap justify-center gap-4">
                <Card className="border-orange-500/20 bg-orange-500/5">
                  <CardContent className="p-3 flex items-center gap-3">
                    <Flame className="h-5 w-5 text-orange-400" />
                    <div className="text-left">
                      <div className="text-sm font-medium text-orange-400">{userProgress.currentStreak} Day Streak</div>
                      <div className="text-[10px] text-muted-foreground">Keep learning!</div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-cyan-500/20 bg-cyan-500/5">
                  <CardContent className="p-3 flex items-center gap-3">
                    <Target className="h-5 w-5 text-cyan-400" />
                    <div className="text-left">
                      <div className="text-sm font-medium text-cyan-400">{userProgress.totalPointsEarned} Points</div>
                      <div className="text-[10px] text-muted-foreground">Total earned</div>
                    </div>
                  </CardContent>
                </Card>
                {userProgress.certificates.length > 0 && (
                  <Card className="border-yellow-500/20 bg-yellow-500/5">
                    <CardContent className="p-3 flex items-center gap-3">
                      <Crown className="h-5 w-5 text-yellow-400" />
                      <div className="text-left">
                        <div className="text-sm font-medium text-yellow-400">{userProgress.certificates.length} Certificates</div>
                        <div className="text-[10px] text-muted-foreground">Achieved</div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowGamification(true)}
                  className="gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  View Achievements
                </Button>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          {/* Search & Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search courses, paths, skills..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Breadcrumb Navigation */}
            {(selectedPath || selectedCourse) && (
              <div className="flex items-center gap-2 text-sm">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setSelectedPathId(null);
                    setSelectedCourseId(null);
                    window.history.pushState({}, '', '/learn');
                  }}
                >
                  All Paths
                </Button>
                {selectedPath && (
                  <>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{selectedPath.title}</span>
                  </>
                )}
                {selectedCourse && (
                  <>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{selectedCourse.title}</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="mb-6">
              <TabsTrigger value="paths" className="gap-2">
                <Globe className="h-4 w-4" />
                Learning Paths
              </TabsTrigger>
              <TabsTrigger value="courses" className="gap-2">
                <BookOpen className="h-4 w-4" />
                All Courses
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="gap-2">
                <Trophy className="h-4 w-4" />
                Leaderboard
              </TabsTrigger>
              <TabsTrigger value="certificates" className="gap-2">
                <Award className="h-4 w-4" />
                Certificates
              </TabsTrigger>
              <TabsTrigger value="gamification" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Achievements
              </TabsTrigger>
            </TabsList>

            {/* Learning Paths Tab */}
            <TabsContent value="paths" className="space-y-4">
              {!selectedPathId && (
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">Choose Your Learning Path</h2>
                  <p className="text-muted-foreground">
                    Follow a structured path from beginner to expert. Each path builds on the previous one.
                  </p>
                </div>
              )}

              {selectedPathId && !selectedCourseId && (
                <div className="mb-6">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedPathId(null)}
                    className="mb-4"
                  >
                    ← Back to all paths
                  </Button>
                  <div className="flex items-start gap-4">
                    <div className="text-5xl">{selectedPath?.icon}</div>
                    <div>
                      <h2 className="text-3xl font-bold mb-2">{selectedPath?.title}</h2>
                      <p className="text-muted-foreground mb-4">{selectedPath?.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <Badge variant="outline" className="text-xs">
                          {selectedPath?.difficulty}
                        </Badge>
                        <span className="text-muted-foreground">
                          {selectedPath?.totalCourses} courses • {selectedPath?.estimatedDuration}
                        </span>
                        <span className="flex items-center gap-1 text-green-400">
                          <Coins className="h-3 w-3" />
                          Earn up to ${getTotalRewardForPath(selectedPathId)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                {(selectedPathId
                  ? [getPathById(selectedPathId)].filter(Boolean)
                  : filteredPaths
                ).map((path) => path && (
                  <Card 
                    key={path.id} 
                    className={`border-border/30 transition-all duration-300 hover:shadow-lg cursor-pointer group ${
                      selectedPathId === path.id 
                        ? 'border-blue-500/30 ring-1 ring-blue-500/30' 
                        : 'hover:border-blue-500/30 hover:shadow-blue-500/10'
                    }`}
                    onClick={() => {
                      if (selectedPathId === path.id) {
                        setSelectedPathId(null);
                        window.history.pushState({}, '', '/learn');
                      } else {
                        setSelectedPathId(path.id);
                        setSelectedCourseId(null);
                        window.history.pushState({}, '', `/learn?path=${path.id}`);
                      }
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="text-4xl flex-shrink-0">{path.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <h3 className="font-semibold text-lg group-hover:text-blue-400 transition-colors">
                                {path.title}
                              </h3>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <Badge variant="outline" className={`text-[10px]`}>
                                  {path.difficulty}
                                </Badge>
                                <Badge variant="outline" className="text-[10px]">
                                  Level {path.level}
                                </Badge>
                                {isPathLocked(path) && (
                                  <Badge variant="secondary" className="text-[10px]">
                                    <Lock className="h-3 w-3 mr-0.5" />
                                    Locked
                                  </Badge>
                                )}
                              </div>
                            </div>
                            {getPathProgress(path.id) === 100 && (
                              <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />
                            )}
                          </div>

                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {path.description}
                          </p>

                          <div className="flex flex-wrap gap-2 mb-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              {path.totalCourses} courses
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {path.estimatedDuration}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-green-400">
                              <Coins className="h-3 w-3" />
                              ${getTotalRewardForPath(path.id)}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {getPathEnrolledCount(path.id).toLocaleString()}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {path.skills.slice(0, 4).map((skill, index) => (
                              <Badge key={index} variant="secondary" className="text-[10px]">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Courses Tab */}
            <TabsContent value="courses" className="space-y-4">
              {selectedPath && (
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">{selectedPath.title} - Courses</h2>
                  <p className="text-muted-foreground">
                    {selectedPath.description}
                  </p>
                </div>
              )}

              {/* Course Detail View */}
              {selectedCourse && !activeLessonId && (
                <Card className="border-border/50 mb-6">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="text-5xl">{selectedCourse.icon}</div>
                      <div className="flex-1">
                        <CardTitle className="text-2xl mb-2">{selectedCourse.title}</CardTitle>
                        <CardDescription className="text-base mb-4">
                          {selectedCourse.description}
                        </CardDescription>
                        <div className="flex flex-wrap gap-3">
                          <Badge variant="outline">
                            {selectedCourse.difficulty}
                          </Badge>
                          <span className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {selectedCourse.duration}
                          </span>
                          <span className="flex items-center gap-1 text-sm text-green-400">
                            <Coins className="h-4 w-4" />
                            Earn ${selectedCourse.reward}
                          </span>
                          <span className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Users className="h-4 w-4" />
                            {getEnrolledCount(selectedCourse.id).toLocaleString()} enrolled
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                      <Card className="border-border/50">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-blue-400">{selectedCourse.estimatedHours}h</div>
                          <div className="text-xs text-muted-foreground">Total Duration</div>
                        </CardContent>
                      </Card>
                      <Card className="border-border/50">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-green-400">{selectedCourse.completionRate}%</div>
                          <div className="text-xs text-muted-foreground">Completion Rate</div>
                        </CardContent>
                      </Card>
                      <Card className="border-border/50">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-yellow-400 flex items-center justify-center gap-1">
                            <Star className="h-5 w-5 fill-current" />
                            {selectedCourse.rating}
                          </div>
                          <div className="text-xs text-muted-foreground">Rating</div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="mb-4">
                      <h3 className="font-semibold mb-3">Skills You'll Learn</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedCourse.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button 
                        size="lg" 
                        className="flex-1 gap-2"
                        onClick={() => {
                          const lessons = getLessonsForCourse(selectedCourse.id, selectedCourse.title);
                          setCourseLessons(lessons);
                          if (lessons.length > 0) {
                            setActiveLessonId(lessons[0].id);
                          }
                        }}
                      >
                        <Play className="h-5 w-5" />
                        Start Learning
                      </Button>
                      {selectedCourse.simulation && (
                        <Button 
                          size="lg" 
                          variant="outline"
                          className="gap-2"
                          onClick={() => setActiveSimulation(selectedCourse.simulation)}
                        >
                          <Activity className="h-5 w-5" />
                          Try Simulation
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Lesson Viewer */}
              {selectedCourse && activeLessonId && (
                <div className="mb-6">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setActiveLessonId(null)}
                    className="mb-4"
                  >
                    ← Back to course
                  </Button>
                  <LessonViewer
                    lesson={{
                      id: activeLessonId,
                      courseId: selectedCourse.id,
                      order: 1,
                      title: 'Introduction to the Course',
                      type: 'article',
                      duration: '10 min',
                      content: {
                        textContent: `Welcome to ${selectedCourse.title}!\n\nThis comprehensive course will teach you everything you need to know about ${selectedCourse.title.toLowerCase()}.\n\nIn this lesson, we'll cover the fundamental concepts and prepare you for the advanced topics ahead.`,
                        resources: [
                          { title: 'Official Documentation', url: '#', type: 'documentation' },
                          { title: 'Related Video', url: '#', type: 'video' },
                        ]
                      },
                      objectives: ['Understand basic concepts', 'Learn key terminology', 'Apply foundational knowledge'],
                      keyTakeaways: ['Key concept 1', 'Key concept 2', 'Key concept 3'],
                      isLocked: false,
                      isCompleted: completedLessons.has(activeLessonId),
                      hasQuiz: true,
                      quiz: {
                        id: 'quiz-1',
                        lessonId: activeLessonId,
                        passingScore: 70,
                        timeLimit: 300,
                        points: 10,
                        questions: [
                          {
                            id: 'q1',
                            type: 'mcq',
                            question: 'What is the primary focus of this course?',
                            options: ['Option A', 'Option B', 'Option C', 'Option D'],
                            correctAnswer: 'Option A',
                            explanation: 'This is the correct answer because...',
                            points: 10,
                          }
                        ],
                        attempts: 0,
                        bestScore: 0,
                      }
                    }}
                    courseTitle={selectedCourse.title}
                    onComplete={() => handleLessonComplete(activeLessonId)}
                    onNext={() => {}}
                    hasNext={false}
                    isCompleted={completedLessons.has(activeLessonId)}
                    isLocked={false}
                  />
                </div>
              )}

              {/* Course List */}
              <div className="space-y-4">
                {filteredCourses.map((course) => {
                  const path = getPathById(course.learningPathId);
                  const progress = userProgress.completedCourses.includes(course.id) ? 100 : 0;

                  return (
                    <Card 
                      key={course.id}
                      className="border-border/30 transition-all duration-300 hover:shadow-lg hover:border-blue-500/30 cursor-pointer group"
                      onClick={() => {
                        setSelectedCourseId(course.id);
                        setActiveLessonId(null);
                      }}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="text-3xl flex-shrink-0">{course.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <h3 className="font-semibold text-lg group-hover:text-blue-400 transition-colors">
                                  {course.title}
                                  {selectedCourseId === course.id && !activeLessonId && (
                                    <Badge variant="secondary" className="ml-2 text-[10px]">
                                      Viewing
                                    </Badge>
                                  )}
                                </h3>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  <Badge variant="outline" className={`text-[10px] ${
                                    course.difficulty === 'Beginner' ? 'border-green-500/30 text-green-400' :
                                    course.difficulty === 'Intermediate' ? 'border-yellow-500/30 text-yellow-400' :
                                    course.difficulty === 'Advanced' ? 'border-orange-500/30 text-orange-400' :
                                    'border-red-500/30 text-red-400'
                                  }`}>
                                    {course.difficulty}
                                  </Badge>
                                  <Badge variant="outline" className="text-[10px]">
                                    {path?.title}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 text-yellow-400">
                                <Star className="h-4 w-4 fill-current" />
                                <span className="text-sm font-medium">{course.rating}</span>
                              </div>
                            </div>

                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                              {course.description}
                            </p>

                            <div className="flex flex-wrap items-center gap-3 mb-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {course.duration}
                              </span>
                              <span className="flex items-center gap-1 text-green-400">
                                <DollarSign className="h-3 w-3" />
                                Earn ${course.reward}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {getEnrolledCount(course.id).toLocaleString()} enrolled
                              </span>
                              <span className="flex items-center gap-1">
                                <BarChart3 className="h-3 w-3" />
                                {course.completionRate}% completion
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-1">
                              {course.skills.slice(0, 3).map((skill, index) => (
                                <Badge key={index} variant="secondary" className="text-[10px]">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {filteredCourses.length === 0 && (
                <Card className="border-dashed border-2">
                  <CardContent className="p-12 text-center">
                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No courses found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search terms or browse all courses
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Leaderboard Tab */}
            <TabsContent value="leaderboard" className="space-y-4">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Top Learners</h2>
                <p className="text-muted-foreground">
                  See who's leading the learning revolution in Africa
                </p>
              </div>

              <Card className="border-border/30">
                <CardContent className="p-0">
                  <div className="divide-y divide-border/30">
                    {[
                      { rank: 1, name: 'Amara Osei', points: 2450, streak: 45, courses: 28, avatar: '👑' },
                      { rank: 2, name: 'Kwame Asante', points: 2320, streak: 38, courses: 26, avatar: '🥈' },
                      { rank: 3, name: 'Fatima Ibrahim', points: 2180, streak: 32, courses: 25, avatar: '🥉' },
                      { rank: 4, name: 'Chidi Okonkwo', points: 1950, streak: 28, courses: 22, avatar: '4' },
                      { rank: 5, name: 'Zuri Mwangi', points: 1820, streak: 25, courses: 21, avatar: '5' },
                      { rank: 6, name: 'Kofi Mensah', points: 1750, streak: 22, courses: 20, avatar: '6' },
                      { rank: 7, name: 'Amina Diallo', points: 1680, streak: 20, courses: 19, avatar: '7' },
                      { rank: 8, name: 'Tunde Bakare', points: 1550, streak: 18, courses: 18, avatar: '8' },
                      { rank: 9, name: 'Ngozi Eze', points: 1420, streak: 15, courses: 17, avatar: '9' },
                      { rank: 10, name: 'Yusuf Ahmed', points: 1380, streak: 14, courses: 16, avatar: '10' },
                    ].map((leader) => (
                      <div key={leader.rank} className="flex items-center gap-4 p-4 hover:bg-muted/10 transition-colors">
                        <div className="w-8 text-center">
                          {leader.rank <= 3 ? (
                            <span className="text-2xl">{leader.avatar}</span>
                          ) : (
                            <span className="text-sm font-bold text-muted-foreground">#{leader.rank}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{leader.name}</div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              {leader.courses} courses
                            </span>
                            <span className="flex items-center gap-1">
                              <Flame className="h-3 w-3 text-orange-400" />
                              {leader.streak} day streak
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-yellow-400">
                            <Coins className="h-4 w-4" />
                            <span className="font-bold">{leader.points.toLocaleString()}</span>
                          </div>
                          <div className="text-[10px] text-muted-foreground">points</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="text-center">
                <Button variant="outline" className="gap-2">
                  <Trophy className="h-4 w-4" />
                  View Full Leaderboard
                </Button>
              </div>
            </TabsContent>

            {/* Certificates Tab */}
            <TabsContent value="certificates">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Your Certificates</h2>
                <p className="text-muted-foreground">
                  Earn recognized certifications as you complete learning paths
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { id: 'cert-1', title: 'Crypto Literacy Certificate', issuer: 'FINHUBAFRICA', date: '2025-01-20', skills: ['Bitcoin', 'Blockchain', 'Security'], color: 'blue', earned: userProgress.certificates.includes('cert-1') },
                  { id: 'cert-2', title: 'Trading Associate Certificate', issuer: 'FINHUBAFRICA', date: '2025-02-15', skills: ['Technical Analysis', 'Risk Management', 'Trading'], color: 'green', earned: userProgress.certificates.includes('cert-2') },
                  { id: 'cert-3', title: 'DeFi Specialist Certificate', issuer: 'FINHUBAFRICA', date: '2025-03-10', skills: ['DeFi', 'Smart Contracts', 'Yield'], color: 'pink', earned: userProgress.certificates.includes('cert-3') },
                  { id: 'cert-4', title: 'African Markets Certificate', issuer: 'FINHUBAFRICA', date: '2025-04-01', skills: ['Regulations', 'M-Pesa', 'Remittances'], color: 'orange', earned: userProgress.certificates.includes('cert-4') },
                  { id: 'cert-5', title: 'Professional Trader Certificate', issuer: 'FINHUBAFRICA', date: '2025-05-20', skills: ['Quantitative', 'Risk', 'Portfolio'], color: 'purple', earned: userProgress.certificates.includes('cert-5') },
                  { id: 'cert-6', title: 'Master Trader Certificate', issuer: 'FINHUBAFRICA', date: '2025-06-30', skills: ['Advanced', 'Institutional', 'Career'], color: 'yellow', earned: userProgress.certificates.includes('cert-6') },
                ].map((cert) => (
                  <Card key={cert.id} className={`border-${cert.color}-500/20 bg-${cert.color}-500/5 ${!cert.earned ? 'opacity-60' : ''}`}>
                    <CardContent className="p-6 text-center">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-${cert.color}-500/20 flex items-center justify-center`}>
                        {cert.earned ? (
                          <Award className={`h-8 w-8 text-${cert.color}-400`} />
                        ) : (
                          <Lock className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <h3 className="font-semibold mb-1">{cert.title}</h3>
                      <p className="text-xs text-muted-foreground mb-3">Issued by {cert.issuer}</p>
                      <div className="flex flex-wrap justify-center gap-1 mb-4">
                        {cert.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-[10px]">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      {cert.earned ? (
                        <div className="space-y-2">
                          <Badge variant="outline" className="text-green-400 border-green-500/30">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Earned
                          </Badge>
                          <div>
                            <Button size="sm" variant="outline" className="w-full">
                              View Certificate
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Badge variant="secondary" className="text-muted-foreground">
                          <Lock className="h-3 w-3 mr-1" />
                          Not yet earned
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Gamification / Achievements Tab */}
            <TabsContent value="gamification">
              <BadgeCollection
                earnedBadges={defaultBadges.slice(0, 3).map(b => ({ ...b, earnedAt: '2025-01-15' }))}
                availableBadges={defaultBadges}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Gamification Dialog */}
      <Dialog open={showGamification} onOpenChange={setShowGamification}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-400" />
              Your Learning Journey
            </DialogTitle>
            <DialogDescription>
              Track your progress, streaks, and achievements
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="points" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="points">Points & Level</TabsTrigger>
              <TabsTrigger value="streaks">Streaks</TabsTrigger>
              <TabsTrigger value="badges">Badges</TabsTrigger>
            </TabsList>
            
            <TabsContent value="points" className="mt-4">
              <PointsDisplay
                totalPointsEarned={userProgress.totalPointsEarned}
                currentStreak={userProgress.currentStreak}
                longestStreak={userProgress.longestStreak}
                coursesCompleted={userProgress.completedCourses.length}
                certificatesEarned={userProgress.certificates.length}
                nextMilestone={nextLevelPoints}
                level={level}
              />
            </TabsContent>
            
            <TabsContent value="streaks" className="mt-4">
              <StreakCounter
                currentStreak={userProgress.currentStreak}
                longestStreak={userProgress.longestStreak}
                streakMilestones={defaultStreakMilestones}
                lastActiveDate={userProgress.lastActiveDate}
                todayGoal={1}
                todayProgress={completedLessons.size}
              />
            </TabsContent>
            
            <TabsContent value="badges" className="mt-4">
              <BadgeCollection
                earnedBadges={defaultBadges.slice(0, 3).map(b => ({ ...b, earnedAt: '2025-01-15' }))}
                availableBadges={defaultBadges}
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Quiz Dialog */}
      <Dialog open={!!activeQuiz} onOpenChange={(open) => !open && setActiveQuiz(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <QuizEngine
            quiz={activeQuiz}
            onComplete={handleQuizComplete}
            onClose={() => setActiveQuiz(null)}
          />
        </DialogContent>
      </Dialog>

      {/* Simulation Dialog */}
      <Dialog open={!!activeSimulation} onOpenChange={(open) => !open && setActiveSimulation(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          {activeSimulation && (
            <PaperTradingSimulation
              config={activeSimulation}
              onComplete={handleSimulationComplete}
              onClose={() => setActiveSimulation(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LearningAcademy;
