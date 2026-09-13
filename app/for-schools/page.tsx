import type { Metadata } from 'next';
import { routeById } from '@/lib/routes';
import { SharedShell } from '@/app/SharedShell';

const route = routeById('schools');

export const metadata: Metadata = {
  title: route.title,
  description: route.description,
  alternates: { canonical: route.path },
  robots: route.noindex ? { index: false, follow: true } : { index: true, follow: true },
  openGraph: { title: route.title, description: route.description, url: route.path },
  twitter: { title: route.title, description: route.description },
};

export default function Page() {
  return <SharedShell activeRouteId="schools" />;
}
