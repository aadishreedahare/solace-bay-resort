import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createPaymentOrder } from '@/server/services/payment.service';

const schema = z.object({ bookingId: z.string().cuid() });

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'bookingId is required' }, { status: 400 });

  try {
    const order = await createPaymentOrder(parsed.data.bookingId);
    return NextResponse.json({ order, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    console.error('Failed to create Razorpay order', err);
    return NextResponse.json({ error: 'Could not initiate payment' }, { status: 500 });
  }
}
