export type StoreProduct = {
  id: string;
  name: string;
  category: "Electronics" | "Clothing" | "Footwear" | "Home & Kitchen" | "Books";
  price: number;
  emoji: string;
  image: string;
};

function unsplash(photoId: string): string {
  return `https://images.unsplash.com/photo-${photoId}?w=600&h=450&fit=crop&q=80`;
}

export const PRODUCTS: StoreProduct[] = [
  { id: "p1", name: "Wireless Headphones", category: "Electronics", price: 59.99, emoji: "\u{1F3A7}", image: unsplash("1505740420928-5e560c06d30e") },
  { id: "p2", name: "Smart Watch", category: "Electronics", price: 129.99, emoji: "\u231A", image: unsplash("1523275335684-37898b6baf30") },
  { id: "p3", name: "Bluetooth Speaker", category: "Electronics", price: 39.99, emoji: "\u{1F50A}", image: unsplash("1608043152269-423dbba4e7e1") },
  { id: "p4", name: "Denim Jacket", category: "Clothing", price: 79.99, emoji: "\u{1F9E5}", image: unsplash("1551537482-f2075a1d41f2") },
  { id: "p6", name: "Cotton T-Shirt", category: "Clothing", price: 19.99, emoji: "\u{1F455}", image: unsplash("1521572163474-6864f9cf17ab") },
  { id: "p7", name: "Non-Stick Pan", category: "Home & Kitchen", price: 34.99, emoji: "\u{1F373}", image: unsplash("1556910103-1c02745aae4d") },
  { id: "p8", name: "Coffee Maker", category: "Home & Kitchen", price: 54.99, emoji: "\u2615", image: unsplash("1495474472287-4d71bcdd2085") },
  { id: "p9", name: "Table Lamp", category: "Home & Kitchen", price: 24.99, emoji: "\u{1F4A1}", image: unsplash("1507473885765-e6ed057f782c") },
  { id: "p10", name: "Mystery Novel", category: "Books", price: 14.99, emoji: "\u{1F4D6}", image: unsplash("1544947950-fa07a98d237f") },
  { id: "p11", name: "Cook Book", category: "Books", price: 22.99, emoji: "\u{1F4D5}", image: unsplash("1589998059171-988d887df646") },
  { id: "p12", name: "Sci-Fi Anthology", category: "Books", price: 17.99, emoji: "\u{1F4D7}", image: unsplash("1512820790803-83ca734da794") },
  // Six shoe brands at varied prices \u2014 lets a task say "find the shoe priced
  // between $X and $Y" with exactly one match, testing search + price-range filter
  // + picking the right item out of several very similar ones.
  { id: "f1", name: "Nike Air Runner", category: "Footwear", price: 89.99, emoji: "\u{1F45F}", image: unsplash("1542291026-7eec264c27ff") },
  { id: "f2", name: "Adidas Trail Blazer", category: "Footwear", price: 105.0, emoji: "\u{1F45F}", image: unsplash("1595950653106-6c9ebd614d3a") },
  { id: "f3", name: "Puma Street Comfort", category: "Footwear", price: 65.0, emoji: "\u{1F45F}", image: unsplash("1560769629-975ec94e6a86") },
  { id: "f4", name: "Reebok Classic Move", category: "Footwear", price: 72.5, emoji: "\u{1F45F}", image: unsplash("1460353581641-37baddab0fa2") },
  { id: "f5", name: "New Balance Cushion Pro", category: "Footwear", price: 95.0, emoji: "\u{1F45F}", image: unsplash("1606107557195-0e29a4b5b4aa") },
  { id: "f6", name: "Bata Everyday Walk", category: "Footwear", price: 45.0, emoji: "\u{1F45F}", image: unsplash("1600185365483-26d7a4cc7519") },
];

export const CATEGORIES = ["All", "Electronics", "Clothing", "Footwear", "Home & Kitchen", "Books"] as const;

export function getProduct(id: string): StoreProduct | undefined {
  return PRODUCTS.find((p) => p.id === id);
}
