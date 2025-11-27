import { prisma } from "@/lib/db";
import { verifyAuth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const auth = verifyAuth(request);
  // console.log("API /api/cart/clear: Auth result:", auth); // Keep for debugging if needed
  if (!auth?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.cartItem.deleteMany({
      where: { userId: auth.userId },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    // console.error("Failed to clear cart:", error); // Keep for debugging if needed
    return NextResponse.json(
      { error: "Failed to clear cart" },
      { status: 500 }
    );
  }
}
