import { createFileRoute } from "@tanstack/react-router";
import { Clock, ShieldCheck, Target, Telescope, Users, Wallet } from "lucide-react";
import logo from "@/assets/faswa-logo-2.jpg.asset.json";
import { PageHero, SiteLayout } from "@/components/SiteLayout";
import { FLEET } from "@/lib/fleet";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — FASWA Transport and Logistics Ltd" },
      { name: "description", content: "FASWA means Fast & Affordable, Safe Ways Always. Learn about our mission, vision and values." },
      { property: "og:title", content: "About FASWA Transport and Logistics Ltd" },
      { property: "og:description", content: "Building a trusted transportation and logistics network in Nigeria." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: About,
});

function About() {
  return (
    <SiteLayout>
      <PageHero image={FLEET[1].img} eyebrow="About us" title="Building better ways to move" text="FASWA Transport & Logistics Ltd was created around a simple idea: people and businesses deserve better ways to move." />
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-[1fr_1.5fr]">
        <img src={logo.url} alt="FASWA logo" className="mx-auto w-56" />
        <div className="space-y-4 text-lg text-muted-foreground">
          <h2 className="font-display text-3xl text-primary">What FASWA means</h2>
          <p><strong className="text-primary">Fast & Affordable, Safe Ways Always.</strong> Our name represents the principles we stand for.</p>
          <p>Transportation connects people to opportunities, businesses to customers, and communities to one another. We believe it should be fast, affordable, safe and accessible.</p>
        </div>
      </section>
      <section className="bg-secondary py-16">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 md:grid-cols-2">
          <div className="rounded-2xl bg-card p-8">
            <Target className="h-8 w-8 text-accent" />
            <h3 className="mt-4 font-display text-xl text-primary">Our mission</h3>
            <p className="mt-2 text-muted-foreground">To develop accessible, reliable, safe and technology-enabled transportation and logistics solutions that make it easier for people and businesses to move.</p>
          </div>
          <div className="rounded-2xl bg-primary p-8 text-primary-foreground">
            <Telescope className="h-8 w-8 text-accent" />
            <h3 className="mt-4 font-display text-xl">Our vision</h3>
            <p className="mt-2 opacity-85">To build a trusted network connecting people, businesses, drivers, vehicle owners and communities through innovative mobility solutions.</p>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-display text-3xl text-primary">Our values</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: ShieldCheck, title: "Safety first", text: "Responsible operations and customer safety at the centre." },
            { icon: Wallet, title: "Affordability", text: "Services that deliver real value." },
            { icon: Clock, title: "Speed", text: "Efficient journeys that respect your time." },
            { icon: Users, title: "Reliability", text: "A network people and businesses can trust." },
          ].map((v) => (
            <div key={v.title} className="rounded-2xl border bg-card p-6">
              <v.icon className="h-8 w-8 text-accent" />
              <h3 className="mt-4 font-display text-lg text-primary">{v.title}</h3>
              <p className="mt-2 text-muted-foreground">{v.text}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
