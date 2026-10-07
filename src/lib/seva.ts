export const MEMBERSHIP_RUPEES = 2100;
export const MONTHLY_COST_RUPEES = 25000;
export const PLATES = 400;

export type Civil = { year: number; month: number; day: number };

const WEEKDAY_OFFSET = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];

/** 0 = Sunday. Calendar math, not the machine timezone. */
function weekday(year: number, month: number, day: number): number {
  let y = year;
  if (month < 3) y -= 1;
  return (
    (y +
      Math.floor(y / 4) -
      Math.floor(y / 100) +
      Math.floor(y / 400) +
      WEEKDAY_OFFSET[month - 1] +
      day) %
    7
  );
}

/** Poonam (full-moon) civil dates, India. First Sunday after each is the seva. */
const POONAM: Civil[] = [
  { year: 2026, month: 1, day: 3 },
  { year: 2026, month: 2, day: 1 },
  { year: 2026, month: 3, day: 3 },
  { year: 2026, month: 4, day: 2 },
  { year: 2026, month: 5, day: 1 },
  { year: 2026, month: 5, day: 31 },
  { year: 2026, month: 6, day: 29 },
  { year: 2026, month: 7, day: 29 },
  { year: 2026, month: 8, day: 28 },
  { year: 2026, month: 9, day: 26 },
  { year: 2026, month: 10, day: 26 },
  { year: 2026, month: 11, day: 24 },
  { year: 2026, month: 12, day: 23 },
  { year: 2027, month: 1, day: 22 },
  { year: 2027, month: 2, day: 20 },
  { year: 2027, month: 3, day: 22 },
  { year: 2027, month: 4, day: 20 },
  { year: 2027, month: 5, day: 20 },
  { year: 2027, month: 6, day: 18 },
  { year: 2027, month: 7, day: 18 },
  { year: 2027, month: 8, day: 17 },
  { year: 2027, month: 9, day: 15 },
  { year: 2027, month: 10, day: 15 },
  { year: 2027, month: 11, day: 13 },
  { year: 2027, month: 12, day: 13 },
];

function addDays(day: Civil, days: number): Civil {
  const date = new Date(Date.UTC(day.year, day.month - 1, day.day + days));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
}

function firstSundayAfter(poonam: Civil): Civil {
  const dow = weekday(poonam.year, poonam.month, poonam.day);
  const delta = dow === 0 ? 7 : 7 - dow;
  return addDays(poonam, delta);
}

/** Next Annadanam dates: first Sunday after Poonam, 12:30 noon India time. */
export function upcomingSevas(now = new Date(), count = 3): Civil[] {
  const here = kolkataParts(now);
  const today = dayNumber(here.year, here.month, here.day);
  const out: Civil[] = [];
  for (const poonam of POONAM) {
    const seva = firstSundayAfter(poonam);
    if (dayNumber(seva.year, seva.month, seva.day) < today) continue;
    out.push(seva);
    if (out.length === count) break;
  }
  return out;
}

function kolkataParts(now: Date) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
  });
  const bag: Record<string, string> = {};
  for (const part of fmt.formatToParts(now)) {
    if (part.type !== "literal") bag[part.type] = part.value;
  }
  return {
    year: Number(bag.year),
    month: Number(bag.month),
    day: Number(bag.day),
    hour: Number(bag.hour),
    minute: Number(bag.minute),
  };
}

function dayNumber(year: number, month: number, day: number): number {
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

export function sevaPhrase(day: Civil, now = new Date()): string {
  const here = kolkataParts(now);
  const nowMins = dayNumber(here.year, here.month, here.day) * 24 * 60 + here.hour * 60 + here.minute;
  const startMins = dayNumber(day.year, day.month, day.day) * 24 * 60 + 12 * 60 + 30;
  const diff = startMins - nowMins;
  if (here.year === day.year && here.month === day.month && here.day === day.day && diff <= 0) {
    return "Underway since 12:30 noon";
  }
  if (diff <= 0) return "Passed";
  const days = Math.floor(diff / (24 * 60));
  const hours = Math.floor((diff % (24 * 60)) / 60);
  if (days >= 2) return `In ${days} days`;
  if (days === 1) return "Tomorrow";
  if (hours >= 1) return hours === 1 ? "Today, in 1 hour" : `Today, in ${hours} hours`;
  const mins = diff % 60;
  if (mins <= 1) return "Starting now";
  return `Today, in ${mins} minutes`;
}

export function formatSevaParts(day: Civil): { weekday: string; date: string } {
  const date = new Date(Date.UTC(day.year, day.month - 1, day.day));
  return {
    weekday: new Intl.DateTimeFormat("en-IN", { weekday: "long", timeZone: "UTC" }).format(date),
    date: new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(date),
  };
}

export function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
