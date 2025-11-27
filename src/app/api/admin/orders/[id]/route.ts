import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAuth } from "@/lib/auth";
import { Prisma, OrderStatus, OrderItem } from "@prisma/client";
import { z } from "zod";

// Define Zod schema for Address (replicated from frontend for server-side validation)
const AddressSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "Zip code is required"),
  country: z.string().min(1, "Country is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
});

// Define Zod schema for OrderItem (replicated from frontend for server-side validation)
const OrderItemSchema = z.object({
  id: z.string().optional(), // Optional for new items
  productVariantId: z.string().min(1, "Product variant is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  price: z.number().min(0.01, "Price must be positive"),
  selectedSize: z.string().optional(),
});

// Define Zod schema for the entire Order update payload (replicated from frontend)
const OrderUpdateSchema = z.object({
  guestEmail: z
    .string()
    .email("Invalid guest email")
    .optional()
    .or(z.literal("")),
  status: z.nativeEnum(OrderStatus),
  shippingAddress: z.string(), // Expecting JSON string from frontend
  billingAddress: z.string().optional().or(z.literal("")).nullable(), // Expecting JSON string or null from frontend
  paymentIntentId: z.string().optional().or(z.literal("")),
  orderItems: z.array(OrderItemSchema),
});

// Define Zod schema for Order Status update payload
const OrderStatusUpdateSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = verifyAuth(req);
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
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
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching order details:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = verifyAuth(req);
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    // First, try to validate as a status-only update
    const statusValidationResult = OrderStatusUpdateSchema.safeParse(body);

    if (statusValidationResult.success) {
      const { status } = statusValidationResult.data;
      try {
        const updatedOrder = await prisma.order.update({
          where: { id },
          data: { status },
        });
        return NextResponse.json(updatedOrder);
      } catch (error) {
        console.error("Error updating order status:", error);
        return NextResponse.json(
          { message: "Internal Server Error" },
          { status: 500 }
        );
      }
    }

    // If not a status-only update, try to validate as a comprehensive order update
    const fullUpdateValidationResult = OrderUpdateSchema.safeParse(body);

    if (!fullUpdateValidationResult.success) {
      // If neither schema validates, return a combined error
      const errors = {
        statusUpdate: statusValidationResult.error?.issues || [],
        fullUpdate: fullUpdateValidationResult.error?.issues || [],
      };
      return NextResponse.json(
        { message: "Validation Error", errors },
        { status: 400 }
      );
    }

    const {
      guestEmail,
      status,
      shippingAddress,
      billingAddress,
      paymentIntentId,
      orderItems: newOrderItemsData,
    } = fullUpdateValidationResult.data;

    try {
      const existingOrder = await prisma.order.findUnique({
        where: { id },
        include: { orderItems: true },
      });

      if (!existingOrder) {
        return NextResponse.json(
          { message: "Order not found" },
          { status: 404 }
        );
      }

      // Start a Prisma transaction for atomic updates
      const updatedOrder = await prisma.$transaction(async (tx) => {
        // Update main order details
        const order = await tx.order.update({
          where: { id },
          data: {
            guestEmail: guestEmail === "" ? null : guestEmail,
            status,
            shippingAddress: JSON.parse(shippingAddress),
            billingAddress:
              billingAddress && billingAddress !== ""
                ? JSON.parse(billingAddress)
                : null,
            paymentIntentId: paymentIntentId === "" ? null : paymentIntentId,
            // total will be recalculated based on order items
          },
        });

        // Handle order items: create, update, delete
        const existingOrderItemIds = new Set(
          existingOrder.orderItems.map((item) => item.id)
        );

        const itemsToCreate = newOrderItemsData.filter((item) => !item.id);
        const itemsToUpdate = newOrderItemsData.filter(
          (item) => item.id && existingOrderItemIds.has(item.id)
        );
        const itemsToDelete = existingOrder.orderItems.filter(
          (item) => !newOrderItemsData.some((newItem) => newItem.id === item.id)
        );

        // Delete items
        await Promise.all(
          itemsToDelete.map((item) =>
            tx.orderItem.delete({ where: { id: item.id } })
          )
        );

        // Create new items
        await Promise.all(
          itemsToCreate.map((itemData) =>
            tx.orderItem.create({
              data: {
                orderId: id,
                productVariantId: itemData.productVariantId,
                quantity: itemData.quantity,
                price: itemData.price,
                selectedSize:
                  itemData.selectedSize === "" ? null : itemData.selectedSize,
              },
            })
          )
        );

        // Update existing items
        await Promise.all(
          itemsToUpdate.map((itemData) =>
            tx.orderItem.update({
              where: { id: itemData.id! }, // 'id' is guaranteed to exist for itemsToUpdate
              data: {
                productVariantId: itemData.productVariantId,
                quantity: itemData.quantity,
                price: itemData.price,
                selectedSize:
                  itemData.selectedSize === "" ? null : itemData.selectedSize,
              },
            })
          )
        );

        // Recalculate total based on updated order items
        const latestOrderItems = await tx.orderItem.findMany({
          where: { orderId: id },
        });
        const newTotal = latestOrderItems.reduce(
          (sum, item) => sum + item.quantity * item.price,
          0
        );

        return tx.order.update({
          where: { id },
          data: { total: newTotal },
        });
      });

      return NextResponse.json(updatedOrder);
    } catch (error) {
      console.error("Error updating order:", error);
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { message: "Validation Error", errors: error.issues },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { message: "Internal Server Error" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in PATCH function:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation Error", errors: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = verifyAuth(req);
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if the order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Delete the order
    await prisma.order.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
