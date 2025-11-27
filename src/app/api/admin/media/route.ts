// app/api/admin/media/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { getImagesFromFolder, getPageFolders } from "@/lib/cloudinary";

export async function GET(req: NextRequest) {
  try {
    const session = verifyAuth(req);
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const folder = searchParams.get("folder") || "vyse/pages";

    const [images, subfolders] = await Promise.all([
      getImagesFromFolder(folder),
      folder === "vyse/pages" ? getPageFolders() : Promise.resolve([]),
    ]);

    return NextResponse.json({ images, subfolders });
  } catch (error) {
    console.error("Error fetching media:", error);
    return NextResponse.json(
      { error: "Failed to fetch media" },
      { status: 500 }
    );
  }
}
