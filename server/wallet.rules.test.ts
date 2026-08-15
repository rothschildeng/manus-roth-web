import { describe, expect, it } from "vitest";
import { MINIMUM_WALLET_DEPOSIT_USD, maskDepositReference, transitionWalletDeposit } from "./wallet/rules";

describe("wallet deposit safety rules", () => {
  it("enforces the documented minimum amount", () => {
    expect(MINIMUM_WALLET_DEPOSIT_USD).toBe(25);
  });

  it("masks submitted references before persistence or bot handoff", () => {
    expect(maskDepositReference("FLIP KART 1234")).toBe("•••• 1234");
    expect(maskDepositReference("1234")).toBe("••••");
  });

  it("permits a deposit decision only from pending review", () => {
    expect(transitionWalletDeposit("pending_review", "approve")).toBe("approved");
    expect(transitionWalletDeposit("pending_review", "reject")).toBe("rejected");
    expect(transitionWalletDeposit("approved", "reject")).toBeNull();
  });
});
