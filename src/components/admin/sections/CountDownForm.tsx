"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Prisma } from "@prisma/client";
import { SpinningText } from "@/components/ui/spinning-text";
import {
  ScrollVelocityContainer,
  ScrollVelocityRow,
} from "@/components/ui/scroll-based-velocity";

interface CountdownContent extends Prisma.JsonObject {
  saleEndDate?: string;
  bannerText?: string;
  discountText?: string;
  isActive?: boolean;
}

interface CountdownBannerProps {
  content: Prisma.JsonValue;
  onSave: (content: Prisma.JsonValue) => Promise<void>;
}

function isCountdownContent(
  value: Prisma.JsonValue
): value is CountdownContent {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return true;
}

export default function CountdownBanner({
  content: rawContent,
}: CountdownBannerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isExpired, setIsExpired] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const isValidContent = isCountdownContent(rawContent);
  const content = isValidContent ? (rawContent as CountdownContent) : null;

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (!content?.saleEndDate) return;

    const calculateTimeLeft = () => {
      const difference = +new Date(content.saleEndDate!) - +new Date();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
        setIsExpired(false);
      } else {
        setIsExpired(true);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [content?.saleEndDate]);

  if (!isValidContent || !content || !content.isActive || isExpired) {
    return null;
  }

  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      {/* Gradient blend with hero section above - matches hero's bottom gradient */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-background to-transparent pointer-events-none z-30" />

      {/* Primary color light rays from center */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-primary/5 to-transparent" />
      </div>

      {/* Subtle gradient blobs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none"
      />

      {/* Spinning text decoration */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <SpinningText
          radius={12}
          duration={25}
          className="text-primary/40 font-black tracking-widest text-xs uppercase"
        >
          {`⚡ ${content?.bannerText || "SALE"} ⚡ HURRY ⚡ LIMITED TIME ⚡ `}
        </SpinningText>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Banner Text */}
          {content.bannerText && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="mb-8"
            >
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground/80 uppercase">
                {content.bannerText}
              </h3>
            </motion.div>
          )}

          {/* Countdown Display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isVisible ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-center gap-4 md:gap-8 mb-8"
          >
            {/* Days */}
            <div className="flex flex-col items-center">
              <motion.div
                key={timeLeft.days}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter tabular-nums"
              >
                {String(timeLeft.days).padStart(2, "0")}
              </motion.div>
              <div className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-widest mt-2">
                Days
              </div>
            </div>

            <div className="text-4xl md:text-6xl font-black text-muted-foreground/50 mb-8">
              :
            </div>

            {/* Hours */}
            <div className="flex flex-col items-center">
              <motion.div
                key={timeLeft.hours}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter tabular-nums"
              >
                {String(timeLeft.hours).padStart(2, "0")}
              </motion.div>
              <div className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-widest mt-2">
                Hours
              </div>
            </div>

            <div className="text-4xl md:text-6xl font-black text-muted-foreground/50 mb-8">
              :
            </div>

            {/* Minutes */}
            <div className="flex flex-col items-center">
              <motion.div
                key={timeLeft.minutes}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter tabular-nums"
              >
                {String(timeLeft.minutes).padStart(2, "0")}
              </motion.div>
              <div className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-widest mt-2">
                Mins
              </div>
            </div>

            <div className="text-4xl md:text-6xl font-black text-muted-foreground/50 mb-8">
              :
            </div>

            {/* Seconds */}
            <div className="flex flex-col items-center">
              <motion.div
                key={timeLeft.seconds}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter tabular-nums"
              >
                {String(timeLeft.seconds).padStart(2, "0")}
              </motion.div>
              <div className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-widest mt-2">
                Secs
              </div>
            </div>
          </motion.div>

          {/* Animated gradient line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={isVisible ? { scaleX: 1 } : {}}
            transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
            className="h-1 w-full max-w-2xl mx-auto bg-gradient-to-r from-transparent via-primary to-transparent rounded-full mb-8"
          />

          {/* Discount Text */}
          {content.discountText && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <p className="text-xl md:text-2xl font-bold tracking-wide bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                {content.discountText}
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Velocity scroll at bottom */}
      {content.discountText && (
        <div className="absolute bottom-8 left-0 right-0">
          <ScrollVelocityContainer>
            <ScrollVelocityRow
              baseVelocity={3}
              direction={1}
              className="text-primary/30 font-black text-sm tracking-wider"
            >
              🔥 {content.discountText} 🔥{" "}
              {content.bannerText || "LIMITED TIME"} 🔥
            </ScrollVelocityRow>
          </ScrollVelocityContainer>
        </div>
      )}

      {/* Seamless gradient transition */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/50 to-transparent pointer-events-none" />
    </section>
  );
}
