import { getPageSections } from "@/lib/admin-page-api";
import OurStoryHero from "@/components/OurStoryHero";
import OurStorySection from "@/components/OurStorySection";

export default async function OurStoryPage() {
  // Get page sections from database
  const sections = await getPageSections("about");

  // Get hero section
  const heroSection = sections.find((s) => s.section === "hero" && s.isActive);

  // Get timeline section
  const timelineSection = sections.find(
    (s) => s.section === "ourstory" && s.isActive
  );

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      {heroSection &&
        heroSection.content &&
        typeof heroSection.content === "object" &&
        !Array.isArray(heroSection.content) && (
          <OurStoryHero content={heroSection.content} />
        )}

      {/* Timeline Section */}
      {timelineSection &&
        timelineSection.content &&
        typeof timelineSection.content === "object" &&
        !Array.isArray(timelineSection.content) && (
          <OurStorySection content={timelineSection.content} />
        )}

      {/* Fallback if no content */}
      {!heroSection && !timelineSection && (
        <section className="container mx-auto px-4 py-24">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">Our Story</h2>
            <p className="text-muted-foreground">
              Content is being prepared. Check back soon!
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
