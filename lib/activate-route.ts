// Mirrors the pre-activation logic in build-static-pages.js exactly: given the
// shared body markup and the id of the route being server-rendered, mark that
// route's `.page-view` section active (and, unless it IS home, deactivate
// `page-home`, which ships pre-activated in the source markup as the default
// view). This gives every route real, visible, correct content on first
// paint/SSR — no flash of the wrong section before client JS runs — exactly
// like the static-export build already does for the non-Next.js deliverable.
export function activateRoute(bodyHtml: string, routeId: string): string {
  let html = bodyHtml;

  if (routeId !== 'home') {
    html = html.replace(
      'id="page-home" class="page-view active"',
      'id="page-home" class="page-view"'
    );
  }

  const idAttr = `id="page-${routeId}"`;
  const idPos = html.indexOf(idAttr);
  if (idPos === -1) return html;

  const classMatch = html.slice(idPos).match(/^id="page-[a-z0-9-]+"\s+class="([^"]*)"/);
  if (!classMatch) return html;
  if (classMatch[1].split(' ').includes('active')) return html;

  const oldTag = `${idAttr} class="${classMatch[1]}"`;
  const newTag = `${idAttr} class="${classMatch[1]} active"`;
  return html.replace(oldTag, newTag);
}
