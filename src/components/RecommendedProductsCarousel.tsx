"use client";

import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ProductCard } from "./ProductCard";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
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

interface RecommendedProductsCarouselProps {
  products: ProductWithVariants[];
  title?: string;
  description?: string;
}

export function RecommendedProductsCarousel({
  products,
  title = "You Might Also Like",
  description,
}: RecommendedProductsCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    slidesToScroll: 1,
    dragFree: false,
    loop: false,
  });

  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Animated gradient blob */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none"
      />

      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <div className="flex items-end justify-between gap-4 mb-4">
              <div>
                <h2 className="text-[clamp(2.5rem,6vw,4rem)] font-black leading-[0.95] tracking-tighter">
                  {title}
                </h2>
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={isVisible ? { scaleX: 1 } : {}}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="h-1 w-32 bg-gradient-to-r from-primary to-primary/30 rounded-full origin-left mt-4"
                />
              </div>

              {/* Navigation buttons - desktop */}
              <div className="hidden md:flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={scrollPrev}
                  disabled={!prevBtnEnabled}
                  className="rounded-full w-12 h-12 border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all disabled:opacity-30"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={scrollNext}
                  disabled={!nextBtnEnabled}
                  className="rounded-full w-12 h-12 border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all disabled:opacity-30"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {description && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={isVisible ? { opacity: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-lg text-muted-foreground max-w-2xl"
              >
                {description}
              </motion.p>
            )}
          </motion.div>

          {/* Carousel */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <div ref={emblaRef} className="overflow-hidden">
              <div className="flex -ml-4">
                {products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={isVisible ? { opacity: 1, scale: 1 } : {}}
                    transition={{
                      duration: 0.5,
                      delay: 0.5 + index * 0.1,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="flex-[0_0_100%] min-w-0 pl-4 sm:flex-[0_0_50%] lg:flex-[0_0_33.333%]"
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Navigation buttons - mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex md:hidden gap-2 justify-center mt-8"
          >
            <Button
              variant="outline"
              size="icon"
              onClick={scrollPrev}
              disabled={!prevBtnEnabled}
              className="rounded-full w-12 h-12 border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all disabled:opacity-30"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={scrollNext}
              disabled={!nextBtnEnabled}
              className="rounded-full w-12 h-12 border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all disabled:opacity-30"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </motion.div>

          {/* Product count indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="text-center mt-6"
          >
            <p className="text-sm text-muted-foreground">
              Showing {products.length} recommendations
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
