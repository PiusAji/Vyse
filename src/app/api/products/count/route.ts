import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Cache for 60 seconds
export const revalidate = 60;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tag = searchParams.get("tag");

    if (!tag) {
      return NextResponse.json(
        { error: "Tag parameter is required" },
        { status: 400 }
      );
    }

    // Count products with this tag
    const productCount = await prisma.product.count({
      where: {
        tags: {
          some: {
            tag: tag,
          },
        },
      },
    });

    // Count variants with this tag
    const variantCount = await prisma.productVariant.count({
      where: {
        tags: {
          some: {
            tag: tag,
          },
        },
      },
    });

    // Return the total (products + variants with this tag)
    const totalCount = productCount + variantCount;

    return NextResponse.json(
      { count: totalCount },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (error) {
    console.error("[PRODUCT_COUNT_GET]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
