'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api, useList, Badge, Pager, Head, Msg, fmtDate } from '../ui';

const CATS: Record<string, string> = { mind: 'Mental Health & Neurodevelopmental', women: "Women's Health & Maternity", child: 'Children & SEND', body: 'Adult Specialties', testing: 'Objective Testing', postdx: 'Post-Diagnostic Support', premium: 'Premium Packages', legal: 'Medico-Legal', dementia: 'Dementia Care', mens: "Men's Health", skin: 'Skin & Dermatology', hearing: 'Hearing & Eye Care' };

export default function Applications() {
  const sp = useSearchParams();
  const list = useList<any>('/api/admin/applications', { status: sp.get('status') || 'RECEIVED' });
  const [open, setOpen] = useState<any>(null);

  return (
    <>
      <Head title="Doctor applications" sub="Clinicians who applied to join the network. Approving one creates their portal login." />
      <div className="adm-tools">
        <select value={list.params.status} onChange={(e) => list.set({ status: e.target.value })}>
          <option value="RECEIVED">New</option><option value="UNDER_REVIEW">Under review</option><option value="APPROVED">Approved</option><option value="DECLINED">Declined</option><option value="all">All</option>
        </select>
        <input type="search" placeholder="Search name, email, specialty, reg. number" defaultValue={list.params.q || ''} onKeyDown={(e) => e.key === 'Enter' && list.set({ q: (e.target as HTMLInputElement).value })} />
      </div>
      <Msg text={list.error} kind="bad" />
      <div className="adm-wrap">
        <table className="adm-table">
          <thead><tr><th>Applicant</th><th>Specialty</th><th>Registration</th><th>Experience</th><th>Applied</th><th>Status</th></tr></thead>
          <tbody>
            {list.rows.map((a) => (
              <tr key={a.id} className="row" onClick={() => setOpen(a)}>
                <td><b>{a.fullName}</b><span className="sub">{a.email} · {a.country}</span></td>
                <td>{a.specialty}<span className="sub">{a.qualification}</span></td>
                <td>{a.regulator} {a.regNumber}</td>
                <td>{a.experience}<span className="sub">{a.hoursPerWeek} · {a.languages}</span></td>
                <td>{fmtDate(a.createdAt)}</td>
                <td><Badge s={a.status} /></td>
              </tr>
            ))}
            {!list.loading && !list.rows.length ? <tr><td colSpan={6} className="adm-empty">No applications here.</td></tr> : null}
          </tbody>
        </table>
      </div>
      <Pager page={list.page} size={list.size} total={list.total} onPage={list.setPage} />
      {open ? <Review app={open} onClose={(changed) => { setOpen(null); if (changed) list.reload(); }} /> : null}
    </>
  );
}

