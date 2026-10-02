"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Brand from "@/components/Brand";
import ElementCard from "@/components/ElementCard";
import ProgressBar from "@/components/ProgressBar";
import { ELEMENT_ORDER, elements } from "@/lib/elements";
import { loadState, resultPath, updateState } from "@/lib/storage";
import type { DiagnosisState, ElementId, Slot } from "@/types/diagnosis";

const COPY: Record<Slot, { step: 1 | 2 | 3; question: string; helper: string; prev: string; next: (s: DiagnosisState) => string | null }> = {
  self: {
    step: 1,
    question: "나는 디지털 도구를 쓸 때 어떤 행동을 자연스럽게 하나요?",
    helper: "잘하는 것을 고르기보다 일이 생겼을 때 내가 먼저 하게 되는 행동을 골라주세요.",
    prev: "/",
    next: () => "/select/borrow/",
  },
  borrow: {
    step: 2,
    question: "지금 다른 사람에게 빌리고 싶은 힘은 무엇인가요?",
    helper: "“이걸 잘하는 사람이 옆에 있으면 좋겠다”고 생각되는 것을 골라주세요.",
    prev: "/select/self/",
    next: () => "/select/community/",
  },
  community: {
    step: 3,
    question: "다른 사람들과 함께 있을 때 나는 어떤 역할을 하나요?",
    helper: "내가 원래 잘하는 것보다 실제로 모임에서 자주 하게 되는 일을 생각해보세요.",
    prev: "/select/borrow/",
    next: (s) => (s.self && s.borrow && s.community ? resultPath(s.self, s.borrow, s.community) : null),
  },
};

export default function ElementSelector({ slot }: { slot: Slot }) {
  const router = useRouter();
  const copy = COPY[slot];
  const [selected, setSelected] = useState<ElementId | undefined>();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const state = loadState();
    // 앞 단계 선택이 없으면 그 단계로 돌려보낸다.
    if (slot !== "self" && !state.self) return router.replace("/select/self/");
    if (slot === "community" && !state.borrow) return router.replace("/select/borrow/");
    setSelected(state[slot]);
    setReady(true);
  }, [slot, router]);

  function choose(id: ElementId) {
    setSelected(id);
    updateState({ [slot]: id });
  }

  function goNext() {
    const target = copy.next(loadState());
    if (target) router.push(target);
  }

  return (
    <>
      <Brand />
      <main className="flex flex-1 flex-col">
        <ProgressBar step={copy.step} />
        <h1 id={`q-${slot}`} className="text-xl font-bold leading-snug sm:text-2xl">
          {copy.question}
        </h1>
        <p className="mt-2 text-[15px] text-muted">{copy.helper}</p>

        <div role="radiogroup" aria-labelledby={`q-${slot}`} className={`mt-6 space-y-3 ${ready ? "" : "opacity-0"}`}>
          {ELEMENT_ORDER.map((id) => (
            <ElementCard
              key={id}
              element={elements[id]}
              description={elements[id].card[slot]}
              selected={selected === id}
              onSelect={() => choose(id)}
            />
          ))}
        </div>

        <div className="sticky bottom-0 mt-6 flex gap-3 bg-gradient-to-t from-paper via-paper to-transparent pt-4 pb-2">
          <button
            type="button"
            onClick={() => router.push(copy.prev)}
            className="rounded-xl border border-line bg-white px-5 py-3.5 font-semibold text-muted"
          >
            이전
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={!selected}
            className="flex-1 rounded-xl bg-brand px-5 py-3.5 font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-40"
          >
            {slot === "community" ? "결과 보기" : "다음"}
          </button>
        </div>
      </main>
    </>
  );
}
