'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api, logView, Badge, Head, Msg, fmtWhen, fmtDate } from '../../ui';

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const [d, setD] = useState<any>(null);
  const [err, setErr] = useState('');
  const load = useCallback(() => api<any>(`/api/admin/patients/${id}`).then((r) => (r.ok ? setD(r.data) : setErr(r.data.error || 'Failed'))), [id]);
  useEffect(() => { load(); logView('patient', id); }, [load, id]);
  if (err) return <div className="adm-alert">{err}</div>;
  if (!d) return <p>Loading…</p>;
  const p = d.patient;

  return (
    <>
      <Head title={p.fullName} sub={`${p.email} · ${p.phone || 'no phone'} · ${p.country} · registered ${fmtDate(p.createdAt)}`} crumb={{ href: '/admin/patients/', label: 'Patients' }} />
      <div className="adm-grid2">
        <EditForm p={p} onSaved={load} />
        <div className="adm-panel">
          <h3>Founding 500 vouchers ({d.vouchers.length})</h3>
          {d.vouchers.length ? <dl className="adm-dl">{d.vouchers.map((v: any) => <div key={v.id} style={{ display: 'contents' }}><dt><code>{v.code}</code></dt><dd>{v.service} · {v.priceLabel} · <Badge s={v.status} /></dd></div>)}</dl> : <p className="adm-empty">None.</p>}
          <h3 style={{ marginTop: 16 }}>Intake sessions ({d.intakes.length})</h3>
          {d.intakes.length ? d.intakes.map((i: any) => <div key={i.id} style={{ fontSize: '.84rem', padding: '4px 0' }}>{fmtDate(i.createdAt)} · {i.specialty} · <Badge s={i.status} />{i.redFlag ? <span className="adm-badge bad" style={{ marginLeft: 6 }}>safety flag</span> : null}</div>) : <p className="adm-empty">None.</p>}
        </div>
      </div>
      <div className="adm-panel">
        <h2>Appointments ({d.appointments.length})</h2>
        <div className="adm-wrap">
          <table className="adm-table">
            <thead><tr><th>Ref</th><th>Service</th><th>Clinician</th><th>When</th><th>Status</th><th>Payment</th><th>Risk</th><th className="num">Paid</th></tr></thead>
            <tbody>
              {d.appointments.map((a: any) => (
                <tr key={a.id} className="row" onClick={() => (location.href = `/admin/appointments/${a.id}/`)}>
                  <td><code>{a.reference}</code></td><td>{a.service}</td><td><a href={`/admin/clinicians/${a.clinicianId}/`} onClick={(e) => e.stopPropagation()}>{a.clinician}</a></td>
                  <td>{fmtWhen(a.startsAt)}<span className="sub">{a.mode}</span></td><td><Badge s={a.status} /></td>
                  <td>{a.paymentStatus ? <><Badge s={a.paymentStatus} /><span className="sub">{a.paymentMethod}</span></> : '—'}</td>
                  <td><Badge s={a.riskLevel} /></td><td className="num">{a.priceLabel}</td>
                </tr>
              ))}
              {!d.appointments.length ? <tr><td colSpan={8} className="adm-empty">No appointments.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function EditForm({ p, onSaved }: { p: any; onSaved: () => void }) {
  const [f, setF] = useState({ fullName: p.fullName, email: p.email, phone: p.phone || '', country: p.country, dateOfBirth: p.dateOfBirth });
  const [msg, setMsg] = useState<{ t: string; k: 'ok' | 'bad' }>({ t: '', k: 'ok' });
  const set = (k: string, v: string) => setF((x) => ({ ...x, [k]: v }));
  async function save() {
    const r = await api(`/api/admin/patients/${p.id}`, { method: 'PATCH', json: f });
    setMsg(r.ok ? { t: 'Saved.', k: 'ok' } : { t: r.data.error || 'Failed.', k: 'bad' });
    if (r.ok) onSaved();
  }
  async function del() {
    if (!confirm(`Delete ${p.fullName} and their account? Refused if they have paid bookings.`)) return;
    const r = await api(`/api/admin/patients/${p.id}`, { method: 'DELETE' });
    if (!r.ok) { setMsg({ t: r.data.error || 'Failed.', k: 'bad' }); return; }
    location.href = '/admin/patients/';
  }
  return (
    <div className="adm-panel">
      <h3>Details</h3>
      <div className="adm-form">
        <div><label>Full name</label><input value={f.fullName} onChange={(e) => set('fullName', e.target.value)} /></div>
        <div><label>Email (login)</label><input value={f.email} onChange={(e) => set('email', e.target.value)} /></div>
        <div><label>Phone</label><input value={f.phone} onChange={(e) => set('phone', e.target.value)} /></div>
        <div><label>Country</label><input value={f.country} onChange={(e) => set('country', e.target.value)} /></div>
        <div><label>Date of birth</label><input type="date" value={f.dateOfBirth} onChange={(e) => set('dateOfBirth', e.target.value)} /></div>
      </div>
      <div className="adm-actions">
        <button className="adm-btn primary" onClick={save}>Save changes</button>
        <button className="adm-btn danger" onClick={del}>Delete patient</button>
      </div>
      <Msg text={msg.t} kind={msg.k} />
    </div>
  );
}
