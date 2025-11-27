"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, useMotionValue } from "motion/react";
import { Prisma } from "@prisma/client";
import { ArrowRight, Sparkles } from "lucide-react";

interface SpotlightItem extends Prisma.JsonObject {
  id: string;
  tag: string;
  title: string;
  description: string;
  image: string;
  featured: boolean;
  enabled: boolean;
}

interface CurrentFocusContent extends Prisma.JsonObject {
  heading: string;
  subheading: string;
  spotlights: SpotlightItem[];
}

interface CurrentFocusSectionProps {
  content: Prisma.JsonValue;
}

interface ProductPreview {
  id: string;
  name: string;
  image: string;
}

function isCurrentFocusContent(
  value: Prisma.JsonValue
): value is CurrentFocusContent {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.heading === "string" &&
    typeof obj.subheading === "string" &&
    Array.isArray(obj.spotlights)
  );
}

export default function CurrentFocusSection({
  content: rawContent,
}: CurrentFocusSectionProps) {
  const [productCounts, setProductCounts] = useState<Record<string, number>>(
    {}
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const isValidContent = isCurrentFocusContent(rawContent);
  const content = isValidContent ? (rawContent as CurrentFocusContent) : null;
  const enabledSpotlights = content?.spotlights.filter((s) => s.enabled) || [];

  const heroSpotlight = enabledSpotlights.find((s) => s.featured);
  const regularSpotlights = enabledSpotlights.filter((s) => !s.featured);

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

  useEffect(() => {
    if (!isValidContent || enabledSpotlights.length === 0) {
      setIsLoading(false);
      return;
    }

    const fetchCounts = async () => {
      try {
        const counts: Record<string, number> = {};
        await Promise.all(
          enabledSpotlights.map(async (spotlight) => {
            const response = await fetch(
              `/api/products/count?tag=${spotlight.tag}`,
              { cache: "force-cache" }
            );
            if (response.ok) {
              const data = await response.json();
              counts[spotlight.tag] = data.count || 0;
            }
          })
        );
        setProductCounts(counts);
      } catch (error) {
        console.error("Error fetching product counts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCounts();
  }, []);

  if (!isValidContent) {
    console.error("Invalid content structure for CurrentFocusSection");
    return null;
  }

  if (enabledSpotlights.length === 0) {
    return null;
  }

  return (
    <section ref={containerRef} className="relative py-32 overflow-visible">
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
        className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none"
      />

      <div className="container mx-auto px-4">
        <div className="px-4 mx-auto mb-24">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isVisible ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">
                Curated Collections
              </span>
            </motion.div>

            <div className="space-y-4">
              <h2 className="text-6xl lg:text-8xl font-black leading-[0.9] tracking-tighter">
                {content!.heading.split(" ").map((word, i) => (
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

              <motion.h2
                initial={{ opacity: 0, x: -50 }}
                animate={isVisible ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 1, delay: 0.5 }}
                className="text-6xl lg:text-8xl font-black leading-[0.9] tracking-tighter bg-gradient-to-r from-primary via-primary/70 to-primary/40 bg-clip-text text-transparent"
              >
                FOCUS
              </motion.h2>
            </div>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={isVisible ? { scaleX: 1 } : {}}
              transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
              className="h-1 w-32 md:w-64 max-w-md mt-8 bg-gradient-to-r from-primary via-primary/50 to-transparent rounded-full origin-left"
            />

            {content!.subheading && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 1 }}
                className="text-xl text-muted-foreground mt-8 max-w-2xl leading-relaxed"
              >
                {content!.subheading}
              </motion.p>
            )}
          </motion.div>
        </div>

        <div className="hidden lg:block relative max-w-7xl mx-auto min-h-[1200px]">
          {heroSpotlight && (
            <AbstractCard
              spotlight={heroSpotlight}
              index={0}
              isHero
              isVisible={isVisible}
              productCount={productCounts[heroSpotlight.tag]}
              isLoading={isLoading}
              hoveredCard={hoveredCard}
              setHoveredCard={setHoveredCard}
            />
          )}
          {regularSpotlights.map((spotlight, index) => (
            <AbstractCard
              key={spotlight.id}
              spotlight={spotlight}
              index={heroSpotlight ? index + 1 : index}
              isHero={false}
              isVisible={isVisible}
              productCount={productCounts[spotlight.tag]}
              isLoading={isLoading}
              hoveredCard={hoveredCard}
              setHoveredCard={setHoveredCard}
            />
          ))}
        </div>

        <div className="lg:hidden grid grid-cols-1 gap-6 max-w-2xl mx-auto">
          {enabledSpotlights.map((spotlight, index) => (
            <MobileCard
              key={spotlight.id}
              spotlight={spotlight}
              index={index}
              isVisible={isVisible}
              productCount={productCounts[spotlight.tag]}
              isLoading={isLoading}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function AbstractCard({
  spotlight,
  index,
  isHero,
  isVisible,
  productCount,
  isLoading,
  hoveredCard,
  setHoveredCard,
}: {
  spotlight: SpotlightItem;
  index: number;
  isHero: boolean;
  isVisible: boolean;
  productCount?: number;
  isLoading: boolean;
  hoveredCard: string | null;
  setHoveredCard: (id: string | null) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [productPreview, setProductPreview] = useState<ProductPreview | null>(
    null
  );
  const [showPreview, setShowPreview] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-1, 1], [-8, 8]);
  const rotateY = useTransform(mouseX, [-1, 1], [8, -8]);

  const isHovered = hoveredCard === spotlight.id;

  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  });

  const cardY = useTransform(
    scrollYProgress,
    [0, 1],
    [index % 2 === 0 ? 80 : -80, index % 2 === 0 ? -80 : 80]
  );

  const getCardPosition = () => {
    if (isHero) {
      return {
        top: "5%",
        left: "5%",
        width: "55%",
        height: "700px",
        zIndex: isHovered ? 40 : 10,
      };
    }

    const positions = [
      { top: "10%", right: "5%", width: "38%", height: "550px" },
      { top: "55%", left: "8%", width: "42%", height: "600px" },
      { top: "52%", right: "8%", width: "40%", height: "580px" },
    ];

    const pos = positions[index % positions.length];
    return { ...pos, zIndex: isHovered ? 40 : 5 + index };
  };

  const position = getCardPosition();
  const isBlurred = hoveredCard !== null && hoveredCard !== spotlight.id;

  useEffect(() => {
    if (!isHovered || productPreview) return;

    const fetchPreview = async () => {
      try {
        const response = await fetch(
          `/api/products/preview?tag=${spotlight.tag}`
        );
        if (response.ok) {
          const data = await response.json();
          setProductPreview(data);
        }
      } catch (error) {
        console.error("Failed to fetch product preview:", error);
      }
    };

    fetchPreview();
  }, [isHovered, spotlight.tag, productPreview]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = (e.clientX - centerX) / (rect.width / 2);
    const y = (e.clientY - centerY) / (rect.height / 2);
    mouseX.set(x);
    mouseY.set(y);

    setCursorPosition({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    // Set initial cursor position immediately
    setCursorPosition({
      x: e.clientX,
      y: e.clientY,
    });

    // Only trigger hover after 300ms of staying on the card
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredCard(spotlight.id);
      setShowPreview(true);
    }, 200);
  };

  const handleMouseLeave = () => {
    // Clear the timeout if user leaves before delay completes
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    mouseX.set(0);
    mouseY.set(0);
    setHoveredCard(null);
    setShowPreview(false);
  };

  return (
    <>
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 60, scale: 0.9 }}
        animate={isVisible ? { opacity: 1, y: 0, scale: 1 } : {}}
        transition={{
          duration: 1,
          delay: index * 0.15,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{
          position: "absolute",
          ...position,
          y: cardY,
          overflow: "visible",
        }}
        className="group"
      >
        <Link href={`/collections/${spotlight.tag}`}>
          <motion.div
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
              rotateX,
              rotateY,
              transformStyle: "preserve-3d",
              transition: "transform 0.1s ease-out",
              zIndex: position.zIndex,
            }}
            animate={{
              filter: isBlurred ? "blur(4px)" : "blur(0px)",
              scale: isBlurred ? 0.95 : 1,
            }}
            transition={{ duration: 0.3 }}
            className="relative h-full rounded-3xl bg-card shadow-2xl shadow-black/20 border border-border/50 hover:border-primary/50 hover:shadow-primary/20 transition-all duration-500 overflow-hidden"
          >
            <div className="absolute inset-0 rounded-3xl overflow-hidden">
              <motion.div
                style={{
                  scale: useTransform(
                    scrollYProgress,
                    [0, 0.5, 1],
                    [1.2, 1, 1.2]
                  ),
                  transformStyle: "preserve-3d",
                  translateZ: -50,
                }}
                className="absolute inset-0"
              >
                <Image
                  src={spotlight.image}
                  alt={spotlight.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              </motion.div>

              <motion.div
                initial={false}
                animate={{
                  opacity: isHovered ? 1 : 0,
                }}
                className="absolute inset-0 bg-gradient-to-b from-transparent via-background/10 to-background/30 backdrop-blur-[2px]"
              />

              <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]" />
              </div>
            </div>

            <div className="relative h-full flex flex-col justify-between p-8 lg:p-12">
              <motion.div
                style={{ translateZ: 30 }}
                className="flex justify-end relative z-10"
              >
                {!isLoading && productCount !== undefined && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="px-6 py-3 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 shadow-2xl"
                  >
                    <span className="text-base font-bold text-white flex items-center gap-2">
                      <motion.span
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-2 h-2 rounded-full bg-primary shadow-lg shadow-primary/50"
                      />
                      {productCount} {productCount === 1 ? "style" : "styles"}
                    </span>
                  </motion.div>
                )}
              </motion.div>

              <motion.div
                style={{ translateZ: 50 }}
                className="space-y-6 relative z-10"
              >
                <motion.h3
                  initial={{ opacity: 0, y: 30 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.4 + index * 0.1, duration: 0.8 }}
                  whileHover={{ x: 5 }}
                  className={`font-black text-white leading-[1.1] tracking-tighter ${
                    isHero ? "text-6xl lg:text-7xl" : "text-4xl lg:text-5xl"
                  }`}
                >
                  {spotlight.title}
                </motion.h3>

                {spotlight.description && (
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.6 + index * 0.1, duration: 0.6 }}
                    className={`text-white/90 leading-relaxed ${
                      isHero ? "text-xl" : "text-lg"
                    }`}
                  >
                    {spotlight.description}
                  </motion.p>
                )}

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={isVisible ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.7 + index * 0.1, duration: 0.6 }}
                  whileHover={{ x: 10, scale: 1.02 }}
                  className="inline-flex items-center gap-3 text-white font-bold text-lg"
                >
                  <span className="relative">
                    Explore Collection
                    <motion.span
                      initial={{ scaleX: 0 }}
                      whileHover={{ scaleX: 1 }}
                      transition={{ duration: 0.3 }}
                      className="absolute bottom-0 left-0 w-full h-0.5 bg-white origin-left"
                    />
                  </span>
                  <motion.div
                    animate={{ x: isHovered ? [0, 5, 0] : 0 }}
                    transition={{
                      duration: 1,
                      repeat: isHovered ? Infinity : 0,
                    }}
                  >
                    <ArrowRight className="w-6 h-6" />
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>

            <motion.div
              initial={{ x: "-100%" }}
              animate={isHovered ? { x: "100%" } : { x: "-100%" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none"
            />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              className="absolute inset-0 rounded-3xl shadow-[inset_0_0_60px_rgba(var(--primary),0.3)] pointer-events-none"
            />
          </motion.div>
        </Link>
      </motion.div>

      {showPreview && productPreview && productPreview.image && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          style={{
            position: "fixed",
            left: cursorPosition.x + 20,
            top: cursorPosition.y + 20,
            pointerEvents: "none",
          }}
          className="w-56 h-56 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/40 bg-background z-[9999]"
        >
          <Image
            src={productPreview.image}
            alt={productPreview.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-white text-sm font-bold line-clamp-2">
              {productPreview.name}
            </p>
          </div>
        </motion.div>
      )}
    </>
  );
}

function MobileCard({
  spotlight,
  index,
  isVisible,
  productCount,
  isLoading,
}: {
  spotlight: SpotlightItem;
  index: number;
  isVisible: boolean;
  productCount?: number;
  isLoading: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.8,
        delay: index * 0.2,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <Link href={`/collections/${spotlight.tag}`} className="group block">
        <div className="relative h-[500px] rounded-3xl overflow-hidden bg-card shadow-xl border border-border/50">
          <Image
            src={spotlight.image}
            alt={spotlight.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          <div className="relative h-full flex flex-col justify-between p-8">
            {!isLoading && productCount !== undefined && (
              <div className="flex justify-end">
                <div className="px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full border border-white/20">
                  <span className="text-sm font-bold text-white">
                    {productCount} {productCount === 1 ? "style" : "styles"}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-4xl font-black text-white leading-tight">
                {spotlight.title}
              </h3>
              {spotlight.description && (
                <p className="text-white/90 text-base">
                  {spotlight.description}
                </p>
              )}
              <div className="flex items-center gap-2 text-white font-bold">
                <span>Explore Collection</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
