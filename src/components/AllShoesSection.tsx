"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "motion/react";
import { Prisma } from "@prisma/client";
import { Sparkles } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";

import {
  Product,
  ProductVariant,
  ProductTag,
  VariantTag,
} from "@prisma/client";
import CustomDropdown from "./ui/CustomDropDown";

interface VariantWithTags extends ProductVariant {
  tags: VariantTag[];
}

interface ProductWithVariants extends Product {
  variants: VariantWithTags[];
  tags: ProductTag[];
  categories: Array<{
    category: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
}

interface AllShoesContent extends Prisma.JsonObject {
  heading?: string;
  subheading?: string;
  description?: string;
}

interface AllShoesSectionProps {
  content: Prisma.JsonValue;
  products: ProductWithVariants[];
}

function isAllShoesContent(value: Prisma.JsonValue): value is AllShoesContent {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return true;
}

export default function AllShoesSection({
  content: rawContent,
  products: initialProducts,
}: AllShoesSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  // Infinite scroll
  const [displayCount, setDisplayCount] = useState(9);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const lastProductRef = useRef<HTMLDivElement>(null);

  const isValidContent = isAllShoesContent(rawContent);
  const content = isValidContent ? (rawContent as AllShoesContent) : null;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => setIsVisible(true), 100);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  // Get unique categories
  const categories = Array.from(
    new Set(
      initialProducts.flatMap((p) =>
        p.categories.map((c) => JSON.stringify(c.category))
      )
    )
  ).map((c) => JSON.parse(c));

  // Get unique tags
  const tags = Array.from(
    new Set(initialProducts.flatMap((p) => p.tags.map((t) => t.tag)))
  );

  const categoryOptions = [
    { value: "all", label: "All Categories" },
    ...categories.map((cat) => ({ value: cat.slug, label: cat.name })),
  ];

  const tagOptions = [
    { value: "all", label: "All Tags" },
    ...tags.map((tag) => ({
      value: tag,
      label: tag.charAt(0).toUpperCase() + tag.slice(1).replace("-", " "),
    })),
  ];

  const sortOptions = [
    { value: "newest", label: "Newest" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
  ];

  // Filter products
  let filteredProducts = [...initialProducts];

  if (selectedCategory !== "all") {
    filteredProducts = filteredProducts.filter((p) =>
      p.categories.some((c) => c.category.slug === selectedCategory)
    );
  }

  if (selectedTag !== "all") {
    filteredProducts = filteredProducts.filter((p) =>
      p.tags.some((t) => t.tag === selectedTag)
    );
  }

  // Sort products
  if (sortBy === "newest") {
    filteredProducts.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } else if (sortBy === "price-low") {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-high") {
    filteredProducts.sort((a, b) => b.price - a.price);
  }

  const displayedProducts = filteredProducts.slice(0, displayCount);

  // Infinite scroll observer - observe the last product item
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          displayCount < filteredProducts.length
        ) {
          setDisplayCount((prev) =>
            Math.min(prev + 9, filteredProducts.length)
          );
        }
      },
      { threshold: 0.1, rootMargin: "800px" }
    );

    if (lastProductRef.current) {
      observer.observe(lastProductRef.current);
    }

    return () => {
      if (lastProductRef.current) {
        observer.unobserve(lastProductRef.current);
      }
    };
  }, [displayCount, filteredProducts.length]);

  if (!isValidContent || !content) {
    console.error("Invalid content structure for AllShoesSection");
    return null;
  }

  return (
    <section ref={containerRef} className="relative py-32 overflow-visible">
      {/* Animated gradient blob */}
      <motion.div
        animate={{
          x: mousePosition.x * 0.02,
          y: mousePosition.y * 0.02,
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          x: { duration: 0.5 },
          y: { duration: 0.5 },
          scale: { duration: 8, repeat: Infinity, ease: "easeInOut" },
          opacity: { duration: 8, repeat: Infinity, ease: "easeInOut" },
        }}
        className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none"
      />

      <div className="container mx-auto px-8 relative z-10">
        <div className="mx-auto">
          {/* Header */}
          <div className="mb-16">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <div className="space-y-4 mb-8">
                {content.heading && (
                  <h2 className="text-[clamp(3rem,8vw,7rem)] font-black leading-[0.9] tracking-tighter">
                    {content.heading.split(" ").map((word, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, y: 100 }}
                        animate={isVisible ? { opacity: 1, y: 0 } : {}}
                        transition={{
                          duration: 0.8,
                          delay: i * 0.1,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="inline-block mr-4"
                      >
                        {word}
                      </motion.span>
                    ))}
                  </h2>
                )}

                {content.subheading && (
                  <motion.h2
                    initial={{ opacity: 0, x: -50 }}
                    animate={isVisible ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="text-[clamp(3rem,8vw,7rem)] font-black leading-[0.9] tracking-tighter bg-gradient-to-r from-primary via-primary/70 to-primary/40 bg-clip-text text-transparent"
                  >
                    {content.subheading}
                  </motion.h2>
                )}

                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={isVisible ? { scaleX: 1 } : {}}
                  transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
                  className="h-1 w-32 md:w-64 max-w-md bg-gradient-to-r from-primary via-primary/50 to-transparent rounded-full origin-left"
                />
              </div>

              {content.description && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: 1 }}
                  className="text-xl text-muted-foreground max-w-2xl leading-relaxed"
                >
                  {content.description}
                </motion.p>
              )}
            </motion.div>
          </div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="flex flex-wrap gap-4 mb-12 md:justify-between"
          >
            <div className="flex flex-wrap gap-4">
              {/* Category Filter */}
              <CustomDropdown
                options={categoryOptions}
                value={selectedCategory}
                onChange={setSelectedCategory}
                placeholder="All Categories"
              />

              {/* Tag Filter */}
              <CustomDropdown
                options={tagOptions}
                value={selectedTag}
                onChange={setSelectedTag}
                placeholder="All Tags"
              />
            </div>

            {/* Sort */}
            <CustomDropdown
              options={sortOptions}
              value={sortBy}
              onChange={setSortBy}
              placeholder="Sort by"
            />
          </motion.div>

          {/* Results count */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 1.4 }}
            className="text-sm text-muted-foreground mb-8"
          >
            Showing {displayedProducts.length} of {filteredProducts.length}{" "}
            products
          </motion.p>

          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedProducts.map((product, index) => (
              <motion.div
                key={product.id}
                ref={
                  index === displayedProducts.length - 3 ? lastProductRef : null
                }
                initial={{ opacity: 0, y: 40 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.6,
                  delay: 1.6 + index * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>

          {/* Load more trigger */}
          {displayCount < filteredProducts.length && (
            <div
              ref={loadMoreRef}
              className="h-20 flex items-center justify-center mt-12"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
