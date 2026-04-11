import type {
  SpeakingSession,
  StartSessionRequest,
  ProcessAudioRequest,
  ProcessTextRequest,
  EndSessionRequest,
  SpeakingStats,
  SuggestedTopic,
  ConversationTurn,
} from '@/types/speaking';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function startSession(
  request: StartSessionRequest,
  accessToken: string,
): Promise<SpeakingSession> {
  const res = await fetch(`${API_URL}/api/speaking/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(request),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Failed to start session');
  return data;
}

export async function getSessions(
  accessToken: string,
): Promise<SpeakingSession[]> {
  const res = await fetch(`${API_URL}/api/speaking/sessions`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Failed to fetch sessions');
  return res.json();
}

export async function getSession(
  sessionId: string,
  accessToken: string,
): Promise<SpeakingSession> {
  const res = await fetch(`${API_URL}/api/speaking/sessions/${sessionId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Session not found');
  return res.json();
}

export async function processAudioTurn(
  sessionId: string,
  request: ProcessAudioRequest,
  accessToken: string,
): Promise<ConversationTurn> {
  const res = await fetch(
    `${API_URL}/api/speaking/sessions/${sessionId}/turn/audio`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(request),
    },
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Failed to process audio');
  return data;
}

export async function processTextTurn(
  sessionId: string,
  request: ProcessTextRequest,
  accessToken: string,
): Promise<ConversationTurn> {
  const res = await fetch(
    `${API_URL}/api/speaking/sessions/${sessionId}/turn/text`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(request),
    },
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Failed to process text');
  return data;
}

export async function endSession(
  sessionId: string,
  request: EndSessionRequest,
  accessToken: string,
): Promise<SpeakingSession> {
  const res = await fetch(
    `${API_URL}/api/speaking/sessions/${sessionId}/end`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(request),
    },
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Failed to end session');
  return data;
}

export async function deleteSession(
  sessionId: string,
  accessToken: string,
): Promise<void> {
  await fetch(`${API_URL}/api/speaking/sessions/${sessionId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function getSpeakingStats(
  accessToken: string,
): Promise<SpeakingStats> {
  const res = await fetch(`${API_URL}/api/speaking/stats`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export async function getSuggestedTopics(
  accessToken: string,
): Promise<SuggestedTopic[]> {
  const res = await fetch(`${API_URL}/api/speaking/topics`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Failed to fetch topics');
  return res.json();
}
