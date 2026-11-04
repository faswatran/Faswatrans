import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Handshake, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Tables } from "@/integrations/supabase/types";

export type Investor = Tables<"investors">;
// Investor photos share the news photo storage and public photo address, under their own folder.
const PHOTO_PREFIX = "/api/public/news-photo/";

export function InvestorManager() {
  const [items, setItems] = useState<Investor[] | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from("investors").select("*").order("created_at", { ascending: true });
    if (error) toast.error(error.message);
    setItems(data ?? []);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const name = String(f.get("name") ?? "").trim();
    const message = String(f.get("message") ?? "").trim();
    const photo = f.get("photo");
    if (!name) return;
    setBusy(true);
    try {
      let photo_url: string | null = null;
      if (photo instanceof File && photo.size > 0) {
        const path = `investors/${crypto.randomUUID()}-${photo.name.replace(/[^\w.-]/g, "_")}`;
        const { error: upErr } = await supabase.storage.from("news-photos").upload(path, photo);
        if (upErr) throw upErr;
        photo_url = `${PHOTO_PREFIX}${path}`;
      }
      const { error } = await supabase.from("investors").insert({ name, message: message || null, photo_url });
      if (error) throw error;
      toast.success("Investor added — now showing on the Investor page.");
      form.reset();
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add investor");
    } finally {
      setBusy(false);
    }
  }

  async function remove(inv: Investor) {
    const { error } = await supabase.from("investors").delete().eq("id", inv.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (inv.photo_url?.startsWith(PHOTO_PREFIX)) {
      await supabase.storage.from("news-photos").remove([inv.photo_url.replace(PHOTO_PREFIX, "")]);
    }
    toast.success("Investor removed.");
    load();
  }

  return (
    <section className="mt-8">
      <h2 className="font-display text-2xl">Investors</h2>
      <p className="mt-1 text-sm text-muted-foreground">Add an investor's photo, name and a good word about them. They appear on the Investor page.</p>
      <form onSubmit={onSubmit} className="mt-6 grid gap-4 rounded-2xl border bg-card p-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="inv-name">Name</Label>
          <Input id="inv-name" name="name" required maxLength={120} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="inv-photo">Picture</Label>
          <Input id="inv-photo" name="photo" type="file" accept="image/*" className="mt-1" />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="inv-message">A good word about them</Label>
          <textarea
            id="inv-message"
            name="message"
            rows={3}
            maxLength={600}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Add investor"}</Button>
        </div>
      </form>

      <div className="mt-6 grid gap-4">
        {items?.map((inv) => (
          <div key={inv.id} className="flex flex-wrap items-center gap-4 rounded-xl border bg-card p-4">
            {inv.photo_url
              ? <img src={inv.photo_url} alt="" className="h-16 w-16 rounded-full object-cover" />
              : <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary"><Handshake className="h-6 w-6 text-accent" /></div>}
            <div className="min-w-48 flex-1">
              <p className="font-display">{inv.name}</p>
              {inv.message && <p className="line-clamp-2 text-sm text-muted-foreground">{inv.message}</p>}
            </div>
            <Button size="sm" variant="outline" onClick={() => remove(inv)}><Trash2 className="h-4 w-4" /> Delete</Button>
          </div>
        ))}
        {items?.length === 0 && <p className="text-sm text-muted-foreground">No investors added yet.</p>}
      </div>
    </section>
  );
}
