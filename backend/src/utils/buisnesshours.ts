/**
 * Dealership opening hours, using the server's local time.
 * JavaScript's Date#getDay returns 0 for Sunday and 6 for Saturday.
 */
const BUSINESS_HOURS: Record<number, { open: number; close: number }> = {
  1: { open: 9, close: 18 },
  2: { open: 9, close: 18 },
  3: { open: 9, close: 18 },
  4: { open: 9, close: 18 },
  5: { open: 9, close: 18 },
  6: { open: 10, close: 14 },
};

/**
 * Returns whether the dealership is open at the supplied local date and time.
 * The opening time is included; the closing time is excluded.
 */
export function isBusinessOpen(now: Date = new Date()): boolean {
  const hours = BUSINESS_HOURS[now.getDay()];

  if (!hours) {
    return false;
  }

  const currentTime = now.getHours() * 60 + now.getMinutes();
  return currentTime >= hours.open * 60 && currentTime < hours.close * 60;
}

export const dealershipBusinessHours = {
  weekdays: "09:00-18:00",
  saturday: "10:00-14:00",
  sunday: "Closed",
} as const;
