"use client";

import { useState } from "react";
import { Prisma } from "@prisma/client";
import Image from "next/image";
import { Upload, X, Library } from "lucide-react";
import ImagePickerModal from "../ImagePickerModal";

interface HeroContent {
  heading?: string;
  subheading?: string;
  description?: string;
  flipwordVariants?: string[];
  image?: string;
  ctaText?: string;
  ctaLink?: string;
}

interface HeroSectionFormProps {
  initialContent?: Prisma.JsonObject;
  onSave: (content: Prisma.JsonObject) => Promise<void>;
}

export default function HeroSectionForm({
  initialContent,
  onSave,
}: HeroSectionFormProps) {
  const [content, setContent] = useState<HeroContent>(
    (initialContent as HeroContent) || {}
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const file = files[0];
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      setContent({ ...content, image: data.url });
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    setContent({ ...content, image: imageUrl });
  };

  const handleRemoveImage = () => {
    setContent({ ...content, image: undefined });
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
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Heading */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Heading <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={content.heading || ""}
            onChange={(e) =>
              setContent({ ...content, heading: e.target.value })
            }
            className="w-full px-4 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="e.g., Welcome to VYSE"
            required
          />
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
            placeholder="e.g., Engineered for the"
          />
        </div>

        {/* Description (Optional) */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Description{" "}
            <span className="text-xs text-muted-foreground">(Optional)</span>
          </label>
          <textarea
            value={content.description || ""}
            onChange={(e) =>
              setContent({ ...content, description: e.target.value })
            }
            rows={3}
            className="w-full px-4 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            placeholder="e.g., Engineered for the modern woman who moves with purpose. From studio to street, every step counts."
          />
          <p className="text-xs text-muted-foreground mt-1">
            This appears below the heading and subheading
          </p>
        </div>

        {/* Flipword Variants */}
        <div>
          <label className="block text-sm font-medium mb-3">
            Flipword Variants
          </label>
          <div className="flex gap-3">
            {[0, 1, 2].map((index) => (
              <input
                key={index}
                type="text"
                value={
                  (content.flipwordVariants as string[] | undefined)?.[index] ||
                  ""
                }
                onChange={(e) => {
                  const variants = [
                    ...((content.flipwordVariants as string[] | undefined) || [
                      "",
                      "",
                      "",
                    ]),
                  ];
                  variants[index] = e.target.value;
                  setContent({
                    ...content,
                    flipwordVariants: variants,
                  });
                }}
                className="flex-1 px-4 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder={
                  ["Unstoppable", "Exceptional", "Next Level"][index]
                }
              />
            ))}
          </div>
        </div>

        {/* Image Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Hero Image</label>
          {content.image ? (
            <div className="relative w-full h-64 rounded-md overflow-hidden border border-border">
              <Image
                src={content.image}
                alt="Hero"
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-2 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              className="relative w-full h-64 border-2 border-dashed border-border rounded-md bg-muted/20 flex flex-col items-center justify-center group cursor-pointer hover:border-primary transition-colors"
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add("border-primary", "bg-primary/5");
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove(
                  "border-primary",
                  "bg-primary/5"
                );
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove(
                  "border-primary",
                  "bg-primary/5"
                );
                const files = e.dataTransfer.files;
                if (files) {
                  handleDirectUpload({
                    target: { files },
                  } as React.ChangeEvent<HTMLInputElement>);
                }
              }}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleDirectUpload}
                disabled={isUploading}
                className="hidden"
                id="hero-image-upload"
              />

              <div className="flex flex-col items-center gap-2 flex-1 justify-center pointer-events-none">
                <Upload className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
                <p className="text-sm font-medium text-center">
                  {isUploading ? "Uploading..." : "Click or drag to upload"}
                </p>
                <p className="text-xs text-muted-foreground">PNG, JPG, GIF</p>
              </div>

              <label
                htmlFor="hero-image-upload"
                className="absolute inset-0 cursor-pointer"
              />

              {/* Browse Library Button at bottom */}
              <button
                type="button"
                onClick={() => setIsImagePickerOpen(true)}
                className="absolute bottom-3 right-3 flex items-center gap-1 px-3 py-1.5 text-xs bg-background border border-border rounded hover:bg-accent transition-colors font-medium"
              >
                <Library className="w-3 h-3" />
                Browse
              </button>
            </div>
          )}
        </div>

        {/* CTA Button Text */}
        <div>
          <label className="block text-sm font-medium mb-2">Button Text</label>
          <input
            type="text"
            value={content.ctaText || ""}
            onChange={(e) =>
              setContent({ ...content, ctaText: e.target.value })
            }
            className="w-full px-4 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="e.g., Shop Now"
          />
        </div>

        {/* CTA Button Link */}
        <div>
          <label className="block text-sm font-medium mb-2">Button Link</label>
          <input
            type="text"
            value={content.ctaLink || ""}
            onChange={(e) =>
              setContent({ ...content, ctaLink: e.target.value })
            }
            className="w-full px-4 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="e.g., /products"
          />
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full bg-primary text-primary-foreground py-3 rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? "Saving..." : "Save Hero Section"}
        </button>
      </form>

      {/* Image Picker Modal */}
      <ImagePickerModal
        isOpen={isImagePickerOpen}
        onClose={() => setIsImagePickerOpen(false)}
        onSelect={handleImageSelect}
        folder="pages"
      />
    </>
  );
}
