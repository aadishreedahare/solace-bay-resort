import Razorpay from 'razorpay';
import crypto from 'crypto';
import { db } from '@/server/db';

function getClient() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
}

export async function createPaymentOrder(bookingId: string) {
  const booking = await db.booking.findUniqueOrThrow({ where: { id: bookingId } });

  const order = await getClient().orders.create({
    amount: Math.round(Number(booking.totalAmount) * 100), // paise
    currency: 'INR',
    receipt: booking.bookingCode,
    notes: { bookingId: booking.id },
  });

  await db.payment.upsert({
    where: { bookingId },
    create: {
      bookingId,
      provider: 'razorpay',
      providerOrderId: order.id,
      amount: booking.totalAmount,
      status: 'PENDING',
    },
    update: { providerOrderId: order.id, status: 'PENDING' },
  });

  return order;
}

// Razorpay signs order_id|payment_id with our secret; a matching signature proves the payment is real.
export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string) {
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  return expected === signature;
}

export async function markPaymentPaid(bookingId: string, paymentId: string, signature: string) {
  await db.$transaction([
    db.payment.update({
      where: { bookingId },
      data: {
        providerPaymentId: paymentId,
        providerSignature: signature,
        status: 'PAID',
        paidAt: new Date(),
      },
    }),
    db.booking.update({ where: { id: bookingId }, data: { status: 'CONFIRMED' } }),
    db.notification.create({
      data: { bookingId, audience: 'CUSTOMER', type: 'booking_confirmed' },
    }),
    db.notification.create({
      data: { bookingId, audience: 'ADMIN', type: 'new_booking' },
    }),
  ]);
}
