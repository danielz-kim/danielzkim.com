const socials = [
  { name: "LinkedIn", meta: "100k+ impressions", active: true },
  { name: "TikTok", meta: "4M+ views", active: false },
];

export default function SocialsCard() {
  return (
    <div className="px-6 py-5 flex flex-col h-full">
      <span className="font-mono text-[10px] font-medium tracking-[0.14em] uppercase text-tertiary">
        Socials
      </span>
      <div className="mt-2 flex flex-col flex-1 justify-center">
        {socials.map((s) => (
          <div
            key={s.name}
            className="flex items-center gap-3 py-2 border-t border-border-faint"
          >
            <span
              className={
                s.active
                  ? "w-1.5 h-1.5 rounded-full bg-accent blink-dot shrink-0"
                  : "w-1.5 h-1.5 rounded-full bg-inactive shrink-0"
              }
            />
            <span
              className={
                s.active
                  ? "text-[13px] text-primary flex-1"
                  : "text-[13px] text-muted flex-1"
              }
            >
              {s.name}
            </span>
            <span className="font-mono text-[10.5px] text-label">
              {s.meta}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
