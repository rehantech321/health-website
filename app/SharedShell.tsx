import { SHARED_BODY_HTML } from '@/lib/shared-body';
import { activateRoute } from '@/lib/activate-route';
import { ShellRehydrate } from '@/app/ShellRehydrate';

// Server Component: renders the exact same header / mega-menus / mobile panel /
// 26 page-view sections / footer / modals markup that lives in the original
// index.html, byte-for-byte, via dangerouslySetInnerHTML. This guarantees
// 100% identical DOM/CSS to the current site — nothing here is re-authored
// as JSX, which would risk subtle attribute/whitespace/behavioural drift on
// a ~1,650-line block full of inline onclick handlers and inline SVG.
//
// `activeRouteId` pre-activates the correct `.page-view` section server-side
// (same logic build-static-pages.js uses for the static export), so each
// route's real content is visible on first paint before public/eldava-app.js
// finishes loading — avoiding a flash of the home section on every other route.
export function SharedShell({ activeRouteId }: { activeRouteId: string }) {
  const html = activateRoute(SHARED_BODY_HTML, activeRouteId);
  return (
    <>
      <div id="eldava-shell" dangerouslySetInnerHTML={{ __html: html }} />
      {/* Re-runs the app script's DOM setup if React ever re-applies the
          string above - see ShellRehydrate.tsx. */}
      <ShellRehydrate />
    </>
  );
}
