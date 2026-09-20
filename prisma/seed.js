/* eslint-disable no-console */
// Seeds demo clinicians covering every bookable service category, four weeks
// of slots, and the launch promo code. Safe to re-run: clinicians and the
// promo are upserted, slots are skipped when they already exist.
//
//   npm run db:seed

const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Mirrors hashPassword() in lib/server/auth.ts. Duplicated because this runs
// under plain CommonJS Node, outside the Next.js module graph.
function hashPassword(password) {
  const N = 16384;
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64, { N, r: 8, p: 1 });
  return `scrypt$${N}$${salt.toString('hex')}$${hash.toString('hex')}`;
}

const DEMO_PASSWORD = 'eldava-demo-2026';

// `specialty` is a service category key; it is how /api/booking/slots decides
// who can take a given service. Every category except `founding` (prepaid
// vouchers, no clinician at purchase) needs at least one clinician.
const CLINICIANS = [
  { email: 'amara.osei@eldava.com', displayName: 'Dr. Amara Osei', specialty: 'mind', regulator: 'GMC', regNumber: '7412996', bio: 'Consultant psychiatrist, adult ADHD and autism assessment.' },
  { email: 'james.whitlock@eldava.com', displayName: 'Dr. James Whitlock', specialty: 'mind', regulator: 'GMC', regNumber: '6183340', bio: 'Consultant psychiatrist, mood and anxiety disorders.' },
  { email: 'priya.raman@eldava.com', displayName: 'Dr. Priya Raman', specialty: 'women', regulator: 'GMC', regNumber: '7009812', bio: 'Consultant gynaecologist, menopause, fertility and endometriosis.' },
  { email: 'helen.marsh@eldava.com', displayName: 'Helen Marsh', specialty: 'child', regulator: 'HCPC', regNumber: 'SL34120', bio: 'Speech and language therapist, paediatric caseload.' },
  { email: 'daniel.okonkwo@eldava.com', displayName: 'Dr. Daniel Okonkwo', specialty: 'body', regulator: 'GMC', regNumber: '7233015', bio: 'General physician, cardiology and neurology triage.' },
  { email: 'sofia.lindqvist@eldava.com', displayName: 'Dr. Sofia Lindqvist', specialty: 'testing', regulator: 'HCPC', regNumber: 'PYL29984', bio: 'Clinical psychologist, objective and cognitive testing.' },
  { email: 'ruth.bennett@eldava.com', displayName: 'Ruth Bennett', specialty: 'postdx', regulator: 'BACP', regNumber: '388120', bio: 'ADHD coach and CBT therapist, post-diagnostic support.' },
  { email: 'marcus.hale@eldava.com', displayName: 'Dr. Marcus Hale', specialty: 'premium', regulator: 'GMC', regNumber: '5991204', bio: 'Consultant lead for combined and priority pathways.' },
  { email: 'evelyn.carter@eldava.com', displayName: 'Dr. Evelyn Carter', specialty: 'legal', regulator: 'GMC', regNumber: '6604471', bio: 'Expert witness, capacity and medico-legal psychiatric reports.' },
  { email: 'thomas.reid@eldava.com', displayName: 'Dr. Thomas Reid', specialty: 'dementia', regulator: 'GMC', regNumber: '6320917', bio: 'Old-age psychiatrist, memory and dementia assessment.' },
  { email: 'omar.haddad@eldava.com', displayName: 'Dr. Omar Haddad', specialty: 'mens', regulator: 'GMC', regNumber: '7185532', bio: "Men's health physician, urology and hormone review." },
  { email: 'lena.fischer@eldava.com', displayName: 'Dr. Lena Fischer', specialty: 'skin', regulator: 'GMC', regNumber: '7300148', bio: 'Consultant dermatologist, remote photo assessment.' },
  { email: 'grace.adeyemi@eldava.com', displayName: 'Grace Adeyemi', specialty: 'hearing', regulator: 'HCPC', regNumber: 'HAD11029', bio: 'Audiologist, hearing, tinnitus and eye-care triage.' },
];

const HOURS = [9, 10, 11, 13, 14, 15, 16, 17];
const WEEKS_AHEAD = 4;

// The 13 demo clinicians and their shared password are for local development
// only. Once a practice has real clinicians, re-running the seed must not put
// them back: demo data is created ONLY when SEED_DEMO=true. The admin account
// and the promo code are configuration and are always ensured.
const SEED_DEMO = process.env.SEED_DEMO === 'true';

async function main() {
  if (!SEED_DEMO) {
    console.log('Skipping demo clinicians and slots (set SEED_DEMO=true to create them).');
    await seedConfig();
    return;
  }
  console.log('Seeding clinicians…');
  const clinicians = [];
  for (const c of CLINICIANS) {
    clinicians.push(
      await prisma.clinician.upsert({
        where: { email: c.email },
        update: { displayName: c.displayName, specialty: c.specialty, bio: c.bio, regulator: c.regulator, regNumber: c.regNumber, active: true },
        create: { ...c, passwordHash: hashPassword(DEMO_PASSWORD) },
      })
    );
  }
  console.log(`  ${clinicians.length} clinicians ready.`);

  console.log('Seeding slots…');
  const slots = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  for (let day = 1; day <= WEEKS_AHEAD * 7; day++) {
    const date = new Date(start);
    date.setDate(date.getDate() + day);
    const weekday = date.getDay();
    if (weekday === 0 || weekday === 6) continue;
    clinicians.forEach((clinician, idx) => {
      // Stagger so clinicians don't all offer identical times.
      for (let i = idx % 3; i < HOURS.length; i += 2) {
        const startsAt = new Date(date);
        startsAt.setHours(HOURS[i], 0, 0, 0);
        if (startsAt < new Date()) continue;
        slots.push({ clinicianId: clinician.id, startsAt, durationMin: 60, mode: i % 4 === 0 ? 'phone' : 'video' });
      }
    });
  }
  const result = await prisma.appointmentSlot.createMany({ data: slots, skipDuplicates: true });
  console.log(`  ${result.count} new slots created (${slots.length} considered).`);

  await seedConfig();
}

async function seedConfig() {
  console.log('Seeding promo code…');
  await prisma.promoCode.upsert({
    where: { code: 'ELDAVA15' },
    update: { percentOff: 15, active: true },
    create: { code: 'ELDAVA15', percentOff: 15, active: true, maxUses: 2000 },
  });
  console.log('  ELDAVA15: 15% off, first 2,000 uses.');

  // The first admin account. Override with SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD;
  // the password is only set when the account is first created, so re-running
  // the seed never resets a password an admin has since changed.
  console.log('Seeding admin…');
  const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@eldava.com';
  const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'eldava-admin-2026';
  await prisma.admin.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: { email: ADMIN_EMAIL, name: 'Practice Admin', passwordHash: hashPassword(ADMIN_PASSWORD) },
  });
  console.log(`  ${ADMIN_EMAIL} ready.`);

  console.log('\nDone.');
  console.log(`Admin panel sign-in:  ${ADMIN_EMAIL}  /  ${ADMIN_PASSWORD}   -> /admin/`);
  if (SEED_DEMO) {
    console.log('Clinician portal sign-in:');
    console.log(`  email:    ${CLINICIANS[0].email}  (or any address above)`);
    console.log(`  password: ${DEMO_PASSWORD}`);
  } else {
    console.log('No demo clinicians were created. Add real ones in the admin panel');
    console.log('(Clinicians -> Add clinician), or approve a doctor who applies at /join-the-network/.');
  }
}

main()
  .catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
