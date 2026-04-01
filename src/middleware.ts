import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(_req) {
    return NextResponse.next();
  },
  {
    pages: {
      signIn: '/login',
    },
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - /login (sign-in page)
     * - /api/auth (NextAuth endpoints)
     * - /_next (Next.js internals)
     * - /favicon.ico, static files
     */
    '/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
