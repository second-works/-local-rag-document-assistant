import { describe, expect, it } from "vitest";
import { chunkPages } from "../src/lib/rag/chunk";

describe("chunkPages", () => {
  it("keeps the source page on every chunk", () => {
    const chunks = chunkPages([{ page: 4, text: "abcdefghij" }], { chunkSize: 6, overlap: 2 });
    expect(chunks.length).toBe(2);
    expect(chunks.every((chunk) => chunk.page === 4)).toBe(true);
    expect(chunks[1].text.startsWith("ef")).toBe(true);
  });

  it("rejects an overlap equal to the chunk size", () => {
    expect(() => chunkPages([{ page: 1, text: "text" }], { chunkSize: 4, overlap: 4 })).toThrow("overlap");
  });
});
