import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { createBooking } from "@/lib/site.functions";
import { waLink } from "@/lib/company";
import type { BookingService } from "@/lib/booking";

export function BookingForm({ service }: { service: BookingService }) {
  const submit = useServerFn(createBooking);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [returnTrip, setReturnTrip] = useState(false);
  const isEvent = service === "Event hiring";
  const isCharter = service === "Private charter";
  const isDelivery = service === "Delivery";
  const hasPeople = isEvent || isCharter;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    try {
      const res = await submit({
        data: {
          service,
          email: String(f.get("email")),
          phone: String(f.get("phone")),
          origin: String(f.get("origin")),
          destination: isEvent ? undefined : String(f.get("destination")),
          pickup_at: String(f.get("pickup_at")),
          passengers: hasPeople ? Number(f.get("passengers")) : undefined,
          return_trip: hasPeople && returnTrip,
          items: isDelivery ? String(f.get("items")) : undefined,
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
      <div className="rounded-lg border bg-card p-6 text-center sm:p-10">
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

  const destLabel = isDelivery ? "Delivery address" : isCharter ? "Destination" : "Staff destination";
  return (
    <form key={service} onSubmit={onSubmit} className="grid gap-5 sm:grid-cols-2">
      <Field name="email" label="Email (Gmail or other)" type="email" autoComplete="email" placeholder="you@gmail.com" maxLength={200} />
      <Field name="phone" label="WhatsApp number" type="tel" autoComplete="tel" placeholder="e.g. +234 801 234 5678" minLength={7} maxLength={20} />
      <Field name="origin" label="Pickup location" placeholder="Street, area or landmark" minLength={2} maxLength={60} />
      <Field name="pickup_at" label="Pickup date & time" type="datetime-local" />
      {!isEvent && <Field name="destination" label={destLabel} placeholder={isDelivery ? "Where should we deliver?" : "Address or destination"} minLength={2} maxLength={60} className={hasPeople ? "" : "sm:col-span-2"} />}
      {isDelivery && <Field name="items" label="What are we delivering?" placeholder="e.g. 3 cartons, documents" minLength={2} maxLength={120} className="sm:col-span-2" />}
      {hasPeople && <>
        <Field name="passengers" label="Number of people" type="number" min={1} max={60} defaultValue={1} />
        <div className={`flex min-h-16 items-center gap-3 self-end rounded-md border border-input p-3 ${isCharter ? "sm:col-span-2" : ""}`}>
          <Checkbox id="return_trip" checked={returnTrip} onCheckedChange={(value) => setReturnTrip(value === true)} />
          <Label htmlFor="return_trip" className="cursor-pointer leading-5">Include the return journey</Label>
        </div>
      </>}
      <Button type="submit" size="lg" disabled={busy} className="mt-1 h-12 whitespace-normal sm:col-span-2">{busy ? "Sending…" : "Send booking request"}<ArrowRight /></Button>
    </form>
  );
}

function Field({ name, label, className, required = true, ...rest }: { name: string; label: string; className?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={className}>
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} required={required} className="mt-2 h-12 min-w-0 w-full" {...rest} />
    </div>
  );
}
