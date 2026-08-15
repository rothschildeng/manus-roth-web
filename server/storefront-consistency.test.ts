import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectFile = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("ROTH DIGITAL storefront consistency", () => {
  it("uses the ROTH DIGITAL document title and a wallet-first homepage flow", () => {
    expect(projectFile("client/index.html")).toContain("<title>ROTH DIGITAL — Premium Essentials</title>");
    const home = projectFile("client/src/pages/Home.tsx");
    expect(home).toContain("setLocation(\"/cart\")");
    expect(home).not.toContain("createPaymentOrder");
    expect(home).not.toContain("receivingAddress");
    expect(home).not.toContain("Create payment order");
  });

  it("uses clean brand-only image labels and exposes key collections with the approved Telegram support channel", () => {
    const catalog = projectFile("client/src/components/RealCatalog.tsx");
    expect(catalog).toContain('import { brandAlt, cleanBrand } from "@/lib/sanitize";');
    expect(catalog).toContain("alt={brandAlt(product.group)}");
    expect(catalog).toContain("{cleanBrand(product.group)}");
    expect(catalog).toContain("roth-myntra-brand_8d1c4b36.png");
    expect(catalog).toContain("roth-aws-brand_9ddb5827.png");
    expect(catalog).toContain("roth-ajio-brand_84ac5ad7.png");
    const shell = projectFile("client/src/components/StoreShell.tsx");
    expect(shell).toContain('href="/category/electronics"');
    expect(shell).toContain('href="/category/cloud_services"');
    expect(shell).not.toContain("wa.me/");
    const support = projectFile("client/src/pages/SupportPage.tsx");
    expect(support).toContain("https://t.me/the_stevenroths");
    expect(support).not.toContain("wa.me/");
  });
});
