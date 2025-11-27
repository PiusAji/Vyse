import { NextResponse, NextRequest } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { deleteImage, extractPublicIdFromUrl } from "@/lib/cloudinary";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  try {
    const session = await verifyAuth(req);
    if (!session || session.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id: productId, variantId } = await params;

    if (!productId || !variantId) {
      return new NextResponse("Product ID and Variant ID are required", {
        status: 400,
      });
    }

    // Check if the variant belongs to the product and include tags for logging
    const existingVariant = await prisma.productVariant.findUnique({
      where: {
        id: variantId,
        productId: productId,
      },
      include: {
        tags: true, // ✅ Include tags to see what's being deleted
      },
    });

    if (!existingVariant) {
      return new NextResponse("Product variant not found for this product", {
        status: 404,
      });
    }

    // Collect public IDs of images to delete from Cloudinary
    const publicIdsToDelete: string[] = [];
    try {
      const imageUrls = JSON.parse(existingVariant.images as string);
      if (Array.isArray(imageUrls)) {
        for (const imageUrl of imageUrls) {
          const publicId = extractPublicIdFromUrl(imageUrl);
          if (publicId) {
            publicIdsToDelete.push(publicId);
          }
        }
      }
    } catch (parseError) {
      console.error(
        "Error parsing variant images JSON for variant",
        variantId,
        ":",
        parseError
      );
    }

    // Delete images from Cloudinary
    for (const publicId of publicIdsToDelete) {
      try {
        await deleteImage(publicId);
      } catch (cloudinaryError) {
        console.error(
          `Failed to delete image ${publicId} from Cloudinary:`,
          cloudinaryError
        );
      }
    }

    // Delete the variant (cascade will automatically delete related VariantTags)
    await prisma.productVariant.delete({
      where: {
        id: variantId,
      },
    });

    // Optional: Log what was deleted for debugging
    console.log(
      `Deleted variant ${variantId} with ${existingVariant.tags.length} tag(s) and ${publicIdsToDelete.length} image(s)`
    );

    return NextResponse.json({
      message: "Product variant deleted successfully",
      deletedTags: existingVariant.tags.length, // ✅ Include in response
    });
  } catch (error) {
    console.error("[PRODUCT_VARIANT_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
