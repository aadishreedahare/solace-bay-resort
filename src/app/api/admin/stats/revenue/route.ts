import { NextResponse } from 'next/server';
import { requireRole, AuthError } from '@/server/auth';
import { db } from '@/server/db';

const DAYS = 14;

export async function GET() {
  try {
    await requireRole(['ADMIN', 'STAFF']);
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }

  const since = new Date();
  since.setDate(since.getDate() - (DAYS - 1));
  since.setHours(0, 0, 0, 0);

  const payments = await db.payment.findMany({
    where: { status: 'PAID', paidAt: { gte: since } },
    select: { amount: true, paidAt: true },
  });

  const toKey = (d: Date) => d.toISOString().split('T')[0];
  const byDay = new Map<string, number>();
  for (let i = 0; i < DAYS; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    byDay.set(toKey(d), 0);
  }
  for (const p of payments) {
    if (!p.paidAt) continue;
    const key = toKey(p.paidAt);
    byDay.set(key, (byDay.get(key) ?? 0) + Number(p.amount));
  }

  return NextResponse.json({ data: [...byDay].map(([date, revenue]) => ({ date, revenue })) });
}
