import data from "@/data/elements.json";
import type { Element, ElementId } from "@/types/diagnosis";

export const ELEMENT_ORDER = data.order as ElementId[];
export const elements = data.elements as Record<ElementId, Element>;

export function isElementId(value: unknown): value is ElementId {
  return typeof value === "string" && (ELEMENT_ORDER as string[]).includes(value);
}

/** 접근성을 위해 색상만이 아니라 아이콘·한자·이름을 함께 쓰는 표기 */
export function elementLabel(id: ElementId): string {
  const e = elements[id];
  return `${e.emoji} ${e.hanja} ${e.name}`;
}
