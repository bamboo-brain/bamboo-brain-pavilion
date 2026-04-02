import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function proxy(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    const isOnboardingRoute = pathname.startsWith('/onboarding');

    // Authenticated but onboarding not yet complete → force to onboarding
    if (!token?.isOnboardingComplete && !isOnboardingRoute) {
      return NextResponse.redirect(new URL('/onboarding', req.url));
    }

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
     * - /login
     * - /api/auth (NextAuth endpoints)
     * - /_next (Next.js internals)
     * - /favicon.ico, static files
     */
    '/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
