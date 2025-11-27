import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import MediaManagementClient from "./MediaManagementClient";
import { getImagesFromFolder, getPageFolders } from "@/lib/cloudinary";

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

async function getInitialData(): Promise<{
  images: CloudinaryResource[];
  subfolders: Folder[];
}> {
  try {
    const [images, subfolders] = await Promise.all([
      getImagesFromFolder("vyse/pages"),
      getPageFolders(),
    ]);
    return {
      images: images as CloudinaryResource[],
      subfolders: subfolders as Folder[],
    };
  } catch (error) {
    console.error("Failed to fetch initial data:", error);
    return { images: [], subfolders: [] };
  }
}

export default async function MediaManagementPage() {
  // Server-side auth check
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  if (!token) {
    redirect("/admin/login");
  }

  const initialData = await getInitialData();

  return <MediaManagementClient initialData={initialData} />;
}
