import { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import AzureADProvider from 'next-auth/providers/azure-ad';
import GoogleProvider from 'next-auth/providers/google';
import { type JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      hskLevel?: number | null;
      isOnboardingComplete?: boolean;
    };
    accessToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    sub?: string;
    accessToken?: string;
    hskLevel?: number | null;
    isOnboardingComplete?: boolean;
  }
}

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const res = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });

        if (!res.ok) return null;

        const data: {
          message: string;
          token: string;
          user: { id: string; name: string; email: string; image: string | null; hskLevel: number; isOnboardingComplete: boolean };
        } = await res.json();

        return {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          image: data.user.image,
          accessToken: data.token,
          hskLevel: data.user.hskLevel,
          isOnboardingComplete: data.user.isOnboardingComplete,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      // On first sign-in via credentials, populate from user object
      if (user && (!account || account.provider === 'credentials')) {
        const u = user as typeof user & { accessToken?: string; hskLevel?: number; isOnboardingComplete?: boolean };
        token.sub = user.id;
        token.accessToken = u.accessToken;
        token.hskLevel = u.hskLevel;
        token.isOnboardingComplete = u.isOnboardingComplete;
      }

      // On first sign-in via OAuth (Google / Azure AD), upsert the user in the backend
      if (account && (account.provider === 'google' || account.provider === 'azure-ad')) {
        // Guard against missing API_URL
        if (!API_URL) {
          console.error('[NextAuth] API_URL is undefined — check environment variables');
          throw new Error('API_URL is not configured');
        }

        console.log('[NextAuth] API_URL:', API_URL);
        console.log('[NextAuth] upserting:', token.email);

        const res = await fetch(`${API_URL}/api/users/upsert-oauth`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: token.email,
            name: token.name,
            image: token.picture ?? null,
            provider: account.provider,
          }),
        });

        if (!res.ok) {
          const body = await res.text().catch(() => '');
          throw new Error(`upsert-oauth failed [${res.status}]: ${body}`);
        }

        const data: {
          token: string;
          user: { id: string; hskLevel: number; isOnboardingComplete: boolean };
        } = await res.json();

        token.sub = data.user.id;
        token.hskLevel = data.user.hskLevel;
        token.isOnboardingComplete = data.user.isOnboardingComplete;
        token.accessToken = data.token;
      }

      // When session is updated client-side via update()
      if (trigger === 'update' && session?.isOnboardingComplete !== undefined) {
        token.isOnboardingComplete = session.isOnboardingComplete;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? '';
        session.user.hskLevel = token.hskLevel;
        session.user.isOnboardingComplete = token.isOnboardingComplete;
      }
      session.accessToken = token.accessToken;
      return session;
    },
  },
};
