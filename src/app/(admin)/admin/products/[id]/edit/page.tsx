// admin/products/[id]/edit/page.tsx
import ProductForm from "@/components/admin/ProductForm";
import {
  getAdminProductById,
  getAdminCategories,
  ProductWithVariantsForForm, // ✅ Import the correct type
} from "@/lib/admin-api";
import { Category } from "@prisma/client";

// ✅ Remove the local ProductWithRelations interface - use the imported one instead

interface AdminProductEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

const AdminProductEditPage = async ({ params }: AdminProductEditPageProps) => {
  const { id: productId } = await params;
  let product: ProductWithVariantsForForm | null = null; // ✅ Use the imported type
  let categories: Category[] = [];
  let error: string | null = null;

  try {
    product = await getAdminProductById(productId);
    categories = await getAdminCategories();
  } catch (err: unknown) {
    console.error("Error fetching product or categories:", err);
    error = (err as Error).message;
  }

  if (error) {
    return <div className="p-6 text-center text-destructive">{error}</div>;
  }

  if (!product) {
    return <div className="p-6 text-center">Product not found.</div>;
  }

  return (
    <div className="p-6 bg-background text-foreground min-h-screen font-sans">
      <h1 className="text-3xl font-bold mb-6">Edit Product</h1>
      <ProductForm
        initialData={product}
        categories={categories}
        productId={productId}
      />
    </div>
  );
};

export default AdminProductEditPage;
