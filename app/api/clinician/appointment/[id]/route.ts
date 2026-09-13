import prisma from '@/lib/server/db';
import { requireClinician } from '@/lib/server/auth';
import { json, fail, readJson, str, withErrors } from '@/lib/server/http';
import { sendJoinLink } from '@/lib/server/mail';

/// The clinician sets (or clears) the meeting link for one of their own video
/// appointments. Phone appointments have no link - the clinician calls the
/// patient on the number from their account.
export const PATCH = withErrors(async (req: Request, { params }: { params: { id: string } }) =>
  requireClinician(async (clinician) => {
    const body = await readJson(req);
    const raw = str(body.joinUrl, 600);

    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: { patient: true },
    });
    if (!appointment || appointment.clinicianId !== clinician.id) return fail('Case not found.', 404);
    if (appointment.mode !== 'video') return fail('This is a phone appointment - there is no link to set. Call the patient on the number shown.');
    if (!['CONFIRMED'].includes(appointment.status)) return fail('A link can only be added to a confirmed appointment.', 409);

    let joinUrl: string | null = null;
    if (raw) {
      let parsed: URL;
      try {
        parsed = new URL(raw);
      } catch {
        return fail('Enter a full link, starting with https://');
      }
      if (parsed.protocol !== 'https:') return fail('The meeting link must start with https://');
      joinUrl = parsed.toString();
    }

    const wasSet = Boolean(appointment.joinUrl);
    const updated = await prisma.appointment.update({ where: { id: appointment.id }, data: { joinUrl } });

    // Tell the patient the moment a link appears (or changes). Clearing one
    // sends nothing - that is an internal correction, not news for them.
    let notified = false;
    if (joinUrl && joinUrl !== appointment.joinUrl) {
      notified = await sendJoinLink({ ...updated, patient: appointment.patient, clinicianName: clinician.displayName, changed: wasSet }).catch((e) => {
        console.error('[mail] join link notification failed:', e);
        return false;
      });
    }

    return json({ joinUrl: updated.joinUrl, notified });
  })
);
