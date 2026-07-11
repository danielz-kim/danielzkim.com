import ProgressBar from "./charts/ProgressBar";

export default function ClashRoyaleCard() {
  return (
    <div className="px-[26px] py-6 flex flex-col h-full">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10.5px] font-medium tracking-[0.14em] uppercase text-tertiary">
          Clash Royale · Ladder
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-inactive" />
          <span className="font-mono text-[9.5px] tracking-[0.1em] text-faint">
            INACTIVE
          </span>
        </span>
      </div>
      <div className="flex items-baseline gap-2.5 mt-2.5">
        <span className="font-semibold text-[clamp(26px,2.8vw,32px)] tracking-[-0.02em] leading-none text-primary">
          Top 20
        </span>
        <span className="font-mono text-[10px] font-medium tracking-[0.16em] uppercase text-tertiary">
          United States
        </span>
      </div>
      <div className="mt-auto pt-[22px]">
        <ProgressBar percent={7} color="#bcbcba" />
        <div className="flex justify-between mt-[11px]">
          <span className="font-mono text-[10px] font-medium tracking-[0.14em] uppercase text-tertiary">
            56M+ Players
          </span>
          <span className="font-mono text-[11px] text-primary">TOP 0.1%</span>
        </div>
      </div>
    </div>
  );
}
