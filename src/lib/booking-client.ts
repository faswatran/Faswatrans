import { supabase } from "@/integrations/supabase/client";
import { bookingRequestSchema, normalizeReference, parseTracking, toBookingRecord } from "./booking";

// Database functions validate public requests without granting access to customer rows.
export async function createBooking({ data }: { data: unknown }) {
  const request = bookingRequestSchema.parse(data);
  let item_photo: string | null = null;
  if (request.service === "Delivery" && request.photo) {
    const bytes = Uint8Array.from(atob(request.photo.data), (c) => c.charCodeAt(0));
    item_photo = `${crypto.randomUUID()}.${request.photo.type.split("/")[1]}`;
    const { error } = await supabase.storage.from("delivery-photos").upload(item_photo, bytes, { contentType: request.photo.type });
    if (error) throw new Error("Could not save the photo. Please try again.");
  }
  const { data: reference, error } = await supabase.rpc("submit_booking", { p_booking: { ...toBookingRecord(request), item_photo } });
  if (error) throw new Error(error.message);
  if (!reference) throw new Error("Could not save booking. Please try again.");
  return { reference };
}

export async function trackBooking({ data }: { data: { code: string } }) {
  const code = normalizeReference(data.code);
  if (!/^[A-Z0-9]{4,12}$/.test(code)) return { found: false as const };
  const { data: rows, error } = await supabase.rpc("lookup_booking", { p_code: code });
  if (error) throw new Error("Could not look up that code");
  const row = rows?.[0];
  if (!row) return { found: false as const };
  return {
    found: true as const, reference: row.reference, service: row.service, status: row.status,
    completed_at: row.completed_at, pickup_date: row.travel_date, booked_at: row.created_at,
    approved_at: row.approved_at, tracking: parseTracking(row.tracking),
  };
}