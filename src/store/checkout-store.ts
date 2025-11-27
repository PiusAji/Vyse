import { create } from "zustand";

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface CartItem {
  id: string; // Composite ID: productId-size-color
  productId: string; // Add productId
  productVariantId: string; // New: Product Variant ID
  name: string;
  price: number;
  quantity: number;
  image?: string; // Make image optional
  size: string; // Add selected size to the interface
  color: string; // Add color
}

import { CartItem as CartStoreItem } from "./cart-store";

export interface CheckoutState {
  // Cart items
  items: CartItem[];

  // Shipping info
  shippingAddress: ShippingAddress;
  billingAddress: ShippingAddress | null;
  useSameAddress: boolean;

  // Payment info
  paymentIntentId: string;
  totalAmount: number;

  // Order processing
  isProcessing: boolean;
  currentStep: "shipping" | "payment" | "confirmation";
  orderId: string | null;

  // Actions
  setItems: (items: CartItem[]) => void;
  setShippingAddress: (address: ShippingAddress) => void;
  setBillingAddress: (address: ShippingAddress | null) => void;
  setUseSameAddress: (same: boolean) => void;
  setPaymentIntentId: (id: string) => void;
  setTotalAmount: (amount: number) => void;
  setCurrentStep: (step: "shipping" | "payment" | "confirmation") => void;
  setProcessing: (processing: boolean) => void;
  setOrderId: (id: string) => void;
  clearCheckout: () => void;
  resetCheckout: () => void;
  initializeCheckout: (cartItems: CartStoreItem[]) => void;
  clearShippingAddress: () => void;
}

const initialShippingAddress: ShippingAddress = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  country: "US",
};

export const useCheckoutStore = create<CheckoutState>((set) => ({
  items: [],
  shippingAddress: initialShippingAddress,
  billingAddress: null,
  useSameAddress: true,
  paymentIntentId: "",
  totalAmount: 0,
  isProcessing: false,
  currentStep: "shipping",
  orderId: null,

  setItems: (items) => set({ items }),
  setShippingAddress: (address) => set({ shippingAddress: address }),
  setBillingAddress: (address) => set({ billingAddress: address }),
  setUseSameAddress: (same) => set({ useSameAddress: same }),
  setPaymentIntentId: (id) => set({ paymentIntentId: id }),
  setTotalAmount: (amount) => set({ totalAmount: amount }),
  setCurrentStep: (step) => set({ currentStep: step }),
  setProcessing: (processing) => set({ isProcessing: processing }),
  setOrderId: (id) => set({ orderId: id }),

  initializeCheckout: (cartItems) => {
    const checkoutItems = cartItems.map((item) => ({
      id: item.id,
      productId: item.productId, // Include productId
      productVariantId: item.productVariantId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      size: item.size,
      color: item.color, // Include color
    }));
    set({ items: checkoutItems, currentStep: "shipping" });
  },

  clearCheckout: () =>
    set({
      items: [],
      shippingAddress: initialShippingAddress,
      billingAddress: null,
      useSameAddress: true,
      paymentIntentId: "",
      totalAmount: 0,
      isProcessing: false,
      currentStep: "shipping",
      orderId: null,
    }),

  resetCheckout: () =>
    set({
      shippingAddress: initialShippingAddress,
      billingAddress: null,
      useSameAddress: true,
      paymentIntentId: "",
      totalAmount: 0,
      isProcessing: false,
      currentStep: "shipping",
      orderId: null,
      // Keep items - user might want to retry checkout
    }),

  clearShippingAddress: () => set({ shippingAddress: initialShippingAddress }),
}));
