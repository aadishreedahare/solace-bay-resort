import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

/**
 * Edge-level defense-in-depth for /admin/*. The real authority is still the
 * server-side check in src/app/admin/layout.tsx (and assertRole() inside
 * every admin server action / API route) — this middleware exists so an
 * unauthenticated or wrong-role request never even reaches a page render.
 */
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const role = token?.role as string | undefined;

    if (!token) {
      const signInUrl = new URL('/login', req.url);
      signInUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }

    if (role !== 'ADMIN' && role !== 'STAFF') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Always run the middleware function above ourselves — we do the
      // redirect logic manually so we can send STAFF/ADMIN vs. unauthenticated
      // users to different places instead of a single generic sign-in bounce.
      authorized: () => true,
    },
  },
);

export const config = {
  matcher: ['/admin/:path*'],
};
