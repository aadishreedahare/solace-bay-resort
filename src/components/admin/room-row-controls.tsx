'use client';

import { useState, useTransition } from 'react';
import { setRoomTypeStatus, updateRoomTypePrice } from '@/app/admin/rooms/actions';

export function RoomRowControls({
  roomTypeId,
  isActive,
  basePrice,
}: {
  roomTypeId: string;
  isActive: boolean;
  basePrice: number;
}) {
  const [price, setPrice] = useState(basePrice);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-3">
      <input
        type="number"
        value={price}
        onChange={(e) => setPrice(Number(e.target.value))}
        onBlur={() => startTransition(() => updateRoomTypePrice(roomTypeId, price))}
        className="w-24 rounded-md border border-ink-900/15 px-2 py-1 text-sm"
      />
      <button
        disabled={pending}
        onClick={() => startTransition(() => setRoomTypeStatus(roomTypeId, !isActive))}
        className={`rounded-full px-3 py-1 text-xs font-semibold ${
          isActive ? 'bg-sea-500/10 text-sea-600' : 'bg-ink-900/10 text-ink-900/50'
        }`}
      >
        {isActive ? 'Active' : 'Inactive'}
      </button>
    </div>
  );
}
