import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DeskGate, SanghApp } from "@/components/sangh-app";
import { checkPin } from "@/lib/payments.functions";

const DESK_KEY = "pww-annadanam-desk";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Sangh desk · Annadanam Jain Sangh" }],
  }),
  component: DeskPage,
});

function DeskPage() {
  const [pin, setPin] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    const saved = sessionStorage.getItem(DESK_KEY);
    if (!saved) {
      setPin(null);
      return;
    }
    let cancelled = false;
    checkPin({ data: { pin: saved } })
      .then((result) => {
        if (cancelled) return;
        if (result.ok) setPin(saved);
        else {
          sessionStorage.removeItem(DESK_KEY);
          setPin(null);
        }
      })
      .catch(() => {
        if (!cancelled) setPin(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (pin === undefined) {
    return (
      <main className="min-h-screen bg-background px-4 py-8 text-sm text-muted-foreground">
        Opening the sangh desk…
      </main>
    );
  }

  if (!pin) {
    return (
      <DeskGate
        onUnlock={(next) => {
          sessionStorage.setItem(DESK_KEY, next);
          setPin(next);
        }}
      />
    );
  }

  return (
    <SanghApp
      mode="desk"
      pin={pin}
      onLock={() => {
        sessionStorage.removeItem(DESK_KEY);
        setPin(null);
      }}
    />
  );
}
