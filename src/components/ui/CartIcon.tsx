// src/components/cart-icon.tsx
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useCartStore } from "@/store/cart-store";
import { CartDrawer } from "../CartDrawer";

export function CartIcon({ onClick }: { onClick: () => void }) {
  const [itemCount, setItemCount] = useState(0);
  const [justAdded, setJustAdded] = useState(false);
  const getTotalItems = useCartStore((state) => state.getTotalItems);

  useEffect(() => {
    setItemCount(getTotalItems());
  }, [getTotalItems]);

  // Subscribe to cart changes
  useEffect(() => {
    const unsubscribe = useCartStore.subscribe((state, prevState) => {
      const newCount = getTotalItems();
      const prevCount = itemCount;

      setItemCount(newCount);

      // Trigger animation when item is added
      if (newCount > prevCount) {
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 600);
      }
    });

    return unsubscribe;
  }, [getTotalItems, itemCount]);

  return (
    <motion.button
      onClick={onClick}
      className="relative p-3 rounded-xl transition-all duration-300 group"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Gradient background on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Animated ring on hover */}
      <motion.div
        className="absolute inset-0 rounded-xl border-2 border-primary/0 group-hover:border-primary/30"
        initial={false}
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />

      {/* Cart Icon with shake animation when item added */}
      <motion.div
        animate={
          justAdded
            ? {
                rotate: [0, -10, 10, -10, 10, 0],
                scale: [1, 1.2, 1],
              }
            : {}
        }
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        <svg
          className="w-6 h-6 text-foreground group-hover:text-primary transition-colors duration-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H19M7 13v4a2 2 0 002 2h8a2 2 0 002-2v-4m-8 6h8"
          />
        </svg>
      </motion.div>

      {/* Item count badge with pop animation */}
      <AnimatePresence>
        {itemCount > 0 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute -top-1 -right-1 z-20"
          >
            <motion.div
              key={itemCount}
              initial={{ scale: 1.5 }}
              animate={{ scale: 1 }}
              className="relative"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-primary rounded-full blur-md opacity-60" />

              {/* Badge */}
              <div className="relative bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-xs font-bold rounded-full h-5 min-w-[20px] px-1.5 flex items-center justify-center shadow-lg border-2 border-background">
                {itemCount > 99 ? "99+" : itemCount}
              </div>
            </motion.div>

            {/* Pulse ring when item is added */}
            {justAdded && (
              <motion.div
                initial={{ scale: 1, opacity: 1 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 rounded-full border-2 border-primary"
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sparkle effect on hover */}
      <motion.div
        className="absolute top-0 right-0 pointer-events-none"
        initial={{ opacity: 0, scale: 0 }}
        whileHover={{ opacity: 1, scale: 1 }}
      >
        <svg
          className="w-4 h-4 text-primary"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
        </svg>
      </motion.div>
    </motion.button>
  );
}
