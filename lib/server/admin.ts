import type { Admin } from '@prisma/client';
import prisma from './db';

/// Records a state-changing admin action. Called after the change succeeds,
/// so the log never claims something that did not happen.
export async function audit(admin: Admin, action: string, target: string, meta: Record<string, unknown> = {}) {
  await prisma.adminAuditLog.create({ data: { adminId: admin.id, action, target, meta: meta as any } }).catch((e) => {
    // Never let audit failure break the action itself - but do make noise.
    console.error('[audit] failed to record', action, target, e);
  });
}

/// Page/size from a query string, bounded so one request cannot pull the table.
export function paging(url: URL, defaultSize = 50) {
  const page = Math.max(1, Number(url.searchParams.get('page') || 1) || 1);
  const size = Math.min(200, Math.max(1, Number(url.searchParams.get('size') || defaultSize) || defaultSize));
  return { page, size, skip: (page - 1) * size, take: size };
}

/// Case-insensitive "contains" across several fields for a search box.
export function searchWhere(q: string | null, fields: string[]) {
  const term = (q || '').trim();
  if (!term) return {};
  return { OR: fields.map((f) => ({ [f]: { contains: term, mode: 'insensitive' as const } })) };
}
