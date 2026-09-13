import { json, withErrors } from '@/lib/server/http';
import { FOUNDING_CAP } from '@/lib/server/services';
import { foundingClaimed } from '@/lib/server/vouchers';

export const dynamic = 'force-dynamic';

/// Public. Feeds the "N of 500 remaining" counter on the Founding 500 page
/// from the database instead of a hardcoded number.
export const GET = withErrors(async () => {
  const claimed = await foundingClaimed();
  return json({ cap: FOUNDING_CAP, claimed, remaining: Math.max(0, FOUNDING_CAP - claimed) });
});
