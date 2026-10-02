import type { Element } from "@/types/diagnosis";

interface Props {
  element: Element;
  description: string;
  selected: boolean;
  onSelect: () => void;
}

export default function ElementCard({ element, description, selected, onSelect }: Props) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      style={{ borderColor: selected ? element.color : undefined, backgroundColor: selected ? `${element.color}14` : undefined }}
      className={`flex w-full items-center gap-4 rounded-2xl border-2 bg-white p-4 text-left transition active:scale-[0.99] ${
        selected ? "shadow-sm" : "border-line hover:border-muted/40"
      }`}
    >
      <span
        aria-hidden
        className="grid h-14 w-14 shrink-0 place-items-center rounded-xl text-2xl"
        style={{ backgroundColor: `${element.color}1f` }}
      >
        {element.emoji}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline gap-2">
          <span className="text-lg font-bold" style={{ color: element.color }}>
            {element.hanja}
          </span>
          <span className="font-semibold">{element.name}</span>
          <span className="sr-only">({element.korean})</span>
        </span>
        <span className="mt-1 block text-[15px] leading-snug text-muted">{description}</span>
      </span>
      <span
        aria-hidden
        className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 text-xs font-bold text-white ${
          selected ? "" : "border-line"
        }`}
        style={selected ? { backgroundColor: element.color, borderColor: element.color } : undefined}
      >
        {selected ? "✓" : ""}
      </span>
    </button>
  );
}
