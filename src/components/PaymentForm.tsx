"use client";

import { useState } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
  AddressElement,
} from "@stripe/react-stripe-js";
import { useCheckoutStore } from "@/store/checkout-store";
import { createOrder } from "@/lib/checkout-api";

interface PaymentFormProps {
  onSuccess: (orderId: string) => void;
  onBack: () => void;
}

export default function PaymentForm({ onSuccess, onBack }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const {
    items,
    shippingAddress,
    useSameAddress,
    paymentIntentId,
    totalAmount,
  } = useCheckoutStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isElementReady, setIsElementReady] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const paymentElement = elements.getElement(PaymentElement);
    if (!paymentElement) {
      setError(
        "Payment element is not ready. Please wait a moment and try again."
      );
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment(
        {
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/checkout/success`,
          },
          redirect: "if_required",
        }
      );

      if (stripeError) {
        console.error("Stripe payment error:", stripeError);
        setError(stripeError.message || "An error occurred");
        setIsLoading(false);
        return;
      }

      if (!paymentIntent) {
        setError("Payment intent not received. Please try again.");
        setIsLoading(false);
        return;
      }

      if (paymentIntent.status === "succeeded") {
        const order = await createOrder({
          items,
          shippingAddress,
          billingAddress: useSameAddress ? shippingAddress : undefined,
          paymentIntentId: paymentIntent.id,
          totalAmount,
        });

        onSuccess(order.orderId);
      } else {
        setError(
          `Payment not succeeded. Current status: ${paymentIntent.status}. Please check the order status on the success page if redirected.`
        );
        setIsLoading(false);
      }
    } catch (err: unknown) {
      console.error("Payment processing error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "A processing error occurred";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6 text-foreground tracking-wide">
        Payment Information
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Element */}
        <div>
          <PaymentElement
            options={{
              layout: "tabs",
              paymentMethodOrder: ["card", "cashapp_pay"],
              defaultValues: {
                billingDetails: {
                  address: {
                    country: shippingAddress.country || "US",
                  },
                },
              },
              wallets: {
                applePay: "never",
                googlePay: "never",
              },
            }}
            onReady={() => setIsElementReady(true)}
          />
        </div>

        {/* Billing Address (if different from shipping) */}
        {!useSameAddress && (
          <div>
            <h3 className="text-lg font-medium mb-4 text-foreground">
              Billing Address
            </h3>
            <AddressElement
              options={{
                mode: "billing",
                allowedCountries: ["US"],
              }}
            />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="text-destructive text-sm p-3 bg-destructive/10 rounded-md border border-destructive/20">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onBack}
            disabled={isLoading}
            className="flex-1 border border-input bg-background text-foreground py-3 px-4 rounded-md 
              font-medium tracking-wide hover:bg-accent transition-colors
              focus:outline-none focus:ring-2 focus:ring-ring
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back to Shipping
          </button>

          <button
            type="submit"
            disabled={!stripe || !elements || !isElementReady || isLoading}
            className="flex-1 bg-primary text-primary-foreground py-3 px-4 rounded-md
              font-medium tracking-wide hover:bg-primary/90 transition-colors
              focus:outline-none focus:ring-2 focus:ring-ring
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Processing..." : `Pay $${totalAmount.toFixed(2)}`}
          </button>
        </div>
      </form>
    </div>
  );
}
