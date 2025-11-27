import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { UserRole } from "@prisma/client";

interface JwtPayload {
  userId: string;
  role: UserRole;
}

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set");
}

export function verifyAuth(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  console.log(
    "verifyAuth: Token from cookie:",
    token ? "[PRESENT]" : "[MISSING]"
  );

  if (!token) {
    console.log("verifyAuth: No token found.");
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET as string);
    if (typeof decoded === "string") {
      console.log("verifyAuth: Decoded token is string, returning null.");
      return null;
    }
    console.log(
      "verifyAuth: Token decoded successfully for userId:",
      (decoded as { userId: string }).userId
    );
    return decoded as JwtPayload;
  } catch (error) {
    console.error("verifyAuth: Token verification failed:", error);
    return null;
  }
}

export function isAdminRequest(request: NextRequest): boolean {
  const decoded = verifyAuth(request);
  return decoded?.role === UserRole.ADMIN;
}
