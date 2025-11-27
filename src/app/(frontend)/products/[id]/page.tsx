import { getProductById, getRecommendedProducts } from "@/lib/api";
import { notFound } from "next/navigation";
import BackButton from "@/components/ui/BackButton";
import ProductDetails from "./ProductDetails";
import { RecommendedProductsCarousel } from "@/components/RecommendedProductsCarousel";

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  let product = null;

  try {
    product = await getProductById(id);
  } catch (error) {
    notFound();
  }

  if (!product) {
    notFound();
  }

  // Check if product has variants
  if (!product.variants || product.variants.length === 0) {
    notFound();
  }

  // Get recommended products with smart filling
  const recommendedProducts = await getRecommendedProducts(product.id, {
    categoryIds: product.categories.map((c) => c.category.id),
    tags: product.tags.map((t) => t.tag),
    minProducts: 4, // Ensures carousel always has at least 4 items
  });

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 pt-8">
        <BackButton />
      </div>

      {/* Product Details Section */}
      <ProductDetails
        product={{
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          tags: product.tags, // ✅ Now includes tags
        }}
        variants={product.variants}
      />

      {/* Recommended Products Section */}
      {recommendedProducts.length > 0 && (
        <RecommendedProductsCarousel
          products={recommendedProducts}
          title="You Might Also Like"
          description="Handpicked selections based on your current choice"
        />
      )}
    </div>
  );
}

// Optional: Generate static params for all products (good for SEO & performance)
export async function generateStaticParams() {
  const { prisma } = await import("@/lib/db");
  const products = await prisma.product.findMany({
    select: { id: true },
  });

  return products.map((product) => ({
    id: product.id,
  }));
}
