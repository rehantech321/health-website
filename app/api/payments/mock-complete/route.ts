import prisma from '@/lib/server/db';
import { requirePatient } from '@/lib/server/auth';
import { json, fail, readJson, str, withErrors } from '@/lib/server/http';
import { isLive } from '@/lib/server/payments';
import { confirmPayment, failPayment } from '@/lib/server/booking-state';
import { recordPromoUse } from '@/lib/server/promo';

/// Stands in for the Stripe webhook when no Stripe key is configured. Refuses
/// to run the moment real keys exist - otherwise it would be an endpoint that
/// marks purchases paid.
export const POST = withErrors(async (req: Request) =>
  requirePatient(async (patient) => {
    if (isLive()) return fail('Mock payments are disabled when Stripe is configured.', 403);

    const body = await readJson(req);
    const paymentId = str(body.paymentId, 40);
    const outcome = str(body.outcome, 20) || 'succeed';

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { appointment: true, voucher: true },
    });
    const owner = payment?.appointment?.patientId ?? payment?.voucher?.patientId;
    if (!payment || owner !== patient.id) return fail('Payment not found.', 404);
    if (!payment.mock) return fail('That payment was not created in mock mode.', 409);

    const reference = payment.appointment?.reference ?? payment.voucher?.code ?? '';

    if (outcome === 'fail') {
      await failPayment(payment.id, 'Mock payment was declined for testing.');
      return json({ status: 'FAILED', reference });
    }

    await confirmPayment(payment.id, `mock_pi_${payment.id}`);
    if (payment.appointment?.promoCode) await recordPromoUse(payment.appointment.promoCode);
    return json({ status: 'PAID', reference });
  })
);
