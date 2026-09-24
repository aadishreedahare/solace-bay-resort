import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth';
import { bookingRequestSchema } from '@/lib/validation';
import { createBooking, BookingError } from '@/server/services/booking.service';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = bookingRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', issues: parsed.error.flatten() }, { status: 400 });
  }

  const session = await getServerSession(authOptions);

  try {
    const booking = await createBooking({ ...parsed.data, userId: session?.user?.id, source: 'WEBSITE' });
    return NextResponse.json({ booking }, { status: 201 });
  } catch (err) {
    if (err instanceof BookingError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('Booking creation failed', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
