import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function absoluteUrl(path: string) {
  if (typeof window !== "undefined") return path;

  // Netlify automatically provides this
  if (process.env.URL) {
    return `${process.env.URL}${path}`;
  }

  // Manual override
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return `${process.env.NEXT_PUBLIC_SITE_URL}${path}`;
  }

  // Local development
  return `http://localhost:${process.env.PORT ?? 3000}${path}`;
}
