export type ElementId = "water" | "wood" | "fire" | "earth" | "metal";

export type Slot = "self" | "borrow" | "community";

export type RelationType = "same" | "generate" | "generatedBy" | "control" | "controlledBy";

export type PatternId = "AAA" | "AAB" | "ABA" | "ABB" | "ABC";

export interface SlotText {
  title: string;
  text: string;
}

export interface Element {
  id: ElementId;
  hanja: string;
  korean: string;
  name: string;
  emoji: string;
  color: string;
  headline: string;
  verbs: string[];
  keywords: string[];
  /** 선택 화면 카드에 쓰는 짧은 설명 */
  card: Record<Slot, string>;
  self: SlotText;
  borrow: SlotText;
  community: SlotText;
  /** 빌리고 싶은 힘으로 골랐을 때의 도움 요청 문장 */
  ask: string;
}

export interface Pattern {
  condition: string;
  name: string;
  text: string;
  question: string;
}

export interface DiagnosisState {
  sessionId?: string;
  self?: ElementId;
  borrow?: ElementId;
  community?: ElementId;
}

export interface DiagnosisResult {
  input: { self: ElementId; borrow: ElementId; community: ElementId };
  pattern: Pattern & { id: PatternId };
  headline: string;
  self: SlotText;
  borrow: SlotText;
  community: SlotText;
  relations: {
    selfBorrow: { type: RelationType; label: string; text: string };
    selfCommunity: { type: RelationType; label: string; text: string };
  };
  reflectionQuestion: string;
  askTemplate: string;
}
