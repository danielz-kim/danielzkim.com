import ProgressBar from "./charts/ProgressBar";

export default function AcademicsCard() {
  return (
    <div className="px-[22px] py-6 flex flex-col h-full">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] font-medium tracking-[0.14em] uppercase text-tertiary">
          Academics
        </span>
        <span className="flex items-center gap-1.5 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-inactive" />
          <span className="font-mono text-[9px] tracking-[0.1em] text-faint">
            INACTIVE
          </span>
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <span className="font-mono text-[clamp(30px,3vw,36px)] tracking-[-0.02em] leading-none text-primary">
          24
        </span>
        <span className="font-mono text-[10px] font-medium tracking-[0.16em] uppercase text-tertiary mt-2.5">
          Units, One Semester
        </span>
      </div>

      <div>
        <ProgressBar percent={100} color="#bcbcba" />
        <div className="flex justify-between mt-[11px]">
          <span className="font-mono text-[9.5px] font-medium tracking-[0.12em] uppercase text-tertiary">
            All Grades
          </span>
          <span className="font-mono text-[10.5px] text-primary">
            A · A · A · A
          </span>
        </div>
      </div>
    </div>
  );
}
