import { describe, expect, it } from "vitest";
import { getFullCatalog } from "./catalog";
import { depositSourceMessage, shopCatalogMessage } from "./telegram/polling";

describe("Telegram polling catalog presentation", () => {
  it("reports the current shared-catalog count and wallet checkout boundary", () => {
    const message = shopCatalogMessage();
    expect(message).toContain(`${getFullCatalog().length} products`);
    expect(message).toContain("Cloud Services");
    expect(message).toContain("Flipkart gift-card or crypto deposit request");
    expect(message).toContain("No direct product-payment address");
  });

  it("distinguishes confirmed crypto funding from Flipkart deposit review", () => {
    expect(depositSourceMessage("crypto_review")).toBe("Confirmed crypto wallet funding");
    expect(depositSourceMessage("gift_card_review")).toBe("Flipkart gift-card funding");
    expect(depositSourceMessage("other_manual")).toBe("Manual wallet funding");
  });
});
