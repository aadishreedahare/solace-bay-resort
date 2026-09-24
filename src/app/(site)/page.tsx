import Link from 'next/link';
import { Wifi, Waves, UtensilsCrossed, ParkingCircle, Dumbbell, Sparkles, MapPin } from 'lucide-react';
import { BookingWidget } from '@/components/site/booking-widget';
import { SectionHeading } from '@/components/site/section-heading';
import { RoomCard, toRoomCard, type RoomCardData } from '@/components/site/room-card';
import { PlaceholderImage } from '@/components/site/placeholder-image';
import { StarRating } from '@/components/site/star-rating';
import { db } from '@/server/db';

export const revalidate = 60;

const AMENITIES = [
  { icon: Waves, label: 'Infinity Pool' },
  { icon: UtensilsCrossed, label: 'Multi-Cuisine Restaurant' },
  { icon: Sparkles, label: 'Full-Service Spa' },
  { icon: Wifi, label: 'Complimentary Wi-Fi' },
  { icon: Dumbbell, label: '24/7 Fitness Studio' },
  { icon: ParkingCircle, label: 'Private Parking' },
];

const TESTIMONIALS = [
  {
    name: 'Priya & Arjun Mehta',
    text: 'Easily the calmest weekend we’ve had in years. The sea-view suite, the quiet, the staff remembering our names by day two — everything felt considered.',
    rating: 5,
  },
  {
    name: 'Rohan Deshpande',
    text: 'Booked a Deluxe Room for a solo work retreat. Fast Wi-Fi, a proper desk, and the pool right outside for evening laps. Will be back.',
    rating: 5,
  },
  {
    name: 'The Kulkarni Family',
    text: 'Traveled with grandparents and two kids — the Family Room had space for everyone and the staff arranged an early check-in without any fuss.',
    rating: 4,
  },
];

async function getFeaturedRooms(): Promise<RoomCardData[]> {
  const roomTypes = await db.roomType.findMany({
    where: { isActive: true },
    orderBy: { basePrice: 'asc' },
    take: 3,
  });

  return roomTypes.map(toRoomCard);
}

export default async function HomePage() {
  const featuredRooms = await getFeaturedRooms().catch(() => [] as RoomCardData[]);

  return (
    <>
      <section className="relative flex min-h-[88vh] items-center justify-center overflow-hidden">
        <PlaceholderImage seed={4} src="/images/hero.jpg" className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-ink-950/35 to-ink-950/55" />

        <div className="container-site relative z-10 flex flex-col items-center pb-16 pt-24 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-400">
            Alibaug, Maharashtra
          </p>
          <h1 className="mt-5 max-w-3xl font-serif text-4xl leading-tight text-white sm:text-6xl">
            Where the Coast Meets Calm
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/80">
            A boutique beachfront resort built for slow mornings and long dinners — 42 rooms,
            one shoreline, a short ferry ride from Mumbai.
          </p>

          <div className="mt-10 w-full">
            <BookingWidget variant="hero" />
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container-site grid grid-cols-1 items-center gap-14 lg:grid-cols-2">
          <div className="grid grid-cols-2 gap-4">
            <PlaceholderImage seed={1} src="/images/intro-1.jpg" className="h-72 rounded-xl" />
            <PlaceholderImage seed={2} src="/images/intro-2.jpg" className="mt-10 h-72 rounded-xl" />
          </div>
          <div>
            <p className="eyebrow">Welcome to Solace Bay</p>
            <h2 className="mt-3 font-serif text-3xl text-ink-900 sm:text-4xl">
              A resort built around quiet, not spectacle
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-ink-900/65">
              Solace Bay Resort &amp; Spa sits directly on Nagaon Beach, forty-five minutes by
              ferry from Mumbai. Every one of our 42 rooms was designed around natural light,
              uncluttered space, and views of either the sea or our private gardens. Days here
              move at their own pace — a swim before breakfast, a spa treatment before sunset,
              dinner that runs as long as the conversation does.
            </p>
            <Link href="/rooms" className="btn-primary mt-8">
              Explore Rooms &amp; Suites
            </Link>
          </div>
        </div>
      </section>

      {featuredRooms.length > 0 && (
        <section className="bg-sand-100/60 py-24">
          <div className="container-site">
            <SectionHeading
              eyebrow="Stay"
              title="Featured Rooms & Suites"
              description="Five room categories, each with its own layout and view — every rate shown is per night, taxes included at checkout."
            />
            <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {featuredRooms.map((room) => (
                <RoomCard key={room.slug} room={room} />
              ))}
            </div>
            <div className="mt-12 text-center">
              <Link href="/rooms" className="btn-secondary">
                View All Rooms
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="py-24">
        <div className="container-site">
          <SectionHeading
            eyebrow="On the Property"
            title="Everything You Need, Nothing You Don't"
          />
          <div className="mt-14 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
            {AMENITIES.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-3 rounded-xl border border-ink-900/8 bg-white px-4 py-8 text-center shadow-card"
              >
                <Icon className="h-6 w-6 text-gold-500" strokeWidth={1.5} />
                <span className="text-xs font-medium text-ink-900/70">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink-950 py-24">
        <div className="container-site">
          <SectionHeading
            eyebrow="A Look Around"
            title="Gallery"
            className="[&_h2]:text-white [&_p]:text-white/60"
          />
          <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <PlaceholderImage
                key={i}
                seed={i}
                src={`/images/gallery-${i + 1}.jpg`}
                className={`h-48 rounded-lg ${i === 0 ? 'col-span-2 row-span-2 h-full' : ''}`}
              />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/gallery" className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400 hover:underline">
              View Full Gallery →
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container-site rounded-2xl bg-gold-500 px-8 py-14 text-center sm:px-16">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/80">Limited-Time Offer</p>
          <h3 className="mt-3 font-serif text-3xl text-white sm:text-4xl">
            Stay 3 Nights, Save 15% — Book Direct
          </h3>
          <p className="mx-auto mt-3 max-w-lg text-sm text-white/85">
            Our best rate is always on this website, never on third-party platforms.
          </p>
          <Link href="/offers" className="btn-primary mt-7 !bg-white !text-gold-600 hover:!bg-sand-100">
            View All Offers
          </Link>
        </div>
      </section>

      <section className="bg-sand-100/60 py-24">
        <div className="container-site">
          <SectionHeading eyebrow="Guest Stories" title="What Our Guests Say" />
          <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="rounded-xl bg-white p-7 shadow-card">
                <StarRating rating={t.rating} />
                <p className="mt-4 text-sm leading-relaxed text-ink-900/70">&ldquo;{t.text}&rdquo;</p>
                <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-ink-900/50">
                  {t.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container-site grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="eyebrow">Find Us</p>
            <h2 className="mt-3 font-serif text-3xl text-ink-900 sm:text-4xl">
              Nagaon Beach Road, Alibaug
            </h2>
            <p className="mt-5 flex items-start gap-2 text-sm text-ink-900/65">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
              Plot 12, Nagaon Beach Road, Alibaug, Maharashtra 402201, India
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink-900/65">
              45 minutes by ferry from the Gateway of India, or a 2.5-hour scenic drive via
              the Mumbai–Goa highway and Revas–Ashtami route.
            </p>
            <Link href="/contact" className="btn-secondary mt-7">
              Get Directions &amp; Contact
            </Link>
          </div>
          <PlaceholderImage seed={5} src="/images/location.jpg" label="Map" className="h-80 rounded-xl" />
        </div>
      </section>
    </>
  );
}