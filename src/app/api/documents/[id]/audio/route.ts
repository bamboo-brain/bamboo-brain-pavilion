import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDocument } from '@/lib/documents';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { id } = await params;
    const doc = await getDocument(id, session.accessToken);

    if (!doc || doc.fileType !== 'audio') {
      return new Response('Not an audio file', { status: 400 });
    }

    console.log('Fetching audio from:', doc.blobUrl);

    // Azure Blob Storage doesn't support Bearer tokens
    // Try to fetch the blob URL directly (it may have SAS token in URL or public access)
    const audioResponse = await fetch(doc.blobUrl);
    
    if (!audioResponse.ok) {
      console.error('Failed to fetch audio from blob storage:', audioResponse.status, audioResponse.statusText, await audioResponse.text());
      return new Response(`Failed to fetch audio: ${audioResponse.status} ${audioResponse.statusText}`, { status: 500 });
    }

    // Get content type and length from the blob storage response
    const contentType = audioResponse.headers.get('Content-Type') || 'audio/mpeg';
    const contentLength = audioResponse.headers.get('Content-Length') || '';
    
    console.log('Streaming audio:', { contentType, contentLength });

    // Stream the audio file with proper headers for audio playback
    return new Response(audioResponse.body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': contentLength,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Range',
        'Cross-Origin-Resource-Policy': 'cross-origin',
      },
    });
  } catch (error) {
    console.error('Audio proxy error:', error);
    return new Response(`Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
  }
}

export async function HEAD(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { id } = await params;
    const doc = await getDocument(id, session.accessToken);

    if (!doc || doc.fileType !== 'audio') {
      return new Response('Not an audio file', { status: 400 });
    }

    // HEAD request for audio file metadata
    // Azure Blob Storage doesn't support Bearer tokens, fetch directly
    const audioResponse = await fetch(doc.blobUrl, { method: 'HEAD' });
    
    if (!audioResponse.ok) {
      console.error('Failed to fetch audio metadata:', audioResponse.status);
      return new Response('Failed to fetch audio metadata', { status: 500 });
    }

    const contentType = audioResponse.headers.get('Content-Type') || 'audio/mpeg';
    const contentLength = audioResponse.headers.get('Content-Length') || '';

    return new Response(null, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': contentLength,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      },
    });
  } catch (error) {
    console.error('Audio HEAD error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Range',
    },
  });
}
