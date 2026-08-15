import { afterEach, describe, expect, it } from "vitest";
import { getTelegramAdminChatId, getTelegramConfig, getTelegramPublicUrl, isPollingEnabled } from "./telegram/config";

const keys = [
  "TELEGRAM_SHOP_BOT_TOKEN",
  "TELEGRAM_ADMIN_BOT_TOKEN",
  "TELEGRAM_ADMIN_CHAT_ID",
  "TELEGRAM_PUBLIC_URL",
  "TELEGRAM_POLLING_ENABLED",
] as const;

const original = Object.fromEntries(keys.map((key) => [key, process.env[key]]));

afterEach(() => {
  for (const key of keys) {
    const value = original[key];
    if (value === undefined) delete process.env[key]; else process.env[key] = value;
  }
});

describe("Telegram polling configuration", () => {
  it("requires bot tokens and remains disabled until explicitly enabled", () => {
    delete process.env.TELEGRAM_SHOP_BOT_TOKEN;
    delete process.env.TELEGRAM_ADMIN_BOT_TOKEN;
    delete process.env.TELEGRAM_POLLING_ENABLED;
    expect(getTelegramConfig("shop")).toBeNull();
    expect(getTelegramConfig("admin")).toBeNull();
    expect(isPollingEnabled()).toBe(false);
  });

  it("reads configured bots only from server environment values", () => {
    process.env.TELEGRAM_SHOP_BOT_TOKEN = "123456:shop-token-for-test-only";
    process.env.TELEGRAM_ADMIN_BOT_TOKEN = "654321:admin-token-for-test-only";
    process.env.TELEGRAM_ADMIN_CHAT_ID = "8267678772";
    process.env.TELEGRAM_PUBLIC_URL = "https://store.example.test/";
    process.env.TELEGRAM_POLLING_ENABLED = "1";
    expect(getTelegramConfig("shop")?.token).toBe("123456:shop-token-for-test-only");
    expect(getTelegramConfig("admin")?.token).toBe("654321:admin-token-for-test-only");
    expect(getTelegramAdminChatId()).toBe("8267678772");
    expect(getTelegramPublicUrl()).toBe("https://store.example.test");
    expect(isPollingEnabled()).toBe(true);
  });
});
