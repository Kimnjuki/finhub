export interface LearningPath {
  id: string;
  title: string;
  description: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  totalCourses: number;
  totalLessons: number;
  estimatedDuration: string;
  reward: number;
  prerequisites?: string[];
  skills: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  icon: string;
  color: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  learningPathId: string;
  order: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  duration: string;
  estimatedHours: number;
  reward: number;
  prerequisites: string[];
  skills: string[];
  tags: string[];
  isPublished: boolean;
  author: string;
  lastUpdated: string;
  rating: number;
  enrollmentCount: number;
  completionRate: number;
  icon: string;
  color: string;
  simulation?: SimulationConfig;
}

export interface Lesson {
  id: string;
  courseId: string;
  order: number;
  title: string;
  type: 'video' | 'article' | 'interactive' | 'quiz' | 'simulation' | 'assignment';
  duration: string;
  content: {
    videoUrl?: string;
    textContent?: string;
    codeExamples?: CodeExample[];
    charts?: ChartConfig[];
    resources?: Resource[];
  };
  objectives: string[];
  keyTakeaways: string[];
  isLocked: boolean;
  isCompleted: boolean;
  hasQuiz: boolean;
  quiz?: Quiz;
  simulation?: SimulationConfig;
}

export interface CodeExample {
  language: string;
  code: string;
  explanation: string;
}

export interface ChartConfig {
  type: 'candlestick' | 'line' | 'bar' | 'pie';
  data: any[];
  indicators?: string[];
}

export interface Resource {
  title: string;
  url: string;
  type: 'article' | 'video' | 'tool' | 'documentation';
}

export interface Quiz {
  id: string;
  lessonId: string;
  passingScore: number;
  timeLimit: number;
  points: number;
  questions: QuizQuestion[];
  attempts: number;
  bestScore: number;
}

export interface QuizQuestion {
  id: string;
  type: 'mcq' | 'mma' | 'tf' | 'fill' | 'code' | 'chart' | 'essay';
  question: string;
  options?: string[];
  correctAnswer: string | number | string[];
  explanation: string;
  points: number;
  chartData?: any[];
  chartQuestion?: string;
  codeTemplate?: string;
  expectedOutput?: string;
  language?: string;
  rubric?: GradingRubric[];
}

export interface GradingRubric {
  criteria: string;
  maxPoints: number;
  description: string;
}

export interface SimulationConfig {
  type: 'paper_trading' | 'options_calculator' | 'portfolio_builder' | 'risk_calculator';
  initialBalance: number;
  assets: string[];
  duration: number;
  objectives: string[];
}

export interface UserProgress {
  userId: string;
  enrolledCourses: string[];
  completedLessons: string[];
  completedCourses: string[];
  quizAttempts: QuizAttempt[];
  certificates: string[];
  totalPointsEarned: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  learningPathProgress: Record<string, number>;
  skillLevels: Record<string, number>;
}

export interface QuizAttempt {
  quizId: string;
  score: number;
  passed: boolean;
  timeSpent: number;
  answers: Record<string, any>;
  completedAt: string;
}

export interface Certificate {
  id: string;
  userId: string;
  type: string;
  issuedAt: string;
  certificateNumber: string;
  verificationLink: string;
  skills: string[];
}

export interface Badge {
  id: string;
  userId: string;
  type: BadgeType;
  earnedAt: string;
  metadata?: Record<string, any>;
}

export type BadgeType =
  | 'course_completion'
  | 'module_mastery'
  | 'streak_7'
  | 'streak_30'
  | 'perfect_quiz'
  | 'early_adopter'
  | 'mentor'
  | 'community_contributor'
  | 'african_trader'
  | 'defi_specialist';

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  avatar?: string;
  points: number;
  rank: number;
  coursesCompleted: number;
  currentStreak: number;
}

export interface LearningAnalytics {
  userId: string;
  totalTimeSpent: number;
  averageSessionDuration: number;
  completionRate: number;
  strongestSubject: string;
  weakestSubject: string;
  recommendedNextCourse: string;
  weeklyProgress: WeeklyProgress[];
  monthlyGoal: number;
  currentMonthProgress: number;
}

export interface WeeklyProgress {
  week: string;
  lessonsCompleted: number;
  quizzesPassed: number;
  pointsEarned: number;
  timeSpent: number;
}