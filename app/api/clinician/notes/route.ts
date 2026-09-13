import prisma from '@/lib/server/db';
import { requireClinician } from '@/lib/server/auth';
import { json, fail, readJson, str, withErrors } from '@/lib/server/http';

/// Saves the clinician's SOAP note. Signing is one-way: a signed note is the
/// clinical record and this endpoint refuses to overwrite it.
export const POST = withErrors(async (req: Request) =>
  requireClinician(async (clinician) => {
    const body = await readJson(req);
    const appointmentId = str(body.appointmentId, 40);
    const sign = body.sign === true;
    const fields = {
      subjective: str(body.subjective, 20000),
      objective: str(body.objective, 20000),
      assessment: str(body.assessment, 20000),
      plan: str(body.plan, 20000),
    };

    const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId }, include: { note: true } });
    if (!appointment || appointment.clinicianId !== clinician.id) return fail('Case not found.', 404);

    if (appointment.note?.signedAt) {
      return fail('This note has been signed and can no longer be edited.', 409, {
        signedAt: appointment.note.signedAt.toISOString(),
      });
    }
    if (sign && !fields.assessment && !fields.plan) return fail('Add an assessment and a plan before signing.');

    const note = await prisma.clinicalNote.upsert({
      where: { appointmentId: appointment.id },
      create: { appointmentId: appointment.id, clinicianId: clinician.id, ...fields, signedAt: sign ? new Date() : null },
      update: { ...fields, ...(sign ? { signedAt: new Date() } : {}) },
    });

    // Signing is also what closes the appointment out.
    if (sign && appointment.status === 'CONFIRMED') {
      await prisma.appointment.update({ where: { id: appointment.id }, data: { status: 'COMPLETED' } });
    }

    return json({
      saved: true,
      signed: Boolean(note.signedAt),
      signedAt: note.signedAt?.toISOString() ?? null,
      updatedAt: note.updatedAt.toISOString(),
    });
  })
);
