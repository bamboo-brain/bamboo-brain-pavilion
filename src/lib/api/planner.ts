import type {
  StudyPlan,
  CalendarResponse,
  CreatePlanRequest,
  UpdateEventRequest,
  RescheduleEventRequest,
  RecordActivityRequest,
} from '@/types/planner';
import type { UserStats } from '@/types/stats';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function createPlan(
  request: CreatePlanRequest,
  accessToken: string,
): Promise<StudyPlan> {
  const res = await fetch(`${API_URL}/api/planner/plans`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(request),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Failed to create plan');
  return data;
}

export async function getActivePlan(
  accessToken: string,
): Promise<StudyPlan | null> {
  const res = await fetch(`${API_URL}/api/planner/plans/active`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.hasPlan) return null;
  return data;
}

export async function getCalendarEvents(
  year: number,
  month: number,
  accessToken: string,
): Promise<CalendarResponse> {
  const res = await fetch(
    `${API_URL}/api/planner/calendar?year=${year}&month=${month}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!res.ok) throw new Error('Failed to fetch calendar');
  return res.json();
}

export async function updateEvent(
  planId: string,
  eventId: string,
  request: UpdateEventRequest,
  accessToken: string,
): Promise<StudyPlan> {
  const res = await fetch(
    `${API_URL}/api/planner/plans/${planId}/events/${eventId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(request),
    },
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Failed to update event');
  return data;
}

export async function rescheduleEvent(
  planId: string,
  eventId: string,
  request: RescheduleEventRequest,
  accessToken: string,
): Promise<StudyPlan> {
  const res = await fetch(
    `${API_URL}/api/planner/plans/${planId}/events/${eventId}/reschedule`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(request),
    },
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Failed to reschedule event');
  return data;
}

export async function adaptPlan(
  planId: string,
  accessToken: string,
): Promise<StudyPlan> {
  const res = await fetch(`${API_URL}/api/planner/plans/${planId}/adapt`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Failed to adapt plan');
  return data;
}

export async function recordActivity(
  request: RecordActivityRequest,
  accessToken: string,
): Promise<void> {
  await fetch(`${API_URL}/api/planner/activity`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(request),
  });
}

export async function getUserStats(accessToken: string): Promise<UserStats> {
  const res = await fetch(`${API_URL}/api/planner/stats`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}
