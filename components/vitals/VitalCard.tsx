"use client";

import { motion } from "framer-motion";
import { clsx } from "clsx";

interface VitalCardProps {
  index: number;
  className?: string;
  children: React.ReactNode;
}

export default function VitalCard({ index, className, children }: VitalCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px", amount: 0.3 }}
      transition={{
        duration: 0.8,
        ease: [0.2, 0.7, 0.2, 1],
        delay: index * 0.09,
      }}
      className={clsx(
        "border border-border rounded-xl bg-card flex flex-col",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
