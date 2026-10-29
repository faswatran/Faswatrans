import { useEffect, useState } from "react";
import { Clock, MapPin, Newspaper } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type NewsPost = Tables<"news_posts">;

export function NewsSection() {
  const [posts, setPosts] = useState<NewsPost[] | null>(null);

  useEffect(() => {
    supabase
      .from("news_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(6)
      .then(({ data }) => setPosts(data ?? []));
  }, []);

  if (!posts || posts.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">News</p>
      <h2 className="mt-2 font-display text-3xl text-primary md:text-4xl">On the road with FASWA</h2>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Real trips, real events, real people — see what we've been up to and why customers trust us.
      </p>
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <article key={p.id} className="overflow-hidden rounded-2xl border bg-card transition hover:shadow-lift">
            {p.photo_url ? (
              <img src={p.photo_url} alt={p.title} loading="lazy" className="aspect-[4/3] w-full object-cover" />
            ) : (
              <div className="flex aspect-[4/3] w-full items-center justify-center bg-secondary">
                <Newspaper className="h-10 w-10 text-accent" />
              </div>
            )}
            <div className="p-6">
              <h3 className="font-display text-lg text-primary">{p.title}</h3>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold text-accent">
                {p.destination && <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{p.destination}</span>}
                {p.hours != null && <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" />{p.hours} hrs journey</span>}
              </div>
              {p.body && <p className="mt-2 text-sm text-muted-foreground">{p.body}</p>}
              <p className="mt-3 text-xs text-muted-foreground">
                {new Date(p.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
