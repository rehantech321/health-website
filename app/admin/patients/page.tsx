'use client';

import { useList, Badge, Pager, Head, Msg, fmtDate, fmtWhen } from '../ui';

export default function Patients() {
  const list = useList<any>('/api/admin/patients');
  return (
    <>
      <Head title="Patients" sub="Every registered patient account." />
      <div className="adm-tools">
        <input type="search" placeholder="Search name, email, phone" defaultValue={list.params.q || ''} onKeyDown={(e) => e.key === 'Enter' && list.set({ q: (e.target as HTMLInputElement).value })} />
      </div>
      <Msg text={list.error} kind="bad" />
      <div className="adm-wrap">
        <table className="adm-table">
          <thead><tr><th>Patient</th><th>Contact</th><th>Country</th><th>DOB</th><th className="num">Bookings</th><th>Last appointment</th><th>Registered</th></tr></thead>
          <tbody>
            {list.rows.map((p) => (
              <tr key={p.id} className="row" onClick={() => (location.href = `/admin/patients/${p.id}/`)}>
                <td><b>{p.fullName}</b></td><td>{p.email}<span className="sub">{p.phone || '—'}</span></td><td>{p.country}</td><td>{p.dateOfBirth}</td>
                <td className="num">{p.appointments}{p.vouchers ? <span className="sub">+{p.vouchers} voucher</span> : null}</td>
                <td>{p.lastAppointment ? <>{fmtWhen(p.lastAppointment.startsAt)} <Badge s={p.lastAppointment.status} /></> : '—'}</td>
                <td>{fmtDate(p.createdAt)}</td>
              </tr>
            ))}
            {!list.loading && !list.rows.length ? <tr><td colSpan={7} className="adm-empty">No patients match.</td></tr> : null}
          </tbody>
        </table>
      </div>
      <Pager page={list.page} size={list.size} total={list.total} onPage={list.setPage} />
    </>
  );
}
