export default function NightfallCard() {
  return (
    <div className="px-[22px] py-5 flex flex-col h-full">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] font-medium tracking-[0.14em] uppercase text-tertiary">
          Nightfall
        </span>
        <span className="flex items-center gap-1.5 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-accent blink-dot" />
          <span className="font-mono text-[9px] tracking-[0.1em] text-accent">
            ACTIVE
          </span>
        </span>
      </div>
      <span className="font-semibold text-[19px] tracking-[-0.01em] text-primary mt-3.5">
        1st Hire
      </span>
      <span className="text-[12.5px] text-muted leading-snug mt-auto pt-3.5">
        Khosla-backed · w/ Dr. Matthew Walker
      </span>
      <a
        href="https://www.nightfallhealth.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.08em] uppercase text-primary no-underline mt-2.5"
      >
        See Nightfall <span className="text-accent">→</span>
      </a>
    </div>
  );
}
