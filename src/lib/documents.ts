const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export interface ExtractedWord {
  word: string;
  pinyin: string;
  meaning: string;
  hskLevel: number;
  frequency: number;
  offsetSeconds?: number;
  durationSeconds?: number;
}

export interface Document {
  id: string;
  userId: string;
  fileName: string;
  fileType: 'pdf' | 'video' | 'audio' | 'ppt';
  mimeType: string;
  fileSize: number;
  blobUrl: string;
  blobPath: string;
  hskLevel: number | null;
  pageCount: number | null;
  duration: string | null;
  extractionStatus: 'pending' | 'analyzing' | 'ready' | 'error';
  extractionProgress: number;
  extractedText: string | null;
  extractedWords: ExtractedWord[];
  tags: string[];
  uploadedAt: string;
  updatedAt: string;
}

export interface DocumentListResponse {
  items: Document[];
  pagination: {
    pageSize: number;
    totalCount: number;
    continuationToken: string | null;
    hasMore: boolean;
  };
}

export type FileTypeFilter = 'pdf' | 'video' | 'audio' | 'ppt' | 'all';

export async function uploadDocument(file: File, accessToken: string): Promise<Document> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_URL}/api/documents/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Upload failed');
  return data as Document;
}

export async function listDocuments(
  accessToken: string,
  params: {
    pageSize?: number;
    continuationToken?: string;
    fileType?: FileTypeFilter;
    search?: string;
  } = {},
): Promise<DocumentListResponse> {
  const query = new URLSearchParams();
  if (params.pageSize) query.set('pageSize', String(params.pageSize));
  if (params.continuationToken) query.set('continuationToken', params.continuationToken);
  if (params.fileType && params.fileType !== 'all') query.set('fileType', params.fileType);
  if (params.search) query.set('search', params.search);

  const res = await fetch(`${API_URL}/api/documents?${query}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Failed to fetch documents');
  return res.json();
}

export async function getDocument(id: string, accessToken: string): Promise<Document> {
  const res = await fetch(`${API_URL}/api/documents/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Document not found');
  return res.json();
}

export interface DocumentStatus {
  id: string;
  extractionStatus: string; // 'pending' | 'analyzing' | 'ready' | 'failed' | 'error'
  extractionProgress: number;
  hskLevel: number | null;
  wordCount: number;
  tags: string[];
}

export async function getDocumentStatus(id: string, accessToken: string): Promise<DocumentStatus> {
  const res = await fetch(`${API_URL}/api/documents/${id}/status`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Status check failed');
  return res.json();
}

export async function deleteDocument(id: string, accessToken: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/documents/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { message?: string }).message ?? 'Delete failed');
  }
}

export interface AudioUrlResponse {
  url: string;
  expiresIn: number;
}

export async function getAudioUrl(id: string, accessToken: string): Promise<AudioUrlResponse> {
  const res = await fetch(`${API_URL}/api/documents/${id}/audio-url`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Failed to get audio URL');
  return res.json();
}
