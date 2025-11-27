// admin/products/upload/route.ts

import { NextRequest, NextResponse } from "next/server";
import { uploadImage } from "@/lib/cloudinary";
import { isAdminRequest } from "@/lib/auth";
import { promises as fs } from "fs";
import path from "path";
import os from "os";

export async function POST(req: NextRequest) {
  let tempFilePath: string | null = null;

  try {
    if (!isAdminRequest(req)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { message: "No file uploaded" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract meaningful name from original filename
    // Remove extension and clean the name
    const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
    const cleanName = fileNameWithoutExt
      .toLowerCase()
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/[^a-z0-9-]/g, "") // Remove special chars
      .replace(/-+/g, "-"); // Replace multiple consecutive dashes with single dash

    // Use OS temp directory or project tmp directory with absolute path
    const tmpDir = path.join(process.cwd(), "tmp");

    // Ensure tmp directory exists
    await fs.mkdir(tmpDir, { recursive: true });

    // Create unique temp file path to avoid conflicts
    const timestamp = Date.now();
    tempFilePath = path.join(tmpDir, `${timestamp}-${file.name}`);

    // Write file to temp location
    await fs.writeFile(tempFilePath, buffer);

    // Upload to Cloudinary with clean name as public_id
    const result = await uploadImage(
      tempFilePath,
      "product-variants",
      cleanName
    );

    // Clean up temp file after successful upload
    try {
      await fs.unlink(tempFilePath);
    } catch (unlinkError) {
      // Log but don't fail the request if cleanup fails
      console.warn("Failed to delete temp file:", unlinkError);
    }

    return NextResponse.json({
      imageUrl: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error("Error uploading image:", error);

    // Attempt to clean up temp file if it exists
    if (tempFilePath) {
      try {
        await fs.unlink(tempFilePath);
      } catch (unlinkError) {
        // Silently fail cleanup on error
        console.warn(
          "Failed to delete temp file during error handling:",
          unlinkError
        );
      }
    }

    return NextResponse.json(
      {
        message: "Image upload failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
