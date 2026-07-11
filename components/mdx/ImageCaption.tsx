import Image from "next/image";

interface Props {
  src: string;
  alt: string;
  caption?: string;
}

export default function ImageCaption({ src, alt, caption }: Props) {
  return (
    <figure className="my-8">
      <div className="relative w-full overflow-hidden rounded-lg border border-border">
        <Image
          src={src}
          alt={alt}
          width={900}
          height={500}
          className="w-full h-auto"
        />
      </div>
      {caption && (
        <figcaption className="mt-2 text-xs text-tertiary text-center">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
