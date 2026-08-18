import { describe, expect, it } from "vitest";
import { lexicalSimilarity } from "../src/lib/rag/similarity";

describe("lexicalSimilarity", () => {
  it("matches related Japanese phrases without a morphological analyzer", () => {
    expect(lexicalSimilarity("非常用発電機の点検頻度は？", "非常用発電機については、月1回の目視確認と年1回の総合点検を実施する。")).toBeGreaterThan(0.15);
  });

  it("does not match unrelated questions", () => {
    expect(lexicalSimilarity("契約書の更新日は？", "非常用発電機については、月1回の目視確認と年1回の総合点検を実施する。")).toBe(0);
  });
});
