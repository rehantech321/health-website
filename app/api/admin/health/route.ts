import prisma from '@/lib/server/db';
import { requireAdmin } from '@/lib/server/auth';
import { json, siteUrl, withErrors } from '@/lib/server/http';
import { getStripe, isLive as stripeLive, keyKind, keyFingerprint, keyProblem, webhookSecret } from '@/lib/server/payments';
import { isLive as aiLive } from '@/lib/server/anthropic';
import { transport } from '@/lib/server/mail';

export const dynamic = 'force-dynamic';

type Check = { status: 'ok' | 'warn' | 'bad'; detail: string };

/// What is wired up on this server, checked live rather than read from docs:
/// the database, the payment provider (and whether Klarna is actually
/// activated on the Stripe account), mail, AI, and the return URL Stripe and
/// emails will use. Also the last few checkout failures with their real error
/// text, which the patient only ever sees a summary of.
export const GET = withErrors(async (req: Request) =>
  requireAdmin(async () => {
    const checks: Record<string, Check> = {};

    // Database
    const t0 = Date.now();
    try {
      await prisma.$queryRaw`select 1`;
      const ms = Date.now() - t0;
      checks.database = { status: ms > 1500 ? 'warn' : 'ok', detail: `reachable, ${ms} ms round trip` };
    } catch (e) {
      checks.database = { status: 'bad', detail: `unreachable: ${(e as Error).message.split('\n')[0]}` };
    }

    // Payments
    if (!stripeLive()) {
      checks.payments = { status: 'warn', detail: 'MOCK mode - no STRIPE_SECRET_KEY set. Checkout goes to /mock-checkout and no money moves.' };
      checks.klarna = { status: 'warn', detail: 'Simulated (mock mode).' };
      checks.webhook = { status: 'warn', detail: 'Not needed in mock mode.' };
    } else {
      const kind = keyKind();
      const mode = kind === 'secret-live' || kind === 'restricted-live' ? 'LIVE' : kind === 'secret-test' || kind === 'restricted-test' ? 'TEST' : 'unrecognised key';
      const problem = keyProblem();
      if (problem) {
        // Wrong kind of key: say so exactly, without calling Stripe at all.
        checks.payments = { status: 'bad', detail: `${problem} Currently set to: ${keyFingerprint()}.` };
        checks.klarna = { status: 'bad', detail: 'Cannot check until the secret key is correct.' };
      } else try {
        const stripe = getStripe();
        const account = await stripe.accounts.retrieve();
        checks.payments = {
          status: account.charges_enabled ? 'ok' : 'warn',
          detail: `Stripe ${mode}, account ${account.id} (${account.country || '?'}, ${account.default_currency?.toUpperCase() || '?'})${account.charges_enabled ? '' : ' - charges not yet enabled; finish account activation in the Stripe Dashboard'}`,
        };
        const configs = await stripe.paymentMethodConfigurations.list({ limit: 10 });
        const klarna = configs.data.find((c) => c.is_default)?.klarna ?? configs.data[0]?.klarna;
        if (!klarna) checks.klarna = { status: 'bad', detail: 'Klarna is not available on this Stripe account. Enable it: Dashboard -> Settings -> Payments -> Payment methods -> Klarna.' };
        else if (klarna.display_preference?.value !== 'on') checks.klarna = { status: 'bad', detail: `Klarna is ${klarna.display_preference?.value || 'off'} in the Stripe Dashboard. Turn it on: Settings -> Payments -> Payment methods -> Klarna.` };
        else if (!klarna.available) checks.klarna = { status: 'bad', detail: 'Klarna is switched on but Stripe reports it unavailable for this account (country, currency or activation pending).' };
        else checks.klarna = { status: 'ok', detail: 'Klarna active on the Stripe account.' };
      } catch (e) {
        const msg = (e as Error).message;
        checks.payments = {
          status: 'bad',
          detail: /invalid api key|authentication/i.test(msg)
            ? `Stripe rejected STRIPE_SECRET_KEY (${mode}, ${keyFingerprint()}). It is the right shape but not a key Stripe recognises: it may be from a different account, rolled/deleted in the Dashboard, or truncated. Copy it again from Developers -> API keys and redeploy.`
            : /permission|not permitted/i.test(msg)
            ? `The key is accepted but lacks permissions (${keyFingerprint()}). A restricted key needs write access to Checkout Sessions. Stripe said: ${msg}`
            : `Stripe error: ${msg}`,
        };
        checks.klarna = { status: 'bad', detail: 'Cannot check while the Stripe key is failing.' };
      }
      checks.webhook = webhookSecret()
        ? { status: 'ok', detail: `STRIPE_WEBHOOK_SECRET set. Endpoint must be ${siteUrl(req)}/api/payments/webhook with checkout.session.completed / .async_payment_succeeded / .async_payment_failed / .expired.` }
        : { status: 'bad', detail: 'STRIPE_WEBHOOK_SECRET missing - payments will never be confirmed. Add the endpoint in Stripe Dashboard -> Developers -> Webhooks.' };
    }

    // Mail, AI, site URL
    const mail = transport();
    const mailConfigured = Boolean((process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) || process.env.RESEND_API_KEY);
    checks.email = mail === 'console'
      ? { status: 'warn', detail: mailConfigured ? 'Console only on this machine (development guard; set MAIL_ALLOW_DEV=true to really send). Configured for SMTP/Resend in production.' : 'Console only - no SMTP_* or RESEND_API_KEY set; nothing is actually sent.' }
      : { status: 'ok', detail: `${mail.toUpperCase()} (${process.env.MAIL_FROM || process.env.SMTP_USER || 'default sender'}); admin copies to ${process.env.ADMIN_EMAIL || 'unset'}` };
    checks.ai = aiLive()
      ? { status: 'ok', detail: 'ANTHROPIC_API_KEY set - live intake questions and summaries.' }
      : { status: 'warn', detail: 'No ANTHROPIC_API_KEY - fixed question set, summaries built from verbatim answers.' };
    const site = siteUrl(req);
    checks.siteUrl = /localhost|127\.0\.0\.1/.test(site) && process.env.NODE_ENV === 'production'
      ? { status: 'bad', detail: `${site} - set NEXT_PUBLIC_SITE_URL so payment return links and emails point at the public domain.` }
      : { status: process.env.NEXT_PUBLIC_SITE_URL ? 'ok' : 'warn', detail: `${site}${process.env.NEXT_PUBLIC_SITE_URL ? '' : ' (derived from the request - set NEXT_PUBLIC_SITE_URL to pin it)'}` };

    // Recent checkout failures, with the provider's actual words.
    const failures = await prisma.payment.findMany({
      where: { lastError: { not: null } },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      select: { id: true, method: true, status: true, mock: true, lastError: true, updatedAt: true, appointment: { select: { reference: true } }, voucher: { select: { code: true } } },
    });

    return json({
      checks,
      failures: failures.map((f) => ({ id: f.id, reference: f.appointment?.reference || f.voucher?.code || '-', method: f.method, status: f.status, mock: f.mock, error: f.lastError, at: f.updatedAt.toISOString() })),
      node: process.version,
      env: process.env.NODE_ENV,
    });
  })
);
