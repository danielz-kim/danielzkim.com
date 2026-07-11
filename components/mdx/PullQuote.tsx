interface Props {
  children: React.ReactNode;
}

export default function PullQuote({ children }: Props) {
  return (
    <blockquote className="my-8 pl-5 border-l-2 border-border">
      <p className="font-heading font-medium text-xl text-primary italic leading-relaxed">
        {children}
      </p>
    </blockquote>
  );
}
