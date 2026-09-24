import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/server/auth';
import { db } from '@/server/db';

const reviewSchema = z.object({
  bookingId: z.string().cuid(),
  rating: z.number().int().min(1).max(5),
  text: z.string().min(5).max(2000),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const roomTypeId = searchParams.get('roomType');

  const reviews = await db.review.findMany({
    where: { isApproved: true, isHidden: false, ...(roomTypeId ? { roomTypeId } : {}) },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return NextResponse.json({ reviews });
}

// Only the guest who made the booking can review it, and only after the stay is completed.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  const booking = await db.booking.findUnique({ where: { id: parsed.data.bookingId } });
  if (!booking || booking.userId !== session.user.id) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }
  if (booking.status !== 'COMPLETED') {
    return NextResponse.json({ error: 'You can review a stay only after it is completed' }, { status: 400 });
  }

  const review = await db.review.create({
    data: {
      userId: session.user.id,
      bookingId: booking.id,
      roomTypeId: booking.roomTypeId,
      rating: parsed.data.rating,
      text: parsed.data.text,
      isApproved: false,
    },
  });

  return NextResponse.json({ review }, { status: 201 });
}
