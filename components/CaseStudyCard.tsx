import Link from "next/link";
import type { CaseStudyMeta } from "@/lib/types";

interface Props {
  study: CaseStudyMeta;
  variant?: "grid" | "list";
}

export default function CaseStudyCard({ study, variant = "list" }: Props) {
  const year = new Date(study.date).getFullYear();

  if (variant === "grid") {
    return (
      <Link
        href={`/work/${study.slug}`}
        className="group block border border-border rounded-xl p-6 hover:shadow-sm transition-shadow"
      >
        <p className="label-meta text-tertiary mb-3">
          {study.company} · {year}
        </p>
        <h3 className="font-heading font-medium text-base text-primary group-hover:text-secondary transition-colors leading-snug mb-2">
          {study.title}
        </h3>
        <p className="text-sm text-secondary mb-4 leading-relaxed line-clamp-2">
          {study.subtitle}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {study.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="tag-pill">{tag}</span>
          ))}
          <span className="text-xs text-tertiary ml-auto">{study.readTime}</span>
        </div>
      </Link>
    );
  }

  return (
    <div className="py-8 border-b border-border-light last:border-b-0">
      <p className="label-meta text-tertiary mb-3">
        {study.company} · {year}
      </p>
      <Link href={`/work/${study.slug}`}>
        <h3 className="font-heading font-medium text-lg text-primary hover:text-secondary transition-colors leading-snug mb-2">
          {study.title}
        </h3>
      </Link>
      <p className="text-sm text-secondary mb-4 leading-relaxed">
        {study.subtitle}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {study.tags.map((tag) => (
          <span key={tag} className="tag-pill">{tag}</span>
        ))}
        <span className="text-xs text-tertiary ml-auto">{study.readTime}</span>
      </div>
    </div>
  );
}
