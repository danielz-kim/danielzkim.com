import { getAllWriting } from "@/lib/mdx";
import WritingList from "@/components/WritingList";

export default function WritingSection() {
  const posts = getAllWriting();

  return (
    <section id="signal" className="px-6 md:px-10 pt-24 md:pt-[104px]">
      <div className="flex items-center gap-3.5 mb-6">
        <span className="font-mono text-[11px] font-medium tracking-[0.14em] text-accent">
          06
        </span>
        <span className="section-title">Writing</span>
        <span className="flex-1 h-px bg-border" />
      </div>
      <WritingList posts={posts} />
      <div className="border-t border-border-light" />
    </section>
  );
}
