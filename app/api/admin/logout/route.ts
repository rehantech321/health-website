import { destroySession, ADMIN_COOKIE } from '@/lib/server/auth';
import { json, withErrors } from '@/lib/server/http';

export const POST = withErrors(async () => {
  await destroySession(ADMIN_COOKIE);
  return json({ ok: true });
});
