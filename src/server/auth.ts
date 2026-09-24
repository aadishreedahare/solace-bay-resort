import type { NextAuthOptions } from 'next-auth';
import { getServerSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { db } from '@/server/db';

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const user = await db.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });
        if (!user || !(await bcrypt.compare(credentials.password, user.passwordHash))) return null;

        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
};

export class AuthError extends Error {
  constructor(public status: 401 | 403) {
    super(status === 401 ? 'Unauthorized' : 'Forbidden');
  }
}

// Throws unless the signed-in user has one of the allowed roles. Returns the session.
export async function requireRole(allowed: UserRole[]) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  if (!role) throw new AuthError(401);
  if (!allowed.includes(role)) throw new AuthError(403);
  return session;
}
