"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import AddToCartButton from "@/components/ui/AddToCartButton";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

interface ProductTag {
  id: string;
  productId: string;
  tag: string;
  createdAt: Date;
}

interface ProductVariant {
  id: string;
  productId: string;
  color: string;
  images: string; // JSON string: '["url1","url2"]'
  sizes: string; // JSON string: '["7","8","9","10"]'
  stock: number;
}

interface ProductDetailsProps {
  product: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    tags: ProductTag[];
  };
  variants: ProductVariant[];
}

export default function ProductDetails({
  product,
  variants,
}: ProductDetailsProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    variants[0]
  );
  const [selectedSize, setSelectedSize] = useState<string>(
    JSON.parse(variants[0].sizes)[0] || ""
  );
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.2], [100, 0]);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Check if product has sale tag
  const hasSale = product.tags?.some((t) => t.tag === "sale") || false;
  const originalPrice = product.price;
  const displayPrice = hasSale ? originalPrice * 0.85 : originalPrice;

  // Filter out "nobg" images for detail view
  const allImages = JSON.parse(selectedVariant.images);
  const displayImages = allImages.filter(
    (img: string) => !img.includes("nobg")
  );
  const availableSizes = JSON.parse(selectedVariant.sizes);
  const availableColors = variants.map((variant) => variant.color);

  const handleColorSelect = (color: string) => {
    const variant = variants.find((v) => v.color === color);
    if (variant) {
      setSelectedVariant(variant);
      setSelectedSize(JSON.parse(variant.sizes)[0] || "");
      setCurrentImageIndex(0);
    }
  };

  const handleImageChange = (direction: "prev" | "next") => {
    setCurrentImageIndex((prev) => {
      if (direction === "next") {
        return prev === displayImages.length - 1 ? 0 : prev + 1;
      } else {
        return prev === 0 ? displayImages.length - 1 : prev - 1;
      }
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  return (
    <motion.div
      ref={containerRef}
      style={{ opacity }}
      className="relative min-h-screen py-20"
    >
      {/* Animated gradient background */}
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
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none"
      />

      <div className="container mx-auto px-4">
        <motion.div
          style={{ y }}
          className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 lg:gap-16 max-w-7xl mx-auto"
        >
          {/* LEFT: Image Gallery - Wider */}
          <div className="space-y-6">
            {/* Main Image */}
            <motion.div
              ref={imageRef}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isVisible ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-gradient-to-br from-muted/50 to-muted/20 backdrop-blur-sm border border-primary/10"
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImageIndex}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: isZoomed ? 1.3 : 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5 }}
                  style={{
                    transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                  }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={displayImages[currentImageIndex]}
                    alt={`${product.name} - ${selectedVariant.color}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    priority
                  />
                </motion.div>
              </AnimatePresence>

              {/* Navigation Arrows */}
              {displayImages.length > 1 && (
                <>
                  <button
                    onClick={() => handleImageChange("prev")}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/80 backdrop-blur-md border border-primary/20 flex items-center justify-center hover:bg-background transition-all hover:scale-110"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => handleImageChange("next")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/80 backdrop-blur-md border border-primary/20 flex items-center justify-center hover:bg-background transition-all hover:scale-110"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Zoom indicator */}
              <AnimatePresence>
                {isZoomed && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute top-4 right-4 px-3 py-2 rounded-full bg-background/80 backdrop-blur-md border border-primary/20 flex items-center gap-2"
                  >
                    <ZoomIn className="w-4 h-4" />
                    <span className="text-sm">Hover to zoom</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Image counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-background/80 backdrop-blur-md border border-primary/20">
                <span className="text-sm font-medium">
                  {currentImageIndex + 1} / {displayImages.length}
                </span>
              </div>
            </motion.div>

            {/* Thumbnail Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-5 md:grid-cols-7 gap-3"
            >
              {displayImages.map((image: string, index: number) => (
                <motion.button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                    currentImageIndex === index
                      ? "border-primary shadow-lg shadow-primary/20"
                      : "border-primary/10 hover:border-primary/30"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 15vw, 8vw"
                  />
                </motion.button>
              ))}
            </motion.div>
          </div>

          {/* RIGHT: Product Info */}
          <div className="space-y-6 lg:pt-8">
            {/* Product Name - Cleaner Typography */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={isVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="space-y-3"
            >
              <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                {product.name}
              </h1>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={isVisible ? { scaleX: 1 } : {}}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="h-0.5 w-20 bg-primary rounded-full origin-left"
              />
            </motion.div>

            {/* Price with Sale Logic */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={isVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-baseline gap-3"
            >
              {hasSale ? (
                <>
                  <span className="text-2xl text-muted-foreground line-through font-semibold">
                    ${originalPrice.toFixed(2)}
                  </span>
                  <span className="text-5xl font-black bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    ${displayPrice.toFixed(2)}
                  </span>
                  <span className="text-sm text-red-500 font-bold">
                    15% OFF
                  </span>
                </>
              ) : (
                <span className="text-5xl font-black bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  ${displayPrice.toFixed(2)}
                </span>
              )}
              <span className="text-muted-foreground text-sm">USD</span>
            </motion.div>

            {/* Description */}
            {product.description && (
              <motion.p
                initial={{ opacity: 0, x: 50 }}
                animate={isVisible ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-base text-muted-foreground leading-relaxed"
              >
                {product.description}
              </motion.p>
            )}

            {/* Color Selection */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={isVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Color
                </h3>
                <span className="text-sm font-medium capitalize">
                  {selectedVariant.color}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableColors.map((color: string) => (
                  <motion.button
                    key={color}
                    onClick={() => handleColorSelect(color)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative px-5 py-2.5 rounded-lg font-semibold capitalize text-sm transition-all ${
                      selectedVariant.color === color
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                        : "bg-muted hover:bg-muted/80 border border-primary/10"
                    }`}
                  >
                    {color}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Size Selection - Smaller Buttons */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={isVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Size
                </h3>
                <span className="text-sm font-medium">US {selectedSize}</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {availableSizes.map((size: string) => (
                  <motion.button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`py-2.5 rounded-lg font-semibold text-sm transition-all ${
                      selectedSize === size
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                        : "bg-muted hover:bg-muted/80 border border-primary/10"
                    }`}
                  >
                    {size}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Stock Info */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={isVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex items-center gap-2 text-sm"
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  selectedVariant.stock > 0 ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span className="text-muted-foreground">
                {selectedVariant.stock > 0
                  ? `${selectedVariant.stock} in stock`
                  : "Out of stock"}
              </span>
            </motion.div>

            {/* Add to Cart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <AddToCartButton
                product={{
                  id: product.id,
                  name: product.name,
                  price: displayPrice,
                  images: displayImages,
                  productVariantId: selectedVariant.id,
                }}
                selectedSize={selectedSize}
                selectedColor={selectedVariant.color}
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
