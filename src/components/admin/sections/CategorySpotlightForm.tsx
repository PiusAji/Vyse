"use client";

import { useState } from "react";
import { Prisma } from "@prisma/client";
import Image from "next/image";
import { Upload, X, Library, Plus, GripVertical } from "lucide-react";
import ImagePickerModal from "../ImagePickerModal";

interface CategoryCard {
  id: string;
  name: string;
  image: string;
  link: string;
}

interface CategorySpotlightContent {
  heading?: string;
  subheading?: string;
  description?: string;
  flipWords?: string[];
  categories?: CategoryCard[];
}

interface CategorySpotlightFormProps {
  initialContent?: Prisma.JsonObject;
  onSave: (content: Prisma.JsonObject) => Promise<void>;
}

export default function CategorySpotlightForm({
  initialContent,
  onSave,
}: CategorySpotlightFormProps) {
  const [content, setContent] = useState<CategorySpotlightContent>(
    (initialContent as CategorySpotlightContent) || {
      categories: [],
    }
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState<
    number | null
  >(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const handleDirectUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    categoryIndex: number
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingIndex(categoryIndex);
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
      const updatedCategories = [...(content.categories || [])];
      updatedCategories[categoryIndex] = {
        ...updatedCategories[categoryIndex],
        image: data.url,
      };
      setContent({ ...content, categories: updatedCategories });
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image");
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    if (selectedCategoryIndex !== null) {
      const updatedCategories = [...(content.categories || [])];
      updatedCategories[selectedCategoryIndex] = {
        ...updatedCategories[selectedCategoryIndex],
        image: imageUrl,
      };
      setContent({ ...content, categories: updatedCategories });
    }
  };

  const addCategory = () => {
    const newCategory: CategoryCard = {
      id: `category-${Date.now()}`,
      name: "",
      image: "",
      link: "",
    };
    setContent({
      ...content,
      categories: [...(content.categories || []), newCategory],
    });
  };

  const removeCategory = (index: number) => {
    const updatedCategories = [...(content.categories || [])];
    updatedCategories.splice(index, 1);
    setContent({ ...content, categories: updatedCategories });
  };

  const updateCategory = (
    index: number,
    field: keyof CategoryCard,
    value: string
  ) => {
    const updatedCategories = [...(content.categories || [])];
    updatedCategories[index] = {
      ...updatedCategories[index],
      [field]: value,
    };
    setContent({ ...content, categories: updatedCategories });
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
            placeholder="e.g., SHOP BY"
            required
          />
        </div>

        {/* Subheading */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Subheading <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={content.subheading || ""}
            onChange={(e) =>
              setContent({ ...content, subheading: e.target.value })
            }
            className="w-full px-4 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="e.g., CATEGORY"
            required
          />
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
            placeholder="e.g., Discover our curated collections designed for every style and occasion"
          />
        </div>

        {/* Flip Words (for animated text in empty space) */}
        <div>
          <label className="block text-sm font-medium mb-3">
            Animated Words (shown in empty grid space)
          </label>
          <p className="text-xs text-muted-foreground mb-3">
            Enter 3 words that will flip/rotate in the empty space
          </p>
          <div className="flex gap-3">
            {[0, 1, 2].map((index) => (
              <input
                key={index}
                type="text"
                value={
                  (content.flipWords as string[] | undefined)?.[index] || ""
                }
                onChange={(e) => {
                  const words = [
                    ...((content.flipWords as string[] | undefined) || [
                      "",
                      "",
                      "",
                    ]),
                  ];
                  words[index] = e.target.value;
                  setContent({
                    ...content,
                    flipWords: words,
                  });
                }}
                className="flex-1 px-4 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder={["Premium", "Curated", "Stylish"][index]}
              />
            ))}
          </div>
        </div>

        {/* Categories */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium">
              Categories <span className="text-destructive">*</span>
            </label>
            <button
              type="button"
              onClick={addCategory}
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors font-medium"
            >
              <Plus className="w-3 h-3" />
              Add Category
            </button>
          </div>

          {content.categories && content.categories.length > 0 ? (
            <div className="space-y-4">
              {content.categories.map((category, index) => (
                <div
                  key={category.id}
                  className="border border-border rounded-lg p-4 bg-muted/20"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="mt-2 cursor-move">
                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                    </div>

                    <div className="flex-1 space-y-3">
                      {/* Category Name */}
                      <div>
                        <label className="block text-xs font-medium mb-1">
                          Category Name
                        </label>
                        <input
                          type="text"
                          value={category.name}
                          onChange={(e) =>
                            updateCategory(index, "name", e.target.value)
                          }
                          className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="e.g., Men's"
                          required
                        />
                      </div>

                      {/* Category Link */}
                      <div>
                        <label className="block text-xs font-medium mb-1">
                          Link
                        </label>
                        <input
                          type="text"
                          value={category.link}
                          onChange={(e) =>
                            updateCategory(index, "link", e.target.value)
                          }
                          className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="e.g., /men"
                          required
                        />
                      </div>

                      {/* Category Image */}
                      <div>
                        <label className="block text-xs font-medium mb-1">
                          Image
                        </label>
                        {category.image ? (
                          <div className="relative w-full h-48 rounded-md overflow-hidden border border-border">
                            <Image
                              src={category.image}
                              alt={category.name || "Category"}
                              fill
                              className="object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => updateCategory(index, "image", "")}
                              className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div
                            className="relative w-full h-48 border-2 border-dashed border-border rounded-md bg-background flex flex-col items-center justify-center group cursor-pointer hover:border-primary transition-colors"
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
                              id={`category-image-upload-${index}`}
                            />

                            <div className="flex flex-col items-center gap-2 flex-1 justify-center pointer-events-none">
                              <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                              <p className="text-xs font-medium text-center">
                                {uploadingIndex === index
                                  ? "Uploading..."
                                  : "Click or drag to upload"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                PNG, JPG, GIF
                              </p>
                            </div>

                            <label
                              htmlFor={`category-image-upload-${index}`}
                              className="absolute inset-0 cursor-pointer"
                            />

                            {/* Browse Library Button */}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCategoryIndex(index);
                                setIsImagePickerOpen(true);
                              }}
                              className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 text-xs bg-background border border-border rounded hover:bg-accent transition-colors font-medium"
                            >
                              <Library className="w-3 h-3" />
                              Browse
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeCategory(index)}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed border-border rounded-lg bg-muted/20">
              <p className="text-sm text-muted-foreground mb-2">
                No categories added yet
              </p>
              <button
                type="button"
                onClick={addCategory}
                className="text-sm text-primary hover:underline font-medium"
              >
                Add your first category
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full bg-primary text-primary-foreground py-3 rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? "Saving..." : "Save Category Spotlight"}
        </button>
      </form>

      {/* Image Picker Modal */}
      <ImagePickerModal
        isOpen={isImagePickerOpen}
        onClose={() => {
          setIsImagePickerOpen(false);
          setSelectedCategoryIndex(null);
        }}
        onSelect={handleImageSelect}
        folder="pages"
      />
    </>
  );
}
