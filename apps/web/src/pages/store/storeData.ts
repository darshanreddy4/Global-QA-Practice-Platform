export type StoreProduct = {
  id: string;
  name: string;
  category: "Electronics" | "Clothing" | "Home & Kitchen" | "Books";
  price: number;
  emoji: string;
};

export const PRODUCTS: StoreProduct[] = [
  { id: "p1", name: "Wireless Headphones", category: "Electronics", price: 59.99, emoji: "\u{1F3A7}" },
  { id: "p2", name: "Smart Watch", category: "Electronics", price: 129.99, emoji: "\u231A" },
  { id: "p3", name: "Bluetooth Speaker", category: "Electronics", price: 39.99, emoji: "\u{1F50A}" },
  { id: "p4", name: "Denim Jacket", category: "Clothing", price: 79.99, emoji: "\u{1F9E5}" },
  { id: "p5", name: "Running Shoes", category: "Clothing", price: 89.99, emoji: "\u{1F45F}" },
  { id: "p6", name: "Cotton T-Shirt", category: "Clothing", price: 19.99, emoji: "\u{1F455}" },
  { id: "p7", name: "Non-Stick Pan", category: "Home & Kitchen", price: 34.99, emoji: "\u{1F373}" },
  { id: "p8", name: "Coffee Maker", category: "Home & Kitchen", price: 54.99, emoji: "\u2615" },
  { id: "p9", name: "Table Lamp", category: "Home & Kitchen", price: 24.99, emoji: "\u{1F4A1}" },
  { id: "p10", name: "Mystery Novel", category: "Books", price: 14.99, emoji: "\u{1F4D6}" },
  { id: "p11", name: "Cook Book", category: "Books", price: 22.99, emoji: "\u{1F4D5}" },
  { id: "p12", name: "Sci-Fi Anthology", category: "Books", price: 17.99, emoji: "\u{1F4D7}" },
];

export const CATEGORIES = ["All", "Electronics", "Clothing", "Home & Kitchen", "Books"] as const;

export function getProduct(id: string): StoreProduct | undefined {
  return PRODUCTS.find((p) => p.id === id);
}
