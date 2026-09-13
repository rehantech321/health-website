/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Every route in lib/routes.ts (mirroring PAGE_PATHS in eldava-app.js) is
  // written with a trailing slash (e.g. /pricing/), matching the canonical
  // URLs, sitemap.xml and the original static export in build-static-pages.js.
  // Without this, Next.js serves those routes at /pricing (no slash) and
  // 308-redirects the trailing-slash URL, which would silently change every
  // canonical/OG/sitemap URL versus the current live site.
  trailingSlash: true,
  // Without this, trailingSlash also 308-redirects every /api/* request to
  // /api/*/ - and a webhook sender like Stripe does not follow redirects, so
  // every payment confirmation would be recorded as a failed delivery. The
  // page redirect (/pricing -> /pricing/) is reapplied in middleware.ts for
  // everything that is not an API route.
  skipTrailingSlashRedirect: true,
  // The shared body markup is injected verbatim via dangerouslySetInnerHTML,
  // and public/eldava-app.js manipulates the DOM directly (adding/removing
  // "active" classes, toggling modals, writing into countdown spans, etc.)
  // exactly like it does in the original static index.html. React never
  // re-renders that subtree, so this is safe, but it does mean React is
  // intentionally kept out of that DOM's diffing — matching the previous
  // plain-HTML/vanilla-JS behaviour 1:1 rather than "React-ifying" it.
};

module.exports = nextConfig;
