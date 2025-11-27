import { getPageSections } from "@/lib/admin-page-api";
import { getAllProducts } from "@/lib/api";
import SneakersHero from "@/components/SneakersHero";
import AllShoesSection from "@/components/AllShoesSection";

export default async function SneakersPage() {
  // Get page sections from database
  const sections = await getPageSections("sneakers");

  // Get hero section
  const heroSection = sections.find((s) => s.section === "hero" && s.isActive);

  // Get all products and filter for sneakers
  const allProducts = await getAllProducts();
  const sneakerProducts = allProducts.filter((product) =>
    product.categories.some((c) => c.category.slug === "sneakers")
  );

  // Create content for AllShoesSection
  const productGridContent = {
    heading: "Sneakers",
    subheading: "Collection",
    description: `Explore ${sneakerProducts.length} styles that define street culture and performance`,
  };

  return (
    <div className="min-h-screen">
      {/* Dynamic Hero Section from Database */}
      {heroSection &&
        heroSection.content &&
        typeof heroSection.content === "object" &&
        !Array.isArray(heroSection.content) && (
          <SneakersHero
            content={heroSection.content}
            products={sneakerProducts}
          />
        )}

      {/* Product Grid Section */}
      {sneakerProducts.length > 0 ? (
        <AllShoesSection
          content={productGridContent}
          products={sneakerProducts}
        />
      ) : (
        <section className="container mx-auto px-4 py-24">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">Coming Soon</h2>
            <p className="text-muted-foreground">
              Sneakers collection is being curated. Check back soon!
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
