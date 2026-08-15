import { describe, expect, it } from "vitest";
import { requiredConfirmations } from "./payments/config";
import { reconcileObservedPayment } from "./payments/monitor";

const now = 1_750_000_000_000;
const future = new Date(now + 60_000);
const payment = (amountBaseUnits: bigint, confirmations: number) => ({ txHash: "0xobserved", amountBaseUnits, confirmations });

describe("payment reconciliation", () => {
  it("expires an order before any observation can advance it", () => {
    expect(reconcileObservedPayment({ now, expiresAt: new Date(now - 1), expectedBaseUnits: 100n, requiredConfirmations: 1, observed: [payment(100n, 99)] })).toEqual({ status: "expired" });
  });

  it("leaves underpayments and wrong-value observations unmatched", () => {
    expect(reconcileObservedPayment({ now, expiresAt: future, expectedBaseUnits: 100n, requiredConfirmations: 1, observed: [payment(99n, 12)] })).toEqual({ status: "unmatched" });
  });

  it("does not advance an order with an observation from a different chain", () => {
    expect(reconcileObservedPayment({ now, expiresAt: future, expectedBaseUnits: 100n, requiredConfirmations: 1, chain: "ETH", observed: [{ ...payment(100n, 12), chain: "BTC" }] })).toEqual({ status: "unmatched" });
  });

  it.each(["TON", "SOLANA", "BTC", "ETH", "USDT_BEP20"] as const)("holds %s at confirming until its required threshold", (chain) => {
    const required = requiredConfirmations[chain];
    const beforeThreshold = reconcileObservedPayment({ now, expiresAt: future, expectedBaseUnits: 100n, requiredConfirmations: required, observed: [payment(100n, Math.max(0, required - 1))] });
    const atThreshold = reconcileObservedPayment({ now, expiresAt: future, expectedBaseUnits: 100n, requiredConfirmations: required, observed: [payment(100n, required)] });
    expect(beforeThreshold.status).toBe("confirming");
    expect(atThreshold.status).toBe("pending_admin");
  });

  it("returns the same decision for a repeated identical observation", () => {
    const input = { now, expiresAt: future, expectedBaseUnits: 100n, requiredConfirmations: 3, observed: [payment(100n, 3)] };
    expect(reconcileObservedPayment(input)).toEqual(reconcileObservedPayment(input));
  });
});
