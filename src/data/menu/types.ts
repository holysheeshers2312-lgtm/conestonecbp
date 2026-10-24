export type PriceVariant = {
  label: string;
  amount: number;
};

export type MenuItem = {
  id: string;
  name: string;
  description?: string;
  prices: PriceVariant[];
  dietary?: "veg" | "nonveg";
  note?: string;
  sourcePage: number;
};

export type MenuCategory = {
  id: string;
  title: string;
  group: "food" | "drinks" | "catering";
  blurb?: string;
  items: MenuItem[];
  sourcePage: number;
};

export type CateringPackage = {
  id: string;
  title: string;
  dietary: "veg" | "nonveg";
  pricePerHead: number;
  minPeopleNote: string;
  items: string[];
  surchargeNote?: string;
  sourcePage: number;
};
