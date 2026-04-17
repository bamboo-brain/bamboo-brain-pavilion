export interface WordHit {
  word: string;
  pinyin: string;
  meaning: string;
  hskLevel: number | null;
}

export interface DocumentSearchHit {
  documentId: string;
  documentTitle: string;
  documentType: string;
  hskLevel: number | null;
  score: number;
  topWords: WordHit[];
}

export interface DocumentSearchResult {
  query: string;
  totalCount: number;
  hits: DocumentSearchHit[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: RagSource[];
  timestamp?: Date;
}

export interface RagSource {
  documentId: string;
  documentTitle: string;
  content: string;
  score: number;
}

export interface ChatRequest {
  question: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
}

export interface ChatResponse {
  answer: string;
  hasSources: boolean;
  sources: RagSource[];
}
