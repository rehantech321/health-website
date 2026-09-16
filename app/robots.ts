import type { MetadataRoute } from 'next';

// Same rule as the static export's robots.txt: disallow the account and
// clinician areas, allow everything else.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/account/', '/clinician/', '/admin/'],
    },
    sitemap: 'https://eldava.com/sitemap.xml',
  };
}
