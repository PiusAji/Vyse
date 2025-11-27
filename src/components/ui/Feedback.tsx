"use client";

import { cn } from "@/lib/utils";
import { useEffect } from "react";

type FeedbackProps = {
  message: string;
  variant?: "success" | "error";
  className?: string;
  onDismiss?: () => void;
};

export function Feedback({
  message,
  variant = "success",
  className,
  onDismiss,
}: FeedbackProps) {
  useEffect(() => {
    if (message && onDismiss) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <div
      className={cn(
        "mb-4 p-3 rounded-lg",
        variant === "success"
          ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
          : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400",
        className
      )}
    >
      {message}
    </div>
  );
}
