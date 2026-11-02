import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";
import { Mail, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { waLink } from "@/lib/company";
import { appreciationText, deliveryUpdateText, nextDeliveryStage, parseTracking } from "@/lib/booking";
import { NewsManager } from "@/components/NewsManager";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/admin")({
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
  const [mode, setMode] = useState<"in" | "up">("in");
  const [busy, setBusy] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email"));
    const password = String(f.get("password"));
    setBusy(true);
    const { error } =
      mode === "in"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/admin` } });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (mode === "up") toast.success("Check your email to confirm your account.");
  }
  return (
    <form onSubmit={onSubmit} className="mx-auto mt-20 max-w-sm space-y-4 rounded-2xl border bg-card p-8 shadow-lift">
      <h1 className="font-display text-2xl">{mode === "in" ? "Staff sign in" : "Create staff account"}</h1>
      <div><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" required className="mt-1" /></div>
      <div><Label htmlFor="password">Password</Label><Input id="password" name="password" type="password" minLength={6} required className="mt-1" /></div>
      <Button type="submit" className="w-full" disabled={busy}>{mode === "in" ? "Sign in" : "Sign up"}</Button>
      <button type="button" className="w-full text-sm text-muted-foreground" onClick={() => setMode(mode === "in" ? "up" : "in")}>
        {mode === "in" ? "First time? Create an account" : "Have an account? Sign in"}
      </button>
    </form>
  );
}

type Booking = Tables<"bookings">;

function Dashboard() {
  const [rows, setRows] = useState<Booking[] | null>(null);
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
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="font-display text-3xl">Bookings</h1>
      {rows.length === 0 && <p className="mt-6 text-muted-foreground">No bookings yet — or your account isn't a staff admin.</p>}
      <div className="mt-6 grid gap-4">
        {rows.map((b) => (
          <div key={b.id} className="flex flex-wrap items-center gap-4 rounded-xl border bg-card p-5">
            <div className="min-w-48 flex-1">
              <p className="font-display">{b.origin} → {b.destination} <span className="text-sm text-muted-foreground">#{b.reference}</span></p>
              <p className="text-sm text-muted-foreground">{b.service} · {b.travel_date}{b.service === "Event hiring" ? ` · ${b.passengers} people` : ""}</p>
              <p className="text-sm">{b.full_name.endsWith(" request") ? "" : `${b.full_name} · `}{b.phone} · {b.email}</p>
              {b.notes && <p className="mt-1 text-sm italic text-muted-foreground">{b.notes}</p>}
              {b.item_photo && <ItemPhoto path={b.item_photo} />}
            </div>
            <Badge variant={b.status === "approved" ? "default" : b.status === "declined" ? "destructive" : b.status === "completed" ? "outline" : "secondary"}>{b.status}</Badge>
            {b.status === "pending" && (
              <div className="flex gap-2">
                <Button size="sm" onClick={() => setStatus(b, "approved")}>Approve</Button>
                <Button size="sm" variant="outline" onClick={() => setStatus(b, "declined")}>Decline</Button>
              </div>
            )}
            {b.service === "Delivery" && b.status !== "pending" && b.status !== "declined" && (
              <p className="w-full text-sm text-muted-foreground">Tracking: {parseTracking(b.tracking).map((t) => t.stage.replace("_", " ")).join(" → ") || "approved, waiting for pickup"}</p>
            )}
            {b.status === "approved" && (
              <div className="flex flex-wrap gap-2">
                {b.service === "Delivery" && (() => {
                  const next = nextDeliveryStage(parseTracking(b.tracking));
                  return next && <Button size="sm" onClick={() => advanceDelivery(b)}>Mark {next.label.toLowerCase()}</Button>;
                })()}
                {(b.service === "Event hiring" || b.service === "Private charter") && (
                  <Button size="sm" onClick={() => finishTrip(b)}>Mark finished</Button>
                )}
                <Button asChild size="sm" variant="whatsapp">
                  <a href={approvalMsg(b)} target="_blank" rel="noreferrer"><MessageCircle /> Send confirmation</a>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <a href={emailLink(b, "approved")}><Mail /> Email</a>
                </Button>
              </div>
            )}
            {b.status === "completed" && (
              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm" variant="whatsapp">
                  <a href={waLink(finalText(b), customerPhone(b))} target="_blank" rel="noreferrer"><MessageCircle /> Resend message</a>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <a href={emailLink(b, "completed")}><Mail /> Email</a>
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
      <NewsManager />
    </main>
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
