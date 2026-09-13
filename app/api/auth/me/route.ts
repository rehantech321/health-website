import { getPatient, getClinician, publicPatient, publicClinician } from '@/lib/server/auth';
import { json, withErrors } from '@/lib/server/http';

export const dynamic = 'force-dynamic';

/// Lets the client rehydrate both sessions on page load, so a refresh (or the
/// round trip through the payment provider) never looks like a logout.
export const GET = withErrors(async () => {
  const [patient, clinician] = await Promise.all([getPatient(), getClinician()]);
  return json({
    patient: patient ? publicPatient(patient) : null,
    clinician: clinician ? publicClinician(clinician) : null,
  });
});
