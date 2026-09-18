// Turns the shared body markup (every page-view section of the original
// single-page site) into the HTML for ONE route.
//
// Originally every URL shipped all 27 sections and CSS hid all but one. For
// search engines that meant every page carried the full text of the whole
// site - near-duplicate pages, diluted relevance and ~130 KB of HTML each.
// Now each route ships only its own section, plus the account/clinician
// sections the booking and sign-in flows need on every page (all noindex).
// Navigating to a section that is not in the page is a normal page load
// (see Eldava.go in public/eldava-app.js).

/// Sections that must exist on every page: the booking flow sends signed-out
/// visitors to `register`, and the account/clinician areas are app screens,
/// not content.
const ALWAYS_KEEP = new Set(['register', 'profile', 'clinician-login', 'clinician-portal']);

type Section = { id: string; start: number; end: number };

/// Every `.page-view` section with its exact extent, found by matching
/// <div> nesting rather than by guessing at comments.
function findSections(html: string): Section[] {
  const out: Section[] = [];
  const open = /<div id="page-([a-z0-9-]+)" class="page-view[^"]*"[^>]*>/g;
  let m: RegExpExecArray | null;
  while ((m = open.exec(html))) {
    const start = m.index;
    const tag = /<div\b|<\/div>/g;
    tag.lastIndex = start + m[0].length;
    let depth = 1;
    let t: RegExpExecArray | null;
    while (depth > 0 && (t = tag.exec(html))) depth += t[0] === '</div>' ? -1 : 1;
    const end = tag.lastIndex;
    out.push({ id: m[1], start, end });
    open.lastIndex = end;
  }
  return out;
}

/// The hero heading of a content section is an <h2> in the original markup,
/// which left every page except home with no <h1>. Promote the first hero
/// heading of the page actually being served.
function promoteHeroHeading(section: string): string {
  if (/<h1[\s>]/.test(section)) return section;
  const hero = section.indexOf('class="page-hero"');
  if (hero === -1) return section;
  const h2 = section.indexOf('<h2', hero);
  if (h2 === -1) return section;
  const close = section.indexOf('</h2>', h2);
  if (close === -1) return section;
  return section.slice(0, h2) + '<h1' + section.slice(h2 + 3, close) + '</h1>' + section.slice(close + 5);
}

function markActive(section: string, active: boolean): string {
  return section.replace(/^(<div id="page-[a-z0-9-]+" class=")([^"]*)(")/, (_all, a, cls: string, z) => {
    const classes = cls.split(/\s+/).filter((c) => c && c !== 'active');
    if (active) classes.push('active');
    return a + classes.join(' ') + z;
  });
}

export type ShellOptions = {
  /// Replace the route's section content with this HTML (used by pages that
  /// are not part of the original markup: articles, assessment pages).
  customSection?: { html: string; navId: string };
  /// Replace an element's (empty) inner HTML by id, for server-rendering
  /// lists the app script would otherwise build in the browser.
  fill?: Record<string, string>;
};

export function activateRoute(bodyHtml: string, routeId: string, opts: ShellOptions = {}): string {
  const sections = findSections(bodyHtml);
  if (!sections.length) return bodyHtml;

  let out = bodyHtml.slice(0, sections[0].start);
  let inserted = false;
  sections.forEach((s, i) => {
    const between = i > 0 ? bodyHtml.slice(sections[i - 1].end, s.start) : '';
    out += between;
    const isRoute = !opts.customSection && s.id === routeId;
    if (!inserted && opts.customSection && !ALWAYS_KEEP.has(s.id)) {
      out += `<div id="page-custom" class="page-view active" data-nav="${opts.customSection.navId}">${opts.customSection.html}</div>`;
      inserted = true;
    }
    if (isRoute) out += markActive(promoteHeroHeading(bodyHtml.slice(s.start, s.end)), true);
    else if (ALWAYS_KEEP.has(s.id)) out += markActive(bodyHtml.slice(s.start, s.end), false);
  });
  out += bodyHtml.slice(sections[sections.length - 1].end);

  for (const [id, inner] of Object.entries(opts.fill || {})) {
    const re = new RegExp(`(<[a-z]+[^>]*\\bid="${id}"[^>]*>)(</[a-z]+>)`);
    out = out.replace(re, `$1${inner}$2`);
  }
  return out;
}
