import { getPageSections } from "@/lib/admin-page-api";
import { getAllProducts } from "@/lib/api";
import WomenHero from "@/components/WomenHero";
import AllShoesSection from "@/components/AllShoesSection";

export default async function WomenPage() {
  // Get page sections from database
  const sections = await getPageSections("women");

  // Get hero section
  const heroSection = sections.find((s) => s.section === "hero" && s.isActive);

  // Get all products and filter for women's products
  const allProducts = await getAllProducts();
  const womenProducts = allProducts.filter((product) =>
    product.categories.some((c) => c.category.slug === "women")
  );

  // Create content for AllShoesSection
  const productGridContent = {
    heading: "Women's",
    subheading: "Collection",
    description: `Discover ${womenProducts.length} carefully curated styles designed for the modern woman`,
  };

  return (
    <div className="min-h-screen">
      {/* Dynamic Hero Section from Database */}
      {heroSection &&
        heroSection.content &&
        typeof heroSection.content === "object" &&
        !Array.isArray(heroSection.content) && (
          <WomenHero content={heroSection.content} />
        )}

      {/* Product Grid Section */}
      {womenProducts.length > 0 ? (
        <AllShoesSection
          content={productGridContent}
          products={womenProducts}
        />
      ) : (
        <section className="container mx-auto px-4 py-24">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">Coming Soon</h2>
            <p className="text-muted-foreground">
              Women&apos;s collection is being curated. Check back soon!
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
