import FadeIn from "@/components/FadeIn";

export const metadata = {
  title: "About — Daniel Kim",
  description:
    "PM, builder, neuroscience nerd. Founding PM at Nightfall, working with Dr. Matthew Walker.",
};

const links = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/danielzkim/" },
  { label: "Twitter/X", href: "https://x.com/daniel_zkim" },
  { label: "Newsletter", href: "https://theneurotechnapkin.substack.com/" },
  { label: "Email", href: "mailto:dzk503@berkeley.edu" },
  {
    label: "Resume ↗",
    href: "https://drive.google.com/file/d/1p63gdl-aifPjrtCgJ7ILW-nPGQy-ciKi/view?usp=sharing",
  },
];

export default function AboutPage() {
  return (
    <div className="pt-28 pb-24">
      <div className="max-w-grid mx-auto px-6">
        <FadeIn>
          <div className="w-20 h-20 rounded-full bg-background border border-border mb-16 flex items-center justify-center">
            <span className="label-meta text-tertiary">photo</span>
          </div>
        </FadeIn>

        <FadeIn delay={0.05}>
          <div className="space-y-7 text-base text-secondary leading-[1.8] max-w-[640px]">
            <p>
              I'm a founding PM at Nightfall, a Khosla Ventures-backed sleep
              startup where I work directly with Dr. Matthew Walker — the
              neuroscientist behind{" "}
              <em>Why We Sleep</em>. Before this, I was at Somnee (sleep wearables),
              Lekko (developer tooling, acquired by Rippling), and Beats by Dre.
              I hold two degrees from Berkeley and a master's from Georgia Tech.
            </p>

            <p>
              My through-line is simple: I study how humans work, then build
              things that make them work better. That's not a tagline — it's
              the lens I use on every product problem. What does the human
              actually need here? What's the gap between that and what they
              have? How do you close it?
            </p>

            <p>
              Outside work, I train MMA, skateboard, and play a lot of
              chess. I went from 1000 to 1600 Elo in four months, which sounds
              impressive until you lose to someone who's been playing since age
              six. I made Top 20 in the US in Clash Royale, which I mention
              because it required more strategic thinking than most people
              assume and I have data to back that up.
            </p>

            <p>
              Skateboarding taught me that failure is data. You don't land a
              nightmare flip the first time. You don't land it the hundredth
              time. You study the fall pattern and adjust. Most of the skills
              I've developed in product work came from physical pursuits first
              — the discipline of doing something hard in public until it clicks.
            </p>

            <p>
              I care about human performance at its edges. Sleep, cognition,
              neurotech, the weird territory where biology meets technology and
              neither side fully knows what they're doing yet. That's where
              interesting products get built.
            </p>

            <p>
              Nightfall is the most personal professional thing I've done.
              Sleep isn't just a health metric to me — it's the foundation
              everything else rests on. Getting to build products at the
              intersection of neuroscience and sleep, with someone who wrote
              the book on it (literally), is not something I take lightly.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="mt-16 pt-8 border-t border-border-light flex flex-wrap gap-5">
            {links.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="text-sm text-secondary hover:text-primary transition-colors underline decoration-[#dcdcdc] hover:decoration-primary"
              >
                {label}
              </a>
            ))}
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