function Review({ app, onClose }: { app: any; onClose: (changed: boolean) => void }) {
  const guess = guessCat(app.specialty);
  const [specialtyKey, setKey] = useState(guess);
  const [displayName, setName] = useState(/^(dr|prof)\.?\s/i.test(app.fullName) ? app.fullName : `Dr. ${app.fullName}`);
  const [notes, setNotes] = useState(app.reviewNotes || '');
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState<{ t: string; k: 'ok' | 'bad' }>({ t: '', k: 'ok' });
  const done = app.status === 'APPROVED' || app.status === 'DECLINED';

  async function decide(action: 'approve' | 'decline' | 'review') {
    if (action === 'approve' && !confirm(`Approve ${app.fullName} and create their clinician login as "${displayName}" in ${CATS[specialtyKey]}?`)) return;
    if (action === 'decline' && !confirm(`Decline ${app.fullName}? They will be emailed.`)) return;
    setBusy(action);
    const r = await api<any>(`/api/admin/applications/${app.id}`, { json: { action, notes, specialtyKey, displayName } });
    setBusy('');
    if (!r.ok) { setMsg({ t: r.data.error || 'Failed.', k: 'bad' }); return; }
    setMsg({ t: action === 'approve' ? 'Approved. Their login is active and they have been emailed.' : action === 'decline' ? 'Declined and emailed.' : 'Marked under review.', k: 'ok' });
    setTimeout(() => onClose(true), 900);
  }

  return (
    <div className="adm-panel" style={{ marginTop: 18, borderColor: '#a97a2c' }}>
      <div className="adm-head" style={{ marginBottom: 12 }}>
        <div><h2>{app.fullName}</h2><p>{app.email} · applied {fmtDate(app.createdAt)} · <Badge s={app.status} /></p></div>
        <button className="adm-btn sm" onClick={() => onClose(false)}>Close</button>
      </div>
      <div className="adm-grid2">
        <dl className="adm-dl">
          <dt>Specialty (as written)</dt><dd>{app.specialty}</dd>
          <dt>Qualification</dt><dd>{app.qualification}</dd>
          <dt>Regulator</dt><dd>{app.regulator} — reg. no. <b>{app.regNumber}</b></dd>
          <dt>Country</dt><dd>{app.country}</dd>
          <dt>Experience</dt><dd>{app.experience}</dd>
          <dt>Hours per week</dt><dd>{app.hoursPerWeek}</dd>
          <dt>Languages</dt><dd>{app.languages}</dd>
        </dl>
        {!done ? (
          <div>
            <div className="adm-form">
              <div className="full"><label>Display name on the site</label><input value={displayName} onChange={(e) => setName(e.target.value)} /></div>
              <div className="full"><label>Service category this clinician will receive bookings for</label>
                <select value={specialtyKey} onChange={(e) => setKey(e.target.value)}>{Object.entries(CATS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
                {guess === specialtyKey ? <span className="sub" style={{ fontSize: '.76rem', color: '#6b6252' }}>Suggested from "{app.specialty}" — check it.</span> : null}
              </div>
              <div className="full"><label>Review notes (included in a decline email; kept on file either way)</label><textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
            </div>
            <p style={{ fontSize: '.8rem', color: '#a3231b', marginTop: 10 }}>Verify the registration number with {app.regulator || 'the regulator'} before approving. Approval activates the account immediately.</p>
            <div className="adm-actions">
              <button className="adm-btn ok" disabled={!!busy} onClick={() => decide('approve')}>{busy === 'approve' ? 'Approving…' : 'Approve & create login'}</button>
              {app.status === 'RECEIVED' ? <button className="adm-btn" disabled={!!busy} onClick={() => decide('review')}>Mark under review</button> : null}
              <button className="adm-btn danger" disabled={!!busy} onClick={() => decide('decline')}>{busy === 'decline' ? 'Declining…' : 'Decline'}</button>
            </div>
            <Msg text={msg.t} kind={msg.k} />
          </div>
        ) : (
          <div><p style={{ color: '#6b6252' }}>Decided {app.reviewedAt ? fmtDate(app.reviewedAt) : ''}.{app.reviewNotes ? ` Notes: ${app.reviewNotes}` : ''}</p>
            {app.clinicianId ? <a className="adm-btn sm" href={`/admin/clinicians/${app.clinicianId}/`}>Open clinician record</a> : null}</div>
        )}
      </div>
    </div>
  );
}

function guessCat(s: string) {
  s = s.toLowerCase();
  if (/psych|adhd|autism|mental|neuro/.test(s)) return 'mind';
  if (/gyn|obstet|women|maternity|menopaus|fertil/.test(s)) return 'women';
  if (/paed|pediatr|child|speech|occupational/.test(s)) return 'child';
  if (/dement|memory|geriatr|old age/.test(s)) return 'dementia';
  if (/urolog|men.?s|androl/.test(s)) return 'mens';
  if (/derm|skin/.test(s)) return 'skin';
  if (/audio|hearing|ent\b|ophthal|eye/.test(s)) return 'hearing';
  if (/legal|forensic|capacity|witness/.test(s)) return 'legal';
  if (/coach|cbt|therap|counsel|nutrition|dietit/.test(s)) return 'postdx';
  if (/psycholog|testing|cognitive/.test(s)) return 'testing';
  return 'body';
}
