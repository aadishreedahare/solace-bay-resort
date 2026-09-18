'use client';

import { useState } from 'react';

export function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setStatus(res.ok ? 'done' : 'error');
    if (res.ok) setForm({ name: '', email: '', phone: '', subject: '', message: '' });
  }

  if (status === 'done') {
    return (
      <div className="rounded-xl border border-sea-500/20 bg-sea-500/5 p-8 text-center">
        <p className="font-serif text-lg text-ink-900">Thank you — we&rsquo;ll be in touch shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <input required placeholder="Your Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-md border border-ink-900/15 px-3 py-2.5 text-sm outline-none focus:border-gold-500" />
        <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-md border border-ink-900/15 px-3 py-2.5 text-sm outline-none focus:border-gold-500" />
      </div>
      <input placeholder="Phone (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-md border border-ink-900/15 px-3 py-2.5 text-sm outline-none focus:border-gold-500" />
      <input required placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full rounded-md border border-ink-900/15 px-3 py-2.5 text-sm outline-none focus:border-gold-500" />
      <textarea required rows={5} placeholder="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full rounded-md border border-ink-900/15 px-3 py-2.5 text-sm outline-none focus:border-gold-500" />
      {status === 'error' && <p className="text-sm text-red-600">Something went wrong — please try again.</p>}
      <button type="submit" disabled={status === 'submitting'} className="btn-gold w-full sm:w-auto disabled:opacity-50">
        {status === 'submitting' ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  );
}
