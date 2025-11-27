import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { calculateTotal } from "@/lib/checkout-api";
import { ShippingAddress } from "@/store/checkout-store";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  image?: string;
}

interface RequestData {
  items: CartItem[];
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
});

export async function POST(request: NextRequest) {
  try {
    const data: RequestData = await request.json();
    const { items, shippingAddress, billingAddress } = data;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { message: "Cart is empty. Cannot create payment intent." },
        { status: 400 }
      );
    }

    // Calculate subtotal from items
    const subtotal = items.reduce((total: number, item: CartItem) => {
      return total + item.price * item.quantity;
    }, 0);

    // Calculate total amount (including shipping and tax)
    const totalAmount = calculateTotal(subtotal);

    // Compress order items to fit within Stripe's 500 character metadata limit
    const compressedOrderItems = compressOrderItems(items);
    const compressedShippingAddress = compressAddress(shippingAddress);
    const compressedBillingAddress = compressAddress(
      billingAddress || shippingAddress
    );

    // Validate metadata length before creating payment intent
    const metadata = {
      orderItems: compressedOrderItems,
      shippingAddress: compressedShippingAddress,
      billingAddress: compressedBillingAddress,
    };

    // Check if any metadata value exceeds 500 characters
    for (const [key, value] of Object.entries(metadata)) {
      if (value.length > 500) {
        console.error(
          `Metadata ${key} exceeds 500 characters:`,
          value.length,
          value
        );
        throw new Error(
          `Metadata ${key} exceeds 500 character limit (${value.length} characters)`
        );
      }
    }

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Convert to cents
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
      payment_method_options: {
        card: {
          // Make card the preferred method
          setup_future_usage: "off_session",
        },
      },
      metadata,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      totalAmount,
    });
  } catch (error: unknown) {
    console.error("Payment intent creation error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

// Helper function to compress order items data
function compressOrderItems(items: CartItem[]): string {
  // Create a compact representation of order items
  const compressed = items.map((item) => ({
    i: item.id, // 'i' for id
    q: item.quantity, // 'q' for quantity
    s: item.size, // 's' for size
    c: item.color, // 'c' for color
    p: item.price, // 'p' for price (added for completeness)
  }));

  const jsonString = JSON.stringify(compressed);

  // If still over 500 characters, truncate or use a more aggressive approach
  if (jsonString.length > 500) {
    // Remove price field if it's still too long
    const moreCompressed = items.map((item) => ({
      i: item.id,
      q: item.quantity,
      s: item.size,
      c: item.color,
    }));

    const moreCompressedString = JSON.stringify(moreCompressed);

    if (moreCompressedString.length > 500) {
      // As a last resort, use a simple format: id:quantity:size:color,id:quantity:size:color
      const simpleFormat = items
        .map((item) => `${item.id}:${item.quantity}:${item.size}:${item.color}`)
        .join(",");

      // Truncate if still too long (very unlikely)
      return simpleFormat.length > 500
        ? simpleFormat.substring(0, 500)
        : simpleFormat;
    }

    return moreCompressedString;
  }

  return jsonString;
}

// Helper function to compress address data
function compressAddress(address: ShippingAddress): string {
  if (!address) return "";

  // Create a compact address representation
  const compressed = {
    fn: address.firstName, // 'fn' for firstName
    ln: address.lastName, // 'ln' for lastName
    e: address.email, // 'e' for email
    p: address.phone, // 'p' for phone
    a: address.address, // 'a' for address
    c: address.city, // 'c' for city
    s: address.state, // 's' for state
    z: address.zipCode, // 'z' for zipCode
    co: address.country, // 'co' for country
  };

  const jsonString = JSON.stringify(compressed);

  // If over 500 characters (unlikely for addresses), use simple format
  if (jsonString.length > 500) {
    const simpleFormat = `${address.firstName} ${address.lastName},${address.email},${address.address},${address.city},${address.state} ${address.zipCode}`;
    return simpleFormat.length > 500
      ? simpleFormat.substring(0, 500)
      : simpleFormat;
  }

  return jsonString;
}
