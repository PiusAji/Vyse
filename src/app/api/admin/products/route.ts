//admin/products/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z, ZodError } from "zod";
import { Prisma } from "@prisma/client";

interface VariantPayload {
  color: string;
  images: string[] | string;
  sizes: string[] | string;
  stock: number;
  tags?: string[];
}

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  price: z.number().positive("Price must be a positive number"),
  categoryIds: z.array(z.string()).min(1, "At least one category is required"),
  featured: z.boolean().default(false),
  tags: z.array(z.string()).optional(), // Product-level tags
  variants: z
    .array(
      z.object({
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
    .min(1, "At least one variant is required"),
});

// GET /api/admin/products - List all products with pagination, search, filter
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};
    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
          } as Prisma.StringFilter,
        },
        {
          description: {
            contains: search,
          } as Prisma.StringNullableFilter,
        },
      ];
    }
    if (category) {
      where.categories = {
        some: {
          category: {
            slug: {
              equals: category,
            },
          },
        },
      };
    }

    const products = await prisma.product.findMany({
      skip,
      take: limit,
      where,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    const totalProducts = await prisma.product.count({ where });

    return NextResponse.json({
      products,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: page,
      totalProducts,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST /api/admin/products - Create a new product
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const transformedBody = {
      ...body,
      variants:
        body.variants?.map((variant: VariantPayload) => ({
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
        })) || [],
    };

    const validatedData = productSchema.parse(transformedBody);

    const { variants, categoryIds, tags, ...productData } = validatedData;

    const newProduct = await prisma.product.create({
      data: {
        ...productData,
        categories: {
          create: categoryIds.map((categoryId) => ({
            category: { connect: { id: categoryId } },
          })),
        },
        tags: {
          create: tags?.map((tag) => ({ tag })) || [], // Create product tags
        },
        variants: {
          create: variants.map((variant) => ({
            color: variant.color,
            images: JSON.stringify(variant.images),
            sizes: JSON.stringify(variant.sizes),
            stock: variant.stock,
            tags: {
              create: variant.tags?.map((tag) => ({ tag })) || [], // Create variant tags
            },
          })),
        },
      },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        tags: true, // Include created tags in response
        variants: {
          include: {
            tags: true, // Include variant tags in response
          },
        },
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating product:", error);
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Failed to create product", error: (error as Error).message },
      { status: 500 }
    );
  }
}
