import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useAuthStore } from "./auth-store";

export interface CartItem {
  id: string;
  productId: string;
  productVariantId: string;
  name: string;
  price: number;
  image: string;
  size: string; // This will now represent the selected size
  color: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (
    item: Omit<CartItem, "id" | "quantity" | "productId" | "size"> & {
      productId: string;
      quantity?: number;
      size: string; // Ensure selected size is passed when adding
    }
  ) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  syncCartWithServer: (
    items?: CartItem[],
    action?: "sync" | "merge"
  ) => Promise<void>;
  fetchCart: () => Promise<void>;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (newItem) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) =>
              item.productId === newItem.productId &&
              item.size === newItem.size &&
              item.color === newItem.color
          );

          let updatedItems;
          if (existingItem) {
            updatedItems = state.items.map((item) =>
              item.id === existingItem.id
                ? { ...item, quantity: item.quantity + (newItem.quantity || 1) }
                : item
            );
          } else {
            const id = `${newItem.productId}-${newItem.size}-${newItem.color}`;
            updatedItems = [
              ...state.items,
              {
                ...newItem,
                id,
                quantity: newItem.quantity || 1,
                size: newItem.size,
              },
            ];
          }

          if (useAuthStore.getState().isAuthenticated) {
            get().syncCartWithServer(updatedItems, "sync");
          }
          return { items: updatedItems };
        });
      },

      removeItem: (id) => {
        set((state) => {
          const updatedItems = state.items.filter((item) => item.id !== id);
          if (useAuthStore.getState().isAuthenticated) {
            get().syncCartWithServer(updatedItems, "sync");
          }
          return { items: updatedItems };
        });
      },

      updateQuantity: (id, quantity) => {
        set((state) => {
          const updatedItems = state.items
            .map((item) => (item.id === id ? { ...item, quantity } : item))
            .filter((item) => item.quantity > 0);
          if (useAuthStore.getState().isAuthenticated) {
            get().syncCartWithServer(updatedItems, "sync");
          }
          return { items: updatedItems };
        });
      },

      clearCart: () => {
        // The server-side cart should be cleared by the logout API.
        // This client-side clear is for local state only.
        set({ items: [] });
      },

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      syncCartWithServer: async (itemsArg, action = "sync") => {
        try {
          const items = itemsArg ?? get().items;
          const res = await fetch("/api/cart/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items, action }),
            credentials: "include",
          });
          if (res.ok) {
            const data = await res.json();
            set({ items: data.items });
          }
        } catch (error) {
          // console.error("Failed to sync cart:", error); // Keep for debugging if needed
        }
      },

      fetchCart: async () => {
        try {
          const res = await fetch("/api/cart/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: [], action: "fetch" }),
            credentials: "include",
          });
          if (res.ok) {
            const data = await res.json();
            set({ items: data.items });
          }
        } catch (error) {
          // console.error("Failed to fetch cart:", error); // Keep for debugging if needed
        }
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          if (useAuthStore.getState().isAuthenticated) {
            return null;
          }
          return localStorage.getItem(name);
        },
        setItem: (name, value) => {
          if (!useAuthStore.getState().isAuthenticated) {
            localStorage.setItem(name, value);
          }
        },
        removeItem: (name) => localStorage.removeItem(name),
      })),
    }
  )
);
