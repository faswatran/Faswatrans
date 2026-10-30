import { z } from "zod";

export const bookingRequestSchema = z.object({
  service: z.enum(["Staff booking", "Event hiring"]),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(7).max(20),
  origin: z.string().trim().min(2).max(60),
  pickup_at: z.string().regex(/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d$/),
  destination: z.string().trim().max(60).optional(),
  passengers: z.number().int().min(1).max(60).optional(),
  return_trip: z.boolean().default(false),
}).superRefine((data, ctx) => {
  if (data.service === "Staff booking" && (!data.destination || data.destination.length < 2)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["destination"], message: "Enter the staff destination." });
  }
  if (data.service === "Event hiring" && data.passengers === undefined) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["passengers"], message: "Enter the number of people." });
  }
});

// Adapt short requests to the existing booking record without inventing trip details.
export function toBookingRecord(data: z.infer<typeof bookingRequestSchema>) {
  const isEvent = data.service === "Event hiring";
  const [travel_date, pickup_time] = data.pickup_at.split("T");
  if (!travel_date || !pickup_time) throw new Error("Enter a pickup date and time.");
  return {
    service: data.service,
    full_name: `${data.service} request`,
    email: data.email,
    phone: data.phone,
    origin: data.origin,
    destination: isEvent ? "To be confirmed" : data.destination ?? "",
    travel_date,
    passengers: isEvent ? data.passengers ?? 1 : 1,
    notes: [
      `Pickup time: ${pickup_time} (local time at pickup)`,
      isEvent ? `Journey: ${data.return_trip ? "Outward and return" : "One way"}` : "Staff count: to be confirmed",
    ].join("\n"),
  };
}