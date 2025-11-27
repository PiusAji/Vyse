// hooks/useCartHydration.ts
import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";
import { useAuthHydration } from "@/hooks/use-auth-hydration";

export const useCartHydration = () => {
  const [isCartHydrated, setIsCartHydrated] = useState(false);
  const isAuthHydrated = useAuthHydration();
  const { isAuthenticated } = useAuthStore();
  const fetchCart = useCartStore((state) => state.fetchCart);

  useEffect(() => {
    if (useCartStore.persist.hasHydrated()) {
      setIsCartHydrated(true);
      return;
    }

    // Listen for hydration completion
    const unsubscribe = useCartStore.persist.onFinishHydration(() => {
      setIsCartHydrated(true);
    });

    // Trigger rehydration only if not already hydrated
    if (!useCartStore.persist.hasHydrated()) {
      useCartStore.persist.rehydrate();
    }

    return unsubscribe;
  }, []); // Run once on mount

  useEffect(() => {
    if (isCartHydrated && isAuthHydrated && isAuthenticated) {
      // console.log("Cart and Auth hydrated, user authenticated. Fetching cart..."); // Keep for debugging if needed
      fetchCart();
    }
  }, [isCartHydrated, isAuthHydrated, isAuthenticated, fetchCart]);

  return isCartHydrated;
};
