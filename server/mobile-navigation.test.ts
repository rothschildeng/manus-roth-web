import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { mobileNavigationTargets, mobileWalletBalanceLabel } from "../shared/mobileNavigation";

describe("mobile navigation targets", () => {
  it("sends guests to secure login before account-bound routes", () => {
    expect(mobileNavigationTargets(false)).toEqual({ wallet: "/login", orders: "/login", profile: "/login" });
  });

  it("keeps authenticated customers in their wallet, orders, and profile views", () => {
    expect(mobileNavigationTargets(true)).toEqual({ wallet: "/wallet", orders: "/orders", profile: "/account" });
  });

  it("never renders a guessed wallet badge before an authenticated server balance exists", () => {
    expect(mobileWalletBalanceLabel(false, "55.00")).toBeNull();
    expect(mobileWalletBalanceLabel(true, undefined)).toBeNull();
    expect(mobileWalletBalanceLabel(true, null)).toBeNull();
    expect(mobileWalletBalanceLabel(true, "not-a-number")).toBeNull();
    expect(mobileWalletBalanceLabel(true, "55.5")).toBe("$55.50");
  });

  it("keeps the custom homepage aligned with the mobile navigation and manual-review fulfilment policy", () => {
    const home = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
    expect(home).toContain("<MobileBottomNav />");
    expect(home).toContain("SHOP DIGITAL ESSENTIALS WITH CLEAR ORDER STATUS");
    expect(home).not.toContain("Instant delivery is on");
  });
});
