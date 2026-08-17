import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const projectFile = (relative: string) => fs.readFileSync(path.join(root, relative), "utf8");

describe("Python-only Telegram host package", () => {
  it("is a genuine Python polling implementation with no embedded tokens or webhooks", () => {
    const source = projectFile("telegram-bot-python-host/main.py");
    expect(source).toContain("def main() -> int:");
    expect(source).toContain('env("TELEGRAM_POLLING_ENABLED") != "1"');
    expect(source).toContain('"getUpdates"');
    expect(source).toContain("def handle_shop");
    expect(source).toContain("def handle_admin");
    expect(source).toContain("manual owner review");
    expect(source).not.toContain("setWebhook");
    expect(source).not.toMatch(/\d{8,}:[A-Za-z0-9_-]{20,}/);
  });

  it("documents host-only secrets and manual fulfilment boundaries", () => {
    const readme = projectFile("telegram-bot-python-host/README.md");
    expect(readme).toContain("python3 main.py");
    expect(readme).toContain("TELEGRAM_SHOP_BOT_TOKEN");
    expect(readme).toContain("TELEGRAM_ADMIN_BOT_TOKEN");
    expect(readme).toContain("owner-controlled and manual");
    expect(readme).toContain("No webhook");
  });
});
