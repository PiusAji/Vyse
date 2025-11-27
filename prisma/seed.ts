import { PrismaClient } from "@prisma/client";
import * as fs from "fs";

const prisma = new PrismaClient();

async function main() {
  // Get all data from SQLite
  const categories = await prisma.category.findMany();
  const products = await prisma.product.findMany();
  const productCategories = await prisma.productCategory.findMany();
  const productVariants = await prisma.productVariant.findMany();
  const productTags = await prisma.productTag.findMany();
  const users = await prisma.user.findMany();
  const pageSections = await prisma.pageSection.findMany();

  console.log("Exported data:");
  console.log("Categories:", categories.length);
  console.log("Products:", products.length);
  console.log("Product Categories:", productCategories.length);
  console.log("Product Variants:", productVariants.length);
  console.log("Product Tags:", productTags.length);
  console.log("Users:", users.length);
  console.log("Page Sections:", pageSections.length);

  // Save to JSON file
  fs.writeFileSync(
    "backup.json",
    JSON.stringify(
      {
        categories,
        products,
        productCategories,
        productVariants,
        productTags,
        users,
        pageSections,
      },
      null,
      2
    )
  );

  console.log("\n✅ Data exported to backup.json");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
