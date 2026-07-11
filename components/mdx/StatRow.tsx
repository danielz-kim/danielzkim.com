interface Props {
  children?: React.ReactNode;
}

interface StatProps {
  value: string;
  label: string;
}

function Stat({ value, label }: StatProps) {
  return (
    <div>
      <p className="font-mono text-2xl text-primary">{value}</p>
      <p className="text-xs text-secondary mt-0.5">{label}</p>
    </div>
  );
}

export default function StatRow({ children }: Props) {
  return (
    <div className="my-8 flex flex-wrap gap-8">{children}</div>
  );
}

StatRow.Stat = Stat;
