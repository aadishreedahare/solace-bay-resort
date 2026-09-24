'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from '@/server/auth';
import { db } from '@/server/db';
import { field, optionalField } from '@/lib/form';

export async function updateHotelSettings(form: FormData) {
  await requireRole(['ADMIN']);
  const hotel = await db.hotel.findFirstOrThrow();

  await db.hotel.update({
    where: { id: hotel.id },
    data: {
      name: field(form, 'name'),
      tagline: field(form, 'tagline'),
      description: field(form, 'description'),
      address: field(form, 'address'),
      city: field(form, 'city'),
      state: field(form, 'state'),
      country: field(form, 'country'),
      postalCode: field(form, 'postalCode'),
      phone: field(form, 'phone'),
      email: field(form, 'email'),
      mapEmbedUrl: optionalField(form, 'mapEmbedUrl'),
      checkInTime: field(form, 'checkInTime'),
      checkOutTime: field(form, 'checkOutTime'),
      facebookUrl: optionalField(form, 'facebookUrl'),
      instagramUrl: optionalField(form, 'instagramUrl'),
      twitterUrl: optionalField(form, 'twitterUrl'),
      cancellationHoursThreshold: Number(field(form, 'cancellationHoursThreshold')),
      cancellationFullRefundPct: Number(field(form, 'cancellationFullRefundPct')),
      cancellationLateRefundPct: Number(field(form, 'cancellationLateRefundPct')),
      taxPercent: Number(field(form, 'taxPercent')),
    },
  });

  revalidatePath('/', 'layout');
  revalidatePath('/admin/settings');
}
