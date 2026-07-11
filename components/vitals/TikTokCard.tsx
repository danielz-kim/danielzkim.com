import MiniBarChart from "./charts/MiniBarChart";

const heights = [26, 40, 33, 54, 46, 66, 58, 82, 72, 100];
const colors = [
  "#e4e4e2",
  "#e4e4e2",
  "#e4e4e2",
  "#dcdcda",
  "#dcdcda",
  "#d4d4d2",
  "#d4d4d2",
  "#cacac8",
  "#cacac8",
  "#bcbcba",
];

export default function TikTokCard() {
  return (
    <div className="px-6 py-[22px] flex flex-col h-full">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] font-medium tracking-[0.14em] uppercase text-tertiary">
          TikTok
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-inactive" />
          <span className="font-mono text-[9px] tracking-[0.1em] text-faint">
            INACTIVE
          </span>
        </span>
      </div>
      <div className="flex items-baseline gap-3.5 mt-3.5">
        <span className="font-mono text-[clamp(30px,3.2vw,38px)] tracking-[-0.02em] leading-none text-primary">
          4M+
        </span>
        <span className="font-mono text-[11px] tracking-[0.08em] text-label">
          700K LIKES
        </span>
      </div>
      <div className="mt-auto">
        <MiniBarChart heights={heights} colors={colors} />
      </div>
    </div>
  );
}
