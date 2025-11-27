"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Prisma } from "@prisma/client";
import { Sparkles, ArrowRight, CheckCircle2, Mail } from "lucide-react";

interface NewsletterContent extends Prisma.JsonObject {
  eyebrow?: string;
  heading?: string;
  subheading?: string;
  description?: string;
  placeholder?: string;
  buttonText?: string;
  successMessage?: string;
  benefits?: string[];
}

interface NewsletterSectionProps {
  content: Prisma.JsonValue;
}

function isNewsletterContent(
  value: Prisma.JsonValue
): value is NewsletterContent {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return true;
}

export default function NewsletterSection({
  content: rawContent,
}: NewsletterSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const isValidContent = isNewsletterContent(rawContent);
  const content = isValidContent ? (rawContent as NewsletterContent) : null;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
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

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email");
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setEmail("");

      // Reset success state after 5 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 5000);
    }, 1500);
  };

  if (!isValidContent || !content) {
    console.error("Invalid content structure for NewsletterSection");
    return null;
  }

  // If no content filled, don't render
  if (!content.heading && !content.buttonText) {
    return null;
  }

  return (
    <section ref={containerRef} className="relative py-32 overflow-visible">
      {/* Animated gradient blobs */}

      <motion.div
        animate={{
          x: mousePosition.x * 0.02,
          y: mousePosition.y * 0.02,
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          x: { duration: 0.5 },
          y: { duration: 0.5 },
          scale: { duration: 8, repeat: Infinity, ease: "easeInOut" },
          opacity: { duration: 8, repeat: Infinity, ease: "easeInOut" },
        }}
        className="absolute -top-64 left-1/4 w-[600px] h-[600px] bg-primary/25 rounded-full blur-[120px] pointer-events-none"
      />
      <motion.div
        animate={{
          x: mousePosition.x * 0.025,
          y: mousePosition.y * 0.025,
          scale: [1.2, 1, 1.2],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          x: { duration: 0.5 },
          y: { duration: 0.5 },
          scale: { duration: 7, repeat: Infinity, ease: "easeInOut" },
          opacity: { duration: 7, repeat: Infinity, ease: "easeInOut" },
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/25 rounded-full blur-[150px] pointer-events-none"
      />
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              {content.eyebrow && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isVisible ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm"
                >
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                    {content.eyebrow}
                  </span>
                </motion.div>
              )}

              {content.heading && (
                <div className="space-y-4 mb-8">
                  {/* First line - White */}
                  <h2 className="text-[clamp(3rem,8vw,7rem)] font-black leading-[0.9] tracking-tighter">
                    {content.heading.split(" ").map((word, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, y: 100 }}
                        animate={isVisible ? { opacity: 1, y: 0 } : {}}
                        transition={{
                          duration: 0.8,
                          delay: i * 0.1,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="inline-block mr-4"
                      >
                        {word}
                      </motion.span>
                    ))}
                  </h2>

                  {/* Second line - Gradient */}
                  {content.subheading && (
                    <motion.h2
                      initial={{ opacity: 0, x: -50 }}
                      animate={isVisible ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="text-[clamp(3rem,8vw,7rem)] font-black leading-[0.9] tracking-tighter bg-gradient-to-r from-primary via-primary/70 to-primary/40 bg-clip-text text-transparent"
                    >
                      {content.subheading}
                    </motion.h2>
                  )}
                </div>
              )}

              {content.description && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
                >
                  {content.description}
                </motion.p>
              )}
            </motion.div>
          </div>

          {/* Form and Benefits Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start max-w-5xl mx-auto">
            {/* Left - Form */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={isVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 1, delay: 1 }}
              className="relative"
            >
              <AnimatePresence mode="wait">
                {!isSuccess ? (
                  <motion.form
                    key="form"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onSubmit={handleSubmit}
                    className="space-y-4"
                  >
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={content.placeholder || "Enter your email"}
                        className="w-full pl-12 pr-4 py-4 text-lg border-2 border-border rounded-2xl bg-background/50 backdrop-blur-sm focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                      />
                    </div>

                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-destructive"
                      >
                        {error}
                      </motion.p>
                    )}

                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold text-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                    >
                      {isSubmitting ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                        />
                      ) : (
                        <>
                          <span>
                            {content.buttonText || "Join the Movement"}
                          </span>
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </motion.button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8 px-6 rounded-2xl bg-primary/10 border-2 border-primary/20"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 10,
                      }}
                    >
                      <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-2">
                      {content.successMessage || "Welcome to the crew!"}
                    </h3>
                    <p className="text-muted-foreground">
                      Check your inbox for exclusive perks
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Right - Benefits */}
            {content.benefits && content.benefits.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={isVisible ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 1, delay: 1.2 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-bold mb-6">
                  What you&apos;ll get:
                </h3>
                {content.benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={isVisible ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.6, delay: 1.4 + index * 0.1 }}
                    className="flex items-start gap-3 p-4 rounded-xl bg-card/50 border border-border/50 hover:border-primary/30 transition-colors"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={isVisible ? { scale: 1 } : {}}
                      transition={{
                        duration: 0.3,
                        delay: 1.6 + index * 0.1,
                        type: "spring",
                      }}
                      className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    </motion.div>
                    <span className="text-foreground leading-relaxed">
                      {benefit}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
