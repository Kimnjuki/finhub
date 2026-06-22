import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Coins,
  Trophy,
  Zap,
  ArrowRight,
  RotateCcw,
  Award,
  Sparkles,
} from 'lucide-react';
import { Quiz, QuizQuestion } from '@/types/learning';

interface QuizEngineProps {
  quiz: Quiz;
  onComplete: (score: number, passed: boolean, timeSpent: number) => void;
  onClose: () => void;
}

const QuizEngine: React.FC<QuizEngineProps> = ({ quiz, onComplete, onClose }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeRemaining, setTimeRemaining] = useState(quiz.timeLimit);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;
  const progressPercentage = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  useEffect(() => {
    if (timeRemaining > 0 && !isSubmitted) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeRemaining === 0 && !isSubmitted) {
      handleSubmit();
    }
  }, [timeRemaining, isSubmitted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleMultipleAnswerChange = (questionId: string, option: string, checked: boolean) => {
    setAnswers((prev) => {
      const currentAnswers = prev[questionId] || [];
      if (checked) {
        return {
          ...prev,
          [questionId]: [...currentAnswers, option],
        };
      } else {
        return {
          ...prev,
          [questionId]: currentAnswers.filter((a: string) => a !== option),
        };
      }
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const calculateScore = () => {
    let totalPoints = 0;
    let earnedPoints = 0;

    quiz.questions.forEach((question) => {
      totalPoints += question.points;
      const userAnswer = answers[question.id];

      if (question.type === 'mcq' || question.type === 'tf') {
        if (userAnswer === question.correctAnswer) {
          earnedPoints += question.points;
        }
      } else if (question.type === 'mma') {
        const correctAnswers = Array.isArray(question.correctAnswer) 
          ? question.correctAnswer 
          : [question.correctAnswer];
        const userAnswers = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
        
        if (JSON.stringify(userAnswers.sort()) === JSON.stringify(correctAnswers.sort())) {
          earnedPoints += question.points;
        }
      } else if (question.type === 'fill') {
        if (String(userAnswer).toLowerCase().trim() === String(question.correctAnswer).toLowerCase().trim()) {
          earnedPoints += question.points;
        }
      } else if (question.type === 'code') {
        if (String(userAnswer).trim() === String(question.expectedOutput).trim()) {
          earnedPoints += question.points;
        }
      }
    });

    return Math.round((earnedPoints / totalPoints) * 100);
  };

  const handleSubmit = () => {
    const finalScore = calculateScore();
    const passed = finalScore >= quiz.passingScore;
    const timeSpent = quiz.timeLimit - timeRemaining;

    setScore(finalScore);
    setPassed(passed);
    setIsSubmitted(true);

    setTimeout(() => {
      onComplete(finalScore, passed, timeSpent);
    }, 3000);
  };

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTimeRemaining(quiz.timeLimit);
    setIsSubmitted(false);
    setScore(0);
    setPassed(false);
  };

  const renderQuestion = (question: QuizQuestion) => {
    const userAnswer = answers[question.id];

    switch (question.type) {
      case 'mcq':
        return (
          <div className="space-y-3">
            <RadioGroup
              value={userAnswer || ''}
              onValueChange={(value) => handleAnswerChange(question.id, value)}
              disabled={isSubmitted}
            >
              {question.options?.map((option, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-3 p-4 rounded-lg border ${
                    isSubmitted
                      ? option === question.correctAnswer
                        ? 'border-green-500 bg-green-500/10'
                        : userAnswer === option
                        ? 'border-red-500 bg-red-500/10'
                        : 'border-border/50'
                      : 'border-border/50 hover:border-primary/30'
                  }`}
                >
                  <RadioGroupItem value={option} id={`${question.id}-${index}`} />
                  <Label htmlFor={`${question.id}-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                  {isSubmitted && option === question.correctAnswer && (
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                  )}
                  {isSubmitted && userAnswer === option && option !== question.correctAnswer && (
                    <XCircle className="h-5 w-5 text-red-400" />
                  )}
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 'mma':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <div
                key={index}
                className={`flex items-center space-x-3 p-4 rounded-lg border ${
                  isSubmitted
                    ? (Array.isArray(question.correctAnswer) && question.correctAnswer.includes(option))
                      ? 'border-green-500 bg-green-500/10'
                      : userAnswer?.includes(option)
                      ? 'border-red-500 bg-red-500/10'
                      : 'border-border/50'
                    : 'border-border/50 hover:border-primary/30'
                }`}
              >
                <Checkbox
                  id={`${question.id}-${index}`}
                  checked={userAnswer?.includes(option) || false}
                  onCheckedChange={(checked) =>
                    handleMultipleAnswerChange(question.id, option, checked as boolean)
                  }
                  disabled={isSubmitted}
                />
                <Label htmlFor={`${question.id}-${index}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
                {isSubmitted && 
                 (Array.isArray(question.correctAnswer) && question.correctAnswer.includes(option)) && (
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                )}
              </div>
            ))}
          </div>
        );

      case 'tf':
        return (
          <div className="space-y-3">
            <RadioGroup
              value={userAnswer || ''}
              onValueChange={(value) => handleAnswerChange(question.id, value)}
              disabled={isSubmitted}
            >
              {['True', 'False'].map((option) => (
                <div
                  key={option}
                  className={`flex items-center space-x-3 p-4 rounded-lg border ${
                    isSubmitted
                      ? option.toLowerCase() === String(question.correctAnswer).toLowerCase()
                        ? 'border-green-500 bg-green-500/10'
                        : userAnswer === option
                        ? 'border-red-500 bg-red-500/10'
                        : 'border-border/50'
                      : 'border-border/50 hover:border-primary/30'
                  }`}
                >
                  <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                  <Label htmlFor={`${question.id}-${option}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                  {isSubmitted && 
                   option.toLowerCase() === String(question.correctAnswer).toLowerCase() && (
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                  )}
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 'fill':
        return (
          <div className="space-y-3">
            <Input
              value={userAnswer || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              placeholder="Type your answer..."
              disabled={isSubmitted}
              className={
                isSubmitted
                  ? String(userAnswer).toLowerCase().trim() === String(question.correctAnswer).toLowerCase().trim()
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-red-500 bg-red-500/10'
                  : ''
              }
            />
          </div>
        );

      case 'code':
        return (
          <div className="space-y-3">
            <div className="bg-muted/50 p-4 rounded-lg">
              <Label className="text-sm text-muted-foreground mb-2 block">Expected Output:</Label>
              <code className="text-sm text-green-400">{question.expectedOutput}</code>
            </div>
            <Input
              value={userAnswer || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              placeholder="Write your code or output..."
              disabled={isSubmitted}
              className="font-mono"
            />
          </div>
        );

      default:
        return <div className="text-muted-foreground">Unsupported question type</div>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (isSubmitted) {
    return (
      <Card className="border-border/50">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {passed ? (
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
                <Trophy className="h-10 w-10 text-green-400" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
                <XCircle className="h-10 w-10 text-red-400" />
              </div>
            )}
          </div>
          <CardTitle className="text-2xl">
            {passed ? 'Congratulations!' : 'Keep Practicing!'}
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            You scored <span className={`font-bold ${getScoreColor(score)}`}>{score}%</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-border/50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{score}%</div>
                <div className="text-xs text-muted-foreground">Your Score</div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{quiz.passingScore}%</div>
                <div className="text-xs text-muted-foreground">Passing Score</div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400 flex items-center justify-center gap-1">
                  <Coins className="h-5 w-5" />
                  {quiz.points}
                </div>
                <div className="text-xs text-muted-foreground">Points Earned</div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {quiz.questions.filter((q) => {
                    const correctAnswer = Array.isArray(q.correctAnswer) 
                      ? q.correctAnswer 
                      : [q.correctAnswer];
                    const userAnswer = Array.isArray(answers[q.id]) 
                      ? answers[q.id] 
                      : [answers[q.id]];
                    return JSON.stringify(correctAnswer.sort()) === JSON.stringify(userAnswer.sort());
                  }).length}/{totalQuestions}
                </div>
                <div className="text-xs text-muted-foreground">Correct Answers</div>
              </CardContent>
            </Card>
          </div>

          {passed && (
            <Card className="border-yellow-500/20 bg-yellow-500/5">
              <CardContent className="p-4 flex items-center gap-3">
                <Award className="h-8 w-8 text-yellow-400" />
                <div>
                  <div className="font-semibold">Reward Unlocked!</div>
                  <div className="text-sm text-muted-foreground">
                    +{quiz.points} points added to your account
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3">
            <Button onClick={handleRetry} variant="outline" className="flex-1 gap-2">
              <RotateCcw className="h-4 w-4" />
              Retry Quiz
            </Button>
            <Button onClick={onClose} className="flex-1 gap-2">
              Continue Learning
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              Quiz: {quiz.id}
            </CardTitle>
            <CardDescription className="mt-1">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className={timeRemaining < 30 ? 'text-red-400 font-bold' : ''}>
                {formatTime(timeRemaining)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-yellow-400">
              <Coins className="h-4 w-4" />
              <span>{quiz.points} pts</span>
            </div>
          </div>
        </div>
        <Progress value={progressPercentage} className="mt-4" />
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Question */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Badge variant="outline" className="text-xs">
              {currentQuestion.type.toUpperCase()}
            </Badge>
            <h3 className="text-lg font-medium flex-1">{currentQuestion.question}</h3>
          </div>
          {renderQuestion(currentQuestion)}
        </div>

        {/* Explanation (shown after answer) */}
        {currentQuestionIndex === totalQuestions - 1 && isSubmitted && (
          <Card className="border-blue-500/20 bg-blue-500/5">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-400" />
                Explanation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>
          <div className="flex items-center gap-2">
            {quiz.questions.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentQuestionIndex
                    ? 'bg-primary'
                    : index < currentQuestionIndex
                    ? 'bg-green-500'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>
          {currentQuestionIndex === totalQuestions - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={Object.keys(answers).length < totalQuestions}
              className="gap-2"
            >
              Submit Quiz
              <CheckCircle2 className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleNext} className="gap-2">
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizEngine;