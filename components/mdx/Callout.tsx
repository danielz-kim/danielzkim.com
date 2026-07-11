interface Props {
  children: React.ReactNode;
  label?: string;
}

export default function Callout({ children, label = "TL;DR" }: Props) {
  return (
    <div className="my-8 bg-background border border-border rounded-lg px-6 py-5">
      <p className="text-xs uppercase tracking-widest text-tertiary mb-3">{label}</p>
      <div className="text-sm text-secondary leading-relaxed [&>p]:mb-0">{children}</div>
    </div>
  );
}
