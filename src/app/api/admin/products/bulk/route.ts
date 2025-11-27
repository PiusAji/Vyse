import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z, ZodError } from "zod";
import { Prisma } from "@prisma/client";

const bulkOperationSchema = z.object({
  productIds: z
    .array(z.string().cuid("Invalid product ID"))
    .min(1, "At least one product ID is required"),
  action: z.enum(["delete", "toggleFeatured"], {
    message: 'Invalid action. Must be "delete" or "toggleFeatured".',
  }),
  featured: z.boolean().optional(), // Required for 'toggleFeatured' action
});

// POST /api/admin/products/bulk - Perform bulk operations (delete, toggle featured)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = bulkOperationSchema.parse(body);
    const { productIds, action, featured } = validatedData;

    if (action === "delete") {
      // First, get all variant IDs for these products
      const variants = await prisma.productVariant.findMany({
        where: {
          productId: {
            in: productIds,
          },
        },
        select: {
          id: true,
        },
      });

      const variantIds = variants.map((v) => v.id);

      // Delete in the correct order to respect foreign key constraints
      if (variantIds.length > 0) {
        // 1. Delete CartItems that reference these variants
        await prisma.cartItem.deleteMany({
          where: {
            productVariantId: {
              in: variantIds,
            },
          },
        });

        // 2. Delete OrderItems that reference these variants
        await prisma.orderItem.deleteMany({
          where: {
            productVariantId: {
              in: variantIds,
            },
          },
        });

        // 3. Delete VariantTags that reference these variants
        await prisma.variantTag.deleteMany({
          where: {
            variantId: {
              in: variantIds,
            },
          },
        });

        // 4. Now delete the variants
        await prisma.productVariant.deleteMany({
          where: {
            productId: {
              in: productIds,
            },
          },
        });
      }

      // 5. Delete ProductTags that reference these products
      await prisma.productTag.deleteMany({
        where: {
          productId: {
            in: productIds,
          },
        },
      });

      // 6. Finally, delete the products
      const deleteResult = await prisma.product.deleteMany({
        where: {
          id: {
            in: productIds,
          },
        },
      });

      return NextResponse.json({
        message: `${deleteResult.count} products deleted successfully`,
      });
    } else if (action === "toggleFeatured") {
      if (featured === undefined) {
        return NextResponse.json(
          {
            message:
              'The "featured" field is required for "toggleFeatured" action.',
          },
          { status: 400 }
        );
      }
      const updateResult = await prisma.product.updateMany({
        where: {
          id: {
            in: productIds,
          },
        },
        data: {
          featured: featured,
        },
      });
      return NextResponse.json({
        message: `${updateResult.count} products updated successfully`,
      });
    }

    return NextResponse.json(
      { message: "Invalid bulk operation action" },
      { status: 400 }
    );
  } catch (error: unknown) {
    console.error("Error performing bulk operation:", error);
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        message: "Failed to perform bulk operation",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
