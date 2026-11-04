import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero, SiteLayout } from "@/components/SiteLayout";
import { SIENNA_IMG } from "@/lib/fleet";
import { waLink } from "@/lib/company";

export const Route = createFileRoute("/investor")({
  head: () => ({
    meta: [
      { title: "Investors — FASWA Transport and Logistics Ltd" },
      { name: "description", content: "Meet the investors supporting FASWA Transport and Logistics Ltd, and learn how to invest with us." },
      { property: "og:title", content: "Investors — FASWA Transport and Logistics" },
      { property: "og:description", content: "The people and partners investing in FASWA Transport and Logistics Ltd." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Investor,
});

type InvestorRow = Tables<"investors">;

function Investor() {
  const [investors, setInvestors] = useState<InvestorRow[]>([]);
  useEffect(() => {
    supabase.from("investors").select("*").order("created_at", { ascending: true })
      .then(({ data }) => setInvestors(data ?? []));
  }, []);
  return (
    <SiteLayout>
      <PageHero
        image={SIENNA_IMG}
        eyebrow="Investors"
        title="Our investors"
        text="The people and partners who believe in FASWA and are helping us build a better way to move."
      />
      <section className="mx-auto max-w-6xl px-6 py-16">
        {investors.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-2xl border bg-card p-10 text-center">
            <Handshake className="mx-auto h-10 w-10 text-accent" />
            <h2 className="mt-4 font-display text-2xl text-primary">Investor names will appear here</h2>
            <p className="mt-3 text-muted-foreground">
              As investors come on board, their names will be listed on this page in recognition of their support.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {investors.map((inv) => (
              <div key={inv.id} className="rounded-2xl border bg-card p-6 text-center">
                {inv.photo_url
                  ? <img src={inv.photo_url} alt={inv.name} loading="lazy" className="mx-auto h-28 w-28 rounded-full object-cover" />
                  : <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-secondary"><Handshake className="h-10 w-10 text-accent" /></div>}
                <h3 className="mt-4 font-display text-lg text-primary">{inv.name}</h3>
                {inv.message && <p className="mt-2 italic text-muted-foreground">“{inv.message}”</p>}
              </div>
            ))}
          </div>
        )}
      </section>
      <section className="bg-secondary py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-display text-3xl text-primary">Interested in investing?</h2>
          <p className="mt-4 text-muted-foreground">
            Talk to us about partnership and investment opportunities with FASWA Transport and Logistics Ltd.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" variant="whatsapp">
              <a href={waLink("Hello FASWA, I'm interested in investing.")} target="_blank" rel="noreferrer">WhatsApp us</a>
            </Button>
            <Button asChild size="lg" variant="outline"><Link to="/contact">Contact us</Link></Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
