import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import logo from "@/assets/faswa-logo-2.jpg.asset.json";
import { ChatWidget } from "@/components/ChatWidget";
import { COMPANY, SOCIALS, TAGLINE } from "@/lib/company";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/about", label: "About" },
  { to: "/booking", label: "Booking" },
  { to: "/investor", label: "Investor" },
  { to: "/contact", label: "Contact us" },
] as const;

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col font-sans">
      <div className="hidden bg-primary text-xs text-primary-foreground md:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-2">
          <span className="opacity-85">{TAGLINE}</span>
          <span className="opacity-85">{COMPANY.phoneDisplay} · {COMPANY.email}</span>
        </div>
      </div>
      <header className="sticky top-0 z-40 border-b bg-card/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-3">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo.url} alt="FASWA logo" className="h-16 w-16 rounded-md object-contain" />
            <span className="leading-tight">
              <span className="block font-display text-5xl leading-none tracking-wide text-primary">FASWA</span>
              <span className="block text-sm font-bold uppercase tracking-wider text-muted-foreground">Transport and Logistics Ltd</span>
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
      <footer className="bg-primary text-sm text-primary-foreground">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              <img src={logo.url} alt="" className="h-12 w-12 rounded-md bg-card object-contain" />
              <span className="font-display text-3xl font-bold md:text-4xl">FASWA</span>
            </div>
            <p className="mt-4 opacity-80">{TAGLINE}</p>
          </div>
          <div>
            <p className="font-display">Pages</p>
            <ul className="mt-3 space-y-2 opacity-85">
              {NAV.map((n) => <li key={n.to}><Link to={n.to} className="hover:underline">{n.label}</Link></li>)}
            </ul>
          </div>
          <div>
            <p className="font-display">Follow us</p>
            <ul className="mt-3 grid grid-cols-2 gap-2 opacity-85">
              {SOCIALS.map((s) => <li key={s.key}><a href={s.href} target="_blank" rel="noreferrer" className="hover:underline">{s.label}</a></li>)}
            </ul>
          </div>
        </div>
        <div className="border-t border-primary-foreground/15">
          <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-3 px-6 py-5 opacity-75">
            <p>© {new Date().getFullYear()} {COMPANY.name}</p>
            <Link to="/admin" className="hover:opacity-100">Staff login</Link>
          </div>
        </div>
      </footer>
      <ChatWidget />
    </div>
  );
}

export function PageHero({ eyebrow, title, text, image }: { eyebrow: string; title: string; text: string; image?: string }) {
  return (
    <section className="relative overflow-hidden bg-primary text-on-dark">
      {image && <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />}
      {image && <div className="absolute inset-0 bg-hero-overlay" />}
      <div className="relative mx-auto max-w-6xl px-6 py-32 md:py-44">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">{eyebrow}</p>
        <h1 className="mt-3 max-w-2xl font-display text-4xl md:text-5xl">{title}</h1>
        <p className="mt-4 max-w-xl opacity-90">{text}</p>
      </div>
    </section>
  );
}
