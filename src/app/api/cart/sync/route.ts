import { prisma } from "@/lib/db";
import { verifyAuth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { CartItem } from "@/store/cart-store";
import { ProductVariant, CartItem as PrismaCartItem } from "@prisma/client";

// Extend CartItem from client to include product details for API response mapping
interface CartItemWithProductDetails extends CartItem {
  productVariant: ProductVariant & {
    product: {
      name: string;
      price: number;
    };
  };
}

export async function POST(request: NextRequest) {
  const auth = verifyAuth(request);
  // console.log("API /api/cart/sync: Auth result:", auth); // Keep for debugging if needed
  if (!auth?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let clientItems: Omit<CartItem, "id">[] = [];
  let action: "sync" | "fetch" | "merge" = "sync";

  try {
    const body = await request.json();
    clientItems = body.items || [];
    action = body.action || "sync";
  } catch (error) {
    console.error("Failed to parse request body:", error);
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  try {
    // console.log("API /api/cart/sync: Received action:", action); // Keep for debugging if needed
    if (action === "fetch") {
      // console.log("API /api/cart/sync (fetch): Fetching cart for userId:", auth.userId); // Keep for debugging if needed
      const dbItems = await prisma.cartItem.findMany({
        where: { userId: auth.userId },
        include: { productVariant: { include: { product: true } } },
      });
      // console.log("API /api/cart/sync (fetch): Found dbItems:", dbItems); // Keep for debugging if needed
      return NextResponse.json({
        success: true,
        items: dbItems.map(
          (
            item: PrismaCartItem & {
              productVariant: ProductVariant & {
                product: { name: string; price: number };
              };
            }
          ) => ({
            id: `${item.productVariant.productId}-${item.selectedSize}-${item.productVariant.color}`,
            productId: item.productVariant.productId,
            productVariantId: item.productVariantId,
            name: item.productVariant.product.name,
            price: item.productVariant.product.price,
            image: JSON.parse(item.productVariant.images)?.[0] || "",
            size: item.selectedSize,
            color: item.productVariant.color,
            quantity: item.quantity,
          })
        ),
      });
    } else if (action === "sync") {
      // Sync action (replace strategy)
      await prisma.$transaction([
        prisma.cartItem.deleteMany({ where: { userId: auth.userId } }),
        prisma.cartItem.createMany({
          data: clientItems.map((item) => ({
            userId: auth.userId,
            productVariantId: item.productVariantId,
            quantity: item.quantity,
            selectedSize: item.size, // Store the selected size
          })),
        }),
      ]);

      const updatedDbItems = await prisma.cartItem.findMany({
        where: { userId: auth.userId },
        include: { productVariant: { include: { product: true } } },
      });

      return NextResponse.json({
        success: true,
        items: updatedDbItems.map(
          (
            item: PrismaCartItem & {
              productVariant: ProductVariant & {
                product: { name: string; price: number };
              };
            }
          ) => ({
            id: `${item.productVariant.productId}-${item.selectedSize}-${item.productVariant.color}`,
            productId: item.productVariant.productId,
            productVariantId: item.productVariantId,
            name: item.productVariant.product.name,
            price: item.productVariant.product.price,
            image: JSON.parse(item.productVariant.images)?.[0] || "",
            size: item.selectedSize, // Use the stored selected size
            color: item.productVariant.color,
            quantity: item.quantity,
          })
        ),
      });
    } else if (action === "merge") {
      const existingDbItems = await prisma.cartItem.findMany({
        where: { userId: auth.userId },
        include: { productVariant: true },
      });

      const itemsToCreate = [];
      const itemsToUpdate = [];

      for (const clientItem of clientItems) {
        const existingItem = existingDbItems.find(
          (dbItem) => dbItem.productVariantId === clientItem.productVariantId
        );

        if (existingItem) {
          itemsToUpdate.push(
            prisma.cartItem.update({
              where: { id: existingItem.id },
              data: { quantity: existingItem.quantity + clientItem.quantity },
            })
          );
        } else {
          itemsToCreate.push({
            userId: auth.userId,
            productVariantId: clientItem.productVariantId,
            quantity: clientItem.quantity,
          });
        }
      }

      await prisma.$transaction([
        ...itemsToUpdate,
        prisma.cartItem.createMany({ data: itemsToCreate }),
      ]);

      const mergedDbItems = await prisma.cartItem.findMany({
        where: { userId: auth.userId },
        include: { productVariant: { include: { product: true } } },
      });

      return NextResponse.json({
        success: true,
        items: mergedDbItems.map(
          (
            item: PrismaCartItem & {
              productVariant: ProductVariant & {
                product: { name: string; price: number };
              };
            }
          ) => ({
            id: `${item.productVariant.productId}-${item.selectedSize}-${item.productVariant.color}`,
            productId: item.productVariant.productId,
            productVariantId: item.productVariantId,
            name: item.productVariant.product.name,
            price: item.productVariant.product.price,
            image: JSON.parse(item.productVariant.images)?.[0] || "",
            size: item.selectedSize, // Use the stored selected size
            color: item.productVariant.color,
            quantity: item.quantity,
          })
        ),
      });
    }
  } catch (error) {
    // console.error("Cart sync failed:", error); // Keep for debugging if needed
    return NextResponse.json({ error: "Failed to sync cart" }, { status: 500 });
  }
}
