import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  try {
    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return NextResponse.json(
        { message: "Missing stripe signature" },
        { status: 400 }
      );
    }

    const body = await request.text();

    // Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { message: "Invalid signature" },
        { status: 400 }
      );
    }

    // Handle payment_intent.succeeded event
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      // Update order status to PAID with retry logic
      try {
        let updatedOrder;
        let retries = 3;

        while (retries > 0) {
          updatedOrder = await prisma.order.updateMany({
            where: {
              paymentIntentId: paymentIntent.id,
            },
            data: {
              status: "PAID",
            },
          });

          if (updatedOrder.count > 0) {
            break;
          }

          retries--;
          if (retries > 0) {
            console.log(
              `Retrying order update for payment intent: ${paymentIntent.id}, attempts left: ${retries}`
            );
            await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
          }
        }

        if (!updatedOrder || updatedOrder.count === 0) {
          console.error(
            "No order found for payment intent after retries:",
            paymentIntent.id
          );
          return NextResponse.json(
            { message: "Order not found" },
            { status: 404 }
          );
        }

        console.log(
          "Successfully updated order status to PAID for payment intent:",
          paymentIntent.id
        );
        return NextResponse.json({ success: true });
      } catch (err) {
        console.error("Failed to update order status:", err);
        return NextResponse.json(
          { message: "Failed to update order status" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
