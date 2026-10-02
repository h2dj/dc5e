import relationData from "@/data/relations.json";
import patternData from "@/data/patterns.json";
import { elements } from "@/lib/elements";
import { fillTemplate } from "@/lib/josa";
import { getPattern, getRelation, relationTypes } from "@/lib/relations";
import type { DiagnosisResult, ElementId, Pattern, PatternId, RelationType } from "@/types/diagnosis";

const patterns = patternData as Record<PatternId, Pattern>;
const selfBorrow = relationData.selfBorrow as Record<RelationType, string>;
const selfCommunity = relationData.selfCommunity as Record<RelationType, string>;

/**
 * 오행 기본 문장 + A-B 관계 + A-C 관계 + 구조 패턴을 합성해 125개 조합의 결과를 만든다.
 * 같은 입력은 언제나 같은 결과를 만든다(무작위·외부 호출 없음).
 */
export function buildResult(self: ElementId, borrow: ElementId, community: ElementId): DiagnosisResult {
  const A = elements[self];
  const B = elements[borrow];
  const C = elements[community];
  const patternId = getPattern(self, borrow, community);
  const ab = getRelation(self, borrow);
  const ac = getRelation(self, community);
  const names = { A: A.name, B: B.name, C: C.name };

  return {
    input: { self, borrow, community },
    pattern: { id: patternId, ...patterns[patternId] },
    headline:
      `${A.headline} 힘을 가지고, ` +
      `${B.headline} 힘을 더 원하며, ` +
      `공동체에서는 ${C.headline} 역할을 하고 있어요.`,
    self: A.self,
    borrow: B.borrow,
    community: C.community,
    relations: {
      selfBorrow: { type: ab, label: relationTypes[ab].label, text: fillTemplate(selfBorrow[ab], names) },
      selfCommunity: { type: ac, label: relationTypes[ac].label, text: fillTemplate(selfCommunity[ac], names) },
    },
    reflectionQuestion: patterns[patternId].question,
    askTemplate: B.ask,
  };
}
