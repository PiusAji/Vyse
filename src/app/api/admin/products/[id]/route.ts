//admin/products/[id]/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z, ZodError } from "zod";
import { deleteImage, extractPublicIdFromUrl } from "@/lib/cloudinary";
import { Prisma } from "@prisma/client";

// Schema for updating an existing product
const productUpdateSchema = z.object({
  name: z.string().min(1, "Product name is required").optional(),
  description: z.string().optional(),
  price: z.number().positive("Price must be a positive number").optional(),
  categoryIds: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  tags: z.array(z.string()).optional(), // Product-level tags
  variants: z
    .array(
      z.object({
        id: z.string().cuid("Invalid variant ID").optional(),
        color: z.string().min(1, "Color is required"),
        images: z
          .array(z.string().url("Invalid image URL"))
          .min(1, "At least one image is required"),
        sizes: z
          .array(z.string().min(1, "Size cannot be empty"))
          .min(1, "At least one size is required"),
        stock: z.number().int().min(0, "Stock cannot be negative"),
        tags: z.array(z.string()).optional(), // Variant-level tags
      })
    )
    .min(1, "At least one variant is required")
    .optional(),
});

// GET /api/admin/products/[id] - Get a single product by ID
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        tags: true, // Include product tags
        variants: {
          include: {
            tags: true, // Include variant tags
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { message: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/products/[id] - Update a product by ID
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Transform the body to match the expected schema
    const transformedBody = {
      ...body,
      ...(body.variants && {
        variants: body.variants.map(
          (variant: {
            id?: string;
            color: string;
            images: string | string[];
            sizes: string | string[];
            stock: number;
            tags?: string[];
          }) => ({
            id: variant.id,
            color: variant.color,
            images:
              typeof variant.images === "string"
                ? JSON.parse(variant.images)
                : variant.images,
            sizes:
              typeof variant.sizes === "string"
                ? JSON.parse(variant.sizes)
                : variant.sizes,
            stock: variant.stock,
            tags: variant.tags || [], // Include variant tags
          })
        ),
      }),
    };

    const validatedData = productUpdateSchema.parse(transformedBody);

    const { variants, categoryIds, tags, ...productData } = validatedData;

    // Handle category update if categoryIds is provided
    let categoryUpdate = {};
    if (categoryIds !== undefined) {
      await prisma.productCategory.deleteMany({
        where: { productId: id },
      });

      if (categoryIds.length > 0) {
        categoryUpdate = {
          categories: {
            create: categoryIds.map((categoryId) => ({
              category: { connect: { id: categoryId } },
            })),
          },
        };
      }
    }

    // Handle product-level tags update if tags is provided
    let tagUpdate = {};
    if (tags !== undefined) {
      // Delete all existing product tags
      await prisma.productTag.deleteMany({
        where: { productId: id },
      });

      // Create new product tags
      if (tags.length > 0) {
        tagUpdate = {
          tags: {
            create: tags.map((tag) => ({ tag })),
          },
        };
      }
    }

    // Update product details
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...productData,
        ...categoryUpdate,
        ...tagUpdate,
      },
      include: {
        variants: true,
      },
    });

    // Handle variants
    if (variants) {
      const existingVariantIds = updatedProduct.variants.map((v) => v.id);
      const incomingVariantIds = variants.filter((v) => v.id).map((v) => v.id!);

      const variantsToDelete = existingVariantIds.filter(
        (id) => !incomingVariantIds.includes(id)
      );
      if (variantsToDelete.length > 0) {
        await prisma.productVariant.deleteMany({
          where: {
            id: {
              in: variantsToDelete,
            },
          },
        });
      }

      for (const variantData of variants) {
        const {
          id: variantId,
          tags: variantTags,
          ...restVariantData
        } = variantData;

        if (variantId) {
          // Updating existing variant
          const existingVariant = await prisma.productVariant.findUnique({
            where: { id: variantId },
            select: { images: true },
          });

          let imagesToDelete: string[] = [];
          if (existingVariant) {
            const oldImageUrls: string[] = JSON.parse(existingVariant.images);
            const newImageUrls: string[] = restVariantData.images as string[];

            imagesToDelete = oldImageUrls.filter(
              (url) => !newImageUrls.includes(url)
            );
          }

          for (const imageUrl of imagesToDelete) {
            const publicId = extractPublicIdFromUrl(imageUrl);
            if (publicId) {
              try {
                await deleteImage(publicId);
              } catch (cloudinaryError) {
                console.error(
                  `Failed to delete old image ${publicId} from Cloudinary:`,
                  cloudinaryError
                );
              }
            }
          }

          // Update variant and handle tags
          await prisma.productVariant.update({
            where: { id: variantId },
            data: {
              ...restVariantData,
              images: JSON.stringify(restVariantData.images),
              sizes: JSON.stringify(restVariantData.sizes),
            },
          });

          // Update variant tags
          if (variantTags !== undefined) {
            // Delete existing variant tags
            await prisma.variantTag.deleteMany({
              where: { variantId },
            });

            // Create new variant tags
            if (variantTags.length > 0) {
              await prisma.variantTag.createMany({
                data: variantTags.map((tag) => ({
                  variantId,
                  tag,
                })),
              });
            }
          }
        } else {
          // Creating new variant
          const newVariant = await prisma.productVariant.create({
            data: {
              productId: id,
              ...restVariantData,
              images: JSON.stringify(restVariantData.images),
              sizes: JSON.stringify(restVariantData.sizes),
            },
          });

          // Create variant tags for new variant
          if (variantTags && variantTags.length > 0) {
            await prisma.variantTag.createMany({
              data: variantTags.map((tag) => ({
                variantId: newVariant.id,
                tag,
              })),
            });
          }
        }
      }
    }

    const finalProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        tags: true, // Include product tags
        variants: {
          include: {
            tags: true, // Include variant tags
          },
        },
      },
    });

    return NextResponse.json(finalProduct);
  } catch (error: unknown) {
    console.error("Error updating product:", error);
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.issues },
        { status: 400 }
      );
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Failed to update product", error: (error as Error).message },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/products/[id] - Delete a product by ID
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch product and its variants to get image public IDs before deletion
    const productToDelete = await prisma.product.findUnique({
      where: { id },
      include: {
        variants: true,
      },
    });

    if (!productToDelete) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    // Collect all image public IDs to delete from Cloudinary
    const publicIdsToDelete: string[] = [];

    // Add variant image public IDs
    for (const variant of productToDelete.variants) {
      try {
        const imageUrls = JSON.parse(variant.images as string);
        if (Array.isArray(imageUrls)) {
          for (const imageUrl of imageUrls) {
            const publicId = extractPublicIdFromUrl(imageUrl);
            if (publicId) {
              publicIdsToDelete.push(publicId);
            }
          }
        }
      } catch (parseError) {
        console.error(
          "Error parsing variant images JSON for variant",
          variant.id,
          ":",
          parseError
        );
      }
    }

    // Delete images from Cloudinary
    for (const publicId of publicIdsToDelete) {
      try {
        await deleteImage(publicId);
      } catch (cloudinaryError) {
        console.error(
          `Failed to delete image ${publicId} from Cloudinary:`,
          cloudinaryError
        );
      }
    }

    // Delete associated variant tags (cascade will handle this, but explicit is fine)
    await prisma.variantTag.deleteMany({
      where: {
        variant: {
          productId: id,
        },
      },
    });

    // Delete associated product tags (cascade will handle this too)
    await prisma.productTag.deleteMany({
      where: { productId: id },
    });

    // Delete associated variants from the database
    await prisma.productVariant.deleteMany({
      where: { productId: id },
    });

    // Delete the product from the database
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error: unknown) {
    console.error("Error deleting product:", error);
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Failed to delete product", error: (error as Error).message },
      { status: 500 }
    );
  }
}
