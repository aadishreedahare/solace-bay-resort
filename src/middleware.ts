import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

// Only lets ADMIN / STAFF into /admin. The admin layout and server actions check again.
export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role;

    if (!role) {
      const signInUrl = new URL('/login', req.url);
      signInUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }
    if (role !== 'ADMIN' && role !== 'STAFF') {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
  },
  { callbacks: { authorized: () => true } },
);

export const config = { matcher: ['/admin/:path*'] };
