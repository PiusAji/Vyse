import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out successfully" });

  // Clear the token cookie
  response.cookies.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "development" ? "lax" : "strict",
    maxAge: 0,
    path: "/",
    domain: process.env.NODE_ENV === "development" ? "localhost" : undefined,
  });

  return response;
}
