import { Lesson } from '@/types/learning';

export const generateLessonsForCourse = (courseId: string, courseTitle: string): Lesson[] => {
  const baseLessons: Record<string, Lesson[]> = {
    'course-1-1': [
      {
        id: `${courseId}-lesson-1`,
        courseId,
        order: 1,
        title: 'The History of Money',
        type: 'article',
        duration: '8 min',
        content: {
          textContent: `Money has evolved dramatically throughout human history.

From barter systems where goods were traded directly, to the invention of coins, paper money, and now digital currencies, each step has made commerce more efficient.

Key milestones:
- 6000 BC: Livestock and grain as early forms of money
- 600 BC: First metal coins in Lydia (modern Turkey)
- 700 AD: First paper money in China
- 1971: End of the gold standard
- 2008: Birth of Bitcoin

Why was Bitcoin created? In 2008, Satoshi Nakamoto published a whitepaper proposing a decentralized electronic cash system that didn't require trust in financial institutions.`,
          resources: [
            { title: 'History of Money - Wikipedia', url: 'https://en.wikipedia.org/wiki/History_of_money', type: 'article' },
            { title: 'Bitcoin Whitepaper', url: 'https://bitcoin.org/bitcoin.pdf', type: 'documentation' },
          ],
        },
        objectives: ['Understand the evolution of money', 'Learn why decentralized currency was needed', 'Identify key milestones in monetary history'],
        keyTakeaways: ['Money evolved from barter to digital forms', 'Trust in institutions has always been required until Bitcoin', 'Decentralization removes the need for intermediaries'],
        isLocked: false,
        isCompleted: false,
        hasQuiz: true,
        quiz: {
          id: `quiz-${courseId}-1`,
          lessonId: `${courseId}-lesson-1`,
          passingScore: 70,
          timeLimit: 120,
          points: 10,
          questions: [
            {
              id: 'q1',
              type: 'mcq',
              question: 'Where were the first metal coins minted?',
              options: ['China', 'Lydia (Turkey)', 'Greece', 'Egypt'],
              correctAnswer: 'Lydia (Turkey)',
              explanation: 'The first metal coins were minted around 600 BC in Lydia, an ancient kingdom in modern-day Turkey.',
              points: 10,
            },
          ],
          attempts: 0,
          bestScore: 0,
        },
      },
      {
        id: `${courseId}-lesson-2`,
        courseId,
        order: 2,
        title: 'What is Money? - Core Properties',
        type: 'article',
        duration: '7 min',
        content: {
          textContent: `For something to function as money, it must have certain properties:

1. DURABILITY - It must withstand physical wear and tear
2. PORTABILITY - It must be easy to carry and transfer
3. DIVISIBILITY - It must be divisible into smaller units
4. UNIFORMITY - Each unit must be identical to others of the same denomination
5. LIMITED SUPPLY - It must be scarce enough to maintain value
6. ACCEPTABILITY - It must be widely accepted as payment

Bitcoin was designed to satisfy all these properties digitally, without requiring physical form.`,
          resources: [
            { title: 'Properties of Money', url: 'https://www.investopedia.com/terms/m/money.asp', type: 'article' },
          ],
        },
        objectives: ['Learn the 6 properties of money', 'Understand how Bitcoin fulfills each property', 'Compare traditional money with cryptocurrency'],
        keyTakeaways: ['Durability: Bitcoin exists on thousands of computers worldwide', 'Portability: Can transfer billions instantly across borders', 'Limited supply: Only 21 million Bitcoin will ever exist'],
        isLocked: false,
        isCompleted: false,
        hasQuiz: true,
        quiz: {
          id: `quiz-${courseId}-2`,
          lessonId: `${courseId}-lesson-2`,
          passingScore: 70,
          timeLimit: 120,
          points: 10,
          questions: [
            {
              id: 'q1',
              type: 'mcq',
              question: 'How many Bitcoins will ever exist?',
              options: ['100 million', '21 million', 'Unlimited', '50 million'],
              correctAnswer: '21 million',
              explanation: 'Bitcoin has a fixed supply cap of 21 million coins, making it inherently scarce.',
              points: 10,
            },
          ],
          attempts: 0,
          bestScore: 0,
        },
      },
      {
        id: `${courseId}-lesson-3`,
        courseId,
        order: 3,
        title: 'From Barter to Bitcoin',
        type: 'video',
        duration: '10 min',
        content: {
          videoUrl: 'https://www.youtube.com/embed/6MNUttJqGa0',
          textContent: `Watch this comprehensive overview of how money evolved from simple barter systems to the digital currencies we use today.

This lesson covers:
- The inefficiencies of barter systems
- Why commodity money emerged
- The transition to representative money
- The fiat money system
- The emergence of digital and cryptocurrency`,
          resources: [
            { title: 'The Evolution of Money', url: '#', type: 'video' },
            { title: 'Additional Reading', url: '#', type: 'article' },
          ],
        },
        objectives: ['Visualize the complete history of money', 'Understand the problems each monetary system solved', 'See the natural evolution toward digital currency'],
        keyTakeaways: ['Each monetary innovation solved problems of the previous system', 'Fiat money relies entirely on trust in governments', 'Bitcoin fixes the trust problem through mathematics'],
        isLocked: false,
        isCompleted: false,
        hasQuiz: true,
        quiz: {
          id: `quiz-${courseId}-3`,
          lessonId: `${courseId}-lesson-3`,
          passingScore: 70,
          timeLimit: 120,
          points: 10,
          questions: [
            {
              id: 'q1',
              type: 'tf',
              question: 'Fiat money has intrinsic value.',
              options: ['True', 'False'],
              correctAnswer: 'False',
              explanation: 'Fiat money has no intrinsic value - its value comes from government decree and public trust.',
              points: 10,
            },
          ],
          attempts: 0,
          bestScore: 0,
        },
      },
    ],
  };

  // Generate generic lessons for courses without specific content
  const defaultLessons: Lesson[] = [
    {
      id: `${courseId}-lesson-1`,
      courseId,
      order: 1,
      title: `Introduction to ${courseTitle}`,
      type: 'article',
      duration: '10 min',
      content: {
        textContent: `Welcome to "${courseTitle}"!

In this comprehensive course, you will learn the fundamental concepts and practical applications of this important topic.

This first lesson introduces the core concepts and sets the foundation for the advanced topics we'll cover throughout the course.`,
        resources: [
          { title: 'Official Documentation', url: '#', type: 'documentation' },
          { title: 'Related Video', url: '#', type: 'video' },
        ],
      },
      objectives: ['Understand basic concepts', 'Learn key terminology', 'Apply foundational knowledge'],
      keyTakeaways: ['Key concept 1', 'Key concept 2', 'Key concept 3'],
      isLocked: false,
      isCompleted: false,
      hasQuiz: true,
      quiz: {
        id: `quiz-${courseId}-1`,
        lessonId: `${courseId}-lesson-1`,
        passingScore: 70,
        timeLimit: 120,
        points: 10,
        questions: [
          {
            id: 'q1',
            type: 'mcq',
            question: `What is the primary focus of ${courseTitle}?`,
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correctAnswer: 'Option A',
            explanation: 'This is the correct answer because it best represents the core concept of this course.',
            points: 10,
          },
        ],
        attempts: 0,
        bestScore: 0,
      },
    },
    {
      id: `${courseId}-lesson-2`,
      courseId,
      order: 2,
      title: 'Core Concepts Deep Dive',
      type: 'article',
      duration: '15 min',
      content: {
        textContent: `Now let's dive deeper into the core concepts of ${courseTitle}.

Understanding these fundamentals is crucial for applying this knowledge in real-world scenarios.`,
        resources: [
          { title: 'Further Reading', url: '#', type: 'article' },
        ],
      },
      objectives: ['Master core concepts', 'Apply theoretical knowledge', 'Prepare for practical exercises'],
      keyTakeaways: ['Deep understanding of fundamentals', 'Practical application skills', 'Foundation for advanced topics'],
      isLocked: false,
      isCompleted: false,
      hasQuiz: true,
      quiz: {
        id: `quiz-${courseId}-2`,
        lessonId: `${courseId}-lesson-2`,
        passingScore: 70,
        timeLimit: 120,
        points: 10,
        questions: [
          {
            id: 'q1',
            type: 'mcq',
            question: 'Which concept is fundamental to this topic?',
            options: ['Concept A', 'Concept B', 'Concept C', 'Concept D'],
            correctAnswer: 'Concept A',
            explanation: 'This concept forms the foundation of everything else in this course.',
            points: 10,
          },
        ],
        attempts: 0,
        bestScore: 0,
      },
    },
    {
      id: `${courseId}-lesson-3`,
      courseId,
      order: 3,
      title: 'Practical Applications',
      type: 'interactive',
      duration: '20 min',
      content: {
        textContent: `Let's apply what we've learned to real-world scenarios.

This interactive lesson will help you practice the concepts in practical situations.`,
        resources: [
          { title: 'Practice Tools', url: '#', type: 'tool' },
        ],
      },
      objectives: ['Apply knowledge practically', 'Solve real-world problems', 'Build hands-on experience'],
      keyTakeaways: ['Practical application of theory', 'Problem-solving skills', 'Real-world experience'],
      isLocked: false,
      isCompleted: false,
      hasQuiz: true,
      quiz: {
        id: `quiz-${courseId}-3`,
        lessonId: `${courseId}-lesson-3`,
        passingScore: 70,
        timeLimit: 180,
        points: 15,
        questions: [
          {
            id: 'q1',
            type: 'mcq',
            question: 'How would you apply these concepts?',
            options: ['Approach A', 'Approach B', 'Approach C', 'Approach D'],
            correctAnswer: 'Approach A',
            explanation: 'This approach is most effective because it considers all relevant factors.',
            points: 15,
          },
        ],
        attempts: 0,
        bestScore: 0,
      },
    },
  ];

  return baseLessons[courseId] || defaultLessons;
};

export const getLessonsForCourse = (courseId: string, courseTitle: string): Lesson[] => {
  return generateLessonsForCourse(courseId, courseTitle);
};