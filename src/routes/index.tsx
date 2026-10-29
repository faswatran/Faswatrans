import { createFileRoute, Link } from "@tanstack/react-router";
import { Briefcase, MapPin, PartyPopper, Package } from "lucide-react";
import heroImg from "@/assets/hero-bus.jpg";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/SiteLayout";
import { ROUTES, waLink } from "@/lib/company";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FASWA Transport and Logistics Ltd — Travel, staff & event transport" },
      { name: "description", content: "Staff transport, event hiring, passenger travel and logistics across Nigeria. Book online with FASWA." },
      { property: "og:title", content: "FASWA Transport and Logistics Ltd" },
      { property: "og:description", content: "Reliable staff transport, event hiring and logistics across Nigeria." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <SiteLayout>
      <section className="relative min-h-[80vh] overflow-hidden">
        <img src={heroImg} alt="FASWA coach on the highway" width={1600} height={912} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="relative mx-auto flex min-h-[80vh] max-w-6xl flex-col justify-center px-6 text-on-dark">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-accent">Transport and Logistics · Nigeria</p>
          <h1 className="max-w-2xl font-display text-5xl leading-[1.05] md:text-7xl">Moving people and goods, on time.</h1>
          <p className="mt-6 max-w-lg text-lg opacity-90">Staff transport, event hiring, travel and deliveries, booked online in minutes.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="accent"><Link to="/booking">Book now</Link></Button>
            <Button asChild size="lg" variant="whatsapp">
              <a href={waLink("Hello FASWA, I'd like to make an enquiry.")} target="_blank" rel="noreferrer">WhatsApp us</a>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-20 md:grid-cols-3">
        {[
          { icon: Briefcase, title: "Staff booking", text: "Daily and scheduled transport for your company staff." },
          { icon: PartyPopper, title: "Event hiring", text: "Buses and vehicles for weddings, conferences and outings." },
          { icon: Package, title: "Logistics", text: "Send parcels and cargo safely between cities." },
        ].map((s) => (
          <div key={s.title} className="rounded-2xl border bg-card p-6">
            <s.icon className="h-8 w-8 text-accent" />
            <h3 className="mt-4 font-display text-lg">{s.title}</h3>
            <p className="mt-2 text-muted-foreground">{s.text}</p>
          </div>
        ))}
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
