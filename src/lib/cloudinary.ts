import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(
  imagePath: string,
  folder: string,
  customPublicId?: string
) {
  try {
    const uploadOptions: {
      folder: string;
      public_id?: string;
    } = {
      folder: `vyse-products-${folder}`,
    };

    // If customPublicId is provided, use it
    if (customPublicId) {
      uploadOptions.public_id = customPublicId;
    }

    const result = await cloudinary.uploader.upload(imagePath, uploadOptions);
    return result;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Image upload failed");
  }
}

// New function for page content uploads
export async function uploadPageImage(imagePath: string, subfolder?: string) {
  try {
    const folder = subfolder ? `vyse/pages/${subfolder}` : "vyse/pages";
    const result = await cloudinary.uploader.upload(imagePath, {
      folder,
    });
    return result;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Image upload failed");
  }
}

// Fetch images from a specific folder
export async function getImagesFromFolder(folder: string) {
  try {
    const result = await cloudinary.search
      .expression(`folder:${folder}/*`)
      .sort_by("created_at", "desc")
      .max_results(100)
      .execute();

    return result.resources;
  } catch (error) {
    console.error("Cloudinary fetch error:", error);
    throw new Error("Failed to fetch images");
  }
}

// Get all subfolders in vyse/pages
export async function getPageFolders() {
  try {
    const result = await cloudinary.api.sub_folders("vyse/pages");
    return result.folders;
  } catch (error) {
    console.error("Cloudinary folder fetch error:", error);
    return [];
  }
}

export async function deleteImage(publicId: string) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw new Error("Image deletion failed");
  }
}

export function extractPublicIdFromUrl(imageUrl: string): string | null {
  const regex =
    /\/upload\/(?:v\d+\/)?(?:[^/]+\/)*?([^/.]+(?:\/[^/.]+)*?)(?:\.\w+)?$/;
  const match = imageUrl.match(regex);

  if (match && match[1]) {
    return match[1];
  }
  return null;
}
