// app/(admin)/admin/pages/page.tsx
import Link from "next/link";
import { FileText } from "lucide-react";

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

export default function AdminPagesPage() {
  return (
    <div className="p-6 bg-background text-foreground min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Page Management</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {AVAILABLE_PAGES.map((page) => (
          <Link
            key={page.id}
            href={`/admin/pages/${page.id}`}
            className="border border-border rounded-lg p-6 hover:border-primary transition-colors cursor-pointer bg-card"
          >
            <div className="flex items-start gap-4">
              <FileText className="w-8 h-8 text-primary" />
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">{page.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {page.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {page.sections.map((section) => (
                    <span
                      key={section}
                      className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
                    >
                      {section}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
