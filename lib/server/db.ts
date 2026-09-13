import { PrismaClient } from '@prisma/client';

// Next.js dev mode re-evaluates modules on edit, which would otherwise open a
// new connection pool every time. Cache the client on globalThis in dev.
const globalForPrisma = globalThis as unknown as { __eldavaPrisma?: PrismaClient };

export const prisma =
  globalForPrisma.__eldavaPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__eldavaPrisma = prisma;
}

export default prisma;
