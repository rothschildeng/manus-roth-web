import { describe, expect, it } from "vitest";

describe("ADMIN_PANEL_PASSWORD configuration", () => {
  it("is present as a non-empty server-side secret", () => {
    expect(process.env.ADMIN_PANEL_PASSWORD?.trim().length).toBeGreaterThan(0);
  });
});
