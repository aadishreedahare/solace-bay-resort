import Link from 'next/link';
import { Instagram, Facebook, Twitter, MapPin, Phone, Mail } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="bg-ink-950 text-sand-100">
      <div className="container-site grid grid-cols-1 gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="font-serif text-xl tracking-[0.15em] text-white">
            SOLACE <span className="text-gold-400">BAY</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-sand-100/70">
            A boutique beachfront resort on the Konkan coast — where the coast meets calm.
          </p>
          <div className="mt-5 flex gap-4 text-sand-100/70">
            <Instagram className="h-4 w-4" />
            <Facebook className="h-4 w-4" />
            <Twitter className="h-4 w-4" />
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">Explore</h4>
          <ul className="mt-4 space-y-3 text-sm text-sand-100/80">
            <li><Link href="/rooms" className="hover:text-white">Rooms &amp; Suites</Link></li>
            <li><Link href="/services" className="hover:text-white">Dining &amp; Spa</Link></li>
            <li><Link href="/gallery" className="hover:text-white">Gallery</Link></li>
            <li><Link href="/offers" className="hover:text-white">Offers &amp; Packages</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">Guest</h4>
          <ul className="mt-4 space-y-3 text-sm text-sand-100/80">
            <li><Link href="/account" className="hover:text-white">My Account</Link></li>
            <li><Link href="/account/bookings" className="hover:text-white">My Bookings</Link></li>
            <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
            <li><Link href="/login" className="hover:text-white">Sign In</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">Reach Us</h4>
          <ul className="mt-4 space-y-3 text-sm text-sand-100/80">
            <li className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" /> Nagaon Beach Road, Alibaug, Maharashtra 402201</li>
            <li className="flex gap-2"><Phone className="h-4 w-4 shrink-0 text-gold-400" /> +91 98765 43210</li>
            <li className="flex gap-2"><Mail className="h-4 w-4 shrink-0 text-gold-400" /> reservations@solacebayresort.com</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-6">
        <div className="container-site flex flex-col items-center justify-between gap-3 text-xs text-sand-100/50 sm:flex-row">
          <p>© {new Date().getFullYear()} Solace Bay Resort &amp; Spa. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/policies/cancellation" className="hover:text-white">Cancellation Policy</Link>
            <Link href="/policies/privacy" className="hover:text-white">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
