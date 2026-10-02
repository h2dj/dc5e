import { Suspense } from "react";
import Brand from "@/components/Brand";
import StartButton from "@/components/StartButton";
import { ELEMENT_ORDER, elements } from "@/lib/elements";

export default function HomePage() {
  return (
    <>
      <Brand />
      <main className="flex flex-1 flex-col justify-center py-6">
        <p className="text-sm font-semibold tracking-wide text-brand">공동체IT 디지털 워크숍</p>
        <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">나의 디지털 기운 읽기</h1>
        <p className="mt-4 text-lg leading-relaxed">
          내가 가진 힘, 빌리고 싶은 힘, 공동체에서 쓰고 있는 힘을 찾아봅니다.
        </p>

        <ul aria-label="다섯 가지 디지털 힘" className="mt-8 grid grid-cols-5 gap-2">
          {ELEMENT_ORDER.map((id) => {
            const e = elements[id];
            return (
              <li
                key={id}
                className="flex flex-col items-center rounded-2xl border border-line bg-white px-1 py-3 text-center"
              >
                <span aria-hidden className="text-2xl">
                  {e.emoji}
                </span>
                <span className="mt-1 text-lg font-bold" style={{ color: e.color }}>
                  {e.hanja}
                </span>
                <span className="text-[11px] leading-tight text-muted sm:text-xs">{e.name}</span>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 rounded-2xl bg-brand-soft p-4 text-[15px] leading-relaxed text-brand">
          <p className="font-semibold">안내</p>
          <p className="mt-1">
            음양오행을 디지털 활동에 빗대어 보는 가벼운 워크숍입니다. 성격이나 능력을 판정하는 검사가 아닙니다.
          </p>
          <p className="mt-2 text-sm opacity-80">
            세 가지 질문에 하나씩 고르면 끝나요(약 3분). 선택한 내용은 이 기기에만 저장되고 외부로 전송되지 않습니다.
          </p>
        </div>

        <Suspense fallback={null}>
          <StartButton />
        </Suspense>
      </main>
    </>
  );
}
