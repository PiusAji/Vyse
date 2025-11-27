"use client";

import { useState } from "react";
import { Prisma } from "@prisma/client";
import { Plus, X } from "lucide-react";

interface NewsletterContent {
  eyebrow?: string;
  heading?: string;
  subheading?: string;
  description?: string;
  placeholder?: string;
  buttonText?: string;
  successMessage?: string;
  benefits?: string[];
}

interface NewsletterSectionFormProps {
  initialContent?: Prisma.JsonObject;
  onSave: (content: Prisma.JsonObject) => Promise<void>;
}

export default function NewsletterSectionForm({
  initialContent,
  onSave,
}: NewsletterSectionFormProps) {
  const [content, setContent] = useState<NewsletterContent>(
    (initialContent as NewsletterContent) || { benefits: [] }
  );
  const [isSaving, setIsSaving] = useState(false);
  const [newBenefit, setNewBenefit] = useState("");

  const handleAddBenefit = () => {
    if (newBenefit.trim()) {
      setContent({
        ...content,
        benefits: [...(content.benefits || []), newBenefit.trim()],
      });
      setNewBenefit("");
    }
  };

  const handleRemoveBenefit = (index: number) => {
    const updated = [...(content.benefits || [])];
    updated.splice(index, 1);
    setContent({ ...content, benefits: updated });
  };

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
      {/* Eyebrow Text */}
      <div>
        <label className="block text-sm font-medium mb-2">Eyebrow Text</label>
        <input
          type="text"
          value={content.eyebrow || ""}
          onChange={(e) => setContent({ ...content, eyebrow: e.target.value })}
          className="w-full px-4 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="e.g., STAY CONNECTED"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Small text above the heading
        </p>
      </div>

      {/* Heading */}
      <div>
        <label className="block text-sm font-medium mb-2">Heading</label>
        <input
          type="text"
          value={content.heading || ""}
          onChange={(e) => setContent({ ...content, heading: e.target.value })}
          className="w-full px-4 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="e.g., DON'T MISS"
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
          placeholder="e.g., A STEP"
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
          placeholder="e.g., Join our community for exclusive access to new releases, behind-the-scenes content, and member-only perks."
        />
        <p className="text-xs text-muted-foreground mt-1">
          Brief description of what subscribers get
        </p>
      </div>

      {/* Input Placeholder */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Email Input Placeholder
        </label>
        <input
          type="text"
          value={content.placeholder || ""}
          onChange={(e) =>
            setContent({ ...content, placeholder: e.target.value })
          }
          className="w-full px-4 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="e.g., Enter your email"
        />
      </div>

      {/* Button Text */}
      <div>
        <label className="block text-sm font-medium mb-2">Button Text</label>
        <input
          type="text"
          value={content.buttonText || ""}
          onChange={(e) =>
            setContent({ ...content, buttonText: e.target.value })
          }
          className="w-full px-4 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="e.g., Join the Movement"
        />
      </div>

      {/* Success Message */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Success Message
        </label>
        <input
          type="text"
          value={content.successMessage || ""}
          onChange={(e) =>
            setContent({ ...content, successMessage: e.target.value })
          }
          className="w-full px-4 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="e.g., Welcome to the crew!"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Message shown after successful submission
        </p>
      </div>

      {/* Benefits List */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Benefits (Optional)
        </label>
        <div className="space-y-3">
          {/* Existing benefits */}
          {content.benefits && content.benefits.length > 0 && (
            <div className="space-y-2">
              {content.benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-4 py-2 bg-muted rounded-md"
                >
                  <span className="flex-1 text-sm">{benefit}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveBenefit(index)}
                    className="p-1 hover:bg-destructive/10 rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add new benefit */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newBenefit}
              onChange={(e) => setNewBenefit(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddBenefit();
                }
              }}
              className="flex-1 px-4 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="e.g., Early access to new releases"
            />
            <button
              type="button"
              onClick={handleAddBenefit}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Add perks/benefits that subscribers will receive
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="w-full bg-primary text-primary-foreground py-3 rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSaving ? "Saving..." : "Save Newsletter Section"}
      </button>
    </form>
  );
}
