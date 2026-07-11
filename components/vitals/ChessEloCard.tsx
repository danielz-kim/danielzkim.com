import Sparkline from "./charts/Sparkline";
import { fetchPlayerStats } from "@/lib/chess-api";
import { getHistory, computeEloSparkline } from "@/lib/chess-history";

function fmt(n?: number) {
  return n != null ? n.toLocaleString("en-US") : "—";
}

export default async function ChessEloCard() {
  const [stats, history] = await Promise.all([
    fetchPlayerStats({ revalidate: 3600 }),
    getHistory(60),
  ]);

  const rapid = stats.chess_rapid?.last.rating;
  const blitz = stats.chess_blitz?.last.rating;
  const bullet = stats.chess_bullet?.last.rating;

  const chart = computeEloSparkline(history);

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

      <div className="flex items-center gap-[18px] mt-4 flex-wrap">
        <div className="flex items-center gap-[7px]">
          <span className="w-2 h-2 rounded-full bg-accent shrink-0" />
          <span className="font-mono text-[9.5px] tracking-[0.1em] uppercase text-tertiary">
            Blitz
          </span>
          <span className="font-mono text-[15px] text-primary">{fmt(blitz)}</span>
        </div>
        <div className="flex items-center gap-[7px]">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{
              background: "color-mix(in srgb, var(--accent) 48%, #9a9a9a 52%)",
            }}
          />
          <span className="font-mono text-[9.5px] tracking-[0.1em] uppercase text-tertiary">
            Rapid
          </span>
          <span className="font-mono text-[15px] text-primary">{fmt(rapid)}</span>
        </div>
        <div className="flex items-center gap-[7px]">
          <span className="w-2 h-2 rounded-full bg-faint shrink-0" />
          <span className="font-mono text-[9.5px] tracking-[0.1em] uppercase text-tertiary">
            Bullet
          </span>
          <span className="font-mono text-[15px] text-primary">{fmt(bullet)}</span>
        </div>
      </div>

      <div className="flex-1 mt-3.5 min-h-[100px] relative">
        {chart ? (
          <Sparkline
            viewBox="0 0 560 200"
            areaPath={chart.areaPath}
            series={chart.series}
          />
        ) : (
          <div className="h-full flex items-center justify-center font-mono text-[9.5px] text-faint">
            Collecting rating history…
          </div>
        )}
      </div>

      {chart && (
        <div className="flex justify-between">
          {chart.labels.map((label, i) => (
            <span
              key={`${label}-${i}`}
              className="font-mono text-[9.5px] tracking-[0.1em] text-faint"
            >
              {label}
            </span>
          ))}
        </div>
      )}

      <div className="font-mono text-[9.5px] text-ghost mt-3 border-t border-border-faint pt-3">
        Synced from chess.com · updates 12am &amp; 12pm daily
      </div>
    </div>
  );
}
