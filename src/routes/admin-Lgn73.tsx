import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";
import { ChevronDown, Mail, MessageCircle, Search } from "lucide-react";
import { InvestorManager } from "@/components/InvestorManager";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { waLink } from "@/lib/company";
import { appreciationText, deliveryUpdateText, nextDeliveryStage, orderGroup, parseTracking, pickupTimeFromNotes, type OrderGroup } from "@/lib/booking";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NewsManager } from "@/components/NewsManager";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/admin-Lgn73")({
  head: () => ({
    meta: [
      { title: "Staff dashboard — FASWA Transportation" },
      { name: "description", content: "Review and approve customer bookings." },
      { property: "og:title", content: "Staff dashboard — FASWA Transportation" },
      { property: "og:description", content: "Review and approve customer bookings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  if (!ready) return null;
  return (
    <div className="min-h-screen bg-background font-sans">
      <header className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="font-display text-lg">FASWA<span className="text-accent">.</span> Staff</Link>
          {user && <Button variant="secondary" size="sm" onClick={() => supabase.auth.signOut()}>Sign out</Button>}
        </div>
      </header>
      {user ? <Dashboard /> : <AuthForm />}
    </div>
  );
}

function AuthForm() {
  const [busy, setBusy] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: String(f.get("email")), password: String(f.get("password")) });
    setBusy(false);
    if (error) toast.error(error.message);
  }
  return (
    <form onSubmit={onSubmit} className="mx-auto mt-20 max-w-sm space-y-4 rounded-2xl border bg-card p-8 shadow-lift">
      <h1 className="font-display text-2xl">Staff sign in</h1>
      <div><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" required className="mt-1" /></div>
      <div><Label htmlFor="password">Password</Label><Input id="password" name="password" type="password" minLength={6} required className="mt-1" /></div>
      <Button type="submit" className="w-full" disabled={busy}>Sign in</Button>
    </form>
  );
}

type Booking = Tables<"bookings">;

const SERVICE_TABS = [
  { key: "Staff booking", label: "Staff orders" },
  { key: "Event hiring", label: "Event orders" },
  { key: "Private charter", label: "Private orders" },
  { key: "Delivery", label: "Delivery orders" },
] as const;


function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" });
}
function fmtPickup(b: Booking) {
  const date = new Date(`${b.travel_date}T00:00`).toLocaleDateString("en-NG", { dateStyle: "medium" });
  const time = pickupTimeFromNotes(b.notes);
  return time ? `${date}, ${time}` : date;
}

