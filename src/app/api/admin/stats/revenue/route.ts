import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth';
import { assertRole } from '@/server/auth';
import { db } from '@/server/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  try {
    assertRole(session?.user?.role, ['ADMIN', 'STAFF']);
  } catch (err) {
    const e = err as Error & { status?: number };
    return NextResponse.json({ error: e.message }, { status: e.status ?? 401 });
  }

  const since = new Date();
  since.setDate(since.getDate() - 13);
  since.setHours(0, 0, 0, 0);

  const payments = await db.payment.findMany({
    where: { status: 'PAID', paidAt: { gte: since } },
    select: { amount: true, paidAt: true },
  });

  const byDay = new Map<string, number>();
  for (let i = 0; i < 14; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    byDay.set(d.toISOString().split('T')[0], 0);
  }
  for (const p of payments) {
    if (!p.paidAt) continue;
    const key = p.paidAt.toISOString().split('T')[0];
    byDay.set(key, (byDay.get(key) ?? 0) + Number(p.amount));
  }

  const data = Array.from(byDay.entries()).map(([date, revenue]) => ({ date, revenue }));
  return NextResponse.json({ data });
}
