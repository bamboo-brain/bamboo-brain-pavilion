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

    if (!doc || doc.fileType !== 'video') {
      return new Response('Not a video file', { status: 400 });
    }

    console.log('Fetching video from blob:', doc.blobUrl, 'filename:', doc.fileName);

    // Fetch from blob storage
    const videoResponse = await fetch(doc.blobUrl);
    
    if (!videoResponse.ok) {
      console.error('Failed to fetch video from blob storage:', videoResponse.status);
      return new Response('Failed to fetch video', { status: 500 });
    }

    // Determine content type based on file extension
    let contentType = 'video/mp4';
    if (doc.fileName.toLowerCase().endsWith('.mov')) {
      contentType = 'video/quicktime';
    } else if (doc.fileName.toLowerCase().endsWith('.avi')) {
      contentType = 'video/x-msvideo';
    } else if (doc.fileName.toLowerCase().endsWith('.webm')) {
      contentType = 'video/webm';
    }
    
    // Try to get content type from blob response first
    const blobContentType = videoResponse.headers.get('Content-Type');
    if (blobContentType?.startsWith('video/')) {
      contentType = blobContentType;
    }
    
    const contentLength = videoResponse.headers.get('Content-Length');
    
    console.log('Video streaming:', { contentType, contentLength, fileName: doc.fileName });

    // Return response with proper video headers
    return new Response(videoResponse.body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        ...(contentLength ? { 'Content-Length': contentLength } : {}),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
        'Cross-Origin-Resource-Policy': 'cross-origin',
      },
    });
  } catch (error) {
    console.error('Video proxy error:', error);
    return new Response('Internal server error', { status: 500 });
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

    if (!doc || doc.fileType !== 'video') {
      return new Response('Not a video file', { status: 400 });
    }

    const videoResponse = await fetch(doc.blobUrl, { method: 'HEAD' });
    
    if (!videoResponse.ok) {
      return new Response('Not found', { status: 404 });
    }

    const contentType = videoResponse.headers.get('Content-Type') || 'video/mp4';
    const contentLength = videoResponse.headers.get('Content-Length') || '';
    
    return new Response(null, {
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
    console.error('Video HEAD error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}

export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Range',
      'Cross-Origin-Resource-Policy': 'cross-origin',
    },
  });
}