function Dashboard() {
  const [rows, setRows] = useState<Booking[] | null>(null);
  const [query, setQuery] = useState("");
  const load = useCallback(async () => {
    const { data, error } = await supabase.from("bookings").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows(data ?? []);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function setStatus(b: Booking, status: "approved" | "declined") {
    const { error } = await supabase
      .from("bookings")
      .update({ status, approved_at: status === "approved" ? new Date().toISOString() : null })
      .eq("id", b.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Booking ${b.reference} ${status}`);
    if (status === "approved") window.open(approvalMsg(b), "_blank");
    load();
  }

  async function advanceDelivery(b: Booking) {
    const tracking = parseTracking(b.tracking);
    const next = nextDeliveryStage(tracking);
    if (!next) return;
    const now = new Date().toISOString();
    const done = next.key === "delivered";
    const { error } = await supabase
      .from("bookings")
      .update({ tracking: [...tracking, { stage: next.key, at: now }], ...(done ? { status: "completed", completed_at: now } : {}) })
      .eq("id", b.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Delivery ${b.reference}: ${next.label}`);
    window.open(waLink(deliveryUpdateText(next.key, b.reference, trackUrl(b)), customerPhone(b)), "_blank");
    load();
  }

  async function finishTrip(b: Booking) {
    const { error } = await supabase
      .from("bookings")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", b.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Booking ${b.reference} finished`);
    window.open(waLink(appreciationText(b.service, b.reference), customerPhone(b)), "_blank");
    load();
  }

  if (!rows) return <p className="p-10 text-center text-muted-foreground">Loading…</p>;
  const count = (service: string | null, group?: OrderGroup) =>
    rows.filter((b) => (!service || b.service === service) && (!group || orderGroup(b.status) === group)).length;
  const actions = { onStatus: setStatus, onAdvance: advanceDelivery, onFinish: finishTrip };

  const q = query.trim().toLowerCase();
  const results = q
    ? rows.filter((b) =>
        [b.reference, b.full_name, b.phone, b.email, b.origin, b.destination, b.service, b.status, b.notes ?? ""]
          .some((v) => v.toLowerCase().includes(q)),
      )
    : [];

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <Tabs defaultValue="orders">
        <TabsList className="h-auto">
          <TabsTrigger value="orders" className="px-5 py-2 text-base">Orders</TabsTrigger>
          <TabsTrigger value="news" className="px-5 py-2 text-base">News</TabsTrigger>
          <TabsTrigger value="investors" className="px-5 py-2 text-base">Investors</TabsTrigger>
        </TabsList>

        <TabsContent value="news" className="mt-2"><NewsManager /></TabsContent>
        <TabsContent value="investors" className="mt-2"><InvestorManager /></TabsContent>

        <TabsContent value="orders" className="mt-8">
      <h1 className="font-display text-3xl">Orders</h1>
      {rows.length === 0 && <p className="mt-6 text-muted-foreground">No bookings yet — or your account isn't a staff admin.</p>}
      <div className="relative mt-6">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search all orders — booking code, name, phone, email, place…"
          className="pl-9"
          aria-label="Search orders"
        />
      </div>
      {q ? (
        <section className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl">Search results <span className="text-base text-muted-foreground">({results.length})</span></h2>
            <Button size="sm" variant="ghost" onClick={() => setQuery("")}>Clear search</Button>
          </div>
          <div className="mt-3">
            <OrderList items={results} empty="No orders match your search." showService {...actions} />
          </div>
        </section>
      ) : (<>
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        {SERVICE_TABS.map((t) => (
          <div key={t.key} className="rounded-xl border bg-card p-4">
            <p className="text-sm text-muted-foreground">{t.label}</p>
            <p className="font-display text-2xl">{count(t.key, "pending")} <span className="text-sm font-sans text-muted-foreground">new</span></p>
            <p className="text-xs text-muted-foreground">{count(t.key, "active")} pending</p>
          </div>
        ))}
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Finished orders</p>
          <p className="font-display text-2xl">{count(null, "finished")}</p>
          <p className="text-xs text-muted-foreground">all services</p>
        </div>
      </div>

      <Tabs defaultValue="Staff booking" className="mt-8">
        <TabsList className="flex h-auto flex-wrap justify-start">
          {SERVICE_TABS.map((t) => (
            <TabsTrigger key={t.key} value={t.key} className="gap-2">
              {t.label}
              {count(t.key, "pending") > 0 && <Badge variant="destructive" className="px-1.5 py-0 text-xs">{count(t.key, "pending")}</Badge>}
            </TabsTrigger>
          ))}
          <TabsTrigger value="finished">Finished orders</TabsTrigger>
        </TabsList>

        {SERVICE_TABS.map((t) => {
          const list = rows.filter((b) => b.service === t.key);
          const groups = SECTIONS.filter((g) => g.key !== "declined" || list.some((b) => orderGroup(b.status) === "declined"));
          return (
            <TabsContent key={t.key} value={t.key} className="mt-6">
              <Tabs defaultValue="pending">
                <TabsList>
                  {groups.map((g) => (
                    <TabsTrigger key={g.key} value={g.key}>{g.title} ({list.filter((b) => orderGroup(b.status) === g.key).length})</TabsTrigger>
                  ))}
                </TabsList>
                {groups.map((g) => (
                  <TabsContent key={g.key} value={g.key} className="mt-4">
                    <OrderList items={list.filter((b) => orderGroup(b.status) === g.key)} empty={g.empty} {...actions} />
                  </TabsContent>
                ))}
              </Tabs>
            </TabsContent>
          );
        })}

        <TabsContent value="finished" className="mt-6">
          <h2 className="font-display text-xl">Finished orders</h2>
          <Tabs defaultValue="Staff booking" className="mt-3">
            <TabsList className="flex h-auto flex-wrap justify-start">
              {SERVICE_TABS.map((t) => (
                <TabsTrigger key={t.key} value={t.key}>{t.label.replace(" orders", "")} ({count(t.key, "finished")})</TabsTrigger>
              ))}
            </TabsList>
            {SERVICE_TABS.map((t) => (
              <TabsContent key={t.key} value={t.key} className="mt-4">
                <OrderList
                  items={rows.filter((b) => b.service === t.key && orderGroup(b.status) === "finished")}
                  empty={`No finished ${t.label.toLowerCase()} yet.`}
                  {...actions}
                />
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>
      </Tabs>
      </>)}
        </TabsContent>
      </Tabs>
    </main>
  );
}

const SECTIONS: { key: OrderGroup; title: string; empty: string }[] = [
  { key: "pending", title: "New orders", empty: "No new orders waiting for approval." },
  { key: "active", title: "Pending orders", empty: "No approved orders in progress." },
  { key: "declined", title: "Declined", empty: "No declined orders." },
];

type Actions = {
  onStatus: (b: Booking, s: "approved" | "declined") => void;
  onAdvance: (b: Booking) => void;
  onFinish: (b: Booking) => void;
};

function OrderList({ items, empty, showService, ...actions }: { items: Booking[]; empty: string; showService?: boolean } & Actions) {
  if (items.length === 0) return <p className="text-sm text-muted-foreground">{empty}</p>;
  return (
    <div className="divide-y rounded-xl border bg-card">
      {items.map((b) => <OrderRow key={b.id} b={b} showService={showService} {...actions} />)}
    </div>
  );
}

function OrderRow({ b, showService, onStatus, onAdvance, onFinish }: { b: Booking; showService?: boolean } & Actions) {
  const next = b.service === "Delivery" && b.status === "approved" ? nextDeliveryStage(parseTracking(b.tracking)) : null;
  return (
    <Collapsible className="p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-48 flex-1">
          <p className="font-display">#{b.reference} <span className="font-sans text-sm text-muted-foreground">{b.origin}{b.destination !== "To be confirmed" ? ` → ${b.destination}` : ""}</span></p>
          <p className="text-xs text-muted-foreground">
            {showService && <span className="font-semibold text-foreground">{b.service} · </span>}
            Ordered {fmtDateTime(b.created_at)} · Pickup {fmtPickup(b)}
            {b.completed_at && ` · Finished ${fmtDateTime(b.completed_at)}`}
          </p>
        </div>
        <Badge variant={b.status === "approved" ? "default" : b.status === "declined" ? "destructive" : b.status === "completed" ? "outline" : "secondary"}>
          {b.status === "approved" ? "in progress" : b.status === "pending" ? "new" : b.status}
        </Badge>
        {b.status === "pending" && (
          <>
            <Button size="sm" onClick={() => onStatus(b, "approved")}>Approve</Button>
            <Button size="sm" variant="outline" onClick={() => onStatus(b, "declined")}>Decline</Button>
          </>
        )}
        {next && <Button size="sm" onClick={() => onAdvance(b)}>Mark {next.label.toLowerCase()}</Button>}
        {b.status === "approved" && (b.service === "Event hiring" || b.service === "Private charter") && (
          <Button size="sm" onClick={() => onFinish(b)}>Mark finished</Button>
        )}
        <CollapsibleTrigger asChild>
          <Button size="sm" variant="ghost" className="group">
            Details <ChevronDown className="transition-transform group-data-[state=open]:rotate-180" />
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="mt-3 space-y-1 rounded-lg bg-muted p-3 text-sm">
        <p>{b.full_name.endsWith(" request") ? "" : `${b.full_name} · `}{b.phone} · {b.email}</p>
        {b.service === "Event hiring" && <p className="text-muted-foreground">{b.passengers} people</p>}
        {b.notes && <p className="whitespace-pre-line italic text-muted-foreground">{b.notes}</p>}
        {b.service === "Delivery" && b.status !== "pending" && b.status !== "declined" && (
          <p className="text-muted-foreground">Tracking: {parseTracking(b.tracking).map((t) => t.stage.replace("_", " ")).join(" → ") || "approved, waiting for pickup"}</p>
        )}
        {b.item_photo && <ItemPhoto path={b.item_photo} />}
        {(b.status === "approved" || b.status === "completed") && (
          <div className="flex flex-wrap gap-2 pt-2">
            <Button asChild size="sm" variant="whatsapp">
              <a href={b.status === "approved" ? approvalMsg(b) : waLink(finalText(b), customerPhone(b))} target="_blank" rel="noreferrer">
                <MessageCircle /> {b.status === "approved" ? "Send confirmation" : "Resend message"}
              </a>
            </Button>
            <Button asChild size="sm" variant="outline">
              <a href={emailLink(b, b.status === "approved" ? "approved" : "completed")}><Mail /> Email</a>
            </Button>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

function customerPhone(b: Booking) {
  return b.phone.replace(/\D/g, "").replace(/^0/, "234");
}

function trackUrl(b: Booking) {
  return `${window.location.origin}/track?code=${b.reference}`;
}

function finalText(b: Booking) {
  return b.service === "Delivery" ? deliveryUpdateText("delivered", b.reference, trackUrl(b)) : appreciationText(b.service, b.reference);
}

function emailLink(b: Booking, kind: "approved" | "completed") {
  const subject = kind === "approved" ? `Your FASWA booking #${b.reference} is approved` : `Thank you — FASWA booking #${b.reference}`;
  const body = kind === "approved"
    ? `Hello, your FASWA booking #${b.reference} has been APPROVED.${b.service === "Delivery" ? ` Track your delivery here: ${trackUrl(b)}` : ""}`
    : finalText(b);
  return `mailto:${b.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function approvalMsg(b: Booking) {
  const phone = customerPhone(b);
  const greeting = b.full_name.endsWith(" request") ? "Hello" : `Hello ${b.full_name}`;
  const journey = b.destination === "To be confirmed" ? `pickup at ${b.origin}` : `${b.origin} → ${b.destination}`;
  return waLink(
    `${greeting}, your FASWA booking #${b.reference} (${journey} on ${b.travel_date}) has been APPROVED.${b.service === "Delivery" ? ` Track your delivery with code ${b.reference}: ${trackUrl(b)}` : ""} Thank you for choosing FASWA Transportation!`,
    phone,
  );
}

function ItemPhoto({ path }: { path: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    supabase.storage.from("delivery-photos").createSignedUrl(path, 3600).then(({ data }) => setUrl(data?.signedUrl ?? null));
  }, [path]);
  if (!url) return null;
  return (
    <a href={url} target="_blank" rel="noreferrer" className="mt-2 inline-block">
      <img src={url} alt="Item to deliver" className="h-28 rounded-md border object-cover" />
    </a>
  );
}
