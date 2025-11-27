"use client";

import React from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  MotionValue,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Prisma } from "@prisma/client";

interface SneakersHeroContent extends Prisma.JsonObject {
  heading?: string;
  subheading?: string;
  description?: string;
}

interface ProductVariant {
  id: string;
  color: string;
  images: string;
}

interface Product {
  id: string;
  name: string;
  slug?: string;
  variants: ProductVariant[];
}

interface SneakersHeroProps {
  content: Prisma.JsonValue;
  products: Product[];
}

function isSneakersHeroContent(
  value: Prisma.JsonValue
): value is SneakersHeroContent {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return true;
}

export default function SneakersHero({
  content: rawContent,
  products,
}: SneakersHeroProps) {
  const isValidContent = isSneakersHeroContent(rawContent);
  const content = isValidContent ? (rawContent as SneakersHeroContent) : null;

  // Transform products into the format needed for HeroParallax
  const parallaxProducts = products.slice(0, 15).map((product) => {
    const firstVariant = product.variants[0];
    const images = firstVariant ? JSON.parse(firstVariant.images) : [];
    const thumbnail = images[0] || "/placeholder.jpg";

    return {
      title: product.name,
      link: `/product/${product.slug || product.id}`,
      thumbnail,
    };
  });

  if (!isValidContent || !content) {
    console.error("Invalid content structure for SneakersHero");
    return null;
  }

  return (
    <HeroParallax
      products={parallaxProducts}
      heading={content.heading}
      subheading={content.subheading}
      description={content.description}
    />
  );
}

const HeroParallax = ({
  products,
  heading,
  subheading,
  description,
}: {
  products: {
    title: string;
    link: string;
    thumbnail: string;
  }[];
  heading?: string;
  subheading?: string;
  description?: string;
}) => {
  const firstRow = products.slice(0, 5);
  const secondRow = products.slice(5, 10);
  const thirdRow = products.slice(10, 15);
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const springConfig = { stiffness: 300, damping: 30, bounce: 100 };

  const translateX = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, 1000]),
    springConfig
  );
  const translateXReverse = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, -1000]),
    springConfig
  );
  const rotateX = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [15, 0]),
    springConfig
  );
  const opacity = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [0.2, 1]),
    springConfig
  );
  const rotateZ = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [15, 0]),
    springConfig
  );
  const translateY = useSpring(
    useTransform(scrollYProgress, [0, 0.4], [-500, 200]),
    springConfig
  );

  return (
    <div
      ref={ref}
      className="h-[300vh] py-10 overflow-hidden antialiased relative flex flex-col self-auto [perspective:1000px] [transform-style:preserve-3d]"
    >
      <Header
        heading={heading}
        subheading={subheading}
        description={description}
      />
      <motion.div
        style={{
          rotateX,
          rotateZ,
          translateY,
          opacity,
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 0.2, scale: 1 }}
        transition={{ duration: 1, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div className="flex flex-row-reverse space-x-reverse space-x-20 mb-20">
          {firstRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateX}
              key={product.title}
            />
          ))}
        </motion.div>
        <motion.div className="flex flex-row mb-20 space-x-20">
          {secondRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateXReverse}
              key={product.title}
            />
          ))}
        </motion.div>
        <motion.div className="flex flex-row-reverse space-x-reverse space-x-20">
          {thirdRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateX}
              key={product.title}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

const Header = ({
  heading,
  subheading,
  description,
}: {
  heading?: string;
  subheading?: string;
  description?: string;
}) => {
  return (
    <div className="max-w-7xl relative mx-auto py-20 md:py-40 px-4 w-full left-0 top-0">
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        {heading && (
          <motion.h1
            className="text-6xl md:text-8xl font-black tracking-tighter"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {heading}
          </motion.h1>
        )}
        {subheading && (
          <motion.h1
            className="text-6xl md:text-8xl font-black tracking-tighter bg-gradient-to-r from-primary via-primary/80 to-primary/50 bg-clip-text text-transparent"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {subheading}
          </motion.h1>
        )}
      </motion.div>
      {description && (
        <motion.p
          className="max-w-2xl text-base md:text-xl mt-8 text-foreground/80"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {description}
        </motion.p>
      )}
    </div>
  );
};

const ProductCard = ({
  product,
  translate,
}: {
  product: {
    title: string;
    link: string;
    thumbnail: string;
  };
  translate: MotionValue<number>;
}) => {
  return (
    <motion.div
      style={{
        x: translate,
      }}
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{
        y: -20,
      }}
      key={product.title}
      className="group/product h-96 w-[30rem] relative shrink-0"
    >
      <Link
        href={product.link}
        className="block group-hover/product:shadow-2xl"
      >
        <Image
          src={product.thumbnail}
          height={600}
          width={600}
          className="object-cover object-center absolute h-full w-full inset-0 rounded-lg"
          alt={product.title}
        />
      </Link>
      <div className="absolute inset-0 h-full w-full opacity-0 group-hover/product:opacity-80 bg-black pointer-events-none rounded-lg transition-opacity duration-300"></div>
      <h2 className="absolute bottom-4 left-4 opacity-0 group-hover/product:opacity-100 text-white font-bold text-lg transition-opacity duration-300">
        {product.title}
      </h2>
    </motion.div>
  );
};
