import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { isFamilyId } from "@/lib/families";

function isPaidValue(value: boolean | string | number): boolean {
  return value === true || value === "t" || value === "true" || value === 1;
}

export const listPayments = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const rows = await sql<{ family_id: string; paid: boolean | string | number }>`
    select family_id, paid from membership_payments
  `;
  return rows.map((row) => ({
    id: row.family_id,
    paid: isPaidValue(row.paid),
  }));
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
    await sql`
      insert into membership_payments (family_id, paid)
      values (${data.id}, ${data.paid})
      on conflict (family_id) do update
      set paid = excluded.paid, updated_at = now()
    `;
    return { ok: true as const, id: data.id, paid: data.paid };
  });
