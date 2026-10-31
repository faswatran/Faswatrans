import { z } from "zod";

export const BOOKING_SERVICES = ["Staff booking", "Event hiring", "Private charter", "Delivery"] as const;
export const CHARTER_VEHICLES = ["Toyota Camry", "Toyota Sienna", "Toyota Hiace"] as const;
export type BookingService = (typeof BOOKING_SERVICES)[number];

export const bookingRequestSchema = z.object({
  service: z.enum(BOOKING_SERVICES),
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
    full_name: `${s} request`,
    email: data.email,
    phone: data.phone,
    origin: data.origin,
    destination: s === "Event hiring" ? "To be confirmed" : data.destination ?? "",
    travel_date,
    passengers: s === "Event hiring" ? data.passengers ?? 1 : 1,
    notes: [`Pickup time: ${pickup_time} (local time at pickup)`, extra].join("\n"),
  };
}
