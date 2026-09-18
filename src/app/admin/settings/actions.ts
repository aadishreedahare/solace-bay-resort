'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions, assertRole } from '@/server/auth';
import { db } from '@/server/db';

export async function updateHotelSettings(formData: FormData) {
  const session = await getServerSession(authOptions);
  assertRole(session?.user?.role, ['ADMIN']);

  const hotel = await db.hotel.findFirstOrThrow();

  await db.hotel.update({
    where: { id: hotel.id },
    data: {
      name: String(formData.get('name')),
      tagline: String(formData.get('tagline')),
      description: String(formData.get('description')),
      address: String(formData.get('address')),
      city: String(formData.get('city')),
      state: String(formData.get('state')),
      country: String(formData.get('country')),
      postalCode: String(formData.get('postalCode')),
      phone: String(formData.get('phone')),
      email: String(formData.get('email')),
      mapEmbedUrl: String(formData.get('mapEmbedUrl') || '') || null,
      checkInTime: String(formData.get('checkInTime')),
      checkOutTime: String(formData.get('checkOutTime')),
      facebookUrl: String(formData.get('facebookUrl') || '') || null,
      instagramUrl: String(formData.get('instagramUrl') || '') || null,
      twitterUrl: String(formData.get('twitterUrl') || '') || null,
      cancellationHoursThreshold: Number(formData.get('cancellationHoursThreshold')),
      cancellationFullRefundPct: Number(formData.get('cancellationFullRefundPct')),
      cancellationLateRefundPct: Number(formData.get('cancellationLateRefundPct')),
      taxPercent: Number(formData.get('taxPercent')),
    },
  });

  // The hotel record backs nearly every public page (home, contact, footer, policies).
  revalidatePath('/', 'layout');
  revalidatePath('/admin/settings');
}
