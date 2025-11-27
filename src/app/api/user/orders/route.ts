import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const decoded = verifyAuth(request);

    if (!decoded) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { userId: decoded.userId },
      orderBy: { createdAt: "desc" },
      include: {
        orderItems: {
          select: {
            id: true,
            orderId: true,
            productVariantId: true,
            quantity: true,
            price: true,
            selectedSize: true, // Now explicitly selected as a scalar field
            productVariant: {
              select: {
                id: true,
                color: true,
                images: true,
                product: {
                  select: {
                    id: true,
                    name: true,
                    price: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    console.log("Fetched orders from Prisma:", JSON.stringify(orders, null, 2)); // Added log

    // Parse JSON strings and format for frontend
    const formattedOrders = orders.map((order) => ({
      ...order,
      items: order.orderItems.map((item) => ({
        ...item,
        selectedOptions: {
          size: item.selectedSize, // Use the stored selected size
          color: item.productVariant.color,
        },
        product: item.productVariant.product
          ? {
              ...item.productVariant.product,
              images:
                typeof item.productVariant.images === "string"
                  ? JSON.parse(item.productVariant.images)
                  : item.productVariant.images,
            }
          : null,
      })),
    }));

    return NextResponse.json({ orders: formattedOrders });
  } catch (error) {
    console.error("Orders fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
