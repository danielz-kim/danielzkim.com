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

export function getPlayerRating(stats: ChessStats): number {
  return (
    stats.chess_rapid?.last.rating ??
    stats.chess_blitz?.last.rating ??
    stats.chess_bullet?.last.rating ??
    1400
  );
}
