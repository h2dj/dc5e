"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import GroupChart from "@/components/GroupChart";
import { MIN_GROUP_SIZE, fetchGroupSummary, groupEnabled, normalizeSessionId, summarizeGroup } from "@/lib/group";
import type { GroupSummary } from "@/lib/group";

const REFRESH_MS = 15000;

function SessionForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const id = normalizeSessionId(code);
        if (id) router.push(`/group/?s=${id}`);
      }}
      className="mt-6 flex gap-2"
    >
      <label htmlFor="group-code" className="sr-only">
        모임 코드
      </label>
      <input
        id="group-code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="모임 코드"
        autoCapitalize="none"
        spellCheck={false}
        className="min-w-0 flex-1 rounded-xl border border-line bg-white px-3 py-3 font-mono"
      />
      <button type="submit" className="rounded-xl bg-brand px-5 py-3 font-semibold text-white">
        보기
      </button>
    </form>
  );
}

export default function GroupView() {
  const params = useSearchParams();
  const sessionId = normalizeSessionId(params.get("s") ?? "");
  const [summary, setSummary] = useState<GroupSummary | null | undefined>(undefined);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!sessionId || !groupEnabled) return;
    try {
      setSummary(await fetchGroupSummary(sessionId));
      setError("");
    } catch {
      setError("모임 결과를 불러오지 못했어요. 잠시 후 다시 시도해주세요.");
    }
  }, [sessionId]);

  useEffect(() => {
    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => clearInterval(timer);
  }, [load]);

  if (!groupEnabled) {
    return (
      <main className="py-16 text-center">
        <h1 className="text-xl font-bold">모임 결과 기능이 꺼져 있어요</h1>
        <p className="mt-2 text-muted">
          운영자가 Supabase 설정(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)을 넣으면 사용할 수 있어요.
        </p>
        <Link href="/" className="mt-6 inline-block rounded-xl bg-brand px-6 py-3 font-semibold text-white">
          처음으로
        </Link>
      </main>
    );
  }

  if (!sessionId) {
    return (
      <main className="py-10">
        <h1 className="text-2xl font-bold">모임 전체 기운 지도</h1>
        <p className="mt-2 text-muted">진행자에게 받은 모임 코드를 입력하세요.</p>
        <SessionForm />
      </main>
    );
  }

  const shareStart = typeof window !== "undefined" ? `${window.location.origin}/?s=${sessionId}` : "";

  return (
    <main className="space-y-5 py-2">
      <section>
        <p className="text-sm font-semibold text-brand">모임 전체 기운 지도</p>
        <h1 className="mt-1 text-2xl font-bold">{summary?.title ?? sessionId}</h1>
        <p className="mt-1 font-mono text-xs text-muted">{sessionId}</p>
      </section>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800">
          {error}
        </p>
      )}

      {summary === undefined && !error && <p className="py-10 text-center text-muted">불러오는 중…</p>}

      {summary === null && (
        <div className="rounded-2xl border border-line bg-white p-5">
          <p className="font-bold">모임을 찾을 수 없어요.</p>
          <p className="mt-1 text-sm text-muted">모임 코드를 다시 확인해주세요.</p>
          <SessionForm />
        </div>
      )}

      {summary && (
        <>
          <p className="text-sm text-muted">
            지금까지 <span className="font-bold text-ink">{summary.total}명</span>이 익명으로 참여했어요
            {summary.isOpen ? " · 15초마다 새로고침" : " · 마감된 모임"}
          </p>

          {summary.distributions ? (
            <>
              <section className="rounded-2xl bg-brand p-5 text-white">
                <h2 className="text-sm font-semibold opacity-80">우리 모임 이야기</h2>
                <div className="mt-2 space-y-2 leading-relaxed">
                  {summarizeGroup(summary.distributions).map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </section>
              <GroupChart
                title="우리 모임이 가진 힘"
                description="혼자 있을 때 자연스럽게 쓰는 디지털 힘"
                data={summary.distributions.self}
              />
              <GroupChart
                title="우리 모임이 빌리고 싶은 힘"
                description="배우거나 도움받고 싶은 힘"
                data={summary.distributions.borrow}
              />
              <GroupChart
                title="공동체에서 실제로 쓰이는 힘"
                description="모임 안에서 자주 맡는 역할"
                data={summary.distributions.community}
              />
            </>
          ) : (
            <div className="rounded-2xl border border-line bg-white p-5 text-center">
              <p className="font-bold">{MIN_GROUP_SIZE}명 이상 모이면 기운 지도가 나타나요</p>
              <p className="mt-1 text-sm text-muted">적은 인원에서 개인 응답이 드러나지 않도록 기다리는 중이에요.</p>
            </div>
          )}

          {summary.isOpen && shareStart && (
            <p className="text-center text-sm text-muted">
              참여 링크: <span className="break-all font-mono">{shareStart}</span>
            </p>
          )}
        </>
      )}

      <Link href="/" className="block rounded-xl border border-line bg-white px-5 py-4 text-center font-semibold">
        나도 해보기
      </Link>
    </main>
  );
}
