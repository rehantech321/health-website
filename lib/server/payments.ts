import Stripe from 'stripe';

// Payments go through Stripe Checkout rather than a card form on our page:
//   1. Raw card numbers never touch this server - PCI scope stays at SAQ-A.
//   2. Klarna ("Pay later") is a redirect-based method and *requires* a hosted
//      page anyway. One integration covers both.
// Without STRIPE_SECRET_KEY the module hands off to /mock-checkout instead, so
// the pay -> confirm loop is still exercisable end to end.

let cached: Stripe | null = null;

/// The configured key, tolerant of how it tends to arrive in an env file:
/// surrounding quotes, and any whitespace - including line breaks from a key
/// pasted out of a wrapped document. No Stripe key contains whitespace, so
/// removing it can only help.
export function stripeKey(): string {
  return (process.env.STRIPE_SECRET_KEY || '').trim().replace(/^["']|["']$/g, '').replace(/\s+/g, '');
}

export type KeyKind = 'none' | 'secret-live' | 'secret-test' | 'restricted-live' | 'restricted-test' | 'publishable' | 'wrong-case' | 'unknown';

/// What kind of key is configured, from its prefix. Stripe only accepts
/// `sk_`/`rk_` server-side; `pk_` is the browser key and is the usual reason
/// for "Invalid API Key provided".
export function keyKind(key = stripeKey()): KeyKind {
  if (!key) return 'none';
  if (key.startsWith('sk_live_')) return 'secret-live';
  if (key.startsWith('sk_test_')) return 'secret-test';
  if (key.startsWith('rk_live_')) return 'restricted-live';
  if (key.startsWith('rk_test_')) return 'restricted-test';
  if (key.startsWith('pk_')) return 'publishable';
  // Right shape, wrong case: a key that was retyped or run through OCR
  // rather than copied. Stripe keys are entirely lowercase up to the prefix.
  if (/^(sk|rk|pk)_(live|test)_/i.test(key)) return 'wrong-case';
  return 'unknown';
}

/// Safe to log or show an admin: enough to identify the key, not to use it.
export function keyFingerprint(key = stripeKey()): string {
  if (!key) return '(not set)';
  return key.length <= 14 ? `${key.slice(0, 8)}… (${key.length} chars)` : `${key.slice(0, 11)}…${key.slice(-4)} (${key.length} chars)`;
}

/// True when a key is configured at all. A wrong *kind* of key still counts
/// as configured: falling back to the mock checkout would quietly take no
/// money while looking like it worked, so a bad key must fail loudly instead.
export function isLive(): boolean {
  return keyKind() !== 'none';
}

/// The problem with the configured key, before Stripe is ever called.
export function keyProblem(): string | null {
  switch (keyKind()) {
    case 'none':
      return null;
    case 'publishable':
      return 'STRIPE_SECRET_KEY is set to a publishable key (pk_…). That key is for the browser. Use the secret key (sk_live_… or sk_test_…) from Stripe Dashboard -> Developers -> API keys.';
    case 'wrong-case':
      return 'STRIPE_SECRET_KEY has a capitalised prefix (e.g. "Sk_Live_"). Stripe keys are entirely lowercase, so this one was retyped rather than copied - and if the case is wrong, characters like 0/O and l/1 are probably wrong too. Copy it again with the copy button in Stripe Dashboard -> Developers -> API keys.';
    case 'unknown':
      return 'STRIPE_SECRET_KEY does not look like a Stripe key (it should start with sk_live_, sk_test_ or rk_). Check for a truncated or mistyped paste.';
    default:
      return null;
  }
}

export function getStripe(): Stripe {
  if (!cached) {
    cached = new Stripe(stripeKey(), { apiVersion: '2025-02-24.acacia' });
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
  // Catch a wrong key kind here rather than after a round trip to Stripe, so
  // the error names the actual problem.
  const problem = keyProblem();
  if (problem) throw new Error(problem);

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

/// The webhook signing secret, cleaned the same way as the API key.
export function webhookSecret(): string {
  return (process.env.STRIPE_WEBHOOK_SECRET || '').trim().replace(/^["']|["']$/g, '').replace(/\s+/g, '');
}

/// Verifies a webhook signature. Throws if tampered with or unconfigured.
export function constructEvent(rawBody: string | Buffer, signature: string | null) {
  const secret = webhookSecret();
  if (!isLive() || !secret) throw new Error('Stripe webhook is not configured.');
  if (!signature) throw new Error('Missing stripe-signature header.');
  return getStripe().webhooks.constructEvent(rawBody, signature, secret);
}
