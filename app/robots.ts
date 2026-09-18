import type { MetadataRoute } from 'next';
import { siteOrigin } from '@/lib/seo';

// Account, clinician and admin areas are app screens, not content. The API
// is disallowed so crawlers do not spend their budget on JSON endpoints, and
// mock checkout is a test page.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/account/', '/clinician/', '/admin/', '/api/', '/mock-checkout'],
    },
    sitemap: `${siteOrigin()}/sitemap.xml`,
    host: siteOrigin(),
  };
}
