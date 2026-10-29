import { createFileRoute } from "@tanstack/react-router";
import { AtSign, Facebook, Instagram, Linkedin, Mail, MapPin, MessageCircle, Music2, Phone, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero, SiteLayout } from "@/components/SiteLayout";
import { COMPANY, SOCIALS, waLink } from "@/lib/company";
import { CAMRY_IMG } from "@/lib/fleet";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — FASWA Transport and Logistics Ltd" },
      { name: "description", content: "Reach FASWA by phone, WhatsApp, Gmail, X, Facebook, Instagram, Threads, LinkedIn or TikTok." },
      { property: "og:title", content: "Contact FASWA Transport and Logistics" },
      { property: "og:description", content: "Call, message or follow FASWA on social media." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Contact,
});

const ICONS = { x: Twitter, facebook: Facebook, instagram: Instagram, threads: AtSign, linkedin: Linkedin, tiktok: Music2, gmail: Mail } as const;

function Contact() {
  const items = [
    { icon: Phone, label: "Phone", value: COMPANY.phoneDisplay, href: `tel:${COMPANY.phoneDisplay.replace(/\s/g, "")}` },
    { icon: Mail, label: "Email", value: COMPANY.email, href: `mailto:${COMPANY.email}` },
    { icon: MapPin, label: "Office", value: COMPANY.address },
  ];
  return (
    <SiteLayout>
      <PageHero image={CAMRY_IMG} eyebrow="Contact us" title="We're here to help" text="Questions, quotes or special requests — reach us any way you like." />
      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-16 md:grid-cols-3">
        {items.map((i) => (
          <div key={i.label} className="rounded-2xl border bg-card p-6">
            <i.icon className="h-7 w-7 text-accent" />
            <p className="mt-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">{i.label}</p>
            {i.href ? <a href={i.href} className="mt-1 block font-display text-lg text-primary">{i.value}</a> : <p className="mt-1 font-display text-lg text-primary">{i.value}</p>}
          </div>
        ))}
      </section>
      <section className="bg-secondary py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-display text-3xl text-primary">Connect with us</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SOCIALS.map((s) => {
              const Icon = ICONS[s.key];
              return (
                <a key={s.key} href={s.href} target="_blank" rel="noreferrer" className="flex items-center gap-4 rounded-2xl border bg-card p-5 transition hover:border-accent hover:shadow-lift">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"><Icon className="h-5 w-5" /></span>
                  <span className="min-w-0">
                    <span className="block font-display text-primary">{s.label}</span>
                    <span className="block truncate text-sm text-muted-foreground">{s.handle}</span>
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </section>
      <div className="py-16 text-center">
        <Button asChild size="lg" variant="whatsapp">
          <a href={waLink("Hello FASWA, I'd like to make an enquiry.")} target="_blank" rel="noreferrer"><MessageCircle /> Chat on WhatsApp</a>
        </Button>
      </div>
    </SiteLayout>
  );
}
