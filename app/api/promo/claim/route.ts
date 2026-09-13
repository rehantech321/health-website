import prisma from '@/lib/server/db';
import { json, fail, readJson, str, isEmail, withErrors } from '@/lib/server/http';

/// A visitor entering their email to claim the launch offer. Lead capture -
/// the discount itself is applied server-side at booking regardless of this.
export const POST = withErrors(async (req: Request) => {
  const body = await readJson(req);
  const email = str(body.email, 200).toLowerCase();
  const code = (str(body.code, 40) || 'ELDAVA15').toUpperCase();
  const source = str(body.source, 40) || 'promo-modal';

  if (!isEmail(email)) return fail('Enter a valid email address.');

  const promo = await prisma.promoCode.findUnique({ where: { code } });
  if (!promo || !promo.active) return fail('That offer is not currently available.', 404);

  await prisma.promoClaim.create({ data: { promoCodeId: promo.id, email, source } });

  return json({ claimed: true, code: promo.code, percentOff: promo.percentOff }, 201);
});
