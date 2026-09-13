import { NextResponse } from 'next/server';

/// Small helpers shared by every route handler.

export function json(data: unknown, status = 200, init?: ResponseInit) {
  return NextResponse.json(data, { status, ...init });
}

export function fail(message: string, status = 400, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

/// Parses a JSON body, returning {} rather than throwing on malformed input so
/// the handler can respond with a proper 400 instead of a 500.
export async function readJson(req: Request): Promise<Record<string, any>> {
  try {
    const body = await req.json();
    return body && typeof body === 'object' ? body : {};
  } catch {
    return {};
  }
}

export function str(value: unknown, max = 2000): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export function isEmail(value: unknown): boolean {
  return EMAIL_RE.test(String(value ?? '').trim());
}

/// Wraps a handler so an unexpected throw becomes a 500 with a log line,
/// rather than a hung request.
export function withErrors<T extends (...args: any[]) => Promise<Response>>(handler: T): T {
  return (async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      const req = args[0] as Request | undefined;
      console.error(`[api] ${req?.method ?? ''} ${req?.url ?? ''} failed:`, error);
      return fail('Something went wrong. Please try again.', 500);
    }
  }) as T;
}

/// Base URL for return links (Stripe, emails). Explicit env wins; otherwise
/// derived from the request so local dev works without configuration.
export function siteUrl(req: Request): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  const url = new URL(req.url);
  const proto = req.headers.get('x-forwarded-proto') || url.protocol.replace(':', '');
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || url.host;
  return `${proto}://${host}`;
}
