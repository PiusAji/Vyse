// components/admin/ImagePickerModal.tsx
"use client";

import { useState, useEffect } from "react";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { Prisma } from "@prisma/client";

interface CloudinaryResource {
  public_id: string;
  secure_url: string;
  format: string;
  width: number;
  height: number;
}

interface ImagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (imageUrl: string) => void;
  folder?: "pages" | "products"; // Which media folder to browse
  subfolder?: string; // Optional subfolder for pages
}

export default function ImagePickerModal({
  isOpen,
  onClose,
  onSelect,
  folder = "pages",
  subfolder,
}: ImagePickerModalProps) {
  const [mode, setMode] = useState<"browse" | "upload">("browse");
  const [images, setImages] = useState<CloudinaryResource[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isOpen && mode === "browse") {
      fetchImages();
    }
  }, [isOpen, mode, folder, subfolder]);

  const fetchImages = async () => {
    setLoading(true);
    try {
      let folderPath = "";
      if (folder === "pages") {
        folderPath = subfolder ? `vyse/pages/${subfolder}` : "vyse/pages";
      } else {
        folderPath = "vyse-products-product-variants";
      }

      const res = await fetch(
        `/api/admin/media?folder=${encodeURIComponent(folderPath)}`
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
      const file = files[0]; // Handle single upload for now

      const formData = new FormData();
      formData.append("file", file);

      if (folder === "pages" && subfolder) {
        formData.append("subfolder", subfolder);
      }

      const endpoint =
        folder === "pages"
          ? "/api/admin/media/upload"
          : "/api/admin/products/upload";

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();

      // Select the newly uploaded image
      onSelect(data.url);
      onClose();
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-border rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h2 className="text-2xl font-bold">Select Image</h2>
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
                      onClick={() => {
                        onSelect(image.secure_url);
                        onClose();
                      }}
                      className="group relative bg-background rounded-md border border-border overflow-hidden hover:border-primary transition-all hover:shadow-lg"
                    >
                      <div className="aspect-square relative bg-muted">
                        <img
                          src={image.secure_url}
                          alt={image.public_id}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                          <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            Select
                          </span>
                        </div>
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
                  {uploading ? "Uploading..." : "Click to upload image"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  PNG, JPG, GIF up to 10MB
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
