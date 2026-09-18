import { NextResponse } from 'next/server';
import { db } from '@/server/db';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const booking = await db.booking.findUnique({
    where: { id: params.id },
    include: { roomType: { include: { images: { take: 1, orderBy: { order: 'asc' } } } }, payment: true },
  });

  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  return NextResponse.json({ booking });
}
