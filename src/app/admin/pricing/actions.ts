'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from '@/server/auth';
import { db } from '@/server/db';
import { field, optionalField, optionalNumber, optionalDate } from '@/lib/form';
import type { PricingRuleType } from '@prisma/client';

export async function createPricingRule(form: FormData) {
  await requireRole(['ADMIN']);
  const hotel = await db.hotel.findFirstOrThrow();
  const type = field(form, 'type') as PricingRuleType;
  const hasDates = type === 'SEASONAL' || type === 'HOLIDAY';

  await db.pricingRule.create({
    data: {
      hotelId: hotel.id,
      roomTypeId: optionalField(form, 'roomTypeId'),
      type,
      startDate: hasDates ? optionalDate(form, 'startDate') : null,
      endDate: hasDates ? optionalDate(form, 'endDate') : null,
      priceOverride: optionalNumber(form, 'priceOverride'),
      priceDeltaPct: optionalNumber(form, 'priceDeltaPct'),
    },
  });
  revalidatePath('/admin/pricing');
}

export async function togglePricingRule(id: string, isActive: boolean) {
  await requireRole(['ADMIN']);
  await db.pricingRule.update({ where: { id }, data: { isActive } });
  revalidatePath('/admin/pricing');
}

export async function deletePricingRule(id: string) {
  await requireRole(['ADMIN']);
  await db.pricingRule.delete({ where: { id } });
  revalidatePath('/admin/pricing');
}
