import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';
import type { NextRequest } from 'next/server';

// In Next.js 16, params in Route Handlers are a Promise.
// NextAuth v4 reads params.nextauth synchronously to determine the action,
// so we must await the params before passing them to the handler.

const handler = NextAuth(authOptions);

export const dynamic = 'force-dynamic';

async function GET(
  req: NextRequest,
  context: { params: Promise<{ nextauth: string[] }> },
) {
  const params = await context.params;
  return handler(req, { params });
}

async function POST(
  req: NextRequest,
  context: { params: Promise<{ nextauth: string[] }> },
) {
  const params = await context.params;
  return handler(req, { params });
}

export { GET, POST };
