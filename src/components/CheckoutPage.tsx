"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useCheckoutStore } from "@/store/checkout-store";
import { useCartStore, type CartItem } from "@/store/cart-store";
import {
  createPaymentIntent,
  calculateTotal,
  calculateShipping,
  calculateTax,
} from "@/lib/checkout-api";
import Link from "next/link";
import ShippingForm from "./ShippingForm";
import PaymentForm from "./PaymentForm";
import OrderSummary from "./OrderSummary";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function CheckoutPage() {
  const {
    currentStep,
    setPaymentIntentId,
    setTotalAmount,
    setCurrentStep,
    clearCheckout,
  } = useCheckoutStore();
  const { items, fetchCart } = useCartStore();
  const [clientSecret, setClientSecret] = useState("");
  const [isCartLoaded, setIsCartLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Calculate amounts
  const subtotal = items.reduce(
    (total: number, item: CartItem) => total + item.price * item.quantity,
    0
  );
  const shipping = calculateShipping(subtotal);
  const tax = calculateTax(subtotal);
  const total = calculateTotal(subtotal);

  // Fetch cart on component mount to ensure it's up-to-date
  useEffect(() => {
    const loadCart = async () => {
      await fetchCart();
      setIsCartLoaded(true);
    };
    loadCart();
  }, [fetchCart]);

  // Set total in store
  useEffect(() => {
    setTotalAmount(total);
  }, [total, setTotalAmount]);

  // Redirect if no items after cart is loaded
  if (isCartLoaded && items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground mb-4">
            Your cart is empty
          </h1>
          <p className="text-muted-foreground mb-6">
            Add some items to your cart before checking out.
          </p>
          <Link
            href="/products"
            className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors"
          >
            Shop Now
          </Link>
        </div>
      </div>
    );
  }

  const handleShippingContinue = async (options?: {
    saveShippingAddress: boolean;
  }) => {
    setIsLoading(true);
    setError("");

    try {
      const { shippingAddress } = useCheckoutStore.getState();

      // Save shipping address to profile if requested and user is logged in
      if (options?.saveShippingAddress) {
        try {
          const { saveShippingAddress } = await import("@/lib/profile-api");
          await saveShippingAddress({
            firstName: shippingAddress.firstName,
            lastName: shippingAddress.lastName,
            email: shippingAddress.email,
            phone: shippingAddress.phone || "",
            street: shippingAddress.address,
            city: shippingAddress.city,
            state: shippingAddress.state,
            zipCode: shippingAddress.zipCode,
            country: shippingAddress.country || "US",
          });
        } catch (error) {
          console.error("Failed to save shipping address:", error);
        }
      }

      if (items.length === 0) {
        setError("Your cart is empty. Please add items before proceeding.");
        setIsLoading(false);
        return;
      }

      const response = await createPaymentIntent({
        items,
        shippingAddress,
      });

      setClientSecret(response.clientSecret);
      setPaymentIntentId(response.paymentIntentId);
      setCurrentStep("payment");
    } catch (err: unknown) {
      console.error("Payment intent creation error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Payment processing failed";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = (orderId: string) => {
    clearCheckout();
    window.location.href = `/profile?tab=orders&paymentSuccess=true`;
  };

  const handleBackToShipping = () => {
    setCurrentStep("shipping");
    setClientSecret("");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep === "shipping" ||
                  currentStep === "payment" ||
                  currentStep === "confirmation"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                1
              </div>
              <span
                className={
                  currentStep === "shipping" ||
                  currentStep === "payment" ||
                  currentStep === "confirmation"
                    ? "text-foreground"
                    : "text-muted-foreground"
                }
              >
                Shipping
              </span>

              <div className="w-12 h-px bg-border"></div>

              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep === "payment" || currentStep === "confirmation"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                2
              </div>
              <span
                className={
                  currentStep === "payment" || currentStep === "confirmation"
                    ? "text-foreground"
                    : "text-muted-foreground"
                }
              >
                Payment
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {error && (
                <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-destructive text-sm">{error}</p>
                </div>
              )}

              {currentStep === "shipping" && (
                <ShippingForm onContinue={handleShippingContinue} />
              )}

              {currentStep === "payment" && clientSecret && (
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: "stripe",
                      variables: {
                        colorPrimary: "#d4a574", // Replace with your actual primary color hex
                        colorText: "hsl(var(--foreground))",
                        colorBackground: "hsl(var(--background))",
                        colorDanger: "hsl(var(--destructive))",
                        fontFamily: "inherit",
                        borderRadius: "0.5rem",
                      },
                    },
                  }}
                >
                  <PaymentForm
                    onSuccess={handlePaymentSuccess}
                    onBack={handleBackToShipping}
                  />
                </Elements>
              )}

              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <OrderSummary
                items={items}
                subtotal={subtotal}
                shipping={shipping}
                tax={tax}
                total={total}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
