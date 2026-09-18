import type { Metadata } from 'next';
import { SharedShell } from '@/app/SharedShell';
import { hubHtml } from '@/lib/seo-html';
import { breadcrumbJsonLd } from '@/lib/seo';

const title = "Online ADHD, Autism & Dementia Assessments | Eldava Health";
const description = 'Private online assessments with licensed clinicians: adult and child ADHD, autism, dementia and memory, mental capacity, menopause, endometriosis, dyslexia and more. Fixed prices, pay in 3.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/assessments/' },
  openGraph: { title, description, url: '/assessments/' },
  twitter: { title, description },
};

export default function Page() {
  return (
    <SharedShell
      activeRouteId="assessments"
      custom={{ html: hubHtml(), navId: 'pricing' }}
      jsonLd={[breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Assessments', path: '/assessments/' }])]}
    />
  );
}
