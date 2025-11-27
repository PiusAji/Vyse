// scripts/test-db.js
/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testDatabase() {
  try {
    console.log("🔄 Testing database connection...");

    // Test creating a category
    const category = await prisma.category.create({
      data: {
        name: "Test Category",
        slug: "test-category",
        description: "This is a test category",
      },
    });

    console.log("✅ Database connected successfully!");
    console.log("Created category:", category);

    // Clean up test data
    await prisma.category.delete({
      where: { id: category.id },
    });

    console.log("✅ Test data cleaned up");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
