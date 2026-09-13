import prisma from './db';

// A booking holds its slot from the moment it is created, before payment. That
// hold has to expire, or a patient who picks a time and walks away locks that
// time for everyone, forever. The window matches Stripe Checkout's own 30-minute
// session expiry, so a hold never outlives the payment page it was created for.

export const HOLD_MINUTES = 30;

/// A hold survives past the window only while a payment is actually in flight
/// (Klarna and other delayed methods can sit in PROCESSING for a while); those
/// are resolved by the webhook, not by us guessing.
function expiryCutoff() {
  return new Date(Date.now() - HOLD_MINUTES * 60 * 1000);
}

/// Releases expired holds. Cheap - one updateMany per table - so it is called
/// at the start of every slot lookup and every booking attempt rather than on
/// a schedule, which keeps the app free of background jobs.
export async function releaseExpiredHolds(): Promise<{ appointments: number; vouchers: number }> {
  const cutoff = expiryCutoff();

  const appointments = await prisma.appointment.updateMany({
    where: {
      status: 'PENDING_PAYMENT',
      createdAt: { lt: cutoff },
      OR: [{ payment: null }, { payment: { status: { in: ['REQUIRES_PAYMENT', 'FAILED'] } } }],
    },
    // slotId -> null is what actually frees the slot for someone else.
    data: { status: 'EXPIRED', slotId: null },
  });

  const vouchers = await prisma.voucher.updateMany({
    where: {
      status: 'PENDING_PAYMENT',
      createdAt: { lt: cutoff },
      OR: [{ payment: null }, { payment: { status: { in: ['REQUIRES_PAYMENT', 'FAILED'] } } }],
    },
    data: { status: 'EXPIRED' },
  });

  return { appointments: appointments.count, vouchers: vouchers.count };
}
