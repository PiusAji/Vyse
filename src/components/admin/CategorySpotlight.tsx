"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Prisma } from "@prisma/client";
import { motion } from "motion/react";
import { Sparkles } from "lucide-react";

interface CategoryCard {
  id: string;
  name: string;
  image: string;
  link: string;
}

interface CategorySpotlightContent {
  heading?: string;
  subheading?: string;
  description?: string;
  flipWords?: string[];
  categories?: CategoryCard[];
}

interface CategorySpotlightProps {
  content: Prisma.JsonObject;
}

export function CategorySpotlight({ content }: CategorySpotlightProps) {
  const data = content as CategorySpotlightContent;
  const [isVisible, setIsVisible] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  const [hasMounted, setHasMounted] = useState(false); // Add this

  useEffect(() => {
    setHasMounted(true); // Mark as mounted immediately

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => setIsVisible(true), 100);
          }
        });
      },
      { threshold: 0.2 }
    );

    const element = document.getElementById("category-spotlight-container");
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  // Only apply transition classes after mount
  const transitionClass = !hasMounted
    ? "" // No classes on server/initial render
    : isVisible
    ? "opacity-100 translate-y-0"
    : "opacity-0 translate-y-10";

  // Rotate through flip words
  useEffect(() => {
    if (!data.flipWords || data.flipWords.length === 0) return;

    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % data.flipWords!.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [data.flipWords]);

  if (!data.categories || data.categories.length === 0) {
    return null;
  }

  const hasEmptySpace = (data.categories?.length ?? 0) % 3 !== 0;
  const emptySlots = hasEmptySpace
    ? 3 - ((data.categories?.length ?? 0) % 3)
    : 0;

  return (
    <section
      id="category-spotlight-container"
      className="container mx-auto px-4 py-32 relative overflow-hidden"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-32 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Title on top right */}
      <div className="mb-12 flex justify-end pr-4">
        <div
          className={`transition-all duration-1000 flex flex-col items-end ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isVisible ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">
              Browse Collections
            </span>
          </motion.div>

          <h2 className="text-6xl lg:text-8xl font-black leading-none tracking-tight text-right">
            {data.heading || "SHOP BY"}
            <br />
            <span className="bg-gradient-to-l from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              {data.subheading || "CATEGORY"}
            </span>
          </h2>

          {/* Decorative underline */}
          <div className="mt-4 flex items-center justify-end gap-2">
            <div className="h-1 w-32 md:w-64 bg-gradient-to-l from-primary to-transparent rounded-full" />
          </div>
        </div>
      </div>

      {/* Category Grid */}
      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 transition-all duration-1000 delay-300 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        {data.categories.map((category, index) => {
          // On lg screens, if this is the last card and there's empty space, place it in the third column
          const isLastCard = index === (data.categories?.length ?? 0) - 1;
          const shouldRepositionLastCard = hasEmptySpace && isLastCard;

          return (
            <Link
              key={category.id}
              href={category.link}
              className={`group relative overflow-hidden rounded-2xl aspect-[3/4] bg-muted ${
                shouldRepositionLastCard ? "lg:col-start-3" : ""
              }`}
              style={{
                transitionDelay: `${index * 100}ms`,
              }}
            >
              {/* Category Image */}
              <div className="absolute inset-0">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              {/* Category Name */}
              <div className="absolute inset-0 flex items-end p-6">
                <h3 className="text-3xl lg:text-4xl font-black text-white leading-none tracking-tight transform transition-all duration-500 group-hover:translate-y-[-8px]">
                  {category.name}
                </h3>
              </div>

              {/* Hover indicator */}
              <div className="absolute bottom-6 right-6 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>

              {/* Shine effect on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </div>
            </Link>
          );
        })}

        {/* Animated rotating words in empty space (if applicable) */}
        {hasEmptySpace && data.flipWords && data.flipWords.length > 0 && (
          <div className="hidden lg:flex items-center justify-center p-8 lg:col-span-2 lg:row-start-2">
            <div className="relative inline-block">
              {data.flipWords.map((word, index) => (
                <span
                  key={index}
                  className={`text-7xl lg:text-8xl font-black leading-none tracking-tight bg-gradient-to-l from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent transition-all duration-700 ${
                    index === currentWordIndex
                      ? "opacity-100 block"
                      : "opacity-0 absolute top-0 left-0"
                  }`}
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
