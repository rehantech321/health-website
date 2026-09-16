'use client';

import { useList, Pager, Head, Msg, fmtWhen } from '../ui';

export default function Audit() {
  const list = useList<any>('/api/admin/audit', { size: '100' });
  return (
    <>
      <Head title="Audit log" sub="Every admin action, and every time an admin opened a record with clinical content in it. Append-only." />
      <Msg text={list.error} kind="bad" />
      <div className="adm-wrap">
        <table className="adm-table">
          <thead><tr><th>When</th><th>Admin</th><th>Action</th><th>Target</th><th>Detail</th></tr></thead>
          <tbody>
            {list.rows.map((r) => (
              <tr key={r.id}><td>{fmtWhen(r.createdAt)}</td><td>{r.admin}</td><td><code>{r.action}</code></td><td><code style={{ fontSize: '.72rem' }}>{r.target}</code></td><td style={{ fontSize: '.78rem', color: '#6b6252' }}>{Object.keys(r.meta || {}).length ? JSON.stringify(r.meta) : ''}</td></tr>
            ))}
            {!list.loading && !list.rows.length ? <tr><td colSpan={5} className="adm-empty">Nothing recorded yet.</td></tr> : null}
          </tbody>
        </table>
      </div>
      <Pager page={list.page} size={list.size} total={list.total} onPage={list.setPage} />
    </>
  );
}
