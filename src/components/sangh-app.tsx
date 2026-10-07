import { Link } from "@tanstack/react-router";
import { Calendar, Check, Lock, Search, X } from "lucide-react";
import { type FormEvent, type ReactNode, useEffect, useId, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FAMILIES,
  TOWERS,
  familiesForTower,
  flatInTower,
  unlistedFamilies,
  type Family,
} from "@/lib/families";
import { checkPin } from "@/lib/payments.functions";
import {
  MEMBERSHIP_RUPEES,
  formatInr,
  formatSevaParts,
  sevaPhrase,
  upcomingSevas,
  type Civil,
} from "@/lib/seva";
import { usePayments } from "@/lib/use-payments";
import { cn } from "@/lib/utils";

type TowerFilter = number | "unlisted" | "all";
const LABELS = ["Next", "Following", "After that"] as const;

function towerTone(tower: number): string {
  if (tower === 1) return "bg-pitch text-primary-foreground";
  if (tower === 2) return "bg-mint text-foreground";
  if (tower === 3) return "bg-sun text-foreground";
  if (tower === 4) return "bg-peach text-foreground";
  return "bg-court text-foreground";
}

type StatusFilter = "all" | "paid" | "unpaid";

export function DeskGate({ onUnlock }: { onUnlock: (pin: string) => void }) {
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [rejected, setRejected] = useState(false);
  const fieldId = useId();

  async function submit(event: FormEvent) {
    event.preventDefault();
    const next = pin.trim();
    if (!next || busy) return;
    setBusy(true);
    setRejected(false);
    try {
      const result = await checkPin({ data: { pin: next } });
      if (result.ok) onUnlock(next);
      else setRejected(true);
    } catch {
      setRejected(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader mode="gate" />
      <main className="mx-auto w-full max-w-md px-4 py-6">
        <div className="overflow-hidden rounded-2xl bg-card">
          <div className="bg-sun px-6 py-5">
            <p className="text-sm font-medium">Jai Jinendra</p>
            <h1 className="mt-1 text-4xl">Sangh desk</h1>
          </div>
          <div className="p-6">
          <p className="text-sm text-muted-foreground">
            Only organisers can mark a family paid or unpaid. The public page stays open for everyone.
          </p>
          <form onSubmit={submit} className="mt-6 space-y-3">
          <label htmlFor={fieldId} className="block text-sm font-medium">
            Passcode
          </label>
          <Input
            id={fieldId}
            type="password"
            autoComplete="current-password"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            value={pin}
            onChange={(event) => {
              setPin(event.target.value);
              setRejected(false);
            }}
            required
          />
          {rejected ? (
            <p role="alert" className="text-sm text-due">
              That passcode is not right.
            </p>
          ) : null}
          <Button type="submit" disabled={busy || pin.trim().length === 0} className="w-full">
            {busy ? "Checking" : "Open desk"}
          </Button>
        </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export function SanghApp({
  mode,
  pin,
  onLock,
}: {
  mode: "public" | "desk";
  pin?: string;
  onLock?: () => void;
}) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader mode={mode} onLock={onLock} />
      <main className="mx-auto w-full max-w-5xl px-4 pt-4 pb-[max(4rem,env(safe-area-inset-bottom))]">
        <Intro mode={mode} />
        {mode === "public" ? <ScheduleCard /> : null}
        <Ledger mode={mode} pin={pin} onLock={onLock} />
        {mode === "desk" ? (
          <div className="mt-10">
            <ScheduleCard />
          </div>
        ) : null}
      </main>
    </div>
  );
}

function SiteHeader({ mode, onLock }: { mode: "public" | "desk" | "gate"; onLock?: () => void }) {
  return (
    <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex min-h-16 max-w-5xl items-center justify-between gap-2 px-4 py-2">
        <Link to="/" className="min-w-0">
          <span className="block text-lg font-semibold leading-tight sm:text-xl">Annadanam</span>
          <span className="block text-xs text-muted-foreground">Jain Sangh</span>
        </Link>
        {mode === "public" ? (
          <Link to="/admin" className={buttonVariants({ variant: "outline", size: "sm" })}>
            Sangh desk
          </Link>
        ) : (
          <span className="flex shrink-0 items-center gap-1">
            <Link to="/" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              Public
            </Link>
            {mode === "desk" ? (
              <Button type="button" variant="outline" size="sm" onClick={onLock} aria-label="Lock desk">
                <Lock className="size-4" aria-hidden />
                <span className="hidden sm:inline">Lock</span>
              </Button>
            ) : null}
          </span>
        )}
      </div>
    </header>
  );
}

function Intro({ mode }: { mode: "public" | "desk" }) {
  return (
    <section className="overflow-hidden rounded-2xl bg-pitch text-primary-foreground">
      <div className="px-5 py-6 sm:px-6">
      <p className="text-sm font-medium text-sun">Jai Jinendra</p>
      <h1 className="mt-1 text-3xl leading-tight sm:text-5xl">Annadanam Jain Sangh</h1>
      <p className="mt-3 max-w-xl text-base text-primary-foreground/85">
        {mode === "public"
          ? "Prestige West Woods. Jain food outside the Exit gate, on the first Sunday after Poonam every month, from 12:30 noon onwards."
          : "Tap a name to mark the ₹2,100 paid or unpaid. Everyone on the public page sees the same mark."}
      </p>
      </div>
    </section>
  );
}

function ScheduleCard() {
  const dates = useMemo(() => upcomingSevas(), []);
  const [phrase, setPhrase] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setPhrase(sevaPhrase(dates[0]));
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, [dates]);

  return (
    <section aria-label="Upcoming Annadanam" className="mt-4 overflow-hidden rounded-2xl bg-card">
      <div className="bg-mint px-5 py-4">
      <p className="flex items-center gap-2 text-sm font-medium">
        <Calendar className="size-4" aria-hidden />
        First Sunday after Poonam
      </p>
      <h2 className="mt-2 text-2xl">Upcoming seva</h2>
      <p className="mt-1 text-sm">12:30 noon onwards, outside the Exit gate.</p>
      </div>
      <div className="px-5 py-2">
      <p className="mt-1 min-h-5 text-sm font-medium tabular-nums">{phrase ?? "\u00a0"}</p>
      <ol className="mt-2 divide-y divide-border">
        {dates.map((day, index) => (
          <DateRow key={`${day.year}-${day.month}-${day.day}`} day={day} label={LABELS[index] ?? "Later"} lead={index === 0} />
        ))}
      </ol>
      </div>
    </section>
  );
}

function DateRow({ day, label, lead }: { day: Civil; label: string; lead: boolean }) {
  const parts = formatSevaParts(day);
  return (
    <li className="flex items-baseline justify-between gap-3 py-3">
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={lead ? "text-xl leading-tight sm:text-2xl" : "text-base"}>{parts.date}</p>
        <p className="text-sm text-muted-foreground">{parts.weekday}</p>
      </div>
      <p className="shrink-0 text-sm tabular-nums text-muted-foreground">12:30 noon</p>
    </li>
  );
}

function Ledger({
  mode,
  pin,
  onLock,
}: {
  mode: "public" | "desk";
  pin?: string;
  onLock?: () => void;
}) {
  const { marks, known, error, writing, mark } = usePayments();
  const [tower, setTower] = useState<TowerFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const searchId = useId();
  const q = query.trim().toLowerCase();

  const paidCount = known ? FAMILIES.filter((family) => marks[family.id] === true).length : null;
  const unpaidCount = paidCount === null ? null : FAMILIES.length - paidCount;
  const received = paidCount === null ? null : paidCount * MEMBERSHIP_RUPEES;
  const outstanding = unpaidCount === null ? null : unpaidCount * MEMBERSHIP_RUPEES;

  function stateOf(id: string): boolean | null {
    if (!known) return null;
    return marks[id] === true;
  }

  function matches(family: Family): boolean {
    if (q) {
      const blob = [
        family.name,
        family.note ?? "",
        ...family.flats.map(
          (item) => `${item.code} tower ${item.tower} floor ${item.floor} house ${item.house}`,
        ),
      ]
        .join(" ")
        .toLowerCase();
      if (!blob.includes(q)) return false;
    }
    const state = stateOf(family.id);
    if (known && status === "paid" && state !== true) return false;
    if (known && status === "unpaid" && state !== false) return false;
    return true;
  }

  function selectTower(next: TowerFilter) {
    setTower(next);
    if (next === "all") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.requestAnimationFrame(() => {
      document.getElementById(next === "unlisted" ? "tower-unlisted" : `tower-${next}`)?.scrollIntoView({
        behavior: reduce ? "auto" : "smooth",
        block: "start",
      });
    });
  }

  async function toggle(family: Family) {
    if (!pin || !known || writing) return;
    const next = marks[family.id] !== true;
    try {
      const result = await mark(family.id, next, pin);
      if (!result.ok) {
        if (result.reason === "pin") {
          toast("The desk passcode was rejected.");
          onLock?.();
          return;
        }
        toast("Could not save that change.");
        return;
      }
      toast(next ? `${family.name} marked paid` : `${family.name} marked unpaid`);
    } catch {
      toast("Could not save that change.");
    }
  }

  const towerSections = (tower === "all" ? [...TOWERS] : tower === "unlisted" ? [] : [tower]).map(
    (item) => ({
      id: `tower-${item}`,
      title: `Tower ${item}`,
      tower: item,
      families: familiesForTower(item).filter((family) => {
        if (!matches(family)) return false;
        if (tower === "all" && q && family.flats[0]?.tower !== item) return false;
        return true;
      }),
    }),
  );

  const showUnlisted = tower === "all" || tower === "unlisted";
  const unlisted = showUnlisted ? unlistedFamilies().filter(matches) : [];
  const shownIds = new Set<string>();
  for (const section of towerSections) {
    for (const family of section.families) shownIds.add(family.id);
  }
  for (const family of unlisted) shownIds.add(family.id);
  const visibleCount = shownIds.size;
  const nothing = visibleCount === 0;

  return (
    <section className="mt-8" aria-label="Membership register">
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Families" value={String(FAMILIES.length)} />
        <Stat label="Paid" value={paidCount === null ? "—" : String(paidCount)} />
        <Stat label="Unpaid" value={unpaidCount === null ? "—" : String(unpaidCount)} />
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <Stat label="Received" value={received === null ? "—" : formatInr(received)} />
        <Stat label="Still to come" value={outstanding === null ? "—" : formatInr(outstanding)} />
      </div>

      <div className="mt-4 max-w-2xl space-y-2">
        {paidCount !== null ? (
          <div
            className="h-1 overflow-hidden rounded-full bg-muted"
            role="meter"
            aria-valuemin={0}
            aria-valuemax={FAMILIES.length}
            aria-valuenow={paidCount}
            aria-label="Families who have paid"
          >
            <div
              className="h-full bg-primary"
              style={{ width: `${Math.round((paidCount / FAMILIES.length) * 100)}%` }}
            />
          </div>
        ) : null}
        <p className="text-sm text-muted-foreground">{formatInr(MEMBERSHIP_RUPEES)} a family.</p>
        {error ? (
          <p role="status" className="text-sm text-muted-foreground">
            Payment marks are not loading yet. The names below are still the full list.
          </p>
        ) : null}
      </div>

      <h2 className="mt-8 text-xl">By tower</h2>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {TOWERS.map((item) => {
          const list = familiesForTower(item);
          const paid = known ? list.filter((family) => marks[family.id] === true).length : null;
          const active = tower === item;
          return (
            <button
              key={item}
              type="button"
              aria-pressed={active}
              onClick={() => selectTower(active ? "all" : item)}
              className={cn(
                "tap min-h-11 overflow-hidden rounded-2xl bg-card text-left",
                active && "ring-2 ring-primary",
              )}
            >
              <span className={cn("block px-3 py-3", towerTone(item))}>
                <span className="text-sm font-medium">Tower {item}</span>
                <span className="mt-1 block text-3xl leading-none tabular-nums">{list.length}</span>
              </span>
              <span className="block px-3 py-2 text-xs leading-snug tabular-nums text-muted-foreground">
                {paid === null ? "Paid —" : `${paid} paid · ${list.length - paid} due`}
              </span>
            </button>
          );
        })}
      </div>

      {mode === "desk" ? (
      <div className="mt-8">
        <label htmlFor={searchId} className="sr-only">
          Search by name or flat
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            id={searchId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name or flat"
            className="pr-12 pl-12"
          />
          {query ? (
            <button
              type="button"
              className="tap absolute top-1/2 right-1 flex size-11 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground"
              onClick={() => setQuery("")}
              aria-label="Clear search"
            >
              <X className="size-4" aria-hidden />
            </button>
          ) : null}
        </div>
        <div className="chip-rail mt-3">
          <Chip pressed={tower === "all"} onClick={() => setTower("all")}>
            All towers
          </Chip>
          {TOWERS.map((item) => (
            <Chip key={item} pressed={tower === item} onClick={() => selectTower(item)}>
              Tower {item}
            </Chip>
          ))}
          <Chip pressed={tower === "unlisted"} onClick={() => selectTower("unlisted")}>
            No flat
          </Chip>
        </div>
        <div className="chip-rail mt-2">
          <Chip pressed={status === "all"} onClick={() => setStatus("all")}>
            All
          </Chip>
          <Chip pressed={status === "paid"} onClick={() => setStatus("paid")}>
            Paid
          </Chip>
          <Chip pressed={status === "unpaid"} onClick={() => setStatus("unpaid")}>
            Unpaid
          </Chip>
        </div>
      </div>
      ) : (
        <div className="chip-rail mt-8">
          <Chip pressed={tower === "all"} onClick={() => setTower("all")}>
            All towers
          </Chip>
          {TOWERS.map((item) => (
            <Chip key={item} pressed={tower === item} onClick={() => selectTower(item)}>
              Tower {item}
            </Chip>
          ))}
          <Chip pressed={tower === "unlisted"} onClick={() => selectTower("unlisted")}>
            No flat
          </Chip>
          <Chip pressed={status === "all"} onClick={() => setStatus("all")}>
            All
          </Chip>
          <Chip pressed={status === "paid"} onClick={() => setStatus("paid")}>
            Paid
          </Chip>
          <Chip pressed={status === "unpaid"} onClick={() => setStatus("unpaid")}>
            Unpaid
          </Chip>
        </div>
      )}

      <div className="mt-6">
        {towerSections.map((section) =>
          section.families.length === 0 && tower !== section.tower ? null : (
            <TowerBlock
              key={section.id}
              id={section.id}
              title={section.title}
              tower={section.tower}
              families={section.families}
              mode={mode}
              writing={writing}
              known={known}
              stateOf={stateOf}
              onToggle={toggle}
            />
          ),
        )}
        {showUnlisted && (unlisted.length > 0 || tower === "unlisted") ? (
          <section id="tower-unlisted" className="scroll-mt-20 mt-8">
            <h3 className="text-xl">Flat not listed</h3>
            {unlisted.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">No one in this view.</p>
            ) : (
              <FamilyTable
                families={unlisted}
                tower={null}
                mode={mode}
                stateOf={stateOf}
                disabled={!known || writing}
                onToggle={toggle}
              />
            )}
          </section>
        ) : null}
        {nothing ? <p className="mt-6 text-sm text-muted-foreground">No family matches that.</p> : null}
        {!nothing ? (
          <p className="mt-4 text-sm tabular-nums text-muted-foreground">{visibleCount} shown</p>
        ) : null}
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg leading-none tabular-nums sm:text-2xl">{value}</p>
    </div>
  );
}

function Chip({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "tap inline-flex h-11 shrink-0 items-center gap-1 rounded-full px-4 text-sm font-medium",
        pressed ? "bg-secondary text-secondary-foreground" : "bg-card text-foreground",
      )}
    >
      {pressed ? <Check className="size-4" aria-hidden /> : null}
      {children}
    </button>
  );
}

