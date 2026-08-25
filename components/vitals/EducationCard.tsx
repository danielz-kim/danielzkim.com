import ProgressBar from "./charts/ProgressBar";

const roadmap = [
  { label: "Ph.D., TBD", meta: "Someday", state: "someday" },
  {
    label: "M.S. Computer Science, HCI",
    meta: "Georgia Tech · Now",
    state: "now",
  },
  { label: "Data Science Minor", meta: "Berkeley · Done", state: "done" },
  { label: "B.A. Cognitive Science", meta: "Berkeley · Done", state: "done" },
] as const;

export default function EducationCard() {
  return (
    <div className="p-7 py-[28px] px-[30px] flex flex-col h-full">
      <div className="flex items-center justify-between">
        <span className="label-meta text-tertiary">Education</span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-accent blink-dot" />
          <span className="font-mono text-[10px] tracking-[0.1em] text-accent">
            ACTIVE
          </span>
        </span>
      </div>

      <div className="flex items-baseline gap-2.5 mt-3.5">
        <span className="font-mono text-[clamp(30px,3.2vw,38px)] tracking-[-0.02em] leading-none text-primary">
          3
        </span>
        <span className="font-mono text-[11px] font-medium tracking-[0.1em] uppercase text-tertiary">
          of 4, toward a Ph.D.
        </span>
      </div>

      <div className="mt-4">
        <ProgressBar percent={62.5} />
      </div>

      <div className="mt-4 flex flex-col flex-1">
        {roadmap.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 py-[9px] border-t border-border-faint"
          >
            {item.state === "done" && (
              <span className="w-[7px] h-[7px] rounded-full bg-accent shrink-0" />
            )}
            {item.state === "now" && (
              <span className="w-[7px] h-[7px] rounded-full border-[1.5px] border-accent bg-card shrink-0 blink-dot" />
            )}
            {item.state === "someday" && (
              <span className="w-[7px] h-[7px] rounded-full border-[1.5px] border-dashed border-ghost shrink-0" />
            )}
            <span
              className={
                item.state === "someday"
                  ? "text-[13px] text-label flex-1"
                  : "text-[13px] text-primary flex-1"
              }
            >
              {item.label}
            </span>
            <span
              className="font-mono text-[10.5px]"
              style={{
                color:
                  item.state === "now"
                    ? "var(--accent)"
                    : item.state === "someday"
                      ? "#c4c4c2"
                      : "#a8a8a8",
              }}
            >
              {item.meta}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
