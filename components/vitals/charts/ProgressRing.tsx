"use client";

import { motion } from "framer-motion";

interface ProgressRingProps {
  percent: number;
  color?: string;
  trackColor?: string;
  size?: number;
  strokeWidth?: number;
}

export default function ProgressRing({
  percent,
  color = "var(--accent)",
  trackColor = "#e6e6e4",
  size = 84,
  strokeWidth = 7,
}: ProgressRingProps) {
  const center = size / 2;
  const radius = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, percent));
  const offset = circumference * (1 - clamped / 100);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <g transform={`rotate(-90 ${center} ${center})`}>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          whileInView={{ strokeDashoffset: offset }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ duration: 1.2, ease: [0.33, 0, 0.18, 1] }}
        />
      </g>
    </svg>
  );
}
