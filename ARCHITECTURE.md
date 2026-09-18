# Solace Bay Resort & Spa — Full-Stack Booking Platform

**Architecture & Planning Document**

Hotel chosen for this build: **Solace Bay Resort & Spa** — a 42-room boutique beachfront resort in Alibaug, Maharashtra, India. Tagline: *"Where the Coast Meets Calm."* Full profile is in [`docs/hotel-profile.md`](./docs/hotel-profile.md) and is 100% admin-editable at runtime — nothing below is hardcoded into the frontend.

---

## 1. Project Architecture

```
                        ┌─────────────────────────────┐
                        │        Next.js 14 App        │
                        │        (App Router, TS)      │
                        ├───────────────┬───────────────┤
                        │  Customer UI  │   Admin UI     │
                        │  (public)     │  (/admin, RBAC)│
                        └───────┬───────┴───────┬────────┘
                                │                │
                        ┌───────▼────────────────▼────────┐
                        │     API Layer (Route Handlers)   │
                        │  /api/* — REST-style JSON APIs   │
                        │  Server Actions for mutations    │
                        └───────┬───────────────┬──────────┘
                                │               │
                ┌───────────────▼───┐   ┌───────▼─────────────┐
                │   Service Layer    │   │   Auth Layer         │
                │ booking, pricing,  │   │ NextAuth (Credentials │
                │ availability,      │   │ + session/JWT),      │
                │ coupons, reviews   │   │ RBAC middleware       │
                └───────────┬────────┘   └───────┬──────────────┘
                            │                     │
                    ┌───────▼─────────────────────▼───────┐
                    │      Prisma ORM (typed client)        │
                    └───────────────┬────────────────────────┘
                                    │
                            ┌───────▼────────┐
                            │  PostgreSQL     │
                            └────────────────┘

   External integrations (all via server-side service modules, never
   called from the client directly):
   - Razorpay  — payment intent + webhook verification
   - Cloudinary — signed image upload + delivery
   - Resend/Nodemailer — transactional email
   - Webhook endpoint (/api/webhooks/*) — n8n-compatible automation hooks
```

**Key architectural decisions:**
- **App Router + Server Components** for the customer site → fast first paint, SEO-friendly server-rendered pages, client components only where interactivity is needed (date pickers, booking widget, dashboards).
- **A service layer between API routes and Prisma** (`src/server/services/*`) so business logic (availability checks, price math, cancellation rules) is unit-testable and never duplicated between a route handler and a server action.
- **All content editable from the admin panel** — hotel info, rooms, prices, amenities, offers, policies — is modeled as database rows, not `.env`/constants, satisfying requirement #28.
- **Webhooks table + outbox pattern** for notifications, so email sending and future n8n/WhatsApp automation don't block the booking transaction.

---

## 2. Folder Structure

```
solace-bay-resort/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── src/
│   ├── app/
│   │   ├── (site)/                     # customer-facing route group
│   │   │   ├── page.tsx                # Home
│   │   │   ├── rooms/
│   │   │   │   ├── page.tsx            # Room catalogue
│   │   │   │   └── [slug]/page.tsx     # Room detail
│   │   │   ├── booking/
│   │   │   │   ├── review/page.tsx
│   │   │   │   ├── payment/page.tsx
│   │   │   │   └── confirmation/[bookingId]/page.tsx
│   │   │   ├── offers/page.tsx
│   │   │   ├── gallery/page.tsx
│   │   │   ├── services/page.tsx
│   │   │   ├── contact/page.tsx
│   │   │   ├── account/
│   │   │   │   ├── page.tsx            # dashboard/profile
│   │   │   │   ├── bookings/page.tsx
│   │   │   │   └── bookings/[id]/page.tsx
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── admin/                      # protected route group (ADMIN/STAFF only)
│   │   │   ├── layout.tsx              # RBAC guard + admin shell
│   │   │   ├── page.tsx                # dashboard/overview
│   │   │   ├── rooms/
│   │   │   ├── bookings/
│   │   │   ├── calendar/page.tsx
│   │   │   ├── pricing/page.tsx
│   │   │   ├── coupons/page.tsx
│   │   │   ├── reviews/page.tsx
│   │   │   ├── amenities/page.tsx
│   │   │   ├── services/page.tsx
│   │   │   ├── gallery/page.tsx
│   │   │   ├── messages/page.tsx
│   │   │   └── settings/page.tsx       # hotel content management (#28)
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── rooms/route.ts
│   │   │   ├── rooms/[id]/route.ts
│   │   │   ├── availability/route.ts
│   │   │   ├── bookings/route.ts
│   │   │   ├── bookings/[id]/route.ts
│   │   │   ├── bookings/[id]/cancel/route.ts
│   │   │   ├── payments/create-order/route.ts
│   │   │   ├── payments/verify/route.ts
│   │   │   ├── coupons/validate/route.ts
│   │   │   ├── reviews/route.ts
│   │   │   ├── contact/route.ts
│   │   │   ├── admin/*                 # mirrors admin pages, RBAC-protected
│   │   │   └── webhooks/
│   │   │       ├── razorpay/route.ts
│   │   │       └── n8n/route.ts
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── site/                       # Hero, BookingWidget, RoomCard, ...
│   │   ├── admin/                      # DataTable, StatCard, RevenueChart, ...
│   │   └── ui/                         # shared primitives (Button, Input, ...)
│   ├── server/
│   │   ├── services/
│   │   │   ├── availability.service.ts
│   │   │   ├── pricing.service.ts
│   │   │   ├── booking.service.ts
│   │   │   ├── coupon.service.ts
│   │   │   ├── cancellation.service.ts
│   │   │   ├── notification.service.ts
│   │   │   └── payment.service.ts
│   │   ├── auth.ts                     # NextAuth config
│   │   └── db.ts                       # Prisma client singleton
│   ├── lib/                            # utils, validation schemas (zod), constants
│   ├── types/
│   └── emails/                         # React Email templates
├── public/
├── .env.example
├── package.json
├── tailwind.config.ts
└── README.md
```

