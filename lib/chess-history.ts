import { fetchGameHistory, type TimeClass } from "./chess-api";
import type { SparklineSeries } from "@/components/vitals/charts/Sparkline";

const TIME_CLASSES: TimeClass[] = ["bullet", "blitz", "rapid"];

export interface RatingPoint {
  ts: number;
  rating: number;
}

/**
 * Chess.com's monthly game archives are themselves the historical record —
 * no need to snapshot/store anything ourselves. Pulls games, groups by
 * time class, and returns rating-over-time points ready for the sparkline.
 */
export async function fetchEloSeries(
  months = 6
): Promise<Record<TimeClass, RatingPoint[]>> {
  const games = await fetchGameHistory(months);

  const byClass: Record<TimeClass, RatingPoint[]> = {
    bullet: [],
    blitz: [],
    rapid: [],
  };
  for (const g of games) {
    byClass[g.timeClass].push({ ts: g.ts, rating: g.rating });
  }

  return byClass;
}

const X_MIN = 8;
const X_MAX = 552;
const Y_MIN = 10;
const Y_MAX = 192;
const MAX_DISPLAY_POINTS = 60;

interface SeriesConfig {
  key: TimeClass;
  color: string;
  width: number;
  dash?: string;
  pulse?: boolean;
}

// Each series gets a distinct color AND dash texture (dotted/dashed/solid)
// so they stay legible even where two trends overlap — two shades of the
// same accent green are too close to tell apart on their own.
const SERIES_CONFIG: SeriesConfig[] = [
  { key: "bullet", color: "#a3a3a1", width: 1.3, dash: "1.5 3" },
  {
    key: "rapid",
    color: "color-mix(in srgb, var(--accent) 68%, #9a9a9a 32%)",
    width: 1.6,
    dash: "6 3",
  },
  { key: "blitz", color: "var(--accent)", width: 1.9, pulse: true },
];

function movingAverage(points: RatingPoint[], window: number): RatingPoint[] {
  if (window <= 1) return points;
  return points.map((p, i) => {
    const start = Math.max(0, i - window + 1);
    const slice = points.slice(start, i + 1);
    const avg = slice.reduce((sum, s) => sum + s.rating, 0) / slice.length;
    return { ts: p.ts, rating: avg };
  });
}

function downsample(points: RatingPoint[], maxPoints: number): RatingPoint[] {
  if (points.length <= maxPoints) return points;
  const step = (points.length - 1) / (maxPoints - 1);
  return Array.from({ length: maxPoints }, (_, i) => points[Math.round(i * step)]);
}

/** Smooths per-game noise into a clean trend line, but keeps the final
 * plotted value exactly equal to the true latest rating so the endpoint
 * matches the numeric badge shown above the chart. */
function prepareSeries(points: RatingPoint[]): RatingPoint[] {
  if (points.length === 0) return [];
  const sorted = [...points].sort((a, b) => a.ts - b.ts);
  const window = Math.min(15, Math.max(1, Math.round(sorted.length / 40)));
  const displayed = downsample(movingAverage(sorted, window), MAX_DISPLAY_POINTS);
  displayed[displayed.length - 1] = sorted[sorted.length - 1];
  return displayed;
}

export interface ChessSparklineData {
  series: SparklineSeries[];
  areaPath: string;
  labels: string[];
}

export function computeEloSparkline(
  data: Record<TimeClass, RatingPoint[]>
): ChessSparklineData | null {
  const prepared: Record<TimeClass, RatingPoint[]> = {
    bullet: prepareSeries(data.bullet),
    blitz: prepareSeries(data.blitz),
    rapid: prepareSeries(data.rapid),
  };

  const allPoints = TIME_CLASSES.flatMap((tc) => prepared[tc]);
  if (allPoints.length === 0) return null;

  const tsMin = Math.min(...allPoints.map((p) => p.ts));
  const tsMax = Math.max(...allPoints.map((p) => p.ts));
  const tsRange = tsMax - tsMin || 1;
  const xFor = (ts: number) => X_MIN + ((ts - tsMin) / tsRange) * (X_MAX - X_MIN);

  const series: SparklineSeries[] = [];
  let areaPath = "";

  for (const cfg of SERIES_CONFIG) {
    const points = prepared[cfg.key];
    if (points.length === 0) continue;

    // Each series is normalized to its own range rather than a shared one,
    // so metrics with very different absolute ratings (e.g. Rapid sitting
    // 300+ points above Bullet) don't squash each other's trend flat.
    const ratings = points.map((p) => p.rating);
    const rawMin = Math.min(...ratings);
    const rawMax = Math.max(...ratings);
    const pad = Math.max((rawMax - rawMin) * 0.18, 12);
    const min = rawMin - pad;
    const max = rawMax + pad;
    const range = max - min || 1;
    const yFor = (rating: number) => Y_MAX - ((rating - min) / range) * (Y_MAX - Y_MIN);

    const coords = points.map((p) => ({ x: xFor(p.ts), y: yFor(p.rating) }));
    const d = coords
      .map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`)
      .join(" ");
    const first = coords[0];
    const last = coords[coords.length - 1];

    series.push({
      d,
      color: cfg.color,
      width: cfg.width,
      dash: cfg.dash,
      endpoint: { cx: last.x, cy: last.y, pulse: cfg.pulse, color: cfg.color },
    });

    if (cfg.key === "blitz") {
      areaPath = `${d} L${last.x.toFixed(1)},${Y_MAX} L${first.x.toFixed(1)},${Y_MAX} Z`;
    }
  }

  const labelCount = 5;
  const labels: string[] = [];
  for (let i = 0; i < labelCount; i++) {
    const ts = tsMin + (i * tsRange) / (labelCount - 1);
    const d = new Date(ts);
    labels.push(
      `${d.toLocaleString("en-US", { month: "short" }).toUpperCase()} ${d.getDate()}`
    );
  }

  return { series, areaPath, labels };
}
