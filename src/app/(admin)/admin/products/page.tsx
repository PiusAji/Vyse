import { Product, ProductVariant, Category } from "@prisma/client";
import { getAdminProducts, getAdminCategories } from "@/lib/admin-api";
import ProductListClient from "@/components/admin/ProductListClient";

interface ProductWithRelations extends Product {
  categories: Array<{
    categoryId: string;
    category: Category;
  }>;
  variants: ProductVariant[];
}

interface ProductsResponse {
  products: ProductWithRelations[];
  totalPages: number;
  currentPage: number;
  totalProducts: number;
}

interface AdminProductsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    category?: string;
  }>;
}

const AdminProductsPage = async ({ searchParams }: AdminProductsPageProps) => {
  const awaitedSearchParams = await searchParams;
  const currentPage = parseInt(awaitedSearchParams.page || "1");
  const searchTerm = awaitedSearchParams.search || "";
  const selectedCategory = awaitedSearchParams.category || "";

  let products: ProductWithRelations[] = [];
  let categories: Category[] = [];
  let totalPages = 1;
  let error: string | null = null;

  try {
    const productsData = await getAdminProducts(
      currentPage,
      10, // Hardcode limit for now
      searchTerm,
      selectedCategory
    );
    products = productsData.products;
    totalPages = productsData.totalPages;

    categories = await getAdminCategories();
  } catch (err: unknown) {
    console.error("Error fetching initial data:", err);
    error = (err as Error).message;
  }

  if (error) {
    return <div className="p-6 text-center text-destructive">{error}</div>;
  }

  return (
    <ProductListClient
      initialProducts={products}
      initialCategories={categories}
      initialTotalPages={totalPages}
      initialCurrentPage={currentPage}
      initialSearchTerm={searchTerm}
      initialSelectedCategory={selectedCategory}
    />
  );
};

export default AdminProductsPage;
