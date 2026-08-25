"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

export interface SparklinePoint {
  x: number;
  y: number;
  ts: number;
  value: number;
}

export interface SparklineSeries {
  d: string;
  color: string;
  width?: number;
  dash?: string;
  endpoint?: { cx: number; cy: number; pulse?: boolean; color?: string };
  /** Name shown in the hover tooltip, e.g. "Blitz". Omit to exclude from hover. */
  label?: string;
  /** Points backing `d`, used to interpolate values under the cursor on hover. */
  points?: SparklinePoint[];
}

interface SparklineProps {
  viewBox: string;
  series: SparklineSeries[];
  areaPath?: string;
  areaFill?: string;
  goalLine?: { x1: number; y1: number; x2: number; y2: number; label: string };
  className?: string;
}

function interpolateAt(points: SparklinePoint[], x: number): SparklinePoint {
  const first = points[0];
  const last = points[points.length - 1];
  if (x <= first.x) return first;
  if (x >= last.x) return last;
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    if (x >= a.x && x <= b.x) {
      const t = b.x === a.x ? 0 : (x - a.x) / (b.x - a.x);
      return {
        x,
        y: a.y + (b.y - a.y) * t,
        ts: a.ts + (b.ts - a.ts) * t,
        value: a.value + (b.value - a.value) * t,
      };
    }
  }
  return last;
}

function formatDate(ts: number) {
  const d = new Date(ts);
  return `${d.toLocaleString("en-US", { month: "short" }).toUpperCase()} ${d.getDate()}`;
}

export default function Sparkline({
  viewBox,
  series,
  areaPath,
  areaFill = "var(--tint)",
  goalLine,
  className,
}: SparklineProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverX, setHoverX] = useState<number | null>(null);

  const [vbMinX, vbMinY, vbW, vbH] = useMemo(
    () => viewBox.split(" ").map(Number),
    [viewBox]
  );

  // preserveAspectRatio="none" stretches x and y independently to fill the
  // container, so a plain <circle> renders as an oval unless we counteract
  // the mismatch between the viewBox ratio and the actual rendered ratio.
  const [radiusYRatio, setRadiusYRatio] = useState(1);
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !vbW || !vbH) return;
    const update = () => {
      const rect = svg.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const scaleX = rect.width / vbW;
      const scaleY = rect.height / vbH;
      setRadiusYRatio(scaleX / scaleY);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(svg);
    return () => observer.disconnect();
  }, [vbW, vbH]);

  const hoverable = useMemo(
    () => series.filter((s) => s.label && s.points && s.points.length > 0),
    [series]
  );
  const canHover = hoverable.length > 0;

  const handleMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const loc = pt.matrixTransform(ctm.inverse());
    setHoverX(Math.min(Math.max(loc.x, vbMinX), vbMinX + vbW));
  };

  const hoverItems = useMemo(() => {
    if (hoverX == null) return [];
    return hoverable.map((s) => ({
      label: s.label!,
      color: s.color,
      ...interpolateAt(s.points!, hoverX),
    }));
  }, [hoverX, hoverable]);

  const tooltipW = 108;
  const tooltipH = 14 + hoverItems.length * 13 + 8;
  const flip = hoverX != null && hoverX > vbMinX + vbW - tooltipW - 14;
  const tooltipX = hoverX != null ? (flip ? hoverX - tooltipW - 10 : hoverX + 10) : 0;
  const tooltipY = vbMinY + 8;

  return (
    <svg
      ref={svgRef}
      viewBox={viewBox}
      preserveAspectRatio="none"
      className={className}
      style={{ display: "block", width: "100%", height: "100%" }}
      onPointerMove={canHover ? handleMove : undefined}
      onPointerLeave={canHover ? () => setHoverX(null) : undefined}
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
              <ellipse
                cx={s.endpoint.cx}
                cy={s.endpoint.cy}
                rx={s.endpoint.pulse ? 5 : 3.5}
                ry={(s.endpoint.pulse ? 5 : 3.5) * radiusYRatio}
                fill={s.endpoint.color ?? s.color}
              />
              {s.endpoint.pulse && (
                <ellipse
                  cx={s.endpoint.cx}
                  cy={s.endpoint.cy}
                  rx={9}
                  ry={9 * radiusYRatio}
                  fill="none"
                  stroke={s.endpoint.color ?? s.color}
                  strokeWidth={1.5}
                  opacity={0.5}
                >
                  <animate
                    attributeName="rx"
                    values="6;13;6"
                    dur="2.4s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="ry"
                    values={`${6 * radiusYRatio};${13 * radiusYRatio};${6 * radiusYRatio}`}
                    dur="2.4s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.6;0;0.6"
                    dur="2.4s"
                    repeatCount="indefinite"
                  />
                </ellipse>
              )}
            </g>
          )
      )}

      {canHover && hoverX != null && hoverItems.length > 0 && (
        <g pointerEvents="none">
          <line
            x1={hoverX}
            y1={vbMinY}
            x2={hoverX}
            y2={vbMinY + vbH}
            stroke="#b8b8b6"
            strokeWidth={1}
            strokeDasharray="2 3"
            vectorEffect="non-scaling-stroke"
          />
          {hoverItems.map((item) => (
            <ellipse
              key={item.label}
              cx={item.x}
              cy={item.y}
              rx={3}
              ry={3 * radiusYRatio}
              fill="#ffffff"
              stroke={item.color}
              strokeWidth={1.6}
            />
          ))}

          <rect
            x={tooltipX}
            y={tooltipY}
            width={tooltipW}
            height={tooltipH}
            rx={4}
            fill="#ffffff"
            stroke="#e6e6e4"
            strokeWidth={1}
          />
          <text
            x={tooltipX + 8}
            y={tooltipY + 13}
            className="fill-faint font-mono"
            style={{ fontSize: 9, letterSpacing: "0.08em" }}
          >
            {formatDate(hoverItems[0].ts)}
          </text>
          {hoverItems.map((item, i) => (
            <g key={item.label}>
              <ellipse
                cx={tooltipX + 11}
                cy={tooltipY + 26 + i * 13}
                rx={2.5}
                ry={2.5 * radiusYRatio}
                fill={item.color}
              />
              <text
                x={tooltipX + 18}
                y={tooltipY + 29 + i * 13}
                className="fill-tertiary font-mono"
                style={{ fontSize: 9, letterSpacing: "0.06em" }}
              >
                {item.label}
              </text>
              <text
                x={tooltipX + tooltipW - 8}
                y={tooltipY + 29 + i * 13}
                textAnchor="end"
                className="fill-primary font-mono"
                style={{ fontSize: 9.5 }}
              >
                {Math.round(item.value).toLocaleString("en-US")}
              </text>
            </g>
          ))}
        </g>
      )}
    </svg>
  );
}
