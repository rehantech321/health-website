import { readFileSync } from 'fs';
import path from 'path';
import { SERVICES, type Service } from '@/lib/server/services';

// Articles live in public/eldava-app.js (the app script renders the blog
// grid from them). The article pages read the same array at build time so
// there is one copy of every article, not two that drift apart.

export type Article = {
  id: string;
  cat: string;
  title: string;
  excerpt: string;
  read: string;
  body: string;
  cta?: { text: string; action: string };
};

/// Date the article library was last clinically reviewed (shown in the app too).
export const ARTICLES_REVIEWED = '2026-09-02';

let cache: { cats: Record<string, string>; articles: Article[] } | null = null;

function load() {
  if (cache) return cache;
  const js = readFileSync(path.join(process.cwd(), 'public', 'eldava-app.js'), 'utf8');
  const grab = (start: string, endToken: string) => {
    const a = js.indexOf(start);
    if (a === -1) throw new Error(`catalogue: "${start}" not found in eldava-app.js`);
    const b = js.indexOf(endToken, a);
    return js.slice(a + start.length, b + endToken.length - 1).trim();
  };
  // Both are plain object/array literals (template-literal bodies included).
  const cats = new Function(`return ${grab('var ARTICLE_CATS =', '};')}`)() as Record<string, string>;
  const articles = new Function(`return ${grab('var ARTICLES =', '\n  ];')}`)() as Article[];
  cache = { cats, articles };
  return cache;
}

export function allArticles(): Article[] {
  return load().articles;
}
export function articleCategories(): Record<string, string> {
  return load().cats;
}
export function findArticle(id: string): Article | undefined {
  return load().articles.find((a) => a.id === id);
}

export function findService(name: string): Service | undefined {
  return SERVICES.find((s) => s.name === name);
}

/// "£685" / "£1,145" from pence.
export function gbp(minor: number): string {
  const pounds = minor / 100;
  return '£' + (Number.isInteger(pounds) ? pounds.toLocaleString('en-GB') : pounds.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
}

/// First of three instalments, matching threeSplit() in the app script.
export function firstInstalment(minor: number): string {
  const total = minor / 100;
  return gbp(Math.round((Math.round((total / 3) * 100) / 100) * 100));
}

/// Strips tags for meta descriptions / JSON-LD text.
export function plain(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim();
}
