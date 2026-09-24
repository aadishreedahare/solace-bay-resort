'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from '@/server/auth';
import { db } from '@/server/db';

export async function approveReview(id: string) {
  await requireRole(['ADMIN', 'STAFF']);
  await db.review.update({ where: { id }, data: { isApproved: true, isHidden: false } });
  revalidatePath('/admin/reviews');
}

export async function hideReview(id: string) {
  await requireRole(['ADMIN', 'STAFF']);
  await db.review.update({ where: { id }, data: { isHidden: true } });
  revalidatePath('/admin/reviews');
}

export async function deleteReview(id: string) {
  await requireRole(['ADMIN']);
  await db.review.delete({ where: { id } });
  revalidatePath('/admin/reviews');
}
