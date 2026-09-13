'use client';

import { useEffect, useState } from 'react';

/// Stand-in for Stripe's hosted checkout, used only when no Stripe key is
/// configured. It mirrors the real shape - the browser leaves the site, a
/// decision is made elsewhere, it returns to the same success/cancel URLs - so
/// wiring that works here works against real Stripe too.
export default function MockCheckout() {
  const [paymentId, setPaymentId] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setPaymentId(new URLSearchParams(window.location.search).get('payment') || '');
  }, []);

  async function decide(outcome: 'succeed' | 'fail') {
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/payments/mock-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, outcome }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not complete the mock payment.');
        setBusy(false);
        return;
      }
      const status = outcome === 'fail' ? 'cancelled' : 'success';
      window.location.href = `/?checkout=${status}&ref=${encodeURIComponent(data.reference)}`;
    } catch {
      setError('Network error.');
      setBusy(false);
    }
  }

  return (
    <main style={s.page}>
      <div style={s.card}>
        <div style={s.badge}>Test mode &middot; no Stripe key configured</div>
        <h1 style={s.h1}>Simulated checkout</h1>
        <p style={s.p}>
          This page stands in for Stripe Checkout so the booking and payment flow can be tested without live keys.
          No card details are collected and no money moves.
        </p>
        <p style={s.p}>
          Add <code style={s.code}>STRIPE_SECRET_KEY</code> to <code style={s.code}>.env.local</code> and this page is
          bypassed for the real hosted page, where card and Klarna are actually handled.
        </p>
        {error ? <p style={s.error}>{error}</p> : null}
        <div style={s.row}>
          <button style={s.primary} onClick={() => decide('succeed')} disabled={busy || !paymentId}>
            {busy ? 'Working…' : 'Simulate successful payment'}
          </button>
          <button style={s.secondary} onClick={() => decide('fail')} disabled={busy || !paymentId}>
            Simulate a decline
          </button>
        </div>
        {!paymentId ? <p style={s.error}>No payment reference in the URL.</p> : null}
      </div>
    </main>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f1ea', fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif', padding: 24 },
  card: { maxWidth: 560, background: '#fff', borderRadius: 16, padding: '32px 34px', boxShadow: '0 12px 40px rgba(24,18,9,0.12)', border: '1px solid #e7e0d2' },
  badge: { display: 'inline-block', fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#8a6d1f', background: '#fdf4dc', border: '1px solid #f0e0b0', borderRadius: 999, padding: '5px 11px', marginBottom: 18 },
  h1: { fontSize: 26, margin: '0 0 12px', color: '#181209' },
  p: { color: '#5c5346', lineHeight: 1.6, margin: '0 0 14px', fontSize: 15 },
  code: { background: '#f4f1ea', padding: '2px 6px', borderRadius: 4, fontSize: 13 },
  error: { color: '#a3231b', fontWeight: 600, fontSize: 14, margin: '12px 0 0' },
  row: { display: 'flex', gap: 12, marginTop: 22, flexWrap: 'wrap' },
  primary: { background: '#14624f', color: '#fff', border: 'none', borderRadius: 10, padding: '13px 20px', fontWeight: 700, fontSize: 15, cursor: 'pointer' },
  secondary: { background: 'transparent', color: '#5c5346', border: '1px solid #d8cfbe', borderRadius: 10, padding: '13px 20px', fontWeight: 600, fontSize: 15, cursor: 'pointer' },
};
