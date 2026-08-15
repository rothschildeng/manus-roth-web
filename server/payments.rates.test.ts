import { describe, expect, it } from "vitest";
import { DISPLAY_CURRENCIES, parseCatalogPrice } from "./payments/rates";

describe("catalog checkout currency parsing", () => {
  it("parses the real USD, INR, GBP, and IDR catalog price shapes", () => {
    expect(parseCatalogPrice("$15")).toEqual({ amount: 15, currency: "USD" });
    expect(parseCatalogPrice("₹1,549")).toEqual({ amount: 1549, currency: "INR" });
    expect(parseCatalogPrice("£30")).toEqual({ amount: 30, currency: "GBP" });
    expect(parseCatalogPrice("50K IDR")).toEqual({ amount: 50000, currency: "IDR" });
  });

  it("exposes only the supported customer display currencies", () => {
    expect(DISPLAY_CURRENCIES).toEqual(["USD", "INR", "GBP", "EUR", "AED", "IDR", "JPY", "CNY", "KRW", "AUD", "CAD", "SGD", "HKD", "NZD", "CHF", "SEK", "NOK", "DKK", "PLN", "TRY", "SAR", "QAR", "KWD", "THB", "MYR", "PHP", "VND", "BRL", "MXN", "ZAR", "NGN", "PKR", "BDT"]);
  });

  it("requires an admin quote for non-numeric or open-ended items", () => {
    expect(parseCatalogPrice("Contact")).toBeNull();
    expect(parseCatalogPrice("$900+")).toBeNull();
  });
});
