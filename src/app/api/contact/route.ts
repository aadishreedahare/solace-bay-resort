import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth';
import { db } from '@/server/db';
import { contactFormSchema } from '@/lib/validation';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = contactFormSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  const session = await getServerSession(authOptions);

  const message = await db.contactMessage.create({
    data: { ...parsed.data, userId: session?.user?.id },
  });

  await db.notification.create({
    data: { audience: 'ADMIN', type: 'new_enquiry', payload: { contactMessageId: message.id } },
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
