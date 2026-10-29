import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero, SiteLayout } from "@/components/SiteLayout";
import { COMPANY, waLink } from "@/lib/company";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — FASWA Transport and Logistics Ltd" },
      { name: "description", content: "Call, email or WhatsApp FASWA Transport and Logistics Ltd." },
      { property: "og:title", content: "Contact FASWA Transport and Logistics" },
      { property: "og:description", content: "Reach our team by phone, email or WhatsApp." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Contact,
});

function Contact() {
  const items = [
    { icon: Phone, label: "Phone", value: COMPANY.phoneDisplay, href: `tel:${COMPANY.phoneDisplay.replace(/\s/g, "")}` },
    { icon: Mail, label: "Email", value: COMPANY.email, href: `mailto:${COMPANY.email}` },
    { icon: MapPin, label: "Office", value: COMPANY.address },
  ];
  return (
    <SiteLayout>
      <PageHero eyebrow="Contact us" title="We're here to help" text="Questions, quotes or special requests — reach us any way you like." />
      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-16 md:grid-cols-3">
        {items.map((i) => (
          <div key={i.label} className="rounded-2xl border bg-card p-6">
            <i.icon className="h-7 w-7 text-accent" />
            <p className="mt-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">{i.label}</p>
            {i.href ? <a href={i.href} className="mt-1 block font-display text-lg text-primary">{i.value}</a> : <p className="mt-1 font-display text-lg text-primary">{i.value}</p>}
          </div>
        ))}
      </section>
      <div className="pb-20 text-center">
        <Button asChild size="lg" variant="whatsapp">
          <a href={waLink("Hello FASWA, I'd like to make an enquiry.")} target="_blank" rel="noreferrer"><MessageCircle /> Chat on WhatsApp</a>
        </Button>
      </div>
    </SiteLayout>
  );
}
