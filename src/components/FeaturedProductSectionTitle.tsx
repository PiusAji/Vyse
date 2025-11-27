"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function FeaturedSectionTitle() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="mb-12 pl-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={isVisible ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm"
      >
        <Sparkles className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold text-primary">
          Featured Selection
        </span>
      </motion.div>

      <h2 className="text-6xl lg:text-8xl font-black leading-none tracking-tight">
        FEATURED
        <br />
        <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
          PRODUCTS
        </span>
      </h2>

      {/* Decorative underline */}
      <div className="mt-4 flex items-center gap-2">
        <div className="h-1 w-32 md:w-64 bg-gradient-to-r from-primary to-transparent rounded-full" />
      </div>
    </div>
  );
}
