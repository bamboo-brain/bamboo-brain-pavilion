export type QuestionType =
  | 'multiple-choice'
  | 'fill-in-blank'
  | 'tone-identification'
  | 'listening';

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  question: string;
  word: string;
  pinyin?: string;
  pinyinWithoutTones?: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  hskLevel?: number;
  audioText?: string;
}

export interface QuizAnswer {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  timeSpentSeconds: number;
  answeredAt: string;
}

export interface QuizSession {
  id: string;
  userId: string;
  sourceType: 'document' | 'deck';
  sourceId: string;
  sourceName: string;
  questions: QuizQuestion[];
  answers: QuizAnswer[];
  status: 'in-progress' | 'completed';
  score?: number;
  totalQuestions: number;
  correctAnswers: number;
  timeStarted: string;
  timeCompleted?: string;
  createdAt: string;
}

export interface GenerateQuizRequest {
  documentId?: string;
  deckId?: string;
  questionCount: number;
  types: QuestionType[];
  hskLevel?: number;
}

export interface SubmitAnswerRequest {
  questionId: string;
  userAnswer: string;
  timeSpentSeconds: number;
}

export interface SubmitAnswerResponse {
  isCorrect: boolean;
  correctAnswer: string;
  explanation?: string;
  session: {
    id: string;
    status: string;
    correctAnswers: number;
    totalQuestions: number;
    answeredCount: number;
  };
}

export interface QuizStats {
  totalQuizzesTaken: number;
  averageScore: number;
  bestScore: number;
  totalQuestionsAnswered: number;
  correctAnswers: number;
  accuracyPercentage: number;
  recentSessions: {
    id: string;
    sourceName: string;
    sourceType: string;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    timeCompleted: string;
    createdAt: string;
  }[];
}
