import { describe, expect, it } from "vitest";
import { getFullCatalog } from "./catalog";
import { depositSourceMessage, shopCatalogMessage, shopHelpMessage, shopOrderPrivacyMessage } from "./telegram/polling";

describe("Telegram polling catalog presentation", () => {
  it("reports the current shared-catalog count and wallet checkout boundary", () => {
    const message = shopCatalogMessage();
    expect(message).toContain(`${getFullCatalog().length} products`);
    expect(message).toContain("Cloud Services");
    expect(message).toContain("Flipkart gift-card or crypto deposit request");
    expect(message).toContain("No direct product-payment address");
    expect(message).toContain("Use /help for commands");
  });

  it("distinguishes confirmed crypto funding from Flipkart deposit review", () => {
    expect(depositSourceMessage("crypto_review")).toBe("Confirmed crypto wallet funding");
    expect(depositSourceMessage("gift_card_review")).toBe("Flipkart gift-card funding");
    expect(depositSourceMessage("other_manual")).toBe("Manual wallet funding");
  });

  it("keeps customer order records off the unauthenticated chat lookup path", () => {
    expect(shopOrderPrivacyMessage()).toContain("does not look up order status from an ID sent in chat");
    expect(shopOrderPrivacyMessage()).toContain("website account desk");
    expect(shopHelpMessage()).toContain("For privacy");
    expect(shopHelpMessage()).toContain("/fund");
  });
});
