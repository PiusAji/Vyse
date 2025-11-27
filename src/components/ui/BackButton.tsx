"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export default function BackButton() {
  const router = useRouter();

  return (
    <motion.button
      onClick={() => router.back()}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ x: -4 }}
      whileTap={{ scale: 0.95 }}
      className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted/50 hover:bg-muted border border-primary/10 hover:border-primary/30 backdrop-blur-sm transition-all duration-300"
    >
      <motion.div
        animate={{ x: [0, -3, 0] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </motion.div>
      <span className="text-sm font-semibold text-muted-foreground group-hover:text-primary transition-colors">
        Back to Products
      </span>
    </motion.button>
  );
}
