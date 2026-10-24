export const site = {
  name: "ConeStone CBP",
  kitchenBrand: "Amma Kitchen",
  tagline: "Traditional Cooking",
  domain: "https://conestonecbp.com",
  email: "contact@conestonecbp.com",
  address: {
    line1: "6 Changi Business Park Ave 1",
    line2: "#01-23 ESR Park @Changi",
    city: "Singapore 486017",
  },
  contacts: [
    { name: "Madhav", phone: "81725039", display: "8172 5039" },
    { name: "Soujanya", phone: "93365499", display: "9336 5499" },
  ],
  primaryPhone: {
    name: "Madhav",
    phone: "81725039",
    display: "8172 5039",
  },
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=6+Changi+Business+Park+Ave+1+%2301-23+ESR+Park+%40Changi+Singapore+486017",
  googleReviewLabel: "Cone Stone",
} as const;

export function telHref(phone: string) {
  return `tel:+65${phone}`;
}

export function mailHref(email: string = site.email) {
  return `mailto:${email}`;
}
