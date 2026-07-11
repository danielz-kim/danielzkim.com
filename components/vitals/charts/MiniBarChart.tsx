interface MiniBarChartProps {
  heights: number[];
  colors?: string[];
}

export default function MiniBarChart({ heights, colors }: MiniBarChartProps) {
  return (
    <div className="flex items-end gap-1.5 h-8">
      {heights.map((h, i) => (
        <span
          key={i}
          className="flex-1 rounded-[1px]"
          style={{
            height: `${h}%`,
            background: colors?.[i] ?? "#dcdcda",
          }}
        />
      ))}
    </div>
  );
}
