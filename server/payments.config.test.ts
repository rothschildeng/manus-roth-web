import { describe, expect, it } from "vitest";
import { isPaymentsConfigured, paymentChainSchema, walletConfigSchema } from "./payments/config";

describe("payment configuration", () => {
  it("accepts the supported direct-monitoring chains", () => {
    expect(paymentChainSchema.parse("TON")).toBe("TON");
    expect(paymentChainSchema.parse("USDT_BEP20")).toBe("USDT_BEP20");
    expect(paymentChainSchema.parse("SOLANA")).toBe("SOLANA");
    expect(paymentChainSchema.parse("BTC")).toBe("BTC");
    expect(paymentChainSchema.parse("ETH")).toBe("ETH");
  });

  it("rejects empty or unsupported receiving-address configuration", () => {
    expect(() => walletConfigSchema.parse({ chain: "TON", address: "" })).toThrow();
    expect(() => walletConfigSchema.parse({ chain: "DOGE", address: "D123" })).toThrow();
  });
});

it("enables direct monitoring only when every receiving address and the database are configured", () => {
  expect(isPaymentsConfigured()).toBe(true);
});
