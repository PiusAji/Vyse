import { NextResponse, NextRequest } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { deleteImage, extractPublicIdFromUrl } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    const session = await verifyAuth(req);
    if (!session || session.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return new NextResponse("Image URL is required", { status: 400 });
    }

    const publicId = extractPublicIdFromUrl(imageUrl);

    if (!publicId) {
      return new NextResponse("Invalid Cloudinary image URL", { status: 400 });
    }

    await deleteImage(publicId);

    return NextResponse.json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("[DELETE_IMAGE_API]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
