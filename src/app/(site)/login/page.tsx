'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await signIn('credentials', { ...form, redirect: false });
    setLoading(false);

    if (res?.error) {
      setError('Incorrect email or password');
      return;
    }
    router.push('/account/bookings');
  }

  return (
    <div className="container-site flex min-h-[70vh] max-w-md flex-col justify-center py-16">
      <h1 className="text-center font-serif text-3xl text-ink-900">Sign In</h1>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-900/60">Email</span>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-md border border-ink-900/15 px-3 py-2.5 text-sm outline-none focus:border-gold-500"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-900/60">Password</span>
          <input
            required
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full rounded-md border border-ink-900/15 px-3 py-2.5 text-sm outline-none focus:border-gold-500"
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className="btn-gold w-full disabled:opacity-50">
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-900/60">
        Don&rsquo;t have an account? <Link href="/register" className="font-semibold text-gold-600 hover:underline">Register</Link>
      </p>
    </div>
  );
}
