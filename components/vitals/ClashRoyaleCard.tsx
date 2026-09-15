import ProgressBar from "./charts/ProgressBar";

export default function ClashRoyaleCard() {
  return (
    <div className="px-[22px] py-6 flex flex-col h-full">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] font-medium tracking-[0.14em] uppercase text-tertiary">
          Clash Royale
        </span>
        <span className="flex items-center gap-1.5 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-inactive" />
          <span className="font-mono text-[9px] tracking-[0.1em] text-faint">
            INACTIVE
          </span>
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <span className="font-semibold text-[clamp(30px,3vw,36px)] tracking-[-0.02em] leading-none text-primary">
          Top 20
        </span>
        <span className="font-mono text-[10px] font-medium tracking-[0.16em] uppercase text-tertiary mt-2.5">
          Ladder · United States
        </span>
      </div>

      <div>
        <ProgressBar percent={7} color="#bcbcba" />
        <div className="flex justify-between mt-[11px]">
          <span className="font-mono text-[9.5px] font-medium tracking-[0.12em] uppercase text-tertiary">
            56M+ Players
          </span>
          <span className="font-mono text-[10.5px] text-primary">TOP 0.1%</span>
        </div>
      </div>
    </div>
  );
}
