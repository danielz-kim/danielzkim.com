import { getRedis } from "./redis";
import {
  fetchPlayerStats,
  fetchGameHistory,
  type TimeClass,
} from "./chess-api";
import type { SparklineSeries } from "@/components/vitals/charts/Sparkline";

const TIME_CLASSES: TimeClass[] = ["bullet", "blitz", "rapid"];
const MAX_POINTS_PER_CLASS = 1000; // bound each sorted set's long-term growth
const DISPLAY_POINTS_PER_CLASS = 200;

function keyFor(tc: TimeClass) {
  return `chess:elo:${tc}`;
}

export interface RatingPoint {
  ts: number;
  rating: number;
}

async function addPoints(tc: TimeClass, points: RatingPoint[]) {
  const redis = getRedis();
  if (!redis || points.length === 0) return;

  const [first, ...rest] = points.map((p) => ({
    score: p.ts,
    member: `${p.ts}:${p.rating}`,
  }));
  await redis.zadd(keyFor(tc), first, ...rest);
  await redis.zremrangebyrank(keyFor(tc), 0, -MAX_POINTS_PER_CLASS - 1);
}

/** Called by the twice-daily cron to append the current live rating. */
export async function recordSnapshot(): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return false;

  const stats = await fetchPlayerStats({ fresh: true });
  const now = Date.now();
  const ratings: Record<TimeClass, number | undefined> = {
    bullet: stats.chess_bullet?.last.rating,
    blitz: stats.chess_blitz?.last.rating,
    rapid: stats.chess_rapid?.last.rating,
  };

  for (const tc of TIME_CLASSES) {
    const rating = ratings[tc];
    if (rating != null) await addPoints(tc, [{ ts: now, rating }]);
  }

  return true;
}

/**
 * One-time (safe to re-run) backfill that reconstructs history from past
 * games, so the graph has real data immediately instead of waiting weeks
 * for cron snapshots to accumulate.
 */
export async function backfillFromGames(
  months = 12
): Promise<Record<TimeClass, number> | null> {
  const redis = getRedis();
  if (!redis) return null;

  const games = await fetchGameHistory(months);
  const byClass: Record<TimeClass, RatingPoint[]> = {
    bullet: [],
    blitz: [],
    rapid: [],
  };
  for (const g of games) {
    byClass[g.timeClass].push({ ts: g.ts, rating: g.rating });
  }

  const counts: Record<TimeClass, number> = { bullet: 0, blitz: 0, rapid: 0 };
  for (const tc of TIME_CLASSES) {
    await addPoints(tc, byClass[tc]);
    counts[tc] = byClass[tc].length;
  }

  return counts;
}

export async function getSeries(
  limit = DISPLAY_POINTS_PER_CLASS
): Promise<Record<TimeClass, RatingPoint[]>> {
  const empty: Record<TimeClass, RatingPoint[]> = {
    bullet: [],
    blitz: [],
    rapid: [],
  };
  const redis = getRedis();
  if (!redis) return empty;

  const result = { ...empty };
  for (const tc of TIME_CLASSES) {
    const raw = await redis.zrange<string[]>(keyFor(tc), -limit, -1);
    result[tc] = raw.map((member) => {
      const [ts, rating] = member.split(":");
      return { ts: Number(ts), rating: Number(rating) };
    });
  }
  return result;
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
