import { describe, expect, it } from "vitest";
import { bookingRequestSchema, toBookingRecord } from "@/lib/booking";

const contact = { email: "booking@example.com", phone: "+2348012345678", origin: "Ikeja, Lagos", pickup_at: "2026-11-12T08:30" };

describe("Short booking requests", () => {
  it("accepts staff email, WhatsApp, pickup, time and destination without extra fields", () => {
    const request = bookingRequestSchema.parse({ ...contact, service: "Staff booking", destination: "Victoria Island office" });
    const row = toBookingRecord(request);
    expect(row).toMatchObject({ email: contact.email, phone: contact.phone, origin: contact.origin, destination: "Victoria Island office", travel_date: "2026-11-12" });
    expect(row.notes).toContain("Pickup time: 08:30");
  });
  it("requires where staff are going", () => {
    expect(bookingRequestSchema.safeParse({ ...contact, service: "Staff booking" }).success).toBe(false);
  });
  it("accepts an event without a destination and preserves its number of people", () => {
    const row = toBookingRecord(bookingRequestSchema.parse({ ...contact, service: "Event hiring", passengers: 12 }));
    expect(row.passengers).toBe(12);
    expect(row.destination).toBe("To be confirmed");
    expect(row.notes).toContain("Journey: One way");
  });
  it("requires the event number of people", () => {
    expect(bookingRequestSchema.safeParse({ ...contact, service: "Event hiring" }).success).toBe(false);
  });
  it("preserves an event outward and return request", () => {
    const row = toBookingRecord(bookingRequestSchema.parse({ ...contact, service: "Event hiring", passengers: 18, return_trip: true }));
    expect(row.notes).toContain("Journey: Outward and return");
  });
});
describe("Private charter and delivery", () => {
  it("charter needs a vehicle and keeps it, without number of people", () => {
    expect(bookingRequestSchema.safeParse({ ...contact, service: "Private charter", destination: "Abuja" }).success).toBe(false);
    const row = toBookingRecord(bookingRequestSchema.parse({ ...contact, service: "Private charter", destination: "Abuja", vehicle: "Toyota Sienna" }));
    expect(row.notes).toContain("Vehicle: Toyota Sienna");
  });
  it("delivery needs items and keeps them", () => {
    const photo = { type: "image/jpeg" as const, data: "aGVsbG8gd29ybGQ=" };
    expect(bookingRequestSchema.safeParse({ ...contact, service: "Delivery", destination: "Lekki", photo }).success).toBe(false);
    expect(bookingRequestSchema.safeParse({ ...contact, service: "Delivery", destination: "Lekki", items: "3 cartons" }).success).toBe(false);
    const row = toBookingRecord(bookingRequestSchema.parse({ ...contact, service: "Delivery", destination: "Lekki", items: "3 cartons", photo }));
    expect(row.notes).toContain("Items: 3 cartons");
  });
});
import { nextDeliveryStage, normalizeReference, parseTracking } from "@/lib/booking";
describe("Delivery tracking", () => {
  it("moves through picked up, on the way, delivered in order", () => {
    expect(nextDeliveryStage([])?.key).toBe("picked_up");
    expect(nextDeliveryStage([{ stage: "picked_up", at: "x" }])?.key).toBe("in_transit");
    expect(nextDeliveryStage([{ stage: "picked_up", at: "x" }, { stage: "in_transit", at: "y" }])?.key).toBe("delivered");
    expect(nextDeliveryStage(parseTracking([{ stage: "picked_up", at: "x" }, { stage: "in_transit", at: "y" }, { stage: "delivered", at: "z" }]))).toBeNull();
  });
  it("accepts the code typed with a # or lowercase", () => {
    expect(normalizeReference(" #a1b2c3 ")).toBe("A1B2C3");
  });
});
