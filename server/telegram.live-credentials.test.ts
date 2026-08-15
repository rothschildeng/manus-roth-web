import { describe, expect, it } from "vitest";
import { getTelegramConfig } from "./telegram/config";

describe("configured Telegram credentials", () => {
  it.runIf(process.env.TELEGRAM_LIVE_CREDENTIAL_CHECK === "1")("validates fresh shop and admin tokens through Telegram getMe without exposing them", async () => {
    for (const kind of ["shop", "admin"] as const) {
      const config = getTelegramConfig(kind);
      expect(config, `${kind} bot configuration is required`).not.toBeNull();
      const response = await fetch(`https://api.telegram.org/bot${config!.token}/getMe`);
      expect(response.ok, `${kind} bot getMe request must succeed`).toBe(true);
      const payload = await response.json() as { ok?: boolean; result?: { id?: number; is_bot?: boolean } };
      expect(payload.ok).toBe(true);
      expect(payload.result?.is_bot).toBe(true);
      expect(payload.result?.id).toEqual(expect.any(Number));
    }
  }, 30_000);
});
