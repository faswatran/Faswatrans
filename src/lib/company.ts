// Placeholder contact details — replace with FASWA's real ones.
export const COMPANY = {
  name: "FASWA Transportation",
  whatsapp: "2348000000000", // digits only, no "+"
  phoneDisplay: "+234 800 000 0000",
};

export const ROUTES = [
  { from: "Lagos", to: "Abuja", price: "₦35,000" },
  { from: "Lagos", to: "Ibadan", price: "₦9,000" },
  { from: "Lagos", to: "Benin", price: "₦18,000" },
  { from: "Abuja", to: "Kano", price: "₦20,000" },
  { from: "Lagos", to: "Port Harcourt", price: "₦30,000" },
  { from: "Ibadan", to: "Abuja", price: "₦30,000" },
];

export const SERVICES = ["Passenger seat", "Goods / cargo delivery", "Vehicle hire"] as const;

export function waLink(text: string, number = COMPANY.whatsapp) {
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}
