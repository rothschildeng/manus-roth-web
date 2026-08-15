import { describe, expect, it } from "vitest";
import { ROTH_DIGITAL_ANALYTICS_DOMAIN, getLatestCompleteMonthlyWindow } from "./similarweb";

describe("SimilarWeb analytics configuration", () => {
  it("uses the published ROTH DIGITAL domain and only completed calendar months", () => {
    expect(ROTH_DIGITAL_ANALYTICS_DOMAIN).toBe("aureliastore-fhmpjk85.manus.space");
    expect(getLatestCompleteMonthlyWindow(new Date("2026-08-15T12:00:00.000Z"))).toEqual({ startDate: "2026-05", endDate: "2026-07" });
  });
});
