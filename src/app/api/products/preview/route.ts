import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Map tags to specific product image keywords
const TAG_TO_IMAGE_KEYWORD: Record<string, string> = {
  "new-arrival": "lyleen",
  sale: "classic",
  trending: "checkmate",
  "limited-edition": "canary",
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tag = searchParams.get("tag");

    if (!tag) {
      return NextResponse.json(
        { error: "Tag parameter is required" },
        { status: 400 }
      );
    }

    // Get the keyword for this tag
    const imageKeyword = TAG_TO_IMAGE_KEYWORD[tag];

    // Fetch products with this tag
    const products = await prisma.product.findMany({
      where: {
        tags: {
          some: {
            tag: tag,
          },
        },
      },
      include: {
        variants: true,
      },
    });

    if (products.length === 0) {
      return NextResponse.json({ error: "No product found" }, { status: 404 });
    }

    // If we have a keyword, try to find a product with that keyword in the image name
    let selectedProduct = products[0];

    if (imageKeyword) {
      const matchingProduct = products.find((product) =>
        product.variants.some((variant) => {
          try {
            const images = JSON.parse(variant.images);
            return images.some((img: string) =>
              img.toLowerCase().includes(imageKeyword.toLowerCase())
            );
          } catch (e) {
            return false;
          }
        })
      );

      if (matchingProduct) {
        selectedProduct = matchingProduct;
      }
    }

    // Find the variant with the matching image
    let imageUrl = "";
    if (imageKeyword) {
      const matchingVariant = selectedProduct.variants.find((variant) => {
        try {
          const images = JSON.parse(variant.images);
          return images.some((img: string) =>
            img.toLowerCase().includes(imageKeyword.toLowerCase())
          );
        } catch (e) {
          return false;
        }
      });

      if (matchingVariant) {
        try {
          const images = JSON.parse(matchingVariant.images);
          imageUrl =
            images.find((img: string) =>
              img.toLowerCase().includes(imageKeyword.toLowerCase())
            ) || images[0];
        } catch (e) {
          console.error("Failed to parse variant images:", e);
        }
      }
    }

    // Fallback to first variant's first image
    if (!imageUrl && selectedProduct.variants[0]?.images) {
      try {
        const images = JSON.parse(selectedProduct.variants[0].images);
        imageUrl = images[0] || "";
      } catch (e) {
        console.error("Failed to parse variant images:", e);
      }
    }

    // Return simplified preview data
    return NextResponse.json({
      id: selectedProduct.id,
      name: selectedProduct.name,
      image: imageUrl,
    });
  } catch (error) {
    console.error("Error fetching product preview:", error);
    return NextResponse.json(
      { error: "Failed to fetch product preview" },
      { status: 500 }
    );
  }
}
