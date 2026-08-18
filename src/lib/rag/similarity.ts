function tokens(value: string): Set<string> {
  const normalized = value.toLocaleLowerCase("ja-JP");
  const result = new Set(normalized.match(/[a-z0-9]{2,}/gu) ?? []);
  const japanese = normalized.replace(/[^\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/gu, "");
  for (let index = 0; index < japanese.length - 1; index += 1) result.add(japanese.slice(index, index + 2));
  return result;
}

export function lexicalSimilarity(left: string, right: string): number {
  const a = tokens(left);
  const b = tokens(right);
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const token of a) if (b.has(token)) intersection += 1;
  return intersection / Math.sqrt(a.size * b.size);
}
