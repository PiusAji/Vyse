// app/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import HeroSection from "@/components/HeroSection";
import { FeaturedProductsCarousel } from "@/components/FeaturedProductsCarousel";

import { getFeaturedProducts } from "@/lib/api";
import { getPageSections } from "@/lib/admin-page-api";
import { CategorySpotlight } from "@/components/admin/CategorySpotlight";
import CurrentFocusSection from "@/components/CurrentFocusSection";
import BrandStorySection from "@/components/BrandStorySection";
import NewsletterSection from "@/components/NewsletterSection";
import { FeaturedSectionTitle } from "@/components/FeaturedProductSectionTitle";

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts();
  const sections = await getPageSections("home");

  // Get the categories section
  const categoriesSection = sections.find(
    (s) => s.section === "categories" && s.isActive
  );

  const currentfocusSection = sections.find(
    (s) => s.section === "currentfocus" && s.isActive
  );

  const brandstorySection = sections.find(
    (s) => s.section === "brandstory" && s.isActive
  );
  const newsletterSection = sections.find(
    (s) => s.section === "newsletter" && s.isActive
  );

  return (
    <div className="min-h-screen">
      {/* Dynamic Hero Section from Database */}
      <HeroSection />

      {/* Featured Products Section */}
      <section className="container mx-auto px-4 py-24 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        </div>

        {/* Title Section - now a client component */}
        <FeaturedSectionTitle />

        {/* Description + Carousel - stacked on mobile, side by side on desktop */}
        <div className="flex flex-col md:flex-row md:items-start gap-8 md:gap-12 pl-4">
          {/* Subtitle */}
          <p className="text-base md:text-lg text-muted-foreground md:w-64 flex-shrink-0 md:pt-2">
            Discover our curated selection of premium products
          </p>

          {/* Carousel */}
          <div className="flex-1 min-w-0">
            {featuredProducts.length > 0 ? (
              <FeaturedProductsCarousel products={featuredProducts} />
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No featured products available yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Dynamic Category Spotlight Section */}
      {categoriesSection &&
        categoriesSection.content &&
        typeof categoriesSection.content === "object" &&
        !Array.isArray(categoriesSection.content) && (
          <CategorySpotlight content={categoriesSection.content} />
        )}

      {currentfocusSection && (
        <CurrentFocusSection content={currentfocusSection.content} />
      )}

      {brandstorySection && (
        <BrandStorySection content={brandstorySection.content} />
      )}
      {newsletterSection && (
        <NewsletterSection content={newsletterSection.content} />
      )}
    </div>
  );
}
