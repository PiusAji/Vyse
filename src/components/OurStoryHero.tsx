"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Prisma } from "@prisma/client";
import Image from "next/image";

interface OurStoryHeroContent extends Prisma.JsonObject {
  heading?: string;
  subheading?: string;
  description?: string;
  image?: string;
}

interface OurStoryHeroProps {
  content: Prisma.JsonValue;
}

function isOurStoryHeroContent(
  value: Prisma.JsonValue
): value is OurStoryHeroContent {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return true;
}

export default function OurStoryHero({
  content: rawContent,
}: OurStoryHeroProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const isValidContent = isOurStoryHeroContent(rawContent);
  const content = isValidContent ? (rawContent as OurStoryHeroContent) : null;

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
    console.error("Invalid content structure for OurStoryHero");
    return null;
  }

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center overflow-hidden -mt-20"
    >
      {/* Ambient background gradient */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[150px] pointer-events-none"
      />

      {/* Full-width container */}
      <div className="w-full relative">
        {/* Background Image Layer - Full bleed with overlay */}
        <div className="absolute inset-0">
          {content.image && (
            <motion.div
              initial={{ opacity: 0, scale: 1.1 }}
              animate={isVisible ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full h-full"
              style={{
                transform: `translateY(${scrollY * 0.2}px)`,
              }}
            >
              <Image
                src={content.image}
                alt={content.heading || "Our Story"}
                fill
                className="object-cover"
                sizes="100vw"
                priority
              />
              {/* Dark overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/60 to-background" />
            </motion.div>
          )}
        </div>

        {/* Text Content Layer - Centered */}
        <div className="container mx-auto px-4 relative z-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : {}}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-5xl mx-auto py-40 lg:py-48 text-center"
          >
            {/* Small intro tag */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-8"
            >
              <span className="inline-block px-6 py-2 border border-primary/30 rounded-full text-sm font-semibold text-primary uppercase tracking-widest bg-primary/5 backdrop-blur-sm">
                Our Story
              </span>
            </motion.div>

            {/* Main Heading */}
            {content.heading && (
              <motion.h1
                initial={{ opacity: 0, y: 50 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.8,
                  delay: 0.4,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="text-[clamp(3rem,8vw,6rem)] font-black leading-[0.95] tracking-tight mb-6"
                style={{
                  textShadow: "0 4px 30px rgba(0,0,0,0.5)",
                }}
              >
                {content.heading}
              </motion.h1>
            )}

            {/* Subheading */}
            {content.subheading && (
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-[clamp(1.5rem,4vw,3rem)] font-bold leading-tight mb-8 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent"
                style={{
                  filter: "drop-shadow(0 2px 10px rgba(0,0,0,0.3))",
                }}
              >
                {content.subheading}
              </motion.h2>
            )}

            {/* Decorative line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={isVisible ? { scaleX: 1 } : {}}
              transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
              className="h-1 w-48 mx-auto bg-gradient-to-r from-transparent via-primary to-transparent rounded-full mb-10"
            />

            {/* Description */}
            {content.description && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 1 }}
                className="text-lg lg:text-xl text-foreground/90 max-w-3xl mx-auto leading-relaxed"
                style={{
                  textShadow: "0 2px 10px rgba(0,0,0,0.5)",
                }}
              >
                {content.description}
              </motion.p>
            )}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2 text-foreground/60"
          >
            <span className="text-xs uppercase tracking-widest font-medium">
              Scroll
            </span>
            <div className="w-px h-12 bg-gradient-to-b from-foreground/60 to-transparent" />
          </motion.div>
        </motion.div>
      </div>

      {/* Seamless gradient transition */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/50 to-transparent pointer-events-none z-30" />
    </section>
  );
}
