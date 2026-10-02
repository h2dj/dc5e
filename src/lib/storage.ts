import { isElementId } from "@/lib/elements";
import type { DiagnosisState } from "@/types/diagnosis";

// 개인 결과는 이 브라우저의 localStorage 에만 저장한다(외부 전송 없음).
const KEY = "digital-giun:state";

export function loadState(): DiagnosisState {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const state: DiagnosisState = {};
    if (typeof parsed.sessionId === "string") state.sessionId = parsed.sessionId;
    if (isElementId(parsed.self)) state.self = parsed.self;
    if (isElementId(parsed.borrow)) state.borrow = parsed.borrow;
    if (isElementId(parsed.community)) state.community = parsed.community;
    return state;
  } catch {
    return {};
  }
}

export function saveState(state: DiagnosisState): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // 저장소를 쓸 수 없는 환경(사생활 보호 모드 등)에서도 흐름은 URL로 이어진다.
  }
}

export function updateState(patch: Partial<DiagnosisState>): DiagnosisState {
  const next = { ...loadState(), ...patch };
  saveState(next);
  return next;
}

/** 다시하기: 선택값만 지우고 워크숍 세션 코드는 유지한다. */
export function resetSelections(): void {
  const { sessionId } = loadState();
  saveState(sessionId ? { sessionId } : {});
}

export function resultPath(a: string, b: string, c: string): string {
  return `/result/?a=${a}&b=${b}&c=${c}`;
}

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** 공유·QR용 절대 주소(배포 하위 경로 포함). 브라우저에서만 호출한다. */
export function absoluteUrl(path: string): string {
  return `${window.location.origin}${BASE_PATH}${path}`;
}
