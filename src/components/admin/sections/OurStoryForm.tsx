"use client";

import { useState } from "react";
import { Prisma } from "@prisma/client";
import Image from "next/image";
import { Upload, X, Library, Plus, Trash2, GripVertical } from "lucide-react";
import ImagePickerModal from "../ImagePickerModal";

interface TimelineEntry {
  year: string;
  description: string;
  image?: string;
}

interface OurStoryContent {
  heading?: string;
  subheading?: string;
  timeline?: TimelineEntry[];
}

interface OurStoryFormProps {
  initialContent?: Prisma.JsonObject;
  onSave: (content: Prisma.JsonObject) => Promise<void>;
}

export default function OurStoryForm({
  initialContent,
  onSave,
}: OurStoryFormProps) {
  const [content, setContent] = useState<OurStoryContent>(() => {
    if (
      initialContent &&
      typeof initialContent === "object" &&
      "timeline" in initialContent
    ) {
      return initialContent as OurStoryContent;
    }
    return { timeline: [] };
  });
  const [isSaving, setIsSaving] = useState(false);
  const [activeImagePicker, setActiveImagePicker] = useState<number | null>(
    null
  );
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const handleDirectUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingIndex(index);
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

      const updatedTimeline = [...(content.timeline || [])];
      updatedTimeline[index] = { ...updatedTimeline[index], image: data.url };
      setContent({ ...content, timeline: updatedTimeline });
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image");
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleImageSelect = (imageUrl: string, index: number) => {
    const updatedTimeline = [...(content.timeline || [])];
    updatedTimeline[index] = { ...updatedTimeline[index], image: imageUrl };
    setContent({ ...content, timeline: updatedTimeline });
    setActiveImagePicker(null);
  };

  const handleRemoveImage = (index: number) => {
    const updatedTimeline = [...(content.timeline || [])];
    updatedTimeline[index] = { ...updatedTimeline[index], image: undefined };
    setContent({ ...content, timeline: updatedTimeline });
  };

  const addYear = () => {
    setContent({
      ...content,
      timeline: [
        ...(content.timeline || []),
        { year: "", description: "", image: "" },
      ],
    });
  };

  const removeYear = (index: number) => {
    const updatedTimeline = (content.timeline || []).filter(
      (_, i) => i !== index
    );
    setContent({ ...content, timeline: updatedTimeline });
  };

  const updateTimelineEntry = (
    index: number,
    field: keyof TimelineEntry,
    value: string | undefined
  ) => {
    const updatedTimeline = [...(content.timeline || [])];
    updatedTimeline[index] = { ...updatedTimeline[index], [field]: value };
    setContent({ ...content, timeline: updatedTimeline });
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
        {/* Heading (Optional) */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Heading{" "}
            <span className="text-xs text-muted-foreground">(Optional)</span>
          </label>
          <input
            type="text"
            value={content.heading || ""}
            onChange={(e) =>
              setContent({ ...content, heading: e.target.value })
            }
            className="w-full px-4 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="e.g., Our Journey"
          />
        </div>

        {/* Subheading (Optional) */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Subheading{" "}
            <span className="text-xs text-muted-foreground">(Optional)</span>
          </label>
          <input
            type="text"
            value={content.subheading || ""}
            onChange={(e) =>
              setContent({ ...content, subheading: e.target.value })
            }
            className="w-full px-4 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="e.g., Every step tells a story"
          />
        </div>

        {/* Timeline Entries */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium">
              Timeline Entries <span className="text-destructive">*</span>
            </label>
            <button
              type="button"
              onClick={addYear}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Year
            </button>
          </div>

          {(content.timeline || []).length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-border rounded-md bg-muted/20">
              <p className="text-muted-foreground mb-4">
                No timeline entries yet
              </p>
              <button
                type="button"
                onClick={addYear}
                className="text-primary hover:underline font-medium"
              >
                Add your first year
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {(content.timeline || []).map((entry, index) => (
                <div
                  key={index}
                  className="p-6 border border-border rounded-lg bg-card relative"
                >
                  {/* Drag Handle & Delete Button */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab" />
                      <span className="text-sm font-semibold text-muted-foreground">
                        Entry #{index + 1}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeYear(index)}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Year Input */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Year <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        value={entry.year}
                        onChange={(e) =>
                          updateTimelineEntry(index, "year", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="e.g., 2020"
                        required
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Description <span className="text-destructive">*</span>
                      </label>
                      <textarea
                        value={entry.description}
                        onChange={(e) =>
                          updateTimelineEntry(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        rows={4}
                        className="w-full px-4 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                        placeholder="Tell the story of this year..."
                        required
                      />
                    </div>

                    {/* Image Upload */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Image <span className="text-destructive">*</span>
                      </label>
                      {entry.image ? (
                        <div className="relative w-full h-48 rounded-md overflow-hidden border border-border">
                          <Image
                            src={entry.image}
                            alt={`Timeline ${entry.year}`}
                            fill
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-2 right-2 p-2 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div
                          className="relative w-full h-48 border-2 border-dashed border-border rounded-md bg-muted/20 flex flex-col items-center justify-center group cursor-pointer hover:border-primary transition-colors"
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.add(
                              "border-primary",
                              "bg-primary/5"
                            );
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
                              handleDirectUpload(
                                {
                                  target: { files },
                                } as React.ChangeEvent<HTMLInputElement>,
                                index
                              );
                            }
                          }}
                        >
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleDirectUpload(e, index)}
                            disabled={uploadingIndex === index}
                            className="hidden"
                            id={`timeline-image-${index}`}
                          />

                          <div className="flex flex-col items-center gap-2 flex-1 justify-center pointer-events-none">
                            <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                            <p className="text-sm font-medium text-center">
                              {uploadingIndex === index
                                ? "Uploading..."
                                : "Click or drag to upload"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              PNG, JPG, GIF
                            </p>
                          </div>

                          <label
                            htmlFor={`timeline-image-${index}`}
                            className="absolute inset-0 cursor-pointer"
                          />

                          {/* Browse Library Button */}
                          <button
                            type="button"
                            onClick={() => setActiveImagePicker(index)}
                            className="absolute bottom-3 right-3 flex items-center gap-1 px-3 py-1.5 text-xs bg-background border border-border rounded hover:bg-accent transition-colors font-medium"
                          >
                            <Library className="w-3 h-3" />
                            Browse
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isSaving || (content.timeline || []).length === 0}
          className="w-full bg-primary text-primary-foreground py-3 rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? "Saving..." : "Save Our Story Section"}
        </button>
      </form>

      {/* Image Picker Modal */}
      {activeImagePicker !== null && (
        <ImagePickerModal
          isOpen={true}
          onClose={() => setActiveImagePicker(null)}
          onSelect={(url) => handleImageSelect(url, activeImagePicker)}
          folder="pages"
        />
      )}
    </>
  );
}
