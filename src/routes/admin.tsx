import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";
import { MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { waLink } from "@/lib/company";
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
              <p className="text-sm text-muted-foreground">{b.service} · {b.travel_date} · {b.passengers} pax/items</p>
              <p className="text-sm">{b.full_name} · {b.phone} · {b.email}</p>
              {b.notes && <p className="mt-1 text-sm italic text-muted-foreground">{b.notes}</p>}
            </div>
            <Badge variant={b.status === "approved" ? "default" : b.status === "declined" ? "destructive" : "secondary"}>{b.status}</Badge>
            {b.status === "pending" && (
              <div className="flex gap-2">
                <Button size="sm" onClick={() => setStatus(b, "approved")}>Approve</Button>
                <Button size="sm" variant="outline" onClick={() => setStatus(b, "declined")}>Decline</Button>
              </div>
            )}
            {b.status === "approved" && (
              <Button asChild size="sm" variant="whatsapp">
                <a href={approvalMsg(b)} target="_blank" rel="noreferrer"><MessageCircle /> Send confirmation</a>
              </Button>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}

function approvalMsg(b: Booking) {
  const phone = b.phone.replace(/\D/g, "").replace(/^0/, "234");
  return waLink(
    `Hello ${b.full_name}, your FASWA booking #${b.reference} (${b.origin} → ${b.destination} on ${b.travel_date}) has been APPROVED. Thank you for choosing FASWA Transportation!`,
    phone,
  );
}
