"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  percent: number;
  color?: string;
  trackColor?: string;
  height?: number;
}

export default function ProgressBar({
  percent,
  color = "var(--accent)",
  trackColor = "#e6e6e4",
  height = 3,
}: ProgressBarProps) {
  return (
    <div
      className="relative rounded"
      style={{ height, background: trackColor }}
    >
      <motion.div
        className="absolute left-0 top-0 h-full rounded"
        style={{ background: color }}
        initial={{ width: 0 }}
        whileInView={{ width: `${percent}%` }}
        viewport={{ once: true, margin: "-30px" }}
        transition={{ duration: 1.2, ease: [0.33, 0, 0.18, 1] }}
      />
    </div>
  );
}
