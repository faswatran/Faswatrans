import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import logo from "@/assets/faswa-logo.png.asset.json";
import { ChatWidget } from "@/components/ChatWidget";
import { COMPANY } from "@/lib/company";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/about", label: "About" },
  { to: "/booking", label: "Booking" },
  { to: "/contact", label: "Contact us" },
] as const;

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col font-sans">
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-3">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo.url} alt="FASWA logo" className="h-11 w-11 object-contain" />
            <span className="leading-tight">
              <span className="block font-display text-lg text-primary">FASWA</span>
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Transport and Logistics Ltd</span>
            </span>
          </Link>
          <nav className="flex flex-wrap items-center gap-1 text-sm font-semibold">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: true }}
                className="rounded-md px-3 py-2 text-foreground hover:bg-secondary"
                activeProps={{ className: "bg-primary text-primary-foreground hover:bg-primary" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="bg-primary py-10 text-sm text-primary-foreground">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6">
          <p>© {new Date().getFullYear()} {COMPANY.name}</p>
          <p className="opacity-80">{COMPANY.phoneDisplay} · {COMPANY.email}</p>
          <Link to="/admin" className="opacity-70 hover:opacity-100">Staff login</Link>
        </div>
      </footer>
      <ChatWidget />
    </div>
  );
}

export function PageHero({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <section className="bg-primary py-16 text-primary-foreground">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">{eyebrow}</p>
        <h1 className="mt-3 font-display text-4xl md:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl opacity-85">{text}</p>
      </div>
    </section>
  );
}
