import type { DocumentSearchResult, ChatRequest, ChatResponse } from '@/types/search';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function searchDocuments(
  query: string,
  accessToken: string,
  options?: {
    top?: number;
    fileType?: string;
    hskLevel?: number;
  },
): Promise<DocumentSearchResult> {
  const params = new URLSearchParams({ q: query });
  if (options?.top) params.set('top', String(options.top));
  if (options?.fileType) params.set('fileType', options.fileType);
  if (options?.hskLevel) params.set('hskLevel', String(options.hskLevel));

  const res = await fetch(`${API_URL}/api/search/documents?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}

export async function chatWithDocuments(
  request: ChatRequest,
  accessToken: string,
): Promise<ChatResponse> {
  const res = await fetch(`${API_URL}/api/search/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(request),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Chat failed');
  return data;
}

export async function reindexDocument(documentId: string, accessToken: string): Promise<void> {
  await fetch(`${API_URL}/api/search/index/${documentId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}
