import { getRouteApi } from "@tanstack/react-router";
import { CAMRY_IMG, HIACE_IMG, SIENNA_IMG } from "./fleet";
import { TAGLINE } from "./company";

// Every piece of page text/background staff can edit from the dashboard.
// The value here is the default shown until staff save a change.
export type ContentField = { key: string; label: string; kind: "text" | "long" | "image"; def: string };
export type ContentPage = { page: string; title: string; fields: ContentField[] };

const f = (key: string, label: string, def: string, kind: ContentField["kind"] = "text"): ContentField => ({ key, label, kind, def });
const hero = (p: string, eyebrow: string, title: string, text: string, bg: string) => [
  f(`${p}.hero.bg`, "Background photo", bg, "image"),
  f(`${p}.hero.eyebrow`, "Small heading", eyebrow),
  f(`${p}.hero.title`, "Big heading", title),
  f(`${p}.hero.text`, "Text under heading", text, "long"),
];
const cards = (p: string, name: string, items: [string, string][]) =>
  items.flatMap(([t, d], i) => [f(`${p}.${i + 1}.title`, `${name} ${i + 1} – title`, t), f(`${p}.${i + 1}.text`, `${name} ${i + 1} – text`, d, "long")]);

export const CONTENT_PAGES: ContentPage[] = [
  {
    page: "home",
    title: "Home",
    fields: [
      f("home.hero.bg1", "Background photo 1", HIACE_IMG, "image"),
      f("home.hero.bg2", "Background photo 2", SIENNA_IMG, "image"),
      f("home.hero.bg3", "Background photo 3", CAMRY_IMG, "image"),
      f("home.hero.eyebrow", "Small heading", TAGLINE),
      f("home.hero.title", "Big heading", "Moving People. Moving Businesses."),
      f("home.hero.text", "Text under heading", "Staff transport, event hiring and logistics across Nigeria, booked online in minutes.", "long"),
      f("home.vision.eyebrow", "Vision – small heading", "Our Vision"),
      f("home.vision.title", "Vision – heading", "A better way to move"),
      f("home.vision.text", "Vision – paragraph", "Transportation is more than getting from one place to another — it connects people to opportunities, businesses to customers, and communities to one another. FASWA is being built on four simple beliefs.", "long"),
      ...cards("home.vision", "Belief", [
        ["Fast", "Respecting people's time through efficient transportation and logistics."],
        ["Affordable", "Working toward transportation that provides real value and stays accessible."],
        ["Safe", "Making safety and responsible service fundamental to every FASWA journey."],
        ["Accessible", "Building a dependable network that people and businesses can trust to keep moving."],
      ]),
      f("home.services.eyebrow", "Services – small heading", "What we do"),
      f("home.services.title", "Services – heading", "Our services"),
      ...cards("home.services", "Service", [
        ["Staff booking", "Daily and scheduled transport for your company staff."],
        ["Event hiring", "Vehicles for weddings, conferences and outings."],
        ["Inter-state trip", "Comfortable travel between states across Nigeria."],
        ["Logistics", "Move parcels, documents and goods between cities."],
      ]),
      f("home.fleet.eyebrow", "Fleet – small heading", "Our fleet"),
      f("home.fleet.title", "Fleet – heading", "The right vehicle for every trip"),
    ],
  },
  {
    page: "services",
    title: "Services",
    fields: [
      ...hero("services", "Services", "What we do", "From daily staff transport to big events and deliveries, FASWA keeps you moving.", HIACE_IMG),
      ...cards("services.item", "Service", [
        ["Staff booking", "Reliable daily or scheduled pickups and drop-offs for your employees, with dedicated drivers."],
        ["Event hiring", "Comfortable buses and cars for weddings, conferences, church programmes and excursions."],
        ["Inter-state trip", "Safe, comfortable trips between states, with professional drivers and well-maintained vehicles."],
        ["Passenger travel", "Air-conditioned coaches on major intercity routes across Nigeria."],
        ["Goods & cargo delivery", "Safe, tracked movement of parcels and goods between cities."],
        ["Vehicle hire", "Charter a vehicle with a professional driver for any trip."],
      ]),
    ],
  },
  {
    page: "about",
    title: "About",
    fields: [
      ...hero("about", "About us", "Building better ways to move", "FASWA Transport & Logistics Ltd was created around a simple idea: people and businesses deserve better ways to move.", SIENNA_IMG),
      f("about.meaning.title", "Heading", "What FASWA means"),
      f("about.meaning.tagline", "Bold line", "Fast & Affordable, Safe Ways Always."),
      f("about.meaning.text", "Paragraph", "FASWA Transport & Logistics Ltd was created around a straightforward idea: people and businesses deserve better ways to move. We're building around four fundamental principles — speed, affordability, safety, and reliability.", "long"),
      f("about.mission", "Our mission", "To develop accessible, reliable, safe and technology - enabled transportation and logistics solutions that make it easier for people and businesses to move.", "long"),
      f("about.vision", "Our vision", "To build a trusted network connecting people, businesses, drivers, vehicle owners and communities through innovative mobility solutions.", "long"),
      f("about.values.title", "Values – heading", "Our values"),
      ...cards("about.values", "Value", [
        ["Safety first", "Responsible operations and customer safety at the centre."],
        ["Affordability", "Services that deliver real value."],
        ["Speed", "Efficient journeys that respect your time."],
        ["Reliability", "A network people and businesses can trust."],
      ]),
    ],
  },
  { page: "booking", title: "Booking", fields: hero("booking", "Booking", "Book with FASWA", "Staff transport, events, private charters and deliveries.", HIACE_IMG) },
  { page: "track", title: "Track", fields: hero("track", "Track", "Track your delivery", "Enter the booking code you received to see where your item is.", HIACE_IMG) },
  { page: "investor", title: "Investor", fields: hero("investor", "Investors", "Our investors", "The people and partners who believe in FASWA and are helping us build a better way to move.", SIENNA_IMG) },
  {
    page: "contact",
    title: "Contact us",
    fields: [
      ...hero("contact", "Contact us", "We're here to help", "Questions, quotes or special requests — reach us any way you like.", CAMRY_IMG),
      f("contact.connect.title", "Social section heading", "Connect with us"),
    ],
  },
];

export const CONTENT_DEFAULTS: Record<string, string> = Object.fromEntries(
  CONTENT_PAGES.flatMap((p) => p.fields.map((x) => [x.key, x.def])),
);

/** Saved value if staff changed it, otherwise the default. */
export function resolveContent(saved: Record<string, string> | undefined, key: string) {
  const v = saved?.[key];
  return v && v.trim() ? v : (CONTENT_DEFAULTS[key] ?? "");
}

const rootApi = getRouteApi("__root__");
export function useContent() {
  const saved = rootApi.useLoaderData() as Record<string, string> | undefined;
  return (key: string) => resolveContent(saved, key);
}