---

## 3. Database ER Schema (summary)

Full Prisma source lives in `prisma/schema.prisma`. Relationships:

```
User ──< Booking ──< BookingGuest
User ──< Review
User ──< ContactMessage (optional link)

Hotel 1─< RoomType ──< Room ──< RoomImage
Hotel 1─< Amenity
Hotel 1─< Service ──< ServiceImage
Hotel 1─< Offer/Coupon
Hotel 1─< PricingRule
Hotel 1─< GalleryImage
Hotel 1─< PolicySetting (cancellation policy, check-in/out, etc.)

RoomType ──< Booking (one booking is for one RoomType, N rooms, date range)
Booking 1─1 Payment
Booking ──< Notification

Admin/Staff → User with role = ADMIN | STAFF (single table, role-based, not a separate model)
```

Key fields that make the booking logic correct:
- `Booking.checkIn`, `Booking.checkOut`, `Booking.roomsBooked`, `Booking.status` (`PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED`, `NO_SHOW`)
- `Room.status` (`AVAILABLE`, `OCCUPIED`, `MAINTENANCE`, `UNAVAILABLE`) for manual blocks, independent of bookings
- Availability is **never** stored as a static number — it's always computed at request time from `RoomType.totalRooms − overlapping CONFIRMED/PENDING bookings − rooms under MAINTENANCE`.

---

## 4. All Pages

**Customer:** Home · Rooms (catalogue) · Room Detail · Booking Review · Payment · Booking Confirmation · Offers · Gallery · Services · Contact · Login · Register · Account Dashboard · My Bookings · Booking Detail

