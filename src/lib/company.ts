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
  "Inter-state trip",
  "Passenger seat",
  "Goods / cargo delivery",
  "Vehicle hire",
] as const;

export function waLink(text: string, number = COMPANY.whatsapp) {
  return `https://api.whatsapp.com/send?phone=${number.replace(/\D/g, "")}&text=${encodeURIComponent(text)}`;
}

export const TAGLINE = "Fast & Affordable, Safe Ways Always.";

// Social links use FASWA's shared faswatrans profile name.
export const SOCIALS = [
  { key: "x", label: "X (Twitter)", handle: "@faswatrans", href: "https://x.com/faswatrans" },
  { key: "facebook", label: "Facebook", handle: "FASWA Transport & Logistics", href: "https://facebook.com/faswatrans" },
  { key: "instagram", label: "Instagram", handle: "@faswatrans", href: "https://instagram.com/faswatrans" },
  { key: "threads", label: "Threads", handle: "@faswatrans", href: "https://www.threads.net/@faswatrans" },
  { key: "linkedin", label: "LinkedIn", handle: "FASWA Transport & Logistics Ltd", href: "https://linkedin.com/company/faswatrans" },
  { key: "tiktok", label: "TikTok", handle: "@faswatrans", href: "https://tiktok.com/@faswatrans" },
  { key: "gmail", label: "Gmail", handle: "admin@faswatrans.com.ng", href: "mailto:admin@faswatrans.com.ng" },
] as const;
