import prisma from '@/lib/server/db';
import { requirePatient } from '@/lib/server/auth';
import { json, fail, readJson, str, siteUrl, withErrors } from '@/lib/server/http';
import { createCheckout, isLive } from '@/lib/server/payments';

const METHODS = new Set(['CARD', 'KLARNA']);

/// Turns a Stripe error into something a patient can act on (or at least
/// understand), without leaking key material or internals.
function describeProviderError(e: unknown, method: 'CARD' | 'KLARNA'): string {
  const msg = String((e as any)?.message || '');
  const code = String((e as any)?.code || (e as any)?.type || '');
  // Our own pre-flight message about the key, or Stripe rejecting it: either
  // way it is our configuration, never anything the patient can fix.
  if (/STRIPE_SECRET_KEY/.test(msg) || /invalid api key|authentication/i.test(msg) || code === 'StripeAuthenticationError') {
    return 'Card payments are temporarily unavailable while we finish setting up our payment provider. Nothing has been charged and your appointment time is still held. Please try again shortly, or contact us and we will take payment another way.';
  }
  if (method === 'KLARNA' && /klarna/i.test(msg)) {
    return 'Pay later with Klarna is not available at the moment. Please pay in full by card instead.';
  }
  if (/payment_method_types|is invalid|not activated/i.test(msg)) {
    return 'That payment method is not available at the moment. Please choose another.';
  }
  return 'Our payment provider could not start the checkout. Please try again in a moment.';
}

/// Starts a hosted checkout for a pending appointment or voucher and returns
/// the URL to send the browser to. Card and Klarna differ only in which
/// methods the hosted page offers.
export const POST = withErrors(async (req: Request) =>
  requirePatient(async (patient) => {
    const body = await readJson(req);
    const appointmentId = str(body.appointmentId, 40) || null;
    const voucherId = str(body.voucherId, 40) || null;
    const method = str(body.method, 20).toUpperCase() as 'CARD' | 'KLARNA';
    if (!METHODS.has(method)) return fail('Choose card or Klarna.');
    if (!appointmentId && !voucherId) return fail('Nothing to pay for.');

    const base = siteUrl(req);
    let target: {
      reference: string;
      amountMinor: number;
      currency: string;
      lineName: string;
      lineDescription: string;
      existingPaymentId: string | null;
      link: { appointmentId?: string; voucherId?: string };
    };

    if (appointmentId) {
      const a = await prisma.appointment.findUnique({ where: { id: appointmentId }, include: { payment: true } });
      if (!a || a.patientId !== patient.id) return fail('Booking not found.', 404);
      if (a.status === 'CONFIRMED' || a.payment?.status === 'PAID') return fail('This booking is already paid for.', 409);
      if (a.status === 'CANCELLED') return fail('This booking was cancelled.', 409);
      if (a.status === 'EXPIRED') return fail('This hold has expired and the time has been released. Please choose a time again.', 409);
      target = {
        reference: a.reference,
        amountMinor: a.priceMinor,
        currency: a.currency,
        lineName: a.serviceName,
        lineDescription: `Consultation, ${a.startsAt.toISOString().slice(0, 16).replace('T', ' ')} UTC`,
        existingPaymentId: a.payment?.id ?? null,
        link: { appointmentId: a.id },
      };
    } else {
      const v = await prisma.voucher.findUnique({ where: { id: voucherId as string }, include: { payment: true } });
      if (!v || v.patientId !== patient.id) return fail('Voucher not found.', 404);
      if (v.status !== 'PENDING_PAYMENT') return fail('This voucher is already paid for.', 409);
      target = {
        reference: v.code,
        amountMinor: v.priceMinor,
        currency: v.currency,
        lineName: v.serviceName,
        lineDescription: 'Founding 500 prepaid voucher, redeemable after launch',
        existingPaymentId: v.payment?.id ?? null,
        link: { voucherId: v.id },
      };
    }

    // Reuse the payment row across retries and method switches, so one
    // purchase never accumulates orphaned payment records.
    const paymentData = { method, amountMinor: target.amountMinor, status: 'REQUIRES_PAYMENT' as const, mock: !isLive(), lastError: null };
    const payment = target.existingPaymentId
      ? await prisma.payment.update({ where: { id: target.existingPaymentId }, data: paymentData })
      : await prisma.payment.create({ data: { ...paymentData, currency: target.currency, ...target.link } });

    let checkout: Awaited<ReturnType<typeof createCheckout>>;
    try {
      checkout = await createCheckout(
        {
        paymentId: payment.id,
        reference: target.reference,
        amountMinor: target.amountMinor,
        currency: target.currency,
        method,
        customerEmail: patient.email,
        lineName: target.lineName,
        lineDescription: target.lineDescription,
        // Stripe fills the placeholder itself; it must stay un-encoded.
        successUrl: `${base}/?checkout=success&ref=${target.reference}&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${base}/?checkout=cancelled&ref=${target.reference}`,
      },
      base
    );
    } catch (e) {
      // A provider rejection is a configuration problem on our side, not the
      // patient's. Say what happened, keep the hold, and record it so the
      // admin dashboard can show it.
      const message = describeProviderError(e, method);
      console.error('[payments] checkout failed:', method, target.reference, (e as Error).message);
      await prisma.payment.update({ where: { id: payment.id }, data: { lastError: String((e as Error).message || e).slice(0, 500) } }).catch(() => {});
      return fail(message, 502);
    }

    if (!checkout.mock) {
      await prisma.payment.update({ where: { id: payment.id }, data: { stripePaymentIntentId: checkout.id, status: 'PROCESSING' } });
    }

    return json({ checkoutUrl: checkout.url, mock: checkout.mock, method, reference: target.reference });
  })
);
