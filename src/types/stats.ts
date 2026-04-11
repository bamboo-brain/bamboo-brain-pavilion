export interface StreakDay {
  date: string;
  active: boolean;
  minutesStudied: number;
}

export interface HskLevelProgress {
  level: number;
  wordsLearned: number;
  totalWords: number;
  percentage: number;
}

export interface RetentionDataPoint {
  date: string;
  retentionRate: number;
}

export interface DailyActivity {
  date: string;
  minutesStudied: number;
  flashcardsReviewed: number;
  quizzesCompleted: number;
  speakingMinutes: number;
  wordsLearned: number;
}

export interface UserStats {
  id: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: string;
  streakHistory: StreakDay[];
  totalCharactersLearned: number;
  charactersThisWeek: number;
  hskProgress: HskLevelProgress[];
  totalStudyMinutes: number;
  studyMinutesThisWeek: number;
  studyMinutesToday: number;
  totalFlashcardsReviewed: number;
  totalQuizzesCompleted: number;
  totalSpeakingSessions: number;
  totalDocumentsUploaded: number;
  retentionCurve: RetentionDataPoint[];
  dailyActivity: DailyActivity[];
  updatedAt: string;
}
