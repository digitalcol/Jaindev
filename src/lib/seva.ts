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

function firstSunday(year: number, month: number): number {
  const first = weekday(year, month, 1);
  return first === 0 ? 1 : 1 + (7 - first);
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

/** Next Annadanam dates: first Sunday of each month, 12:30 PM India time. */
export function upcomingSevas(now = new Date(), count = 3): Civil[] {
  const here = kolkataParts(now);
  const out: Civil[] = [];
  let year = here.year;
  let month = here.month;
  for (let i = 0; i < 24 && out.length < count; i += 1) {
    const day = firstSunday(year, month);
    const past =
      year < here.year ||
      (year === here.year && month < here.month) ||
      (year === here.year && month === here.month && day < here.day);
    if (!past) out.push({ year, month, day });
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }
  return out;
}

export function sevaPhrase(day: Civil, now = new Date()): string {
  const here = kolkataParts(now);
  const nowMins = dayNumber(here.year, here.month, here.day) * 24 * 60 + here.hour * 60 + here.minute;
  const startMins = dayNumber(day.year, day.month, day.day) * 24 * 60 + 12 * 60 + 30;
  const diff = startMins - nowMins;
  if (here.year === day.year && here.month === day.month && here.day === day.day && diff <= 0) {
    return "Underway since 12:30 PM";
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
