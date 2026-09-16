import prisma from '@/lib/server/db';
import { requireAdmin } from '@/lib/server/auth';
import { json, fail, readJson, str, siteUrl, withErrors } from '@/lib/server/http';
import { audit } from '@/lib/server/admin';
import { sendApplicationDecision } from '@/lib/server/mail';
import { CATEGORIES } from '@/lib/server/services';

/// Maps the free-text specialty an applicant typed onto a service category
/// key, which is what decides which bookings reach them. The admin can
/// override with an explicit `specialtyKey` when approving.
function guessCategory(specialty: string): string {
  const s = specialty.toLowerCase();
  if (/psych|adhd|autism|mental|neuro/.test(s)) return 'mind';
  if (/gyn|obstet|women|maternity|menopaus|fertil/.test(s)) return 'women';
  if (/paed|pediatr|child|speech|occupational/.test(s)) return 'child';
  if (/dement|memory|geriatr|old age/.test(s)) return 'dementia';
  if (/urolog|men.?s|androl/.test(s)) return 'mens';
  if (/derm|skin/.test(s)) return 'skin';
  if (/audio|hearing|ent\b|ophthal|eye/.test(s)) return 'hearing';
  if (/legal|forensic|capacity|witness/.test(s)) return 'legal';
  if (/coach|cbt|therap|counsel|nutrition|dietit/.test(s)) return 'postdx';
  if (/psycholog|testing|cognitive/.test(s)) return 'testing';
  return 'body';
}

/// Approve or decline a clinician application. Approval is what creates the
/// login: until then the applicant cannot sign in at all.
export const POST = withErrors(async (req: Request, { params }: { params: { id: string } }) =>
  requireAdmin(async (admin) => {
    const body = await readJson(req);
    const action = str(body.action, 20);
    const notes = str(body.notes, 2000) || null;
    if (!['approve', 'decline', 'review'].includes(action)) return fail('Action must be approve, decline or review.');

    const app = await prisma.clinicianApplication.findUnique({ where: { id: params.id } });
    if (!app) return fail('Application not found.', 404);
    if (app.status === 'APPROVED') return fail('This application has already been approved.', 409);

    if (action === 'review') {
      await prisma.clinicianApplication.update({ where: { id: app.id }, data: { status: 'UNDER_REVIEW', reviewNotes: notes ?? app.reviewNotes } });
      await audit(admin, 'application.review', app.id);
      return json({ status: 'UNDER_REVIEW' });
    }

    if (action === 'decline') {
      await prisma.clinicianApplication.update({
        where: { id: app.id },
        data: { status: 'DECLINED', reviewNotes: notes, reviewedAt: new Date(), reviewedById: admin.id },
      });
      await audit(admin, 'application.decline', app.id, { email: app.email });
      await sendApplicationDecision({ email: app.email, fullName: app.fullName, approved: false, notes, siteUrl: siteUrl(req) }).catch(() => {});
      return json({ status: 'DECLINED' });
    }

    // approve
    if (await prisma.clinician.findUnique({ where: { email: app.email } })) {
      return fail('A clinician account with this email already exists.', 409);
    }
    const specialtyKey = str(body.specialtyKey, 30) || guessCategory(app.specialty);
    if (!CATEGORIES[specialtyKey] || specialtyKey === 'founding') return fail('Choose a valid service category for this clinician.');
    const displayName = str(body.displayName, 120) || app.fullName;

    const clinician = await prisma.$transaction(async (tx) => {
      const c = await tx.clinician.create({
        data: {
          email: app.email,
          // The password they chose when applying - never emailed, never reset here.
          passwordHash: app.passwordHash,
          displayName,
          specialty: specialtyKey,
          regulator: app.regulator,
          regNumber: app.regNumber,
          active: true,
        },
      });
      await tx.clinicianApplication.update({
        where: { id: app.id },
        data: { status: 'APPROVED', reviewNotes: notes, reviewedAt: new Date(), reviewedById: admin.id, clinicianId: c.id },
      });
      return c;
    });

    await audit(admin, 'application.approve', app.id, { clinicianId: clinician.id, specialty: specialtyKey });
    await sendApplicationDecision({ email: app.email, fullName: app.fullName, approved: true, siteUrl: siteUrl(req) }).catch(() => {});
    return json({ status: 'APPROVED', clinicianId: clinician.id, specialty: specialtyKey });
  })
);
