import prisma from './db';

/// How many of the Founding 500 are spoken for: paid or redeemed, plus
/// purchases still inside the checkout window so two people cannot both buy
/// the last one.
export async function foundingClaimed(): Promise<number> {
  const holdWindow = new Date(Date.now() - 30 * 60 * 1000);
  return prisma.voucher.count({
    where: {
      OR: [
        { status: { in: ['PAID', 'REDEEMED'] } },
        { status: 'PENDING_PAYMENT', createdAt: { gte: holdWindow } },
      ],
    },
  });
}
