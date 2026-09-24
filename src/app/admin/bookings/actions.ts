'use server';

import { revalidatePath } from 'next/cache';
import { requireRole, AuthError } from '@/server/auth';
import { db } from '@/server/db';
import { field } from '@/lib/form';
import { createBooking, BookingError } from '@/server/services/booking.service';
import { cancelBooking } from '@/server/services/cancellation.service';
import type { BookingSource, BookingStatus } from '@prisma/client';

function refresh() {
  revalidatePath('/admin');
  revalidatePath('/admin/bookings');
  revalidatePath('/admin/calendar');
}

// Phone / walk-in bookings go through the same createBooking() as the website,
// so they use the same availability check. Non-website bookings are auto-confirmed.
export async function createOfflineBooking(
  form: FormData,
): Promise<{ success: boolean; error?: string; bookingCode?: string }> {
  try {
    await requireRole(['ADMIN', 'STAFF']);

    const checkIn = new Date(field(form, 'checkIn'));
    const checkOut = new Date(field(form, 'checkOut'));
    if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime()) || checkOut <= checkIn) {
      return { success: false, error: 'Please provide a valid check-in and check-out date.' };
    }

    const booking = await createBooking({
      roomTypeId: field(form, 'roomTypeId'),
      checkIn,
      checkOut,
      roomsBooked: Math.max(1, Number(field(form, 'roomsBooked')) || 1),
      guestsCount: Math.max(1, Number(field(form, 'guestsCount')) || 1),
      guestName: field(form, 'guestName'),
      guestEmail: field(form, 'guestEmail') || 'frontdesk@solacebayresort.com',
      guestPhone: field(form, 'guestPhone'),
      specialRequests: field(form, 'specialRequests') || undefined,
      source: (field(form, 'source') || 'OFFLINE') as BookingSource,
    });

    const paid = form.get('markPaid') === 'on';
    await db.payment.create({
      data: {
        bookingId: booking.id,
        provider: 'offline',
        amount: booking.totalAmount,
        status: paid ? 'PAID' : 'PENDING',
        paidAt: paid ? new Date() : null,
      },
    });

    refresh();
    return { success: true, bookingCode: booking.bookingCode };
  } catch (err) {
    if (err instanceof BookingError || err instanceof AuthError) {
      return { success: false, error: err.message };
    }
    console.error(err);
    return { success: false, error: 'Something went wrong creating this booking.' };
  }
}

export async function updateBookingStatus(bookingId: string, status: BookingStatus) {
  await requireRole(['ADMIN', 'STAFF']);

  if (status === 'CANCELLED') {
    await cancelBooking(bookingId, 'Cancelled by staff from the admin panel');
  } else {
    await db.booking.update({ where: { id: bookingId }, data: { status } });
    await db.notification.create({
      data: { bookingId, audience: 'CUSTOMER', type: `booking_${status.toLowerCase()}` },
    });
  }
  refresh();
}

// For cash / card payments taken at the front desk (no Razorpay involved).
export async function markBookingPaidManually(bookingId: string) {
  await requireRole(['ADMIN', 'STAFF']);
  const booking = await db.booking.findUniqueOrThrow({ where: { id: bookingId } });
  const paidAt = new Date();

  await db.$transaction([
    db.payment.upsert({
      where: { bookingId },
      create: { bookingId, provider: 'offline', amount: booking.totalAmount, status: 'PAID', paidAt },
      update: { status: 'PAID', paidAt },
    }),
    db.booking.update({
      where: { id: bookingId },
      data: { status: booking.status === 'PENDING' ? 'CONFIRMED' : booking.status },
    }),
  ]);
  refresh();
}
