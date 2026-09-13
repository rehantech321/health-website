import { json, fail, str, withErrors } from '@/lib/server/http';
import { applyPromo } from '@/lib/server/promo';
import { findService } from '@/lib/server/services';

export const dynamic = 'force-dynamic';

/// Lets the booking modal show the real discounted price before checkout.
/// Purely a preview - booking/create re-validates and is what actually prices.
export const GET = withErrors(async (req: Request) => {
  const url = new URL(req.url);
  const code = str(url.searchParams.get('code'), 40);
  const service = findService(str(url.searchParams.get('service'), 120));
  if (!service) return fail('Unknown service.');

  const result = await applyPromo(code, service.priceMinor);
  if (!result.ok) return json({ valid: false, reason: result.reason, listMinor: service.priceMinor, priceMinor: service.priceMinor });

  const discountMinor = result.discountMinor ?? 0;
  return json({
    valid: true,
    code: result.code,
    percentOff: result.percentOff,
    listMinor: service.priceMinor,
    discountMinor,
    priceMinor: service.priceMinor - discountMinor,
  });
});
