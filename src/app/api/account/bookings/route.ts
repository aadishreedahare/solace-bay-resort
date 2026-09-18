import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth';
import { db } from '@/server/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const bookings = await db.booking.findMany({
    where: { userId: session.user.id },
    include: {
      roomType: { include: { images: { take: 1, orderBy: { order: 'asc' } } } },
      payment: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const now = new Date();
  return NextResponse.json({
    upcoming: bookings.filter((b) => b.checkOut >= now && b.status !== 'CANCELLED'),
    past: bookings.filter((b) => b.checkOut < now || b.status === 'CANCELLED'),
  });
}
