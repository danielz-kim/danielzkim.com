import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllWriting, getWritingBySlug } from "@/lib/mdx";
import { mdxComponents } from "@/components/mdx";
import FadeIn from "@/components/FadeIn";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return getAllWriting().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props) {
  try {
    const { meta } = getWritingBySlug(params.slug);
    return {
      title: `${meta.title} — Daniel Kim`,
      description: meta.excerpt,
    };
  } catch {
    return { title: "Not Found" };
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function WritingPost({ params }: Props) {
  let meta, content;
  try {
    ({ meta, content } = getWritingBySlug(params.slug));
  } catch {
    notFound();
  }

  return (
    <div className="pt-28 pb-24">
      <article className="max-w-prose mx-auto px-6">
        <FadeIn>
          <header className="mb-16">
            <h1 className="font-heading font-medium text-3xl md:text-4xl text-primary leading-tight mb-5">
              {meta.title}
            </h1>
            <p className="label-meta text-tertiary">
              {formatDate(meta.date)} · {meta.readTime}
            </p>
          </header>
        </FadeIn>

        <div className="prose prose-neutral max-w-none [&_p]:text-base [&_p]:leading-[1.8] [&_p]:text-secondary [&_h2]:font-heading [&_h2]:font-normal [&_h2]:text-primary [&_h2]:mt-12 [&_h3]:font-heading [&_h3]:font-normal [&_h3]:text-primary [&_strong]:text-primary [&_strong]:font-medium [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-5 [&_blockquote]:text-secondary [&_blockquote]:not-italic">
          <MDXRemote source={content} components={mdxComponents as any} />
        </div>

        <div className="mt-16 pt-8 border-t border-border-light">
          <Link href="/writing" className="text-sm text-secondary hover:text-primary transition-colors">
            ← Back to writing
          </Link>
        </div>
      </article>
    </div>
  );
}
