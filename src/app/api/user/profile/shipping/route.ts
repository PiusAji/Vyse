import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAuth } from "@/lib/auth";

interface Address {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export async function POST(request: NextRequest) {
  try {
    const decoded = verifyAuth(request);

    if (!decoded) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { address } = await request.json();

    // Get current user to check existing addresses
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { addresses: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Handle the Json type from Prisma
    let existingAddresses: Address[] = [];
    if (user.addresses) {
      // Prisma Json type can be various types, so we need to handle it carefully
      const addressesValue = user.addresses as unknown;

      if (Array.isArray(addressesValue)) {
        existingAddresses = addressesValue as Address[];
      } else if (typeof addressesValue === "string") {
        // If it's a string, parse it as JSON
        existingAddresses = JSON.parse(addressesValue);
      } else if (
        typeof addressesValue === "object" &&
        addressesValue !== null
      ) {
        // If it's an object, wrap it in an array
        existingAddresses = [addressesValue as Address];
      }
    }

    // Create or update the shipping address
    // If user already has addresses, update the first one (primary address)
    // Otherwise create a new address array
    const updatedAddresses =
      existingAddresses.length > 0
        ? [{ ...existingAddresses[0], ...address }]
        : [address];

    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        addresses: updatedAddresses,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        addresses: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      user: updatedUser,
      message: "Shipping address saved successfully",
    });
  } catch (error) {
    console.error("Shipping address save error:", error);
    return NextResponse.json(
      { error: "Failed to save shipping address" },
      { status: 500 }
    );
  }
}
