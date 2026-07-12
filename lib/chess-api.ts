export interface ChessStats {
  chess_rapid?: { last: { rating: number }; best: { rating: number } };
  chess_blitz?: { last: { rating: number }; best: { rating: number } };
  chess_bullet?: { last: { rating: number }; best: { rating: number } };
}

const USERNAME = "dbossehc";
const BASE = "https://api.chess.com/pub/player";

function splitPgn(raw: string): string[] {
  // Each game starts with a PGN header tag. Split on blank line before a `[`
  return raw
    .split(/\n\n(?=\[)/)
    .map((g) => g.trim())
    .filter((g) => g.length > 0 && g.includes("1."));
}

export async function fetchRecentGamePgns(months = 6): Promise<string[]> {
  const now = new Date();
  const pgns: string[] = [];

  for (let i = 0; i < months; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");

    try {
      const res = await fetch(
        `${BASE}/${USERNAME}/games/${year}/${month}/pgn`,
        { next: { revalidate: 86400 } }
      );
      if (!res.ok) continue;
      const text = await res.text();
      pgns.push(...splitPgn(text));
    } catch {
      // Skip months that fail
    }
  }

  return pgns;
}

export async function fetchPlayerStats(
  opts: { revalidate?: number; fresh?: boolean } = {}
): Promise<ChessStats> {
  try {
    const res = await fetch(
      `${BASE}/${USERNAME}/stats`,
      opts.fresh
        ? { cache: "no-store" }
        : { next: { revalidate: opts.revalidate ?? 86400 } }
    );
    if (!res.ok) return {};
    return res.json();
  } catch {
    return {};
  }
}

export type TimeClass = "bullet" | "blitz" | "rapid";

export interface GameRatingPoint {
  ts: number; // ms
  timeClass: TimeClass;
  rating: number;
}

const RATED_TIME_CLASSES: TimeClass[] = ["bullet", "blitz", "rapid"];

/**
 * Chess.com's monthly archives include the player's rating after every
 * game, so we can reconstruct real rating history without waiting for
 * scheduled snapshots to accumulate.
 */
export async function fetchGameHistory(months = 12): Promise<GameRatingPoint[]> {
  const now = new Date();
  const points: GameRatingPoint[] = [];

  for (let i = 0; i < months; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");

    // Past months are immutable once they're over; only the current month
    // still gains games, so cache it far more briefly.
    const isCurrentMonth = i === 0;

    try {
      const res = await fetch(`${BASE}/${USERNAME}/games/${year}/${month}`, {
        next: { revalidate: isCurrentMonth ? 3600 : 604800 },
      });
      if (!res.ok) continue;
      const data = await res.json();
      const games: unknown[] = Array.isArray(data.games) ? data.games : [];

      for (const g of games as Record<string, any>[]) {
        if (g.rules !== "chess") continue;
        if (!RATED_TIME_CLASSES.includes(g.time_class)) continue;

        const mine =
          g.white?.username?.toLowerCase() === USERNAME.toLowerCase()
            ? g.white
            : g.black?.username?.toLowerCase() === USERNAME.toLowerCase()
              ? g.black
              : null;
        if (!mine || typeof mine.rating !== "number") continue;

        points.push({
          ts: g.end_time * 1000,
          timeClass: g.time_class,
          rating: mine.rating,
        });
      }
    } catch {
      // Skip months that fail
    }
  }

  return points.sort((a, b) => a.ts - b.ts);
}

export function getPlayerRating(stats: ChessStats): number {
  return (
    stats.chess_rapid?.last.rating ??
    stats.chess_blitz?.last.rating ??
    stats.chess_bullet?.last.rating ??
    1400
  );
}
