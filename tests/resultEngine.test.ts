import { describe, expect, it } from "vitest";
import { ELEMENT_ORDER } from "@/lib/elements";
import { summarizeGroup, normalizeSessionId } from "@/lib/group";
import { josa } from "@/lib/josa";
import { getPattern, getRelation } from "@/lib/relations";
import { buildResult } from "@/lib/resultEngine";

const combos = ELEMENT_ORDER.flatMap((a) => ELEMENT_ORDER.flatMap((b) => ELEMENT_ORDER.map((c) => [a, b, c] as const)));

describe("125개 조합 결과 엔진", () => {
  it("5×5×5 = 125개 조합 모두 빈 칸 없이 결과를 만든다", () => {
    expect(combos).toHaveLength(125);
    for (const [a, b, c] of combos) {
      const r = buildResult(a, b, c);
      const texts = [
        r.headline,
        r.self.title,
        r.self.text,
        r.borrow.title,
        r.borrow.text,
        r.community.title,
        r.community.text,
        r.relations.selfBorrow.text,
        r.relations.selfCommunity.text,
        r.pattern.name,
        r.pattern.text,
        r.reflectionQuestion,
        r.askTemplate,
      ];
      for (const t of texts) {
        expect(t, `${a}/${b}/${c}`).toBeTruthy();
        expect(t).not.toMatch(/[{}]|undefined|null/);
      }
    }
  });

  it("같은 입력은 언제나 같은 결과를 만든다", () => {
    for (const [a, b, c] of combos) expect(buildResult(a, b, c)).toEqual(buildResult(a, b, c));
  });

  it("기획서 8장 예시(水/火/木)를 재현한다", () => {
    const r = buildResult("water", "fire", "wood");
    expect(r.pattern.id).toBe("ABC");
    expect(r.pattern.name).toBe("세 기운 순환형");
    expect(r.headline).toBe(
      "찾고 이해하는 힘을 가지고, 만들고 표현하는 힘을 더 원하며, 공동체에서는 사람을 연결하는 역할을 하고 있어요.",
    );
    expect(r.self.text).toBe("궁금한 것이 생기면 먼저 정보를 찾고 비교하며 상황을 이해하려는 힘을 자연스럽게 사용합니다.");
    expect(r.borrow.text).toBe("알고 있거나 느끼는 것을 더 매력적인 글이나 이미지, 콘텐츠로 표현하는 힘을 배우고 싶어 합니다.");
    expect(r.community.text).toBe("공동체에서는 사람을 연결하고 이야기가 이어지도록 돕는 역할을 합니다.");
    expect(r.reflectionQuestion).toBe("세 힘 중 앞으로 더 자주 사용해보고 싶은 힘은 무엇인가요?");
    expect(r.askTemplate).toBe("이 생각을 다른 사람에게 잘 전달하려면 어떻게 표현하면 좋을까요?");
  });
});

describe("관계·패턴 판정", () => {
  it("상생·상극 순환을 따른다", () => {
    expect(getRelation("wood", "fire")).toBe("generate");
    expect(getRelation("fire", "wood")).toBe("generatedBy");
    expect(getRelation("wood", "earth")).toBe("control");
    expect(getRelation("earth", "wood")).toBe("controlledBy");
    expect(getRelation("metal", "metal")).toBe("same");
  });

  it("서로 다른 두 오행마다 다섯 관계가 각각 정확히 한 번씩 나온다", () => {
    for (const a of ELEMENT_ORDER) {
      const types = ELEMENT_ORDER.map((b) => getRelation(a, b)).sort();
      expect(types).toEqual(["control", "controlledBy", "generate", "generatedBy", "same"]);
    }
  });

  it("패턴을 판정한다", () => {
    expect(getPattern("water", "water", "water")).toBe("AAA");
    expect(getPattern("water", "water", "fire")).toBe("AAB");
    expect(getPattern("water", "fire", "water")).toBe("ABA");
    expect(getPattern("water", "fire", "fire")).toBe("ABB");
    expect(getPattern("water", "fire", "wood")).toBe("ABC");
  });
});

describe("보조 함수", () => {
  it("받침에 맞춰 조사를 고른다", () => {
    expect(josa("정보 탐색", "은")).toBe("정보 탐색은");
    expect(josa("안전·보호", "은")).toBe("안전·보호는");
    expect(josa("창작·콘텐츠", "과")).toBe("창작·콘텐츠와");
    expect(josa("문제 해결", "으로")).toBe("문제 해결로");
  });

  it("세션 코드를 정규화한다", () => {
    expect(normalizeSessionId(" Bingo-Seoul-20261002 ")).toBe("bingo-seoul-20261002");
    expect(normalizeSessionId("a")).toBeNull();
    expect(normalizeSessionId("이름/../x")).toBeNull();
  });

  it("모임 요약 문장을 만든다", () => {
    const zero = { water: 0, wood: 0, fire: 0, earth: 0, metal: 0 };
    const lines = summarizeGroup({
      self: { ...zero, water: 3, metal: 1 },
      borrow: { ...zero, fire: 3, water: 1 },
      community: { ...zero, wood: 4 },
    });
    expect(lines[0]).toContain("水 정보 탐색을 가장 많이 가지고");
    expect(lines.join(" ")).toContain("창작·콘텐츠의 힘을 자연스럽게 쓰는 사람은 아직");
    expect(lines.join(" ")).toContain("덜 쓰이고 있는 힘");
  });
});
