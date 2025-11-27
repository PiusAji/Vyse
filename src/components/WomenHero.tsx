"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Prisma } from "@prisma/client";
import Image from "next/image";

interface WomenHeroContent extends Prisma.JsonObject {
  heading?: string;
  subheading?: string;
  description?: string;
  image?: string;
}

interface WomenHeroProps {
  content: Prisma.JsonValue;
}

function isWomenHeroContent(
  value: Prisma.JsonValue
): value is WomenHeroContent {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return true;
}

export default function WomenHero({ content: rawContent }: WomenHeroProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const isValidContent = isWomenHeroContent(rawContent);
  const content = isValidContent ? (rawContent as WomenHeroContent) : null;

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
    console.error("Invalid content structure for WomenHero");
    return null;
  }

  return (
    <section
      ref={containerRef}
      className="relative -mt-20 min-h-screen flex items-center overflow-hidden"
    >
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
        className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none"
      />

      {/* Full-width container */}
      <div className="w-full px-4 relative">
        {/* Background Image Layer */}
        <div className="absolute right-0 top-0 bottom-0 w-full lg:w-[55%] h-full">
          {content.image && (
            <motion.div
              initial={{ opacity: 0, scale: 1.1 }}
              animate={isVisible ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full h-full"
            >
              <Image
                src={content.image}
                alt={content.heading || "Women's Collection"}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 55vw"
                priority
              />
              {/* Gradient overlay for blending */}
              <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 lg:via-background/30 to-transparent" />
            </motion.div>
          )}
        </div>

        {/* Text Content Layer - Overlaps image */}
        <div className="container mx-auto lg:pt-20 px-4 relative z-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-[1600px] mx-auto py-32 lg:py-40"
          >
            {/* Heading & Subheading - Allow overflow */}
            <div className="space-y-6 mb-12">
              {content.heading && (
                <motion.h2
                  initial={{ opacity: 0, y: 100 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : {}}
                  transition={{
                    duration: 0.8,
                    delay: 0.2,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="text-[clamp(5rem,12vw,9rem)] font-black leading-[0.85] tracking-tighter"
                  style={{
                    textShadow: "0 4px 20px rgba(0,0,0,0.3)",
                  }}
                >
                  {content.heading}
                </motion.h2>
              )}

              {content.subheading && (
                <motion.h2
                  initial={{ opacity: 0, x: -50 }}
                  animate={isVisible ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="text-[clamp(5rem,12vw,9rem)] font-black leading-[0.85] tracking-tighter bg-gradient-to-r from-primary via-primary/70 to-primary/40 bg-clip-text text-transparent"
                  style={{
                    WebkitTextStroke: "1px rgba(255,255,255,0.1)",
                    filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.4))",
                  }}
                >
                  {content.subheading}
                </motion.h2>
              )}

              <motion.div
                initial={{ scaleX: 0 }}
                animate={isVisible ? { scaleX: 1 } : {}}
                transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
                className="h-1 w-32 md:w-64 max-w-2xl bg-gradient-to-r from-primary via-primary/50 to-transparent rounded-full origin-left"
              />
            </div>

            {/* Description */}
            {content.description && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 1 }}
                className="text-xl text-foreground/90 max-w-2xl leading-relaxed"
                style={{
                  textShadow: "0 2px 10px rgba(0,0,0,0.5)",
                }}
              >
                {content.description}
              </motion.p>
            )}
          </motion.div>
        </div>

        {/* Floating accent element */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-12 right-12 w-32 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none"
        />
      </div>

      {/* Seamless gradient transition to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/50 to-transparent pointer-events-none z-30" />
    </section>
  );
}
