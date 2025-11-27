// src/components/cart-drawer-fixed.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart-store";
import { useCheckoutStore } from "@/store/checkout-store";
import { useCartHydration } from "@/hooks/use-cart-hydration";
import { useAuthStore } from "@/store/auth-store";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const isHydrated = useCartHydration();
  const router = useRouter();
  const { initializeCheckout } = useCheckoutStore();
  const { isAuthenticated } = useAuthStore();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isAccountSwitching, setIsAccountSwitching] = useState(false);

  // Handle account switching
  useEffect(() => {
    const unsubscribe = useAuthStore.subscribe((state) => {
      if (state.isAuthenticated) {
        setIsAccountSwitching(true);
        useCartStore
          .getState()
          .fetchCart()
          .catch(() => setSyncError("Failed to load cart"))
          .finally(() => setIsAccountSwitching(false));
      }
    });
    return () => unsubscribe();
  }, []);
  const {
    items,
    updateQuantity,
    removeItem,
    getTotalItems,
    getTotalPrice,
    clearCart,
  } = useCartStore();

  // Handle ESC key and scroll prevention
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);

      // Prevent body scroll
      document.body.style.overflow = "hidden";

      return () => {
        document.removeEventListener("keydown", handleEscape);
        // Restore body scroll
        document.body.style.overflow = "unset";
      };
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isHydrated) return null;

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();
  const shipping = totalPrice > 100 ? 0 : 9.99;
  const tax = totalPrice * 0.08;
  const finalTotal = totalPrice + shipping + tax;

  const handleCheckout = async () => {
    try {
      setSyncError(null);
      if (isAuthenticated) {
        setIsSyncing(true);
        try {
          await useCartStore.getState().syncCartWithServer();
        } catch (error) {
          setSyncError("Failed to sync cart. Please try again.");
          return;
        }
      }
      initializeCheckout(items);
      onClose();
      router.push("/checkout");
    } catch (error) {
      console.error("Checkout failed:", error);
      setSyncError("Checkout failed. Please try again.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity z-[100] ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-screen w-full max-w-md bg-card border-l border-border shadow-2xl transform transition-transform z-[101] flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card flex-shrink-0">
          <h2 className="text-lg font-semibold text-card-foreground">
            Shopping Cart ({totalItems})
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors text-muted-foreground"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Empty Cart */}
        {isAccountSwitching ? (
          <div className="flex flex-col items-center justify-center flex-1 p-8 bg-card">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-card-foreground">Loading your cart...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 p-8 bg-card">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H19M7 13v4a2 2 0 002 2h8a2 2 0 002-2v-4m-8 6h8"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-card-foreground">
              Your cart is empty
            </h3>
            <p className="text-muted-foreground text-center mb-6">
              Add some awesome shoes to get started!
            </p>
            <button
              onClick={onClose}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Cart Items - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 bg-card min-h-0 scrollbar-hide">
              <style jsx>{`
                .scrollbar-hide {
                  -ms-overflow-style: none; /* IE and Edge */
                  scrollbar-width: none; /* Firefox */
                }
                .scrollbar-hide::-webkit-scrollbar {
                  display: none; /* Chrome, Safari, Opera */
                }
              `}</style>
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 p-3 bg-muted/50 rounded-lg border border-border/50"
                  >
                    {/* Image */}
                    <div className="w-16 h-16 relative flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate text-card-foreground">
                        {item.name}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.size} • {item.color}
                      </p>
                      <p className="font-semibold text-sm mt-1 text-card-foreground">
                        ${item.price.toFixed(2)}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="w-6 h-6 rounded-full border border-border flex items-center justify-center text-sm hover:bg-accent hover:text-accent-foreground transition-colors text-muted-foreground"
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="text-sm w-8 text-center text-card-foreground font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="w-6 h-6 rounded-full border border-border flex items-center justify-center text-sm hover:bg-accent hover:text-accent-foreground transition-colors text-muted-foreground"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Remove & Total */}
                    <div className="text-right">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-destructive hover:text-destructive/80 p-1 mb-2 transition-colors"
                        title="Remove item"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                      <p className="text-sm font-semibold text-card-foreground">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer - Fixed */}
            <div className="border-t border-border p-4 bg-card flex-shrink-0">
              {/* Totals */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-card-foreground font-medium">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-card-foreground font-medium">
                    {shipping === 0 ? (
                      <span className="text-primary font-semibold">FREE</span>
                    ) : (
                      `$${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="text-card-foreground font-medium">
                    ${tax.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between font-semibold pt-2 border-t border-border">
                  <span className="text-card-foreground">Total</span>
                  <span className="text-card-foreground">
                    ${finalTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Free Shipping Notice */}
              {shipping > 0 && (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-4">
                  <p className="text-xs text-primary font-medium">
                    🚚 Add ${(100 - totalPrice).toFixed(2)} more for FREE
                    shipping!
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2">
                {syncError && (
                  <div className="text-destructive text-sm mb-2">
                    {syncError}
                  </div>
                )}
                <button
                  onClick={handleCheckout}
                  disabled={isSyncing}
                  className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSyncing ? "Syncing Cart..." : "Proceed to Checkout"}
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={clearCart}
                    className="flex-1 bg-secondary text-secondary-foreground py-2 rounded-lg text-sm hover:bg-secondary/80 transition-colors font-medium"
                  >
                    Clear Cart
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 border border-border bg-muted text-muted-foreground py-2 rounded-lg text-sm hover:bg-accent hover:text-accent-foreground transition-colors font-medium"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
