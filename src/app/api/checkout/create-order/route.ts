import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import jwt from "jsonwebtoken";

interface CartItem {
  id: string; // Composite ID: productId-size-color
  productVariantId: string; // New: Product Variant ID
  quantity: number;
  price: number;
  size: string; // Add selected size to the interface
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const {
      items,
      shippingAddress,
      billingAddress,
      paymentIntentId,
      totalAmount,
    } = data;

    console.log(
      "Received items for order creation:",
      JSON.stringify(items, null, 2)
    ); // Add log to inspect items

    // Get user from token (optional - guests can checkout too)
    let userId = null;
    const token = request.cookies.get("token")?.value;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
          userId: string;
        };
        userId = decoded.userId;
      } catch {
        // Continue as guest checkout
      }
    }

    // Validate that all product variant IDs exist in the database
    const productVariantIds = items.map(
      (item: CartItem) => item.productVariantId
    );

    const existingProductVariants = await prisma.productVariant.findMany({
      where: {
        id: { in: productVariantIds },
      },
      select: { id: true },
    });

    const existingProductVariantIds = new Set(
      existingProductVariants.map((pv) => pv.id)
    );
    const missingProductVariantIds = productVariantIds.filter(
      (id: string) => !existingProductVariantIds.has(id)
    );

    if (missingProductVariantIds.length > 0) {
      console.error("Missing product variant IDs:", missingProductVariantIds);
      return NextResponse.json(
        {
          message: `Product variants not found: ${missingProductVariantIds.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    // Log payment intent ID for debugging
    console.log("Creating order with paymentIntentId:", paymentIntentId);

    // Create order
    const order = await prisma.order.create({
      data: {
        userId,
        guestEmail: !userId ? shippingAddress.email : undefined,
        status: "PENDING",
        total: totalAmount,
        shippingAddress: JSON.stringify(shippingAddress),
        billingAddress: JSON.stringify(billingAddress || shippingAddress),
        paymentIntentId: paymentIntentId,
        orderItems: {
          create: items.map((item: CartItem) => ({
            productVariantId: item.productVariantId, // Include productVariantId
            quantity: item.quantity,
            price: item.price,
            selectedSize: item.size, // Save the selected size
          })),
        },
      },
      include: {
        orderItems: {
          include: {
            productVariant: {
              // Include productVariant
              include: {
                product: true, // Then include product through productVariant
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      orderId: order.id,
      order,
    });
  } catch (error: unknown) {
    console.error("Create order error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
