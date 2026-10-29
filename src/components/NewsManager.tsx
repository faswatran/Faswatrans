import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { NewsPost } from "@/components/NewsSection";

export function NewsManager() {
  const [posts, setPosts] = useState<NewsPost[] | null>(null);
  const [busy, setBusy] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from("news_posts").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setPosts(data ?? []);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const title = String(f.get("title") ?? "").trim();
    const destination = String(f.get("destination") ?? "").trim();
    const hoursRaw = String(f.get("hours") ?? "").trim();
    const body = String(f.get("body") ?? "").trim();
    const photo = f.get("photo");
    if (!title) return;

    setBusy(true);
    try {
      let photo_url: string | null = null;
      if (photo instanceof File && photo.size > 0) {
        const path = `${crypto.randomUUID()}-${photo.name.replace(/[^\w.-]/g, "_")}`;
        const { error: upErr } = await supabase.storage.from("news-photos").upload(path, photo);
        if (upErr) throw upErr;
        photo_url = `/api/public/news-photo/${path}`;
      }
      const { error } = await supabase.from("news_posts").insert({
        title,
        destination: destination || null,
        hours: hoursRaw ? Number(hoursRaw) : null,
        body: body || null,
        photo_url,
      });
      if (error) throw error;
      toast.success("News posted — it's now live on the Home page.");
      form.reset();
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not post news");
    } finally {
      setBusy(false);
    }
  }

  async function remove(p: NewsPost) {
    const { error } = await supabase.from("news_posts").delete().eq("id", p.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (p.photo_url?.startsWith("/api/public/news-photo/")) {
      await supabase.storage.from("news-photos").remove([p.photo_url.replace("/api/public/news-photo/", "")]);
    }
    toast.success("News post deleted.");
    load();
  }

  return (
    <section className="mt-14">
      <h2 className="font-display text-2xl">News &amp; daily activities</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Post trips, event hires and photos — they appear in the News section on the Home page.
      </p>
      <form ref={formRef} onSubmit={onSubmit} className="mt-6 grid gap-4 rounded-2xl border bg-card p-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="news-title">Title</Label>
          <Input id="news-title" name="title" required placeholder="e.g. Wedding hire in Ibadan" className="mt-1" />
        </div>
        <div>
          <Label htmlFor="news-destination">Where we carried them to</Label>
          <Input id="news-destination" name="destination" placeholder="e.g. Lagos → Ibadan" className="mt-1" />
        </div>
        <div>
          <Label htmlFor="news-hours">Total hours of the journey</Label>
          <Input id="news-hours" name="hours" type="number" min="0" step="0.5" placeholder="e.g. 3" className="mt-1" />
        </div>
        <div>
          <Label htmlFor="news-photo">Photo (passengers, vehicle, event…)</Label>
          <Input id="news-photo" name="photo" type="file" accept="image/*" className="mt-1" />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="news-body">Short story (optional)</Label>
          <textarea
            id="news-body"
            name="body"
            rows={3}
            placeholder="e.g. We moved 40 guests to the wedding venue and back, right on schedule."
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={busy}>{busy ? "Posting…" : "Post news"}</Button>
        </div>
      </form>

      <div className="mt-6 grid gap-4">
        {posts?.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center gap-4 rounded-xl border bg-card p-4">
            {p.photo_url && <img src={p.photo_url} alt="" className="h-16 w-16 rounded-lg object-cover" />}
            <div className="min-w-48 flex-1">
              <p className="font-display">{p.title}</p>
              <p className="text-sm text-muted-foreground">
                {[p.destination, p.hours != null ? `${p.hours} hrs` : null].filter(Boolean).join(" · ") || "No details"}
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => remove(p)}><Trash2 className="h-4 w-4" /> Delete</Button>
          </div>
        ))}
        {posts?.length === 0 && <p className="text-sm text-muted-foreground">No news posts yet.</p>}
      </div>
    </section>
  );
}
