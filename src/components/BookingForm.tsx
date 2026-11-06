import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Camera, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { createBooking } from "@/lib/site.functions";
import { waLink } from "@/lib/company";
import { CHARTER_VEHICLES, type BookingService } from "@/lib/booking";

export function BookingForm({ service }: { service: BookingService }) {
  const submit = useServerFn(createBooking);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [returnTrip, setReturnTrip] = useState(false);
  const isEvent = service === "Event hiring";
  const isCharter = service === "Private charter";
  const isDelivery = service === "Delivery";
  const hasReturn = isEvent || isCharter;
  const [photo, setPhoto] = useState<{ type: "image/jpeg"; data: string; preview: string } | null>(null);
  const [vehicle, setVehicle] = useState<(typeof CHARTER_VEHICLES)[number]>("Toyota Camry");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (isDelivery && !photo) {
      toast.error("Please add a photo of what you are sending.");
      return;
    }
    setBusy(true);
    try {
      const res = await submit({
        data: {
          service,
          full_name: String(f.get("full_name")),
          email: String(f.get("email")),
          phone: String(f.get("phone")),
          origin: String(f.get("origin")),
          destination: isEvent ? undefined : String(f.get("destination")),
          pickup_at: String(f.get("pickup_at")),
          passengers: isEvent ? Number(f.get("passengers")) : undefined,
          return_trip: hasReturn && returnTrip,
          vehicle: isCharter ? vehicle : undefined,
          photo: isDelivery && photo ? { type: photo.type, data: photo.data } : undefined,
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
        <p className="mt-4 text-muted-foreground">{isDelivery ? "Keep this code to track your delivery. We'll contact you once it's approved." : "We'll contact you once it's approved."}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {isDelivery && <Button asChild variant="outline"><Link to="/track" search={{ code: done }}>Track delivery</Link></Button>}
          <Button asChild variant="whatsapp">
            <a href={waLink(`Hello FASWA, I just booked. My reference is ${done}.`)} target="_blank" rel="noreferrer">Follow up on WhatsApp</a>
          </Button>
        </div>
      </div>
    );

  const destLabel = isDelivery ? "Delivery address" : isCharter ? "Destination" : "Staff destination";
  return (
    <form key={service} onSubmit={onSubmit} className="grid gap-5 sm:grid-cols-2">
      <Field name="full_name" label="Full name" autoComplete="name" placeholder="Enter your full name" minLength={2} maxLength={120} className="sm:col-span-2" />
      <Field name="email" label="Email (Gmail or other)" type="email" autoComplete="email" placeholder="you@gmail.com" maxLength={200} />
      <Field name="phone" label="WhatsApp number" type="tel" autoComplete="tel" placeholder="e.g. +234 801 234 5678" minLength={7} maxLength={20} />
      <Field name="origin" label="Pickup location" placeholder="Street, area or landmark" minLength={2} maxLength={60} />
      <Field name="pickup_at" label="Pickup date & time" type="datetime-local" />
      {!isEvent && <Field name="destination" label={destLabel} placeholder={isDelivery ? "Where should we deliver?" : "Address or destination"} minLength={2} maxLength={60} className={isEvent ? "" : "sm:col-span-2"} />}
      {isDelivery && <Field name="items" label="What are we delivering?" placeholder="e.g. 3 cartons, documents" minLength={2} maxLength={120} className="sm:col-span-2" />}
      {isDelivery && (
        <div className="sm:col-span-2">
          <Label htmlFor="item_photo">Photo of the item</Label>
          <label htmlFor="item_photo" className="mt-2 flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-input p-4 text-center text-sm text-muted-foreground hover:bg-muted">
            {photo ? <img src={photo.preview} alt="Item to deliver" className="max-h-48 rounded-md object-contain" /> : <><Camera className="h-8 w-8 text-primary" />Tap to snap or choose a photo</>}
          </label>
          <input id="item_photo" type="file" accept="image/*" capture="environment" className="sr-only" onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            try { setPhoto(await shrinkImage(file)); } catch { toast.error("That photo couldn't be read. Try another one."); }
          }} />
          {photo && <button type="button" className="mt-1 text-sm text-primary underline" onClick={() => setPhoto(null)}>Remove photo</button>}
        </div>
      )}
      {isCharter && (
        <fieldset className="sm:col-span-2">
          <legend className="text-sm font-medium">Choose your vehicle</legend>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {CHARTER_VEHICLES.map((v) => (
              <Button key={v} type="button" variant={vehicle === v ? "default" : "outline"} aria-pressed={vehicle === v} onClick={() => setVehicle(v)} className="h-12 whitespace-normal px-2">{v.replace("Toyota ", "")}</Button>
            ))}
          </div>
        </fieldset>
      )}
      {hasReturn && <>
        {isEvent && <Field name="passengers" label="Number of people" type="number" min={1} max={60} defaultValue={1} />}
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

// Resize phone photos so uploads stay small and fast.
async function shrinkImage(file: File) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const preview = canvas.toDataURL("image/jpeg", 0.82);
  return { type: "image/jpeg" as const, data: preview.split(",")[1] ?? "", preview };
}
