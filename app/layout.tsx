import type { Metadata } from 'next';
import Script from 'next/script';
import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import path from 'path';
import { JSON_LD_BLOCKS } from '@/lib/json-ld';
import './globals.css';

// Cache-busting for the app script. Browsers do not reliably revalidate a
// script served with max-age=0, so after an edit a tab could keep running the
// old code against new markup and API. Putting a hash of the file's contents
// in the URL makes every change a new URL. This is a Server Component, so the
// read happens at render time on the server (per request in dev, once at build).
function appScriptSrc(): string {
  try {
    const file = readFileSync(path.join(process.cwd(), 'public', 'eldava-app.js'));
    return `/eldava-app.js?v=${createHash('sha1').update(file).digest('hex').slice(0, 12)}`;
  } catch {
    return '/eldava-app.js';
  }
}

// Sitewide defaults — every route overrides title/description/canonical via
// its own page.tsx `metadata` export (mirrors the old titles/descs maps in
// eldava-app.js). Everything below is identical to the static <head> tags
// that used to live at the top of index.html.
export const metadata: Metadata = {
  // Absolute base for og:image / twitter:image. Must be the host the site is
  // actually served from (app.eldava.com today, eldava.com later), or link
  // previews point at an image that does not resolve.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://eldava.com'),
  title: 'Global Specialist Health Assessments Online | Eldava Health',
  description:
    "Eldava Health is a global telehealth platform for specialist diagnostic assessments: ADHD and autism, women's health, dementia and memory, men's health, medico-legal reports and more. Licensed clinicians, live video, often within days, not years. Pay in full or in 3 instalments.",
  keywords:
    "online specialist assessment, telehealth diagnostic assessment, global telehealth platform, private ADHD diagnosis, autism assessment online, women's health telehealth, endometriosis specialist, dementia memory assessment, men's health MOT, medico-legal capacity assessment, remote psychiatry, pay monthly healthcare assessment, workplace neurodiversity screening, SEN assessment school, DSA assessment university, employer health assessment programme, health system commissioner pilot, buy now pay later healthcare",
  authors: [{ name: 'Eldava Health' }],
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    siteName: 'Eldava Health',
    title: 'Eldava Health: Global Specialist Diagnostic Assessments',
    description:
      "A global telehealth platform spanning neurodevelopmental, women's health, dementia, men's health and medico-legal assessment. Licensed clinicians. 60+ specialties across 20 countries. Pay in full or in 3.",
    url: 'https://eldava.com/',
    locale: 'en_GB',
    // og:image comes from app/opengraph-image.tsx (Next adds the tags).
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Eldava Health: Global Specialist Diagnostic Assessments',
    description:
      "A global telehealth platform spanning neurodevelopmental, women's health, dementia, men's health and medico-legal assessment. Licensed clinicians. 60+ specialties across 20 countries. Pay in full or in 3.",
  },
  other: {
    'theme-color': '#181209',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,400..600&family=Work+Sans:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@500;600&display=swap"
        />
        {JSON_LD_BLOCKS.map((block, i) => (
          // eslint-disable-next-line react/no-danger
          <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: block }} />
        ))}
      </head>
      <body>
        {children}
        {/* Loaded once, sitewide — the exact same IIFE that ran inline in
            index.html, unmodified, driving every interactive feature: the
            booking modal, pricing filters, mega menus, guided intake,
            country selection, the clinician portal, and route activation
            on client-side navigation (reads location.pathname on load and
            on popstate, same as before). */}
        <Script src={appScriptSrc()} strategy="afterInteractive" />
      </body>
    </html>
  );
}
