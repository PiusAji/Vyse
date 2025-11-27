"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Prisma } from "@prisma/client";
import { ArrowRight, Sparkles } from "lucide-react";
import { Compare } from "@/components/ui/compare";

interface BrandStoryContent extends Prisma.JsonObject {
  eyebrow?: string;
  heading?: string;
  subheading?: string;
  description?: string;
  image?: string;
  secondImage?: string;
  ctaText?: string;
  ctaLink?: string;
}

interface BrandStorySectionProps {
  content: Prisma.JsonValue;
}

function isBrandStoryContent(
  value: Prisma.JsonValue
): value is BrandStoryContent {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return true;
}

export default function BrandStorySection({
  content: rawContent,
}: BrandStorySectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const isValidContent = isBrandStoryContent(rawContent);
  const content = isValidContent ? (rawContent as BrandStoryContent) : null;

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

  if (!isValidContent || !content) {
    console.error("Invalid content structure for BrandStorySection");
    return null;
  }

  if (!content.heading && !content.image && !content.secondImage) {
    return null;
  }

  return (
    <section
      ref={containerRef}
      className="container mx-auto px-4 py-32 relative overflow-visible"
    >
      {/* Animated gradient blobs */}
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
        className="absolute -top-32 left-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none"
      />

      <div className="relative z-10">
        <div className="mx-auto px-4">
          {/* Eyebrow + Heading Only - Full Width */}
          <div className="mb-8 lg:mb-12">
            {content.eyebrow && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isVisible ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm"
              >
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                  {content.eyebrow}
                </span>
              </motion.div>
            )}

            {content.heading && (
              <h2 className="text-5xl lg:text-8xl font-black leading-[0.95] lg:leading-[0.9] tracking-tighter -mb-2">
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
                    className="inline-block mr-2 lg:mr-4"
                  >
                    {word}
                  </motion.span>
                ))}
              </h2>
            )}
          </div>

          {/* Two Column Layout - Stacks on Mobile */}
          <div className="flex flex-col lg:grid lg:grid-cols-5 gap-8 lg:gap-16">
            {/* Left Column - Text Content */}
            <div className="order-1 lg:col-span-2">
              {/* Subheading */}
              {content.subheading && (
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={isVisible ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="mb-6 lg:mb-8"
                >
                  <h3 className="text-6xl lg:text-8xl font-black leading-[0.9] tracking-tighter bg-gradient-to-r from-primary via-primary/70 to-primary/40 bg-clip-text text-transparent">
                    {content.subheading}
                  </h3>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={isVisible ? { scaleX: 1 } : {}}
                    transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
                    className="h-1 w-32 md:w-64 max-w-md bg-gradient-to-r from-primary via-primary/50 to-transparent rounded-full origin-left mt-4"
                  />
                </motion.div>
              )}

              {/* Description */}
              {content.description && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: 1 }}
                  className="text-base md:text-xl text-muted-foreground leading-relaxed mb-6 lg:mb-8"
                >
                  {content.description}
                </motion.p>
              )}

              {/* CTA */}
              {content.ctaText && content.ctaLink && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={isVisible ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 1.2, duration: 0.6 }}
                >
                  <Link
                    href={content.ctaLink}
                    className="inline-flex items-center gap-3 text-foreground font-bold text-base md:text-lg group"
                  >
                    <span className="relative">
                      {content.ctaText}
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                    </span>
                    <motion.div className="transition-transform duration-300 group-hover:translate-x-1">
                      <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
                    </motion.div>
                  </Link>
                </motion.div>
              )}
            </div>

            {/* Right Column - Image/Compare Component */}
            <div className="order-2 lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, x: 50 }}
                animate={isVisible ? { opacity: 1, scale: 1, x: 0 } : {}}
                transition={{
                  duration: 1,
                  delay: 0.4,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="relative"
              >
                {content.image && content.secondImage ? (
                  <div className="relative w-full h-[400px] md:h-[450px] lg:h-[500px] rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl">
                    <Compare
                      firstImage={content.image}
                      secondImage={content.secondImage}
                      firstImageClassName="object-cover"
                      secondImageClassname="object-cover"
                      className="h-full w-full rounded-2xl lg:rounded-3xl"
                      slideMode="hover"
                      autoplay={true}
                    />
                  </div>
                ) : content.image ? (
                  <div className="relative w-full h-[400px] md:h-[450px] lg:h-[500px] rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl">
                    <img
                      src={content.image}
                      alt="Brand Story"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : null}

                {/* Decorative elements - hidden on mobile */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={isVisible ? { opacity: 1 } : {}}
                  transition={{ delay: 1, duration: 1 }}
                  className="hidden lg:block absolute -top-4 -right-4 w-32 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none"
                />
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={isVisible ? { opacity: 1 } : {}}
                  transition={{ delay: 1.2, duration: 1 }}
                  className="hidden lg:block absolute -bottom-4 -left-4 w-40 h-40 bg-primary/30 rounded-full blur-3xl pointer-events-none"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
