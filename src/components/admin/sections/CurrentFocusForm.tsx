"use client";

import { useState } from "react";
import { Prisma } from "@prisma/client";
import Image from "next/image";
import { Upload, X, Library, GripVertical, Trash2 } from "lucide-react";
import ImagePickerModal from "../ImagePickerModal";

interface SpotlightItem {
  id: string;
  tag: string;
  title: string;
  description: string;
  image: string;
  featured: boolean;
  enabled: boolean;
}

interface CurrentFocusContent {
  heading: string;
  subheading: string;
  spotlights: SpotlightItem[];
  [key: string]: string | SpotlightItem[] | boolean | number | undefined;
}

interface CurrentFocusFormProps {
  initialContent?: Prisma.JsonObject | null;
  onSave: (content: Prisma.JsonValue) => Promise<void>;
}

const AVAILABLE_TAGS = [
  { value: "new-arrival", label: "New Arrivals" },
  { value: "trending", label: "Trending" },
  { value: "sale", label: "On Sale" },
  { value: "limited-edition", label: "Limited Edition" },
  { value: "bestseller", label: "Best Seller" },
];

function isValidContent(value: unknown): value is CurrentFocusContent {
  if (!value || typeof value !== "object") return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.heading === "string" &&
    typeof obj.subheading === "string" &&
    Array.isArray(obj.spotlights)
  );
}

