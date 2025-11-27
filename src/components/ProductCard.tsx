"use client";

import { cn } from "@/lib/utils";
import React from "react";
import { motion } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import { Flame, Sparkles } from "lucide-react";
import {
  Product,
  ProductVariant,
  ProductTag,
  VariantTag,
} from "@prisma/client";

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

interface ProductCardProps {
  product: ProductWithVariants;
  className?: string;
}

export const ProductCard = ({ product, className }: ProductCardProps) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);
  const [selectedVariant, setSelectedVariant] = React.useState(0);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const currentVariant = product.variants[selectedVariant];
  const images: string[] = currentVariant
    ? JSON.parse(currentVariant.images)
    : [];
  const nobgImage = images.find((img) => img.includes("nobg"));
  const displayImage = nobgImage || images[0] || "/placeholder.png";

  // Check tags
  const hasSale = product.tags.some((t) => t.tag === "sale");
  const isTrending = product.tags.some((t) => t.tag === "trending");
  const isLimitedEdition = product.tags.some(
    (t) => t.tag === "limited-edition"
  );
  const isNewArrival = product.tags.some((t) => t.tag === "new-arrival");

  // Calculate sale price (15% off for portfolio)
  const originalPrice = product.price;
  const salePrice = hasSale ? originalPrice * 0.85 : originalPrice;

  const gradientVariants = {
    initial: { backgroundPosition: "0 50%" },
    animate: { backgroundPosition: ["0, 50%", "100% 50%", "0 50%"] },
  };

  return (
    <div
      className="block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${product.id}`}>
        <div className={cn("relative p-[4px] group", className)}>
          {/* Animated gradient border (blur) */}
          <motion.div
            variants={gradientVariants}
            initial="initial"
            animate={isMounted ? "animate" : "initial"}
            transition={{
              duration: 5,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            style={{ backgroundSize: "400% 400%" }}
            className={cn(
              "absolute inset-0 rounded-3xl z-[1] opacity-60 group-hover:opacity-100 blur-xl transition duration-500",
              "bg-[radial-gradient(circle_farthest-side_at_0_100%,oklch(0.9247_0.0524_66.1732),transparent),radial-gradient(circle_farthest-side_at_100%_0,oklch(0.3163_0.019_63.6992),transparent),radial-gradient(circle_farthest-side_at_100%_100%,oklch(0.285_0_0),transparent),radial-gradient(circle_farthest-side_at_0_0,oklch(0.4017_0_0),oklch(0.1776_0_0))]"
            )}
          />

          {/* Animated gradient border (solid) */}
          <motion.div
            variants={gradientVariants}
            initial="initial"
            animate={isMounted ? "animate" : "initial"}
            transition={{
              duration: 5,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            style={{ backgroundSize: "400% 400%" }}
            className={cn(
              "absolute inset-0 rounded-3xl z-[1]",
              "bg-[radial-gradient(circle_farthest-side_at_0_100%,oklch(0.9247_0.0524_66.1732),transparent),radial-gradient(circle_farthest-side_at_100%_0,oklch(0.3163_0.019_63.6992),transparent),radial-gradient(circle_farthest-side_at_100%_100%,oklch(0.285_0_0),transparent),radial-gradient(circle_farthest-side_at_0_0,oklch(0.4017_0_0),oklch(0.1776_0_0))]"
            )}
          />

          <div className="relative z-10 rounded-3xl">
            {/* Badges - Top Right */}
            <div className="absolute top-4 right-4 z-30 flex flex-col gap-2 items-end">
              {isTrending && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="bg-red-500 text-white px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5"
                >
                  <Flame className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs font-bold whitespace-nowrap">
                    TRENDING
                  </span>
                </motion.div>
              )}
              {isNewArrival && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold shadow-lg"
                >
                  NEW
                </motion.div>
              )}
              {isLimitedEdition && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring" }}
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>LIMITED</span>
                </motion.div>
              )}
              {hasSale && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg"
                >
                  15% OFF
                </motion.div>
              )}
            </div>

            {/* Product name - vertical on left */}
            <motion.div
              className="absolute left-0 top-[45%] -translate-y-1/2 origin-left z-30 bg-primary/90 backdrop-blur-sm px-3 py-2 rounded-r-lg"
              animate={{
                rotate: isHovered ? 0 : -90,
                x: isHovered ? 0 : -2,
              }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <h3 className="text-sm font-bold text-primary-foreground whitespace-nowrap">
                {product.name}
              </h3>
            </motion.div>

            <div className="aspect-square relative">
              {/* Background */}
              <div className="absolute inset-0 flex items-end p-6">
                <motion.div
                  className="w-full h-[75%] bg-gradient-to-br from-card to-muted rounded-3xl"
                  animate={{ scale: isHovered ? 1.1 : 1 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                />
              </div>

              {/* Product image */}
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
                style={{ width: "110%", height: "110%" }}
                animate={{ scale: isHovered ? 0.85 : 1 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <div className="relative w-full h-full">
                  <Image
                    src={displayImage}
                    alt={product.name}
                    fill
                    className="object-contain drop-shadow-2xl"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              </motion.div>

              {/* Bottom info */}
              <div className="absolute bottom-0 left-0 right-0 z-20 p-6 space-y-3">
                {/* Variant color options */}
                {product.variants.length > 1 && (
                  <div className="flex gap-2 flex-wrap">
                    {product.variants.map((variant, index) => (
                      <button
                        key={variant.id}
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedVariant(index);
                        }}
                        className={cn(
                          "w-6 h-6 rounded-full border-2 transition-all",
                          selectedVariant === index
                            ? "border-primary scale-110"
                            : "border-border hover:border-primary/50"
                        )}
                        style={{ backgroundColor: variant.color }}
                      />
                    ))}
                  </div>
                )}

                {/* Price and CTA */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-baseline gap-2">
                    {hasSale ? (
                      <>
                        <span className="text-sm text-muted-foreground line-through">
                          ${originalPrice.toFixed(2)}
                        </span>
                        <span className="text-xl font-bold text-primary">
                          ${salePrice.toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span className="text-xl font-bold text-primary">
                        ${originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors duration-500 whitespace-nowrap">
                    View Details →
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};
