// components/admin/ProductImagePicker.tsx
"use client";

import { useState, useEffect } from "react";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

interface CloudinaryResource {
  public_id: string;
  secure_url: string;
  format: string;
  width: number;
  height: number;
}

interface ProductImagePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (imageUrls: string[]) => void;
  selectedImages?: string[];
  multiSelect?: boolean;
}

export default function ProductImagePicker({
  isOpen,
  onClose,
  onSelect,
  selectedImages = [],
  multiSelect = true,
}: ProductImagePickerProps) {
  const [mode, setMode] = useState<"browse" | "upload">("browse");
  const [images, setImages] = useState<CloudinaryResource[]>([]);
  const [localSelected, setLocalSelected] = useState<string[]>(selectedImages);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isOpen && mode === "browse") {
      fetchImages();
    }
  }, [isOpen, mode]);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/media?folder=${encodeURIComponent(
          "vyse-products-product-variants"
        )}`
      );
      const data = await res.json();
      setImages(data.images || []);
    } catch (error) {
      console.error("Failed to fetch images:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/admin/products/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("Upload failed");

        const data = await response.json();
        return data.imageUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);

      if (multiSelect) {
        const combined = [...localSelected, ...uploadedUrls];
        setLocalSelected(combined);
        onSelect(combined);
      } else {
        setLocalSelected(uploadedUrls);
        onSelect(uploadedUrls);
      }

      // Refresh images list
      await fetchImages();
      setMode("browse");
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image(s)");
    } finally {
      setUploading(false);
    }
  };

  const toggleImageSelection = (imageUrl: string) => {
    if (multiSelect) {
      setLocalSelected((prev) =>
        prev.includes(imageUrl)
          ? prev.filter((url) => url !== imageUrl)
          : [...prev, imageUrl]
      );
    } else {
      setLocalSelected([imageUrl]);
    }
  };

  const handleConfirm = () => {
    onSelect(localSelected);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-border rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h2 className="text-2xl font-bold">
            Select Product Image{multiSelect ? "s" : ""}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-4 p-6 border-b border-border">
          <button
            onClick={() => setMode("browse")}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              mode === "browse"
                ? "bg-primary text-primary-foreground"
                : "bg-background border border-border hover:bg-accent"
            }`}
          >
            Browse Library
          </button>
          <button
            onClick={() => setMode("upload")}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              mode === "upload"
                ? "bg-primary text-primary-foreground"
                : "bg-background border border-border hover:bg-accent"
            }`}
          >
            Upload New
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {mode === "browse" ? (
            // Browse Mode
            <>
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : images.length === 0 ? (
                <div className="text-center py-20">
                  <ImageIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg">
                    No images found
                  </p>
                  <p className="text-muted-foreground text-sm mt-2">
                    Try uploading some images first
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {images.map((image) => (
                    <button
                      key={image.public_id}
                      onClick={() => toggleImageSelection(image.secure_url)}
                      className={`group relative bg-background rounded-md border-2 overflow-hidden transition-all ${
                        localSelected.includes(image.secure_url)
                          ? "border-primary shadow-lg"
                          : "border-border hover:border-primary"
                      }`}
                    >
                      <div className="aspect-square relative bg-muted">
                        <img
                          src={image.secure_url}
                          alt={image.public_id}
                          className="w-full h-full object-cover"
                        />
                        {localSelected.includes(image.secure_url) && (
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-bold">
                                ✓
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-2">
                        <p className="text-xs text-muted-foreground truncate">
                          {image.public_id.split("/").pop()}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            // Upload Mode
            <div>
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border rounded-md cursor-pointer hover:border-primary transition-colors bg-muted/20">
                <Upload className="w-12 h-12 text-muted-foreground mb-2" />
                <p className="text-lg font-medium">
                  {uploading ? "Uploading..." : "Click to upload images"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  PNG, JPG, GIF up to 10MB each
                </p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-border bg-muted/50">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-border rounded-md hover:bg-accent transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={localSelected.length === 0}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {multiSelect ? `Confirm (${localSelected.length})` : "Select Image"}
          </button>
        </div>
      </div>
    </div>
  );
}
