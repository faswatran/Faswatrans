// Placeholder contact details — replace with FASWA's real ones.
export const COMPANY = {
  name: "FASWA Transport and Logistics Ltd",
  shortName: "FASWA",
  whatsapp: "2349079089094", // digits only, no "+"
  phoneDisplay: "+234 907 908 9094",
  email: "admin@faswatrans.com.ng",
  address: "Lagos, Nigeria",
};

export const ROUTES = [
  { from: "Lagos", to: "Abuja", price: "₦35,000" },
  { from: "Lagos", to: "Ibadan", price: "₦9,000" },
  { from: "Lagos", to: "Benin", price: "₦18,000" },
  { from: "Abuja", to: "Kano", price: "₦20,000" },
  { from: "Lagos", to: "Port Harcourt", price: "₦30,000" },
  { from: "Ibadan", to: "Abuja", price: "₦30,000" },
];

export const SERVICES = [
  "Staff booking",
  "Event hiring",
  "Passenger seat",
  "Goods / cargo delivery",
  "Vehicle hire",
] as const;

export function waLink(text: string, number = COMPANY.whatsapp) {
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}

export const TAGLINE = "Fast & Affordable, Safe Ways Always.";

// Placeholder social links — replace with FASWA's real profiles.
export const SOCIALS = [
  { key: "x", label: "X (Twitter)", handle: "@faswatrans", href: "https://x.com/faswalogistics" },
  { key: "facebook", label: "Facebook", handle: "FASWA Transport & Logistics", href: "https://facebook.com/faswalogistics" },
  { key: "instagram", label: "Instagram", handle: "@faswatrans", href: "https://instagram.com/faswalogistics" },
  { key: "threads", label: "Threads", handle: "@faswatrans", href: "https://threads.net/@faswalogistics" },
  { key: "linkedin", label: "LinkedIn", handle: "FASWA Transport & Logistics Ltd", href: "https://linkedin.com/company/faswalogistics" },
  { key: "tiktok", label: "TikTok", handle: "@faswalogistics", href: "https://tiktok.com/@faswalogistics" },
  { key: "gmail", label: "Gmail", handle: "faswalogistics@gmail.com", href: "mailto:faswalogistics@gmail.com" },
] as const;
