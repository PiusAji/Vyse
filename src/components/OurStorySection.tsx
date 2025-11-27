"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useScroll } from "framer-motion";
import { Prisma } from "@prisma/client";
import Image from "next/image";

interface TimelineEntry {
  year: string;
  description: string;
  image?: string;
}

interface OurStoryContent {
  heading?: string;
  subheading?: string;
  timeline?: TimelineEntry[];
}

interface OurStorySectionProps {
  content: Prisma.JsonValue;
}

export default function OurStorySection({
  content: rawContent,
}: OurStorySectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Extract content safely
  let content: OurStoryContent | null = null;
  if (
    rawContent &&
    typeof rawContent === "object" &&
    !Array.isArray(rawContent)
  ) {
    content = rawContent as OurStoryContent;
  }

  const timeline = content?.timeline || [];

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      if (timeline.length > 0) {
        const index = Math.min(
          Math.floor(latest * timeline.length),
          timeline.length - 1
        );
        setActiveIndex(index);
      }
    });

    return () => unsubscribe();
  }, [scrollYProgress, timeline.length]);

  if (!content || timeline.length === 0) {
    return null;
  }

  return (
    <section className="relative py-24 lg:py-32 bg-background overflow-hidden">
      {/* Section Header */}
      {(content.heading || content.subheading) && (
        <div className="container mx-auto px-4 mb-20 text-center">
          {content.heading && (
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-5xl lg:text-7xl font-black tracking-tight mb-4"
            >
              {content.heading}
            </motion.h2>
          )}
          {content.subheading && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-muted-foreground"
            >
              {content.subheading}
            </motion.p>
          )}
        </div>
      )}

      {/* Timeline Container */}
      <div ref={containerRef} className="container mx-auto px-4">
        <div className="relative">
          {/* Static Background Line - Faded */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 h-full w-[2px] bg-gradient-to-b from-border via-border to-border/20 hidden lg:block" />

          {/* Animated Progress Line - Thick and Bright */}
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 top-0 h-full w-[4px] bg-gradient-to-b from-primary via-primary to-primary/30 hidden lg:block"
            style={{
              scaleY: scrollYProgress,
              transformOrigin: "top",
            }}
          />

          {/* Timeline Entries */}
          <div className="space-y-24 lg:space-y-32">
            {timeline.map((entry, index) => {
              const isEven = index % 2 === 0;
              const isActive = activeIndex >= index;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8 }}
                  className="relative"
                >
                  <div
                    className={`grid lg:grid-cols-2 gap-8 lg:gap-16 items-center ${
                      isEven ? "" : "lg:flex-row-reverse"
                    }`}
                  >
                    {/* Content Side */}
                    <motion.div
                      initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className={`${
                        isEven
                          ? "lg:text-right lg:pr-16 flex flex-col items-end"
                          : "lg:pl-16 lg:col-start-2 lg:text-left flex flex-col items-start"
                      }`}
                    >
                      {/* Year Badge */}
                      <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.5,
                          delay: 0.3,
                          type: "spring",
                          stiffness: 200,
                        }}
                        className="mb-6"
                      >
                        <div className="relative inline-block">
                          <div
                            className={`px-8 py-3 rounded-full font-black text-3xl lg:text-4xl transition-all duration-500 ${
                              isActive
                                ? "bg-primary text-primary-foreground scale-110"
                                : "bg-primary/10 text-primary scale-100"
                            }`}
                            style={{
                              boxShadow: isActive
                                ? "0 10px 40px rgba(var(--primary), 0.3)"
                                : "none",
                            }}
                          >
                            {entry.year}
                          </div>
                        </div>
                      </motion.div>

                      {/* Description */}
                      <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="text-lg lg:text-xl text-foreground/80 leading-relaxed max-w-xl"
                      >
                        {entry.description}
                      </motion.p>
                    </motion.div>

                    {/* Image Side */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className={`relative ${
                        isEven
                          ? "lg:col-start-2"
                          : "lg:col-start-1 lg:row-start-1"
                      }`}
                    >
                      {entry.image && (
                        <div className="relative group">
                          {/* Image Container */}
                          <div className="relative h-[300px] lg:h-[400px] rounded-2xl overflow-hidden">
                            <Image
                              src={entry.image}
                              alt={`${entry.year} milestone`}
                              fill
                              className="object-cover transition-transform duration-700 group-hover:scale-110"
                              sizes="(max-width: 1024px) 100vw, 50vw"
                            />
                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          </div>

                          {/* Decorative border */}
                          <motion.div
                            initial={{ scale: 1, opacity: 0 }}
                            whileInView={{ scale: 1.05, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                            className="absolute inset-0 rounded-2xl border-2 border-primary/20 -z-10 group-hover:border-primary/40 transition-colors duration-500"
                          />
                        </div>
                      )}
                    </motion.div>
                  </div>

                  {/* Timeline Dot - Desktop Only */}
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.4,
                      delay: 0.4,
                      type: "spring",
                      stiffness: 200,
                    }}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:block z-10"
                  >
                    <div
                      className={`w-6 h-6 rounded-full transition-all duration-500 ${
                        isActive
                          ? "bg-primary scale-150 shadow-lg shadow-primary/50"
                          : "bg-primary/30 scale-100"
                      }`}
                    >
                      <div
                        className={`absolute inset-0 rounded-full transition-all duration-500 ${
                          isActive ? "animate-ping bg-primary/50" : ""
                        }`}
                      />
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
    </section>
  );
}
