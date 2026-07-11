import Image from "next/image";

interface Props {
  before: string;
  after: string;
  label?: string;
}

export default function BeforeAfter({ before, after, label }: Props) {
  return (
    <div className="my-8">
      {label && (
        <p className="text-xs uppercase tracking-widest text-tertiary mb-3">
          {label}
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-tertiary mb-2">Before</p>
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border">
            <Image src={before} alt="Before" fill className="object-cover" />
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-tertiary mb-2">After</p>
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border">
            <Image src={after} alt="After" fill className="object-cover" />
          </div>
        </div>
      </div>
    </div>
  );
}
