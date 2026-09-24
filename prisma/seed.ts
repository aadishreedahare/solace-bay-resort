// Sample data so every page has something to show. Run: npm run prisma:seed (after prisma:migrate).
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

function slugify(name: string) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function daysFromNow(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function main() {
  console.log('Seeding Solace Bay Resort & Spa…');

  // Hotel profile
  const existingHotel = await db.hotel.findFirst();
  const hotel =
    existingHotel ??
    (await db.hotel.create({
      data: {
        name: 'Solace Bay Resort & Spa',
        tagline: 'Where the Coast Meets Calm',
        description:
          'A boutique beachfront resort on Nagaon Beach, Alibaug — 42 rooms across five categories, ' +
          'a multi-cuisine restaurant, a full-service spa, and an infinity pool facing the Arabian Sea. ' +
          'Forty-five minutes by ferry from Mumbai, built for slow mornings and long dinners.',
        address: 'Plot 12, Nagaon Beach Road',
        city: 'Alibaug',
        state: 'Maharashtra',
        country: 'India',
        postalCode: '402201',
        phone: '+91 98200 12345',
        email: 'reservations@solacebayresort.com',
        mapEmbedUrl:
          'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3768.978!2d72.8722!3d18.6414!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!5e0!3m2!1sen!2sin',
        checkInTime: '14:00',
        checkOutTime: '11:00',
        totalRooms: 42,
        facebookUrl: 'https://facebook.com/solacebayresort',
        instagramUrl: 'https://instagram.com/solacebayresort',
        twitterUrl: 'https://twitter.com/solacebayresort',
        cancellationHoursThreshold: 48,
        cancellationFullRefundPct: 100,
        cancellationLateRefundPct: 0,
        taxPercent: 12,
      },
    }));

  // Admin & staff logins
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@solacebayresort.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!';

  await db.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: 'Aryan (General Manager)',
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 10),
      role: 'ADMIN',
    },
  });

  await db.user.upsert({
    where: { email: 'frontdesk@solacebayresort.com' },
    update: {},
    create: {
      name: 'Front Desk Staff',
      email: 'frontdesk@solacebayresort.com',
      passwordHash: await bcrypt.hash('FrontDesk123!', 10),
      role: 'STAFF',
    },
  });

  console.log(`  Admin login: ${adminEmail} / ${adminPassword}`);
  console.log('  Staff login: frontdesk@solacebayresort.com / FrontDesk123!');

  // Room types (42 rooms total, matching the hotel profile)
  const roomTypeDefs = [
    {
      name: 'Deluxe Room',
      description:
        'A bright, comfortable room with a private balcony facing the gardens — ideal for a short, easy stay.',
      bedType: 'King Bed',
      sizeSqft: 320,
      maxGuests: 2,
      basePrice: 8500,
      totalRooms: 15,
      amenities: ['Garden View', 'Air Conditioning', 'Free Wi-Fi', 'Minibar', 'Rain Shower', 'Tea/Coffee Maker'],
    },
    {
      name: 'Premium Room',
      description:
        'Extra space and a partial sea view, with a reading nook and a deeper soaking tub.',
      bedType: 'King Bed',
      sizeSqft: 400,
      maxGuests: 3,
      basePrice: 11500,
      totalRooms: 10,
      amenities: ['Partial Sea View', 'Air Conditioning', 'Free Wi-Fi', 'Minibar', 'Soaking Tub', 'Bathrobe & Slippers'],
    },
    {
      name: 'Executive Room',
      description:
        'A generous layout with a day bed and work desk, facing the pool — built for longer stays.',
      bedType: 'King Bed + Day Bed',
      sizeSqft: 480,
      maxGuests: 3,
      basePrice: 15500,
      totalRooms: 8,
      amenities: ['Pool View', 'Air Conditioning', 'Free Wi-Fi', 'Work Desk', 'Nespresso Machine', 'Bathrobe & Slippers'],
    },
    {
      name: 'Family Room',
      description:
        'Two queen beds and a separate sitting area, designed for families travelling with kids or grandparents.',
      bedType: 'Two Queen Beds',
      sizeSqft: 550,
      maxGuests: 6,
      basePrice: 18500,
      totalRooms: 4,
      amenities: ['Garden View', 'Air Conditioning', 'Free Wi-Fi', 'Extra Bedding', 'Minibar', 'Connecting Room Option'],
    },
    {
      name: 'Suite',
      description:
        'Our finest category — full sea view, a private plunge pool on the terrace, and a separate living room.',
      bedType: 'King Bed + Living Area',
      sizeSqft: 650,
      maxGuests: 4,
      basePrice: 22000,
      totalRooms: 5,
      amenities: ['Full Sea View', 'Private Plunge Pool', 'Air Conditioning', 'Free Wi-Fi', 'Butler Service', 'Bathrobe & Slippers'],
    },
  ];

  const roomTypes = [];
  for (const def of roomTypeDefs) {
    const slug = slugify(def.name);
    const rt = await db.roomType.upsert({
      where: { slug },
      update: {},
      create: { hotelId: hotel.id, slug, ...def },
    });
    roomTypes.push(rt);

    // Individual room units, so one unit can be blocked for maintenance
    const existingUnits = await db.room.count({ where: { roomTypeId: rt.id } });
    if (existingUnits === 0) {
      const floorBase = 100 * (roomTypes.length);
      for (let i = 1; i <= def.totalRooms; i++) {
        await db.room.create({
          data: {
            roomTypeId: rt.id,
            roomNumber: String(floorBase + i),
            floor: String(Math.ceil(i / 10)),
            status: i === 1 && roomTypes.length === 1 ? 'MAINTENANCE' : 'AVAILABLE',
            notes: i === 1 && roomTypes.length === 1 ? 'AC servicing — back in service in 2 days' : undefined,
          },
        });
      }
    }
  }

  const deluxe = roomTypes.find((r) => r.name === 'Deluxe Room')!;
  const suite = roomTypes.find((r) => r.name === 'Suite')!;
  const family = roomTypes.find((r) => r.name === 'Family Room')!;

  // Pricing rules
  const existingRules = await db.pricingRule.count();
  if (existingRules === 0) {
    await db.pricingRule.create({
      data: { hotelId: hotel.id, roomTypeId: null, type: 'WEEKEND', priceDeltaPct: 15, isActive: true },
    });

    const decStart = new Date(new Date().getFullYear(), 11, 20);
    const janEnd = new Date(new Date().getFullYear() + 1, 0, 5);
    await db.pricingRule.create({
      data: {
        hotelId: hotel.id,
        roomTypeId: null,
        type: 'HOLIDAY',
        startDate: decStart,
        endDate: janEnd,
        priceDeltaPct: 35,
        isActive: true,
      },
    });
  }

  // Coupon
  await db.coupon.upsert({
    where: { code: 'COASTAL15' },
    update: {},
    create: {
      hotelId: hotel.id,
      code: 'COASTAL15',
      discountType: 'PERCENTAGE',
      discountValue: 15,
      minBookingAmount: 10000,
      startDate: daysFromNow(-30),
      expiryDate: daysFromNow(120),
      usageLimit: 200,
    },
  });

  // Amenities
  const amenityDefs = [
    { name: 'Infinity Pool', icon: 'Waves' },
    { name: 'Multi-Cuisine Restaurant', icon: 'UtensilsCrossed' },
    { name: 'Full-Service Spa', icon: 'Sparkles' },
    { name: 'Complimentary Wi-Fi', icon: 'Wifi' },
    { name: '24/7 Fitness Studio', icon: 'Dumbbell' },
    { name: 'Private Parking', icon: 'ParkingCircle' },
    { name: 'Airport / Ferry Transfers', icon: 'Car' },
    { name: 'In-Room Dining', icon: 'Coffee' },
  ];
  if ((await db.amenity.count()) === 0) {
    for (const [i, a] of amenityDefs.entries()) {
      await db.amenity.create({ data: { hotelId: hotel.id, ...a, order: i } });
    }
  }

  // Services (restaurant, spa, experiences)
  const serviceDefs = [
    {
      name: 'Seaside Restaurant',
      description: 'All-day multi-cuisine dining with a daily-changing seafood catch, facing the shoreline.',
      price: null,
      order: 0,
    },
    {
      name: 'Ocean Spa Rituals',
      description: '60–90 minute therapies using local coconut and sea-salt based treatments.',
      price: 3500,
      order: 1,
    },
    {
      name: 'Airport & Ferry Transfers',
      description: 'Private car or ferry-coordinated pickup from Mumbai, arranged with your booking.',
      price: 2000,
      order: 2,
    },
    {
      name: 'Sunset Yacht Cruise',
      description: 'A two-hour private cruise along the Alibaug coastline, drinks included.',
      price: 6500,
      order: 3,
    },
  ];
  if ((await db.service.count()) === 0) {
    for (const s of serviceDefs) {
      await db.service.create({ data: { hotelId: hotel.id, ...s } });
    }
  }

  // Sample guests, completed bookings, and approved reviews
  const guestDefs = [
    {
      name: 'Priya Mehta',
      email: 'priya.mehta@example.com',
      roomType: suite,
      rating: 5,
      text:
        'Easily the calmest weekend we’ve had in years. The sea-view suite, the quiet, the staff remembering our names by day two — everything felt considered.',
    },
    {
      name: 'Rohan Deshpande',
      email: 'rohan.deshpande@example.com',
      roomType: deluxe,
      rating: 5,
      text:
        'Booked a Deluxe Room for a solo work retreat. Fast Wi-Fi, a proper desk, and the pool right outside for evening laps. Will be back.',
    },
    {
      name: 'Kavita Kulkarni',
      email: 'kavita.kulkarni@example.com',
      roomType: family,
      rating: 4,
      text:
        'Traveled with grandparents and two kids — the Family Room had space for everyone and the staff arranged an early check-in without any fuss.',
    },
  ];

  let sequence = await db.booking.count();

  for (const g of guestDefs) {
    const user = await db.user.upsert({
      where: { email: g.email },
      update: {},
      create: {
        name: g.name,
        email: g.email,
        passwordHash: await bcrypt.hash('Guest1234!', 10),
        role: 'CUSTOMER',
      },
    });

    const existingReview = await db.review.findFirst({ where: { userId: user.id, roomTypeId: g.roomType.id } });
    if (existingReview) continue;

    const nights = 3;
    const basePrice = Number(g.roomType.basePrice);
    const subtotal = basePrice * nights;
    const taxAmount = Math.round(subtotal * (Number(hotel.taxPercent) / 100));
    const totalAmount = subtotal + taxAmount;
    const checkIn = daysFromNow(-20);
    const checkOut = daysFromNow(-20 + nights);

    sequence += 1;
    const booking = await db.booking.create({
      data: {
        bookingCode: `HTL-${new Date().getFullYear()}-${String(sequence).padStart(6, '0')}`,
        userId: user.id,
        roomTypeId: g.roomType.id,
        checkIn,
        checkOut,
        roomsBooked: 1,
        guestsCount: 2,
        guestName: g.name,
        guestEmail: g.email,
        guestPhone: '+91 90000 00000',
        basePrice,
        nights,
        subtotal,
        taxAmount,
        discountAmount: 0,
        totalAmount,
        status: 'COMPLETED',
        source: 'WEBSITE',
      },
    });

    await db.payment.create({
      data: {
        bookingId: booking.id,
        provider: 'razorpay',
        amount: totalAmount,
        status: 'PAID',
        paidAt: checkIn,
      },
    });

    await db.review.create({
      data: {
        userId: user.id,
        bookingId: booking.id,
        roomTypeId: g.roomType.id,
        rating: g.rating,
        text: g.text,
        isApproved: true,
      },
    });
  }

  // Sample contact messages
  if ((await db.contactMessage.count()) === 0) {
    await db.contactMessage.create({
      data: {
        name: 'Sanjay Rao',
        email: 'sanjay.rao@example.com',
        phone: '+91 98765 43210',
        subject: 'Group booking for a wedding',
        message: 'We are looking to block 10 rooms for a wedding weekend in December — could someone call me to discuss rates?',
        isRead: false,
      },
    });
    await db.contactMessage.create({
      data: {
        name: 'Meera Iyer',
        email: 'meera.iyer@example.com',
        subject: 'Dietary requirements',
        message: 'Do you cater to Jain food requirements at the restaurant? Booking a Premium Room for next month.',
        isRead: true,
      },
    });
  }

  console.log('Seed complete.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
