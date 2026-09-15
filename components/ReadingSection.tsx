import readingData from "@/content/reading.json";
import type { Book } from "@/lib/types";
import FadeIn from "@/components/FadeIn";
import ReadingTable from "@/components/ReadingTable";

const statusLabel: Record<Book["status"], string> = {
  "in-progress": "Currently reading",
  finished: "Finished",
  wishlist: "Want to read",
};

const statusOrder: Book["status"][] = ["in-progress", "finished", "wishlist"];

export default function ReadingSection() {
  const books = (readingData as Book[]).slice();

  const grouped = statusOrder
    .map((status) => ({
      status,
      books: books.filter((b) => b.status === status),
    }))
    .filter((g) => g.books.length > 0);

  return (
    <section id="reading" className="px-6 md:px-10 pt-24 md:pt-[104px]">
      <div className="flex items-center gap-3.5 mb-6">
        <span className="font-mono text-[11px] font-medium tracking-[0.14em] text-accent">
          07
        </span>
        <span className="section-title">Reading</span>
        <span className="flex-1 h-px bg-border" />
      </div>

      {grouped.length === 0 ? (
        <div className="border-[1.5px] border-dashed border-[#dcdcda] rounded-xl p-9 flex items-center justify-center">
          <span className="font-mono text-xs tracking-[0.04em] text-faint">
            What I&apos;m reading, and my notes on it — coming soon
          </span>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map((group, gi) => (
            <FadeIn key={group.status} delay={gi * 0.05}>
              <div>
                <p className="label-meta text-tertiary mb-2">
                  {statusLabel[group.status]}
                </p>
                <ReadingTable books={group.books} />
              </div>
            </FadeIn>
          ))}
        </div>
      )}
    </section>
  );
}
