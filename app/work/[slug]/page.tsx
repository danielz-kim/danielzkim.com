import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllWork, getWorkBySlug } from "@/lib/mdx";
import { mdxComponents } from "@/components/mdx";
import FadeIn from "@/components/FadeIn";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return getAllWork().map((study) => ({ slug: study.slug }));
}

export async function generateMetadata({ params }: Props) {
  try {
    const { meta } = getWorkBySlug(params.slug);
    return {
      title: `${meta.company} — Daniel Kim`,
      description: meta.subtitle,
    };
  } catch {
    return { title: "Not Found" };
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export default function CaseStudyPage({ params }: Props) {
  let meta, content;
  try {
    ({ meta, content } = getWorkBySlug(params.slug));
  } catch {
    notFound();
  }

  return (
    <div className="pt-28 pb-24">
      <article className="max-w-prose mx-auto px-6">
        <FadeIn>
          <header className="mb-16">
            <p className="label-meta text-tertiary mb-5">
              {meta.company} · {formatDate(meta.date)} · {meta.readTime}
            </p>
            <h1 className="font-heading font-medium text-3xl md:text-4xl text-primary leading-tight mb-5">
              {meta.title}
            </h1>
            <p className="text-lg text-secondary leading-relaxed mb-6">
              {meta.subtitle}
            </p>
            <div className="flex flex-wrap gap-2">
              {meta.tags.map((tag) => (
                <span key={tag} className="tag-pill">{tag}</span>
              ))}
            </div>
          </header>
        </FadeIn>

        <div className="prose prose-neutral max-w-none [&_p]:text-base [&_p]:leading-[1.7] [&_p]:text-secondary [&_h2]:font-heading [&_h2]:font-normal [&_h2]:text-primary [&_h3]:font-heading [&_h3]:font-normal [&_h3]:text-primary [&_strong]:text-primary [&_strong]:font-medium">
          <MDXRemote source={content} components={mdxComponents as any} />
        </div>

        <div className="mt-16 pt-8 border-t border-border-light">
          <div className="mb-8">
            <p className="label-meta text-tertiary mb-4">Skills</p>
            <div className="flex flex-wrap gap-2">
              {meta.tags.map((tag) => (
                <span key={tag} className="tag-pill">{tag}</span>
              ))}
            </div>
          </div>
          <Link href="/work" className="text-sm text-secondary hover:text-primary transition-colors">
            ← Back to work
          </Link>
        </div>
      </article>
    </div>
  );
}
