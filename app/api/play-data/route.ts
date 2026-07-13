import { NextResponse } from "next/server";
import { fetchRecentGamePgns, fetchPlayerStats, getPlayerRating } from "@/lib/chess-api";
import { buildOpeningBook } from "@/lib/opening-book";

// Never prerender/cache this at build time — it's fetched client-side after
// the page loads, and this route's own chess.com calls are what previously
// hung Vercel's build worker when Next tried to statically evaluate it.
export const dynamic = "force-dynamic";

export async function GET() {
  const [pgns, stats] = await Promise.all([
    fetchRecentGamePgns(12),
    fetchPlayerStats(),
  ]);

  return NextResponse.json({
    openingBook: buildOpeningBook(pgns, 6),
    playerRating: getPlayerRating(stats),
  });
}
