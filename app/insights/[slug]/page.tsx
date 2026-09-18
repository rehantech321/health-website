import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SharedShell } from '@/app/SharedShell';
import { allArticles, findArticle, ARTICLES_REVIEWED } from '@/lib/catalogue';
import { articleHtml } from '@/lib/seo-html';
import { articleJsonLd } from '@/lib/seo';

// Every article at its own URL. The articles themselves live in
// public/eldava-app.js (ARTICLES) - see lib/catalogue.ts.
export const dynamicParams = false;
export function generateStaticParams() {
  return allArticles().map((a) => ({ slug: a.id }));
}

const reviewedLabel = new Date(ARTICLES_REVIEWED + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const a = findArticle(params.slug);
  if (!a) return {};
  const path = `/insights/${a.id}/`;
  const title = `${a.title} | Eldava Health`;
  return {
    title,
    description: a.excerpt,
    alternates: { canonical: path },
    openGraph: { title, description: a.excerpt, url: path, type: 'article', publishedTime: ARTICLES_REVIEWED, modifiedTime: ARTICLES_REVIEWED },
    twitter: { title, description: a.excerpt },
  };
}

export default function Page({ params }: { params: { slug: string } }) {
  const a = findArticle(params.slug);
  if (!a) notFound();
  return <SharedShell activeRouteId="blog-article" custom={{ html: articleHtml(a, reviewedLabel), navId: 'blog' }} jsonLd={articleJsonLd(a)} />;
}
