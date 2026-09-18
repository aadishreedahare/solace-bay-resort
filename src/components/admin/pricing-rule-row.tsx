'use client';

import { useTransition } from 'react';
import { togglePricingRule, deletePricingRule } from '@/app/admin/pricing/actions';

export function PricingRuleRow({ id, isActive }: { id: string; isActive: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <button
        disabled={pending}
        onClick={() => startTransition(() => togglePricingRule(id, !isActive))}
        className={`rounded-full px-3 py-1 text-xs font-semibold ${
          isActive ? 'bg-sea-500/10 text-sea-600' : 'bg-ink-900/10 text-ink-900/50'
        }`}
      >
        {isActive ? 'Active' : 'Inactive'}
      </button>
      <button
        disabled={pending}
        onClick={() => {
          if (confirm('Delete this pricing rule?')) startTransition(() => deletePricingRule(id));
        }}
        className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-600"
      >
        Delete
      </button>
    </div>
  );
}
