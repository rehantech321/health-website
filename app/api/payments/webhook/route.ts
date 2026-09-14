import prisma from '@/lib/server/db';
import { constructEvent } from '@/lib/server/payments';
import { confirmPayment, failPayment } from '@/lib/server/booking-state';
import { recordPromoUse } from '@/lib/server/promo';
import { json, fail, siteUrl } from '@/lib/server/http';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  // Stripe signs the exact bytes it sent, so verify before parsing anything.
  let event;
  try {
    const rawBody = await req.text();
    event = constructEvent(rawBody, req.headers.get('stripe-signature'));
  } catch (error: any) {
    console.error('[stripe] signature verification failed:', error?.message);
    return fail('Webhook signature verification failed.', 400);
  }

  // Stripe retries on any non-2xx, so an event id can arrive repeatedly. The
  // primary key on WebhookEvent makes replays a no-op.
  try {
    await prisma.webhookEvent.create({ data: { id: event.id, type: event.type } });
  } catch (error: any) {
    if (error?.code === 'P2002') return json({ received: true, duplicate: true });
    throw error;
  }

  try {
    const session: any = event.data.object;
    const paymentId: string | undefined = session?.metadata?.paymentId;

    switch (event.type) {
      case 'checkout.session.completed':
        // Klarna and other delayed methods can complete the session while
        // funds are still pending; only `paid` is money.
        if (session.payment_status === 'paid') {
          await confirmPayment(paymentId, session.payment_intent || session.id, siteUrl(req));
          await bumpPromo(paymentId);
        } else {
          await prisma.payment.updateMany({ where: { id: paymentId }, data: { status: 'PROCESSING' } });
        }
        break;
      case 'checkout.session.async_payment_succeeded':
        await confirmPayment(paymentId, session.payment_intent || session.id, siteUrl(req));
        await bumpPromo(paymentId);
        break;
      case 'checkout.session.async_payment_failed':
        await failPayment(paymentId, 'The payment provider declined this payment.');
        break;
      case 'checkout.session.expired':
        await failPayment(paymentId, 'Checkout expired before payment was completed.');
        break;
      default:
        break;
    }
  } catch (error) {
    // 500 asks Stripe to retry - what we want if our own write failed.
    console.error(`[stripe] handling ${event.type} failed:`, error);
    return fail('Handler failed.', 500);
  }

  return json({ received: true });
}

async function bumpPromo(paymentId?: string) {
  if (!paymentId) return;
  const p = await prisma.payment.findUnique({ where: { id: paymentId }, include: { appointment: true } });
  if (p?.appointment?.promoCode) await recordPromoUse(p.appointment.promoCode);
}
