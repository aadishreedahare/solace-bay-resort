import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { db } from '@/server/db';

// Central NextAuth config, shared by the [...nextauth] route handler and
// any server-side `getServerSession(authOptions)` call (e.g. RBAC guards).
export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });
        if (!user) return null;

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role;
      }
      return session;
    },
  },
};

/**
 * requireRole — server-side guard used at the top of admin API routes and
 * the /admin layout. Throws a 401/403-shaped error the caller can catch and
 * turn into a Response; never trust a client-supplied role.
 */
export function assertRole(
  sessionRole: string | undefined,
  allowed: Array<'CUSTOMER' | 'STAFF' | 'ADMIN'>,
) {
  if (!sessionRole || !allowed.includes(sessionRole as 'CUSTOMER' | 'STAFF' | 'ADMIN')) {
    const error = new Error('Forbidden') as Error & { status?: number };
    error.status = sessionRole ? 403 : 401;
    throw error;
  }
}
