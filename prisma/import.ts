import { PrismaClient } from "@prisma/client";
import * as fs from "fs";

const prisma = new PrismaClient();

async function main() {
  const data = JSON.parse(fs.readFileSync("backup.json", "utf-8"));

  console.log("Importing to Neon...\n");

  // Import in order (respecting foreign keys)
  if (data.categories?.length) {
    for (const category of data.categories) {
      await prisma.category.create({ data: category });
    }
    console.log("✅ Categories imported:", data.categories.length);
  }

  if (data.products?.length) {
    for (const product of data.products) {
      await prisma.product.create({ data: product });
    }
    console.log("✅ Products imported:", data.products.length);
  }

  if (data.productCategories?.length) {
    for (const pc of data.productCategories) {
      await prisma.productCategory.create({ data: pc });
    }
    console.log(
      "✅ Product Categories imported:",
      data.productCategories.length
    );
  }

  if (data.productVariants?.length) {
    for (const pv of data.productVariants) {
      await prisma.productVariant.create({ data: pv });
    }
    console.log("✅ Product Variants imported:", data.productVariants.length);
  }

  if (data.productTags?.length) {
    for (const pt of data.productTags) {
      await prisma.productTag.create({ data: pt });
    }
    console.log("✅ Product Tags imported:", data.productTags.length);
  }

  if (data.users?.length) {
    for (const user of data.users) {
      await prisma.user.create({ data: user });
    }
    console.log("✅ Users imported:", data.users.length);
  }

  if (data.pageSections?.length) {
    for (const ps of data.pageSections) {
      await prisma.pageSection.create({ data: ps });
    }
    console.log("✅ Page Sections imported:", data.pageSections.length);
  }

  console.log("\n🎉 All data imported successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
