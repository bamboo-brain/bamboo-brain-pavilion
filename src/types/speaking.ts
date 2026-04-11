export interface ToneCorrection {
  word: string;
  correctPinyin: string;
  spokenPinyin: string;
  message: string;
}

export interface ConversationTurn {
  id: string;
  role: 'ai' | 'user';
  text: string;
  pinyin?: string;
  translation?: string;
  toneCorrections: ToneCorrection[];
  accuracyScore?: number;
  audioUrl?: string;
  timestamp: string;
}

export interface SessionInsights {
  accuracyScore: number;
  fluency: 'Excellent' | 'Great' | 'Good' | 'Needs Work';
  totalTurns: number;
  userTurns: number;
  toneErrorCount: number;
  vocabularyCount: number;
  duration: string;
}

export interface VocabularyItem {
  word: string;
  pinyin: string;
  meaning: string;
  usageCount: number;
}

export interface SpeakingSession {
  id: string;
  userId: string;
  topic: string;
  topicDescription: string;
  hskLevel: number;
  status: 'active' | 'completed';
  turns: ConversationTurn[];
  insights?: SessionInsights;
  topVocabulary: VocabularyItem[];
  startedAt: string;
  endedAt?: string;
  durationSeconds: number;
  createdAt: string;
}

export interface StartSessionRequest {
  topic: string;
  topicDescription: string;
  hskLevel: number;
}

export interface ProcessAudioRequest {
  audioBase64: string;
  mimeType: string;
}

export interface ProcessTextRequest {
  text: string;
}

export interface EndSessionRequest {
  durationSeconds: number;
}

export interface SpeakingStats {
  avgPronunciationScore: number;
  activeSpeakingTime: string;
  conversationsCompleted: number;
  recentSessions: {
    id: string;
    topic: string;
    hskLevel: number;
    accuracy: number;
    fluency: string;
    duration: string;
    date: string;
  }[];
}

export interface SuggestedTopic {
  id: string;
  topic: string;
  description: string;
  hskLevel: number;
  emoji: string;
}
