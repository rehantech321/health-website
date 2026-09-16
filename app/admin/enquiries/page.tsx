'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api, useList, Badge, Pager, Head, Msg, fmtWhen } from '../ui';

export default function Enquiries() {
  const sp = useSearchParams();
  const list = useList<any>('/api/admin/enquiries', { status: sp.get('status') || 'NEW' });
  const [open, setOpen] = useState<string | null>(null);

  async function setStatus(id: string, status: string) {
    const r = await api(`/api/admin/enquiries/${id}`, { method: 'PATCH', json: { status } });
    if (r.ok) list.reload();
  }
  async function del(id: string) {
    if (!confirm('Delete this enquiry?')) return;
    const r = await api(`/api/admin/enquiries/${id}`, { method: 'DELETE' });
    if (r.ok) list.reload();
  }

  return (
    <>
      <Head title="Enquiries" sub="Every form on the site: employers, schools, insurers, legal, testimonials, general contact." />
      <div className="adm-tools">
        <select value={list.params.status} onChange={(e) => list.set({ status: e.target.value })}><option value="NEW">New</option><option value="IN_PROGRESS">In progress</option><option value="CLOSED">Closed</option><option value="all">All</option></select>
        <input type="search" placeholder="Search name, email, kind" defaultValue={list.params.q || ''} onKeyDown={(e) => e.key === 'Enter' && list.set({ q: (e.target as HTMLInputElement).value })} />
      </div>
      <Msg text={list.error} kind="bad" />
      <div className="adm-wrap">
        <table className="adm-table">
          <thead><tr><th>Received</th><th>Kind</th><th>From</th><th>Routed to</th><th>Emailed</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {list.rows.map((e) => (
              <>
                <tr key={e.id} className="row" onClick={() => setOpen(open === e.id ? null : e.id)}>
                  <td>{fmtWhen(e.createdAt)}</td><td><Badge s={e.kind} /></td><td><b>{e.name}</b><span className="sub">{e.email}</span></td><td>{e.routedTo}</td>
                  <td>{e.notifiedAt ? <Badge s="PAID" label="sent" /> : <span className="adm-badge warn">logged only</span>}</td><td><Badge s={e.status} /></td>
                  <td onClick={(ev) => ev.stopPropagation()}>
                    {e.status !== 'IN_PROGRESS' ? <button className="adm-btn sm" onClick={() => setStatus(e.id, 'IN_PROGRESS')}>In progress</button> : null}{' '}
                    {e.status !== 'CLOSED' ? <button className="adm-btn sm ok" onClick={() => setStatus(e.id, 'CLOSED')}>Close</button> : null}{' '}
                    <button className="adm-btn sm danger" onClick={() => del(e.id)}>Delete</button>
                  </td>
                </tr>
                {open === e.id ? (
                  <tr key={e.id + 'x'}><td colSpan={7} style={{ background: '#faf7f0' }}>
                    <div className="adm-qa">{Object.entries(e.fields || {}).length ? Object.entries(e.fields).map(([k, v]) => <div key={k}><div className="q">{k}</div><div className="a">{String(v)}</div></div>) : <span className="adm-empty">No extra fields.</span>}</div>
                    <p style={{ marginTop: 8 }}><a className="adm-btn sm" href={`mailto:${e.email}?subject=Re: your enquiry to Eldava Health`}>Reply by email</a></p>
                  </td></tr>
                ) : null}
              </>
            ))}
            {!list.loading && !list.rows.length ? <tr><td colSpan={7} className="adm-empty">Nothing here.</td></tr> : null}
          </tbody>
        </table>
      </div>
      <Pager page={list.page} size={list.size} total={list.total} onPage={list.setPage} />
    </>
  );
}
