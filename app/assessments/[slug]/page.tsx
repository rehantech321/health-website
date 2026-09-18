import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SharedShell } from '@/app/SharedShell';
import { LANDING_PAGES, landingPage, landingPath } from '@/lib/landing-pages';
import { landingHtml } from '@/lib/seo-html';
import { landingJsonLd } from '@/lib/seo';

// One page per assessment people search for; content in lib/landing-pages.ts.
export const dynamicParams = false;
export function generateStaticParams() {
  return LANDING_PAGES.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const p = landingPage(params.slug);
  if (!p) return {};
  const path = landingPath(p.slug);
  return {
    title: p.metaTitle,
    description: p.metaDescription,
    alternates: { canonical: path },
    openGraph: { title: p.metaTitle, description: p.metaDescription, url: path, type: 'website' },
    twitter: { title: p.metaTitle, description: p.metaDescription },
  };
}

export default function Page({ params }: { params: { slug: string } }) {
  const p = landingPage(params.slug);
  if (!p) notFound();
  return <SharedShell activeRouteId="assessments" custom={{ html: landingHtml(p), navId: 'pricing' }} jsonLd={landingJsonLd(p)} />;
}
