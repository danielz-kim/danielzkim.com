"use client";

import { motion } from "framer-motion";

export interface SparklineSeries {
  d: string;
  color: string;
  width?: number;
  dash?: string;
  endpoint?: { cx: number; cy: number; pulse?: boolean; color?: string };
}

interface SparklineProps {
  viewBox: string;
  series: SparklineSeries[];
  areaPath?: string;
  areaFill?: string;
  goalLine?: { x1: number; y1: number; x2: number; y2: number; label: string };
  className?: string;
}

export default function Sparkline({
  viewBox,
  series,
  areaPath,
  areaFill = "var(--tint)",
  goalLine,
  className,
}: SparklineProps) {
  return (
    <svg
      viewBox={viewBox}
      preserveAspectRatio="none"
      className={className}
      style={{ display: "block", width: "100%", height: "100%" }}
    >
      {goalLine && (
        <>
          <line
            x1={goalLine.x1}
            y1={goalLine.y1}
            x2={goalLine.x2}
            y2={goalLine.y2}
            stroke="#d8d8d6"
            strokeWidth={1.4}
            strokeDasharray="4 5"
          />
          <text
            x={goalLine.x2}
            y={goalLine.y1 - 8}
            textAnchor="end"
            className="fill-faint font-mono"
            style={{ fontSize: 9.5, letterSpacing: "0.08em" }}
          >
            {goalLine.label}
          </text>
        </>
      )}

      {areaPath && (
        <motion.path
          d={areaPath}
          fill={areaFill}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ duration: 1.4, ease: "easeOut", delay: 0.4 }}
        />
      )}

      {series.map((s, i) => (
        <motion.path
          key={i}
          d={s.d}
          fill="none"
          stroke={s.color}
          strokeWidth={s.width ?? 1.6}
          strokeDasharray={s.dash}
          vectorEffect="non-scaling-stroke"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ duration: 1, ease: "easeOut", delay: i * 0.12 }}
        />
      ))}

      {series.map(
        (s, i) =>
          s.endpoint && (
            <g key={`ep-${i}`}>
              <circle
                cx={s.endpoint.cx}
                cy={s.endpoint.cy}
                r={s.endpoint.pulse ? 5 : 3.5}
                fill={s.endpoint.color ?? s.color}
              />
              {s.endpoint.pulse && (
                <circle
                  cx={s.endpoint.cx}
                  cy={s.endpoint.cy}
                  r={9}
                  fill="none"
                  stroke={s.endpoint.color ?? s.color}
                  strokeWidth={1.5}
                  opacity={0.5}
                >
                  <animate
                    attributeName="r"
                    values="6;13;6"
                    dur="2.4s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.6;0;0.6"
                    dur="2.4s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
            </g>
          )
      )}
    </svg>
  );
}
