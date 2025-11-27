"use client";

import { useState } from "react";
import { Prisma } from "@prisma/client";
import Image from "next/image";
import { Upload, X, Library } from "lucide-react";
import ImagePickerModal from "../ImagePickerModal";

interface BrandStoryContent {
  eyebrow?: string;
  heading?: string;
  subheading?: string;
  description?: string;
  image?: string;
  secondImage?: string;
  ctaText?: string;
  ctaLink?: string;
}

interface BrandStorySectionFormProps {
  initialContent?: Prisma.JsonObject;
  onSave: (content: Prisma.JsonObject) => Promise<void>;
}

export default function BrandStorySectionForm({
  initialContent,
  onSave,
}: BrandStorySectionFormProps) {
  const [content, setContent] = useState<BrandStoryContent>(
    (initialContent as BrandStoryContent) || {}
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
  const [isSecondImagePickerOpen, setIsSecondImagePickerOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSecondUploading, setIsSecondUploading] = useState(false);

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

  const handleSecondDirectUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsSecondUploading(true);
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
      setContent({ ...content, secondImage: data.url });
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload second image");
    } finally {
      setIsSecondUploading(false);
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    setContent({ ...content, image: imageUrl });
  };

  const handleSecondImageSelect = (imageUrl: string) => {
    setContent({ ...content, secondImage: imageUrl });
  };

  const handleRemoveImage = () => {
    setContent({ ...content, image: undefined });
  };

  const handleRemoveSecondImage = () => {
    setContent({ ...content, secondImage: undefined });
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
        {/* Eyebrow Text */}
        <div>
          <label className="block text-sm font-medium mb-2">Eyebrow Text</label>
          <input
            type="text"
            value={content.eyebrow || ""}
            onChange={(e) =>
              setContent({ ...content, eyebrow: e.target.value })
            }
            className="w-full px-4 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="e.g., OUR STORY"
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
            onChange={(e) =>
              setContent({ ...content, heading: e.target.value })
            }
            className="w-full px-4 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="e.g., Crafted for Those Who Move Forward"
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
            placeholder="e.g., WHO MOVE FORWARD"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Second line of the title (will be gradient colored)
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
            placeholder="e.g., Every step tells a story. We design footwear that moves with purpose, blending timeless craftsmanship with modern innovation."
          />
          <p className="text-xs text-muted-foreground mt-1">
            Keep it brief - 1-2 sentences max
          </p>
        </div>

        {/* First Image Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Brand Image</label>
          {content.image ? (
            <div className="relative w-full h-64 rounded-md overflow-hidden border border-border">
              <Image
                src={content.image}
                alt="Brand Story"
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
                id="brandstory-image-upload"
              />

              <div className="flex flex-col items-center gap-2 flex-1 justify-center pointer-events-none">
                <Upload className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
                <p className="text-sm font-medium text-center">
                  {isUploading ? "Uploading..." : "Click or drag to upload"}
                </p>
                <p className="text-xs text-muted-foreground">PNG, JPG, GIF</p>
              </div>

              <label
                htmlFor="brandstory-image-upload"
                className="absolute inset-0 cursor-pointer"
              />

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

        {/* Second Image Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Second Image</label>
          {content.secondImage ? (
            <div className="relative w-full h-64 rounded-md overflow-hidden border border-border">
              <Image
                src={content.secondImage}
                alt="Brand Story Second"
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveSecondImage}
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
                  handleSecondDirectUpload({
                    target: { files },
                  } as React.ChangeEvent<HTMLInputElement>);
                }
              }}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleSecondDirectUpload}
                disabled={isSecondUploading}
                className="hidden"
                id="brandstory-second-image-upload"
              />

              <div className="flex flex-col items-center gap-2 flex-1 justify-center pointer-events-none">
                <Upload className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
                <p className="text-sm font-medium text-center">
                  {isSecondUploading
                    ? "Uploading..."
                    : "Click or drag to upload"}
                </p>
                <p className="text-xs text-muted-foreground">PNG, JPG, GIF</p>
              </div>

              <label
                htmlFor="brandstory-second-image-upload"
                className="absolute inset-0 cursor-pointer"
              />

              <button
                type="button"
                onClick={() => setIsSecondImagePickerOpen(true)}
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
            placeholder="e.g., Discover Our Journey"
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
            placeholder="e.g., /about"
          />
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full bg-primary text-primary-foreground py-3 rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? "Saving..." : "Save Brand Story Section"}
        </button>
      </form>

      {/* Image Picker Modals */}
      <ImagePickerModal
        isOpen={isImagePickerOpen}
        onClose={() => setIsImagePickerOpen(false)}
        onSelect={handleImageSelect}
        folder="pages"
      />

      <ImagePickerModal
        isOpen={isSecondImagePickerOpen}
        onClose={() => setIsSecondImagePickerOpen(false)}
        onSelect={handleSecondImageSelect}
        folder="pages"
      />
    </>
  );
}
