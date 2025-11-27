// lib/admin-page-api.ts
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export interface PageSectionData {
  page: string;
  section: string;
  content: Prisma.JsonObject; // Use Prisma's JsonObject type
  isActive?: boolean;
  order?: number;
}

// Get all sections for a page
export async function getPageSections(page: string) {
  return await prisma.pageSection.findMany({
    where: { page },
    orderBy: { order: "asc" },
  });
}

// Get a specific section
export async function getPageSection(page: string, section: string) {
  return await prisma.pageSection.findUnique({
    where: { page_section: { page, section } },
  });
}

// Create or update a section
export async function upsertPageSection(data: PageSectionData) {
  return await prisma.pageSection.upsert({
    where: {
      page_section: {
        page: data.page,
        section: data.section,
      },
    },
    update: {
      content: data.content,
      isActive: data.isActive ?? true,
      order: data.order ?? 0,
    },
    create: {
      page: data.page,
      section: data.section,
      content: data.content,
      isActive: data.isActive ?? true,
      order: data.order ?? 0,
    },
  });
}

// Delete a section
export async function deletePageSection(page: string, section: string) {
  return await prisma.pageSection.delete({
    where: { page_section: { page, section } },
  });
}
