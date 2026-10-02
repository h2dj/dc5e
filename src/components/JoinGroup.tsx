"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { addResponse, normalizeSessionId } from "@/lib/group";
import { loadState, updateState } from "@/lib/storage";
import type { ElementId } from "@/types/diagnosis";

const SENT_KEY = "digital-giun:sent";

function sentKey(sessionId: string, a: string, b: string, c: string) {
  return `${sessionId}:${a}-${b}-${c}`;
}

function wasSent(key: string): boolean {
  try {
    return (JSON.parse(window.localStorage.getItem(SENT_KEY) ?? "[]") as string[]).includes(key);
  } catch {
    return false;
  }
}

function markSent(key: string) {
  try {
    const list = JSON.parse(window.localStorage.getItem(SENT_KEY) ?? "[]") as string[];
    window.localStorage.setItem(SENT_KEY, JSON.stringify([...list, key].slice(-50)));
  } catch {
    // 무시
  }
}

/** [선택] 우리 모임 결과에 익명으로 추가. 세 오행 값만 전송한다. */
export default function JoinGroup({ self, borrow, community }: { self: ElementId; borrow: ElementId; community: ElementId }) {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const [joined, setJoined] = useState<string | null>(null);

  useEffect(() => {
    const saved = loadState().sessionId;
    if (saved) {
      setCode(saved);
      if (wasSent(sentKey(saved, self, borrow, community))) {
        setJoined(saved);
        setStatus("done");
      }
    }
  }, [self, borrow, community]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const id = normalizeSessionId(code);
    if (!id) {
      setStatus("error");
      setMessage("모임 코드는 영문 소문자·숫자·하이픈으로 3자 이상이에요.");
      return;
    }
    setStatus("sending");
    try {
      await addResponse(id, self, borrow, community);
      updateState({ sessionId: id });
      markSent(sentKey(id, self, borrow, community));
      setJoined(id);
      setStatus("done");
    } catch {
      setStatus("error");
      setMessage("추가하지 못했어요. 모임 코드가 맞는지, 모임이 아직 열려 있는지 확인해주세요.");
    }
  }

  if (status === "done" && joined) {
    return (
      <div className="rounded-2xl border border-line bg-white p-5">
        <p className="font-bold">우리 모임 결과에 추가했어요 ✓</p>
        <p className="mt-1 text-sm text-muted">이름 없이 세 오행 값만 저장되었어요.</p>
        <Link
          href={`/group/?s=${joined}`}
          className="mt-4 block rounded-xl bg-brand px-4 py-3 text-center font-semibold text-white"
        >
          모임 전체 기운 지도 보기
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-line bg-white p-5">
      <h3 className="font-bold">[선택] 우리 모임에 추가</h3>
      <p className="mt-1 text-sm text-muted">
        이름·연락처 없이 세 오행 값만 익명으로 더해져 모임 전체 기운 지도에 반영돼요.
      </p>
      <label htmlFor="session-code" className="mt-4 block text-sm font-semibold">
        모임 코드
      </label>
      <div className="mt-1.5 flex gap-2">
        <input
          id="session-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="예: bingo-seoul-20261002"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          className="min-w-0 flex-1 rounded-xl border border-line px-3 py-3 font-mono text-sm"
        />
        <button
          type="submit"
          disabled={status === "sending" || !code.trim()}
          className="rounded-xl bg-brand px-4 py-3 font-semibold text-white disabled:opacity-40"
        >
          {status === "sending" ? "추가 중…" : "추가"}
        </button>
      </div>
      {status === "error" && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {message}
        </p>
      )}
    </form>
  );
}
