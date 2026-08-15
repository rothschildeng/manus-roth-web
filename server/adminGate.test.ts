import { describe, expect, it } from "vitest";
import { hasValidAdminGate, issueAdminGateToken, verifyAdminPassword } from "./adminGate";

describe("admin password gate", () => {
  it("accepts only the configured server-side password", () => {
    expect(verifyAdminPassword(process.env.ADMIN_PANEL_PASSWORD ?? "")).toBe(true);
    expect(verifyAdminPassword("incorrect-password")).toBe(false);
  });

  it("binds an unlock token to the administrator identity", async () => {
    const token = await issueAdminGateToken("owner-open-id");
    const req = { headers: { cookie: `__Host-admin_gate=${token}` } } as never;
    await expect(hasValidAdminGate(req, "owner-open-id")).resolves.toBe(true);
    await expect(hasValidAdminGate(req, "different-open-id")).resolves.toBe(false);
  });
});
