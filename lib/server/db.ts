import { PrismaClient, Prisma } from '@prisma/client';

// Next.js dev mode re-evaluates modules on edit, which would otherwise open a
// new connection pool every time. Cache the client on globalThis in dev.
const globalForPrisma = globalThis as unknown as { __eldavaPrisma?: ReturnType<typeof buildClient> };

/// The database is a remote pooled Postgres (Supabase). The pooler drops
/// connections that sit idle, and Prisma only notices when the next query
/// fails with a connection error ("connection forcibly closed", "server has
/// closed the connection", P1001/P1017/P2024). One retry on a fresh
/// connection turns those into a slow request instead of a 500 for whoever
/// happened to make the first request after a quiet spell.
const CONNECTION_ERROR_CODES = new Set(['P1001', 'P1002', 'P1008', 'P1017', 'P2024']);

function isConnectionError(e: unknown): boolean {
  if (e instanceof Prisma.PrismaClientKnownRequestError) return CONNECTION_ERROR_CODES.has(e.code);
  if (e instanceof Prisma.PrismaClientInitializationError) return true;
  const msg = String((e as any)?.message || '');
  return /connection|ECONNRESET|forcibly closed|closed the connection|socket hang up/i.test(msg);
}

function buildClient() {
  const base = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
  return base.$extends({
    query: {
      async $allOperations({ operation, model, args, query }) {
        try {
          return await query(args);
        } catch (e) {
          if (!isConnectionError(e)) throw e;
          console.warn(`[db] ${model ?? ''}.${operation} hit a connection error, retrying once:`, (e as Error).message?.split('\n')[0]);
          await new Promise((r) => setTimeout(r, 250));
          return query(args);
        }
      },
    },
  });
}

export const prisma = globalForPrisma.__eldavaPrisma ?? buildClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__eldavaPrisma = prisma;
}

export default prisma;
