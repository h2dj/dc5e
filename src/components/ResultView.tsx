"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import JoinGroup from "@/components/JoinGroup";
import ResultCard from "@/components/ResultCard";
import ShareBox from "@/components/ShareBox";
import { elements, isElementId } from "@/lib/elements";
import { groupEnabled } from "@/lib/group";
import { relationTypes } from "@/lib/relations";
import { buildResult } from "@/lib/resultEngine";
import { absoluteUrl, resetSelections, resultPath } from "@/lib/storage";
import type { ElementId, RelationType } from "@/types/diagnosis";

function Flow({ ids }: { ids: ElementId[] }) {
  const labels = ["내 기운", "빌리고 싶은 힘", "공동체 역할"];
  return (
    <ol aria-label="세 오행 흐름" className="flex items-center justify-center gap-1.5 sm:gap-3">
      {ids.map((id, i) => {
        const e = elements[id];
        return (
          <li key={i} className="flex items-center gap-1.5 sm:gap-3">
            {i > 0 && (
              <span aria-hidden className="text-muted">
                →
              </span>
            )}
            <span className="flex flex-col items-center rounded-2xl bg-white px-3 py-2 shadow-sm ring-1 ring-line">
              <span className="text-[11px] text-muted">{labels[i]}</span>
              <span className="mt-0.5 text-lg font-bold" style={{ color: e.color }}>
                <span aria-hidden>{e.emoji} </span>
                {e.hanja}
              </span>
              <span className="text-xs">{e.name}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function Relation({ title, type, text }: { title: string; type: RelationType; text: string }) {
  const t = relationTypes[type];
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <p className="text-sm font-semibold text-muted">{title}</p>
      <p className="mt-2 font-bold">
        <span aria-hidden className="mr-1.5 inline-grid h-7 w-7 place-items-center rounded-full bg-brand-soft text-brand">
          {t.symbol}
        </span>
        {t.label}
      </p>
      <p className="mt-2 leading-relaxed text-ink/85">{text}</p>
    </div>
  );
}

export default function ResultView() {
  const params = useSearchParams();
  const router = useRouter();
  const a = params.get("a");
  const b = params.get("b");
  const c = params.get("c");
  const valid = isElementId(a) && isElementId(b) && isElementId(c);
  const result = useMemo(() => (valid ? buildResult(a, b, c) : null), [valid, a, b, c]);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    if (valid) setShareUrl(absoluteUrl(resultPath(a, b, c)));
  }, [valid, a, b, c]);

  if (!result || !valid) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center py-16 text-center">
        <p className="text-lg font-semibold">결과를 찾을 수 없어요.</p>
        <p className="mt-2 text-muted">링크가 잘렸거나 선택이 끝나지 않았을 수 있어요.</p>
        <Link href="/" className="mt-6 rounded-xl bg-brand px-6 py-3 font-semibold text-white">
          처음으로
        </Link>
      </main>
    );
  }

  return (
    <main className="space-y-5 py-2">
      <section className="text-center">
        <p className="text-sm font-semibold text-brand">나의 디지털 기운</p>
        <div className="mt-4">
          <Flow ids={[a, b, c]} />
        </div>
        <h1 className="mt-6 text-xl font-bold leading-relaxed sm:text-2xl">“{result.headline}”</h1>
        <p className="mt-3 inline-block rounded-full bg-brand-soft px-3 py-1 text-sm font-semibold text-brand">
          {result.pattern.id} · {result.pattern.name}
        </p>
      </section>

      <section aria-labelledby="h-areas" className="space-y-3">
        <h2 id="h-areas" className="sr-only">
          세 영역별 해석
        </h2>
        <ResultCard label="내 기운" element={elements[a]} {...result.self} />
        <ResultCard label="빌리고 싶은 힘" element={elements[b]} {...result.borrow} />
        <ResultCard label="공동체에서의 역할" element={elements[c]} {...result.community} />
      </section>

      <section aria-labelledby="h-rel" className="space-y-3">
        <h2 id="h-rel" className="pt-2 text-lg font-bold">
          세 힘의 관계
        </h2>
        <Relation title="내 기운 ↔ 빌리고 싶은 힘" {...result.relations.selfBorrow} />
        <Relation title="내 기운 ↔ 공동체 역할" {...result.relations.selfCommunity} />
        <div className="rounded-2xl border border-line bg-white p-5">
          <p className="text-sm font-semibold text-muted">세 값의 패턴</p>
          <p className="mt-2 font-bold">
            {result.pattern.name} <span className="font-normal text-muted">({result.pattern.condition})</span>
          </p>
          <p className="mt-2 leading-relaxed text-ink/85">{result.pattern.text}</p>
        </div>
      </section>

      <section className="rounded-2xl bg-brand p-5 text-white">
        <h2 className="text-sm font-semibold opacity-80">함께 나눠볼 질문</h2>
        <p className="mt-2 text-lg font-bold leading-relaxed">{result.reflectionQuestion}</p>
        <h2 className="mt-5 text-sm font-semibold opacity-80">이렇게 도움을 요청해보세요</h2>
        <p className="mt-2 text-lg font-bold leading-relaxed">“{result.askTemplate}”</p>
      </section>

      <p className="text-center text-xs leading-relaxed text-muted">
        이 결과는 음양오행을 디지털 활동에 빗댄 워크숍용 은유입니다. 성격이나 능력을 판정하지 않으며,
        <br className="hidden sm:inline" /> 지금 어떤 힘을 쓰고 있는지 이야기하기 위한 출발점이에요.
      </p>

      {shareUrl && <ShareBox url={shareUrl} title="나의 디지털 기운 읽기" />}

      {groupEnabled && <JoinGroup self={a} borrow={b} community={c} />}

      <button
        type="button"
        onClick={() => {
          resetSelections();
          router.push("/select/self/");
        }}
        className="w-full rounded-xl border border-line bg-white px-5 py-4 font-semibold"
      >
        처음부터 다시하기
      </button>
    </main>
  );
}
