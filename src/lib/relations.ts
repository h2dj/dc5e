import relationData from "@/data/relations.json";
import type { ElementId, PatternId, RelationType } from "@/types/diagnosis";

// 상생: 木 → 火 → 土 → 金 → 水 → 木 / 상극: 木 → 土 → 水 → 火 → 金 → 木
// 워크숍에서 서로 다른 디지털 힘의 연결을 설명하기 위한 은유로만 사용한다.
export const generates = relationData.generates as Record<ElementId, ElementId>;
export const controls = relationData.controls as Record<ElementId, ElementId>;

export const relationTypes = relationData.types as Record<
  RelationType,
  { label: string; symbol: string; base: string }
>;

export function getRelation(from: ElementId, to: ElementId): RelationType {
  if (from === to) return "same";
  if (generates[from] === to) return "generate";
  if (generates[to] === from) return "generatedBy";
  if (controls[from] === to) return "control";
  return "controlledBy";
}

export function getPattern(a: ElementId, b: ElementId, c: ElementId): PatternId {
  if (a === b && b === c) return "AAA";
  if (a === b) return "AAB";
  if (a === c) return "ABA";
  if (b === c) return "ABB";
  return "ABC";
}
