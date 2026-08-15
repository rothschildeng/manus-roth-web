import { describe, expect, it } from "vitest";
import { confirmationsFromHeights, uniquePaymentAmount } from "./payments/amounts";

describe("payment reconciliation amounts", () => {
  it("creates distinct exact payment amounts for different orders sharing one wallet", () => {
    const first = uniquePaymentAmount("USDT_BEP20", "12.900000000000000000", "d5f47b1776bd4884a013aaa1");
    const second = uniquePaymentAmount("USDT_BEP20", "12.900000000000000000", "77c37e12b6574e5eb3f23bc2");
    expect(first).not.toBe(second);
    expect(first.startsWith("12.9")).toBe(true);
    expect(second.startsWith("12.9")).toBe(true);
  });

  it("counts native-chain confirmations from block-height deltas", () => {
    expect(confirmationsFromHeights(200, 200)).toBe(1);
    expect(confirmationsFromHeights(211, 200)).toBe(12);
    expect(confirmationsFromHeights(200, undefined)).toBe(0);
  });
});
