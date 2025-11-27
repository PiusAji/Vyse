"use client";

import CheckoutPage from "@/components/CheckoutPage";
import { useCartHydration } from "@/hooks/use-cart-hydration";

export default function Checkout() {
  const isHydrated = useCartHydration();

  if (!isHydrated) return null;

  return <CheckoutPage />;
}
