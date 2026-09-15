import ProgressRing from "./charts/ProgressRing";
import { fetchPlayerStats } from "@/lib/chess-api";

const GOAL = 2000;

const RINGS = [
  { key: "blitz", label: "Blitz", color: "var(--accent)" },
  {
    key: "rapid",
    label: "Rapid",
    color: "color-mix(in srgb, var(--accent) 68%, #9a9a9a 32%)",
  },
  { key: "bullet", label: "Bullet", color: "#a3a3a1" },
] as const;

function fmt(n?: number) {
  return n != null ? n.toLocaleString("en-US") : "—";
}

export default async function ChessEloCard() {
  const stats = await fetchPlayerStats({ revalidate: 3600 });

  const ratings: Record<(typeof RINGS)[number]["key"], number | undefined> = {
    blitz: stats.chess_blitz?.last.rating,
    rapid: stats.chess_rapid?.last.rating,
    bullet: stats.chess_bullet?.last.rating,
  };

  return (
    <div className="p-7 py-[28px] px-[30px] flex flex-col h-full">
      <div className="flex items-center justify-between">
        <span className="label-meta text-tertiary">Chess.com Elo</span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-accent blink-dot" />
          <span className="font-mono text-[10px] tracking-[0.1em] text-accent">
            LIVE
          </span>
        </span>
      </div>

      <div className="flex-1 flex items-center justify-around flex-wrap gap-6 mt-2">
        {RINGS.map((ring) => {
          const rating = ratings[ring.key];
          const percent = rating != null ? (rating / GOAL) * 100 : 0;

          return (
            <div key={ring.key} className="flex flex-col items-center gap-2.5">
              <div className="relative w-[84px] h-[84px]">
                <ProgressRing percent={percent} color={ring.color} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-mono text-[14px] text-primary">
                    {fmt(rating)}
                  </span>
                </div>
              </div>
              <span className="font-mono text-[9.5px] tracking-[0.1em] uppercase text-tertiary">
                {ring.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="font-mono text-[9.5px] text-ghost mt-3 border-t border-border-faint pt-3">
        Live from chess.com · goal 2000 in every format
      </div>
      <a
        href="https://www.chess.com/member/dbossehc"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.08em] uppercase text-primary no-underline mt-2.5"
      >
        See profile <span className="text-accent">→</span>
      </a>
    </div>
  );
}
