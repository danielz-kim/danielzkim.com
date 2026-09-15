import VitalCard from "./VitalCard";
import ChessEloCard from "./ChessEloCard";
import EducationCard from "./EducationCard";
import NightfallCard from "./NightfallCard";
import SocialsCard from "./SocialsCard";
import SomneeCard from "./SomneeCard";
import LekkoCard from "./LekkoCard";
import ClashRoyaleCard from "./ClashRoyaleCard";
import AcademicsCard from "./AcademicsCard";

export default function VitalsSection() {
  return (
    <section id="vitals" className="px-6 md:px-10 pt-24 md:pt-[104px]">
      <div className="flex items-center gap-3.5 mb-7">
        <span className="font-mono text-[11px] font-medium tracking-[0.14em] text-accent">
          01
        </span>
        <span className="section-title">Vitals</span>
        <span className="flex-1 h-px bg-border" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[174px] gap-3.5">
        <VitalCard index={0} className="col-span-2 row-span-2">
          <ChessEloCard />
        </VitalCard>
        <VitalCard index={1} className="col-span-2 row-span-2">
          <EducationCard />
        </VitalCard>
        <VitalCard index={2} className="col-span-1">
          <NightfallCard />
        </VitalCard>
        <VitalCard index={3} className="col-span-1">
          <SocialsCard />
        </VitalCard>
        <VitalCard index={4} className="col-span-2">
          <SomneeCard />
        </VitalCard>
        <VitalCard index={5} className="col-span-2 row-span-2">
          <LekkoCard />
        </VitalCard>
        <VitalCard index={6} className="col-span-1 row-span-2">
          <ClashRoyaleCard />
        </VitalCard>
        <VitalCard index={7} className="col-span-1 row-span-2">
          <AcademicsCard />
        </VitalCard>
      </div>
    </section>
  );
}
