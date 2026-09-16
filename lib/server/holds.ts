import { Prisma } from '@prisma/client';
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

/// Releases expired holds. Called at the start of every slot lookup and every
/// booking attempt rather than on a schedule, which keeps the app free of
/// background jobs - so it has to be cheap. Both tables are updated in one
/// statement (a pair of data-modifying CTEs): a single round trip to the
/// database, which is remote and costs hundreds of milliseconds per trip.
export async function releaseExpiredHolds(): Promise<{ appointments: number; vouchers: number }> {
  const cutoff = expiryCutoff();

  const [row] = await prisma.$queryRaw<{ appointments: bigint; vouchers: bigint }[]>(Prisma.sql`
    with a as (
      update "Appointment" ap
      -- slotId -> null is what actually frees the slot for someone else.
      set "status" = 'EXPIRED', "slotId" = null, "updatedAt" = now()
      where ap."status" = 'PENDING_PAYMENT' and ap."createdAt" < ${cutoff}
        and not exists (select 1 from "Payment" p where p."appointmentId" = ap."id" and p."status" not in ('REQUIRES_PAYMENT','FAILED'))
      returning 1
    ),
    v as (
      update "Voucher" vo
      set "status" = 'EXPIRED', "updatedAt" = now()
      where vo."status" = 'PENDING_PAYMENT' and vo."createdAt" < ${cutoff}
        and not exists (select 1 from "Payment" p where p."voucherId" = vo."id" and p."status" not in ('REQUIRES_PAYMENT','FAILED'))
      returning 1
    )
    select (select count(*) from a) as "appointments", (select count(*) from v) as "vouchers"
  `);

  return { appointments: Number(row?.appointments ?? 0), vouchers: Number(row?.vouchers ?? 0) };
}
