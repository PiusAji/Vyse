"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { FlipWords } from "./ui/flip-words";

interface HeroContent {
  heading?: string;
  subheading?: string;
  flipwordVariants?: string[];
  image?: string;
  ctaText?: string;
  ctaLink?: string;
}

export default function HeroText({ content }: { content: HeroContent }) {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  const parallaxY = useTransform(scrollY, [0, 500], [0, 150]);
  const imageScale = useTransform(scrollY, [0, 500], [1, 1.2]);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  if (!content) return null;

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-screen flex items-center justify-center overflow-hidden -mt-20"
    >
      {/* Background Image with Parallax */}
      {content.image && (
        <motion.div
          className="absolute inset-0 z-0"
          style={{ scale: imageScale }}
        >
          <Image
            src={content.image}
            alt="Hero"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent via-60% to-black/90" />
        </motion.div>
      )}

      {/* Animated Grid Pattern */}
      <motion.div
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%"],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute inset-0 opacity-[0.04] z-[1]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 60px,
            currentColor 60px,
            currentColor 61px
          )`,
          backgroundSize: "200% 200%",
        }}
      />

      {/* Massive Gradient Blob - Top Right */}
      <motion.div
        animate={{
          scale: [1, 1.4, 1],
          rotate: [0, 90, 0],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-40 -right-40 w-[800px] h-[800px] bg-primary/30 rounded-full blur-[200px] pointer-events-none z-[2]"
      />

      {/* Secondary Blob - Bottom Left */}
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          rotate: [0, -90, 0],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute -bottom-40 -left-40 w-[700px] h-[700px] bg-primary/20 rounded-full blur-[180px] pointer-events-none z-[2]"
      />

      {/* Floating Geometric Shapes with Mouse Parallax */}
      <motion.div
        animate={{
          y: [0, -40, 0],
          rotate: [0, 360],
        }}
        transition={{
          y: { duration: 10, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 25, repeat: Infinity, ease: "linear" },
        }}
        style={{
          x: mousePosition.x * 0.5,
          y: mousePosition.y * 0.5,
        }}
        className="absolute top-32 right-[15%] w-32 h-32 border-2 border-primary/30 rounded-lg pointer-events-none z-[3] hidden lg:block rotate-45"
      />

      <motion.div
        animate={{
          y: [0, 40, 0],
          rotate: [0, -360],
        }}
        transition={{
          y: { duration: 12, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 30, repeat: Infinity, ease: "linear" },
        }}
        style={{
          x: mousePosition.x * -0.3,
          y: mousePosition.y * -0.3,
        }}
        className="absolute bottom-40 left-[10%] w-24 h-24 border-2 border-primary/25 rounded-full pointer-events-none z-[3] hidden lg:block"
      />

      <motion.div
        animate={{
          y: [0, -30, 0],
          rotate: [0, 180, 0],
        }}
        transition={{
          y: { duration: 9, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 20, repeat: Infinity, ease: "linear" },
        }}
        style={{
          x: mousePosition.x * 0.4,
          y: mousePosition.y * 0.4,
        }}
        className="absolute top-[60%] right-[8%] w-16 h-16 border-2 border-primary/20 rounded-lg pointer-events-none z-[3] hidden lg:block rotate-12"
      />

      {/* Main Content */}
      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-6 pt-32"
        style={{ y: parallaxY }}
      >
        <div className="flex flex-col items-center text-center relative">
          {/* Premium Stamp Badge - Overlapping heading */}
          <motion.div
            initial={{ scale: 0, rotate: -15 }}
            animate={isVisible ? { scale: 1, rotate: -3 } : {}}
            transition={{
              duration: 0.7,
              delay: 0.1,
              ease: [0.34, 1.56, 0.64, 1],
            }}
            className="mb-[-1rem] relative z-20"
          >
            <div className="px-8 py-3 border-2 border-primary/50 rotate-[-3deg] bg-primary/5 backdrop-blur-xs shadow-2xl">
              <span className="text-xs font-black tracking-[0.4em] text-primary uppercase drop-shadow-lg">
                Premium Experience
              </span>
            </div>
          </motion.div>

          {/* Massive Heading */}
          {content.heading && (
            <motion.h1
              initial={{ opacity: 0, y: 100, scale: 0.8 }}
              animate={isVisible ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{
                duration: 0.9,
                delay: 0.3,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="text-[clamp(3rem,12vw,9rem)] font-black leading-[0.85] tracking-[-0.03em] text-white mb-6 relative z-10"
              style={{
                textShadow:
                  "0 10px 40px rgba(0,0,0,0.8), 0 0 80px rgba(var(--primary-rgb, 139 92 246), 0.3)",
              }}
            >
              {content.heading}
            </motion.h1>
          )}

          {/* Subheading */}
          {content.subheading && (
            <motion.p
              initial={{ opacity: 0, y: 50 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-[clamp(1.5rem,4vw,3rem)] font-semibold text-neutral-200/90 leading-tight mb-4"
              style={{
                textShadow: "0 4px 20px rgba(0,0,0,0.6)",
              }}
            >
              {content.subheading}
            </motion.p>
          )}

          {/* FlipWords with Dramatic Accent Lines */}
          {content.flipwordVariants && content.flipwordVariants.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isVisible ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="mb-8 w-full"
            >
              <div className="flex items-center justify-center gap-4 lg:gap-6">
                {/* Left Accent Line */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={isVisible ? { scaleX: 1 } : {}}
                  transition={{ duration: 1.2, delay: 0.9, ease: "easeOut" }}
                  className="h-1 w-16 lg:w-32 bg-gradient-to-r from-transparent via-primary to-primary rounded-full origin-left flex-shrink-0"
                />

                {/* FlipWords - matching BootsHero gradient style */}
                <div
                  className="text-[clamp(2.5rem,8vw,6rem)] font-black leading-none relative"
                  style={{
                    background:
                      "linear-gradient(to right, var(--primary), var(--primary-80), var(--primary-60))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  <FlipWords
                    words={content.flipwordVariants}
                    duration={3000}
                    style={{
                      background:
                        "linear-gradient(to right, #F5E6D3, #F0DCC4, #EBD2B5)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      display: "inline-block",
                    }}
                  />
                </div>

                {/* Right Accent Line */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={isVisible ? { scaleX: 1 } : {}}
                  transition={{ duration: 1.2, delay: 0.9, ease: "easeOut" }}
                  className="h-1 w-16 lg:w-32 bg-gradient-to-l from-transparent via-primary to-primary rounded-full origin-right flex-shrink-0"
                />
              </div>
            </motion.div>
          )}

          {/* CTA Button with Hover Magic */}
          {content.ctaLink && content.ctaText && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="mt-2"
            >
              <Link
                href={content.ctaLink}
                className="group relative inline-block"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative px-12 py-5 bg-primary text-primary-foreground rounded-xl font-bold text-lg overflow-hidden shadow-2xl"
                >
                  {/* Shimmer Effect */}
                  <motion.div
                    animate={{
                      x: ["-200%", "200%"],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  />
                  <span className="relative z-10">{content.ctaText}</span>
                </motion.div>
              </Link>
            </motion.div>
          )}

          {/* Bottom Tagline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : {}}
            transition={{ duration: 1, delay: 1.4 }}
            className="mt-16 flex items-center gap-4 text-sm text-primary/80 font-bold"
          >
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary/50" />
            <span className="tracking-[0.3em] uppercase drop-shadow-lg">
              Designed to Impress
            </span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary/50" />
          </motion.div>
        </div>
      </motion.div>

      {/* Seamless Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background via-background/90 to-transparent z-[8] pointer-events-none" />
    </section>
  );
}
