import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { UserRole } from "@prisma/client";

interface JwtPayload {
  userId: string;
  role: UserRole;
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { isAuthenticated: false, isAdmin: false, error: "No token provided" },
        { status: 401 }
      );
    }

    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JwtPayload;

    if (!decodedToken || decodedToken.role !== UserRole.ADMIN) {
      return NextResponse.json(
        {
          isAuthenticated: false,
          isAdmin: false,
          error: "Unauthorized or not an admin",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      isAuthenticated: true,
      isAdmin: true,
      userId: decodedToken.userId,
    });
  } catch (error) {
    console.error("Admin verification error:", error);
    return NextResponse.json(
      { isAuthenticated: false, isAdmin: false, error: "Invalid token" },
      { status: 401 }
    );
  }
}
