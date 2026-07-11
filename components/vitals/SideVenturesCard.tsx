const ventures = [
  { name: "Hemi", meta: "Revenue numbers coming soon", active: true },
  { name: "NIA", meta: "Paused", active: false },
  { name: "Baux", meta: "$119k ARR · Archived", active: false },
];

export default function SideVenturesCard() {
  return (
    <div className="px-6 py-5 flex flex-col h-full">
      <span className="font-mono text-[10px] font-medium tracking-[0.14em] uppercase text-tertiary">
        Side Ventures
      </span>
      <div className="mt-2 flex flex-col flex-1 justify-center">
        {ventures.map((v) => (
          <div
            key={v.name}
            className="flex items-center gap-3 py-2 border-t border-border-faint"
          >
            <span
              className={
                v.active
                  ? "w-1.5 h-1.5 rounded-full bg-accent blink-dot shrink-0"
                  : "w-1.5 h-1.5 rounded-full bg-inactive shrink-0"
              }
            />
            <span
              className={
                v.active
                  ? "text-[13px] text-primary flex-1"
                  : "text-[13px] text-muted flex-1"
              }
            >
              {v.name}
            </span>
            <span className="font-mono text-[10.5px] text-label">
              {v.meta}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
