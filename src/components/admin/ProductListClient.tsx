"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Minus,
  Edit,
  PlusCircle,
  ArrowUpDown,
  Trash2,
} from "lucide-react";
import { Product, ProductVariant, Category } from "@prisma/client";
import {
  getAdminProducts,
  getAdminCategories,
  deleteAdminProduct,
  bulkAdminProductsAction,
  deleteAdminProductVariant,
} from "@/lib/admin-api";

interface ProductWithRelations extends Product {
  categories: Array<{
    categoryId: string;
    category: Category;
  }>;
  variants: ProductVariant[];
}

interface ProductListClientProps {
  initialProducts: ProductWithRelations[];
  initialCategories: Category[];
  initialTotalPages: number;
  initialCurrentPage: number;
  initialSearchTerm: string;
  initialSelectedCategory: string;
}

const ProductListClient: React.FC<ProductListClientProps> = ({
  initialProducts,
  initialCategories,
  initialTotalPages,
  initialCurrentPage,
  initialSearchTerm,
  initialSelectedCategory,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] =
    useState<ProductWithRelations[]>(initialProducts);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [loading, setLoading] = useState(false); // Loading state for client-side fetches
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(initialCurrentPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [selectedCategory, setSelectedCategory] = useState(
    initialSelectedCategory
  );
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [expandedProductIds, setExpandedProductIds] = useState<string[]>([]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminProducts(
        currentPage,
        10, // Hardcode limit for now
        searchTerm,
        selectedCategory
      );
      setProducts(data.products);
      setTotalPages(data.totalPages);
      setLoading(false);
    } catch (err: unknown) {
      setError((err as Error).message);
      setLoading(false);
    }
  }, [currentPage, searchTerm, selectedCategory]);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await getAdminCategories();
      setCategories(data);
    } catch (err: unknown) {
      console.error("Error fetching categories:", err);
      setError((err as Error).message);
    }
  }, []);

  useEffect(() => {
    // Update URL params when state changes
    const params = new URLSearchParams();
    if (currentPage !== 1) params.set("page", currentPage.toString());
    if (searchTerm) params.set("search", searchTerm);
    if (selectedCategory) params.set("category", selectedCategory);
    router.push(`?${params.toString()}`, { scroll: false });

    // Debounce product fetching
    const handler = setTimeout(async () => {
      const wasFocused = searchInputRef.current === document.activeElement;
      const cursorPosition = searchInputRef.current?.selectionStart;

      await fetchProducts();

      if (wasFocused && searchInputRef.current) {
        searchInputRef.current.focus();
        if (typeof cursorPosition === "number") {
          searchInputRef.current.setSelectionRange(
            cursorPosition,
            cursorPosition
          );
        }
      }
    }, 500); // 500ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [currentPage, searchTerm, selectedCategory, router, fetchProducts]);

  useEffect(() => {
    fetchCategories(); // Re-fetch categories in case they change
  }, [fetchCategories]);

  useEffect(() => {
    // Initialize state from URL params on first load
    const pageParam = searchParams.get("page");
    const searchParam = searchParams.get("search");
    const categoryParam = searchParams.get("category");

    if (pageParam) setCurrentPage(parseInt(pageParam));
    if (searchParam) setSearchTerm(searchParam);
    if (categoryParam) setSelectedCategory(categoryParam);
  }, [searchParams]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleCategoryChange = (categorySlug: string) => {
    setSelectedCategory(categorySlug === "ALL" ? "" : categorySlug);
    setCurrentPage(1); // Reset to first page on category change
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleProductSelect = (productId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedProductIds((prev) => [...prev, productId]);
    } else {
      setSelectedProductIds((prev) => prev.filter((id) => id !== productId));
    }
  };

  const handleSelectAllProducts = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedProductIds(products.map((p) => p.id));
    } else {
      setSelectedProductIds([]);
    }
  };

  const toggleProductExpansion = (productId: string) => {
    setExpandedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedProductIds.length === 0) return;
    if (
      !confirm(
        `Are you sure you want to delete ${selectedProductIds.length} products?`
      )
    )
      return;

    try {
      await bulkAdminProductsAction(selectedProductIds, "delete");
      fetchProducts();
      setSelectedProductIds([]);
      // TODO: Add toast notification
    } catch (err: unknown) {
      console.error("Bulk delete failed:", err);
      setError((err as Error).message);
      // TODO: Add toast notification
    }
  };

  const handleBulkToggleFeatured = async (featured: boolean) => {
    if (selectedProductIds.length === 0) return;
    if (
      !confirm(
        `Are you sure you want to set featured status to ${featured} for ${selectedProductIds.length} products?`
      )
    )
      return;

    try {
      await bulkAdminProductsAction(
        selectedProductIds,
        "toggleFeatured",
        featured
      );
      fetchProducts();
      setSelectedProductIds([]);
      // TODO: Add toast notification
    } catch (err: unknown) {
      console.error("Bulk featured toggle failed:", err);
      setError((err as Error).message);
      // TODO: Add toast notification
    }
  };

  const handleDeleteProduct = async (
    productId: string,
    productName: string
  ) => {
    if (!confirm(`Are you sure you want to delete ${productName}?`)) {
      return;
    }
    try {
      await deleteAdminProduct(productId);
      fetchProducts();
      // TODO: Add toast notification
    } catch (err: unknown) {
      console.error("Delete failed:", err);
      setError((err as Error).message);
      // TODO: Add toast notification
    }
  };

  const handleDeleteVariant = async (
    productId: string,
    variantId: string,
    variantColor: string,
    productName: string
  ) => {
    if (
      !confirm(
        `Are you sure you want to delete variant ${variantColor} for ${productName}?`
      )
    ) {
      return;
    }
    try {
      await deleteAdminProductVariant(productId, variantId);
      fetchProducts();
      // TODO: Add toast notification
    } catch (err: unknown) {
      console.error("Delete variant failed:", err);
      setError((err as Error).message);
      // TODO: Add toast notification
    }
  };

  if (loading)
    return <div className="p-6 text-center">Loading products...</div>;
  if (error)
    return <div className="p-6 text-center text-destructive">{error}</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Product Management</h1>
        <Link href="/admin/products/new">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2">
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Product
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Input
          ref={searchInputRef}
          placeholder="Search products..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <Select
          value={selectedCategory}
          onValueChange={(value: string) => {
            handleCategoryChange(value);
            fetchProducts();
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.slug}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedProductIds.length > 0 && (
          <div className="flex gap-2 col-span-full lg:col-span-2">
            <Button variant="destructive" onClick={handleBulkDelete}>
              Delete Selected ({selectedProductIds.length})
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleBulkToggleFeatured(true)}
            >
              Feature Selected
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleBulkToggleFeatured(false)}
            >
              Unfeature Selected
            </Button>
          </div>
        )}
      </div>

      <div className="bg-card text-card-foreground shadow-md rounded-lg overflow-x-auto">
        <Table>
          <TableHeader className="bg-secondary text-secondary-foreground">
            <TableRow>
              <TableHead className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                <Checkbox
                  checked={
                    selectedProductIds.length === products.length &&
                    products.length > 0
                  }
                  onCheckedChange={handleSelectAllProducts}
                />
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Name
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Category
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Price
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Featured
              </TableHead>
              <TableHead className="relative px-6 py-3" colSpan={2}>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-card divide-y divide-border">
            {products.map((product) => (
              <React.Fragment key={product.id}>
                <TableRow
                  onClick={() => toggleProductExpansion(product.id)}
                  className="hover:bg-accent hover:text-accent-foreground cursor-pointer"
                >
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Checkbox
                      checked={selectedProductIds.includes(product.id)}
                      onCheckedChange={(checked) =>
                        handleProductSelect(product.id, checked as boolean)
                      }
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {product.name}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                    {product.categories.length > 0
                      ? product.categories
                          .map((pc) => pc.category.name)
                          .join(", ")
                      : "N/A"}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                    ${product.price.toFixed(2)}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                    {product.featured ? "Yes" : "No"}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="text-primary hover:text-primary/80 mr-4"
                    >
                      View/Edit
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProduct(product.id, product.name);
                      }}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={7} className="p-0">
                    <div
                      className={`transition-all duration-500 ease-in-out overflow-hidden ${
                        expandedProductIds.includes(product.id)
                          ? "max-h-[5000px] opacity-100"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className={`bg-muted/20 p-4 border-t`}>
                        <h4 className="text-lg font-semibold mb-2">
                          Variants for {product.name}
                        </h4>
                        {product.variants.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {product.variants.map((variant) => {
                              const images = JSON.parse(
                                variant.images
                              ) as string[];
                              const sizes = JSON.parse(
                                variant.sizes
                              ) as string[];
                              const thumbnailUrl =
                                images.length > 0
                                  ? images[0]
                                  : "/placeholder-image.jpg";
                              return (
                                <div
                                  key={variant.id}
                                  className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between flex-wrap sm:flex-nowrap gap-4 p-3 border rounded-md bg-background"
                                >
                                  <Image
                                    src={thumbnailUrl}
                                    alt={`${product.name} - ${variant.color}`}
                                    width={64}
                                    height={64}
                                    className="object-cover rounded-md flex-shrink-0"
                                  />
                                  <div className="flex-grow min-w-0 max-w-[calc(100%-120px)]">
                                    <p className="font-medium">
                                      {variant.color}
                                    </p>
                                    <p className="text-sm text-muted-foreground truncate">
                                      Sizes: {sizes.join(", ")}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      Stock: {variant.stock}
                                    </p>
                                  </div>
                                  <div className="flex gap-2 mt-2 sm:mt-0 flex-shrink-0">
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() =>
                                        router.push(
                                          `/admin/products/${product.id}/edit`
                                        )
                                      }
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="icon"
                                      onClick={() =>
                                        handleDeleteVariant(
                                          product.id,
                                          variant.id,
                                          variant.color,
                                          product.name
                                        )
                                      }
                                    >
                                      <Minus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">
                            No variants available for this product.
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center p-4">
        <Button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          variant="outline"
        >
          Previous
        </Button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <Button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          variant="outline"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default ProductListClient;
