import { timingSafeEqual } from "node:crypto";

const ADMIN_PIN = "1985";

export function pinMatches(input: string): boolean {
  const given = Buffer.from(input.trim());
  const expected = Buffer.from(ADMIN_PIN);
  if (given.length !== expected.length) return false;
  return timingSafeEqual(given, expected);
}
