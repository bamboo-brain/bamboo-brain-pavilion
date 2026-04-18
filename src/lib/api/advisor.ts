import type { AdvisorChatRequest, AdvisorChatResponse } from '@/types/advisor';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function chatWithAdvisor(
  request: AdvisorChatRequest,
  accessToken: string,
): Promise<AdvisorChatResponse> {
  const res = await fetch(`${API_URL}/api/advisor/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(request),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Advisor chat failed');
  return data;
}
