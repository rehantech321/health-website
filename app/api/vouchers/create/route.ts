import prisma from '@/lib/server/db';
import { requirePatient } from '@/lib/server/auth';
import { json, fail, readJson, str, withErrors } from '@/lib/server/http';
import { findService, formatMinor, isVoucher, FOUNDING_CAP } from '@/lib/server/services';
import { makeVoucherCode } from '@/lib/server/booking-state';
import { foundingClaimed } from '@/lib/server/vouchers';

/// Creates a Founding 500 voucher in PENDING_PAYMENT. No slot: it is redeemed
/// for an appointment after launch.
export const POST = withErrors(async (req: Request) =>
  requirePatient(async (patient) => {
    const body = await readJson(req);
    const service = findService(str(body.serviceName, 120));
    if (!service || !isVoucher(service)) return fail('That is not a Founding 500 voucher.');

    // Cap enforced server-side. The hardcoded "500 remaining" in the old
    // client was decorative; this is the number that actually gates a sale.
    const claimed = await foundingClaimed();
    if (claimed >= FOUNDING_CAP) {
      return fail('All 500 founding vouchers have been claimed.', 409, { remaining: 0 });
    }

    const voucher = await prisma.voucher.create({
      data: {
        code: makeVoucherCode(),
        patientId: patient.id,
        serviceName: service.name,
        priceMinor: service.priceMinor,
      },
    });

    return json(
      {
        voucherId: voucher.id,
        code: voucher.code,
        serviceName: voucher.serviceName,
        priceMinor: voucher.priceMinor,
        priceLabel: formatMinor(voucher.priceMinor),
        remaining: Math.max(0, FOUNDING_CAP - claimed - 1),
      },
      201
    );
  })
);
