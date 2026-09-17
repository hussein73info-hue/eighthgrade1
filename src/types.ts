export interface Trainee {
  id: string;
  name: string;
}

export interface QuizQuestion {
  q: string;
  options: string[];
  correct: number;
  note: string;
}

export interface CategorizationActivity {
  type: 'categorization';
  category1: {
    id: 'importance';
    title: string;
    description?: string;
    items: string[];
  };
  category2: {
    id: 'methods';
    title: string;
    description?: string;
    items: string[];
  };
}

export interface Lesson {
  unit: string;
  unitNo: number;
  title: string;
  discover: string;
  learn: string[];
  quiz?: QuizQuestion[];
  categorization?: CategorizationActivity;
}

export interface LessonResult {
  completed: boolean;
  score: number;
  total: number;
  submittedAt?: string;
  answers?: Record<number, number>; // for quiz questions
  categorizationAnswers?: Record<string, 'importance' | 'methods'>; // for categorization items
}

export interface SubmissionRecord {
  id: string;
  traineeId: string;
  traineeName: string;
  lessonIndex: number;
  lessonTitle: string;
  unitTitle: string;
  score: number;
  total: number;
  submittedAt: string;
  answersDetail: string;
}

export type ScreenType = 'login' | 'welcome' | 'index' | 'lesson';

