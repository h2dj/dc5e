// 앞 단어의 받침 유무에 맞춰 조사를 고른다. 예: josa("정보 탐색", "은") → "정보 탐색은"
const PAIRS: Record<string, [string, string]> = {
  은: ["은", "는"],
  는: ["은", "는"],
  이: ["이", "가"],
  가: ["이", "가"],
  을: ["을", "를"],
  를: ["을", "를"],
  과: ["과", "와"],
  와: ["과", "와"],
  으로: ["으로", "로"],
  로: ["으로", "로"],
};

export function josa(word: string, particle: string): string {
  const pair = PAIRS[particle];
  if (!pair) return word + particle;
  const last = word.charCodeAt(word.length - 1);
  if (last < 0xac00 || last > 0xd7a3) return word + pair[0];
  const jong = (last - 0xac00) % 28;
  if (pair[0] === "으로" && jong === 8) return word + "로"; // ㄹ 받침은 "로"
  return word + (jong > 0 ? pair[0] : pair[1]);
}

/** "{A|은}", "{B}" 같은 자리표시자를 채운다. */
export function fillTemplate(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)(?:\|([^}]+))?\}/g, (_, key: string, particle?: string) => {
    const word = values[key] ?? "";
    return particle ? josa(word, particle) : word;
  });
}
