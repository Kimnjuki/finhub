import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Play,
  FileText,
  Code,
  CheckCircle2,
  Clock,
  Coins,
  ChevronRight,
  Lock,
  Star,
  BookOpen,
  Zap,
} from 'lucide-react';
import { Lesson } from '@/types/learning';

interface LessonViewerProps {
  lesson: Lesson;
  courseTitle: string;
  onComplete: () => void;
  onNext: () => void;
  hasNext: boolean;
  isCompleted: boolean;
  isLocked: boolean;
  quizPoints?: number;
  onStartQuiz?: () => void;
}

const LessonViewer: React.FC<LessonViewerProps> = ({
  lesson,
  courseTitle,
  onComplete,
  onNext,
  hasNext,
  isCompleted,
  isLocked,
  quizPoints,
  onStartQuiz,
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'resources' | 'quiz'>('content');

  const getLessonIcon = (type: Lesson['type']) => {
    switch (type) {
      case 'video':
        return <Play className="h-5 w-5" />;
      case 'article':
        return <FileText className="h-5 w-5" />;
      case 'interactive':
        return <Zap className="h-5 w-5" />;
      case 'quiz':
        return <CheckCircle2 className="h-5 w-5" />;
      case 'simulation':
        return <Code className="h-5 w-5" />;
      default:
        return <BookOpen className="h-5 w-5" />;
    }
  };

  const renderContent = () => {
    if (isLocked) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Lock className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">This lesson is locked</h3>
          <p className="text-muted-foreground">
            Complete the previous lesson to unlock this content
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Video Content */}
        {lesson.type === 'video' && lesson.content.videoUrl && (
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <iframe
              src={lesson.content.videoUrl}
              className="w-full h-full"
              allowFullScreen
              title={lesson.title}
            />
          </div>
        )}

        {/* Text Content */}
        {lesson.content.textContent && (
          <div className="prose prose-invert max-w-none">
            <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {lesson.content.textContent}
            </div>
          </div>
        )}

        {/* Code Examples */}
        {lesson.content.codeExamples && lesson.content.codeExamples.length > 0 && (
          <div className="space-y-4">
            {lesson.content.codeExamples.map((example, index) => (
              <Card key={index} className="border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Code Example</CardTitle>
                    <Badge variant="outline" className="text-[10px]">
                      {example.language}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted/50 p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{example.code}</code>
                  </pre>
                  <p className="text-sm text-muted-foreground mt-3">{example.explanation}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Charts */}
        {lesson.content.charts && lesson.content.charts.length > 0 && (
          <div className="space-y-4">
            {lesson.content.charts.map((chart, index) => (
              <Card key={index} className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-sm">Interactive Chart</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
                    <span className="text-muted-foreground text-sm">
                      [{chart.type} chart visualization]
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Learning Objectives */}
        {lesson.objectives && lesson.objectives.length > 0 && (
          <Card className="border-blue-500/20 bg-blue-500/5">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Star className="h-4 w-4 text-blue-400" />
                Learning Objectives
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {lesson.objectives.map((objective, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <ChevronRight className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>{objective}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Key Takeaways */}
        {lesson.keyTakeaways && lesson.keyTakeaways.length > 0 && (
          <Card className="border-green-500/20 bg-green-500/5">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                Key Takeaways
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {lesson.keyTakeaways.map((takeaway, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              {getLessonIcon(lesson.type)}
            </div>
            <div>
              <CardTitle className="text-xl">{lesson.title}</CardTitle>
              <CardDescription className="mt-1">
                {courseTitle} • Lesson {lesson.order}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {lesson.duration}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-border/50">
          <Button
            variant="ghost"
            size="sm"
            className={`rounded-none border-b-2 ${
              activeTab === 'content'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground'
            }`}
            onClick={() => setActiveTab('content')}
          >
            <FileText className="h-4 w-4 mr-2" />
            Content
          </Button>
          {lesson.content.resources && lesson.content.resources.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-none border-b-2 ${
                activeTab === 'resources'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground'
              }`}
              onClick={() => setActiveTab('resources')}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Resources
            </Button>
          )}
          {lesson.hasQuiz && lesson.quiz && (
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-none border-b-2 ${
                activeTab === 'quiz'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground'
              }`}
              onClick={() => setActiveTab('quiz')}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Quiz
            </Button>
          )}
        </div>

        {/* Content Area */}
        {activeTab === 'content' && renderContent()}

        {/* Resources Tab */}
        {activeTab === 'resources' && lesson.content.resources && (
          <div className="space-y-3">
            {lesson.content.resources.map((resource, index) => (
              <a
                key={index}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-muted/10 transition-colors"
              >
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  {resource.type === 'video' && <Play className="h-4 w-4" />}
                  {resource.type === 'article' && <FileText className="h-4 w-4" />}
                  {resource.type === 'tool' && <Code className="h-4 w-4" />}
                  {resource.type === 'documentation' && <BookOpen className="h-4 w-4" />}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{resource.title}</div>
                  <div className="text-xs text-muted-foreground capitalize">{resource.type}</div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </a>
            ))}
          </div>
        )}

        {/* Quiz Tab */}
        {activeTab === 'quiz' && lesson.quiz && (
          <div className="text-center py-8">
            <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Ready to test your knowledge?</h3>
            <p className="text-muted-foreground mb-4">
              Complete this quiz to earn {quizPoints || lesson.quiz.points} points
            </p>
            <Button size="lg" className="gap-2" onClick={onStartQuiz}>
              <Zap className="h-4 w-4" />
              Start Quiz
            </Button>
          </div>
        )}

        <Separator />

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Coins className="h-4 w-4" />
            <span>Earn {lesson.quiz?.points || 5} points</span>
          </div>
          <div className="flex gap-2">
            {!isCompleted && !isLocked && (
              <Button onClick={onComplete} variant="outline" className="gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Mark Complete
              </Button>
            )}
            {hasNext && (
              <Button onClick={onNext} className="gap-2">
                Next Lesson
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LessonViewer;