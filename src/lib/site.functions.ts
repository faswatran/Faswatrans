import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { COMPANY, ROUTES, SERVICES } from "./company";
import { bookingRequestSchema, toBookingRecord } from "./booking";

export const createBooking = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => bookingRequestSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("bookings")
      .insert(toBookingRecord(data))
      .select("reference")
      .single();
    if (error) {
      console.error(error);
      throw new Error("Could not save booking");
    }
    return { reference: row.reference };
  });

const chatSchema = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(2000) }))
    .min(1)
    .max(30),
});

export const chatAssistant = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => chatSchema.parse(d))
  .handler(async ({ data }) => {
    const { generateResponse, GatewayError } = await import("@lovable.dev/ai-gateway");
    const routes = ROUTES.map((r) => `${r.from} → ${r.to}: from ${r.price}`).join("; ");
    const instructions = `You are Faswa, the friendly assistant for ${COMPANY.name}, a Nigerian transport and logistics company offering staff booking (company staff transport), event hiring, passenger seats, goods/cargo delivery and vehicle hire.
Routes and fares: ${routes}.
Keep replies short (2-4 sentences), warm and clear. Help customers choose a service, and tell them they can book on the Booking page (Staff Booking or Event Hiring).
Your main goal is to lead customers to chat with our team on WhatsApp for quotes, special requests, or anything you are unsure about. When it helps, end with an invitation to tap the "Chat on WhatsApp" button. Never invent prices, times or policies not listed above.`;
    try {
      const res = await generateResponse({
        model: "openai/gpt-6-astra",
        instructions,
        input: data.messages.map((m) => ({ role: m.role, content: m.content })),
      });
      let text = "";
      for (const item of res.output ?? []) {
        if (item.type === "message") {
          for (const c of item.content) if (c.type === "output_text") text += c.text;
        }
      }
      return { reply: text || "Sorry, I couldn't answer that. Please chat with us on WhatsApp." };
    } catch (e) {
      if (e instanceof GatewayError) console.error(e.code, e.message);
      else console.error(e);
      return { reply: "I'm having trouble right now. Please tap **Chat on WhatsApp** to reach our team." };
    }
  });
