import { getPageSections } from "@/lib/admin-page-api";
import { getAllProducts } from "@/lib/api";
import BootsHero from "@/components/BootsHero";
import AllShoesSection from "@/components/AllShoesSection";

export default async function BootsPage() {
  // Get page sections from database
  const sections = await getPageSections("boots");

  // Get hero section
  const heroSection = sections.find((s) => s.section === "hero" && s.isActive);

  // Get all products and filter for boots only
  const allProducts = await getAllProducts();
  const bootsProducts = allProducts.filter((product) =>
    product.categories.some((c) => c.category.slug === "boots")
  );

  // Create content for AllShoesSection
  const productGridContent = {
    heading: "Boots",
    subheading: "Collection",
    description: `Explore ${bootsProducts.length} premium boot styles crafted for durability, comfort, and timeless design`,
  };

  return (
    <div className="min-h-screen">
      {/* Dynamic Hero Section from Database */}
      {heroSection &&
        heroSection.content &&
        typeof heroSection.content === "object" &&
        !Array.isArray(heroSection.content) && (
          <BootsHero content={heroSection.content} />
        )}

      {/* Product Grid Section - Boots Only */}
      {bootsProducts.length > 0 ? (
        <AllShoesSection
          content={productGridContent}
          products={bootsProducts}
        />
      ) : (
        <section className="container mx-auto px-4 py-24">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">Coming Soon</h2>
            <p className="text-muted-foreground">
              Our boots collection is being curated. Check back soon!
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
