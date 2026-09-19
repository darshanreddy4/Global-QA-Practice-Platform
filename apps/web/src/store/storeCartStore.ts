import { create } from "zustand";

export type CartLine = { productId: string; qty: number };
export type OrderDetails = {
  orderId: string;
  total: number;
  shippingFullName: string;
  shippingCity: string;
  paymentMethod: "card" | "upi" | "cod";
};

type StoreCartState = {
  favorites: Set<string>;
  cart: CartLine[];
  lastOrder: OrderDetails | null;
  deliveryStatusByOrderId: Record<string, string>;
  toggleFavorite: (productId: string) => void;
  addToCart: (productId: string, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  placeOrder: (order: OrderDetails) => void;
  setDeliveryStatus: (orderId: string, status: string) => void;
};

/**
 * Shared across the standalone /store/* pages (all part of the same tab/session
 * once opened via window.open), so cart/favorites/order state survives normal
 * client-side navigation between the storefront's own pages.
 */
export const useStoreCartStore = create<StoreCartState>((set) => ({
  favorites: new Set(),
  cart: [],
  lastOrder: null,
  deliveryStatusByOrderId: {},
  toggleFavorite: (productId) =>
    set((s) => {
      const next = new Set(s.favorites);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return { favorites: next };
    }),
  addToCart: (productId, qty = 1) =>
    set((s) => {
      const existing = s.cart.find((l) => l.productId === productId);
      if (existing) {
        return { cart: s.cart.map((l) => (l.productId === productId ? { ...l, qty: l.qty + qty } : l)) };
      }
      return { cart: [...s.cart, { productId, qty }] };
    }),
  setQty: (productId, qty) =>
    set((s) => ({ cart: s.cart.map((l) => (l.productId === productId ? { ...l, qty: Math.max(1, qty) } : l)) })),
  removeFromCart: (productId) => set((s) => ({ cart: s.cart.filter((l) => l.productId !== productId) })),
  clearCart: () => set({ cart: [] }),
  placeOrder: (order) => set({ lastOrder: order }),
  setDeliveryStatus: (orderId, status) =>
    set((s) => ({ deliveryStatusByOrderId: { ...s.deliveryStatusByOrderId, [orderId]: status } })),
}));
