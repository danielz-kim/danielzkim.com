import WorkHistoryRow from "@/components/WorkHistoryRow";
import workHistoryData from "@/content/work-history.json";
import type { WorkHistoryEntry } from "@/lib/types";

export default function WorkSection() {
  const workHistory = workHistoryData as WorkHistoryEntry[];

  return (
    <section id="work" className="px-6 md:px-10 pt-24 md:pt-[104px]">
      <div className="flex items-center gap-3.5 mb-6">
        <span className="font-mono text-[11px] font-medium tracking-[0.14em] text-accent">
          02
        </span>
        <span className="section-title">Work</span>
        <span className="flex-1 h-px bg-border" />
      </div>
      <div>
        {workHistory.map((entry) => (
          <WorkHistoryRow key={entry.company} entry={entry} />
        ))}
      </div>
      <div className="border-t border-border-light" />
    </section>
  );
}
