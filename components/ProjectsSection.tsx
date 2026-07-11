import ProjectCard from "@/components/ProjectCard";
import FadeIn from "@/components/FadeIn";
import projectsData from "@/content/projects.json";
import type { Project } from "@/lib/types";

export default function ProjectsSection() {
  const projects = projectsData as Project[];

  return (
    <section
      id="experiments"
      className="px-6 md:px-10 pt-24 md:pt-[104px]"
    >
      <div className="flex items-center gap-3.5 mb-10">
        <span className="font-mono text-[11px] font-medium tracking-[0.14em] text-accent">
          04
        </span>
        <span className="label-meta text-tertiary">Projects</span>
        <span className="flex-1 h-px bg-border" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {projects.map((project, i) => (
          <FadeIn key={project.name} delay={i * 0.08}>
            <ProjectCard project={project} />
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
