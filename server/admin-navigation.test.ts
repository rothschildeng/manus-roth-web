import { describe, expect, it } from "vitest";
import { ADMIN_DESKS, isAdminDeskPath } from "../shared/adminNavigation";

describe("admin overview navigation", () => {
  it("links only to the protected administration desks", () => {
    expect(ADMIN_DESKS.map((desk) => desk.path)).toEqual([
      "/admin/payments",
      "/admin/wallet",
      "/admin/vcc",
      "/admin/catalog",
      "/similarweb-analytics",
    ]);
    expect(ADMIN_DESKS.every((desk) => desk.boundary.length > 0)).toBe(true);
  });

  it("recognizes the overview and known desk routes without treating public routes as administrative", () => {
    expect(isAdminDeskPath("/admin")).toBe(true);
    expect(isAdminDeskPath("/admin/vcc")).toBe(true);
    expect(isAdminDeskPath("/similarweb-analytics")).toBe(true);
    expect(isAdminDeskPath("/wallet")).toBe(false);
    expect(isAdminDeskPath("/admin/reviews")).toBe(false);
  });
});
