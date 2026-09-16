import { getAdmin, publicAdmin } from '@/lib/server/auth';
import { json, withErrors } from '@/lib/server/http';

export const dynamic = 'force-dynamic';

export const GET = withErrors(async () => {
  const admin = await getAdmin();
  return json({ admin: admin ? publicAdmin(admin) : null });
});
