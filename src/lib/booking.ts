import { z } from "zod";

export const BOOKING_SERVICES = ["Staff booking", "Event hiring", "Private charter", "Delivery"] as const;
export const CHARTER_VEHICLES = ["Toyota Camry", "Toyota Sienna", "Toyota Hiace"] as const;
export type BookingService = (typeof BOOKING_SERVICES)[number];

export const bookingRequestSchema = z.object({
  service: z.enum(BOOKING_SERVICES),
  full_name: z.string().trim().min(2, "Enter your full name.").max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(7).max(20),
  origin: z.string().trim().min(2).max(60),
  pickup_at: z.string().regex(/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d$/),
  destination: z.string().trim().max(60).optional(),
  passengers: z.number().int().min(1).max(60).optional(),
  return_trip: z.boolean().default(false),
  items: z.string().trim().max(120).optional(),
  vehicle: z.enum(CHARTER_VEHICLES).optional(),
  photo: z.object({
    type: z.enum(["image/jpeg", "image/png", "image/webp"]),
    data: z.string().min(10).max(8_000_000), // base64, about 6MB
  }).optional(),
}).superRefine((data, ctx) => {
  const needsDestination = data.service !== "Event hiring";
  if (needsDestination && (!data.destination || data.destination.length < 2)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["destination"], message: "Enter the destination." });
  }
  if (data.service === "Event hiring" && data.passengers === undefined) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["passengers"], message: "Enter the number of people." });
  }
  if (data.service === "Private charter" && !data.vehicle) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["vehicle"], message: "Choose a vehicle." });
  }
  if (data.service === "Delivery" && (!data.items || data.items.length < 2)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["items"], message: "Describe what we are delivering." });
  }
  if (data.service === "Delivery" && !data.photo) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["photo"], message: "Add a photo of the item." });
  }
});

// Adapt short requests to the existing booking record without inventing trip details.
export function toBookingRecord(data: z.infer<typeof bookingRequestSchema>) {
  const s = data.service;
  const [travel_date, pickup_time] = data.pickup_at.split("T");
  if (!travel_date || !pickup_time) throw new Error("Enter a pickup date and time.");
  const journey = `Journey: ${data.return_trip ? "Outward and return" : "One way"}`;
  const extra =
    s === "Staff booking" ? "Staff count: to be confirmed"
    : s === "Delivery" ? `Items: ${data.items}`
    : s === "Private charter" ? `Vehicle: ${data.vehicle}\n${journey}`
    : journey;
  return {
    service: s,
    full_name: data.full_name,
    email: data.email,
    phone: data.phone,
    origin: data.origin,
    destination: s === "Event hiring" ? "To be confirmed" : data.destination ?? "",
    travel_date,
    passengers: s === "Event hiring" ? data.passengers ?? 1 : 1,
    notes: [`Pickup time: ${pickup_time} (local time at pickup)`, extra].join("\n"),
  };
}

// Delivery tracking steps after approval, in order.
export const DELIVERY_STAGES = [
  { key: "picked_up", label: "Picked up" },
  { key: "in_transit", label: "On the way" },
  { key: "delivered", label: "Delivered" },
] as const;
export type DeliveryStage = (typeof DELIVERY_STAGES)[number]["key"];
export type TrackingEntry = { stage: DeliveryStage; at: string };

export function parseTracking(value: unknown): TrackingEntry[] {
  if (!Array.isArray(value)) return [];
  return value.filter((e): e is TrackingEntry =>
    !!e && typeof e === "object" && DELIVERY_STAGES.some((s) => s.key === (e as TrackingEntry).stage) && typeof (e as TrackingEntry).at === "string");
}

export function nextDeliveryStage(tracking: TrackingEntry[]) {
  return DELIVERY_STAGES.find((s) => !tracking.some((t) => t.stage === s.key)) ?? null;
}

export const normalizeReference = (code: string) => code.trim().replace(/^#/, "").toUpperCase();

export function customerGreeting(fullName?: string) {
  const name = fullName?.trim();
  return name && !BOOKING_SERVICES.some((service) => name === `${service} request`) ? `Hello ${name}` : "Hello";
}

export function approvalText(booking: { full_name: string; reference: string; origin: string; destination: string; travel_date: string; service: string }, trackUrl?: string) {
  const journey = booking.destination === "To be confirmed" ? `pickup at ${booking.origin}` : `${booking.origin} → ${booking.destination}`;
  return `${customerGreeting(booking.full_name)}, your FASWA booking #${booking.reference} (${journey} on ${booking.travel_date}) has been APPROVED.${booking.service === "Delivery" && trackUrl ? ` Track your delivery with code ${booking.reference}: ${trackUrl}` : ""} Thank you for choosing FASWA Transportation!`;
}

export function deliveryUpdateText(stage: DeliveryStage, reference: string, trackUrl: string, fullName?: string) {
  const line =
    stage === "picked_up" ? "has been picked up"
    : stage === "in_transit" ? "is on the way"
    : "has been delivered. Thank you for trusting FASWA";
  return `${customerGreeting(fullName)}, your FASWA delivery #${reference} ${line}. Track it anytime with your code ${reference}: ${trackUrl}`;
}

export function appreciationText(service: string, reference: string, fullName?: string) {
  const kind = service === "Event hiring" ? "event trip" : "private charter";
  return `${customerGreeting(fullName)}, thank you for riding with FASWA! Your ${kind} #${reference} is complete. We truly appreciate you choosing FASWA Transport and Logistics Ltd and look forward to moving you again. Fast & Affordable, Safe Ways Always.`;
}

// Staff dashboard grouping: which list a booking belongs in.
export type OrderGroup = "pending" | "active" | "finished" | "declined";
export function orderGroup(status: string): OrderGroup {
  if (status === "approved") return "active";
  if (status === "completed") return "finished";
  if (status === "declined") return "declined";
  return "pending";
}

export function pickupTimeFromNotes(notes: string | null | undefined) {
  return notes?.match(/Pickup time: (\d{2}:\d{2})/)?.[1] ?? null;
}
