// Single source of truth for every route in the app.
// Mirrors PAGE_PATHS / titles / descs inside public/eldava-app.js exactly —
// if you add a page there, add it here too (and vice versa).
export type RouteEntry = {
  id: string;
  path: string;
  title: string;
  description: string;
  noindex?: boolean;
};

export const ROUTES: RouteEntry[] = [
  { id: 'home', path: '/', title: 'Private Online ADHD & Autism Assessments | Eldava Health', description: 'Private online assessments with licensed clinicians: adult and child ADHD, autism, dementia and memory, menopause and more. Appointments in days, not years. Pay in full or in 3.' },
  { id: 'pricing', path: '/pricing/', title: 'Private Assessment Prices: ADHD, Autism & More | Eldava Health', description: 'Transparent prices for 60+ private assessments: adult ADHD, autism, dementia memory assessment, menopause, dyslexia and medico-legal reports. Report included, pay in full or in 3.' },
  { id: 'how', path: '/how-it-works/', title: 'How an Online ADHD or Autism Assessment Works | Eldava Health', description: 'How a private online assessment works: book, a guided pre-consultation with a safety check, live video with a licensed clinician, then a signed written report.' },
  { id: 'pathway', path: '/complete-pathway/', title: 'ADHD Assessment, Treatment & Aftercare Pathway | Eldava Health', description: 'The Complete Pathway: diagnostic assessment, medication titration, coaching and ongoing review with the same service, instead of starting again after diagnosis.' },
  { id: 'pharmacy', path: '/pharmacy-delivery/', title: 'Online Prescription & Pharmacy Delivery | Eldava Health', description: 'How prescriptions work after an Eldava Health assessment: sent to a pharmacy of your choice or a delivery partner, only where medication is clinically indicated.' },
  { id: 'academy', path: '/clinician-training-academy/', title: 'ADHD & Autism Assessment Training for Clinicians | Eldava Health', description: 'Structured training for licensed clinicians building a specialism in adult and child ADHD and autism assessment, with supervised practice.' },
  { id: 'ai', path: '/guided-intake-technology/', title: 'Guided Pre-Consultation Intake Technology | Eldava Health', description: 'How our guided pre-consultation works before your assessment, what it does and does not do, and why a licensed clinician always makes every clinical decision.' },
  { id: 'outcomes', path: '/outcomes-and-transparency/', title: 'Outcomes and Transparency | Eldava Health', description: 'How Eldava Health measures and reports outcomes honestly: what we publish, what we do not claim, and how patient feedback is verified.' },
  { id: 'corporate', path: '/for-employers/', title: 'Neurodiversity & ADHD Assessments for Employers | Eldava Health', description: 'Employer programmes for neurodivergent staff: ADHD, autism and specialist assessments with workplace-ready reports, in Essential, Growth and Enterprise tiers.' },
  { id: 'schools', path: '/for-schools/', title: 'SEN, EHCP & Autism Assessments for Schools | Eldava Health', description: 'Specialist assessment programmes for schools and multi-academy trusts: autism, ADHD and educational psychology assessments with EHCP-ready reports.' },
  { id: 'universities', path: '/for-universities/', title: 'DSA Assessments for University Students | Eldava Health', description: 'ADHD, autism and dyslexia assessment pathways for universities and students, with DSA-ready diagnostic reports for Disabled Students\' Allowance applications.' },
  { id: 'insurers', path: '/for-insurers/', title: 'Diagnostic Assessment Partnerships for Insurers | Eldava Health', description: 'Partnership programmes for health insurers referring policyholders for specialist diagnostic assessment, with fixed pricing and fast access.' },
  { id: 'health-systems', path: '/for-health-systems/', title: 'Assessment Backlog Pilots for NHS Trusts & ICBs | Eldava Health', description: 'Commissioner-funded and self-funded ADHD, autism and memory assessment backlog pilots for NHS trusts, ICBs and public health systems.' },
  { id: 'legal', path: '/for-legal-and-solicitors/', title: 'Mental Capacity & Medico-Legal Expert Reports | Eldava Health', description: 'Medico-legal instructions for solicitors: mental capacity, testamentary capacity, best interests assessments and court-ready psychiatric expert witness reports.' },
  { id: 'charity', path: '/charity-partnership/', title: 'Our Dementia & Fertility Charity Partnership | Eldava Health', description: 'How every completed Eldava Health assessment gives back to our dementia and fertility charity partners.' },
  { id: 'founding500', path: '/founding-500/', title: 'Founding 500: Prepaid Assessment Vouchers | Eldava Health', description: '500 prepaid assessment vouchers at founding pricing, locked for life: memory assessment, fertility and neurodivergent assessment. Closing at launch on 30 September 2026.' },
  { id: 'blog', path: '/insights/', title: 'ADHD, Autism & Assessment Articles | Eldava Health Insights', description: 'Practical, fact-checked articles on adult ADHD, autism, getting a private assessment, waiting lists and workplace support, reviewed by clinicians.' },
  { id: 'founders', path: '/founders-circle/', title: 'Founders Circle | Eldava Health', description: 'The Eldava Health Founders Circle for early clinical and commercial partners.' },
  { id: 'events', path: '/events/', title: 'ADHD, Autism & Dementia Webinars and Events | Eldava Health', description: 'Upcoming Eldava Health webinars and events on ADHD, autism, dementia and specialist assessment, for clinicians and the public.' },
  { id: 'partner', path: '/join-the-network/', title: 'Join Our Clinician Network | Remote Assessment Work | Eldava Health', description: 'Join the Eldava Health clinician network: remote, flexible assessment work for psychiatrists, psychologists, pharmacists and specialist nurse prescribers.' },
  { id: 'about', path: '/about/', title: 'About Eldava Health | Clinical Governance & Patient Safety', description: 'Who we are, our clinical governance model and Clinical Director, and the credentialing and safety standards behind every Eldava Health assessment.' },
  { id: 'founder-note', path: '/founders-note/', title: 'Why We Built Eldava Health: A Note From the Founder', description: 'Why Jayden Ohen built Eldava Health, in his own words: long waiting lists, families left without answers, and what a better assessment service looks like.' },
  { id: 'register', path: '/account/register/', title: 'Create Your Account | Eldava Health', description: 'Create your Eldava Health patient account to book an assessment.', noindex: true },
  { id: 'profile', path: '/account/profile/', title: 'Your Profile | Eldava Health', description: 'Your Eldava Health account details, appointments and vouchers.', noindex: true },
  { id: 'screening', path: '/free-screening-tools/', title: 'Free ADHD & Autism Screening Tests Online | Eldava Health', description: 'Free, non-diagnostic online screening questionnaires for ADHD and autism traits. A starting point, not a diagnosis, with guidance on what to do next.' },
  { id: 'clinician-login', path: '/clinician/sign-in/', title: 'Clinician Sign In | Eldava Health', description: 'Sign in to the Eldava Health clinician portal.', noindex: true },
  { id: 'clinician-portal', path: '/clinician/portal/', title: 'Clinician Portal | Eldava Health', description: 'Manage your Eldava Health clinician caseload and appointments.', noindex: true },
];

export function routeById(id: string): RouteEntry {
  return ROUTES.find(r => r.id === id) || ROUTES[0];
}
