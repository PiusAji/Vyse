"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Prisma } from "@prisma/client";
import Image from "next/image";

interface BootsHeroContent extends Prisma.JsonObject {
  heading?: string;
  subheading?: string;
  description?: string;
  image?: string;
}

interface BootsHeroProps {
  content: Prisma.JsonValue;
}

function isBootsHeroContent(
  value: Prisma.JsonValue
): value is BootsHeroContent {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return true;
}

export default function BootsHero({ content: rawContent }: BootsHeroProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const isValidContent = isBootsHeroContent(rawContent);
  const content = isValidContent ? (rawContent as BootsHeroContent) : null;

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
    console.error("Invalid content structure for BootsHero");
    return null;
  }

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center overflow-hidden -mt-20 pt-20"
      style={{ backgroundColor: "hsl(var(--background) / 0.9)" }}
    >
      {/* Diagonal split background effect */}
      <div className="absolute inset-0 overflow-hidden -mt-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 0.15 } : {}}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-primary/20 -mt-20"
          style={{
            transform: `translateY(${scrollY * 0.3}px)`,
          }}
        />

        {/* Animated grid pattern */}
        <motion.div
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute inset-0 opacity-[0.03] -mt-20"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 50px,
              currentColor 50px,
              currentColor 51px
            )`,
            backgroundSize: "200% 200%",
          }}
        />
      </div>

      {/* Rugged accent blobs */}
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          rotate: [0, 90, 0],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[150px] pointer-events-none"
      />

      {/* Full-width container */}
      <div className="w-full relative">
        {/* Background Image Layer - Centered dramatic display */}
        <div className="absolute inset-0 flex items-center justify-center">
          {content.image && (
            <motion.div
              initial={{ opacity: 0, scale: 1.2, y: 50 }}
              animate={isVisible ? { opacity: 1, scale: 1, y: 0 } : {}}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full h-full max-w-[1400px]"
              style={{
                transform: `translateY(${scrollY * 0.15}px)`,
              }}
            >
              <Image
                src={content.image}
                alt={content.heading || "Boots Collection"}
                fill
                className="object-contain opacity-40"
                sizes="(max-width: 1400px) 100vw, 1400px"
                priority
              />
              {/* Dramatic vignette */}
              <div className="absolute inset-0 bg-gradient-radial from-transparent via-background/30 to-background" />
            </motion.div>
          )}
        </div>

        {/* Text Content Layer - Centered & Bold */}
        <div className="container mx-auto px-4 relative z-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : {}}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-[1600px] mx-auto py-32 lg:py-40 flex flex-col items-center text-center"
          >
            {/* Heading & Subheading Stack */}
            <div className="space-y-4 mb-16">
              {/* Bold Stamp Effect */}
              <motion.div
                initial={{ scale: 0, rotate: -10 }}
                animate={isVisible ? { scale: 1, rotate: 0 } : {}}
                transition={{
                  duration: 0.6,
                  delay: 0.1,
                  ease: [0.34, 1.56, 0.64, 1],
                }}
                className="inline-block mb-6"
              >
                <div className="px-6 py-2 border-2 border-primary/50 rotate-[-2deg] bg-primary/5 backdrop-blur-sm">
                  <span className="text-sm font-bold tracking-[0.3em] text-primary uppercase">
                    Premium Footwear
                  </span>
                </div>
              </motion.div>

              {content.heading && (
                <motion.h1
                  initial={{ opacity: 0, y: 100 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : {}}
                  transition={{
                    duration: 0.8,
                    delay: 0.3,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="text-[clamp(6rem,15vw,12rem)] font-black leading-[0.8] tracking-[-0.02em] relative"
                  style={{
                    textShadow: "0 8px 32px rgba(0,0,0,0.4)",
                  }}
                >
                  {content.heading}
                </motion.h1>
              )}

              {content.subheading && (
                <motion.h2
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isVisible ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 1, delay: 0.6 }}
                  className="text-[clamp(4rem,10vw,8rem)] font-black leading-[0.8] tracking-[-0.02em] relative"
                >
                  <span
                    className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent"
                    style={{
                      WebkitTextStroke: "2px rgba(255,255,255,0.05)",
                      filter: "drop-shadow(0 4px 24px rgba(0,0,0,0.5))",
                    }}
                  >
                    {content.subheading}
                  </span>
                </motion.h2>
              )}

              {/* Dual accent lines */}
              <div className="flex items-center justify-center gap-8 pt-8">
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={isVisible ? { scaleX: 1 } : {}}
                  transition={{ duration: 1, delay: 0.9, ease: "easeOut" }}
                  className="h-1 w-32 bg-gradient-to-r from-transparent via-primary to-primary rounded-full origin-left"
                />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={isVisible ? { scale: 1 } : {}}
                  transition={{
                    duration: 0.6,
                    delay: 1,
                    ease: [0.34, 1.56, 0.64, 1],
                  }}
                  className="w-3 h-3 bg-primary rounded-full"
                />
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={isVisible ? { scaleX: 1 } : {}}
                  transition={{ duration: 1, delay: 0.9, ease: "easeOut" }}
                  className="h-1 w-32 bg-gradient-to-l from-transparent via-primary to-primary rounded-full origin-right"
                />
              </div>
            </div>

            {/* Description */}
            {content.description && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 1.2 }}
                className="max-w-3xl"
              >
                <p
                  className="text-xl lg:text-2xl text-foreground/80 leading-relaxed font-medium"
                  style={{
                    textShadow: "0 2px 12px rgba(0,0,0,0.3)",
                  }}
                >
                  {content.description}
                </p>
              </motion.div>
            )}

            {/* Decorative elements */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isVisible ? { opacity: 1 } : {}}
              transition={{ duration: 1, delay: 1.4 }}
              className="mt-16 flex items-center gap-3 text-sm text-primary font-semibold"
            >
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary/50" />
              <span className="tracking-widest uppercase">Built To Last</span>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary/50" />
            </motion.div>
          </motion.div>
        </div>

        {/* Floating geometric accents */}
        <motion.div
          animate={{
            y: [0, -30, 0],
            rotate: [0, 360],
          }}
          transition={{
            y: { duration: 8, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
          }}
          className="absolute bottom-24 left-12 w-24 h-24 border-2 border-primary/20 rounded-lg pointer-events-none hidden lg:block"
          style={{ transform: "rotate(45deg)" }}
        />

        <motion.div
          animate={{
            y: [0, 30, 0],
            rotate: [0, -360],
          }}
          transition={{
            y: { duration: 9, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 25, repeat: Infinity, ease: "linear" },
          }}
          className="absolute top-32 right-16 w-16 h-16 border-2 border-primary/20 rounded-full pointer-events-none hidden lg:block"
        />
      </div>

      {/* Seamless gradient transition to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none z-30" />
    </section>
  );
}
