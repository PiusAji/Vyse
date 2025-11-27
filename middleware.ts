import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { UserRole } from "@prisma/client";

interface JwtPayload {
  userId: string;
  role: UserRole;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log(`Middleware: Processing request for ${pathname}`);

  // Allow access to /admin/login and API routes for admin login/verify
  if (pathname === "/admin/login" || pathname.startsWith("/api/admin/auth")) {
    console.log(`Middleware: Allowing access to ${pathname}`);
    return NextResponse.next();
  }

  // Protect all other /admin routes
  if (pathname.startsWith("/admin")) {
    console.log(`Middleware: Protecting admin route ${pathname}`);
    const token = request.cookies.get("token")?.value;

    if (!token) {
      console.log(
        `Middleware: No token found for ${pathname}, redirecting to /admin/login`
      );
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      const JWT_SECRET = process.env.JWT_SECRET;
      if (!JWT_SECRET) {
        throw new Error("JWT_SECRET environment variable is not set");
      }
      const decodedToken = jwt.verify(token, JWT_SECRET) as JwtPayload;

      if (!decodedToken || decodedToken.role !== UserRole.ADMIN) {
        console.log(
          `Middleware: Invalid token or not admin for ${pathname}, redirecting to /admin/login`
        );
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
      console.log(`Middleware: Valid admin token for ${pathname}, proceeding`);
      return NextResponse.next();
    } catch (error) {
      console.error("Middleware auth error:", error);
      console.log(
        `Middleware: Token verification failed for ${pathname}, redirecting to /admin/login`
      );
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // For all other routes, proceed as normal
  console.log(`Middleware: Allowing normal access to ${pathname}`);
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/auth/:path*"],
};
