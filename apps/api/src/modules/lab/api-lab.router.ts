import { Router } from "express";
import { HttpError } from "../../middleware/errorHandler";
import { requireRole } from "../auth/auth.router";

export const apiLabRouter = Router();

type Product = { id: string; name: string; category: string; price: number };

const SEED_PRODUCTS: Product[] = [
  { id: "p1", name: "Wireless Keyboard", category: "Electronics", price: 49.99 },
  { id: "p2", name: "27in Monitor", category: "Electronics", price: 229.0 },
  { id: "p3", name: "Standing Desk", category: "Furniture", price: 349.0 },
  { id: "p4", name: "Ergo Chair", category: "Furniture", price: 279.0 },
  { id: "p5", name: "Rain Jacket", category: "Apparel", price: 89.5 },
];

const sessionProducts = new Map<string, Product[]>();
let idCounter = 100;

function getStore(sessionKey: string): Product[] {
  if (!sessionProducts.has(sessionKey)) {
    sessionProducts.set(sessionKey, SEED_PRODUCTS.map((p) => ({ ...p })));
  }
  return sessionProducts.get(sessionKey)!;
}

function sessionKeyOf(req: any): string {
  return req.header("X-Session-Key") ?? "anonymous";
}

/** Resets a session's product catalog back to seed data (called from /api/lab/reset). */
export function resetProductsForSession(sessionKey: string) {
  sessionProducts.delete(sessionKey);
}

export const CATEGORIES = ["Electronics", "Furniture", "Apparel"];

apiLabRouter.get("/categories", (req, res) => {
  res.json({ data: CATEGORIES });
});

apiLabRouter.get("/products", (req, res) => {
  const store = getStore(sessionKeyOf(req));
  const category = req.query.category as string | undefined;
  const data = category ? store.filter((p) => p.category === category) : store;
  res.json({ data });
});

apiLabRouter.post("/products", (req, res, next) => {
  const { name, price, category } = req.body ?? {};
  if (!name || typeof price !== "number") {
    return next(new HttpError(400, "Bad Request", "name (string) and price (number) are required."));
  }
  const store = getStore(sessionKeyOf(req));
  const product: Product = { id: `p${++idCounter}`, name, category: category ?? "Uncategorized", price };
  store.push(product);
  res.status(201).location(`/api/lab/products/${product.id}`).json({ data: product });
});

apiLabRouter.get("/products/:id", (req, res, next) => {
  const store = getStore(sessionKeyOf(req));
  const product = store.find((p) => p.id === req.params.id);
  if (!product) return next(new HttpError(404, "Not Found", `Product '${req.params.id}' does not exist.`));
  res.json({ data: product });
});

apiLabRouter.put("/products/:id", (req, res, next) => {
  const store = getStore(sessionKeyOf(req));
  const index = store.findIndex((p) => p.id === req.params.id);
  if (index === -1) return next(new HttpError(404, "Not Found", `Product '${req.params.id}' does not exist.`));
  const { name, price, category } = req.body ?? {};
  if (!name || typeof price !== "number" || !category) {
    return next(new HttpError(400, "Bad Request", "PUT requires the full resource: name, price, category."));
  }
  store[index] = { id: req.params.id, name, price, category };
  res.json({ data: store[index] });
});

apiLabRouter.patch("/products/:id", (req, res, next) => {
  const store = getStore(sessionKeyOf(req));
  const index = store.findIndex((p) => p.id === req.params.id);
  if (index === -1) return next(new HttpError(404, "Not Found", `Product '${req.params.id}' does not exist.`));
  store[index] = { ...store[index], ...req.body };
  res.json({ data: store[index] });
});

apiLabRouter.delete("/products/:id", (req, res, next) => {
  const store = getStore(sessionKeyOf(req));
  const index = store.findIndex((p) => p.id === req.params.id);
  if (index === -1) return next(new HttpError(404, "Not Found", `Product '${req.params.id}' does not exist.`));
  store.splice(index, 1);
  res.status(204).send();
});

/** Backs NETWORK-005: requires `Authorization: Bearer qa-lab-token`. */
apiLabRouter.get("/secure-report", (req, res, next) => {
  const auth = req.header("Authorization");
  if (auth !== "Bearer qa-lab-token") {
    return next(new HttpError(401, "Unauthorized", "Missing or invalid bearer token."));
  }
  res.json({ data: { report: "Confidential Q3 Summary", generatedFor: "authenticated-caller" } });
});

/** Backs MOCK-001: deterministic real response, intended to be overridden via test-framework interception. */
apiLabRouter.get("/stock-price", (req, res) => {
  res.json({ data: { symbol: "QALB", price: 142.5 } });
});

/** Backs AUTH-004: real role-based access control. Requires an authenticated 'admin' session. */
apiLabRouter.get("/admin-report", requireRole("admin"), (req, res) => {
  res.json({ data: { report: "Platform-wide usage report", restrictedTo: "admin" } });
});
