import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { CheckCircle2, MapPin, Package, ShieldCheck, Truck, Users } from "lucide-react";
import heroImg from "@/assets/hero-bus.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChatWidget } from "@/components/ChatWidget";
import { createBooking } from "@/lib/site.functions";
import { COMPANY, ROUTES, SERVICES, waLink } from "@/lib/company";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FASWA Transportation — Book your trip online" },
      { name: "description", content: "Book passenger seats, goods delivery and vehicle hire across Nigeria with FASWA Transportation." },
      { property: "og:title", content: "FASWA Transportation — Book your trip online" },
      { property: "og:description", content: "Safe, comfortable travel and cargo delivery across Nigeria. Book online in minutes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="font-sans">
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 text-on-dark">
          <span className="font-display text-xl tracking-wide">FASWA<span className="text-accent">.</span></span>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <a href="#routes" className="hidden sm:inline">Routes</a>
            <a href="#book" className="hidden sm:inline">Book</a>
            <Link to="/admin" className="opacity-80">Staff</Link>
          </nav>
        </div>
      </header>

      <section className="relative min-h-[88vh] overflow-hidden">
        <img src={heroImg} alt="FASWA coach on the highway" width={1600} height={912} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-center px-6 text-on-dark">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-accent">Across Nigeria, on time</p>
          <h1 className="max-w-2xl font-display text-5xl leading-[1.05] md:text-7xl">Your journey, booked in minutes.</h1>
          <p className="mt-6 max-w-lg text-lg opacity-90">Passenger seats, goods delivery and vehicle hire, with confirmation sent straight to you.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="accent"><a href="#book">Book now</a></Button>
            <Button asChild size="lg" variant="whatsapp">
              <a href={waLink("Hello FASWA, I'd like to make an enquiry.")} target="_blank" rel="noreferrer">WhatsApp us</a>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-20 md:grid-cols-3">
        {[
          { icon: Users, title: "Passenger travel", text: "Comfortable, air-conditioned coaches on major intercity routes." },
          { icon: Package, title: "Goods delivery", text: "Send parcels and cargo safely between cities." },
          { icon: Truck, title: "Vehicle hire", text: "Charter a bus for events, staff trips or family travel." },
        ].map((s) => (
          <div key={s.title} className="rounded-2xl border bg-card p-6">
            <s.icon className="h-8 w-8 text-primary" />
            <h3 className="mt-4 font-display text-lg">{s.title}</h3>
            <p className="mt-2 text-muted-foreground">{s.text}</p>
          </div>
        ))}
      </section>

      <section id="routes" className="bg-primary py-20 text-primary-foreground">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-display text-3xl md:text-4xl">Popular routes</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ROUTES.map((r) => (
              <div key={r.from + r.to} className="flex items-center justify-between rounded-xl border border-primary-foreground/20 p-5">
                <span className="flex items-center gap-2 font-semibold"><MapPin className="h-4 w-4 text-accent" />{r.from} → {r.to}</span>
                <span className="font-display text-accent">{r.price}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="book" className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <h2 className="font-display text-3xl md:text-4xl">Book your trip</h2>
          <p className="mt-4 text-muted-foreground">Send your request and our team will confirm it. You'll get a booking reference right away.</p>
          <ul className="mt-8 space-y-3">
            {["Instant booking reference", "Confirmation once approved", "Help any time on WhatsApp"].map((t) => (
              <li key={t} className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" />{t}</li>
            ))}
          </ul>
        </div>
        <BookingForm />
      </section>

      <footer className="border-t py-10 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} {COMPANY.name} · {COMPANY.phoneDisplay}
      </footer>
      <ChatWidget />
    </div>
  );
}

function BookingForm() {
  const submit = useServerFn(createBooking);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    try {
      const res = await submit({
        data: {
          service: f.get("service") as (typeof SERVICES)[number],
          full_name: String(f.get("full_name")),
          email: String(f.get("email")),
          phone: String(f.get("phone")),
          origin: String(f.get("origin")),
          destination: String(f.get("destination")),
          travel_date: String(f.get("travel_date")),
          passengers: Number(f.get("passengers") || 1),
          notes: String(f.get("notes") || "") || undefined,
        },
      });
      setDone(res.reference);
    } catch {
      toast.error("Please check your details and try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done)
    return (
      <div className="rounded-2xl border bg-card p-10 text-center shadow-lift">
        <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
        <h3 className="mt-4 font-display text-2xl">Booking received!</h3>
        <p className="mt-2 text-muted-foreground">Your reference is</p>
        <p className="mt-1 font-display text-3xl text-primary">{done}</p>
        <p className="mt-4 text-muted-foreground">We'll contact you once it's approved.</p>
        <Button asChild variant="whatsapp" className="mt-6">
          <a href={waLink(`Hello FASWA, I just booked. My reference is ${done}.`)} target="_blank" rel="noreferrer">Follow up on WhatsApp</a>
        </Button>
      </div>
    );

  const today = new Date().toISOString().slice(0, 10);
  return (
    <form onSubmit={onSubmit} className="grid gap-4 rounded-2xl border bg-card p-6 shadow-lift sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Label htmlFor="service">Service</Label>
        <select id="service" name="service" className="mt-1 h-9 w-full rounded-md border bg-background px-3 text-sm">
          {SERVICES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      <Field name="full_name" label="Full name" />
      <Field name="phone" label="Phone (WhatsApp)" type="tel" />
      <Field name="email" label="Email" type="email" className="sm:col-span-2" />
      <Field name="origin" label="From" placeholder="e.g. Lagos" />
      <Field name="destination" label="To" placeholder="e.g. Abuja" />
      <Field name="travel_date" label="Date" type="date" min={today} />
      <Field name="passengers" label="Passengers / items" type="number" min={1} defaultValue={1} />
      <div className="sm:col-span-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea id="notes" name="notes" maxLength={500} className="mt-1" />
      </div>
      <Button type="submit" size="lg" disabled={busy} className="sm:col-span-2">{busy ? "Sending…" : "Request booking"}</Button>
    </form>
  );
}

function Field({ name, label, className, ...rest }: { name: string; label: string; className?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={className}>
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} required className="mt-1" {...rest} />
    </div>
  );
}
