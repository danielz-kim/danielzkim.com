import ProjectCard from "@/components/ProjectCard";
import FadeIn from "@/components/FadeIn";
import projectsData from "@/content/projects.json";
import type { Project } from "@/lib/types";

export const metadata = {
  title: "Projects — Daniel Kim",
  description: "Things I built because I wanted them to exist.",
};

export default function ProjectsPage() {
  const projects = projectsData as Project[];

  return (
    <div className="pt-28 pb-24">
      <div className="max-w-grid mx-auto px-6">
        <FadeIn>
          <div className="mb-16">
            <h1 className="font-heading font-medium text-4xl text-primary mb-4">
              Projects
            </h1>
            <p className="text-lg text-secondary leading-relaxed">
              Things I built because I wanted them to exist.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.name} project={project} />
          ))}
        </div>
      </div>
    </div>
  );
}
