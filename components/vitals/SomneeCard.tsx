export default function SomneeCard() {
  return (
    <div className="px-[26px] py-6 flex flex-col h-full">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10.5px] font-medium tracking-[0.14em] uppercase text-tertiary">
          Somnee
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-inactive" />
          <span className="font-mono text-[9.5px] tracking-[0.1em] text-faint">
            INACTIVE
          </span>
        </span>
      </div>
      <span className="font-semibold text-[19px] tracking-[-0.01em] text-primary mt-3.5">
        1st Product Hire
      </span>
      <div className="mt-auto flex items-baseline justify-between pt-3.5">
        <span className="text-[12.5px] text-muted">
          Partnerships: NFL, NBA
        </span>
        <span className="font-mono text-xs text-primary">6-fig MRR</span>
      </div>
    </div>
  );
}
