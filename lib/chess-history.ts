import { getRedis } from "./redis";
import { fetchPlayerStats } from "./chess-api";
import type { SparklineSeries } from "@/components/vitals/charts/Sparkline";

const HISTORY_KEY = "chess:elo:history";
const MAX_SNAPSHOTS = 180; // ~90 days at 2 snapshots/day

export interface EloSnapshot {
  ts: number;
  rapid: number | null;
  blitz: number | null;
  bullet: number | null;
}

export async function recordSnapshot(): Promise<EloSnapshot | null> {
  const redis = getRedis();
  if (!redis) return null;

  const stats = await fetchPlayerStats({ fresh: true });
  const snapshot: EloSnapshot = {
    ts: Date.now(),
    rapid: stats.chess_rapid?.last.rating ?? null,
    blitz: stats.chess_blitz?.last.rating ?? null,
    bullet: stats.chess_bullet?.last.rating ?? null,
  };

  await redis.rpush(HISTORY_KEY, JSON.stringify(snapshot));
  await redis.ltrim(HISTORY_KEY, -MAX_SNAPSHOTS, -1);

  return snapshot;
}

export async function getHistory(limit = 60): Promise<EloSnapshot[]> {
  const redis = getRedis();
  if (!redis) return [];

  const raw = await redis.lrange<EloSnapshot | string>(HISTORY_KEY, -limit, -1);
  return raw
    .map((entry) => (typeof entry === "string" ? JSON.parse(entry) : entry))
    .filter((s): s is EloSnapshot => !!s && typeof s.ts === "number");
}

const X_MIN = 8;
const X_MAX = 552;
const Y_MIN = 10;
const Y_MAX = 192;

interface SeriesConfig {
  key: "blitz" | "rapid" | "bullet";
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
  history: EloSnapshot[]
): ChessSparklineData | null {
  if (history.length === 0) return null;

  // Need at least two points to draw a line; a single snapshot renders flat.
  const points = history.length === 1 ? [history[0], history[0]] : history;

  const values = points.flatMap((p) =>
    [p.rapid, p.blitz, p.bullet].filter((v): v is number => v != null)
  );
  if (values.length === 0) return null;

  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const pad = Math.max((rawMax - rawMin) * 0.12, 25);
  const min = rawMin - pad;
  const max = rawMax + pad;
  const range = max - min || 1;

  const xStep = (X_MAX - X_MIN) / (points.length - 1);
  const xFor = (i: number) => X_MIN + i * xStep;
  const yFor = (value: number) => Y_MAX - ((value - min) / range) * (Y_MAX - Y_MIN);

  const series: SparklineSeries[] = [];
  let areaPath = "";

  for (const cfg of SERIES_CONFIG) {
    const coords = points
      .map((p, i) => {
        const v = p[cfg.key];
        return v == null ? null : { x: xFor(i), y: yFor(v) };
      })
      .filter((c): c is { x: number; y: number } => c !== null);

    if (coords.length === 0) continue;

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

  const labelCount = Math.min(5, points.length);
  const labels: string[] = [];
  for (let i = 0; i < labelCount; i++) {
    const idx = Math.round((i * (points.length - 1)) / Math.max(labelCount - 1, 1));
    const d = new Date(points[idx].ts);
    labels.push(
      `${d.toLocaleString("en-US", { month: "short" }).toUpperCase()} ${d.getDate()}`
    );
  }

  return { series, areaPath, labels };
}
