import { useCallback, useEffect, useRef, useState } from "react";
import { listPayments, setPayment } from "@/lib/payments.functions";

export function usePayments() {
  const [marks, setMarks] = useState<Record<string, boolean>>({});
  const [paidAt, setPaidAt] = useState<Record<string, string | null>>({});
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const [writing, setWriting] = useState(false);
  const epoch = useRef(0);
  const pending = useRef(0);
  const loadedOnce = useRef(false);

  const load = useCallback(async () => {
    if (pending.current > 0) return;
    const seen = epoch.current;
    try {
      const rows = await listPayments();
      if (pending.current > 0 || seen !== epoch.current) return;
      const next: Record<string, boolean> = {};
      const times: Record<string, string | null> = {};
      for (const row of rows) {
        next[row.id] = row.paid;
        times[row.id] = row.paidAt;
      }
      setMarks(next);
      setPaidAt(times);
      loadedOnce.current = true;
      setError(false);
    } catch {
      if (pending.current > 0 || seen !== epoch.current) return;
      if (!loadedOnce.current) setError(true);
    } finally {
      if (seen === epoch.current) setReady(true);
    }
  }, []);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), 5000);
    const onFocus = () => void load();
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [load]);

  const mark = useCallback(async (id: string, next: boolean, pin: string) => {
    pending.current += 1;
    epoch.current += 1;
    setWriting(true);
    setMarks((current) => ({ ...current, [id]: next }));
    setPaidAt((current) => ({ ...current, [id]: next ? new Date().toISOString() : null }));
    try {
      const result = await setPayment({ data: { id, paid: next, pin } });
      if (!result.ok) {
        setMarks((current) => ({ ...current, [id]: !next }));
        setPaidAt((current) => ({ ...current, [id]: next ? null : current[id] ?? null }));
        return result;
      }
      if (result.paidAt !== undefined) {
        setPaidAt((current) => ({ ...current, [id]: result.paidAt }));
      }
      return result;
    } catch (error) {
      setMarks((current) => ({ ...current, [id]: !next }));
      setPaidAt((current) => ({ ...current, [id]: next ? null : current[id] ?? null }));
      throw error;
    } finally {
      pending.current -= 1;
      setWriting(false);
    }
  }, []);

  return { marks, paidAt, known: ready, error: ready && error, writing, mark };
}
