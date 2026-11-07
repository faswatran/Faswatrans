import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// Public read of the staff-edited page text. Falls back to defaults on any error.
export const getSiteContent = createServerFn({ method: "GET" }).handler(async () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return {} as Record<string, string>;
  try {
    const sb = createClient<Database>(url, key, {
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });
    const { data, error } = await sb.from("site_content").select("key, value");
    if (error) {
      console.error(error);
      return {} as Record<string, string>;
    }
    return Object.fromEntries((data ?? []).map((r) => [r.key, r.value])) as Record<string, string>;
  } catch (e) {
    console.error(e);
    return {} as Record<string, string>;
  }
});
