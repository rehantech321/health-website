import prisma from '@/lib/server/db';
import { requireAdmin, hashPassword } from '@/lib/server/auth';
import { json, fail, readJson, str, isEmail, withErrors } from '@/lib/server/http';
import { paging, searchWhere, audit } from '@/lib/server/admin';
import { CATEGORIES } from '@/lib/server/services';

export const dynamic = 'force-dynamic';

export const GET = withErrors(async (req: Request) =>
  requireAdmin(async () => {
    const url = new URL(req.url);
    const { page, size, skip, take } = paging(url);
    const where: any = { ...searchWhere(url.searchParams.get('q'), ['displayName', 'email', 'regNumber']) };
    const active = url.searchParams.get('active');
    if (active === 'true' || active === 'false') where.active = active === 'true';
    const now = new Date();
    const [total, rows] = await Promise.all([
      prisma.clinician.count({ where }),
      prisma.clinician.findMany({
        where, orderBy: { displayName: 'asc' }, skip, take,
        include: {
          _count: {
            select: {
              appointments: { where: { status: 'CONFIRMED', startsAt: { gte: now } } },
              slots: { where: { appointment: null, startsAt: { gte: now } } },
            },
          },
        },
      }),
    ]);
    return json({
      page, size, total, categories: CATEGORIES,
      rows: rows.map((c) => ({
        id: c.id, displayName: c.displayName, email: c.email, specialty: c.specialty, specialtyLabel: CATEGORIES[c.specialty] ?? c.specialty,
        regulator: c.regulator, regNumber: c.regNumber, active: c.active, upcoming: c._count.appointments, freeSlots: c._count.slots,
        createdAt: c.createdAt.toISOString(),
      })),
    });
  })
);

/// Admin creates a clinician directly (no application). Used for onboarding a
/// doctor the practice already knows; the password is set here and should be
/// changed by the clinician on first sign-in.
export const POST = withErrors(async (req: Request) =>
  requireAdmin(async (admin) => {
    const b = await readJson(req);
    const email = str(b.email, 200).toLowerCase();
    const displayName = str(b.displayName, 120);
    const specialty = str(b.specialty, 30);
    const password = typeof b.password === 'string' ? b.password : '';
    if (!email || !displayName || !specialty) return fail('Name, email and specialty are required.');
    if (!isEmail(email)) return fail('Enter a valid email address.');
    if (!CATEGORIES[specialty] || specialty === 'founding') return fail('Choose a valid service category.');
    if (password.length < 10) return fail('Password must be at least 10 characters.');
    if (await prisma.clinician.findUnique({ where: { email } })) return fail('A clinician with that email already exists.', 409);

    const c = await prisma.clinician.create({
      data: {
        email, displayName, specialty, passwordHash: hashPassword(password),
        regulator: str(b.regulator, 60) || null, regNumber: str(b.regNumber, 60) || null, bio: str(b.bio, 600) || null, active: true,
      },
    });
    await audit(admin, 'clinician.create', c.id, { email });
    return json({ id: c.id }, 201);
  })
);
