import type { CateringPackage } from "./types";

export const cateringPackages: CateringPackage[] = [
  {
    id: "nonveg-catering",
    title: "Non-Veg Menu",
    dietary: "nonveg",
    pricePerHead: 24,
    minPeopleNote: "for above 20 people",
    items: [
      "Vada (Mirchi Bajji / Masala Vada / Alasandha Vada / Cut Mirchi Bajji / Minapa Vada)",
      "Chicken/Mutton/Keema Biryani",
      "Chapati/Poori",
      "Pappu / Stuffed Brinjal / Pachadi",
      "Chicken/Mutton/Prawn Curry",
      "Channa / Panner / Mixed Veg",
      "Chilli Chicken / Fish Fry",
      "Sweet (Kesari/Fruit Custard / Gulabjamoon)",
    ],
    surchargeNote:
      "Selecting of each Mutton, Fish, or Prawn items will incur a $4 surcharge per person.",
    sourcePage: 2,
  },
  {
    id: "veg-catering",
    title: "Veg Menu",
    dietary: "veg",
    pricePerHead: 20,
    minPeopleNote: "for more than 20 people",
    items: [
      "Vada (Mirchi Bajji / Masala Vada / Alasandha Vada / Cut Mirchi Bajji / Minapa Vada (Medu Vada))",
      "Veg Biryani / Panner / Avakaya / Bagara Rice Biriyani",
      "Chapati/Poori",
      "Roti Pachadi",
      "Pappu / Stuffed Brinjal / Pulla Koora / Sambar",
      "Channa / Panner / Mixed Veg",
      "Bendi / Alu/ Dondakaya/ Fry",
      "Sweet (Kesari/ Gulabjamoon / Fruit Custard)",
    ],
    sourcePage: 2,
  },
];

export const cateringComplementary = ["White Rice", "Raita", "Papad"] as const;

export const cateringTerms = [
  "Payment: 50% Advance payment required upon order confirmation.",
  "Contact: Please provide an alternate mobile number for all bookings.",
  "Transport: One-way Taxi Fare is payable by the client.",
  "Disposables: Plates and cutlery are not included in the per-head price.",
  "Menu Changes: Any modifications to the standard menu will incur extra charges.",
] as const;

export const cateringPlanningGuide = [
  { label: "Small event (10–20 pax)", dishes: "5–6 dishes" },
  { label: "Medium (30–50 pax)", dishes: "7–9 dishes" },
  { label: "Large (100+ pax)", dishes: "10–12 dishes" },
] as const;
