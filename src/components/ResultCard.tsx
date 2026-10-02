import type { Element } from "@/types/diagnosis";

interface Props {
  label: string;
  element: Element;
  title: string;
  text: string;
}

export default function ResultCard({ label, element, title, text }: Props) {
  return (
    <article className="rounded-2xl border border-line bg-white p-5" style={{ borderTop: `4px solid ${element.color}` }}>
      <p className="text-sm font-semibold text-muted">{label}</p>
      <p className="mt-2 flex items-center gap-2">
        <span aria-hidden className="text-xl">
          {element.emoji}
        </span>
        <span className="font-bold" style={{ color: element.color }}>
          {element.hanja}
        </span>
        <span className="font-semibold">{element.name}</span>
      </p>
      <h3 className="mt-3 text-lg font-bold">{title}</h3>
      <p className="mt-1.5 leading-relaxed text-ink/85">{text}</p>
    </article>
  );
}
