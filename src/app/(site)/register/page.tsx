'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TextField } from '@/components/site/text-field';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const set = (key: keyof typeof form) => (value: string) => setForm({ ...form, [key]: value });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const json = await res.json();
      setError(json.error ?? 'Could not create account');
      setLoading(false);
      return;
    }

    await signIn('credentials', { email: form.email, password: form.password, redirect: false });
    router.push('/account/bookings');
  }

  return (
    <div className="container-site flex min-h-[70vh] max-w-md flex-col justify-center py-16">
      <h1 className="text-center font-serif text-3xl text-ink-900">Create an Account</h1>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <TextField label="Full Name" required value={form.name} onChange={set('name')} />
        <TextField label="Email" type="email" required value={form.email} onChange={set('email')} />
        <TextField label="Phone" value={form.phone} onChange={set('phone')} />
        <TextField label="Password" type="password" required minLength={8} value={form.password} onChange={set('password')} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className="btn-gold w-full disabled:opacity-50">
          {loading ? 'Creating account…' : 'Create Account'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-900/60">
        Already have an account? <Link href="/login" className="font-semibold text-gold-600 hover:underline">Sign In</Link>
      </p>
    </div>
  );
}
