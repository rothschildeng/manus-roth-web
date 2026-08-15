import { describe, expect, it } from "vitest";
import { brandAlt, cleanBrand } from "./sanitize";

describe("catalog label sanitizer", () => {
  it("falls back when a GitHub catalog label contains internal sourcing metadata", () => {
    expect(cleanBrand("User-supplied additions (missing from GitHub)")).toBe("ROTH DIGITAL");
    expect(cleanBrand("AWS user-supplied pricing")).toBe("ROTH DIGITAL");
    expect(cleanBrand("Flipkart brand mark")).toBe("ROTH DIGITAL");
  });

  it("keeps ordinary brand labels and uses the same cleaned text for alt content", () => {
    expect(cleanBrand("  Amazon  ")).toBe("Amazon");
    expect(brandAlt("Amazon")).toBe("Amazon");
  });
});
