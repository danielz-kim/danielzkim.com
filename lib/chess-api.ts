export interface ChessStats {
  chess_rapid?: { last: { rating: number }; best: { rating: number } };
  chess_blitz?: { last: { rating: number }; best: { rating: number } };
  chess_bullet?: { last: { rating: number }; best: { rating: number } };
}

const USERNAME = "dbossehc";
const BASE = "https://api.chess.com/pub/player";

// chess.com's Cloudflare front door will occasionally stall requests from
// datacenter IP ranges (e.g. build environments) instead of failing fast.
// AbortSignal.timeout alone wasn't enough to bound this on Vercel's build
// machines, so every request is also raced against a plain timer that
// resolves to a fallback value no matter what the underlying fetch is doing.
const FETCH_TIMEOUT_MS = 8000;

function withTimeout<T>(promise: Promise<T>, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), FETCH_TIMEOUT_MS)),
  ]);
}

function splitPgn(raw: string): string[] {
  // Each game starts with a PGN header tag. Split on blank line before a `[`
  return raw
    .split(/\n\n(?=\[)/)
    .map((g) => g.trim())
    .filter((g) => g.length > 0 && g.includes("1."));
}

export async function fetchRecentGamePgns(months = 6): Promise<string[]> {
  const now = new Date();

  // Fire all months in parallel: sequential awaits mean the worst case is
  // months * FETCH_TIMEOUT_MS, which can blow past a build's page-generation
  // limit if chess.com stalls on even a couple of them.
  const results = await Promise.all(
    Array.from({ length: months }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");

      const work = (async () => {
        try {
          const res = await fetch(
            `${BASE}/${USERNAME}/games/${year}/${month}/pgn`,
            { next: { revalidate: 86400 }, signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) }
          );
          if (!res.ok) return [];
          const text = await res.text();
          return splitPgn(text);
        } catch {
          return [];
        }
      })();

      return withTimeout(work, [] as string[]);
    })
  );

  return results.flat();
}

export async function fetchPlayerStats(
  opts: { revalidate?: number; fresh?: boolean } = {}
): Promise<ChessStats> {
  const work = (async () => {
    try {
      const res = await fetch(`${BASE}/${USERNAME}/stats`, {
        ...(opts.fresh
          ? { cache: "no-store" as const }
          : { next: { revalidate: opts.revalidate ?? 86400 } }),
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      if (!res.ok) return {};
      return res.json();
    } catch {
      return {};
    }
  })();

  return withTimeout(work, {} as ChessStats);
}

export function getPlayerRating(stats: ChessStats): number {
  return (
    stats.chess_rapid?.last.rating ??
    stats.chess_blitz?.last.rating ??
    stats.chess_bullet?.last.rating ??
    1400
  );
}
