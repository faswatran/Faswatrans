import { beforeEach, describe, expect, it, vi } from "vitest";
const { rpc, upload } = vi.hoisted(() => ({ rpc: vi.fn(), upload: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { rpc, storage: { from: () => ({ upload }) } } }));
import { createBooking, trackBooking } from "@/lib/booking-client";

const contact = { full_name: "Ada Okafor", email: "booking@example.com", phone: "+2348012345678", origin: "Ikeja", pickup_at: "2026-11-12T08:30", destination: "Lekki" };
describe("Publishable-key bookings", () => {
  beforeEach(() => { vi.clearAllMocks(); rpc.mockResolvedValue({ data: "A1B2C3D4E5F6", error: null }); upload.mockResolvedValue({ error: null }); });
  it.each(["Staff booking", "Event hiring", "Private charter", "Delivery"])("submits %s without a server key and keeps the name", async (service) => {
    const result = await createBooking({ data: { ...contact, service, passengers: 12, vehicle: "Toyota Sienna", items: "Documents", photo: { type: "image/jpeg", data: "aGVsbG8gd29ybGQ=" }, status: "approved" } });
    expect(result.reference).toBe("A1B2C3D4E5F6");
    expect(rpc).toHaveBeenCalledWith("submit_booking", { p_booking: expect.objectContaining({ full_name: "Ada Okafor", service }) });
    expect(rpc.mock.calls[0]?.[1].p_booking).not.toHaveProperty("status");
    expect(upload).toHaveBeenCalledTimes(service === "Delivery" ? 1 : 0);
  });
  it("does not submit invalid full names", async () => {
    await expect(createBooking({ data: { ...contact, service: "Staff booking", full_name: "" } })).rejects.toThrow();
    expect(rpc).not.toHaveBeenCalled();
  });
  it("normalizes tracking codes and excludes customer details", async () => {
    rpc.mockResolvedValue({ data: [{ reference: "A1B2C3D4E5F6", service: "Delivery", status: "pending", tracking: [], full_name: "Private name", email: "private@example.com" }], error: null });
    const result = await trackBooking({ data: { code: " #a1b2c3d4e5f6 " } });
    expect(rpc).toHaveBeenCalledWith("lookup_booking", { p_code: "A1B2C3D4E5F6" });
    expect(result.found).toBe(true);
    expect(result).not.toHaveProperty("email");
    expect(result).not.toHaveProperty("full_name");
  });
});