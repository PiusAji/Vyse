// app/(admin)/admin/pages/[page]/page.tsx
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getPageSections } from "@/lib/admin-page-api";
import SectionAccordion from "@/components/admin/SectionAccordion";

const AVAILABLE_PAGES = [
  {
    id: "home",
    name: "Home",
    description: "Main landing page",
    sections: [
      "hero",
      "featured-products",
      "categories",
      "currentfocus",
      "brandstory",
      "newsletter",
    ],
  },
  {
    id: "all-shoes",
    name: "All Shoes",
    description: "All shoes collection page",
    sections: ["allshoes"], // Changed from ["hero", "filters-banner"]
  },
  {
    id: "men",
    name: "Men",
    description: "Men's collection page",
    sections: ["hero", "productgrid"],
  },
  {
    id: "women",
    name: "Women",
    description: "Women's collection page",
    sections: ["hero", "productgrid"],
  },
  {
    id: "sneakers",
    name: "Sneakers",
    description: "Sneakers collection page",
    sections: ["hero", "productgrid"],
  },
  {
    id: "boots",
    name: "Boots",
    description: "Boots collection page",
    sections: ["hero", "productgrid"],
  },
  {
    id: "sale",
    name: "Sale",
    description: "Sale and promotions page",
    sections: ["hero", "countdown-banner", "sale-products"],
  },
  {
    id: "about",
    name: "About Us",
    description: "Company story and information",
    sections: ["hero", "ourstory"],
  },
  {
    id: "contact",
    name: "Contact",
    description: "Contact information and form",
    sections: ["hero", "contact-info", "contact-form", "map"],
  },
];

interface PageEditProps {
  params: Promise<{
    page: string;
  }>;
}

export default async function PageEdit({ params }: PageEditProps) {
  const { page: pageId } = await params;

  const pageConfig = AVAILABLE_PAGES.find((p) => p.id === pageId);
  if (!pageConfig) {
    notFound();
  }

  const existingSections = await getPageSections(pageId);
  const sectionMap = new Map(existingSections.map((s) => [s.section, s]));

  return (
    <div className="p-6 bg-background text-foreground min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/pages"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Pages
        </Link>
        <h1 className="text-3xl font-bold">{pageConfig.name}</h1>
        <p className="text-muted-foreground mt-2">{pageConfig.description}</p>
      </div>

      {/* Sections Accordion */}
      <div className="space-y-4">
        {pageConfig.sections.map((sectionId, index) => {
          const existingSection = sectionMap.get(sectionId);

          return (
            <SectionAccordion
              key={sectionId}
              pageId={pageId}
              sectionId={sectionId}
              existingData={existingSection}
              defaultOpen={index === 0} // Open first section by default
            />
          );
        })}
      </div>
    </div>
  );
}
