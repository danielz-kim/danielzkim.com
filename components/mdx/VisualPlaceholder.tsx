interface Props {
  label: string;
  aspectRatio?: string;
}

export default function VisualPlaceholder({
  label,
  aspectRatio = "aspect-video",
}: Props) {
  return (
    <div
      className={`my-8 ${aspectRatio} w-full bg-background border border-dashed border-[#dcdcdc] rounded-lg flex items-center justify-center`}
    >
      <p className="text-sm text-tertiary">{label}</p>
    </div>
  );
}
