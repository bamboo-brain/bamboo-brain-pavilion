export type NotificationType =
  | 'achievement'
  | 'processing_complete'
  | 'tip'
  | 'system'
  | 'streak_reminder'
  | 'adaptation'
  | 'plan_due';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  resourceId?: string; // linked document/deck/session id
  resourceType?: string; // "document" | "deck" | "session" | "plan"
  actionUrl?: string; // e.g. "/library/doc-id" — navigate on click
  createdAt: string; // ISO date string
}

export interface NegotiateResponse {
  url: string; // SignalR service URL
  accessToken: string; // SignalR access token (different from JWT)
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}
