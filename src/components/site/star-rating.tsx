import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StarRating({ rating, className }: { rating: number; className?: string }) {
  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            'h-3.5 w-3.5',
            i < Math.round(rating) ? 'fill-gold-500 text-gold-500' : 'fill-none text-ink-900/20',
          )}
        />
      ))}
    </div>
  );
}
