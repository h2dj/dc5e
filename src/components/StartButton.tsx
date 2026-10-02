"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { normalizeSessionId } from "@/lib/group";
import { loadState, resetSelections, updateState } from "@/lib/storage";

/** 시작하기. 워크숍 QR 링크(/?s=세션코드)로 들어오면 세션 코드를 기억해둔다. */
export default function StartButton() {
  const router = useRouter();
  const params = useSearchParams();
  const [sessionId, setSessionId] = useState<string | undefined>();

  useEffect(() => {
    const fromUrl = normalizeSessionId(params.get("s") ?? "");
    if (fromUrl) updateState({ sessionId: fromUrl });
    setSessionId(fromUrl ?? loadState().sessionId);
  }, [params]);

  return (
    <div className="mt-8">
      {sessionId && (
        <p className="mb-3 text-center text-sm text-muted">
          모임 코드 <span className="font-mono font-semibold text-ink">{sessionId}</span>
        </p>
      )}
      <button
        type="button"
        onClick={() => {
          resetSelections();
          router.push("/select/self/");
        }}
        className="w-full rounded-xl bg-brand px-5 py-4 text-lg font-semibold text-white shadow-sm transition active:scale-[0.99]"
      >
        시작하기
      </button>
    </div>
  );
}
