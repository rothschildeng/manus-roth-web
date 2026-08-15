export type TelegramBotKind = "shop" | "admin";

type TelegramBotConfig = {
  token: string;
};

function value(name: string) {
  return (process.env[name] ?? "").trim();
}

export function getTelegramConfig(kind: TelegramBotKind): TelegramBotConfig | null {
  const isShop = kind === "shop";
  const token = value(isShop ? "TELEGRAM_SHOP_BOT_TOKEN" : "TELEGRAM_ADMIN_BOT_TOKEN");
  if (!token) return null;
  return { token };
}

export function getTelegramPublicUrl() {
  return value("TELEGRAM_PUBLIC_URL").replace(/\/+$/, "");
}

export function getTelegramAdminChatId() {
  return value("TELEGRAM_ADMIN_CHAT_ID");
}

export function hasTelegramConfiguration(kind: TelegramBotKind) {
  return Boolean(getTelegramConfig(kind));
}

export function isPollingEnabled() {
  return value("TELEGRAM_POLLING_ENABLED") === "1";
}
