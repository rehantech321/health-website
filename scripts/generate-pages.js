#!/usr/bin/env node
// Generates app/<route>/page.tsx for every entry in ROUTES below.
// Keep this array in sync with lib/routes.ts (and, upstream of that, with
// PAGE_PATHS/titles/descs inside public/eldava-app.js) — same three-way sync
// requirement DEV-HANDOFF.md documents for build-static-pages.js.
// Re-run with `npm run gen` after adding or changing a route.
const fs = require('fs');
const path = require('path');

const ROUTES = [
  { id: 'home', path: '/' },
  { id: 'pricing', path: '/pricing/' },
  { id: 'how', path: '/how-it-works/' },
  { id: 'pathway', path: '/complete-pathway/' },
  { id: 'pharmacy', path: '/pharmacy-delivery/' },
  { id: 'academy', path: '/clinician-training-academy/' },
  { id: 'ai', path: '/guided-intake-technology/' },
  { id: 'outcomes', path: '/outcomes-and-transparency/' },
  { id: 'corporate', path: '/for-employers/' },
  { id: 'schools', path: '/for-schools/' },
  { id: 'universities', path: '/for-universities/' },
  { id: 'insurers', path: '/for-insurers/' },
  { id: 'health-systems', path: '/for-health-systems/' },
  { id: 'legal', path: '/for-legal-and-solicitors/' },
  { id: 'charity', path: '/charity-partnership/' },
  { id: 'founding500', path: '/founding-500/' },
  { id: 'blog', path: '/insights/' },
  { id: 'founders', path: '/founders-circle/' },
  { id: 'events', path: '/events/' },
  { id: 'partner', path: '/join-the-network/' },
  { id: 'about', path: '/about/' },
  { id: 'founder-note', path: '/founders-note/' },
  { id: 'register', path: '/account/register/' },
  { id: 'profile', path: '/account/profile/' },
  { id: 'screening', path: '/free-screening-tools/' },
  { id: 'clinician-login', path: '/clinician/sign-in/' },
  { id: 'clinician-portal', path: '/clinician/portal/' },
];

const appDir = path.join(__dirname, '..', 'app');

function pageSource(id) {
  return `import type { Metadata } from 'next';
import { routeById } from '@/lib/routes';
import { SharedShell } from '@/app/SharedShell';

const route = routeById('${id}');

export const metadata: Metadata = {
  title: route.title,
  description: route.description,
  alternates: { canonical: route.path },
  robots: route.noindex ? { index: false, follow: true } : { index: true, follow: true },
  openGraph: { title: route.title, description: route.description, url: route.path },
  twitter: { title: route.title, description: route.description },
};

export default function Page() {
  return <SharedShell activeRouteId="${id}" />;
}
`;
}

for (const r of ROUTES) {
  const dir = r.path === '/' ? appDir : path.join(appDir, r.path.replace(/^\/|\/$/g, ''));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'page.tsx'), pageSource(r.id));
  console.log('wrote', path.join(dir, 'page.tsx'));
}

console.log(`\nGenerated ${ROUTES.length} route pages.`);
