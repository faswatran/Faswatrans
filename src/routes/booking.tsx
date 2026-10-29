import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Briefcase, PartyPopper } from "lucide-react";
import { BookingForm } from "@/components/BookingForm";
import { PageHero, SiteLayout } from "@/components/SiteLayout";
import { HIACE_IMG } from "@/lib/fleet";

export const Route = createFileRoute("/booking")({
  head: () => ({
    meta: [
      { title: "Book Online — FASWA Transport and Logistics Ltd" },
      { name: "description", content: "Book staff transport or hire vehicles for your event with FASWA." },
      { property: "og:title", content: "Book Staff Transport or Event Hiring — FASWA" },
      { property: "og:description", content: "Request staff booking or event hiring online and get a reference instantly." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Booking,
});

const OPTIONS = [
  { key: "Staff booking", icon: Briefcase, title: "Staff Booking", text: "Transport for your company staff." },
  { key: "Event hiring", icon: PartyPopper, title: "Event Hiring", text: "Vehicles for weddings, conferences and outings." },
] as const;

function Booking() {
  const [choice, setChoice] = useState<(typeof OPTIONS)[number]["key"]>("Staff booking");
  return (
    <SiteLayout>
      <PageHero image={HIACE_IMG} eyebrow="Booking" title="Book with FASWA" text="Choose what you need, send your request, and get a booking reference right away." />
      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="grid gap-4 sm:grid-cols-2">
          {OPTIONS.map((o) => {
            const active = choice === o.key;
            return (
              <button
                key={o.key}
                type="button"
                onClick={() => setChoice(o.key)}
                className={`rounded-2xl border-2 p-6 text-left transition ${active ? "border-accent bg-primary text-primary-foreground" : "bg-card hover:border-accent"}`}
              >
                <o.icon className="h-8 w-8 text-accent" />
                <h3 className="mt-3 font-display text-xl">{o.title}</h3>
                <p className={`mt-1 text-sm ${active ? "opacity-85" : "text-muted-foreground"}`}>{o.text}</p>
              </button>
            );
          })}
        </div>
        <div className="mt-8">
          <BookingForm key={choice} service={choice} />
        </div>
      </section>
    </SiteLayout>
  );
}
