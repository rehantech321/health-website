import { NextResponse, type NextRequest } from 'next/server';

// next.config.js sets skipTrailingSlashRedirect so API routes are reachable
// at /api/... without a 308. This reinstates the trailing-slash redirect for
// pages only, so /pricing still lands on /pricing/ exactly as before.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isApi = pathname.startsWith('/api/');
  const isFile = /\.[a-zA-Z0-9]+$/.test(pathname); // /eldava-app.js, /robots.txt, ...
  // Images Next generates from app/icon.tsx, app/opengraph-image.tsx etc.
  // are served at the bare path only; a slash-redirect would 404 them.
  const isMetaImage = /^\/(icon|apple-icon|opengraph-image|twitter-image)(\/|$)/.test(pathname);
  const hasSlash = pathname.endsWith('/');

  if (!isApi && !isFile && !isMetaImage && !hasSlash) {
    // Deliberately a plain URL, not req.nextUrl.clone(): NextURL normalises
    // the trailing slash back off when it serialises, which turned this into
    // a /pricing -> /pricing redirect loop.
    const target = new URL(`${pathname}/${req.nextUrl.search}`, req.url);
    return NextResponse.redirect(target, 308);
  }

  return NextResponse.next();
}

export const config = {
  // Skip Next's own internals and static assets entirely.
  matcher: ['/((?!_next/|favicon.ico).*)'],
};
