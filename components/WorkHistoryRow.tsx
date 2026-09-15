import Link from "next/link";
import { clsx } from "clsx";
import type { WorkHistoryEntry } from "@/lib/types";

interface Props {
  entry: WorkHistoryEntry;
}

export default function WorkHistoryRow({ entry }: Props) {
  const content = (
    <>
      <div className="flex flex-col gap-[7px]">
        <span className="font-semibold text-[15px] text-primary">
          {entry.company}
        </span>
        <span className="font-mono text-[10px] tracking-[0.1em] text-label">
          {entry.period}
        </span>
      </div>
      <div className="flex flex-col gap-2.5 max-w-[560px]">
        <div className="flex items-center gap-3 flex-wrap">
          <h3 className="font-medium text-[clamp(18px,1.9vw,23px)] leading-[1.18] tracking-[-0.02em] m-0 text-primary">
            {entry.role}
          </h3>
          {entry.showBadge && (
            <span
              className={clsx(
                "font-mono text-[10px] tracking-[0.1em] uppercase px-2.5 py-1 rounded-full",
                entry.badgeType === "dark"
                  ? "bg-primary text-white"
                  : "bg-card text-muted border border-[#dcdcdc]"
              )}
            >
              {entry.type}
            </span>
          )}
        </div>
        {entry.desc && (
          <p className="text-sm leading-[1.6] text-secondary m-0">
            {entry.desc}
          </p>
        )}
      </div>
      {entry.href && (
        <span className="flex items-center gap-1.5 font-mono text-[11px] tracking-[0.06em] uppercase text-primary whitespace-nowrap self-center">
          See Work <span className="text-[#c4c4c4]">→</span>
        </span>
      )}
    </>
  );

  const rowClass =
    "flex flex-col gap-3 md:grid md:grid-cols-[170px_1fr_auto] md:gap-8 items-start py-[30px] border-t border-border-light no-underline text-inherit";

  if (entry.href) {
    return (
      <Link href={entry.href} className={rowClass}>
        {content}
      </Link>
    );
  }

  return <div className={rowClass}>{content}</div>;
}
