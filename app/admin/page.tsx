'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, Badge, Head, fmtWhen, money } from './ui';

export default function Dashboard() {
  const [d, setD] = useState<any>(null);
  const [err, setErr] = useState('');
  useEffect(() => { api<any>('/api/admin/stats').then((r) => (r.ok ? setD(r.data) : setErr(r.data.error || 'Failed'))); }, []);
  if (err) return <div className="adm-alert">{err}</div>;
  if (!d) return <p>Loading…</p>;
  const c = d.counts;
  const attention = c.pendingApplications + c.newEnquiries + c.videoMissingLink;

  return (
    <>
      <Head title="Dashboard" sub="Where the practice stands right now." />

      {attention > 0 ? (
        <div className="adm-alert">
          {attention} item{attention === 1 ? '' : 's'} need attention:
          {c.pendingApplications ? <> <Link href="/admin/applications/?status=RECEIVED" style={{ textDecoration: 'underline' }}>{c.pendingApplications} doctor application{c.pendingApplications === 1 ? '' : 's'}</Link>,</> : null}
          {c.newEnquiries ? <> <Link href="/admin/enquiries/?status=NEW" style={{ textDecoration: 'underline' }}>{c.newEnquiries} new enquir{c.newEnquiries === 1 ? 'y' : 'ies'}</Link>,</> : null}
          {c.videoMissingLink ? <> <Link href="/admin/appointments/?upcoming=true" style={{ textDecoration: 'underline' }}>{c.videoMissingLink} upcoming video appointment{c.videoMissingLink === 1 ? '' : 's'} without a link</Link></> : null}
        </div>
      ) : null}

      <div className="adm-cards">
        <div className="adm-card"><div className="k">Revenue, this month</div><div className="v">{money(d.revenue.thisMonthMinor)}</div><div className="s">{money(d.revenue.allTimeMinor)} all time</div></div>
        <div className="adm-card"><div className="k">Upcoming appointments</div><div className="v">{c.upcoming}</div><div className="s">{c.next7days} in the next 7 days</div></div>
        <div className="adm-card"><div className="k">Completed</div><div className="v">{c.completed}</div><div className="s">signed off by a clinician</div></div>
        <div className={`adm-card${c.pendingApplications ? ' attn' : ''}`}><div className="k">Doctor applications</div><div className={`v${c.pendingApplications ? ' warn' : ''}`}>{c.pendingApplications}</div><div className="s">awaiting review</div></div>
        <div className="adm-card"><div className="k">Patients</div><div className="v">{c.patients}</div><div className="s">registered accounts</div></div>
        <div className="adm-card"><div className="k">Clinicians</div><div className="v">{c.activeClinicians}</div><div className="s">active of {c.clinicians} · {c.freeSlots} free slots</div></div>
        <div className={`adm-card${c.newEnquiries ? ' attn' : ''}`}><div className="k">New enquiries</div><div className={`v${c.newEnquiries ? ' warn' : ''}`}>{c.newEnquiries}</div><div className="s">unanswered</div></div>
        <div className="adm-card"><div className="k">Founding 500</div><div className="v">{c.vouchersPaid}</div><div className="s">vouchers sold of 500</div></div>
      </div>

      <div className="adm-panel">
        <h2>Latest bookings</h2>
        <div className="adm-wrap">
          <table className="adm-table">
            <thead><tr><th>Reference</th><th>Patient</th><th>Service</th><th>Clinician</th><th>When</th><th>Status</th><th className="num">Paid</th></tr></thead>
            <tbody>
              {d.recent.length ? d.recent.map((a: any) => (
                <tr key={a.id} className="row" onClick={() => (location.href = `/admin/appointments/${a.id}/`)}>
                  <td><code>{a.reference}</code></td><td>{a.patient}</td><td>{a.service}</td><td>{a.clinician}</td><td>{fmtWhen(a.startsAt)}</td><td><Badge s={a.status} /></td><td className="num">{money(a.priceMinor)}</td>
                </tr>
              )) : <tr><td colSpan={7} className="adm-empty">No paid bookings yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <SystemStatus />
    </>
  );
}

const LABELS: Record<string, string> = { database: 'Database', payments: 'Payments (Stripe)', klarna: 'Klarna / pay later', webhook: 'Payment webhook', email: 'Email', ai: 'AI intake', siteUrl: 'Public URL' };

/// Live checks of what this server is actually wired to, so "why did
/// checkout fail" can be answered here instead of in the server logs.
function SystemStatus() {
  const [h, setH] = useState<any>(null);
  const [err, setErr] = useState('');
  useEffect(() => { api<any>('/api/admin/health').then((r) => (r.ok ? setH(r.data) : setErr(r.data.error || 'Failed'))); }, []);
  const tone = (s: string) => (s === 'ok' ? 'ok' : s === 'warn' ? 'warn' : 'bad');
  return (
    <div className="adm-panel">
      <h2>System status</h2>
      {err ? <div className="adm-msg bad">{err}</div> : null}
      {!h && !err ? <p style={{ color: '#6b6252' }}>Checking…</p> : null}
      {h ? (
        <>
          <dl className="adm-dl">
            {Object.entries(h.checks).map(([k, v]: [string, any]) => (
              <React.Fragment key={k}>
                <dt>{LABELS[k] || k}</dt>
                <dd><span className={`adm-badge ${tone(v.status)}`}>{v.status === 'ok' ? 'ok' : v.status === 'warn' ? 'note' : 'problem'}</span> <span style={{ fontWeight: 400 }}>{v.detail}</span></dd>
              </React.Fragment>
            ))}
          </dl>
          {h.failures.length ? (
            <>
              <h3 style={{ marginTop: 18 }}>Recent checkout failures</h3>
              <div className="adm-wrap">
                <table className="adm-table">
                  <thead><tr><th>When</th><th>Reference</th><th>Method</th><th>Status</th><th>Provider said</th></tr></thead>
                  <tbody>
                    {h.failures.map((f: any) => (
                      <tr key={f.id}><td>{fmtWhen(f.at)}</td><td><code>{f.reference}</code></td><td>{f.method}{f.mock ? ' (mock)' : ''}</td><td><Badge s={f.status} /></td><td style={{ fontSize: '.8rem', color: '#a3231b' }}>{f.error}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}
          <p style={{ fontSize: '.78rem', color: '#6b6252', marginTop: 10 }}>Node {h.node} · {h.env}</p>
        </>
      ) : null}
    </div>
  );
}
