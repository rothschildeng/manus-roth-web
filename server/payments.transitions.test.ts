import { describe, expect, it } from "vitest";
import { transitionManualOrder } from "./payments/transitions";

describe("manual order transitions", () => {
  it("permits only the explicit admin handoff sequence", () => {
    expect(transitionManualOrder("pending_admin", "approve")).toBe("approved");
    expect(transitionManualOrder("approved", "ready")).toBe("fulfillment_ready");
    expect(transitionManualOrder("fulfillment_ready", "deliver")).toBe("delivered");
  });

  it("prevents auto-delivery and disallows invalid handoffs", () => {
    expect(transitionManualOrder("pending_admin", "deliver")).toBeNull();
    expect(transitionManualOrder("awaiting_payment", "approve")).toBeNull();
    expect(transitionManualOrder("rejected", "ready")).toBeNull();
  });
});
