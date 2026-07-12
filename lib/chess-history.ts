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

interface SeriesConfig {
  key: TimeClass;
  color: string;
  width: number;
  dashed?: boolean;
  pulse?: boolean;
}

// Ordered faintest → most prominent, matching the legend dots in ChessEloCard.
const SERIES_CONFIG: SeriesConfig[] = [
  { key: "bullet", color: "#b7b7b5", width: 1.4, dashed: true },
  {
    key: "rapid",
    color: "color-mix(in srgb, var(--accent) 48%, #9a9a9a 52%)",
    width: 1.6,
  },
  { key: "blitz", color: "var(--accent)", width: 1.8, pulse: true },
];

export interface ChessSparklineData {
  series: SparklineSeries[];
  areaPath: string;
  labels: string[];
}

export function computeEloSparkline(
  data: Record<TimeClass, RatingPoint[]>
): ChessSparklineData | null {
  const allPoints = TIME_CLASSES.flatMap((tc) => data[tc]);
  if (allPoints.length === 0) return null;

  const tsMin = Math.min(...allPoints.map((p) => p.ts));
  const tsMax = Math.max(...allPoints.map((p) => p.ts));
  const tsRange = tsMax - tsMin || 1;

  const ratings = allPoints.map((p) => p.rating);
  const rawMin = Math.min(...ratings);
  const rawMax = Math.max(...ratings);
  const pad = Math.max((rawMax - rawMin) * 0.12, 25);
  const min = rawMin - pad;
  const max = rawMax + pad;
  const range = max - min || 1;

  const xFor = (ts: number) => X_MIN + ((ts - tsMin) / tsRange) * (X_MAX - X_MIN);
  const yFor = (rating: number) => Y_MAX - ((rating - min) / range) * (Y_MAX - Y_MIN);

  const series: SparklineSeries[] = [];
  let areaPath = "";

  for (const cfg of SERIES_CONFIG) {
    const points = data[cfg.key];
    if (points.length === 0) continue;

    const coords = points.map((p) => ({ x: xFor(p.ts), y: yFor(p.rating) }));
    const d = coords
      .map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`)
      .join(" ");
    const last = coords[coords.length - 1];

    series.push({
      d,
      color: cfg.color,
      width: cfg.width,
      dashed: cfg.dashed,
      endpoint: { cx: last.x, cy: last.y, pulse: cfg.pulse, color: cfg.color },
    });

    if (cfg.key === "blitz") {
      areaPath = `${d} L${last.x.toFixed(1)},${Y_MAX} L${X_MIN},${Y_MAX} Z`;
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
