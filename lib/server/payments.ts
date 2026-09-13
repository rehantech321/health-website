import Stripe from 'stripe';

// Payments go through Stripe Checkout rather than a card form on our page:
//   1. Raw card numbers never touch this server - PCI scope stays at SAQ-A.
//   2. Klarna ("Pay later") is a redirect-based method and *requires* a hosted
//      page anyway. One integration covers both.
// Without STRIPE_SECRET_KEY the module hands off to /mock-checkout instead, so
// the pay -> confirm loop is still exercisable end to end.

let cached: Stripe | null = null;

export function isLive(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe(): Stripe {
  if (!cached) {
    cached = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2025-02-24.acacia' });
  }
  return cached;
}

export type CheckoutTarget = {
  /// Our Payment row id - carried in metadata so the webhook can find it.
  paymentId: string;
  /// Human-readable reference shown to the customer (booking ref or voucher code).
  reference: string;
  amountMinor: number;
  currency: string;
  method: 'CARD' | 'KLARNA';
  customerEmail: string;
  lineName: string;
  lineDescription: string;
  /// Where the browser lands afterwards; `{CHECKOUT_SESSION_ID}` is filled by Stripe.
  successUrl: string;
  cancelUrl: string;
};

export async function createCheckout(target: CheckoutTarget, siteUrl: string) {
  if (!isLive()) {
    return {
      mock: true,
      id: `mock_cs_${target.paymentId}`,
      url: `${siteUrl}/mock-checkout?payment=${encodeURIComponent(target.paymentId)}`,
    };
  }

  const session = await getStripe().checkout.sessions.create({
    mode: 'payment',
    payment_method_types: target.method === 'KLARNA' ? ['klarna'] : ['card'],
    customer_email: target.customerEmail,
    client_reference_id: target.reference,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: target.currency,
          unit_amount: target.amountMinor,
          product_data: { name: target.lineName, description: target.lineDescription },
        },
      },
    ],
    metadata: { paymentId: target.paymentId, reference: target.reference },
    success_url: target.successUrl,
    cancel_url: target.cancelUrl,
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
  });

  return { mock: false, id: session.id, url: session.url as string };
}

/// Verifies a webhook signature. Throws if tampered with or unconfigured.
export function constructEvent(rawBody: string | Buffer, signature: string | null) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!isLive() || !secret) throw new Error('Stripe webhook is not configured.');
  if (!signature) throw new Error('Missing stripe-signature header.');
  return getStripe().webhooks.constructEvent(rawBody, signature, secret);
}
