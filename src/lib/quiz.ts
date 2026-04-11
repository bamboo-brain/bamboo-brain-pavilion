import type {
  QuizSession,
  GenerateQuizRequest,
  SubmitAnswerRequest,
  SubmitAnswerResponse,
  QuizStats,
} from '@/types/quiz';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type { QuizSession, GenerateQuizRequest, SubmitAnswerRequest, SubmitAnswerResponse, QuizStats };

export async function generateQuiz(
  request: GenerateQuizRequest,
  accessToken: string,
): Promise<QuizSession> {
  const res = await fetch(`${API_URL}/api/quiz/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(request),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Failed to generate quiz');
  return data;
}

export async function getSession(
  sessionId: string,
  accessToken: string,
): Promise<QuizSession> {
  const res = await fetch(`${API_URL}/api/quiz/sessions/${sessionId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Session not found');
  return res.json();
}

export async function getSessions(
  accessToken: string,
): Promise<QuizSession[]> {
  const res = await fetch(`${API_URL}/api/quiz/sessions`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Failed to fetch sessions');
  return res.json();
}

export async function submitAnswer(
  sessionId: string,
  request: SubmitAnswerRequest,
  accessToken: string,
): Promise<SubmitAnswerResponse> {
  const res = await fetch(`${API_URL}/api/quiz/sessions/${sessionId}/answer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(request),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Failed to submit answer');
  return data;
}

export async function completeQuiz(
  sessionId: string,
  accessToken: string,
): Promise<QuizSession> {
  const res = await fetch(`${API_URL}/api/quiz/sessions/${sessionId}/complete`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Failed to complete quiz');
  return data;
}

export async function deleteSession(
  sessionId: string,
  accessToken: string,
): Promise<void> {
  await fetch(`${API_URL}/api/quiz/sessions/${sessionId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function getQuizStats(
  accessToken: string,
): Promise<QuizStats> {
  const res = await fetch(`${API_URL}/api/quiz/stats`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}
