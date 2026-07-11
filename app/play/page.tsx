import { fetchRecentGamePgns, fetchPlayerStats, getPlayerRating } from "@/lib/chess-api";
import { buildOpeningBook } from "@/lib/opening-book";
import ChessBotWrapper from "./ChessBotWrapper";
import FadeIn from "@/components/FadeIn";

export const metadata = {
  title: "Play — Daniel Kim",
  description: "Play chess against a bot trained on my game history.",
};

export const revalidate = 86400;

export default async function PlayPage() {
  const [pgns, stats] = await Promise.all([
    fetchRecentGamePgns(12),
    fetchPlayerStats(),
  ]);

  const openingBook = buildOpeningBook(pgns, 6);
  const playerRating = getPlayerRating(stats);

  return (
    <div className="pt-28 pb-24">
      <div className="max-w-grid mx-auto px-6">
        <FadeIn>
          <div className="mb-16">
            <h1 className="font-heading font-medium text-4xl text-primary mb-4">
              Play
            </h1>
            <p className="text-lg text-secondary leading-relaxed">
              This is where the website gets weird. In a good way.
            </p>
          </div>
        </FadeIn>

        <section className="mb-24">
          <FadeIn>
            <div className="mb-8">
              <h2 className="font-heading font-medium text-2xl text-primary mb-3">
                Play chess against my style
              </h2>
              <p className="text-sm text-secondary leading-relaxed">
                A bot trained on my game history from Chess.com. It plays like
                me — aggressive openings, positional middlegame, occasional
                blunder. Don't read too much into the losses.
              </p>
              {playerRating && (
                <p className="font-mono text-sm text-tertiary mt-2">
                  current rating — {playerRating}
                </p>
              )}
            </div>
          </FadeIn>

          <ChessBotWrapper
            openingBook={openingBook}
            playerRating={playerRating}
          />
        </section>
      </div>
    </div>
  );
}
