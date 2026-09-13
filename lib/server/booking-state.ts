import crypto from 'crypto';
import prisma from './db';
import { sendBookingConfirmation, sendVoucherConfirmation } from './mail';

// State transitions shared by the Stripe webhook and the mock checkout, so a
// mock payment lands in exactly the same state a real one does.

/// Marks a payment paid and confirms whatever it was for. Idempotent.
export async function confirmPayment(paymentId: string | null | undefined, providerRef?: string | null) {
  if (!paymentId) return;

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      appointment: { include: { patient: true, clinician: true } },
      voucher: { include: { patient: true } },
    },
  });
  if (!payment) {
    console.warn(`[booking] confirmPayment: no payment ${paymentId}`);
    return;
  }
  if (payment.status === 'PAID') return;

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: 'PAID',
      lastError: null,
      ...(providerRef ? { stripePaymentIntentId: String(providerRef) } : {}),
    },
  });

  if (payment.appointment) {
    const a = payment.appointment;
    // No placeholder link is invented here. For video appointments the
    // clinician adds the real meeting link from the portal, and the patient is
    // emailed when they do; until then the profile says it is on its way.
    await prisma.appointment.update({ where: { id: a.id }, data: { status: 'CONFIRMED' } });
    await sendBookingConfirmation(a).catch((e) => console.error('[mail] booking confirmation failed:', e));
  }

  if (payment.voucher) {
    const v = payment.voucher;
    await prisma.voucher.update({ where: { id: v.id }, data: { status: 'PAID' } });
    await sendVoucherConfirmation(v).catch((e) => console.error('[mail] voucher confirmation failed:', e));
  }
}

/// Records a failed payment. The appointment/voucher stays pending so the
/// customer can retry against the same held slot rather than losing it.
export async function failPayment(paymentId: string | null | undefined, reason: string) {
  if (!paymentId) return;
  await prisma.payment.updateMany({
    where: { id: paymentId, status: { not: 'PAID' } },
    data: { status: 'FAILED', lastError: reason },
  });
}

/// Six hex chars from a CSPRNG - unguessable; uniqueness is enforced by the DB.
export function makeReference(prefix = 'ELDAVA') {
  return `${prefix}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

/// Founding voucher redemption code, e.g. F500-7K2M-9QXA. Alphabet drops
/// look-alike characters so it survives being read out over the phone.
export function makeVoucherCode() {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const pick = (n: number) =>
    Array.from(crypto.randomBytes(n), (b) => alphabet[b % alphabet.length]).join('');
  return `F500-${pick(4)}-${pick(4)}`;
}
