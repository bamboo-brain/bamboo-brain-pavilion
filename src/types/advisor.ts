export interface AdvisorMessage {
  role: 'user' | 'assistant';
  content: string;
  actionsPerformed?: string[];
  planWasAdapted?: boolean;
  timestamp: Date;
}

export interface AdvisorChatRequest {
  message: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
}

export interface AdvisorChatResponse {
  answer: string;
  actionsPerformed: string[];
  planWasAdapted: boolean;
}
