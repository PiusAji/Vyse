// app/api/admin/pages/sections/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { upsertPageSection } from "@/lib/admin-page-api";
import { Prisma } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const session = verifyAuth(req);
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { page, section, content, isActive } = body;

    const result = await upsertPageSection({
      page,
      section,
      content: content as Prisma.JsonObject,
      isActive,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error saving page section:", error);
    return NextResponse.json(
      { error: "Failed to save section" },
      { status: 500 }
    );
  }
}
