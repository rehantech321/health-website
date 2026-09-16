'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api, logView, Badge, Head, Msg, fmtWhen, fmtDate } from '../../ui';

export default function AppointmentDetail() {
  const { id } = useParams<{ id: string }>();
  const [d, setD] = useState<any>(null);
  const [err, setErr] = useState('');
  const [reason, setReason] = useState('');
  const [notify, setNotify] = useState(true);
  const [msg, setMsg] = useState<{ t: string; k: 'ok' | 'bad' }>({ t: '', k: 'ok' });
  const load = useCallback(() => api<any>(`/api/admin/appointments/${id}`).then((r) => (r.ok ? setD(r.data) : setErr(r.data.error || 'Failed'))), [id]);
  useEffect(() => { load(); logView('appointment', id); }, [load, id]);
  if (err) return <div className="adm-alert">{err}</div>;
  if (!d) return <p>Loading…</p>;
  const { appointment: a, patient: p, clinician: c, payment, intake, summary: s, note } = d;
  const cancellable = ['CONFIRMED', 'PENDING_PAYMENT'].includes(a.status);

  async function cancel() {
    if (!confirm(`Cancel ${a.reference}? The slot is released${notify ? ' and both parties are emailed' : ''}.${payment?.status === 'PAID' ? ' The patient has PAID - you will need to refund in Stripe manually.' : ''}`)) return;
    const r = await api<any>(`/api/admin/appointments/${a.id}/cancel`, { json: { reason, notify } });
    setMsg(r.ok ? { t: `Cancelled.${r.data.refundNeeded ? ` Refund needed in Stripe${r.data.providerRef ? ` (${r.data.providerRef})` : ''}.` : ''}`, k: 'ok' } : { t: r.data.error || 'Failed.', k: 'bad' });
    if (r.ok) load();
  }

  return (
    <>
      <Head title={`${a.reference} · ${a.service}`} sub={`${fmtWhen(a.startsAt)} · ${a.durationMin} min ${a.mode} · booked ${fmtDate(a.createdAt)}`} crumb={{ href: '/admin/appointments/', label: 'Appointments' }}>
        <Badge s={a.status} />
      </Head>
      <div className="adm-grid2">
        <div className="adm-panel">
          <h3>Who</h3>
          <dl className="adm-dl">
            <dt>Patient</dt><dd><a href={`/admin/patients/${p.id}/`} style={{ color: '#6e4c1a' }}>{p.fullName}</a>, age {p.age}<span className="sub">{p.email}{p.phone ? ` · ${p.phone}` : ''} · {p.country}</span></dd>
            <dt>Clinician</dt><dd><a href={`/admin/clinicians/${c.id}/`} style={{ color: '#6e4c1a' }}>{c.displayName}</a><span className="sub">{c.email}</span></dd>
            <dt>Format</dt><dd>{a.mode}{a.mode === 'video' ? (a.joinUrl ? <> · <a href={a.joinUrl} target="_blank" rel="noopener" style={{ color: '#6e4c1a' }}>{a.joinUrl}</a></> : <> · <span className="adm-badge bad">no link yet</span></>) : null}</dd>
          </dl>
          <h3 style={{ marginTop: 16 }}>Money</h3>
          <dl className="adm-dl">
            <dt>List price</dt><dd>{a.listLabel}</dd>
            {a.discountLabel ? <><dt>Discount</dt><dd>−{a.discountLabel} ({a.promoCode})</dd></> : null}
            <dt>Charged</dt><dd>{a.priceLabel}</dd>
            <dt>Payment</dt><dd>{payment ? <><Badge s={payment.status} /> {payment.method}{payment.mock ? ' (mock)' : ''}{payment.provider ? <span className="sub">{payment.provider}</span> : null}{payment.lastError ? <span className="sub" style={{ color: '#a3231b' }}>{payment.lastError}</span> : null}</> : 'none yet'}</dd>
          </dl>
          {cancellable ? (
            <>
              <h3 style={{ marginTop: 16 }}>Cancel this appointment</h3>
              <textarea rows={2} placeholder="Reason (shown to the patient and clinician)" value={reason} onChange={(e) => setReason(e.target.value)} />
              <div className="adm-actions">
                <label className="adm-check"><input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} />Email patient and clinician</label>
                <button className="adm-btn danger" onClick={cancel}>Cancel appointment</button>
              </div>
            </>
          ) : null}
          <Msg text={msg.t} kind={msg.k} />
        </div>

        <div className="adm-panel">
          <h3>Pre-consultation summary {s ? <Badge s={s.riskLevel} /> : null}</h3>
          {intake?.redFlag ? <div className="adm-alert">Safety flag: {intake.redFlagReason}</div> : null}
          {s ? (
            <>
              <p><b>Presenting:</b> {s.presentingComplaint}</p>
              <p><b>History:</b> {s.historySummary}</p>
              {s.suggestedFocus?.length ? <><b>Explore:</b><ul>{s.suggestedFocus.map((x: string, i: number) => <li key={i}>{x}</li>)}</ul></> : null}
              {s.riskFlags?.length ? <><b>Risk flags:</b><ul>{s.riskFlags.map((x: string, i: number) => <li key={i}>{x}</li>)}</ul></> : null}
              <p style={{ fontSize: '.76rem', color: '#6b6252', fontStyle: 'italic' }}>Written by {s.model}. Viewing this is recorded in the audit log.</p>
            </>
          ) : <p className="adm-empty">No intake summary — the patient booked without the guided questions.</p>}
          {intake?.concern ? <><b>In the patient's words</b><p className="adm-quote">{intake.concern}</p></> : null}
          {s?.answerDigest?.length ? <details><summary style={{ cursor: 'pointer', fontWeight: 600 }}>All {s.answerDigest.length} answers</summary><div className="adm-qa" style={{ marginTop: 8 }}>{s.answerDigest.map((q: any, i: number) => <div key={i}><div className="q">{q.question}</div><div className="a">{q.answer}</div></div>)}</div></details> : null}
        </div>
      </div>

      <div className="adm-panel">
        <h3>Clinical note {note?.signedAt ? <Badge s="COMPLETED" label="signed" /> : note ? <Badge s="IN_PROGRESS" label="draft" /> : null}</h3>
        {note ? (
          <dl className="adm-dl"><dt>Subjective</dt><dd>{note.subjective || '—'}</dd><dt>Objective</dt><dd>{note.objective || '—'}</dd><dt>Assessment</dt><dd>{note.assessment || '—'}</dd><dt>Plan</dt><dd>{note.plan || '—'}</dd>{note.signedAt ? <><dt>Signed</dt><dd>{fmtWhen(note.signedAt)}</dd></> : null}</dl>
        ) : <p className="adm-empty">No note yet. Notes are written by the clinician; admins can read but not edit them.</p>}
      </div>
    </>
  );
}
