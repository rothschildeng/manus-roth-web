import { describe, expect, it } from "vitest";
import { catalogProductId, getFullCatalog } from "./catalog";
import { resolveCatalogCheckout } from "./catalog/checkout";

describe("catalog-wide checkout eligibility", () => {
  it("accepts every catalog route only at its canonical displayed price without creating a financial order", () => {
    const products = getFullCatalog();
    expect(products.length).toBeGreaterThan(300);
    for (const product of products) {
      const itemId = catalogProductId(product);
      expect(resolveCatalogCheckout({ itemId, displayPrice: product.pay, availability: {} })).toEqual(product);
    }
  });

  it("rejects a changed price, unknown identity, and an unavailable canonical route", () => {
    const product = getFullCatalog()[0]!;
    const itemId = catalogProductId(product);
    expect(() => resolveCatalogCheckout({ itemId, displayPrice: "₹0", availability: {} })).toThrow("displayed price");
    expect(() => resolveCatalogCheckout({ itemId: "unknown — route", displayPrice: product.pay, availability: {} })).toThrow("displayed price");
    expect(() => resolveCatalogCheckout({ itemId, displayPrice: product.pay, availability: { [itemId]: true } })).toThrow("unavailable");
  });
});
