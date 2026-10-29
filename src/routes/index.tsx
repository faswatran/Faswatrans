import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Briefcase, Clock, MapPin, Package, PartyPopper, ShieldCheck, Users, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/SiteLayout";
import { ROUTES, TAGLINE, waLink } from "@/lib/company";
import { FLEET } from "@/lib/fleet";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FASWA Transport and Logistics Ltd — Staff transport, event hiring & logistics" },
      { name: "description", content: "Staff booking, event hiring and logistics across Nigeria with Toyota Hiace, Sienna and Camry vehicles." },
      { property: "og:title", content: "FASWA Transport and Logistics Ltd" },
      { property: "og:description", content: "Fast & Affordable, Safe Ways Always. Book staff transport or event vehicles online." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [slide, setSlide] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % FLEET.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <SiteLayout>
      <section className="relative min-h-[85vh] overflow-hidden bg-primary">
        {FLEET.map((v, i) => (
          <img key={v.name} src={v.img} alt={v.name} className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${i === slide ? "opacity-100" : "opacity-0"}`} />
        ))}
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="relative mx-auto flex min-h-[85vh] max-w-6xl flex-col justify-center px-6 text-on-dark">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-accent">{TAGLINE}</p>
          <h1 className="max-w-2xl font-display text-5xl leading-[1.05] md:text-7xl">Moving People. Moving Businesses.</h1>
          <p className="mt-6 max-w-lg text-lg opacity-90">Staff transport, event hiring and logistics across Nigeria, booked online in minutes.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="accent"><Link to="/booking">Book now</Link></Button>
            <Button asChild size="lg" variant="whatsapp">
              <a href={waLink("Hello FASWA, I'd like to make an enquiry.")} target="_blank" rel="noreferrer">WhatsApp us</a>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-b bg-card">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 py-10 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Clock, t: "Fast", d: "We respect your time." },
            { icon: Wallet, t: "Affordable", d: "Real value on every trip." },
            { icon: ShieldCheck, t: "Safe", d: "Careful drivers, maintained vehicles." },
            { icon: Users, t: "Ways Always", d: "A network you can trust." },
          ].map((f) => (
            <div key={f.t} className="flex items-start gap-3">
              <f.icon className="mt-1 h-6 w-6 shrink-0 text-accent" />
              <div><p className="font-display text-primary">{f.t}</p><p className="text-sm text-muted-foreground">{f.d}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">What we do</p>
        <h2 className="mt-2 font-display text-3xl text-primary md:text-4xl">Our services</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { icon: Briefcase, title: "Staff booking", text: "Daily and scheduled transport for your company staff." },
            { icon: PartyPopper, title: "Event hiring", text: "Vehicles for weddings, conferences and outings." },
            { icon: Package, title: "Logistics", text: "Move parcels, documents and goods between cities." },
          ].map((s) => (
            <div key={s.title} className="rounded-2xl border bg-card p-6 transition hover:shadow-lift">
              <s.icon className="h-8 w-8 text-accent" />
              <h3 className="mt-4 font-display text-lg text-primary">{s.title}</h3>
              <p className="mt-2 text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-secondary py-20">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">Our fleet</p>
          <h2 className="mt-2 font-display text-3xl text-primary md:text-4xl">The right vehicle for every trip</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {FLEET.map((v) => (
              <div key={v.name} className="overflow-hidden rounded-2xl border bg-card">
                <img src={v.img} alt={v.name} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                <div className="p-6">
                  <h3 className="font-display text-xl text-primary">{v.name}</h3>
                  <p className="mt-1 text-sm font-semibold text-accent">{v.seats}</p>
                  <p className="mt-2 text-muted-foreground">{v.use}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-primary py-20 text-primary-foreground">
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
          <Button asChild size="lg" variant="accent" className="mt-10"><Link to="/booking">Start a booking</Link></Button>
        </div>
      </section>
    </SiteLayout>
  );
}
