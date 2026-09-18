'use client';

import Script from 'next/script';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export function PaymentPanel({
  bookingId,
  amount,
  guestName,
  guestEmail,
  guestPhone,
}: {
  bookingId: string;
  amount: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay() {
    setLoading(true);
    setError(null);
    try {
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      });
      const orderJson = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderJson.error ?? 'Could not start payment');

      const rzp = new window.Razorpay({
        key: orderJson.keyId,
        amount: orderJson.order.amount,
        currency: orderJson.order.currency,
        name: 'Solace Bay Resort & Spa',
        description: 'Room booking payment',
        order_id: orderJson.order.id,
        prefill: { name: guestName, email: guestEmail, contact: guestPhone },
        theme: { color: '#b8862e' },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const verifyRes = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookingId, ...response }),
          });
          if (verifyRes.ok) {
            router.push(`/booking/confirmation/${bookingId}`);
          } else {
            setError('Payment verification failed. If the amount was deducted, contact us with your booking reference.');
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      });

      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  }

  return (
    <div className="mt-8">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      <button onClick={handlePay} disabled={loading} className="btn-gold w-full disabled:opacity-50">
        {loading ? 'Opening secure checkout…' : `Pay ₹${amount.toLocaleString('en-IN')} Securely`}
      </button>
      <p className="mt-3 text-center text-xs text-ink-900/50">
        Payments are processed securely by Razorpay. Your card details never touch our servers.
      </p>
    </div>
  );
}
