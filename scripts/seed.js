// scripts/seed.js
/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const sampleProducts = [
  {
    name: "Air Force 1 Classic",
    description: "Classic white sneaker with premium leather construction",
    price: 120.0,
    category: "sneakers",
    featured: true,
    variants: {
      create: [
        {
          color: "white",
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop",
          ]),
          sizes: JSON.stringify(["7", "8", "9", "10", "11", "12"]),
          stock: 50,
        },
        {
          color: "black",
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop", // Placeholder, ideally different image
          ]),
          sizes: JSON.stringify(["7", "8", "9", "10", "11", "12"]),
          stock: 40,
        },
      ],
    },
  },
  {
    name: "Classic Work Boot",
    description: "Durable leather work boot for all-day comfort",
    price: 180.0,
    category: "boots",
    featured: false,
    variants: {
      create: [
        {
          color: "brown",
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1544966503-7cc5ac882d5c?w=400&h=400&fit=crop",
          ]),
          sizes: JSON.stringify(["8", "9", "10", "11", "12"]),
          stock: 30,
        },
        {
          color: "black",
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1544966503-7cc5ac882d5c?w=400&h=400&fit=crop", // Placeholder
          ]),
          sizes: JSON.stringify(["8", "9", "10", "11", "12"]),
          stock: 25,
        },
      ],
    },
  },
  {
    name: "Running Pro Max",
    description: "High-performance running shoe with advanced cushioning",
    price: 160.0,
    category: "men",
    featured: true,
    variants: {
      create: [
        {
          color: "blue",
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&h=400&fit=crop",
          ]),
          sizes: JSON.stringify(["7", "8", "9", "10", "11"]),
          stock: 25,
        },
        {
          color: "red",
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&h=400&fit=crop", // Placeholder
          ]),
          sizes: JSON.stringify(["7", "8", "9", "10", "11"]),
          stock: 20,
        },
        {
          color: "black",
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&h=400&fit=crop", // Placeholder
          ]),
          sizes: JSON.stringify(["7", "8", "9", "10", "11"]),
          stock: 15,
        },
      ],
    },
  },
];

const categories = [
  { name: "Men", slug: "men", description: "Shoes for men" },
  { name: "Women", slug: "women", description: "Shoes for women" },
  { name: "Sneakers", slug: "sneakers", description: "Casual sneakers" },
  { name: "Boots", slug: "boots", description: "Boots and work shoes" },
];

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seed...");

    // Clear existing data
    await prisma.cartItem.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.productVariant.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();

    // Create categories
    for (const category of categories) {
      await prisma.category.create({ data: category });
    }
    console.log("✅ Categories created");

    // Create products
    for (const productData of sampleProducts) {
      const { variants, ...product } = productData;
      await prisma.product.create({
        data: {
          ...product,
          variants: variants,
        },
      });
    }
    console.log("✅ Products and ProductVariants created");

    // Show final count
    const productCount = await prisma.product.count();
    const categoryCount = await prisma.category.count();

    console.log(`🎉 Seed completed!`);
    console.log(`📦 Created ${productCount} products`);
    console.log(`📁 Created ${categoryCount} categories`);
  } catch (error) {
    console.error("❌ Seed failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();
