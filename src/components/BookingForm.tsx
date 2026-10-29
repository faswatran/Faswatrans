import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createBooking } from "@/lib/site.functions";
import { SERVICES, waLink } from "@/lib/company";

type Service = (typeof SERVICES)[number];

export function BookingForm({ service }: { service: Service }) {
  const submit = useServerFn(createBooking);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const isEvent = service === "Event hiring";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    try {
      const extra = isEvent ? `Event: ${f.get("event_type") || "-"}` : `Company: ${f.get("company") || "-"}`;
      const notes = [extra, String(f.get("notes") || "")].filter(Boolean).join("\n");
      const res = await submit({
        data: {
          service,
          full_name: String(f.get("full_name")),
          email: String(f.get("email")),
          phone: String(f.get("phone")),
          origin: String(f.get("origin")),
          destination: String(f.get("destination")),
          travel_date: String(f.get("travel_date")),
          passengers: Number(f.get("passengers") || 1),
          notes: notes.slice(0, 500),
        },
      });
      setDone(res.reference);
    } catch {
      toast.error("Please check your details and try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done)
    return (
      <div className="rounded-2xl border bg-card p-10 text-center shadow-lift">
        <CheckCircle2 className="mx-auto h-12 w-12 text-accent" />
        <h3 className="mt-4 font-display text-2xl">Booking received!</h3>
        <p className="mt-2 text-muted-foreground">Your reference is</p>
        <p className="mt-1 font-display text-3xl text-primary">{done}</p>
        <p className="mt-4 text-muted-foreground">We'll contact you once it's approved.</p>
        <Button asChild variant="whatsapp" className="mt-6">
          <a href={waLink(`Hello FASWA, I just booked. My reference is ${done}.`)} target="_blank" rel="noreferrer">Follow up on WhatsApp</a>
        </Button>
      </div>
    );

  const today = new Date().toISOString().slice(0, 10);
  return (
    <form key={service} onSubmit={onSubmit} className="grid gap-4 rounded-2xl border bg-card p-6 shadow-lift sm:grid-cols-2">
      <Field name="full_name" label="Full name" />
      <Field name="phone" label="Phone (WhatsApp)" type="tel" />
      <Field name="email" label="Email" type="email" />
      {isEvent ? (
        <Field name="event_type" label="Type of event" placeholder="e.g. Wedding, conference" required={false} />
      ) : (
        <Field name="company" label="Company / organisation" required={false} />
      )}
      <Field name="origin" label={isEvent ? "Pickup location" : "From"} placeholder="e.g. Lagos" />
      <Field name="destination" label={isEvent ? "Event venue" : "To"} placeholder="e.g. Abuja" />
      <Field name="travel_date" label={isEvent ? "Event date" : "Date"} type="date" min={today} />
      <Field name="passengers" label={isEvent ? "Number of guests" : "Number of staff"} type="number" min={1} defaultValue={1} />
      <div className="sm:col-span-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea id="notes" name="notes" maxLength={400} className="mt-1" placeholder={isEvent ? "Vehicle type, hours needed…" : "Daily pickup times, number of trips…"} />
      </div>
      <Button type="submit" size="lg" disabled={busy} className="sm:col-span-2">{busy ? "Sending…" : `Request ${service.toLowerCase()}`}</Button>
    </form>
  );
}

function Field({ name, label, className, required = true, ...rest }: { name: string; label: string; className?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={className}>
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} required={required} className="mt-1" {...rest} />
    </div>
  );
}
