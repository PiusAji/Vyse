// components/FeaturedCard.tsx
"use client";

import { cn } from "@/lib/utils";
import React from "react";
import { motion } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import { Product, ProductVariant } from "@prisma/client";

interface ProductWithVariants extends Product {
  variants: ProductVariant[];
}

interface FeaturedCardProps {
  product: ProductWithVariants;
  className?: string;
}

export const FeaturedCard = ({ product, className }: FeaturedCardProps) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  // Only run animations after component mounts on client
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Get main variant (first one)
  const mainVariant = product.variants[0];

  // Parse images JSON and find nobg image
  const images: string[] = mainVariant ? JSON.parse(mainVariant.images) : [];
  const nobgImage = images.find((img) => img.includes("nobg"));

  // Fallback if no nobg image
  const displayImage = nobgImage || images[0] || "/placeholder.png";

  const gradientVariants = {
    initial: {
      backgroundPosition: "0 50%",
    },
    animate: {
      backgroundPosition: ["0, 50%", "100% 50%", "0 50%"],
    },
  };

  return (
    <div
      className="block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${product.id}`}>
        <div
          className={cn("relative p-[4px] group", className)}
          suppressHydrationWarning
        >
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
            style={{
              backgroundSize: "400% 400%",
            }}
            className={cn(
              "absolute inset-0 rounded-3xl z-[1] opacity-60 group-hover:opacity-100 blur-xl transition duration-500 will-change-transform",
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
            style={{
              backgroundSize: "400% 400%",
            }}
            className={cn(
              "absolute inset-0 rounded-3xl z-[1] will-change-transform",
              "bg-[radial-gradient(circle_farthest-side_at_0_100%,oklch(0.9247_0.0524_66.1732),transparent),radial-gradient(circle_farthest-side_at_100%_0,oklch(0.3163_0.019_63.6992),transparent),radial-gradient(circle_farthest-side_at_100%_100%,oklch(0.285_0_0),transparent),radial-gradient(circle_farthest-side_at_0_0,oklch(0.4017_0_0),oklch(0.1776_0_0))]"
            )}
          />

          {/* Card wrapper - overflow visible to allow image to break out */}
          <div className="relative z-10 rounded-3xl">
            {/* Product name - vertical on left side, rotates on hover */}
            <motion.div
              className="absolute left-0 top-[45%] -translate-y-1/2 origin-left z-30 bg-primary/90 backdrop-blur-sm px-3 py-2 rounded-r-lg"
              animate={{
                rotate: isHovered ? 0 : -90,
                x: isHovered ? 0 : -2,
              }}
              transition={{
                duration: 0.5,
                ease: "easeInOut",
              }}
            >
              <h3 className="text-sm font-bold text-primary-foreground whitespace-nowrap">
                {product.name}
              </h3>
            </motion.div>

            <div className="aspect-square relative">
              {/* Background container - FIXED smaller size */}
              <div className="absolute inset-0 flex items-end p-6">
                <motion.div
                  className="w-full h-[75%] bg-gradient-to-br from-card to-muted rounded-3xl"
                  animate={{
                    scale: isHovered ? 1.1 : 1,
                  }}
                  transition={{
                    duration: 0.5,
                    ease: "easeInOut",
                  }}
                />
              </div>

              {/* Product image - ABSOLUTE, LARGER, centered */}
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
                style={{
                  width: "110%",
                  height: "110%",
                }}
                animate={{
                  scale: isHovered ? 0.85 : 1,
                }}
                transition={{
                  duration: 0.5,
                  ease: "easeInOut",
                }}
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

              {/* Product info - only price and CTA at bottom */}
              <div className="absolute bottom-0 left-0 right-0 z-20 p-6">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xl font-bold text-primary">
                    ${product.price.toFixed(2)}
                  </span>
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
