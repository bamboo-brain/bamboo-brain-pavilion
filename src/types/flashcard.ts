export interface Flashcard {
  id: string;
  word: string;
  pinyin: string;
  meaning: string;
  exampleSentence?: string;
  exampleTranslation?: string;
  hskLevel?: number;
  repetitions: number;
  easeFactor: number;
  intervalDays: number;
  nextReviewDate: string;
  lastReviewDate?: string;
  lastGrade: number;
  totalReviews: number;
  correctStreak: number;
}

export interface FlashcardDeck {
  id: string;
  userId: string;
  name: string;
  description: string;
  tags: string[];
  sourceDocumentId?: string;
  sourceType: 'manual' | 'document' | 'custom';
  cards: Flashcard[];
  totalCards: number;
  dueToday: number;
  masteryPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDeckRequest {
  name: string;
  description: string;
  tags: string[];
  sourceType: string;
  sourceDocumentId?: string;
  cards: CreateCardRequest[];
}

export interface CreateDeckFromDocumentRequest {
  name: string;
  description: string;
  documentId: string;
  maxCards?: number;
  minHskLevel?: number;
  maxHskLevel?: number;
}

export interface AddCardRequest {
  word: string;
  pinyin: string;
  meaning: string;
  exampleSentence?: string;
  exampleTranslation?: string;
  hskLevel?: number;
}

export interface CreateCardRequest extends AddCardRequest {}

export interface ReviewCardRequest {
  cardId: string;
  grade: number;
}

export interface ReviewCardResponse {
  card: Flashcard;
  nextReviewDate: string;
  intervalDays: number;
  easeFactor: number;
}

export interface FlashcardStats {
  totalDecks: number;
  totalCards: number;
  totalDueToday: number;
  averageMastery: number;
  deckStats: {
    deckId: string;
    name: string;
    totalCards: number;
    dueToday: number;
    mastery: number;
    lastStudied?: string;
  }[];
}
