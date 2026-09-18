import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name is too short').max(100),
  email: z.string().email(),
  phone: z.string().min(7).max(15).optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const bookingRequestSchema = z
  .object({
    roomTypeId: z.string().cuid(),
    checkIn: z.coerce.date(),
    checkOut: z.coerce.date(),
    roomsBooked: z.coerce.number().int().min(1).max(20),
    guestsCount: z.coerce.number().int().min(1).max(50),
    guestName: z.string().min(2).max(100),
    guestEmail: z.string().email(),
    guestPhone: z.string().min(7).max(15),
    specialRequests: z.string().max(1000).optional(),
    couponCode: z.string().max(40).optional(),
    guests: z
      .array(
        z.object({
          fullName: z.string().min(1).max(100),
          age: z.coerce.number().int().min(0).max(120).optional(),
          idType: z.string().max(50).optional(),
          idNumber: z.string().max(50).optional(),
        }),
      )
      .optional(),
  })
  .refine((data) => data.checkOut > data.checkIn, {
    message: 'Check-out date must be after check-in date',
    path: ['checkOut'],
  });

export const availabilityQuerySchema = z
  .object({
    checkIn: z.coerce.date(),
    checkOut: z.coerce.date(),
    guests: z.coerce.number().int().min(1).max(50).default(1),
    roomTypeId: z.string().cuid().optional(),
  })
  .refine((data) => data.checkOut > data.checkIn, {
    message: 'Check-out date must be after check-in date',
    path: ['checkOut'],
  });

export const cancelBookingSchema = z.object({
  reason: z.string().max(500).optional(),
});

export const contactFormSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().max(15).optional(),
  subject: z.string().min(2).max(150),
  message: z.string().min(10).max(2000),
});

export const couponValidateSchema = z.object({
  code: z.string().min(1).max(40),
  bookingAmount: z.coerce.number().positive(),
});
