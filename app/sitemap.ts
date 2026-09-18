import type { MetadataRoute } from 'next';
import { ROUTES } from '@/lib/routes';
import { LANDING_PAGES, landingPath } from '@/lib/landing-pages';
import { allArticles, ARTICLES_REVIEWED } from '@/lib/catalogue';
import { siteOrigin } from '@/lib/seo';

// Every indexable URL: the original routes, the assessments hub and pages,
// and every article. Uses the configured public origin so the sitemap never
// lists a host the site is not served from. lastModified is a real content
// date where there is one, not "now" on every build (which search engines
// learn to ignore).
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteOrigin();
  const reviewed = new Date(ARTICLES_REVIEWED);
  const high = new Set(['home', 'pricing', 'how', 'screening']);
  return [
    ...ROUTES.filter((r) => !r.noindex).map((r) => ({
      url: `${base}${r.path}`,
      changeFrequency: 'weekly' as const,
      priority: r.id === 'home' ? 1.0 : high.has(r.id) ? 0.8 : 0.6,
    })),
    { url: `${base}/assessments/`, changeFrequency: 'weekly' as const, priority: 0.9 },
    ...LANDING_PAGES.map((p) => ({ url: `${base}${landingPath(p.slug)}`, lastModified: reviewed, changeFrequency: 'monthly' as const, priority: 0.9 })),
    ...allArticles().map((a) => ({ url: `${base}/insights/${a.id}/`, lastModified: reviewed, changeFrequency: 'monthly' as const, priority: 0.6 })),
  ];
}