export default function CurrentFocusForm({
  initialContent,
  onSave,
}: CurrentFocusFormProps) {
  const [content, setContent] = useState<CurrentFocusContent>(() => {
    if (!initialContent) {
      return {
        heading: "Current Focus",
        subheading: "Styles we're loving right now",
        spotlights: [],
      };
    }

    if (isValidContent(initialContent)) {
      return initialContent;
    }

    return {
      heading: "Current Focus",
      subheading: "Styles we're loving right now",
      spotlights: [],
    };
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
  const [activeSpotlightId, setActiveSpotlightId] = useState<string | null>(
    null
  );
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const handleDirectUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    spotlightId: string
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingId(spotlightId);
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
      updateSpotlight(spotlightId, "image", data.url);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image");
    } finally {
      setUploadingId(null);
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    if (activeSpotlightId) {
      updateSpotlight(activeSpotlightId, "image", imageUrl);
    }
  };

  const updateSpotlight = (
    id: string,
    field: keyof SpotlightItem,
    value: string | boolean
  ) => {
    setContent({
      ...content,
      spotlights: content.spotlights.map((spotlight) =>
        spotlight.id === id ? { ...spotlight, [field]: value } : spotlight
      ),
    });
  };

  const addSpotlight = () => {
    const newSpotlight: SpotlightItem = {
      id: `spotlight-${Date.now()}`,
      tag: "new-arrival",
      title: "",
      description: "",
      image: "",
      featured: false,
      enabled: true,
    };
    setContent({
      ...content,
      spotlights: [...content.spotlights, newSpotlight],
    });
  };

  const removeSpotlight = (id: string) => {
    setContent({
      ...content,
      spotlights: content.spotlights.filter((s) => s.id !== id),
    });
  };

  const toggleFeatured = (id: string) => {
    setContent((prevContent) => ({
      ...prevContent,
      spotlights: prevContent.spotlights.map(
        (spotlight) =>
          spotlight.id === id
            ? { ...spotlight, featured: !spotlight.featured }
            : { ...spotlight, featured: false } // Unfeatured all others
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await onSave(content as Prisma.JsonValue);
      alert("Current Focus section saved successfully!");
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
        {/* Section Heading */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Section Heading <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={content.heading}
            onChange={(e) =>
              setContent({ ...content, heading: e.target.value })
            }
            className="w-full px-4 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="e.g., Current Focus"
            required
          />
        </div>

        {/* Section Subheading */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Section Subheading
          </label>
          <input
            type="text"
            value={content.subheading}
            onChange={(e) =>
              setContent({ ...content, subheading: e.target.value })
            }
            className="w-full px-4 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="e.g., Styles we're loving right now"
          />
        </div>

        {/* Spotlights */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium">
              Collection Spotlights
            </label>
            <button
              type="button"
              onClick={addSpotlight}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm font-medium"
            >
              Add Spotlight
            </button>
          </div>

          {content.spotlights.length === 0 ? (
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center text-muted-foreground">
              <p>No spotlights yet. Click Add Spotlight to create one.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {content.spotlights.map((spotlight, index) => (
                <div
                  key={spotlight.id}
                  className="border border-border rounded-lg p-4 space-y-4 bg-card"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-sm">
                        Spotlight {index + 1}
                      </span>
                      {spotlight.featured && (
                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-medium">
                          Hero
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={spotlight.enabled}
                          onChange={(e) =>
                            updateSpotlight(
                              spotlight.id,
                              "enabled",
                              e.target.checked
                            )
                          }
                          className="rounded border-border"
                        />
                        Enabled
                      </label>
                      <button
                        type="button"
                        onClick={() => removeSpotlight(spotlight.id)}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-md"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Tag Selection */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Collection Tag
                      </label>
                      <select
                        value={spotlight.tag}
                        onChange={(e) =>
                          updateSpotlight(spotlight.id, "tag", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        {AVAILABLE_TAGS.map((tag) => (
                          <option key={tag.value} value={tag.value}>
                            {tag.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Featured Toggle */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Display Size
                      </label>
                      <button
                        type="button"
                        onClick={() => toggleFeatured(spotlight.id)}
                        className={`w-full px-4 py-2 border rounded-md font-medium transition-colors ${
                          spotlight.featured
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background border-border hover:bg-accent"
                        }`}
                      >
                        {spotlight.featured ? "Hero Size" : "Normal Size"}
                      </button>
                      <p className="text-xs text-muted-foreground mt-1">
                        Only one can be hero-sized
                      </p>
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Display Title
                    </label>
                    <input
                      type="text"
                      value={spotlight.title}
                      onChange={(e) =>
                        updateSpotlight(spotlight.id, "title", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="e.g., Fresh Drops"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      value={spotlight.description}
                      onChange={(e) =>
                        updateSpotlight(
                          spotlight.id,
                          "description",
                          e.target.value
                        )
                      }
                      className="w-full px-4 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="e.g., Two new colorways just landed"
                    />
                  </div>

                  {/* Image */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Lifestyle Image
                    </label>
                    {spotlight.image ? (
                      <div className="relative w-full h-48 rounded-md overflow-hidden border border-border">
                        <Image
                          src={spotlight.image}
                          alt={spotlight.title || "Spotlight"}
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            updateSpotlight(spotlight.id, "image", "")
                          }
                          className="absolute top-2 right-2 p-2 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="relative w-full h-48 border-2 border-dashed border-border rounded-md bg-muted/20 flex flex-col items-center justify-center">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleDirectUpload(e, spotlight.id)}
                          disabled={uploadingId === spotlight.id}
                          className="hidden"
                          id={`spotlight-upload-${spotlight.id}`}
                        />

                        <div className="flex flex-col items-center gap-2 flex-1 justify-center pointer-events-none">
                          <Upload className="w-8 h-8 text-muted-foreground" />
                          <p className="text-sm font-medium">
                            {uploadingId === spotlight.id
                              ? "Uploading..."
                              : "Upload Image"}
                          </p>
                        </div>

                        <label
                          htmlFor={`spotlight-upload-${spotlight.id}`}
                          className="absolute inset-0 cursor-pointer"
                        />

                        <button
                          type="button"
                          onClick={() => {
                            setActiveSpotlightId(spotlight.id);
                            setIsImagePickerOpen(true);
                          }}
                          className="absolute bottom-3 right-3 flex items-center gap-1 px-3 py-1.5 text-xs bg-background border border-border rounded hover:bg-accent transition-colors font-medium"
                        >
                          <Library className="w-3 h-3" />
                          Browse
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full bg-primary text-primary-foreground py-3 rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? "Saving..." : "Save Current Focus Section"}
        </button>
      </form>

      {/* Image Picker Modal */}
      <ImagePickerModal
        isOpen={isImagePickerOpen}
        onClose={() => {
          setIsImagePickerOpen(false);
          setActiveSpotlightId(null);
        }}
        onSelect={handleImageSelect}
        folder="pages"
      />
    </>
  );
}
