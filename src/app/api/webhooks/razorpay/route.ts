import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/server/db';

// Fallback confirmation path in case the client-side verify call never
// completes (browser closed mid-checkout, network drop, etc.) — Razorpay
// calls this server-to-server, so it is the source of truth of last resort.
export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-razorpay-signature');

  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET ?? '')
    .update(rawBody)
    .digest('hex');

  if (!signature || signature !== expected) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const event = JSON.parse(rawBody);

  if (event.event === 'payment.captured') {
    const orderId = event.payload?.payment?.entity?.order_id;
    const paymentId = event.payload?.payment?.entity?.id;

    const payment = await db.payment.findFirst({ where: { providerOrderId: orderId } });
    if (payment && payment.status !== 'PAID') {
      await db.$transaction([
        db.payment.update({
          where: { id: payment.id },
          data: { status: 'PAID', providerPaymentId: paymentId, paidAt: new Date() },
        }),
        db.booking.update({ where: { id: payment.bookingId }, data: { status: 'CONFIRMED' } }),
      ]);
    }
  }

  return NextResponse.json({ received: true });
}
