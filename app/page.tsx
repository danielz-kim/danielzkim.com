import Hero from "@/components/Hero";
import VitalsSection from "@/components/vitals/VitalsSection";
import WorkSection from "@/components/WorkSection";
import AboutSection from "@/components/AboutSection";
import ProjectsSection from "@/components/ProjectsSection";
import DesignsSection from "@/components/DesignsSection";
import PlaySection from "@/components/PlaySection";
import WritingSection from "@/components/WritingSection";
import ReadingSection from "@/components/ReadingSection";

export default function HomePage() {
  return (
    <div className="pb-8 overflow-x-hidden">
      <Hero />
      <VitalsSection />
      <WorkSection />
      <AboutSection />
      <ProjectsSection />
      <DesignsSection />
      <PlaySection />
      <WritingSection />
      <ReadingSection />
    </div>
  );
}
