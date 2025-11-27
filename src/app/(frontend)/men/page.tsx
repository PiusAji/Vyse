import { getPageSections } from "@/lib/admin-page-api";
import { getAllProducts } from "@/lib/api";
import MenHero from "@/components/MenHero";
import AllShoesSection from "@/components/AllShoesSection";

export default async function MenPage() {
  // Get page sections from database
  const sections = await getPageSections("men");

  // Get hero section
  const heroSection = sections.find((s) => s.section === "hero" && s.isActive);

  // Get all products and filter for men's products
  const allProducts = await getAllProducts();
  const menProducts = allProducts.filter((product) =>
    product.categories.some((c) => c.category.slug === "men")
  );

  // Create content for AllShoesSection
  const productGridContent = {
    heading: "Men's",
    subheading: "Collection",
    description: `Discover ${menProducts.length} carefully curated styles designed for the modern man`,
  };

  return (
    <div className="min-h-screen">
      {/* Dynamic Hero Section from Database */}
      {heroSection &&
        heroSection.content &&
        typeof heroSection.content === "object" &&
        !Array.isArray(heroSection.content) && (
          <MenHero content={heroSection.content} />
        )}

      {/* Product Grid Section */}
      {menProducts.length > 0 ? (
        <AllShoesSection content={productGridContent} products={menProducts} />
      ) : (
        <section className="container mx-auto px-4 py-24">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">Coming Soon</h2>
            <p className="text-muted-foreground">
              Men&apos;s collection is being curated. Check back soon!
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
