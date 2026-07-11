import Sparkline from "./charts/Sparkline";

export default function LinkedInCard() {
  return (
    <div className="p-[22px] flex flex-col h-full">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] font-medium tracking-[0.14em] uppercase text-tertiary">
          LinkedIn
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-accent blink-dot" />
          <span className="font-mono text-[9px] tracking-[0.1em] text-accent">
            ACTIVE
          </span>
        </span>
      </div>
      <span className="font-mono text-[clamp(30px,3.2vw,38px)] tracking-[-0.02em] leading-none text-primary mt-3.5">
        100k+
      </span>
      <div className="mt-auto h-[38px]">
        <Sparkline
          viewBox="0 0 120 40"
          areaPath="M2,36 L16,31 L30,33 L44,24 L58,27 L72,17 L86,20 L100,10 L118,3 L118,40 L2,40 Z"
          series={[
            {
              d: "M2,36 L16,31 L30,33 L44,24 L58,27 L72,17 L86,20 L100,10 L118,3",
              color: "var(--accent)",
              width: 1.4,
            },
          ]}
        />
      </div>
    </div>
  );
}
