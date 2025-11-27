"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Prisma } from "@prisma/client";
import Image from "next/image";

interface SaleHeroContent extends Prisma.JsonObject {
  heading?: string;
  subheading?: string;
  description?: string;
  image?: string;
}

interface SaleHeroProps {
  content: Prisma.JsonValue;
}

function isSaleHeroContent(value: Prisma.JsonValue): value is SaleHeroContent {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return true;
}

export default function SaleHero({ content: rawContent }: SaleHeroProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const isValidContent = isSaleHeroContent(rawContent);
  const content = isValidContent ? (rawContent as SaleHeroContent) : null;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, 100]);

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
    console.error("Invalid content structure for SaleHero");
    return null;
  }

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center overflow-hidden -mt-16 pt-16"
    >
      {/* Background Image Layer */}
      <div className="absolute inset-0 w-full h-full">
        {content.image && (
          <motion.div
            style={{ scale: imageScale }}
            className="relative w-full h-full"
          >
            <Image
              src={content.image}
              alt={content.heading || "Sale"}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
            {/* Heavy dark overlay for text contrast */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/60 to-black/50" />
          </motion.div>
        )}
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-20">
        <motion.div
          style={{ y: textY }}
          className="max-w-[1600px] mx-auto py-32 lg:py-40"
        >
          {/* Main heading with explosive entrance */}
          <div className="space-y-8 mb-16">
            {content.heading && (
              <div className="overflow-hidden">
                <motion.h1
                  initial={{ y: 200, opacity: 0 }}
                  animate={isVisible ? { y: 0, opacity: 1 } : {}}
                  transition={{
                    duration: 1,
                    delay: 0.2,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="text-[clamp(5rem,12vw,9rem)] font-black leading-[0.85] tracking-tighter text-white"
                  style={{
                    textShadow: "0 10px 40px rgba(0,0,0,0.5)",
                  }}
                >
                  {content.heading}
                </motion.h1>
              </div>
            )}

            {content.subheading && (
              <div className="overflow-hidden">
                <motion.h2
                  initial={{ y: 200, opacity: 0 }}
                  animate={isVisible ? { y: 0, opacity: 1 } : {}}
                  transition={{
                    duration: 1,
                    delay: 0.5,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="text-[clamp(5rem,12vw,9rem)] font-black leading-[0.85] tracking-tighter bg-gradient-to-r from-primary via-primary/70 to-primary/40 bg-clip-text text-transparent"
                  style={{
                    WebkitTextStroke: "1px rgba(255,255,255,0.1)",
                    filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.4))",
                  }}
                >
                  {content.subheading}
                </motion.h2>
              </div>
            )}

            {/* Animated divider */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={isVisible ? { scaleX: 1 } : {}}
              transition={{ duration: 1.2, delay: 1, ease: "easeOut" }}
              className="h-1 w-32 md:w-64 max-w-2xl bg-gradient-to-r from-primary via-primary/50 to-transparent rounded-full origin-left"
            />
          </div>

          {/* Description with pulsing effect */}
          {content.description && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="relative"
            >
              <motion.p
                animate={{
                  textShadow: [
                    "0 0 20px rgba(239, 68, 68, 0.3)",
                    "0 0 40px rgba(239, 68, 68, 0.5)",
                    "0 0 20px rgba(239, 68, 68, 0.3)",
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="text-xl text-white/90 max-w-2xl leading-relaxed"
              >
                {content.description}
              </motion.p>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Seamless gradient transition */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/50 to-transparent pointer-events-none z-20" />
    </section>
  );
}
