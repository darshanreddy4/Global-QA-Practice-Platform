/** Real, cross-tab (BroadcastChannel) event bus between the standalone AwesomeMart
 * storefront (/store/*) and the ECOM-001 mission page that launched it. */
export const STORE_CHANNEL_NAME = "qa-ecommerce-mission-channel";

export type StoreEvent =
  | { type: "favorite"; productId: string; productName: string; favorited: boolean }
  | { type: "cart-updated"; lineCount: number; subtotal: number }
  | { type: "order-placed"; orderId: string; total: number; shippingFullName: string; shippingCity: string; paymentMethod: string; productNames: string[]; deliveryDate: string }
  | { type: "order-cancelled"; orderId: string }
  | { type: "delivery-status"; orderId: string; status: string };

export function postStoreEvent(event: StoreEvent) {
  const channel = new BroadcastChannel(STORE_CHANNEL_NAME);
  channel.postMessage(event);
  channel.close();
}
