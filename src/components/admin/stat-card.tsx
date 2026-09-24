import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const ACCENT_COLORS = { warning: 'text-gold-500', danger: 'text-red-500' };

export function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  accent?: 'warning' | 'danger';
}) {
  return (
    <div className="rounded-xl border border-ink-900/8 bg-white p-6 shadow-card">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-ink-900/50">{label}</span>
        <Icon className={cn('h-4 w-4', accent ? ACCENT_COLORS[accent] : 'text-sea-500')} />
      </div>
      <p className="mt-3 font-serif text-2xl text-ink-900">{value}</p>
    </div>
  );
}
