'use client';

import { useTransition } from 'react';
import { toggleCoupon, deleteCoupon } from '@/app/admin/coupons/actions';

export function CouponRowControls({ id, isActive }: { id: string; isActive: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <button
        disabled={pending}
        onClick={() => startTransition(() => toggleCoupon(id, !isActive))}
        className={`rounded-full px-3 py-1 text-xs font-semibold ${
          isActive ? 'bg-sea-500/10 text-sea-600' : 'bg-ink-900/10 text-ink-900/50'
        }`}
      >
        {isActive ? 'Active' : 'Inactive'}
      </button>
      <button
        disabled={pending}
        onClick={() => {
          if (confirm('Delete this coupon?')) startTransition(() => deleteCoupon(id));
        }}
        className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-600"
      >
        Delete
      </button>
    </div>
  );
}
