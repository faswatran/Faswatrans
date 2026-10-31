import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Briefcase, Car, Package, PartyPopper } from "lucide-react";
import { BookingForm } from "@/components/BookingForm";
import { PageHero, SiteLayout } from "@/components/SiteLayout";
import { HIACE_IMG } from "@/lib/fleet";
import { Button } from "@/components/ui/button";

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
  { key: "Staff booking", icon: Briefcase, title: "Staff Booking" },
  { key: "Event hiring", icon: PartyPopper, title: "Event Hiring" },
  { key: "Private charter", icon: Car, title: "Private Charter" },
  { key: "Delivery", icon: Package, title: "Delivery" },
] as const;

function Booking() {
  const [choice, setChoice] = useState<(typeof OPTIONS)[number]["key"]>("Staff booking");
  return (
    <SiteLayout>
      <PageHero image={HIACE_IMG} eyebrow="Booking" title="Book with FASWA" text="Staff transport, events, private charters and deliveries." />
      <section className="mx-auto max-w-2xl px-6 py-10 sm:py-12">
        <div className="grid grid-cols-2 gap-2 border-b pb-5 sm:grid-cols-4">
          {OPTIONS.map((o) => {
            const active = choice === o.key;
            return (
              <Button
                key={o.key}
                type="button"
                onClick={() => setChoice(o.key)}
                variant={active ? "default" : "outline"}
                aria-pressed={active}
                className="h-12 gap-2 whitespace-normal px-2"
              >
                <o.icon />
                {o.title}
              </Button>
            );
          })}
        </div>
        <div className="mt-6">
          <BookingForm key={choice} service={choice} />
        </div>
      </section>
    </SiteLayout>
  );
}