function TowerBlock({
  id,
  title,
  tower,
  families,
  mode,
  writing,
  known,
  stateOf,
  onToggle,
}: {
  id: string;
  title: string;
  tower: number;
  families: Family[];
  mode: "public" | "desk";
  writing: boolean;
  known: boolean;
  stateOf: (id: string) => boolean | null;
  onToggle: (family: Family) => void;
}) {
  const groups: { floor: number; families: Family[] }[] = [];
  for (const family of families) {
    const floor = flatInTower(family, tower)?.floor ?? family.flats[0]?.floor ?? 0;
    const last = groups[groups.length - 1];
    if (!last || last.floor !== floor) groups.push({ floor, families: [family] });
    else last.families.push(family);
  }

  return (
    <section id={id} className="scroll-mt-20 mt-8">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-xl">{title}</h3>
        <p className="text-sm tabular-nums text-muted-foreground">{families.length}</p>
      </div>
      {families.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">No one in this view.</p> : null}
      {groups.map((group) => (
        <div key={group.floor}>
          <h4 className="mt-4 text-sm font-medium text-muted-foreground">Floor {group.floor}</h4>
          <FamilyTable
            families={group.families}
            tower={tower}
            mode={mode}
            stateOf={stateOf}
            disabled={!known || writing}
            onToggle={onToggle}
          />
        </div>
      ))}
    </section>
  );
}

function FamilyTable({
  families,
  tower,
  mode,
  stateOf,
  disabled,
  onToggle,
}: {
  families: Family[];
  tower: number | null;
  mode: "public" | "desk";
  stateOf: (id: string) => boolean | null;
  disabled: boolean;
  onToggle: (family: Family) => void;
}) {
  return (
    <>
      <div className="mt-2 hidden overflow-hidden rounded-2xl bg-card md:block">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-muted text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-3 py-3 font-medium">Flat</th>
              <th className="px-3 py-3 font-medium">Tower</th>
              <th className="px-3 py-3 font-medium">Floor</th>
              <th className="px-3 py-3 font-medium">House</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {families.map((family) => (
              <FamilyTableRow
                key={family.id}
                family={family}
                tower={tower}
                mode={mode}
                state={stateOf(family.id)}
                disabled={disabled}
                onToggle={() => onToggle(family)}
              />
            ))}
          </tbody>
        </table>
      </div>
      <ul className="mt-2 space-y-2 md:hidden">
        {families.map((family) => (
          <FamilyCard
            key={family.id}
            family={family}
            tower={tower}
            mode={mode}
            state={stateOf(family.id)}
            disabled={disabled}
            onToggle={() => onToggle(family)}
          />
        ))}
      </ul>
    </>
  );
}

function flatsFor(family: Family, tower: number | null) {
  return [...family.flats].sort((a, b) => {
    if (tower === null) return 0;
    return Number(b.tower === tower) - Number(a.tower === tower);
  });
}

function FamilyTableRow({
  family,
  tower,
  mode,
  state,
  disabled,
  onToggle,
}: {
  family: Family;
  tower: number | null;
  mode: "public" | "desk";
  state: boolean | null;
  disabled: boolean;
  onToggle: () => void;
}) {
  const flats = flatsFor(family, tower);
  const cells = (
    <>
      <td className="px-4 py-3 font-medium">{family.name}</td>
      <td className="px-3 py-3 tabular-nums">
        {flats.length === 0 ? family.note ?? "—" : flats.map((item) => item.code).join(", ")}
      </td>
      <td className="px-3 py-3 tabular-nums">{flats.map((item) => item.tower).join(", ") || "—"}</td>
      <td className="px-3 py-3 tabular-nums">{flats.map((item) => item.floor).join(", ") || "—"}</td>
      <td className="px-3 py-3 tabular-nums">{flats.map((item) => item.house).join(", ") || "—"}</td>
      <td className="px-4 py-3">
        <StatusBadge state={state} />
      </td>
    </>
  );
  if (mode === "public") {
    return <tr className="border-t border-border">{cells}</tr>;
  }
  return (
    <tr
      className="tap cursor-pointer border-t border-border hover:bg-accent disabled:opacity-60"
      onClick={disabled ? undefined : onToggle}
      aria-disabled={disabled}
    >
      {cells}
    </tr>
  );
}

function FamilyCard({
  family,
  tower,
  mode,
  state,
  disabled,
  onToggle,
}: {
  family: Family;
  tower: number | null;
  mode: "public" | "desk";
  state: boolean | null;
  disabled: boolean;
  onToggle: () => void;
}) {
  const flats = flatsFor(family, tower);
  const body = (
    <div className="grid grid-cols-2 gap-x-3 gap-y-2">
      <div className="col-span-2 flex items-start justify-between gap-3">
        <p className="min-w-0 text-base font-medium leading-snug">{family.name}</p>
        <StatusBadge state={state} />
      </div>
      {flats.length === 0 ? (
        <p className="col-span-2 text-sm text-muted-foreground">{family.note ?? "Flat not on the list"}</p>
      ) : (
        flats.map((item) => (
          <div key={item.code} className="col-span-2 grid grid-cols-4 gap-2 text-sm">
            <Cell label="Flat" value={item.code} />
            <Cell label="Tower" value={String(item.tower)} />
            <Cell label="Floor" value={String(item.floor)} />
            <Cell label="House" value={String(item.house)} />
          </div>
        ))
      )}
      {family.note && flats.length > 0 ? (
        <p className="col-span-2 text-sm text-muted-foreground">{family.note}</p>
      ) : null}
    </div>
  );
  if (mode === "public") return <li className="rounded-2xl bg-card px-4 py-3">{body}</li>;
  const label =
    state === null
      ? `${family.name}, payment still loading`
      : `${family.name}, ${state ? "paid" : "unpaid"}. Activate to switch.`;
  return (
    <li>
      <button
        type="button"
        className="tap w-full rounded-2xl bg-card px-4 py-3 text-left hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
        aria-pressed={state === true}
        aria-label={label}
        disabled={disabled}
        onClick={onToggle}
      >
        {body}
      </button>
    </li>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="tabular-nums font-medium">{value}</p>
    </div>
  );
}

function StatusBadge({ state }: { state: boolean | null }) {
  if (state === null) return <Badge tone="neutral">Checking</Badge>;
  if (state) {
    return (
      <Badge tone="paid">
        <Check className="size-3" aria-hidden />
        Paid
      </Badge>
    );
  }
  return <Badge tone="due">Unpaid</Badge>;
}
