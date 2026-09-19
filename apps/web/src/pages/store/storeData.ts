export type StoreProduct = {
  id: string;
  name: string;
  category: "Electronics" | "Clothing" | "Footwear" | "Home & Kitchen" | "Books";
  price: number;
  emoji: string;
};

export const PRODUCTS: StoreProduct[] = [
  { id: "p1", name: "Wireless Headphones", category: "Electronics", price: 59.99, emoji: "\u{1F3A7}" },
  { id: "p2", name: "Smart Watch", category: "Electronics", price: 129.99, emoji: "\u231A" },
  { id: "p3", name: "Bluetooth Speaker", category: "Electronics", price: 39.99, emoji: "\u{1F50A}" },
  { id: "p4", name: "Denim Jacket", category: "Clothing", price: 79.99, emoji: "\u{1F9E5}" },
  { id: "p6", name: "Cotton T-Shirt", category: "Clothing", price: 19.99, emoji: "\u{1F455}" },
  { id: "p7", name: "Non-Stick Pan", category: "Home & Kitchen", price: 34.99, emoji: "\u{1F373}" },
  { id: "p8", name: "Coffee Maker", category: "Home & Kitchen", price: 54.99, emoji: "\u2615" },
  { id: "p9", name: "Table Lamp", category: "Home & Kitchen", price: 24.99, emoji: "\u{1F4A1}" },
  { id: "p10", name: "Mystery Novel", category: "Books", price: 14.99, emoji: "\u{1F4D6}" },
  { id: "p11", name: "Cook Book", category: "Books", price: 22.99, emoji: "\u{1F4D5}" },
  { id: "p12", name: "Sci-Fi Anthology", category: "Books", price: 17.99, emoji: "\u{1F4D7}" },
  // Six shoe brands at varied prices \u2014 lets a task say "find the shoe priced
  // between $X and $Y" with exactly one match, testing search + price-range filter
  // + picking the right item out of several very similar ones.
  { id: "f1", name: "Nike Air Runner", category: "Footwear", price: 89.99, emoji: "\u{1F45F}" },
  { id: "f2", name: "Adidas Trail Blazer", category: "Footwear", price: 105.0, emoji: "\u{1F45F}" },
  { id: "f3", name: "Puma Street Comfort", category: "Footwear", price: 65.0, emoji: "\u{1F45F}" },
  { id: "f4", name: "Reebok Classic Move", category: "Footwear", price: 72.5, emoji: "\u{1F45F}" },
  { id: "f5", name: "New Balance Cushion Pro", category: "Footwear", price: 95.0, emoji: "\u{1F45F}" },
  { id: "f6", name: "Bata Everyday Walk", category: "Footwear", price: 45.0, emoji: "\u{1F45F}" },
];

export const CATEGORIES = ["All", "Electronics", "Clothing", "Footwear", "Home & Kitchen", "Books"] as const;

export function getProduct(id: string): StoreProduct | undefined {
  return PRODUCTS.find((p) => p.id === id);
}
