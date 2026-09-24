'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from '@/server/auth';
import { db } from '@/server/db';
import { field, optionalNumber } from '@/lib/form';
import type { DiscountType } from '@prisma/client';

function refresh() {
  revalidatePath('/admin/coupons');
  revalidatePath('/offers');
}

export async function createCoupon(form: FormData) {
  await requireRole(['ADMIN']);
  const hotel = await db.hotel.findFirstOrThrow();

  await db.coupon.create({
    data: {
      hotelId: hotel.id,
      code: field(form, 'code').toUpperCase(),
      discountType: field(form, 'discountType') as DiscountType,
      discountValue: Number(field(form, 'discountValue')),
      minBookingAmount: optionalNumber(form, 'minBookingAmount'),
      startDate: new Date(field(form, 'startDate')),
      expiryDate: new Date(field(form, 'expiryDate')),
      usageLimit: optionalNumber(form, 'usageLimit'),
    },
  });
  refresh();
}

export async function toggleCoupon(id: string, isActive: boolean) {
  await requireRole(['ADMIN']);
  await db.coupon.update({ where: { id }, data: { isActive } });
  refresh();
}

export async function deleteCoupon(id: string) {
  await requireRole(['ADMIN']);
  await db.coupon.delete({ where: { id } });
  refresh();
}
