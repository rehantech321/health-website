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
  { id: 'home', path: '/', title: 'Eldava Health | Get Answers in Days, Not Years', description: 'A global telehealth platform for specialist diagnostic assessments: ADHD and autism, women\'s health, dementia, men\'s health and more. Licensed clinicians, live video, in days not years.' },
  { id: 'pricing', path: '/pricing/', title: 'Assessments and Pricing | Eldava Health', description: 'Browse and book 60+ specialist assessments and pathways, from ADHD and autism to women\'s health, dementia, men\'s health and medico-legal reports, with transparent pricing and instalment options.' },
  { id: 'how', path: '/how-it-works/', title: 'How It Works | Eldava Health', description: 'How an Eldava Health assessment works, from booking to your signed clinical report, in four steps.' },
  { id: 'pathway', path: '/complete-pathway/', title: 'The Complete Pathway | Eldava Health', description: 'The Complete Pathway: assessment, treatment and ongoing care in one continuous service.' },
  { id: 'pharmacy', path: '/pharmacy-delivery/', title: 'Pharmacy Delivery | Eldava Health', description: 'How prescription delivery works after an Eldava Health assessment, where medication is clinically indicated.' },
  { id: 'academy', path: '/clinician-training-academy/', title: 'Clinician Training Academy | Eldava Health', description: 'Structured training for licensed clinicians building a specialism in ADHD and autism assessment.' },
  { id: 'ai', path: '/guided-intake-technology/', title: 'Our Intake Technology | Eldava Health', description: 'How our guided pre-consultation intake tool works, and what it does not do.' },
  { id: 'outcomes', path: '/outcomes-and-transparency/', title: 'Outcomes and Transparency | Eldava Health', description: 'Our approach to outcomes, transparency and honest reporting.' },
  { id: 'corporate', path: '/for-employers/', title: 'For Employers | Eldava Health', description: 'Employer programmes for neurodivergent and specialist health assessment, in three tiers: Essential, Growth and Enterprise.' },
  { id: 'schools', path: '/for-schools/', title: 'For Schools | Eldava Health', description: 'Specialist assessment programmes for schools and multi-academy trusts, supporting EHCP and SEN processes.' },
  { id: 'universities', path: '/for-universities/', title: 'For Universities | Eldava Health', description: 'Assessment pathways for university students, including DSA-ready reports.' },
  { id: 'insurers', path: '/for-insurers/', title: 'For Insurers | Eldava Health', description: 'Partnership programmes for insurers referring policyholders for specialist diagnostic assessment.' },
  { id: 'health-systems', path: '/for-health-systems/', title: 'For Health Systems and Commissioners | Eldava Health', description: 'Commissioner-funded and self-funded backlog pilots for NHS trusts, ICBs and public health systems.' },
  { id: 'legal', path: '/for-legal-and-solicitors/', title: 'For Legal & Solicitors | Eldava Health', description: 'Medico-legal instructions: mental capacity, testamentary capacity, best interests and expert witness reports.' },
  { id: 'charity', path: '/charity-partnership/', title: 'Our Charity Partnership | Eldava Health', description: 'How every completed Eldava Health assessment gives back to our dementia and fertility charity partners.' },
  { id: 'founding500', path: '/founding-500/', title: 'Founding 500 Vouchers | Eldava Health', description: '500 prepaid assessment vouchers at founding pricing, locked for life, closing at launch on 30 September 2026.' },
  { id: 'blog', path: '/insights/', title: 'Insights and Articles | Eldava Health', description: 'Practical, fact-checked articles on specialist assessment, waiting lists and workplace support.' },
  { id: 'founders', path: '/founders-circle/', title: 'Founders Circle | Eldava Health', description: 'The Eldava Health Founders Circle for early clinical and commercial partners.' },
  { id: 'events', path: '/events/', title: 'Events | Eldava Health', description: 'Upcoming Eldava Health webinars and events for clinicians and the public.' },
  { id: 'partner', path: '/join-the-network/', title: 'Join the Network | Eldava Health', description: 'Join the Eldava Health clinician network: apply as a psychiatrist, psychologist, pharmacist or specialist nurse prescriber.' },
  { id: 'about', path: '/about/', title: 'About and Trust | Eldava Health', description: 'Our clinical governance model, Clinical Director, and the trust and safety standards behind every Eldava Health assessment.' },
  { id: 'founder-note', path: '/founders-note/', title: 'A Note From The Founder | Eldava Health', description: 'Why Jayden Ohen built Eldava Health, in his own words.' },
  { id: 'register', path: '/account/register/', title: 'Create Your Account | Eldava Health', description: 'Create your Eldava Health patient account to book an assessment.', noindex: true },
  { id: 'profile', path: '/account/profile/', title: 'Your Profile | Eldava Health', description: 'Your Eldava Health account details, appointments and vouchers.', noindex: true },
  { id: 'screening', path: '/free-screening-tools/', title: 'Free Screening Tools | Eldava Health', description: 'Free, non-diagnostic screening tools for ADHD, autism and related traits.' },
  { id: 'clinician-login', path: '/clinician/sign-in/', title: 'Clinician Sign In | Eldava Health', description: 'Sign in to the Eldava Health clinician portal.', noindex: true },
  { id: 'clinician-portal', path: '/clinician/portal/', title: 'Clinician Portal | Eldava Health', description: 'Manage your Eldava Health clinician caseload and appointments.', noindex: true },
];

export function routeById(id: string): RouteEntry {
  return ROUTES.find(r => r.id === id) || ROUTES[0];
}
