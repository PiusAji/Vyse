// app/admin/media/MediaManagementClient.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Upload,
  FolderPlus,
  X,
  Copy,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";

type MediaSource = "products" | "pages";

interface CloudinaryResource {
  public_id: string;
  secure_url: string;
  format: string;
  width: number;
  height: number;
  created_at: string;
}

interface Folder {
  name: string;
  path: string;
}

interface MediaManagementClientProps {
  initialData: {
    images: CloudinaryResource[];
    subfolders: Folder[];
  };
}

export default function MediaManagementClient({
  initialData,
}: MediaManagementClientProps) {
  const [mediaSource, setMediaSource] = useState<MediaSource>("pages");
  const [images, setImages] = useState<CloudinaryResource[]>(
    initialData.images
  );
  const [subfolders, setSubfolders] = useState<Folder[]>(
    initialData.subfolders
  );
  const [selectedFolder, setSelectedFolder] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      let folder = "";
      if (mediaSource === "pages") {
        folder = selectedFolder || "vyse/pages";
      } else {
        folder = "vyse-products-product-variants";
      }

      const res = await fetch(
        `/api/admin/media?folder=${encodeURIComponent(folder)}`
      );
      const data = await res.json();

      setImages(data.images || []);
      if (mediaSource === "pages" && !selectedFolder) {
        setSubfolders(data.subfolders || []);
      }
    } catch (error) {
      console.error("Failed to fetch media:", error);
    } finally {
      setLoading(false);
    }
  }, [mediaSource, selectedFolder]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadPromises = Array.from(files).map(async (file) => {
      const formData = new FormData();
      formData.append("file", file);

      if (mediaSource === "pages") {
        if (selectedFolder) {
          const subfolderName = selectedFolder.replace("vyse/pages/", "");
          formData.append("subfolder", subfolderName);
        }
        return fetch("/api/admin/media/upload", {
          method: "POST",
          body: formData,
        });
      } else {
        return fetch("/api/admin/products/upload", {
          method: "POST",
          body: formData,
        });
      }
    });

    try {
      await Promise.all(uploadPromises);
      await fetchMedia();
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Some uploads failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    const dummyBlob = new Blob([""], { type: "text/plain" });
    const formData = new FormData();
    formData.append("file", dummyBlob, ".gitkeep");
    formData.append("subfolder", newFolderName);

    try {
      await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
      });
      setNewFolderName("");
      setShowNewFolderModal(false);
      await fetchMedia();
    } catch (error) {
      console.error("Failed to create folder:", error);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    alert("URL copied to clipboard!");
  };

  const handleDelete = async (publicId: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      const res = await fetch("/api/admin/media/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId }),
      });

      if (res.ok) {
        await fetchMedia();
      } else {
        alert("Failed to delete image");
      }
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleSourceChange = (source: MediaSource) => {
    setMediaSource(source);
    setSelectedFolder("");
  };

  return (
    <div className="p-8 max-w-7xl bg-card mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Media Management</h1>
        <p className="text-muted-foreground">
          Manage your product and page media assets
        </p>
      </div>

      {/* Source Selector */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => handleSourceChange("pages")}
          className={`px-6 py-3 rounded-md font-medium transition-colors ${
            mediaSource === "pages"
              ? "bg-primary text-primary-foreground"
              : "bg-background border border-border hover:bg-accent"
          }`}
        >
          Page Media
        </button>
        <button
          onClick={() => handleSourceChange("products")}
          className={`px-6 py-3 rounded-md font-medium transition-colors ${
            mediaSource === "products"
              ? "bg-primary text-primary-foreground"
              : "bg-background border border-border hover:bg-accent"
          }`}
        >
          Product Media
        </button>
      </div>

      {/* Subfolder Navigation for Pages */}
      {mediaSource === "pages" && (
        <div className="mb-6 flex flex-wrap gap-2 items-center">
          <button
            onClick={() => setSelectedFolder("")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              !selectedFolder
                ? "bg-primary text-primary-foreground"
                : "bg-background border border-border hover:bg-accent"
            }`}
          >
            All Pages
          </button>
          {subfolders.map((folder) => (
            <button
              key={folder.path}
              onClick={() => setSelectedFolder(folder.path)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedFolder === folder.path
                  ? "bg-primary text-primary-foreground"
                  : "bg-background border border-border hover:bg-accent"
              }`}
            >
              {folder.name}
            </button>
          ))}
          <button
            onClick={() => setShowNewFolderModal(true)}
            className="px-4 py-2 rounded-md text-sm font-medium bg-background border border-border hover:bg-accent flex items-center gap-2"
          >
            <FolderPlus className="w-4 h-4" />
            New Folder
          </button>
        </div>
      )}

      {/* Upload Area */}
      <div className="mb-8 border-2 border-dashed border-border rounded-md p-8 text-center hover:border-primary transition-colors bg-card">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleUpload(e.target.files)}
          className="hidden"
          id="file-upload"
          disabled={uploading}
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center gap-3"
        >
          <Upload className="w-12 h-12 text-muted-foreground" />
          <div>
            <p className="text-lg font-medium">
              {uploading ? "Uploading..." : "Click to upload or drag and drop"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Support for single or bulk image uploads
            </p>
          </div>
        </label>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-20">
          <ImageIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">No images found</p>
          <p className="text-muted-foreground text-sm mt-2">
            Upload some images to get started
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {images.map((image) => (
            <div
              key={image.public_id}
              className="group relative bg-background rounded-md border border-border overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="aspect-square relative bg-muted">
                <img
                  src={image.secure_url}
                  alt={image.public_id}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => copyToClipboard(image.secure_url)}
                    className="p-2 bg-background rounded-full hover:bg-accent transition-colors"
                    title="Copy URL"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(image.public_id)}
                    className="p-2 bg-background rounded-full hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-3">
                <p
                  className="text-xs text-muted-foreground truncate"
                  title={image.public_id}
                >
                  {image.public_id.split("/").pop()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {image.width} × {image.height}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background border border-border rounded-md p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Create New Folder</h3>
              <button
                onClick={() => setShowNewFolderModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name (e.g., 'homepage', 'about')"
              className="w-full px-4 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
              onKeyPress={(e) => e.key === "Enter" && handleCreateFolder()}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleCreateFolder}
                className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors font-medium"
              >
                Create
              </button>
              <button
                onClick={() => setShowNewFolderModal(false)}
                className="flex-1 bg-background border border-border px-4 py-2 rounded-md hover:bg-accent transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
