import Link from "next/link";
import FadeIn from "@/components/FadeIn";

export default function PlaySection() {
  return (
    <section id="play" className="px-6 md:px-10 pt-24 md:pt-[104px]">
      <div className="flex items-center gap-3.5 mb-6">
        <span className="font-mono text-[11px] font-medium tracking-[0.14em] text-accent">
          06
        </span>
        <span className="label-meta text-tertiary">Play</span>
        <span className="flex-1 h-px bg-border" />
      </div>

      <FadeIn>
        <div className="border border-border rounded-xl p-[clamp(28px,3.4vw,44px)] bg-card flex gap-11 items-center flex-wrap">
          <div className="flex-1 basis-[320px] min-w-[280px]">
            <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-accent border border-tint rounded-full px-[11px] py-[5px]">
              Live
            </span>
            <h3 className="font-semibold text-[clamp(22px,2.4vw,29px)] leading-[1.2] tracking-[-0.02em] mt-4 mb-0 text-primary">
              Play me in chess?
            </h3>
            <p className="text-[14.5px] leading-[1.65] text-secondary mt-3 mb-0 max-w-[44ch]">
              I trained a bot on every game I&apos;ve ever played on
              Chess.com — Blitz, Rapid, and Bullet — so it plays like I do.
              Challenge it right now.
            </p>
            <Link
              href="/play"
              className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.06em] uppercase text-primary no-underline mt-4"
            >
              Play now <span className="text-accent">→</span>
            </Link>
          </div>
          <Link
            href="/play"
            className="w-[200px] h-[200px] shrink-0 rounded-[10px] overflow-hidden border border-border relative block"
            style={{
              background:
                "repeating-conic-gradient(#f1f1ef 0% 25%, #e6e6e4 0% 50%) 0 0/25px 25px",
            }}
          >
            <span className="absolute top-1/2 left-1/2 w-2.5 h-2.5 rounded-full bg-accent blink-dot -translate-x-1/2 -translate-y-1/2" />
          </Link>
        </div>
      </FadeIn>
    </section>
  );
}
