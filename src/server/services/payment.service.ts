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

  const razorpay = getClient();
  const order = await razorpay.orders.create({
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

/** Verifies the HMAC signature Razorpay returns after checkout — never trust the client-reported status alone. */
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
