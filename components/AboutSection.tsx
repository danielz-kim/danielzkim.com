import FadeIn from "@/components/FadeIn";

export default function AboutSection() {
  return (
    <section id="about" className="px-6 md:px-10 pt-24 md:pt-[104px]">
      <div className="flex items-center gap-3.5 mb-7">
        <span className="font-mono text-[11px] font-medium tracking-[0.14em] text-accent">
          03
        </span>
        <span className="label-meta text-tertiary">About</span>
        <span className="flex-1 h-px bg-border" />
      </div>

      <FadeIn>
        <div className="border border-border rounded-xl p-[clamp(28px,3.4vw,44px)] bg-card grid gap-5 max-w-[840px]">
          <p className="font-medium text-[clamp(18px,1.9vw,24px)] leading-[1.4] tracking-[-0.015em] text-primary m-0">
            I&apos;m a Bay Area native and UC Berkeley graduate with a dual
            degree in Cognitive Science and Data Science, focused on
            neurotechnology and human–computer interaction.
          </p>
          <p className="text-[15.5px] leading-[1.7] text-secondary m-0">
            I&apos;m currently the founding Product Manager and first hire at
            Nightfall, a Khosla-backed sleep company led by Dr. Matthew
            Walker. Before that, I was the first product hire at Somnee and
            at Lekko (acquired by Rippling). I&apos;m pursuing an M.S. in
            Computer Science with an HCI specialization at Georgia Tech, and
            eventually want a Ph.D. My goal is to build products that are
            intuitive, evidence-based, and genuinely valuable to the everyday
            neurotech consumer.
          </p>
          <p className="text-[15.5px] leading-[1.7] text-secondary m-0">
            Outside of work, I train MMA, play chess, follow the NFL,
            skateboard, and write{" "}
            <a
              href="https://theneurotechnapkin.substack.com/"
              className="text-accent no-underline border-b border-tint"
            >
              The Neurotech Napkin
            </a>{" "}
            — a newsletter read by people at Neuralink, Synchron, and
            Blackrock Neurotech.
          </p>
        </div>
      </FadeIn>
    </section>
  );
}
