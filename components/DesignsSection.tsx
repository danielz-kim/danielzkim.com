const tiles = [
  "col-span-2 row-span-2",
  "col-span-2",
  "col-span-1",
  "col-span-1",
  "col-span-2",
  "col-span-2",
  "col-span-2 row-span-2",
];

function PlaceholderTile() {
  return (
    <div className="w-full h-full rounded-xl border border-dashed border-[#dcdcda] bg-[#f6f6f4] flex flex-col items-center justify-center gap-1.5">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-ghost">
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M21 15l-5-5-9 9" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      <span className="font-mono text-xs text-faint">Drop a design shot</span>
    </div>
  );
}

export default function DesignsSection() {
  return (
    <section id="designs" className="px-6 md:px-10 pt-24 md:pt-[104px]">
      <div className="flex items-center gap-3.5 mb-6">
        <span className="font-mono text-[11px] font-medium tracking-[0.14em] text-accent">
          05
        </span>
        <span className="label-meta text-tertiary">Designs</span>
        <span className="flex-1 h-px bg-border" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[150px] gap-3.5">
        {tiles.map((span, i) => (
          <div key={i} className={span}>
            <PlaceholderTile />
          </div>
        ))}
      </div>
    </section>
  );
}
