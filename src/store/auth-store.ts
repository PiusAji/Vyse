// auth-store.ts - FIXED VERSION
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useCheckoutStore } from "@/store/checkout-store";
import { useCartStore } from "@/store/cart-store";
import type { CartItem } from "@/store/cart-store";

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async (user) => {
        console.log("AuthStore: login - starting for user:", user.email);
        const guestItems = useCartStore.getState().items;
        console.log("AuthStore: login - guest items before login:", guestItems);

        set({ user, isAuthenticated: true });
        console.log("AuthStore: login - user set, fetching server cart...");
        await useCartStore.getState().fetchCart(); // Fetch user's cart first
        console.log("AuthStore: login - server cart fetched.");

        if (guestItems.length > 0) {
          console.log(
            "AuthStore: login - merging guest items with server cart."
          );
          const { items: userItems } = useCartStore.getState();
          const mergedItems: CartItem[] = [...userItems];

          guestItems.forEach((guestItem) => {
            const existingItem = mergedItems.find(
              (item) =>
                item.productId === guestItem.productId &&
                item.size === guestItem.size &&
                item.color === guestItem.color
            );
            if (existingItem) {
              existingItem.quantity += guestItem.quantity;
            } else {
              mergedItems.push(guestItem);
            }
          });
          console.log("AuthStore: login - merged items:", mergedItems);
          await useCartStore
            .getState()
            .syncCartWithServer(mergedItems, "merge");
          console.log("AuthStore: login - merged items synced to server.");
        }
        console.log("AuthStore: login - completed.");
      },
      logout: async () => {
        try {
          // Call logout API first to invalidate session on server
          await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include", // Ensure cookie is sent
          });
        } catch (error) {
          console.error("Logout API call failed:", error);
          // Continue with local state clear even if API call fails
        } finally {
          // Clear local state
          useCartStore.getState().clearCart();
          useCheckoutStore.getState().clearShippingAddress();
          set({ user: null, isAuthenticated: false });
        }
      },
      setUser: (user) => {
        set({ user, isAuthenticated: true });
        useCartStore.getState().fetchCart();
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
