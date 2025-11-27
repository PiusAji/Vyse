//admin-api.ts

import {
  Product,
  ProductVariant,
  Category,
  ProductTag,
  VariantTag,
} from "@prisma/client";
import { absoluteUrl } from "@/lib/utils";

// Interface for product variant data as expected by the form (arrays of strings)
export interface ProductVariantFormValues {
  id?: string; // Optional for new variants
  color: string;
  images: string[]; // Array of image URLs
  sizes: string[]; // Array of sizes
  stock: number;
  tags?: string[]; // Array of tag strings like ["new-arrival", "trending"]
}

// Interface for product data as expected by the form
export interface ProductFormValues {
  name: string;
  description?: string;
  price: number;
  categoryIds: string[];
  featured: boolean;
  tags?: string[]; // Product-level tags
  variants: ProductVariantFormValues[];
}

// Interface for Product data received from the API
export interface ProductWithVariantsForForm {
  id: string;
  name: string;
  description: string | null;
  price: number;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
  categories: Array<{
    categoryId: string;
    category: Category;
  }>;
  tags: ProductTag[]; // Product-level tags
  variants: (ProductVariant & {
    tags: VariantTag[]; // Variant-level tags
  })[];
}

// Interface for the payload sent to the API
export interface ProductApiPayload {
  name: string;
  description?: string;
  price: number;
  categoryIds: string[];
  featured: boolean;
  tags?: string[]; // Product-level tags
  variants: Array<{
    id?: string;
    color: string;
    images: string; // JSON string
    sizes: string; // JSON string
    stock: number;
    tags?: string[]; // Variant-level tags
  }>;
}

interface ProductsResponse {
  products: ProductWithVariantsForForm[];
  totalPages: number;
  currentPage: number;
  totalProducts: number;
}

export const getAdminProducts = async (
  page: number,
  limit: number,
  searchTerm: string,
  categorySlug: string
): Promise<ProductsResponse> => {
  const params = new URLSearchParams();
  params.set("page", page.toString());
  params.set("limit", limit.toString());
  if (searchTerm) params.set("search", searchTerm);
  if (categorySlug) params.set("category", categorySlug);

  const res = await fetch(
    absoluteUrl(`/api/admin/products?${params.toString()}`)
  );
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to fetch products");
  }
  return res.json();
};

export const getAdminCategories = async (): Promise<Category[]> => {
  const res = await fetch(absoluteUrl("/api/categories"));
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to fetch categories");
  }
  return res.json();
};

export const deleteAdminProduct = async (productId: string): Promise<void> => {
  const res = await fetch(absoluteUrl(`/api/admin/products/${productId}`), {
    method: "DELETE",
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to delete product");
  }
};

export const deleteAdminProductVariant = async (
  productId: string,
  variantId: string
): Promise<void> => {
  const res = await fetch(
    absoluteUrl(`/api/admin/products/${productId}/variants/${variantId}`),
    {
      method: "DELETE",
    }
  );
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to delete product variant");
  }
};

export const bulkAdminProductsAction = async (
  productIds: string[],
  action: "delete" | "toggleFeatured",
  featured?: boolean
): Promise<void> => {
  const res = await fetch(absoluteUrl("/api/admin/products/bulk"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productIds, action, featured }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || `Failed to perform bulk ${action}`);
  }
};

export const createAdminProduct = async (
  productData: ProductApiPayload
): Promise<ProductWithVariantsForForm> => {
  const res = await fetch(absoluteUrl("/api/admin/products"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(productData),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to create product");
  }
  return res.json();
};

export const updateAdminProduct = async (
  productId: string,
  productData: ProductApiPayload
): Promise<ProductWithVariantsForForm> => {
  const res = await fetch(absoluteUrl(`/api/admin/products/${productId}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(productData),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to update product");
  }
  return res.json();
};

export const getAdminProductById = async (
  productId: string
): Promise<ProductWithVariantsForForm> => {
  const res = await fetch(absoluteUrl(`/api/admin/products/${productId}`));
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to fetch product by ID");
  }
  return res.json();
};
