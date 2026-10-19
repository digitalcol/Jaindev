import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { isFamilyId } from "@/lib/families";

function isPaidValue(value: boolean | string | number): boolean {
  return value === true || value === "t" || value === "true" || value === 1;
}

function asIso(value: unknown): string | null {
  if (value == null) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export const listPayments = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const sql = await Promise.race([
      getSql(),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("payments timed out")), 8000);
      }),
    ]);
    const rows = await sql<{
      family_id: string;
      paid: boolean | string | number;
      updated_at: Date | string | null;
    }>`
      select family_id, paid, updated_at from membership_payments
    `;
    return rows.map((row) => {
      const paid = isPaidValue(row.paid);
      return {
        id: row.family_id,
        paid,
        paidAt: paid ? asIso(row.updated_at) : null,
      };
    });
  } catch {
    return [];
  }
});

export const checkPin = createServerFn({ method: "POST" })
  .validator(z.object({ pin: z.string().min(1).max(80) }))
  .handler(async ({ data }) => {
    const { pinMatches } = await import("@/lib/admin-pin.server");
    const ok = pinMatches(data.pin);
    if (!ok) await new Promise((resolve) => setTimeout(resolve, 400));
    return { ok };
  });

export const setPayment = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.string(),
      paid: z.boolean(),
      pin: z.string().min(1).max(80),
    }),
  )
  .handler(async ({ data }) => {
    const { pinMatches } = await import("@/lib/admin-pin.server");
    if (!pinMatches(data.pin)) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      return { ok: false as const, reason: "pin" as const };
    }
    if (!isFamilyId(data.id)) return { ok: false as const, reason: "unknown" as const };
    const sql = await getSql();
    const paidAt = data.paid ? new Date().toISOString() : null;
    await sql`
      insert into membership_payments (family_id, paid, updated_at)
      values (${data.id}, ${data.paid}, now())
      on conflict (family_id) do update
      set paid = excluded.paid, updated_at = now()
    `;
    return { ok: true as const, id: data.id, paid: data.paid, paidAt };
  });
