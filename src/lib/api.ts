// lib/api.ts
import { prisma } from "./db";
import {
  Product,
  ProductVariant,
  Category,
  VariantTag,
  ProductTag,
} from "@prisma/client";

interface ProductWithVariants extends Product {
  variants: (ProductVariant & {
    tags: VariantTag[];
  })[];
  categories: Array<{
    category: Category;
  }>;
  tags: ProductTag[];
}

export const getAllProducts = async (): Promise<ProductWithVariants[]> => {
  try {
    return await prisma.product.findMany({
      include: {
        variants: {
          include: {
            tags: true, // Include variant tags
          },
        },
        categories: {
          // Changed from 'category' to 'categories'
          include: {
            category: true,
          },
        },
        tags: true, // Include product tags
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    throw new Error("Failed to fetch products");
  }
};

export const getProductById = async (
  id: string
): Promise<ProductWithVariants | null> => {
  try {
    return await prisma.product.findUnique({
      where: { id },
      include: {
        variants: {
          include: {
            tags: true, // Include variant tags
          },
        },
        categories: {
          // Changed from 'category' to 'categories'
          include: {
            category: true,
          },
        },
        tags: true, // Include product tags
      },
    });
  } catch (error) {
    console.error("Failed to fetch product:", error);
    throw new Error("Failed to fetch product");
  }
};

export const getProductsByCategory = async (
  categorySlug: string
): Promise<ProductWithVariants[]> => {
  try {
    return await prisma.product.findMany({
      where: {
        categories: {
          // Changed from 'category' to 'categories'
          some: {
            // Use 'some' for many-to-many
            category: {
              slug: categorySlug,
            },
          },
        },
      },
      include: {
        variants: {
          include: {
            tags: true, // Include variant tags
          },
        },
        categories: {
          // Changed from 'category' to 'categories'
          include: {
            category: true,
          },
        },
        tags: true, // Include product tags
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    console.error("Failed to fetch products by category:", error);
    throw new Error("Failed to fetch products by category");
  }
};

export const getFeaturedProducts = async (): Promise<ProductWithVariants[]> => {
  try {
    return await prisma.product.findMany({
      where: {
        featured: true,
      },
      include: {
        variants: {
          include: {
            tags: true, // Include variant tags
          },
        },
        categories: {
          // Changed from 'category' to 'categories'
          include: {
            category: true,
          },
        },
        tags: true, // Include product tags
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    console.error("Failed to fetch featured products:", error);
    throw new Error("Failed to fetch featured products");
  }
};

export const getAllProductsWithTags = async (): Promise<
  ProductWithVariants[]
> => {
  try {
    return await prisma.product.findMany({
      include: {
        variants: {
          include: {
            tags: true, // Include variant tags
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
        tags: true, // Include product tags
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    throw new Error("Failed to fetch products");
  }
};

// Add this to your lib/api.ts

export const getRecommendedProducts = async (
  currentProductId: string,
  options: {
    categoryIds?: string[];
    tags?: string[];
    minProducts?: number; // Minimum products to return (default 4 for carousel)
  } = {}
): Promise<ProductWithVariants[]> => {
  const { categoryIds = [], tags = [], minProducts = 4 } = options;

  try {
    let recommendedProducts: ProductWithVariants[] = [];
    const usedProductIds = new Set<string>([currentProductId]);

    // Step 1: Get products from same categories (excluding current)
    if (categoryIds.length > 0) {
      const sameCategoryProducts = await prisma.product.findMany({
        where: {
          id: { not: currentProductId },
          categories: {
            some: {
              categoryId: { in: categoryIds },
            },
          },
        },
        include: {
          variants: {
            include: {
              tags: true,
            },
          },
          categories: {
            include: {
              category: true,
            },
          },
          tags: true,
        },
        // No ordering here - will be randomized later
      });

      recommendedProducts = [...sameCategoryProducts];
      sameCategoryProducts.forEach((p) => usedProductIds.add(p.id));
    }

    // Step 2: If we don't have enough, add products with similar tags
    if (recommendedProducts.length < minProducts && tags.length > 0) {
      const excludedIds = Array.from(usedProductIds);

      const taggedProducts = await prisma.product.findMany({
        where: {
          id: {
            notIn: excludedIds,
          },
          tags: {
            some: {
              tag: { in: tags },
            },
          },
        },
        include: {
          variants: {
            include: {
              tags: true,
            },
          },
          categories: {
            include: {
              category: true,
            },
          },
          tags: true,
        },
      });

      recommendedProducts = [...recommendedProducts, ...taggedProducts];
      taggedProducts.forEach((p) => usedProductIds.add(p.id));
    }

    // Step 3: If still not enough, fill with any other products
    if (recommendedProducts.length < minProducts) {
      const excludedIds = Array.from(usedProductIds);

      const fillerProducts = await prisma.product.findMany({
        where: {
          id: {
            notIn: excludedIds,
          },
        },
        include: {
          variants: {
            include: {
              tags: true,
            },
          },
          categories: {
            include: {
              category: true,
            },
          },
          tags: true,
        },
      });

      recommendedProducts = [...recommendedProducts, ...fillerProducts];
    }

    // Step 4: Shuffle the array to create variety
    // Fisher-Yates shuffle algorithm
    const shuffled = [...recommendedProducts];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Step 5: Limit to reasonable number (max 8 for carousel)
    return shuffled.slice(
      0,
      Math.min(8, Math.max(minProducts, shuffled.length))
    );
  } catch (error) {
    console.error("Failed to fetch recommended products:", error);
    // If error, try to get ANY products (fallback)
    try {
      const fallbackProducts = await prisma.product.findMany({
        where: {
          id: { not: currentProductId },
        },
        include: {
          variants: {
            include: {
              tags: true,
            },
          },
          categories: {
            include: {
              category: true,
            },
          },
          tags: true,
        },
        take: minProducts,
      });

      // Shuffle fallback too
      const shuffled = [...fallbackProducts];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      return shuffled;
    } catch (fallbackError) {
      console.error("Failed to fetch fallback products:", fallbackError);
      return [];
    }
  }
};
