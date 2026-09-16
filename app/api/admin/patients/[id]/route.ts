import prisma from '@/lib/server/db';
import { requireAdmin } from '@/lib/server/auth';
import { json, fail, readJson, str, isEmail, withErrors } from '@/lib/server/http';
import { audit } from '@/lib/server/admin';
import { formatMinor } from '@/lib/server/services';

export const dynamic = 'force-dynamic';

export const GET = withErrors(async (_req: Request, { params }: { params: { id: string } }) =>
  requireAdmin(async () => {
    const p = await prisma.patient.findUnique({
      where: { id: params.id },
      include: {
        appointments: { include: { clinician: true, payment: true, note: true, intakeSession: { include: { summary: true } } }, orderBy: { startsAt: 'desc' } },
        vouchers: { include: { payment: true }, orderBy: { createdAt: 'desc' } },
        intakeSessions: { orderBy: { createdAt: 'desc' }, select: { id: true, specialty: true, status: true, redFlag: true, createdAt: true, completedAt: true } },
      },
    });
    if (!p) return fail('Patient not found.', 404);
    return json({
      patient: { id: p.id, fullName: p.fullName, email: p.email, phone: p.phone, country: p.country, dateOfBirth: p.dateOfBirth.toISOString().slice(0, 10), createdAt: p.createdAt.toISOString() },
      appointments: p.appointments.map((a) => ({
        id: a.id, reference: a.reference, service: a.serviceName, clinician: a.clinician.displayName, clinicianId: a.clinicianId,
        startsAt: a.startsAt.toISOString(), mode: a.mode, status: a.status, priceLabel: formatMinor(a.priceMinor),
        paymentStatus: a.payment?.status ?? null, paymentMethod: a.payment?.method ?? null, hasLink: Boolean(a.joinUrl),
        riskLevel: a.intakeSession?.summary?.riskLevel ?? null, noteSigned: Boolean(a.note?.signedAt),
      })),
      vouchers: p.vouchers.map((v) => ({ id: v.id, code: v.code, service: v.serviceName, status: v.status, priceLabel: formatMinor(v.priceMinor), createdAt: v.createdAt.toISOString() })),
      intakes: p.intakeSessions.map((i) => ({ id: i.id, specialty: i.specialty, status: i.status, redFlag: i.redFlag, createdAt: i.createdAt.toISOString(), completedAt: i.completedAt?.toISOString() ?? null })),
    });
  })
);

export const PATCH = withErrors(async (req: Request, { params }: { params: { id: string } }) =>
  requireAdmin(async (admin) => {
    const p = await prisma.patient.findUnique({ where: { id: params.id } });
    if (!p) return fail('Patient not found.', 404);
    const b = await readJson(req);
    const data: any = {};
    if (typeof b.fullName === 'string') data.fullName = str(b.fullName, 120) || p.fullName;
    if (typeof b.email === 'string') {
      const email = str(b.email, 200).toLowerCase();
      if (!isEmail(email)) return fail('Enter a valid email address.');
      if (email !== p.email && (await prisma.patient.findUnique({ where: { email } }))) return fail('That email is already in use.', 409);
      data.email = email;
    }
    if (typeof b.phone === 'string') data.phone = str(b.phone, 40) || null;
    if (typeof b.country === 'string') data.country = str(b.country, 80) || p.country;
    if (typeof b.dateOfBirth === 'string') {
      const d = new Date(b.dateOfBirth);
      if (Number.isNaN(d.getTime()) || d > new Date()) return fail('Enter a valid date of birth.');
      data.dateOfBirth = d;
    }
    if (!Object.keys(data).length) return fail('Nothing to update.');
    await prisma.patient.update({ where: { id: p.id }, data });
    await audit(admin, 'patient.update', p.id, data);
    return json({ ok: true });
  })
);

/// Deletion is refused while paid or completed appointments exist: those are
/// financial and clinical records with retention obligations. Everything else
/// (sessions, intakes, unpaid holds) is removed with the patient.
export const DELETE = withErrors(async (_req: Request, { params }: { params: { id: string } }) =>
  requireAdmin(async (admin) => {
    const p = await prisma.patient.findUnique({ where: { id: params.id }, include: { appointments: { include: { payment: true } }, vouchers: true } });
    if (!p) return fail('Patient not found.', 404);
    // A cancelled appointment whose payment went through (refund owed) is still a financial record.
    const keep =
      p.appointments.filter((a) => ['CONFIRMED', 'COMPLETED'].includes(a.status) || a.payment?.status === 'PAID').length +
      p.vouchers.filter((v) => ['PAID', 'REDEEMED'].includes(v.status)).length;
    if (keep > 0) return fail(`This patient has ${keep} paid appointment/voucher record(s) that must be retained. Anonymise rather than delete, or contact the data controller.`, 409);
    await prisma.$transaction([
      prisma.appointment.deleteMany({ where: { patientId: p.id } }),
      prisma.voucher.deleteMany({ where: { patientId: p.id } }),
      prisma.patient.delete({ where: { id: p.id } }), // cascades sessions + intakes
    ]);
    await audit(admin, 'patient.delete', p.id, { email: p.email });
    return json({ deleted: true });
  })
);
