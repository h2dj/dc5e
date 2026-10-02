const STEPS = ["내 기운", "빌리고 싶은 힘", "공동체 역할"];

export default function ProgressBar({ step }: { step: 1 | 2 | 3 }) {
  return (
    <nav aria-label={`진행 단계 ${step} / 3`} className="mb-6">
      <ol className="grid grid-cols-3 gap-2">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const state = n < step ? "done" : n === step ? "current" : "todo";
          return (
            <li key={label} aria-current={state === "current" ? "step" : undefined}>
              <div
                className={`h-1.5 rounded-full ${state === "todo" ? "bg-line" : "bg-brand"} ${
                  state === "done" ? "opacity-50" : ""
                }`}
              />
              <p className={`mt-1.5 text-xs ${state === "current" ? "font-semibold text-brand" : "text-muted"}`}>
                {n}. {label}
              </p>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
