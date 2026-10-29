import { createFileRoute } from "@tanstack/react-router";
import { Clock, ShieldCheck, Users } from "lucide-react";
import logo from "@/assets/faswa-logo-2.jpg.asset.json";
import { PageHero, SiteLayout } from "@/components/SiteLayout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — FASWA Transport and Logistics Ltd" },
      { name: "description", content: "Learn about FASWA Transport and Logistics Ltd, a Nigerian transport and logistics company." },
      { property: "og:title", content: "About FASWA Transport and Logistics Ltd" },
      { property: "og:description", content: "Safe, reliable transport and logistics across Nigeria." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: About,
});

function About() {
  return (
    <SiteLayout>
      <PageHero eyebrow="About us" title="FASWA Transport and Logistics Ltd" text="A Nigerian company dedicated to safe, comfortable and dependable movement of people and goods." />
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-[1fr_1.5fr]">
        <img src={logo.url} alt="FASWA logo" className="mx-auto w-56" />
        <div className="space-y-4 text-lg text-muted-foreground">
          <p>We provide staff transport for businesses, vehicles for events, intercity passenger travel and goods delivery.</p>
          <p>Our drivers are trained and our vehicles are maintained so every trip is safe and on time.</p>
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-20 md:grid-cols-3">
        {[
          { icon: ShieldCheck, title: "Safety first", text: "Well-maintained vehicles and careful drivers." },
          { icon: Clock, title: "Punctual", text: "We respect your time on every trip." },
          { icon: Users, title: "Customer focused", text: "Friendly support whenever you need us." },
        ].map((v) => (
          <div key={v.title} className="rounded-2xl border bg-card p-6">
            <v.icon className="h-8 w-8 text-accent" />
            <h3 className="mt-4 font-display text-lg">{v.title}</h3>
            <p className="mt-2 text-muted-foreground">{v.text}</p>
          </div>
        ))}
      </section>
    </SiteLayout>
  );
}
