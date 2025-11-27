// components/HeroSection.tsx
import { prisma } from "@/lib/db";
import HeroText from "./HeroText";

interface HeroContent {
  heading?: string;
  subheading?: string;
  flipwordVariants?: string[];
  image?: string;
  ctaText?: string;
  ctaLink?: string;
}

export default async function HeroSection() {
  try {
    const heroSection = await prisma.pageSection.findUnique({
      where: {
        page_section: {
          page: "home",
          section: "hero",
        },
      },
    });

    if (!heroSection) {
      return (
        <div className="h-screen flex items-center justify-center bg-background text-foreground">
          <p className="text-lg">Hero section not configured</p>
        </div>
      );
    }

    const content = heroSection.content as HeroContent;

    return <HeroText content={content} />;
  } catch (error) {
    console.error("Error fetching hero section:", error);
    return (
      <div className="h-screen flex items-center justify-center bg-background text-foreground">
        <p className="text-lg">Error loading hero section</p>
      </div>
    );
  }
}
