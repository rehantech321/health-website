'use client';

import { useSearchParams } from 'next/navigation';
import { useList, Badge, Pager, Head, Msg, fmtWhen } from '../ui';

export default function Appointments() {
  const sp = useSearchParams();
  const list = useList<any>('/api/admin/appointments', { status: sp.get('status') || 'all', upcoming: sp.get('upcoming') || '' });
  const clinicians: { id: string; displayName: string }[] = list.extra.clinicians || [];

  return (
    <>
      <Head title="Appointments" sub="Every booking across every clinician." />
      <div className="adm-tools">
        <input type="search" placeholder="Reference, patient, clinician" defaultValue={list.params.q || ''} onKeyDown={(e) => e.key === 'Enter' && list.set({ q: (e.target as HTMLInputElement).value })} />
        <select value={list.params.status} onChange={(e) => list.set({ status: e.target.value })}>
          <option value="all">All statuses</option><option value="CONFIRMED">Confirmed</option><option value="COMPLETED">Completed</option><option value="PENDING_PAYMENT">Awaiting payment</option><option value="CANCELLED">Cancelled</option><option value="EXPIRED">Expired holds</option>
        </select>
        <select value={list.params.clinicianId || ''} onChange={(e) => list.set({ clinicianId: e.target.value })}>
          <option value="">All clinicians</option>{clinicians.map((c) => <option key={c.id} value={c.id}>{c.displayName}</option>)}
        </select>
        <label className="adm-check"><input type="checkbox" checked={list.params.upcoming === 'true'} onChange={(e) => list.set({ upcoming: e.target.checked ? 'true' : '' })} />Upcoming only</label>
        <input type="date" value={list.params.from || ''} onChange={(e) => list.set({ from: e.target.value })} title="From" />
        <input type="date" value={list.params.to || ''} onChange={(e) => list.set({ to: e.target.value })} title="To" />
      </div>
      <Msg text={list.error} kind="bad" />
      <div className="adm-wrap">
        <table className="adm-table">
          <thead><tr><th>Ref</th><th>Patient</th><th>Service</th><th>Clinician</th><th>When</th><th>Status</th><th>Payment</th><th>Link</th><th>Intake</th><th className="num">Paid</th></tr></thead>
          <tbody>
            {list.rows.map((a) => (
              <tr key={a.id} className="row" onClick={() => (location.href = `/admin/appointments/${a.id}/`)}>
                <td><code>{a.reference}</code></td><td>{a.patient}</td><td>{a.service}</td><td>{a.clinician}</td>
                <td>{fmtWhen(a.startsAt)}<span className="sub">{a.mode} · {a.durationMin} min</span></td>
                <td><Badge s={a.status} /></td>
                <td>{a.paymentStatus ? <><Badge s={a.paymentStatus} /><span className="sub">{a.paymentMethod}</span></> : '—'}</td>
                <td>{a.mode === 'video' ? (a.hasLink ? <Badge s="PAID" label="added" /> : a.status === 'CONFIRMED' ? <span className="adm-badge bad">missing</span> : '—') : 'phone'}</td>
                <td>{a.hasSummary ? <Badge s={a.riskLevel} /> : <span className="adm-badge">none</span>}</td>
                <td className="num">{a.priceLabel}</td>
              </tr>
            ))}
            {!list.loading && !list.rows.length ? <tr><td colSpan={10} className="adm-empty">No appointments match.</td></tr> : null}
          </tbody>
        </table>
      </div>
      <Pager page={list.page} size={list.size} total={list.total} onPage={list.setPage} />
    </>
  );
}
