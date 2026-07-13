import FadeIn from "@/components/FadeIn";
import LiveClock from "@/components/LiveClock";
import { fetchLatestActivity } from "@/lib/oura-api";

const tags = ["HCI", "biotech/neurotech", "product", "0→1", "UC Berkeley", "Georgia Tech"];

const preRows = [{ label: "Location", value: "San Francisco, CA" }];

const staticPostRows = [
  { label: "Focus", value: "Sleep Tech · Nightfall", mono: false },
  { label: "Studying", value: "M.S. CS, HCI · Georgia Tech", mono: false },
];

function fmt(n?: number) {
  return n != null ? n.toLocaleString("en-US") : "—";
}

export default async function Hero() {
  const activity = await fetchLatestActivity();

  const postRows = [
    ...staticPostRows,
    { label: "Steps Yesterday", value: fmt(activity?.steps), mono: true },
    {
      label: "Calories Burned Yesterday",
      value: activity ? `${fmt(activity.activeCalories)} kcal` : "—",
      mono: true,
    },
  ];

  return (
    <section
      id="top"
      className="px-6 md:px-10 pt-32 flex gap-14 items-start flex-wrap"
    >
      <div className="flex-1 basis-[480px] min-w-[320px]">
        <FadeIn delay={0}>
          <h1 className="font-medium text-[clamp(32px,4.6vw,56px)] leading-[1.05] tracking-[-0.025em] text-primary text-balance m-0">
            Hi, I am Daniel.
          </h1>
        </FadeIn>
        <FadeIn delay={0.05}>
          <p className="font-medium text-[clamp(17px,1.7vw,22px)] leading-[1.4] tracking-[-0.015em] text-primary max-w-[54ch] mt-[18px] mb-0">
            I study how humans are wired, then build things that help them
            flourish.
          </p>
        </FadeIn>
        <FadeIn delay={0.1}>
          <p className="text-[clamp(15px,1.35vw,18px)] leading-[1.62] text-secondary max-w-[54ch] mt-4 mb-0">
            Right now, I&apos;m the Founding Product Manager and first hire at
            Nightfall, a Khosla-backed sleep company led by Dr. Matthew
            Walker. Alongside that, I&apos;m pursuing an MS in Computer
            Science with a specialization in Human-Computer Interaction at
            Georgia Tech, building on a dual degree in Cognitive Science and
            Data Science from UC Berkeley.
          </p>
        </FadeIn>
        <FadeIn delay={0.15}>
          <div className="flex flex-wrap gap-2 mt-7">
            {tags.map((tag) => (
              <span key={tag} className="tag-pill">
                {tag}
              </span>
            ))}
          </div>
        </FadeIn>
      </div>

      <FadeIn delay={0.1} className="flex-none basis-[380px] min-w-[320px]">
        <div className="border border-border rounded-xl bg-card px-6 py-[22px]">
          <div className="flex items-center justify-between pb-4 border-b border-border-faint">
            <span className="label-meta text-tertiary">Live Status</span>
            <span className="flex items-center gap-[7px]">
              <span className="w-1.5 h-1.5 rounded-full bg-accent blink-dot" />
              <span className="font-mono text-[11px] tracking-[0.08em] text-accent">
                IN THE LAB
              </span>
            </span>
          </div>
          <div className="flex flex-col">
            {preRows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between py-3.5 border-b border-border-faint"
              >
                <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-label">
                  {row.label}
                </span>
                <span className="text-[13px] text-primary">{row.value}</span>
              </div>
            ))}
            <div className="flex items-center justify-between py-3.5 border-b border-border-faint">
              <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-label">
                Local Time
              </span>
              <span className="font-mono text-[13px] text-primary">
                <LiveClock /> PT
              </span>
            </div>
            {postRows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between py-3.5 border-b border-border-faint"
              >
                <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-label">
                  {row.label}
                </span>
                <span
                  className={
                    row.mono
                      ? "font-mono text-[13px] text-primary"
                      : "text-[13px] text-primary"
                  }
                >
                  {row.value}
                </span>
              </div>
            ))}
            <div className="font-mono text-[9.5px] text-ghost pt-1.5">
              {activity
                ? "Live from Oura · yesterday's steps & active calories"
                : "Oura sync unavailable"}
            </div>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
