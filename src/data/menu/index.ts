import { cateringPackages } from "./catering";
import { drinkCategories } from "./drinks";
import { foodCategories } from "./food";
import type { MenuCategory } from "./types";

export * from "./types";
export * from "./catering";

export const menuCategories: MenuCategory[] = [
  ...foodCategories,
  ...drinkCategories,
];

export const featuredDishIds = [
  "pesarattu",
  "filter-coffee",
  "chicken-65",
  "pani-puri",
  "raagi-dosa",
  "chilli-chicken-andhra",
] as const;

export function getFeaturedDishes() {
  const all = menuCategories.flatMap((c) => c.items);
  return featuredDishIds
    .map((id) => all.find((item) => item.id === id))
    .filter(Boolean);
}

export function formatPrice(amount: number) {
  return Number.isInteger(amount)
    ? `$${amount}`
    : `$${amount.toFixed(2)}`;
}

export { cateringPackages };
