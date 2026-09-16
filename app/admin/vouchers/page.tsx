'use client';

import { useList, Badge, Pager, Head, Msg, fmtDate } from '../ui';

export default function Vouchers() {
  const list = useList<any>('/api/admin/vouchers');
  const x = list.extra;
  return (
    <>
      <Head title="Founding 500" sub="Prepaid vouchers, redeemable after launch." />
      <div className="adm-cards">
        <div className="adm-card"><div className="k">Sold</div><div className="v">{x.claimed ?? '—'}</div><div className="s">of {x.cap ?? 500}</div></div>
        <div className="adm-card"><div className="k">Remaining</div><div className="v">{x.remaining ?? '—'}</div><div className="s">shown live on the site</div></div>
      </div>
      <Msg text={list.error} kind="bad" />
      <div className="adm-wrap">
        <table className="adm-table">
          <thead><tr><th>Code</th><th>Voucher</th><th>Patient</th><th>Bought</th><th>Status</th><th>Paid via</th><th className="num">Amount</th></tr></thead>
          <tbody>
            {list.rows.map((v) => (
              <tr key={v.id} className="row" onClick={() => (location.href = `/admin/patients/${v.patientId}/`)}>
                <td><code>{v.code}</code></td><td>{v.service}</td><td>{v.patient}<span className="sub">{v.email}</span></td><td>{fmtDate(v.createdAt)}</td><td><Badge s={v.status} /></td><td>{v.paymentMethod || '—'}</td><td className="num">{v.priceLabel}</td>
              </tr>
            ))}
            {!list.loading && !list.rows.length ? <tr><td colSpan={7} className="adm-empty">No vouchers sold yet.</td></tr> : null}
          </tbody>
        </table>
      </div>
      <Pager page={list.page} size={list.size} total={list.total} onPage={list.setPage} />
    </>
  );
}
