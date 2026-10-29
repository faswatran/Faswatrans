import { createFileRoute, Link } from "@tanstack/react-router";
import { Briefcase, Bus, MapPinned, Package, PartyPopper, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero, SiteLayout } from "@/components/SiteLayout";
import { HIACE_IMG } from "@/lib/fleet";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Our Services — FASWA Transport and Logistics Ltd" },
      { name: "description", content: "Staff booking, event hiring, passenger travel, cargo delivery and vehicle hire from FASWA." },
      { property: "og:title", content: "Our Services — FASWA Transport and Logistics" },
      { property: "og:description", content: "Staff transport, event hiring, travel and logistics across Nigeria." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Services,
});

const ITEMS = [
  { icon: Briefcase, title: "Staff booking", text: "Reliable daily or scheduled pickups and drop-offs for your employees, with dedicated drivers." },
  { icon: PartyPopper, title: "Event hiring", text: "Comfortable buses and cars for weddings, conferences, church programmes and excursions." },
  { icon: MapPinned, title: "Inter-state trip", text: "Safe, comfortable trips between states, with professional drivers and well-maintained vehicles." },
  { icon: Bus, title: "Passenger travel", text: "Air-conditioned coaches on major intercity routes across Nigeria." },
  { icon: Package, title: "Goods & cargo delivery", text: "Safe, tracked movement of parcels and goods between cities." },
  { icon: Truck, title: "Vehicle hire", text: "Charter a vehicle with a professional driver for any trip." },
];

function Services() {
  return (
    <SiteLayout>
      <PageHero image={HIACE_IMG} eyebrow="Services" title="What we do" text="From daily staff transport to big events and deliveries, FASWA keeps you moving." />
      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-16 sm:grid-cols-2 lg:grid-cols-3">
        {ITEMS.map((s) => (
          <div key={s.title} className="rounded-2xl border bg-card p-6">
            <s.icon className="h-8 w-8 text-accent" />
            <h3 className="mt-4 font-display text-lg">{s.title}</h3>
            <p className="mt-2 text-muted-foreground">{s.text}</p>
          </div>
        ))}
      </section>
      <div className="pb-20 text-center">
        <Button asChild size="lg"><Link to="/booking">Book a service</Link></Button>
      </div>
    </SiteLayout>
  );
}
