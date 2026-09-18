import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyPaymentSignature, markPaymentPaid } from '@/server/services/payment.service';

const schema = z.object({
  bookingId: z.string().cuid(),
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payment payload' }, { status: 400 });

  const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;

  const isValid = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
  if (!isValid) {
    return NextResponse.json({ error: 'Payment signature verification failed' }, { status: 400 });
  }

  await markPaymentPaid(bookingId, razorpay_payment_id, razorpay_signature);
  return NextResponse.json({ success: true });
}
