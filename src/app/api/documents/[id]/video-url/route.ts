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
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const { id } = await params;
    const doc = await getDocument(id, session.accessToken);

    if (!doc || doc.fileType !== 'video') {
      return new Response(JSON.stringify({ error: 'Not a video file' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    console.log('Returning video URL for:', id);

    // Return the proxied video endpoint URL
    // The /video endpoint will handle authentication and CORS properly
    const videoUrl = `/api/documents/${id}/video`;
    
    return new Response(JSON.stringify({
      url: videoUrl,
      expiresIn: 3600, // 1 hour cache
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Video URL error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
