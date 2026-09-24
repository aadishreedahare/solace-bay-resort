import Link from 'next/link';
import type { RoomType } from '@prisma/client';
import { Users, BedDouble, Maximize } from 'lucide-react';
import { PlaceholderImage } from './placeholder-image';
import { formatCurrency } from '@/lib/utils';

export interface RoomCardData {
  slug: string;
  name: string;
  description: string;
  basePrice: number;
  maxGuests: number;
  bedType: string;
  sizeSqft: number;
  imageSeed: number;
}

export function toRoomCard(rt: RoomType, imageSeed: number): RoomCardData {
  const { slug, name, description, maxGuests, bedType, sizeSqft } = rt;
  return { slug, name, description, maxGuests, bedType, sizeSqft, basePrice: Number(rt.basePrice), imageSeed };
}

export function RoomCard({ room }: { room: RoomCardData }) {
  return (
    <Link
      href={`/rooms/${room.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-ink-900/8 bg-white shadow-card transition hover:-translate-y-1"
    >
      <PlaceholderImage
        seed={room.imageSeed}
        src={`/images/rooms/${room.slug}.jpg`}
        label={room.name}
        className="h-56 w-full"
      />
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-serif text-xl text-ink-900">{room.name}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-900/60">{room.description}</p>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-ink-900/55">
          <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {room.maxGuests} Guests</span>
          <span className="flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" /> {room.bedType}</span>
          <span className="flex items-center gap-1"><Maximize className="h-3.5 w-3.5" /> {room.sizeSqft} sq.ft</span>
        </div>

        <div className="mt-5 flex items-end justify-between border-t border-ink-900/8 pt-4">
          <div>
            <span className="text-lg font-semibold text-ink-900">{formatCurrency(room.basePrice)}</span>
            <span className="text-xs text-ink-900/50"> / night</span>
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-gold-500 group-hover:underline">
            View Room →
          </span>
        </div>
      </div>
    </Link>
  );
}