**Admin:** Dashboard/Overview · Room Management (list/add/edit) · Booking Management (list/detail/offline booking) · Calendar · Pricing Management · Coupons · Reviews Moderation · Amenities · Services · Gallery Manager · Contact Messages · Hotel Content Settings (#28) · Staff/User management

---

## 5. All APIs

```
Auth
POST   /api/auth/register
POST   /api/auth/[...nextauth]         (NextAuth handlers: login/logout/session)

Public content
GET    /api/rooms                      list room types (filterable)
GET    /api/rooms/:id
GET    /api/availability?checkIn=&checkOut=&guests=&roomType=
POST   /api/coupons/validate
POST   /api/contact
GET    /api/reviews?roomType=

Booking
POST   /api/bookings                   create booking (PENDING)
GET    /api/bookings/:id
POST   /api/bookings/:id/cancel
POST   /api/payments/create-order      Razorpay order
POST   /api/payments/verify            signature verification → CONFIRMED

Customer account
GET    /api/account/bookings
PATCH  /api/account/profile

Admin (all under /api/admin/*, RBAC-protected)
CRUD   /api/admin/rooms
CRUD   /api/admin/room-types
GET    /api/admin/bookings   (filters: date, room, status)
POST   /api/admin/bookings              offline/manual booking
PATCH  /api/admin/bookings/:id
CRUD   /api/admin/coupons
CRUD   /api/admin/amenities
CRUD   /api/admin/services
CRUD   /api/admin/gallery
PATCH  /api/admin/reviews/:id           approve/hide/delete
CRUD   /api/admin/pricing-rules
PATCH  /api/admin/settings              hotel content, policies
GET    /api/admin/stats/overview        dashboard KPIs
GET    /api/admin/stats/revenue         chart data
GET    /api/admin/calendar              room x date grid

Webhooks
POST   /api/webhooks/razorpay
POST   /api/webhooks/n8n                outbound trigger, not inbound
```

---

## 6. User Roles & Permissions

| Role | Can do |
|---|---|
| **Guest (unauthenticated)** | Browse rooms, check availability, view gallery/offers, submit contact form |
| **CUSTOMER** | All of the above + book, pay, view/cancel own bookings, leave reviews on completed stays, manage own profile |
| **STAFF** | Everything CUSTOMER can view for support, + booking management (create offline bookings, confirm/cancel, mark payment received), view calendar, view messages — **no** pricing/coupon/user-management access |
| **ADMIN** | Full access: STAFF permissions + room/pricing/coupon management, review moderation, hotel content settings, staff account management, full analytics |

Enforced via NextAuth session `role` claim + a `requireRole()` middleware wrapper on every `/api/admin/*` route and the `/admin` layout — never trust a client-sent role.

---

## 7. Complete Booking Flow

```
1. Search  — guest picks check-in/out + guests on Home or Rooms page
2. Availability check — GET /api/availability computes real-time open rooms per type
3. Select room — guest opens Room Detail, adjusts dates/rooms/guests, sees live price
4. Guest details — full name, email, phone, special requests (+ ID info if required)
5. Review — final itemized summary: base price, taxes, fees, discount (coupon), total
6. Create booking — POST /api/bookings inserts status=PENDING inside a DB transaction
                     that re-validates availability (prevents race-condition double-booking)
7. Payment — Razorpay checkout opens; on success, POST /api/payments/verify checks the
             signature server-side, then flips booking → CONFIRMED and generates
             bookingId in the form HTL-2026-000123
8. Confirmation — confirmation page + confirmation email (React Email + Resend) fire;
                   admin gets a "new booking" notification
9. Post-stay — customer can leave a review only if a CONFIRMED booking's checkOut has passed
```

Cancellation: `POST /api/bookings/:id/cancel` reads the active `PolicySetting` (admin-configurable hours threshold + refund %), computes the refund, releases the room inventory immediately, and triggers a cancellation email + (future) refund webhook.

---

## 8. Admin Workflow

```
Login (ADMIN/STAFF only, separate credential check + role gate)
  → Dashboard: today's check-ins/outs, occupancy %, revenue, pending payments, recent bookings
  → Calendar: visual room × date grid to sanity-check occupancy before taking phone bookings
  → Bookings: search/filter → open a booking → confirm / cancel / modify / mark paid
       OR "+ New Offline Booking" → same availability engine as the website, so a phone
       booking instantly blocks that room on the live site
  → Rooms: add/edit room types & individual rooms, upload images (Cloudinary), set status
  → Pricing: base/weekend/seasonal/holiday rates + tax rules (feeds pricing.service.ts)
  → Coupons: create/deactivate discount codes
  → Reviews: approve/hide/delete
  → Settings: edit hotel name, tagline, description, contact info, policies, socials — the
       exact fields the public site reads at render time (#28)
```

---

## 9. Technology Choices & Reasoning

| Choice | Why |
|---|---|
| **Next.js (App Router) + TypeScript** | One codebase for customer site, admin panel, and API — server components cut client JS for a marketing-style homepage while still supporting rich interactive booking widgets; TypeScript end-to-end (shared types between API and UI) eliminates a whole class of integration bugs. |
| **Tailwind CSS** | Fast to build a genuinely custom, premium look instead of an off-the-shelf component-library aesthetic — important since the brief explicitly rejects a "generic dashboard template" feel. |
| **PostgreSQL + Prisma** | Booking overlap logic needs real transactions and constraints — Postgres is the right tool; Prisma gives type-safe queries and painless migrations, and its migration history doubles as schema documentation. |
| **NextAuth (Credentials + hashed passwords via bcrypt)** | Battle-tested session/JWT handling, easy to extend to Google/OAuth later, integrates cleanly with role-based middleware. |
| **Razorpay** | Primary market is India (INR pricing, UPI support) — Stripe stays as a documented alternative behind the same `payment.service.ts` interface if the hotel later serves international cards. |
| **Cloudinary** | Signed uploads straight from the admin panel, on-the-fly image transforms (thumbnails, responsive sizes) without hand-rolling an image pipeline. |
| **Service-layer pattern** | Keeps booking/pricing/cancellation logic in plain, testable TypeScript functions — API routes and server actions both call the same service, so logic is never duplicated or allowed to drift. |

---

## 10. Development Roadmap (Phases)

| Phase | Deliverable |
|---|---|
| **0 — Planning** | This document + hotel profile (done) |
| **1 — Foundation** | Next.js/TS/Tailwind/Prisma scaffold, full DB schema + migrations, seed data |
| **2 — Auth & Core UI** | NextAuth + roles, homepage, rooms catalogue, room detail page |
| **3 — Booking Engine** | Availability service, price calculation, booking creation API with transaction-safe overlap prevention |
| **4 — Admin Core** | Admin shell + RBAC, dashboard stats, room management, booking management (incl. offline bookings), calendar |
| **5 — Payments & Notifications** | Razorpay integration, email confirmations, cancellation + refund logic |
| **6 — Commerce Extras** | Coupons/offers, reviews, amenities/services/gallery admin CRUD |
| **7 — Polish** | SEO metadata/schema, responsive QA, animations, contact form + admin inbox |
| **8 — Hardening & Docs** | Input/API validation pass, security review, README + deployment instructions, (stub) test coverage |
| **9 — Future-ready hooks** | n8n/webhook endpoints, AI-feature integration points (chatbot, recommendations) left as clean extension seams, not built into v1 |

*This build proceeds phase by phase starting now with Phase 1.*
