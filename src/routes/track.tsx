import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Check, Circle, Search, XCircle } from "lucide-react";
import { PageHero, SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HIACE_IMG } from "@/lib/fleet";
import { trackDelivery } from "@/lib/site.functions";
import { DELIVERY_STAGES } from "@/lib/booking";
import { waLink } from "@/lib/company";

export const Route = createFileRoute("/track")({
  validateSearch: z.object({ code: z.string().max(12).optional() }),
  head: () => ({
    meta: [
      { title: "Track Your Delivery — FASWA Transport and Logistics Ltd" },
      { name: "description", content: "Enter your FASWA booking code to see where your delivery is." },
      { property: "og:title", content: "Track Your FASWA Delivery" },
      { property: "og:description", content: "Check your delivery progress with your booking code." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TrackPage,
});

type Result = Awaited<ReturnType<typeof trackDelivery>>;

function fmt(at: string) {
  return new Date(at).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" });
}

function TrackPage() {
  const { code: initial } = Route.useSearch();
  const lookup = useServerFn(trackDelivery);
  const [code, setCode] = useState(initial ?? "");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function run(value: string) {
    if (value.trim().length < 4) return;
    setBusy(true);
    try {
      setResult(await lookup({ data: { code: value } }));
    } catch {
      toast.error("We couldn't check that code right now. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => { if (initial) run(initial); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <SiteLayout>
      <PageHero image={HIACE_IMG} eyebrow="Track" title="Track your delivery" text="Enter the booking code you received to see where your item is." />
      <section className="mx-auto max-w-xl px-6 py-10 sm:py-12">
        <form onSubmit={(e) => { e.preventDefault(); run(code); }} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Label htmlFor="code">Booking code</Label>
            <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. A1B2C3" maxLength={12} required className="mt-2 h-12 uppercase tracking-widest" />
          </div>
          <Button type="submit" size="lg" className="h-12" disabled={busy}><Search />{busy ? "Checking…" : "Track"}</Button>
        </form>

        {result && !result.found && (
          <div className="mt-8 rounded-lg border bg-card p-6 text-center">
            <p className="font-display text-xl">No delivery found</p>
            <p className="mt-2 text-muted-foreground">Check the code and try again, or ask our team on WhatsApp.</p>
            <Button asChild variant="whatsapp" className="mt-4"><a href={waLink(`Hello FASWA, I need help tracking my delivery ${code}.`)} target="_blank" rel="noreferrer">Chat on WhatsApp</a></Button>
          </div>
        )}

        {result?.found && (
          <div className="mt-8 rounded-lg border bg-card p-6">
            <p className="text-sm text-muted-foreground">Delivery</p>
            <p className="font-display text-3xl text-primary">#{result.reference}</p>
            <p className="mt-1 text-sm text-muted-foreground">Pickup date: {result.pickup_date}</p>
            {result.status === "declined" ? (
              <p className="mt-6 flex items-center gap-2 text-destructive"><XCircle className="h-5 w-5" />This booking was not accepted. Please contact us on WhatsApp.</p>
            ) : (
              <ol className="mt-6 space-y-4">
                <Step done label="Booking received" at={result.booked_at} />
                <Step done={!!result.approved_at} label="Approved" at={result.approved_at} />
                {DELIVERY_STAGES.map((s) => {
                  const hit = result.tracking.find((t) => t.stage === s.key);
                  return <Step key={s.key} done={!!hit} label={s.label} at={hit?.at ?? null} />;
                })}
              </ol>
            )}
          </div>
        )}
        <p className="mt-8 text-center text-sm text-muted-foreground">Need to send something? <Link to="/booking" className="text-primary underline">Book a delivery</Link></p>
      </section>
    </SiteLayout>
  );
}

function Step({ done, label, at }: { done: boolean; label: string; at: string | null }) {
  return (
    <li className="flex items-start gap-3">
      <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${done ? "bg-primary text-primary-foreground" : "border border-input text-muted-foreground"}`}>
        {done ? <Check className="h-4 w-4" /> : <Circle className="h-3 w-3" />}
      </span>
      <div>
        <p className={done ? "font-medium" : "text-muted-foreground"}>{label}</p>
        {done && at && <p className="text-sm text-muted-foreground">{fmt(at)}</p>}
      </div>
    </li>
  );
}
