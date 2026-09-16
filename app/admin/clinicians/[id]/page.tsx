'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api, Badge, Head, Msg, fmtWhen, fmtDate } from '../../ui';

export default function ClinicianDetail() {
  const { id } = useParams<{ id: string }>();
  const [d, setD] = useState<any>(null);
  const [err, setErr] = useState('');
  const load = useCallback(() => api<any>(`/api/admin/clinicians/${id}`).then((r) => (r.ok ? setD(r.data) : setErr(r.data.error || 'Failed'))), [id]);
  useEffect(() => { load(); }, [load]);
  if (err) return <div className="adm-alert">{err}</div>;
  if (!d) return <p>Loading…</p>;
  const c = d.clinician;
  const free = d.slots.filter((s: any) => !s.booked).length;

  return (
    <>
      <Head title={c.displayName} sub={`${c.specialtyLabel} · ${c.email} · joined ${fmtDate(c.createdAt)}`} crumb={{ href: '/admin/clinicians/', label: 'Clinicians' }}>
        {c.active ? <Badge s="CONFIRMED" label="active" /> : <span className="adm-badge bad">inactive</span>}
      </Head>
      <div className="adm-grid2">
        <EditForm c={c} cats={d.categories} onSaved={load} />
        <Availability id={c.id} slots={d.slots} free={free} onChanged={load} />
      </div>
      <div className="adm-panel">
        <h2>Appointments ({d.appointments.length})</h2>
        <div className="adm-wrap">
          <table className="adm-table">
            <thead><tr><th>Ref</th><th>Patient</th><th>Service</th><th>When</th><th>Status</th><th>Link</th><th>Note</th><th className="num">Paid</th></tr></thead>
            <tbody>
              {d.appointments.map((a: any) => (
                <tr key={a.id} className="row" onClick={() => (location.href = `/admin/appointments/${a.id}/`)}>
                  <td><code>{a.reference}</code></td><td>{a.patient}</td><td>{a.service}</td><td>{fmtWhen(a.startsAt)}<span className="sub">{a.mode}</span></td>
                  <td><Badge s={a.status} /></td>
                  <td>{a.mode === 'video' ? (a.hasLink ? <Badge s="PAID" label="added" /> : a.status === 'CONFIRMED' ? <span className="adm-badge bad">missing</span> : '—') : 'phone'}</td>
                  <td>{a.noteSigned ? <Badge s="COMPLETED" label="signed" /> : '—'}</td><td className="num">{a.priceLabel}</td>
                </tr>
              ))}
              {!d.appointments.length ? <tr><td colSpan={8} className="adm-empty">No appointments yet.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function EditForm({ c, cats, onSaved }: { c: any; cats: Record<string, string>; onSaved: () => void }) {
  const [f, setF] = useState({ displayName: c.displayName, email: c.email, specialty: c.specialty, regulator: c.regulator || '', regNumber: c.regNumber || '', bio: c.bio || '', newPassword: '' });
  const [msg, setMsg] = useState<{ t: string; k: 'ok' | 'bad' }>({ t: '', k: 'ok' });
  const set = (k: string, v: string) => setF((x) => ({ ...x, [k]: v }));
  async function save() {
    const r = await api(`/api/admin/clinicians/${c.id}`, { method: 'PATCH', json: f });
    setMsg(r.ok ? { t: f.newPassword ? 'Saved. Password reset; their other sessions were signed out.' : 'Saved.', k: 'ok' } : { t: r.data.error || 'Failed.', k: 'bad' });
    if (r.ok) { set('newPassword', ''); onSaved(); }
  }
  async function toggleActive() {
    const next = !c.active;
    if (!confirm(next ? `Reactivate ${c.displayName}?` : `Deactivate ${c.displayName}? They will be signed out, hidden from booking, and unable to sign in. Existing bookings are kept.`)) return;
    const r = await api(`/api/admin/clinicians/${c.id}`, { method: 'PATCH', json: { active: next } });
    setMsg(r.ok ? { t: next ? 'Reactivated.' : 'Deactivated.', k: 'ok' } : { t: r.data.error || 'Failed.', k: 'bad' });
    onSaved();
  }
  async function del() {
    if (!confirm(`Permanently delete ${c.displayName}? This only works if they have no appointment records.`)) return;
    const r = await api(`/api/admin/clinicians/${c.id}`, { method: 'DELETE' });
    if (!r.ok) { setMsg({ t: r.data.error || 'Failed.', k: 'bad' }); return; }
    location.href = '/admin/clinicians/';
  }
  return (
    <div className="adm-panel">
      <h3>Details</h3>
      <div className="adm-form">
        <div><label>Display name</label><input value={f.displayName} onChange={(e) => set('displayName', e.target.value)} /></div>
        <div><label>Email (login)</label><input value={f.email} onChange={(e) => set('email', e.target.value)} /></div>
        <div><label>Service category</label><select value={f.specialty} onChange={(e) => set('specialty', e.target.value)}>{Object.entries(cats).filter(([k]) => k !== 'founding').map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
        <div><label>Regulator</label><input value={f.regulator} onChange={(e) => set('regulator', e.target.value)} /></div>
        <div><label>Registration number</label><input value={f.regNumber} onChange={(e) => set('regNumber', e.target.value)} /></div>
        <div><label>Reset password (leave blank to keep)</label><input type="text" value={f.newPassword} onChange={(e) => set('newPassword', e.target.value)} placeholder="new password, 10+ chars" /></div>
        <div className="full"><label>Bio shown to patients</label><textarea rows={2} value={f.bio} onChange={(e) => set('bio', e.target.value)} /></div>
      </div>
      <div className="adm-actions">
        <button className="adm-btn primary" onClick={save}>Save changes</button>
        <button className={`adm-btn ${c.active ? 'danger' : 'ok'}`} onClick={toggleActive}>{c.active ? 'Deactivate' : 'Reactivate'}</button>
        <button className="adm-btn danger" onClick={del}>Delete</button>
      </div>
      <Msg text={msg.t} kind={msg.k} />
    </div>
  );
}

function Availability({ id, slots, free, onChanged }: { id: string; slots: any[]; free: number; onChanged: () => void }) {
  const today = new Date().toISOString().slice(0, 10);
  const plus4w = new Date(Date.now() + 28 * 86400000).toISOString().slice(0, 10);
  const [f, setF] = useState({ from: today, to: plus4w, hours: [9, 10, 11, 14, 15, 16], weekdays: [1, 2, 3, 4, 5], durationMin: 60, mode: 'video' });
  const [msg, setMsg] = useState<{ t: string; k: 'ok' | 'bad' }>({ t: '', k: 'ok' });
  const toggle = (k: 'hours' | 'weekdays', v: number) => setF((x) => ({ ...x, [k]: x[k].includes(v) ? x[k].filter((n) => n !== v) : [...x[k], v].sort((a, b) => a - b) }));
  async function publish() {
    const r = await api<any>(`/api/admin/clinicians/${id}/slots`, { json: f });
    setMsg(r.ok ? { t: `Published ${r.data.created} new slot${r.data.created === 1 ? '' : 's'}.`, k: 'ok' } : { t: r.data.error || 'Failed.', k: 'bad' });
    if (r.ok) onChanged();
  }
  async function clear() {
    if (!confirm(`Remove all FREE slots from ${f.from} to ${f.to}? Booked ones are kept.`)) return;
    const r = await api<any>(`/api/admin/clinicians/${id}/slots`, { method: 'DELETE', json: { from: f.from, to: f.to } });
    setMsg(r.ok ? { t: `Removed ${r.data.removed} free slot${r.data.removed === 1 ? '' : 's'}.`, k: 'ok' } : { t: r.data.error || 'Failed.', k: 'bad' });
    if (r.ok) onChanged();
  }
  async function delOne(slotId: string) {
    const r = await api(`/api/admin/slots/${slotId}`, { method: 'DELETE' });
    if (!r.ok) setMsg({ t: r.data.error || 'Failed.', k: 'bad' }); else onChanged();
  }
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const byDay: Record<string, any[]> = {};
  for (const s of slots) { const k = new Date(s.startsAt).toDateString(); (byDay[k] ||= []).push(s); }

  return (
    <div className="adm-panel">
      <h3>Availability <span className="adm-badge accent" style={{ marginLeft: 8 }}>{free} free</span></h3>
      <div className="adm-form">
        <div><label>From</label><input type="date" value={f.from} onChange={(e) => setF({ ...f, from: e.target.value })} /></div>
        <div><label>To</label><input type="date" value={f.to} onChange={(e) => setF({ ...f, to: e.target.value })} /></div>
        <div><label>Length</label><select value={f.durationMin} onChange={(e) => setF({ ...f, durationMin: Number(e.target.value) })}><option value={30}>30 min</option><option value={45}>45 min</option><option value={60}>60 min</option><option value={90}>90 min</option></select></div>
        <div><label>Format</label><select value={f.mode} onChange={(e) => setF({ ...f, mode: e.target.value })}><option value="video">video</option><option value="phone">phone</option></select></div>
        <div className="full"><label>Days</label>{[1, 2, 3, 4, 5, 6, 0].map((d) => <label key={d} className="adm-check"><input type="checkbox" checked={f.weekdays.includes(d)} onChange={() => toggle('weekdays', d)} />{days[d]}</label>)}</div>
        <div className="full"><label>Start hours</label>{[8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19].map((h) => <label key={h} className="adm-check"><input type="checkbox" checked={f.hours.includes(h)} onChange={() => toggle('hours', h)} />{String(h).padStart(2, '0')}:00</label>)}</div>
      </div>
      <div className="adm-actions">
        <button className="adm-btn primary" onClick={publish}>Publish slots</button>
        <button className="adm-btn danger" onClick={clear}>Remove free slots in range</button>
      </div>
      <Msg text={msg.t} kind={msg.k} />
      <div style={{ maxHeight: 280, overflowY: 'auto', marginTop: 14, fontSize: '.82rem' }}>
        {Object.entries(byDay).slice(0, 60).map(([day, ss]) => (
          <div key={day} style={{ padding: '6px 0', borderTop: '1px solid #e3dccb' }}>
            <b>{day}</b>{' '}
            {ss.map((s: any) => (
              <span key={s.id} className={`adm-badge ${s.booked ? 'ok' : ''}`} style={{ marginLeft: 6 }}>
                {new Date(s.startsAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} {s.mode[0]}
                {!s.booked ? <button onClick={() => delOne(s.id)} title="Remove" style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: 4, color: '#a3231b' }}>×</button> : ' ✓'}
              </span>
            ))}
          </div>
        ))}
        {!slots.length ? <p className="adm-empty">No future slots. Publish some above or patients cannot book this clinician.</p> : null}
      </div>
    </div>
  );
}
