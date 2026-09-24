# Solace Bay Resort

A hotel booking website with an admin panel. Guests can search rooms, book, pay with Razorpay and cancel
from their account. Staff can manage bookings (including phone and walk-in bookings), prices, coupons,
reviews and hotel settings.

**Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, PostgreSQL, Prisma, NextAuth, Razorpay.

## Features

- Room search with live availability
- Per-night pricing with weekend, seasonal and holiday rules
- Coupons, taxes and a booking summary before payment
- Razorpay checkout with signature verification, plus a webhook as a backup
- Cancellation with a refund based on how early the guest cancels
- Admin dashboard: stats, 14-day revenue chart, availability calendar
- Role-based access: customers, staff and admins

## How booking works

1. Availability is never stored. It is calculated each time as
   `total rooms − rooms in overlapping bookings − rooms under maintenance`.
2. A booking is created inside a serializable transaction that checks availability again,
   so two people can't book the last room at the same time.
3. Website bookings start as `PENDING` and become `CONFIRMED` after payment.
   Bookings made by staff are confirmed straight away.

The main logic is in `src/server/services/`.

## Running locally

You need Node.js 18.18+ and a PostgreSQL database.

```bash
npm install
cp .env.example .env        # then fill in the values
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Open http://localhost:3000 for the site and http://localhost:3000/admin for the admin panel.

The seed script creates these logins:

| Role  | Email                         | Password                          |
|-------|-------------------------------|-----------------------------------|
| Admin | `admin@solacebayresort.com`     | `ChangeMe123!` (or `SEED_ADMIN_PASSWORD`) |
| Staff | `frontdesk@solacebayresort.com` | `FrontDesk123!`                   |
| Guest | `priya.mehta@example.com`       | `Guest1234!`                      |

## Environment variables

| Variable | Used for |
|---|---|
| `DATABASE_URL` | PostgreSQL connection |
| `NEXTAUTH_URL`, `NEXTAUTH_SECRET` | Login sessions |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Creating and verifying payments |
| `RAZORPAY_WEBHOOK_SECRET` | Checking webhook calls from Razorpay |
| `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` | Admin account created by the seed script |

## Things I'd add next

- Sending confirmation emails (bookings already write rows to the `Notification` table)
- Admin screens for gallery and amenities
- Tests for the pricing and availability services
