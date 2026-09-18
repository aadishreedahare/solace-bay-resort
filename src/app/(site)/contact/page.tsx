import type { Metadata } from 'next';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { ContactForm } from '@/components/site/contact-form';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Solace Bay Resort & Spa, Alibaug — reservations, directions, and general enquiries.',
};

export default function ContactPage() {
  return (
    <div className="container-site py-16">
      <h1 className="font-serif text-3xl text-ink-900 sm:text-4xl">Contact Us</h1>

      <div className="mt-12 grid grid-cols-1 gap-14 lg:grid-cols-2">
        <div>
          <div className="space-y-6 text-sm text-ink-900/70">
            <div className="flex gap-3"><MapPin className="h-5 w-5 shrink-0 text-gold-500" /> Plot 12, Nagaon Beach Road, Alibaug, Maharashtra 402201, India</div>
            <div className="flex gap-3"><Phone className="h-5 w-5 shrink-0 text-gold-500" /> +91 98765 43210</div>
            <div className="flex gap-3"><Mail className="h-5 w-5 shrink-0 text-gold-500" /> reservations@solacebayresort.com</div>
            <div className="flex gap-3"><Clock className="h-5 w-5 shrink-0 text-gold-500" /> Reception open 24/7 · Check-in 2:00 PM · Check-out 11:00 AM</div>
          </div>
          <div className="mt-8 h-64 overflow-hidden rounded-xl bg-sand-200">
            <iframe
              title="Solace Bay Resort location"
              className="h-full w-full border-0"
              loading="lazy"
              src="https://www.google.com/maps?q=Alibaug,Maharashtra&output=embed"
            />
          </div>
        </div>

        <ContactForm />
      </div>
    </div>
  );
}
