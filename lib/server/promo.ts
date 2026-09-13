import prisma from './db';

// Discounts are decided here, never in the browser. The client shows a code in
// its banner and lets the patient type one, but the only thing that changes a
// charge is this lookup at booking time.

export type PromoResult = {
  ok: boolean;
  /// Set when ok.
  code?: string;
  percentOff?: number;
  discountMinor?: number;
  id?: string;
  /// Set when not ok.
  reason?: string;
};

export async function applyPromo(rawCode: string | null | undefined, listMinor: number): Promise<PromoResult> {
  const code = String(rawCode ?? '').trim().toUpperCase();
  if (!code) return { ok: false, reason: 'no code' };

  const promo = await prisma.promoCode.findUnique({ where: { code } });
  if (!promo || !promo.active) return { ok: false, reason: 'That code is not valid.' };

  const now = new Date();
  if (promo.startsAt && promo.startsAt > now) return { ok: false, reason: 'That code is not active yet.' };
  if (promo.endsAt && promo.endsAt < now) return { ok: false, reason: 'That code has expired.' };
  if (promo.maxUses != null && promo.uses >= promo.maxUses) return { ok: false, reason: 'That code has been fully redeemed.' };

  // Same rounding the UI uses: 15% off, then to the nearest £5.
  const raw = listMinor * (1 - promo.percentOff / 100);
  const rounded = Math.round(raw / 500) * 500;
  const discountMinor = Math.max(0, listMinor - rounded);

  return { ok: true, code: promo.code, percentOff: promo.percentOff, discountMinor, id: promo.id };
}

/// Called once a booking that used a code is actually paid for.
export async function recordPromoUse(code: string | null | undefined) {
  if (!code) return;
  await prisma.promoCode.updateMany({ where: { code }, data: { uses: { increment: 1 } } });
}
