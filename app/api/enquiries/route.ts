import prisma from '@/lib/server/db';
import { json, fail, readJson, str, isEmail, withErrors } from '@/lib/server/http';
import { sendEnquiryToTeam } from '@/lib/server/mail';

// Which team inbox each enquiry kind routes to. Mirrors the `team` field in
// ENQUIRY_FORMS inside public/eldava-app.js, but lives here so the browser
// cannot redirect an enquiry to an arbitrary address.
const TEAMS: Record<string, string> = {
  clinician: 'clinicians@eldava.com',
  pharmacist: 'clinicians@eldava.com',
  tech: 'hello@eldava.com',
  testimonial: 'hello@eldava.com',
  corporate: 'partnerships@eldava.com',
  'health-systems': 'partnerships@eldava.com',
  legal: 'partnerships@eldava.com',
  schools: 'partnerships@eldava.com',
  universities: 'partnerships@eldava.com',
  insurers: 'partnerships@eldava.com',
  pathway: 'patients@eldava.com',
  default: 'care@eldava.com',
};

const MAX_FIELDS = 12;

/// Every "get in touch" form on the site lands here. Stored first, then
/// emailed to the routed team; the row survives even if email is down.
export const POST = withErrors(async (req: Request) => {
  const body = await readJson(req);
  const kind = str(body.kind, 40) || 'default';
  const name = str(body.name, 120);
  const email = str(body.email, 200).toLowerCase();

  if (!name || !email) return fail('Please give us your name and email.');
  if (!isEmail(email)) return fail('Enter a valid email address.');

  const routedTo = TEAMS[kind] ?? TEAMS.default;

  // Extra per-form fields: bounded, string-only, keys sanitised.
  const fields: Record<string, string> = {};
  const raw = body.fields && typeof body.fields === 'object' ? (body.fields as Record<string, unknown>) : {};
  for (const [k, v] of Object.entries(raw).slice(0, MAX_FIELDS)) {
    const key = k.replace(/[^\w-]/g, '').slice(0, 40);
    const val = str(v, 2000);
    if (key && val) fields[key] = val;
  }

  const enquiry = await prisma.enquiry.create({ data: { kind, name, email, routedTo, fields } });

  const sent = await sendEnquiryToTeam({ team: routedTo, kind, name, email, fields, id: enquiry.id });
  if (sent) await prisma.enquiry.update({ where: { id: enquiry.id }, data: { notifiedAt: new Date() } });

  return json({ received: true, id: enquiry.id, team: routedTo }, 201);
});
