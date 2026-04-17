import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!API_URL) {
      console.error('API_URL environment variable not set');
      return NextResponse.json(
        { error: 'Server configuration error: API_URL not set' },
        { status: 500 }
      );
    }

    console.log('Forwarding negotiate to backend:', `${API_URL}/api/notifications/negotiate`);

    const res = await fetch(`${API_URL}/api/notifications/negotiate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Backend negotiate failed:', res.status, res.statusText, errorText);
      return NextResponse.json(
        { error: `Backend error: ${res.statusText}`, details: errorText },
        { status: res.status }
      );
    }

    const data = await res.json();
    console.log('Negotiate success, returning SignalR URL');
    return NextResponse.json(data);
  } catch (error) {
    console.error('SignalR negotiate error:', error);
    return NextResponse.json(
      { error: 'Failed to negotiate SignalR connection', details: String(error) },
      { status: 500 }
    );
  }
}
