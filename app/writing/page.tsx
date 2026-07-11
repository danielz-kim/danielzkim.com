import { getAllWriting } from "@/lib/mdx";
import WritingList from "@/components/WritingList";
import FadeIn from "@/components/FadeIn";

export const metadata = {
  title: "Writing — Daniel Kim",
  description:
    "Thinking out loud on neuroscience, product, human performance, and everything in between.",
};

export default function WritingPage() {
  const posts = getAllWriting();

  return (
    <div className="pt-28 pb-24">
      <div className="max-w-grid mx-auto px-6">
        <FadeIn>
          <div className="mb-16">
            <h1 className="font-heading font-medium text-4xl text-primary mb-4">
              Writing
            </h1>
            <p className="text-lg text-secondary leading-relaxed">
              Thinking out loud on neuroscience, product, human performance,
              and everything in between.
            </p>
          </div>
        </FadeIn>

        <WritingList posts={posts} />
      </div>
    </div>
  );
}
