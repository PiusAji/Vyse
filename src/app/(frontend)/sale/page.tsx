import { getPageSections } from "@/lib/admin-page-api";
import { getAllProducts } from "@/lib/api";
import SaleHero from "@/components/SaleHero";
import AllShoesSection from "@/components/AllShoesSection";
import CountdownBanner from "@/components/CountDownBanner";

export default async function SalePage() {
  // Get page sections from database
  const sections = await getPageSections("sale");

  // Get hero section
  const heroSection = sections.find((s) => s.section === "hero" && s.isActive);
  const countdownSection = sections.find(
    (s) => s.section === "countdown-banner" && s.isActive
  );

  // Get all products and filter for sale items
  const allProducts = await getAllProducts();
  const saleProducts = allProducts.filter((product) =>
    product.tags.some((t) => t.tag === "sale")
  );

  // Create content for AllShoesSection
  const productGridContent = {
    heading: "Limited Time",
    subheading: "Offers",
    description: `${saleProducts.length} exclusive deals you don't want to miss`,
  };

  return (
    <div className="min-h-screen">
      {/* Dynamic Hero Section from Database */}
      {heroSection &&
        heroSection.content &&
        typeof heroSection.content === "object" &&
        !Array.isArray(heroSection.content) && (
          <SaleHero content={heroSection.content} />
        )}

      {countdownSection && (
        <CountdownBanner content={countdownSection.content} />
      )}

      {/* Sale Products Grid */}
      {saleProducts.length > 0 ? (
        <AllShoesSection content={productGridContent} products={saleProducts} />
      ) : (
        <section className="container mx-auto px-4 py-24">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">No Active Sales</h2>
            <p className="text-muted-foreground">
              Check back soon for amazing deals on your favorite styles!
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
