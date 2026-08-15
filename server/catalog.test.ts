import { describe, expect, it } from "vitest";
import { catalogProductId, CATEGORY_LABELS, getFullCatalog, isValidCatalogPrice, USER_SUPPLIED_AWS_GROUP, USER_SUPPLIED_PREMIUM_GROUP } from "./catalog";
import { getFullCatalog as getRepositoryCatalog } from "../../roth-digital/lib/catalog/src/index";
import { imageForProduct } from "../client/src/components/RealCatalog";

describe("imported Roth Digital catalog", () => {
  it("retains all repository product families and a substantial real inventory", () => {
    const products = getFullCatalog();
    expect(products.length).toBeGreaterThan(300);
    expect(new Set(products.map((product) => product.category))).toEqual(new Set(Object.keys(CATEGORY_LABELS)));
    expect(products.some((product) => product.group.includes("Amazon India"))).toBe(true);
    expect(products.some((product) => product.group.includes("Free Fire"))).toBe(true);
    expect(products.some((product) => product.group.includes("iPhone"))).toBe(true);
  });

  it("preserves the connected GitHub catalog item-for-item outside explicitly audited user-supplied additions", () => {
    const managed = getFullCatalog().filter((product) => product.group !== USER_SUPPLIED_PREMIUM_GROUP && product.group !== USER_SUPPLIED_AWS_GROUP).map(({ category, group, label, pay, get, origPay, colors }) => ({ category, group, label, pay, get, origPay, colors }));
    const repository = getRepositoryCatalog().map(({ category, group, label, pay, get, origPay, colors }) => ({ category, group, label, pay, get, origPay, colors }));
    expect(managed).toEqual(repository);
  });

  it("keeps VCC balance labels and device pricing repository-backed while retaining only audited missing additions", () => {
    const products = getFullCatalog();
    expect(products.some((product) => product.group.includes("Source-provided"))).toBe(false);
    expect(products.some((product) => product.label === "VCC Lite — Limit ₹10,000")).toBe(false);
    expect(products.some((product) => product.label === "Galaxy S24 Ultra · 256GB · S Pen")).toBe(false);
    const additions = products.filter((product) => product.group === USER_SUPPLIED_PREMIUM_GROUP);
    expect(additions).toHaveLength(13);
    expect(additions.find((product) => product.label === "PixverseAI 30,000 Credits 1 Month — 1D warranty")?.pay).toBe("$39.99");
    expect(additions.find((product) => product.label === "Higgsfield 1 Year — Full warranty")?.pay).toBe("$120.00");
    expect(additions.every((product) => product.origPay === undefined)).toBe(true);
  });

  it("keeps AWS user-supplied prices explicit and blocks custom quotes from checkout", () => {
    const services = getFullCatalog().filter((product) => product.group === USER_SUPPLIED_AWS_GROUP);
    expect(services).toHaveLength(9);
    expect(services.find((product) => product.label === "Developer Support · monthly")).toMatchObject({ pay: "$20.30", origPay: "$29", category: "cloud_services" });
    expect(services.find((product) => product.label.startsWith("Reserved Instances"))?.quoteOnly).toBe(true);
    expect(isValidCatalogPrice(`${USER_SUPPLIED_AWS_GROUP} — Reserved Instances · custom annual quote · 30% off`, "Custom quote")).toBe(false);
  });

  it("uses a group-qualified identifier so common labels cannot collide", () => {
    const products = getFullCatalog();
    const monthItems = products.filter((product) => product.label === "1 Month");
    expect(monthItems.length).toBeGreaterThan(1);
    expect(new Set(monthItems.map(catalogProductId)).size).toBe(monthItems.length);
    for (const item of monthItems) {
      expect(isValidCatalogPrice(catalogProductId(item), item.pay)).toBe(true);
    }
  });

  it("prefers model-matched device visuals and uses the managed premium brand marks", () => {
    expect(imageForProduct("📱 iPhone", "electronics", "iPhone 16e · 128GB")).toBe("/manus-storage/roth-iphone-16e_9b5309b8.jpg");
    expect(imageForProduct("Gemini", "premium_sub", "Advanced subscription")).toBe("/manus-storage/roth-gemini-logo_2b4b8b78.png");
    expect(imageForProduct("Cursor", "premium_sub", "Pro subscription")).toBe("/manus-storage/roth-cursor-logo_a04747bd.png");
    expect(imageForProduct("Canva", "premium_sub", "Pro subscription")).toBe("/manus-storage/roth-canva-logo_2dcfe4fd.png");
  });
});
