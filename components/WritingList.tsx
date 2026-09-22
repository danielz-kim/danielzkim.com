import Link from "next/link";
import type { WritingMeta } from "@/lib/types";

interface Props {
  posts: WritingMeta[];
}

function formatDate(dateStr: string): string {
  return new Date(dateStr)
    .toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();
}

export default function WritingList({ posts }: Props) {
  if (posts.length === 0) {
    return (
      <div className="border-[1.5px] border-dashed border-[#dcdcda] rounded-xl p-9 flex items-center justify-center">
        <span className="font-mono text-xs tracking-[0.04em] text-faint">
          Coming soon...
        </span>
      </div>
    );
  }

  return (
    <div>
      {posts.map((post) => (
        <Link
          key={post.slug}
          href={`/writing/${post.slug}`}
          className="flex items-baseline justify-between gap-6 py-[26px] border-t border-border-light no-underline text-inherit"
        >
          <span className="font-medium text-[clamp(17px,1.8vw,21px)] leading-[1.3] tracking-[-0.015em] text-primary">
            {post.title}
          </span>
          <span className="font-mono text-[11px] tracking-[0.06em] text-label whitespace-nowrap">
            {formatDate(post.date)}
          </span>
        </Link>
      ))}
    </div>
  );
}
