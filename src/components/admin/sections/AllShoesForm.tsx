"use client";

import { useState } from "react";
import { Prisma } from "@prisma/client";

interface AllShoesContent {
  heading?: string;
  subheading?: string;
  description?: string;
}

interface AllShoesFormProps {
  initialContent?: Prisma.JsonObject;
  onSave: (content: Prisma.JsonObject) => Promise<void>;
}

export default function AllShoesForm({
  initialContent,
  onSave,
}: AllShoesFormProps) {
  const [content, setContent] = useState<AllShoesContent>(
    (initialContent as AllShoesContent) || {}
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await onSave(content as Prisma.JsonObject);
    } catch (error) {
      console.error("Error saving:", error);
      alert("Failed to save section");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Heading */}
      <div>
        <label className="block text-sm font-medium mb-2">Heading</label>
        <input
          type="text"
          value={content.heading || ""}
          onChange={(e) => setContent({ ...content, heading: e.target.value })}
          className="w-full px-4 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="e.g., ALL SHOES"
        />
        <p className="text-xs text-muted-foreground mt-1">
          First line of title (white text)
        </p>
      </div>

      {/* Subheading */}
      <div>
        <label className="block text-sm font-medium mb-2">Subheading</label>
        <input
          type="text"
          value={content.subheading || ""}
          onChange={(e) =>
            setContent({ ...content, subheading: e.target.value })
          }
          className="w-full px-4 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="e.g., FIND YOUR FIT"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Second line of title (gradient colored)
        </p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <textarea
          value={content.description || ""}
          onChange={(e) =>
            setContent({ ...content, description: e.target.value })
          }
          rows={3}
          className="w-full px-4 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          placeholder="e.g., Explore our complete collection of premium footwear designed for every step of your journey."
        />
        <p className="text-xs text-muted-foreground mt-1">
          Brief description below the title
        </p>
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="w-full bg-primary text-primary-foreground py-3 rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSaving ? "Saving..." : "Save All Shoes Section"}
      </button>
    </form>
  );
}
