import { ELEMENT_ORDER, elements } from "@/lib/elements";
import { josa } from "@/lib/josa";
import type { ElementId, Slot } from "@/types/diagnosis";

// 2차 기능: 모임 익명 집계. Supabase 환경변수가 없으면 비활성화되어 외부로 아무것도 보내지 않는다.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** 이 인원 미만이면 분포를 보여주지 않는다(소수 인원에서 개인 응답 추정 방지). */
export const MIN_GROUP_SIZE = 3;

export const groupEnabled = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export function normalizeSessionId(value: string): string | null {
  const id = value.trim().toLowerCase();
  return /^[a-z0-9][a-z0-9-]{2,63}$/.test(id) ? id : null;
}

export type Distribution = Record<ElementId, number>;

export interface GroupSummary {
  sessionId: string;
  title: string | null;
  isOpen: boolean;
  total: number;
  /** total < MIN_GROUP_SIZE 이면 null */
  distributions: Record<Slot, Distribution> | null;
}

async function rpc<T>(fn: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(detail || `요청 실패 (${res.status})`);
  }
  return (await res.json()) as T;
}

export async function addResponse(
  sessionId: string,
  self: ElementId,
  borrow: ElementId,
  community: ElementId,
): Promise<void> {
  if (!groupEnabled) throw new Error("모임 기능이 설정되지 않았습니다.");
  await rpc("add_response", { p_session: sessionId, p_self: self, p_borrow: borrow, p_community: community });
}

interface RawSummary {
  session_id: string;
  title: string | null;
  is_open: boolean;
  total: number;
  self: Record<string, number> | null;
  borrow: Record<string, number> | null;
  community: Record<string, number> | null;
}

function toDistribution(raw: Record<string, number> | null): Distribution {
  const dist = {} as Distribution;
  for (const id of ELEMENT_ORDER) dist[id] = Number(raw?.[id] ?? 0);
  return dist;
}

export async function fetchGroupSummary(sessionId: string): Promise<GroupSummary | null> {
  if (!groupEnabled) throw new Error("모임 기능이 설정되지 않았습니다.");
  const raw = await rpc<RawSummary | null>("group_summary", { p_session: sessionId });
  if (!raw) return null;
  const enough = raw.total >= MIN_GROUP_SIZE;
  return {
    sessionId: raw.session_id,
    title: raw.title,
    isOpen: raw.is_open,
    total: raw.total,
    distributions: enough
      ? {
          self: toDistribution(raw.self),
          borrow: toDistribution(raw.borrow),
          community: toDistribution(raw.community),
        }
      : null,
  };
}

function topOf(dist: Distribution): ElementId[] {
  const max = Math.max(...ELEMENT_ORDER.map((id) => dist[id]));
  if (max === 0) return [];
  return ELEMENT_ORDER.filter((id) => dist[id] === max);
}

function names(ids: ElementId[]): string {
  return ids.map((id) => `${elements[id].hanja} ${elements[id].name}`).join("·");
}

/** 세 분포를 비교해 짧은 공동체 문장을 만든다. 좋고 나쁨이 아닌 중립적 서술만 쓴다. */
export function summarizeGroup(d: Record<Slot, Distribution>): string[] {
  const lines: string[] = [];
  const has = topOf(d.self);
  const wants = topOf(d.borrow);
  const uses = topOf(d.community);

  if (has.length && wants.length && uses.length) {
    lines.push(
      `우리 모임은 ${josa(names(has), "을")} 가장 많이 가지고 있고, ${josa(names(wants), "을")} 가장 많이 빌리고 싶어 해요. ` +
        `공동체에서는 ${names(uses)}의 역할이 가장 많이 쓰이고 있어요.`,
    );
  }

  for (const id of wants) {
    const holders = d.self[id];
    const e = elements[id];
    lines.push(
      holders > 0
        ? `${e.emoji} ${e.name}의 힘을 자연스럽게 쓰는 사람이 모임 안에 ${holders}명 있어요. 서로 빌려주고 배울 수 있는 힘이에요.`
        : `${e.emoji} ${e.name}의 힘을 자연스럽게 쓰는 사람은 아직 모임 안에 적어요. 함께 배우는 자리나 바깥의 도움을 생각해볼 수 있어요.`,
    );
  }

  const hidden = ELEMENT_ORDER.filter((id) => d.self[id] - d.community[id] >= 2);
  if (hidden.length) {
    lines.push(
      `${josa(names(hidden), "은")} 혼자서는 많이 쓰지만 공동체에서는 덜 쓰이고 있는 힘이에요. 모임에서 꺼내 쓸 기회를 만들어볼 수 있어요.`,
    );
  }
  return lines;
}
