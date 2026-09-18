// Structured data and URLs for search engines.
//
// JSON-LD used to be emitted in full on every page - including an FAQPage,
// a HowTo, a Person and ten Service blocks - so every URL claimed to be every
// kind of page. Google requires structured data to describe the page it is
// on, so blocks are now assigned to the route whose visible content they
// describe, and only the organisation/website blocks are sitewide.

import { JSON_LD_BLOCKS } from '@/lib/json-ld';
import { findService, gbp, plain, ARTICLES_REVIEWED, type Article } from '@/lib/catalogue';
import { landingPath, type LandingPage } from '@/lib/landing-pages';

/// The public origin. Canonicals, sitemap and structured data all use it, so
/// switching from app.eldava.com to eldava.com is one environment variable.
export function siteOrigin(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'https://eldava.com').replace(/\/$/, '');
}
const abs = (p: string) => siteOrigin() + p;

// Indices into JSON_LD_BLOCKS (lib/json-ld.ts), by the page they describe.
// Block 6 (a BreadcrumbList of #hash URLs) is dropped: breadcrumbs are now
// generated per page with real URLs.
const SITEWIDE = [0, 4, 5]; // MedicalBusiness, Organization, WebSite
const BY_ROUTE: Record<string, number[]> = {
  how: [1, 2], // FAQPage (the FAQ accordion is on this page), HowTo
  'founder-note': [3], // Person
  pricing: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 18], // Services + ItemList
  founding500: [17], // Offer
  blog: [19], // Blog
};

/// Rewrites the hard-coded https://eldava.com in the stored blocks to the
/// configured origin so structured data never points at another host.
function withOrigin(json: string): string {
  return siteOrigin() === 'https://eldava.com' ? json : json.split('https://eldava.com').join(siteOrigin());
}

export function sitewideJsonLd(): string[] {
  return SITEWIDE.map((i) => withOrigin(JSON_LD_BLOCKS[i]));
}
export function routeJsonLd(routeId: string): string[] {
  return (BY_ROUTE[routeId] || []).map((i) => withOrigin(JSON_LD_BLOCKS[i]));
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: abs(it.path) })),
  });
}

function faqJsonLd(faqs: { q: string; a: string }[]): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  });
}

export function landingJsonLd(p: LandingPage): string[] {
  const svc = findService(p.service)!;
  const url = abs(landingPath(p.slug));
  return [
    JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'MedicalWebPage',
      '@id': url,
      url,
      name: p.metaTitle,
      description: p.metaDescription,
      inLanguage: 'en-GB',
      about: { '@type': 'MedicalCondition', name: p.about },
      audience: { '@type': 'PeopleAudience', audienceType: 'Patient' },
      lastReviewed: ARTICLES_REVIEWED,
      publisher: { '@type': 'Organization', name: 'Eldava Health', url: abs('/') },
      mainEntity: {
        '@type': 'Service',
        name: p.service,
        serviceType: p.eyebrow,
        description: p.lede,
        provider: { '@type': 'MedicalBusiness', name: 'Eldava Health', url: abs('/') },
        availableChannel: { '@type': 'ServiceChannel', name: 'Live video consultation', serviceUrl: url },
        offers: {
          '@type': 'Offer',
          price: (svc.priceMinor / 100).toFixed(2),
          priceCurrency: 'GBP',
          availability: 'https://schema.org/InStock',
          url,
          description: `${gbp(svc.priceMinor)}, ${svc.durationLabel}, written report included. Pay in full or in 3 instalments where available.`,
        },
      },
    }),
    faqJsonLd(p.faqs),
    breadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Assessments', path: '/assessments/' },
      { name: p.eyebrow, path: landingPath(p.slug) },
    ]),
  ];
}

export function articleJsonLd(a: Article): string[] {
  const url = abs(`/insights/${a.id}/`);
  return [
    JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      '@id': url,
      mainEntityOfPage: url,
      headline: a.title,
      description: a.excerpt,
      articleBody: plain(a.body).slice(0, 5000),
      inLanguage: 'en-GB',
      datePublished: ARTICLES_REVIEWED,
      dateModified: ARTICLES_REVIEWED,
      author: { '@type': 'Organization', name: 'Eldava Health', url: abs('/') },
      publisher: { '@type': 'Organization', name: 'Eldava Health', url: abs('/'), logo: { '@type': 'ImageObject', url: abs('/icon') } },
      image: abs('/opengraph-image'),
    }),
    breadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Insights', path: '/insights/' },
      { name: a.title, path: `/insights/${a.id}/` },
    ]),
  ];
}
