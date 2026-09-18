'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions, assertRole } from '@/server/auth';
import { db } from '@/server/db';
import type { PricingRuleType } from '@prisma/client';

export async function createPricingRule(formData: FormData) {
  const session = await getServerSession(authOptions);
  assertRole(session?.user?.role, ['ADMIN']);

  const hotel = await db.hotel.findFirstOrThrow();
  const type = String(formData.get('type')) as PricingRuleType;
  const priceOverride = formData.get('priceOverride') ? Number(formData.get('priceOverride')) : null;
  const priceDeltaPct = formData.get('priceDeltaPct') ? Number(formData.get('priceDeltaPct')) : null;
  const startDate = formData.get('startDate') ? new Date(String(formData.get('startDate'))) : null;
  const endDate = formData.get('endDate') ? new Date(String(formData.get('endDate'))) : null;

  await db.pricingRule.create({
    data: {
      hotelId: hotel.id,
      roomTypeId: String(formData.get('roomTypeId') || '') || null,
      type,
      startDate: type === 'SEASONAL' || type === 'HOLIDAY' ? startDate : null,
      endDate: type === 'SEASONAL' || type === 'HOLIDAY' ? endDate : null,
      priceOverride,
      priceDeltaPct,
    },
  });

  revalidatePath('/admin/pricing');
}

export async function togglePricingRule(id: string, isActive: boolean) {
  const session = await getServerSession(authOptions);
  assertRole(session?.user?.role, ['ADMIN']);

  await db.pricingRule.update({ where: { id }, data: { isActive } });
  revalidatePath('/admin/pricing');
}

export async function deletePricingRule(id: string) {
  const session = await getServerSession(authOptions);
  assertRole(session?.user?.role, ['ADMIN']);

  await db.pricingRule.delete({ where: { id } });
  revalidatePath('/admin/pricing');
}
