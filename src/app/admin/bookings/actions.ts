'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions, assertRole } from '@/server/auth';
import { db } from '@/server/db';
import { createBooking, BookingError } from '@/server/services/booking.service';
import { cancelBooking } from '@/server/services/cancellation.service';
import type { BookingSource, BookingStatus } from '@prisma/client';

/**
 * Creates a booking taken over the phone, at the front desk, or walk-in.
 * Reuses the exact same createBooking() path the website uses — including
 * the Serializable-transaction availability re-check — so an offline
 * booking blocks the same inventory a website customer would see, the
 * instant it is created. Non-WEBSITE sources are auto-CONFIRMED (see
 * booking.service.ts) since staff are creating them on the spot.
 */
export async function createOfflineBooking(
  formData: FormData,
): Promise<{ success: boolean; error?: string; bookingCode?: string }> {
  const session = await getServerSession(authOptions);
  try {
    assertRole(session?.user?.role, ['ADMIN', 'STAFF']);
  } catch (err) {
    const e = err as Error;
    return { success: false, error: e.message };
  }

  const checkIn = new Date(String(formData.get('checkIn')));
  const checkOut = new Date(String(formData.get('checkOut')));
  const source = String(formData.get('source') || 'OFFLINE') as BookingSource;
  const markPaid = String(formData.get('markPaid')) === 'on';

  if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime()) || checkOut <= checkIn) {
    return { success: false, error: 'Please provide a valid check-in and check-out date.' };
  }

  try {
    const booking = await createBooking({
      roomTypeId: String(formData.get('roomTypeId')),
      checkIn,
      checkOut,
      roomsBooked: Math.max(1, Number(formData.get('roomsBooked') || 1)),
      guestsCount: Math.max(1, Number(formData.get('guestsCount') || 1)),
      guestName: String(formData.get('guestName')),
      guestEmail: String(formData.get('guestEmail') || '') || 'frontdesk@solacebayresort.com',
      guestPhone: String(formData.get('guestPhone')),
      specialRequests: String(formData.get('specialRequests') || '') || undefined,
      source,
    });

    await db.payment.create({
      data: {
        bookingId: booking.id,
        provider: 'offline',
        amount: booking.totalAmount,
        status: markPaid ? 'PAID' : 'PENDING',
        paidAt: markPaid ? new Date() : null,
      },
    });

    revalidatePath('/admin/bookings');
    revalidatePath('/admin/calendar');
    revalidatePath('/admin');
    return { success: true, bookingCode: booking.bookingCode };
  } catch (err) {
    if (err instanceof BookingError) return { success: false, error: err.message };
    console.error(err);
    return { success: false, error: 'Something went wrong creating this booking.' };
  }
}

export async function updateBookingStatus(bookingId: string, status: BookingStatus) {
  const session = await getServerSession(authOptions);
  assertRole(session?.user?.role, ['ADMIN', 'STAFF']);

  if (status === 'CANCELLED') {
    await cancelBooking(bookingId, 'Cancelled by staff from the admin panel');
  } else {
    await db.booking.update({ where: { id: bookingId }, data: { status } });
    await db.notification.create({
      data: { bookingId, audience: 'CUSTOMER', type: `booking_${status.toLowerCase()}` },
    });
  }

  revalidatePath('/admin/bookings');
  revalidatePath('/admin/calendar');
  revalidatePath('/admin');
}

/** Manual settlement for cash/card-at-desk payments — bypasses Razorpay signature verification, which only applies to online payments. */
export async function markBookingPaidManually(bookingId: string) {
  const session = await getServerSession(authOptions);
  assertRole(session?.user?.role, ['ADMIN', 'STAFF']);

  const booking = await db.booking.findUniqueOrThrow({ where: { id: bookingId } });

  await db.$transaction([
    db.payment.upsert({
      where: { bookingId },
      create: {
        bookingId,
        provider: 'offline',
        amount: booking.totalAmount,
        status: 'PAID',
        paidAt: new Date(),
      },
      update: { status: 'PAID', paidAt: new Date() },
    }),
    db.booking.update({
      where: { id: bookingId },
      data: { status: booking.status === 'PENDING' ? 'CONFIRMED' : booking.status },
    }),
  ]);

  revalidatePath('/admin/bookings');
  revalidatePath('/admin');
}
