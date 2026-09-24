import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string, currency = 'INR') {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(date: Date | string) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

// e.g. HTL-2026-000123
export function generateBookingCode(sequence: number) {
  const year = new Date().getFullYear();
  return `HTL-${year}-${String(sequence).padStart(6, '0')}`;
}

export function nightsBetween(checkIn: Date, checkOut: Date) {
  return Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / 86_400_000));
}

// Local date as YYYY-MM-DD, `offsetDays` from today. Used for <input type="date"> values.
export function isoDate(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
