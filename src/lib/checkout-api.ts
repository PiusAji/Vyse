import { ShippingAddress } from "@/store/checkout-store";

export interface CreatePaymentIntentData {
  items: Array<{
    id: string;
    productId: string;
    productVariantId: string; // Add this
    name: string;
    price: number;
    image?: string; // Make image optional
    quantity: number;
    size: string;
    color: string;
  }>;
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
}

export interface CreateOrderData extends CreatePaymentIntentData {
  paymentIntentId: string;
  totalAmount: number;
}

// Create Stripe payment intent
export async function createPaymentIntent(data: CreatePaymentIntentData) {
  const response = await fetch("/api/checkout/create-payment-intent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create payment intent");
  }

  return response.json();
}

// Create order after successful payment
export async function createOrder(data: CreateOrderData) {
  const response = await fetch("/api/checkout/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create order");
  }

  return response.json();
}

// Calculate shipping cost
export function calculateShipping(subtotal: number): number {
  return subtotal >= 100 ? 0 : 9.99;
}

// Calculate tax (8.5% for example)
export function calculateTax(subtotal: number): number {
  return subtotal * 0.085;
}

// Calculate total
export function calculateTotal(subtotal: number): number {
  const shipping = calculateShipping(subtotal);
  const tax = calculateTax(subtotal);
  return subtotal + shipping + tax;
}
