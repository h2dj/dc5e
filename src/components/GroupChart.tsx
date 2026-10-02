import { ELEMENT_ORDER, elements } from "@/lib/elements";
import type { Distribution } from "@/lib/group";

/** 오행 분포 막대그래프. 색상만으로 구분하지 않도록 아이콘·한자·이름·숫자를 함께 표시한다. */
export default function GroupChart({ title, description, data }: { title: string; description: string; data: Distribution }) {
  const total = ELEMENT_ORDER.reduce((sum, id) => sum + data[id], 0);
  const max = Math.max(1, ...ELEMENT_ORDER.map((id) => data[id]));
  return (
    <figure className="rounded-2xl border border-line bg-white p-5">
      <figcaption>
        <p className="font-bold">{title}</p>
        <p className="mt-0.5 text-sm text-muted">{description}</p>
      </figcaption>
      <ul className="mt-4 space-y-2.5">
        {ELEMENT_ORDER.map((id) => {
          const e = elements[id];
          const n = data[id];
          const pct = total ? Math.round((n / total) * 100) : 0;
          return (
            <li key={id} className="grid grid-cols-[6.5rem_1fr_3.5rem] items-center gap-2 text-sm">
              <span className="truncate">
                <span aria-hidden>{e.emoji} </span>
                <span className="font-bold" style={{ color: e.color }}>
                  {e.hanja}
                </span>{" "}
                {e.name}
              </span>
              <span className="h-5 overflow-hidden rounded-md bg-paper" aria-hidden>
                <span
                  className="block h-full rounded-md transition-[width] duration-500"
                  style={{ width: `${(n / max) * 100}%`, backgroundColor: e.color }}
                />
              </span>
              <span className="text-right tabular-nums">
                {n}명 <span className="text-xs text-muted">{pct}%</span>
              </span>
            </li>
          );
        })}
      </ul>
    </figure>
  );
}
