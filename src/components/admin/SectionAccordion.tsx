"use client";

import { useState } from "react";
import { ChevronDown, Eye, EyeOff } from "lucide-react";
import { PageSection, Prisma } from "@prisma/client";
import HeroSectionForm from "./sections/HeroSectionForm";
import { useRouter } from "next/navigation";
import CategorySpotlightForm from "./sections/CategorySpotlightForm";
import CurrentFocusForm from "./sections/CurrentFocusForm";
import BrandStorySectionForm from "./sections/BrandStorySectionForm";
import NewsletterSectionForm from "./sections/NewsletterSectionForm";
import AllShoesForm from "./sections/AllShoesForm";
import CountdownForm from "./sections/CountDownForm";
import OurStoryForm from "./sections/OurStoryForm";

interface SectionAccordionProps {
  pageId: string;
  sectionId: string;
  existingData?: PageSection;
  defaultOpen?: boolean;
}

export default function SectionAccordion({
  pageId,
  sectionId,
  existingData,
  defaultOpen = false,
}: SectionAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const router = useRouter();

  const isConfigured = !!existingData;
  const isActive = existingData?.isActive ?? true;

  const handleSave = async (content: Prisma.JsonValue): Promise<void> => {
    try {
      const response = await fetch("/api/admin/pages/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page: pageId,
          section: sectionId,
          content,
          isActive: true,
        }),
      });

      if (!response.ok) throw new Error("Failed to save");

      alert("Section saved successfully!");
      router.refresh();
    } catch (error) {
      console.error("Error saving section:", error);
      alert("Failed to save section");
    }
  };
  const renderSectionForm = () => {
    switch (sectionId) {
      case "hero":
        return (
          <HeroSectionForm
            initialContent={existingData?.content as Prisma.JsonObject}
            onSave={handleSave}
          />
        );

      case "categories":
        return (
          <CategorySpotlightForm
            initialContent={existingData?.content as Prisma.JsonObject}
            onSave={handleSave}
          />
        );

      case "currentfocus":
        return (
          <CurrentFocusForm
            initialContent={existingData?.content as Prisma.JsonObject}
            onSave={handleSave}
          />
        );
      case "brandstory":
        return (
          <BrandStorySectionForm
            initialContent={existingData?.content as Prisma.JsonObject}
            onSave={handleSave}
          />
        );
      case "newsletter":
        return (
          <NewsletterSectionForm
            initialContent={existingData?.content as Prisma.JsonObject}
            onSave={handleSave}
          />
        );

      case "allshoes":
        return (
          <AllShoesForm
            initialContent={existingData?.content as Prisma.JsonObject}
            onSave={handleSave}
          />
        );
      case "countdown-banner":
        return (
          <CountdownForm
            content={existingData?.content as Prisma.JsonValue}
            onSave={handleSave}
          />
        );
      case "ourstory":
        return (
          <OurStoryForm
            initialContent={existingData?.content as Prisma.JsonObject}
            onSave={handleSave}
          />
        );

      default:
        return (
          <div className="text-center text-muted-foreground py-8">
            Form for &quot;{sectionId}&quot; section coming soon...
          </div>
        );
    }
  };

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 flex items-center justify-between hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <ChevronDown
            className={`w-5 h-5 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
          <div className="text-left">
            <h3 className="text-lg font-semibold capitalize">
              {sectionId.replace(/-/g, " ")}
            </h3>
            {isConfigured && (
              <p className="text-sm text-muted-foreground mt-1">
                Last updated:{" "}
                {new Date(existingData.updatedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isConfigured ? (
            isActive ? (
              <span className="flex items-center text-xs bg-green-500/10 text-green-500 px-3 py-1 rounded">
                <Eye className="w-3 h-3 mr-1" />
                Active
              </span>
            ) : (
              <span className="flex items-center text-xs bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded">
                <EyeOff className="w-3 h-3 mr-1" />
                Inactive
              </span>
            )
          ) : (
            <span className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded">
              Not configured
            </span>
          )}
        </div>
      </button>

      {/* Content */}
      {isOpen && (
        <div className="border-t border-border p-6 bg-muted/20">
          {renderSectionForm()}
        </div>
      )}
    </div>
  );
}
