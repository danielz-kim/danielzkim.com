export default function LekkoCard() {
  return (
    <div className="px-[30px] py-7 flex flex-col h-full">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10.5px] font-medium tracking-[0.14em] uppercase text-tertiary">
          Lekko
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-inactive" />
          <span className="font-mono text-[9.5px] tracking-[0.1em] text-faint">
            INACTIVE
          </span>
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <span className="font-mono text-[10px] font-medium tracking-[0.16em] uppercase text-tertiary">
          1st Product Hire
        </span>
        <span className="font-semibold text-[clamp(26px,2.8vw,32px)] tracking-[-0.02em] leading-[1.15] text-primary mt-2.5">
          Acquired by Rippling
        </span>
        <span className="text-[13px] text-muted mt-3">
          Dev-tools startup — from a weekend build to acquisition.
        </span>
      </div>

      <div className="flex items-center justify-between pt-3.5 border-t border-border-faint">
        <span className="font-mono text-[10px] font-medium tracking-[0.14em] uppercase text-tertiary">
          Outcome
        </span>
        <a
          href="https://www.rippling.com/blog/building-a-founder-first-company"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.08em] uppercase text-primary no-underline"
        >
          See Lekko <span className="text-accent">→</span>
        </a>
      </div>
    </div>
  );
}
