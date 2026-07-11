import { getAllWork } from "@/lib/mdx";
import CaseStudyCard from "@/components/CaseStudyCard";
import FadeIn from "@/components/FadeIn";

export const metadata = {
  title: "Work — Daniel Kim",
  description: "A collection of product and UX problems I've been paid to solve.",
};

export default function WorkPage() {
  const studies = getAllWork();

  return (
    <div className="pt-28 pb-24">
      <div className="max-w-grid mx-auto px-6">
        <FadeIn>
          <div className="mb-16">
            <h1 className="font-heading font-medium text-4xl text-primary mb-4">
              Work
            </h1>
            <p className="text-lg text-secondary leading-relaxed">
              A collection of product and UX problems I've been paid to solve.
            </p>
          </div>
        </FadeIn>

        <div>
          {studies.map((study) => (
            <CaseStudyCard key={study.slug} study={study} />
          ))}
        </div>
      </div>
    </div>
  );
}
