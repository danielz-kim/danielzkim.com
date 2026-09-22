import Link from "next/link";
import type { Project } from "@/lib/types";
import { clsx } from "clsx";

interface Props {
  project: Project;
}

const statusStyles: Record<Project["status"], string> = {
  profitable: "bg-primary text-white",
  live: "bg-card text-muted border border-[#dcdcdc]",
  active: "bg-card text-muted border border-[#dcdcdc]",
  "in development": "bg-card text-muted border border-dashed border-[#dcdcdc]",
  archived: "bg-card text-ghost border border-[#dcdcdc]",
};

const statusLabel: Record<Project["status"], string> = {
  profitable: "Profitable",
  live: "Live",
  active: "Active",
  "in development": "In Development",
  archived: "Archived",
};

export default function ProjectCard({ project }: Props) {
  const body = (
    <>
      <div className="flex items-center justify-between mb-auto">
        <span className="font-mono text-[11px] tracking-[0.04em] text-label">
          {project.kind}
        </span>
        <span
          className={clsx(
            "font-mono text-[10px] tracking-[0.12em] uppercase px-[11px] py-[5px] rounded-full",
            statusStyles[project.status]
          )}
        >
          {statusLabel[project.status]}
        </span>
      </div>

      <h3 className="font-semibold text-[clamp(24px,2.6vw,30px)] leading-[1.1] tracking-[-0.02em] text-primary mt-11 mb-0">
        {project.name}
      </h3>
      <p className="text-[14.5px] leading-[1.6] text-secondary mt-3.5 mb-0">
        {project.description}
      </p>
      {project.stat && (
        <div className="font-mono text-[12.5px] text-primary mt-[22px]">
          {project.stat}
        </div>
      )}
    </>
  );

  return (
    <div className="flex flex-col border border-border rounded-xl p-[34px] min-h-[280px] bg-card">
      {project.url ? (
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col flex-1 no-underline text-inherit"
        >
          {body}
        </a>
      ) : (
        <div className="flex flex-col flex-1">{body}</div>
      )}

      {project.caseStudy && (
        <div className="mt-5 pt-5 border-t border-border-light">
          <Link
            href={`/projects/${encodeURIComponent(project.name)}`}
            className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.06em] uppercase text-primary hover:text-secondary transition-colors no-underline"
          >
            See case study <span className="text-[#c4c4c4]">→</span>
          </Link>
        </div>
      )}
    </div>
  );
}
