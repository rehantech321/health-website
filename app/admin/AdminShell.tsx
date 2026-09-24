'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { api } from './ui';

type Admin = { id: string; name: string; email: string };

/// Wraps every /admin page. Checks the admin session once; while signed out it
/// renders the login form in place of the page, so there is no separate login
/// route to protect and no way to reach a page without a session.
export function AdminShell({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null | undefined>(undefined);
  const [attention, setAttention] = useState<{ pendingApplications: number; newEnquiries: number; videoMissingLink: number }>({ pendingApplications: 0, newEnquiries: 0, videoMissingLink: 0 });
  const path = usePathname() || '/admin/';

  useEffect(() => {
    api<{ admin: Admin | null }>('/api/admin/me').then((r) => setAdmin(r.ok ? r.data.admin : null));
  }, []);

  useEffect(() => {
    if (!admin) return;
    api<any>('/api/admin/stats').then((r) => { if (r.ok) setAttention(r.data.counts); });
  }, [admin, path]);

  if (admin === undefined) return <div className="adm-login"><div style={{ color: '#bcab8f' }}>Loading…</div></div>;
  if (!admin) return <Login onDone={setAdmin} />;

  const nav = [
    { href: '/admin/', label: 'Dashboard' },
    { sec: 'People' },
    { href: '/admin/applications/', label: 'Doctor applications', pill: attention.pendingApplications },
    { href: '/admin/clinicians/', label: 'Clinicians' },
    { href: '/admin/patients/', label: 'Patients' },
    { sec: 'Operations' },
    { href: '/admin/appointments/', label: 'Appointments', pill: attention.videoMissingLink },
    { href: '/admin/enquiries/', label: 'Enquiries', pill: attention.newEnquiries },
    { href: '/admin/vouchers/', label: 'Founding 500' },
    { sec: 'System' },
    { href: '/admin/audit/', label: 'Audit log' },
  ];
  const isOn = (href: string) => (href === '/admin/' ? path === '/admin' || path === '/admin/' : path.startsWith(href.replace(/\/$/, '')));

  return (
    <div className="adm">
      <aside className="adm-side">
        <div className="adm-brand"><span>Eldava Health<small>Admin panel</small></span></div>
        <nav className="adm-nav">
          {nav.map((n, i) =>
            'sec' in n ? <div key={i} className="sec">{n.sec}</div> : (
              <Link key={n.href} href={n.href} className={isOn(n.href!) ? 'on' : ''}>
                <span>{n.label}</span>{n.pill ? <span className="adm-pill">{n.pill}</span> : null}
              </Link>
            )
          )}
        </nav>
        <div className="who">
          <b>{admin.name}</b>{admin.email}
          <button onClick={async () => { await api('/api/admin/logout', { method: 'POST' }); setAdmin(null); }}>Sign out</button>
        </div>
      </aside>
      <main className="adm-main">{children}</main>
    </div>
  );
}

function Login({ onDone }: { onDone: (a: Admin) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setError('');
    const r = await api<{ admin: Admin }>('/api/admin/login', { json: { email, password } });
    setBusy(false);
    if (!r.ok) {
      // A 5xx is the server's problem, not a wrong password - say which, so
      // nobody spends an afternoon retyping a password that was always right.
      setError(
        r.data.error ||
          (r.status >= 500
            ? `The server could not complete sign-in (HTTP ${r.status}). This is usually the database connection, not your password - check DATABASE_URL on the server and the app logs.`
            : r.status === 0
            ? 'Could not reach the server. Check your connection.'
            : 'Sign-in failed. Check the email and password.')
      );
      return;
    }
    onDone(r.data.admin);
  }

  return (
    <div className="adm-login">
      <form onSubmit={submit}>
        <div className="adm-brand" style={{ color: '#201a10', padding: 0, border: 'none', marginBottom: 6 }}><span>Eldava Health<small>Admin panel</small></span></div>
        <p style={{ color: '#6b6252', margin: '0 0 6px', fontSize: '.88rem' }}>Practice administration. Sign in with your admin account.</p>
        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required />
        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
        {error ? <div className="adm-msg bad">{error}</div> : null}
        <button className="adm-btn primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </div>
  );
}
