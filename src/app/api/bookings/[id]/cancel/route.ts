import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth';
import { db } from '@/server/db';
import { cancelBookingSchema } from '@/lib/validation';
import { cancelBooking } from '@/server/services/cancellation.service';
import { BookingError } from '@/server/services/booking.service';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const booking = await db.booking.findUnique({ where: { id: params.id } });
  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

  // A customer may only cancel their own booking; staff/admin may cancel any.
  const isOwner = booking.userId === session.user.id;
  const isStaff = session.user.role === 'ADMIN' || session.user.role === 'STAFF';
  if (!isOwner && !isStaff) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = cancelBookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  try {
    const result = await cancelBooking(params.id, parsed.data.reason);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof BookingError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('Cancellation failed', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
