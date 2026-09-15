import FadeIn from "@/components/FadeIn";

export default function AboutSection() {
  return (
    <section id="about" className="px-6 md:px-10 pt-24 md:pt-[104px]">
      <div className="flex items-center gap-3.5 mb-7">
        <span className="font-mono text-[11px] font-medium tracking-[0.14em] text-accent">
          03
        </span>
        <span className="section-title">About</span>
        <span className="flex-1 h-px bg-border" />
      </div>

      <FadeIn>
        <div className="border border-border rounded-xl p-[clamp(28px,3.4vw,44px)] bg-card grid gap-5 max-w-[840px]">
          <p className="font-medium text-[clamp(18px,1.9vw,24px)] leading-[1.4] tracking-[-0.015em] text-primary m-0">
            Hi!
          </p>
          <p className="text-[15.5px] leading-[1.7] text-secondary m-0">
            I&apos;m the founding Product Manager and first hire at Nightfall Health, 
            a Khosla-backed sleep company led by Dr. Matthew Walker. Before that, I 
            was an early hire at Somnee and at Lekko (acquired by Rippling).
            I&apos;m pursuing an M.S. in Computer Science at Georgia Tech, and eventually 
            want to explore pursuing a Ph.D.
          </p>
          <p className="text-[15.5px] leading-[1.7] text-secondary m-0">
          I believe the next frontier of technology sits at the intersection of 
          human biology and computation — not tech that replaces or reduces 
          humanity, but tech that enhances and expands it. It is that future that 
          I am building towards.  
          </p>
          <p className="text-[15.5px] leading-[1.7] text-secondary m-0">
            Outside of work and studying, I train MMA, play chess, follow sports,
            skateboard, read, and write. 
          </p>
        </div>
      </FadeIn>
    </section>
  );
}
