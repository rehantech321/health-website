'use client';

import { useState } from 'react';
import { api, useList, Badge, Pager, Head, Msg } from '../ui';

export default function Clinicians() {
  const list = useList<any>('/api/admin/clinicians');
  const [adding, setAdding] = useState(false);
  const cats: Record<string, string> = list.extra.categories || {};

  return (
    <>
      <Head title="Clinicians" sub="Everyone who can be booked. Deactivate to hide from booking and block sign-in without losing history.">
        <button className="adm-btn primary" onClick={() => setAdding((v) => !v)}>{adding ? 'Cancel' : '+ Add clinician'}</button>
      </Head>
      {adding ? <AddForm cats={cats} onDone={() => { setAdding(false); list.reload(); }} /> : null}
      <div className="adm-tools">
        <input type="search" placeholder="Search name, email, reg. number" defaultValue={list.params.q || ''} onKeyDown={(e) => e.key === 'Enter' && list.set({ q: (e.target as HTMLInputElement).value })} />
        <select value={list.params.active || ''} onChange={(e) => list.set({ active: e.target.value })}><option value="">Active + inactive</option><option value="true">Active only</option><option value="false">Inactive only</option></select>
      </div>
      <Msg text={list.error} kind="bad" />
      <div className="adm-wrap">
        <table className="adm-table">
          <thead><tr><th>Clinician</th><th>Covers</th><th>Registration</th><th className="num">Upcoming</th><th className="num">Free slots</th><th>Status</th></tr></thead>
          <tbody>
            {list.rows.map((c) => (
              <tr key={c.id} className="row" onClick={() => (location.href = `/admin/clinicians/${c.id}/`)}>
                <td><b>{c.displayName}</b><span className="sub">{c.email}</span></td>
                <td>{c.specialtyLabel}</td>
                <td>{c.regulator} {c.regNumber}</td>
                <td className="num">{c.upcoming}</td>
                <td className="num">{c.freeSlots}{c.active && !c.freeSlots ? <span className="sub" style={{ color: '#a3231b' }}>none published</span> : null}</td>
                <td>{c.active ? <Badge s="CONFIRMED" label="active" /> : <span className="adm-badge bad">inactive</span>}</td>
              </tr>
            ))}
            {!list.loading && !list.rows.length ? <tr><td colSpan={6} className="adm-empty">No clinicians match.</td></tr> : null}
          </tbody>
        </table>
      </div>
      <Pager page={list.page} size={list.size} total={list.total} onPage={list.setPage} />
    </>
  );
}

function AddForm({ cats, onDone }: { cats: Record<string, string>; onDone: () => void }) {
  const [f, setF] = useState({ displayName: '', email: '', specialty: 'mind', regulator: 'GMC', regNumber: '', bio: '', password: '' });
  const [msg, setMsg] = useState('');
  const set = (k: string, v: string) => setF((x) => ({ ...x, [k]: v }));
  async function save() {
    const r = await api('/api/admin/clinicians', { json: f });
    if (!r.ok) { setMsg(r.data.error || 'Failed.'); return; }
    onDone();
  }
  return (
    <div className="adm-panel" style={{ borderColor: '#a97a2c' }}>
      <h3>New clinician</h3>
      <div className="adm-form">
        <div><label>Display name</label><input value={f.displayName} onChange={(e) => set('displayName', e.target.value)} placeholder="Dr. Jane Carter" /></div>
        <div><label>Email (their login)</label><input type="email" value={f.email} onChange={(e) => set('email', e.target.value)} /></div>
        <div><label>Service category</label><select value={f.specialty} onChange={(e) => set('specialty', e.target.value)}>{Object.entries(cats).filter(([k]) => k !== 'founding').map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
        <div><label>Regulator</label><input value={f.regulator} onChange={(e) => set('regulator', e.target.value)} /></div>
        <div><label>Registration number</label><input value={f.regNumber} onChange={(e) => set('regNumber', e.target.value)} /></div>
        <div><label>Initial password (10+ chars; ask them to change it)</label><input type="text" value={f.password} onChange={(e) => set('password', e.target.value)} /></div>
        <div className="full"><label>Bio shown to patients</label><input value={f.bio} onChange={(e) => set('bio', e.target.value)} /></div>
      </div>
      <div className="adm-actions"><button className="adm-btn primary" onClick={save}>Create clinician</button></div>
      <Msg text={msg} kind="bad" />
    </div>
  );
}
