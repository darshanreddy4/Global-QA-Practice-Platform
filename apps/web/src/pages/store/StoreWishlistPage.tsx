import React, { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../design-system";
import { useStoreCartStore } from "../../store/storeCartStore";
import { postStoreEvent } from "../../services/storeBroadcast";
import { PRODUCTS, getProduct } from "./storeData";

/** Real wishlist page \u2014 previously unreachable (the header only showed a favorites
 * COUNT with no link). Lists every favorited product with a direct "Add to Cart"
 * so a wishlisted item can go straight into the cart from here. */
export function StoreWishlistPage() {
  const navigate = useNavigate();
  const { favorites, cart, toggleFavorite, addToCart } = useStoreCartStore();

  const wishlisted = useMemo(
    () => PRODUCTS.filter((p) => favorites.has(p.id)),
    [favorites]
  );

  const onAddToCart = (id: string) => {
    addToCart(id, 1);
    const next = useStoreCartStore.getState().cart;
    const subtotal = next.reduce((sum, l) => sum + (getProduct(l.productId)?.price ?? 0) * l.qty, 0);
    postStoreEvent({ type: "cart-updated", lineCount: next.length, subtotal });
  };

  const onRemove = (id: string, name: string) => {
    toggleFavorite(id);
    postStoreEvent({ type: "favorite", productId: id, productName: name, favorited: false });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-3">
        <div className="mx-auto flex max-w-3xl items-center gap-4">
          <span className="text-lg font-bold text-brand-700">AwesomeMart</span>
          <Link to="/store" data-testid="back-to-catalog-link" className="text-sm text-brand-600 hover:underline">
            {"\u2190"} Back to catalog
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-6">
        <h1 className="mb-4 text-lg font-semibold text-slate-900">Your Wishlist</h1>
        {wishlisted.length === 0 ? (
          <p className="text-sm text-slate-400" data-testid="wishlist-empty">Nothing wishlisted yet {"\u2014"} favorite a product from the catalog first.</p>
        ) : (
          <div className="space-y-2" data-testid="wishlist-items">
            {wishlisted.map((p) => {
              const cartLine = cart.find((l) => l.productId === p.id);
              return (
                <div key={p.id} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3" data-testid={`wishlist-item-${p.id}`}>
                  <span className="flex h-12 w-12 items-center justify-center rounded-md bg-slate-100 text-2xl">{p.emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">{p.name}</p>
                    <p className="text-xs text-slate-400">{p.category} {"\u00b7"} ${p.price.toFixed(2)}</p>
                  </div>
                  <Button size="sm" data-testid={`wishlist-add-to-cart-${p.id}`} onClick={() => onAddToCart(p.id)}>
                    {cartLine ? `In cart (${cartLine.qty})` : "Add to Cart"}
                  </Button>
                  <button
                    type="button"
                    data-testid={`wishlist-remove-${p.id}`}
                    onClick={() => onRemove(p.id, p.name)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        )}
        {cart.length > 0 && (
          <Button className="mt-4" data-testid="wishlist-go-to-cart-btn" onClick={() => navigate("/store/cart")}>
            Go to Cart
          </Button>
        )}
      </main>
    </div>
  );
}
