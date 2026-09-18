'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'Cancelled by guest' }),
    });
    setLoading(false);
    if (!res.ok) {
      const json = await res.json();
      setError(json.error ?? 'Could not cancel booking');
      return;
    }
    router.refresh();
  }

  if (!confirming) {
    return (
      <button onClick={() => setConfirming(true)} className="btn-secondary !border-red-300 !text-red-600 hover:!bg-red-50">
        Cancel Booking
      </button>
    );
  }

  return (
    <div className="rounded-md border border-red-200 bg-red-50 p-4">
      <p className="text-sm text-red-700">Are you sure? This action cannot be undone.</p>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <div className="mt-3 flex gap-3">
        <button onClick={handleCancel} disabled={loading} className="rounded-md bg-red-600 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white disabled:opacity-50">
          {loading ? 'Cancelling…' : 'Yes, Cancel'}
        </button>
        <button onClick={() => setConfirming(false)} className="rounded-md border border-ink-900/15 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ink-900">
          Never Mind
        </button>
      </div>
    </div>
  );
}
