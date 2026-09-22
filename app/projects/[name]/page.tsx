import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { mdxComponents } from "@/components/mdx";
import FadeIn from "@/components/FadeIn";
import projectsData from "@/content/projects.json";
import type { Project } from "@/lib/types";

interface Props {
  params: { name: string };
}

function getProject(name: string): Project | undefined {
  return (projectsData as Project[]).find((p) => p.name === name);
}

export async function generateStaticParams() {
  return (projectsData as Project[])
    .filter((p) => p.caseStudy)
    .map((p) => ({ name: p.name }));
}

export async function generateMetadata({ params }: Props) {
  const project = getProject(decodeURIComponent(params.name));
  if (!project) return { title: "Not Found" };
  return {
    title: `${project.name} — Daniel Kim`,
    description: project.description,
  };
}

export default function ProjectCaseStudyPage({ params }: Props) {
  const project = getProject(decodeURIComponent(params.name));
  if (!project || !project.caseStudy) notFound();

  return (
    <div className="pt-28 pb-24">
      <article className="max-w-prose mx-auto px-6">
        <FadeIn>
          <header className="mb-16">
            <p className="label-meta text-tertiary mb-5">{project.kind}</p>
            <h1 className="font-heading font-medium text-3xl md:text-4xl text-primary leading-tight mb-5">
              {project.name}
            </h1>
            <p className="text-lg text-secondary leading-relaxed mb-6">
              {project.description}
            </p>
            {project.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span key={tag} className="tag-pill">{tag}</span>
                ))}
              </div>
            )}
          </header>
        </FadeIn>

        <div className="prose prose-neutral max-w-none [&_p]:text-base [&_p]:leading-[1.7] [&_p]:text-secondary [&_h2]:font-heading [&_h2]:font-normal [&_h2]:text-primary [&_h3]:font-heading [&_h3]:font-normal [&_h3]:text-primary [&_strong]:text-primary [&_strong]:font-medium">
          <MDXRemote source={project.caseStudy} components={mdxComponents as any} />
        </div>

        <div className="mt-16 pt-8 border-t border-border-light flex items-center justify-between">
          <Link href="/projects" className="text-sm text-secondary hover:text-primary transition-colors">
            ← Back to projects
          </Link>
          {project.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-secondary hover:text-primary transition-colors"
            >
              Visit project →
            </a>
          )}
        </div>
      </article>
    </div>
  );
}
