import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAuth } from "@/lib/auth";
import { Prisma, OrderStatus } from "@prisma/client";
import { Address } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    const session = verifyAuth(req);
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const orderId = searchParams.get("orderId");
    const customerName = searchParams.get("customerName");
    const status = searchParams.get("status");
    const dateRange = searchParams.get("dateRange"); // e.g., "2023-01-01,2023-01-31"

    const where: Prisma.OrderWhereInput = {};

    if (orderId) {
      where.id = orderId;
    }

    if (customerName) {
      where.OR = [
        {
          user: { firstName: { contains: customerName } },
        },
        { user: { lastName: { contains: customerName } } },
        { guestEmail: { contains: customerName } },
      ];
    }

    if (status) {
      if (Object.values(OrderStatus).includes(status as OrderStatus)) {
        where.status = status as OrderStatus;
      }
    }

    if (dateRange) {
      const [startDate, endDate] = dateRange.split(",");
      if (startDate && endDate) {
        where.createdAt = {
          gte: new Date(startDate),
          lte: new Date(endDate),
        };
      }
    }

    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            productVariant: {
              include: {
                product: true,
              },
            },
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
    });

    const totalOrders = await prisma.order.count({ where });

    return NextResponse.json({
      orders,
      totalOrders,
      page,
      limit,
      totalPages: Math.ceil(totalOrders / limit),
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = verifyAuth(req);
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const {
      userId,
      guestEmail,
      shippingAddress,
      billingAddress,
      orderItems,
    }: {
      userId?: string;
      guestEmail?: string;
      shippingAddress: Address;
      billingAddress?: Address;
      orderItems: {
        productVariantId: string;
        quantity: number;
        selectedSize?: string;
      }[];
    } = await req.json();

    if (!userId && !guestEmail) {
      return NextResponse.json(
        { message: "Either userId or guestEmail must be provided" },
        { status: 400 }
      );
    }

    if (!shippingAddress) {
      return NextResponse.json(
        { message: "Shipping address is required" },
        { status: 400 }
      );
    }

    if (!orderItems || orderItems.length === 0) {
      return NextResponse.json(
        { message: "Order must contain at least one item" },
        { status: 400 }
      );
    }

    let total = 0;
    const itemsToCreate: Prisma.OrderItemCreateManyOrderInput[] = [];

    await prisma.$transaction(async (tx) => {
      for (const item of orderItems) {
        const productVariant = await tx.productVariant.findUnique({
          where: { id: item.productVariantId },
          include: { product: true },
        });

        if (!productVariant) {
          throw new Error(
            `Product variant with ID ${item.productVariantId} not found`
          );
        }

        if (productVariant.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for product variant ${productVariant.id}`
          );
        }

        // Assuming price is stored on the product, or a fixed price for the variant
        // For simplicity, using product.price. In a real scenario, variant might have its own price or a price adjustment.
        const itemPrice = productVariant.product.price;
        total += itemPrice * item.quantity;

        itemsToCreate.push({
          productVariantId: item.productVariantId,
          quantity: item.quantity,
          price: itemPrice,
          selectedSize: item.selectedSize,
        });

        // Decrease stock
        await tx.productVariant.update({
          where: { id: item.productVariantId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      const newOrder = await tx.order.create({
        data: {
          userId: userId || null,
          guestEmail: guestEmail || null,
          status: OrderStatus.PENDING, // Initial status for admin created orders
          total: total,
          shippingAddress: shippingAddress as unknown as Prisma.InputJsonValue,
          billingAddress: (billingAddress ||
            null) as unknown as Prisma.InputJsonValue,
          orderItems: {
            createMany: {
              data: itemsToCreate,
            },
          },
        },
        include: {
          orderItems: true,
          user: true,
        },
      });
      return NextResponse.json(newOrder, { status: 201 });
    });
    return NextResponse.json(
      { message: "Order created successfully" },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
