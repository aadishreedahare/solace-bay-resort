'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions, assertRole } from '@/server/auth';
import { db } from '@/server/db';
import type { DiscountType } from '@prisma/client';

export async function createCoupon(formData: FormData) {
  const session = await getServerSession(authOptions);
  assertRole(session?.user?.role, ['ADMIN']);

  const hotel = await db.hotel.findFirstOrThrow();

  await db.coupon.create({
    data: {
      hotelId: hotel.id,
      code: String(formData.get('code')).toUpperCase().trim(),
      discountType: String(formData.get('discountType')) as DiscountType,
      discountValue: Number(formData.get('discountValue')),
      minBookingAmount: formData.get('minBookingAmount') ? Number(formData.get('minBookingAmount')) : null,
      startDate: new Date(String(formData.get('startDate'))),
      expiryDate: new Date(String(formData.get('expiryDate'))),
      usageLimit: formData.get('usageLimit') ? Number(formData.get('usageLimit')) : null,
    },
  });

  revalidatePath('/admin/coupons');
  revalidatePath('/offers');
}

export async function toggleCoupon(id: string, isActive: boolean) {
  const session = await getServerSession(authOptions);
  assertRole(session?.user?.role, ['ADMIN']);

  await db.coupon.update({ where: { id }, data: { isActive } });
  revalidatePath('/admin/coupons');
  revalidatePath('/offers');
}

export async function deleteCoupon(id: string) {
  const session = await getServerSession(authOptions);
  assertRole(session?.user?.role, ['ADMIN']);

  await db.coupon.delete({ where: { id } });
  revalidatePath('/admin/coupons');
  revalidatePath('/offers');
}
