'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions, assertRole } from '@/server/auth';
import { db } from '@/server/db';

export async function approveReview(id: string) {
  const session = await getServerSession(authOptions);
  assertRole(session?.user?.role, ['ADMIN', 'STAFF']);

  await db.review.update({ where: { id }, data: { isApproved: true, isHidden: false } });
  revalidatePath('/admin/reviews');
}

export async function hideReview(id: string) {
  const session = await getServerSession(authOptions);
  assertRole(session?.user?.role, ['ADMIN', 'STAFF']);

  await db.review.update({ where: { id }, data: { isHidden: true } });
  revalidatePath('/admin/reviews');
}

export async function deleteReview(id: string) {
  const session = await getServerSession(authOptions);
  assertRole(session?.user?.role, ['ADMIN']);

  await db.review.delete({ where: { id } });
  revalidatePath('/admin/reviews');
}
