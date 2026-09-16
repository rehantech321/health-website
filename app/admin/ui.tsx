'use client';

// Small shared toolkit for the admin pages: an API helper, list state with
// search + paging, and a few presentational pieces. No component library -
// everything here is a few lines and the panel stays dependency-free.
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

export async function api<T = any>(path: string, init?: RequestInit & { json?: unknown }): Promise<{ ok: boolean; status: number; data: T & { error?: string } }> {
  const res = await fetch(path, {
    method: init?.method || (init?.json !== undefined ? 'POST' : 'GET'),
    credentials: 'same-origin',
    headers: { ...(init?.json !== undefined ? { 'Content-Type': 'application/json' } : {}), ...(init?.headers || {}) },
    body: init?.json !== undefined ? JSON.stringify(init.json) : init?.body,
  }).catch(() => null);
  if (!res) return { ok: false, status: 0, data: { error: 'Could not reach the server.' } as any };
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

/// Read-access audit: pages that show clinical content call this on open.
export function logView(kind: string, id: string) {
  api('/api/admin/audit', { json: { action: `${kind}.view`, target: id } });
}

export function useList<T>(path: string, initial: Record<string, string> = {}) {
  const [params, setParams] = useState<Record<string, string>>({ page: '1', ...initial });
  const [rows, setRows] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [extra, setExtra] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== '' && v != null)).toString();
    const r = await api<any>(`${path}?${qs}`);
    setLoading(false);
    if (!r.ok) { setError(r.data.error || 'Failed to load.'); return; }
    setError('');
    const { rows, total, ...rest } = r.data;
    setRows(rows || []); setTotal(total || 0); setExtra(rest);
  }, [path, params]);

  useEffect(() => { reload(); }, [reload]);

  const set = (patch: Record<string, string>) => setParams((p) => ({ ...p, page: '1', ...patch }));
  const page = Number(params.page) || 1;
  const size = Number(params.size) || 50;
  return { rows, total, extra, loading, error, params, set, reload, page, size, setPage: (n: number) => setParams((p) => ({ ...p, page: String(n) })) };
}

export function Badge({ s, label }: { s: string | null | undefined; label?: string }) {
  if (!s) return <span className="adm-badge">—</span>;
  const m: Record<string, string> = {
    CONFIRMED: 'ok', COMPLETED: 'info', PAID: 'ok', REDEEMED: 'info', APPROVED: 'ok', CLOSED: 'info', routine: 'ok',
    PENDING_PAYMENT: 'warn', PROCESSING: 'warn', RECEIVED: 'warn', UNDER_REVIEW: 'accent', NEW: 'warn', IN_PROGRESS: 'accent', elevated: 'warn',
    CANCELLED: 'bad', EXPIRED: '', FAILED: 'bad', DECLINED: 'bad', urgent: 'bad',
  };
  return <span className={`adm-badge ${m[s] ?? ''}`}>{label ?? s.replace(/_/g, ' ').toLowerCase()}</span>;
}

export function Pager({ page, size, total, onPage }: { page: number; size: number; total: number; onPage: (n: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / size));
  return (
    <div className="adm-pager">
      <span>{total} total · page {page} of {pages}</span>
      <button className="adm-btn sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>‹ Prev</button>
      <button className="adm-btn sm" disabled={page >= pages} onClick={() => onPage(page + 1)}>Next ›</button>
    </div>
  );
}

export function Msg({ text, kind }: { text: string; kind: 'ok' | 'bad' }) {
  return text ? <div className={`adm-msg ${kind}`}>{text}</div> : null;
}

export const fmtWhen = (iso: string) => new Date(iso).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
export const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
export const money = (minor: number) => '£' + (minor / 100).toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

export function Head({ title, sub, crumb, children }: { title: string; sub?: string; crumb?: { href: string; label: string }; children?: React.ReactNode }) {
  return (
    <div className="adm-head">
      <div>
        {crumb ? <div className="adm-crumb"><Link href={crumb.href}>‹ {crumb.label}</Link></div> : null}
        <h1>{title}</h1>
        {sub ? <p>{sub}</p> : null}
      </div>
      <div className="adm-actions" style={{ marginTop: 0 }}>{children}</div>
    </div>
  );
}
