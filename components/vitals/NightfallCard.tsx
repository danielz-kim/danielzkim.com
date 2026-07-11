export default function NightfallCard() {
  return (
    <div className="p-[22px] flex flex-col h-full">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] font-medium tracking-[0.14em] uppercase text-tertiary">
          Nightfall
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-accent blink-dot" />
          <span className="font-mono text-[9px] tracking-[0.1em] text-accent">
            ACTIVE
          </span>
        </span>
      </div>
      <span className="font-semibold text-[clamp(19px,2vw,22px)] tracking-[-0.01em] leading-[1.25] text-primary mt-4">
        1st Hire
      </span>
      <span className="text-xs text-muted mt-auto pt-2.5">
        Khosla-backed · w/ Dr. Matthew Walker
      </span>
    </div>
  );
}
