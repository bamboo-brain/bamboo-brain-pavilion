export interface StudyGoal {
  targetHskLevel: number;
  currentHskLevel: number;
  targetDate?: string;
  dailyStudyMinutes: number;
  focusAreas: string[];
  reasonForLearning: string;
}

export interface WeeklySchedule {
  preferredDays: string[];
  preferredTime: string;
  sessionsPerWeek: number;
}

export interface StudyEvent {
  id: string;
  title: string;
  description: string;
  type: 'flashcards' | 'speaking' | 'quiz' | 'reading' | 'review' | 'milestone';
  date: string;
  startTime: string;
  durationMinutes: number;
  status: 'scheduled' | 'completed' | 'skipped' | 'rescheduled';
  completedAt?: string;
  linkedResourceId?: string;
  linkedResourceType?: string;
  googleEventId?: string;
  microsoftEventId?: string;
  color: string;
}

export interface AgentNote {
  id: string;
  type: 'generation' | 'adaptation' | 'observation';
  message: string;
  createdAt: string;
}

export interface StudyPlan {
  id: string;
  userId: string;
  status: 'active' | 'completed' | 'paused';
  goal: StudyGoal;
  events: StudyEvent[];
  weeklySchedule: WeeklySchedule;
  agentNotes: AgentNote[];
  lastAdaptedAt?: string;
  nextAdaptationDue: string;
  googleCalendarSynced: boolean;
  microsoftCalendarSynced: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarResponse {
  events: StudyEvent[];
  hasPlan: boolean;
  planId?: string;
  goal?: StudyGoal;
  adaptationDue?: string;
  lastAgentNote?: string;
}

export interface CreatePlanRequest {
  goal: StudyGoal;
  weeklySchedule: WeeklySchedule;
  syncToGoogleCalendar: boolean;
  syncToMicrosoftCalendar: boolean;
  googleAccessToken?: string;
  microsoftAccessToken?: string;
}

export interface UpdateEventRequest {
  status: string;
  completedAt?: string;
  linkedResourceId?: string;
  linkedResourceType?: string;
}

export interface RescheduleEventRequest {
  newDate: string;
  newStartTime: string;
}

export interface RecordActivityRequest {
  activityType: 'flashcard_review' | 'quiz' | 'speaking' | 'document_upload';
  minutesSpent: number;
  itemsCompleted: number;
  resourceId?: string;
}
