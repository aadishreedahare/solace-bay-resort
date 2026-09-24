'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

// Shows the photo at `src`; if it's missing or fails to load, shows a gradient instead.
const GRADIENTS = [
  'from-[#c9a96b] via-[#8f6a3f] to-[#4a3a24]',
  'from-[#6f8a86] via-[#3f5754] to-[#1f2e2c]',
  'from-[#b98a6f] via-[#7a5040] to-[#3a2620]',
  'from-[#9caf9a] via-[#5c7059] to-[#2a3a28]',
  'from-[#d4b483] via-[#a3762f] to-[#5c3c1a]',
  'from-[#7f9aa3] via-[#456068] to-[#1f2f33]',
];

export function PlaceholderImage({
  seed = 0,
  src,
  label,
  className,
}: {
  seed?: number;
  src?: string;
  label?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const gradient = GRADIENTS[seed % GRADIENTS.length];

  if (src && !failed) {
    return (
      <div className={cn('relative overflow-hidden', className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={label ?? ''}
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
        {label && (
          <span className="absolute bottom-4 left-4 z-10 rounded-full bg-black/25 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-white/90 backdrop-blur-sm">
            {label}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative flex items-end overflow-hidden bg-gradient-to-br',
        gradient,
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_50%)]" />
      {label && (
        <span className="relative z-10 m-4 rounded-full bg-black/25 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-white/90 backdrop-blur-sm">
          {label}
        </span>
      )}
    </div>
  );
}