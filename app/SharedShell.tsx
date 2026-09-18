import { SHARED_BODY_HTML } from '@/lib/shared-body';
import { activateRoute } from '@/lib/activate-route';
import { ShellRehydrate } from '@/app/ShellRehydrate';
import { routeJsonLd } from '@/lib/seo';
import { servicePageMap } from '@/lib/landing-pages';
import { blogGridHtml, priceRowsHtml, footPopularHtml } from '@/lib/seo-html';

// Server Component: renders the header / mega-menus / mobile panel / footer /
// modals markup of the original index.html via dangerouslySetInnerHTML, with
// ONLY this route's page-view section (see lib/activate-route.ts for why).
// Nothing here is re-authored as JSX, which would risk drift on a block full
// of inline onclick handlers and inline SVG.
//
// `custom` lets server-built pages (assessment pages, articles) supply their
// own section while keeping the same shell. Lists the app script normally
// builds in the browser (blog grid, price table) are server-rendered here so
// their content and links are in the HTML search engines read.
export function SharedShell({
  activeRouteId,
  custom,
  jsonLd = [],
}: {
  activeRouteId: string;
  custom?: { html: string; navId: string };
  jsonLd?: string[];
}) {
  const servicePages = servicePageMap();
  const fill: Record<string, string> = { footPopular: footPopularHtml() };
  if (activeRouteId === 'blog' && !custom) fill.blogGrid = blogGridHtml();
  if (activeRouteId === 'pricing' && !custom) fill.priceTableBody = priceRowsHtml(servicePages);

  const html = activateRoute(SHARED_BODY_HTML, activeRouteId, { customSection: custom, fill });
  const blocks = [...(custom ? [] : routeJsonLd(activeRouteId)), ...jsonLd];
  return (
    <>
      <div id="eldava-shell" dangerouslySetInnerHTML={{ __html: html }} />
      {/* Read by public/eldava-app.js to link services to their pages. */}
      <script id="eldavaServicePages" type="application/json" dangerouslySetInnerHTML={{ __html: JSON.stringify(servicePages) }} />
      {blocks.map((b, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: b.replace(/</g, '\\u003c') }} />
      ))}
      {/* Re-runs the app script's DOM setup if React ever re-applies the
          string above - see ShellRehydrate.tsx. */}
      <ShellRehydrate />
    </>
  );
}
