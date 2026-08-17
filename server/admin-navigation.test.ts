import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { ADMIN_DESKS, isAdminDeskPath } from "../shared/adminNavigation";

const projectFile = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

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

  it("keeps GitHub-aligned layout changes restricted to live protected administration routes", () => {
    const layout = projectFile("client/src/components/DashboardLayout.tsx");
    expect(layout).toContain('label: "Manual review"');
    expect(layout).toContain('label: "Store control"');
    expect(layout).toContain('path: "/similarweb-analytics"');
    expect(layout).not.toContain('path: "/admin/reviews"');
    const overview = projectFile("client/src/pages/AdminOverview.tsx");
    expect(overview).toContain("trpc.payment.adminList.useQuery");
    expect(overview).toContain("trpc.adminWallet.deposits.useQuery");
    expect(overview).toContain("current protected database records only");
  });
});
