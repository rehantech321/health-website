import type { MetadataRoute } from 'next';
import { ROUTES } from '@/lib/routes';

// Generated from the same ROUTES table every page.tsx is generated from, so
// it can never drift from what's actually deployed — same guarantee
// build-static-pages.js's sitemap.xml generation gives the static export.
export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.filter(r => !r.noindex).map(r => ({
    url: `https://eldava.com${r.path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: r.id === 'home' ? 1.0 : 0.7,
  }));
}
