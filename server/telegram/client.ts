import { getTelegramConfig, type TelegramBotKind } from "./config";

type InlineButton = { text: string; url?: string; callback_data?: string };
type InlineKeyboard = { inline_keyboard: InlineButton[][] };

export async function telegramRequest(kind: TelegramBotKind, method: string, body: Record<string, unknown>) {
  const config = getTelegramConfig(kind);
  if (!config) throw new Error(`${kind} Telegram bot is not configured`);
  const response = await fetch(`https://api.telegram.org/bot${config.token}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({})) as { ok?: boolean; description?: string; result?: unknown };
  if (!response.ok || !payload.ok) throw new Error(`Telegram ${method} failed${payload.description ? `: ${payload.description}` : ""}`);
  return payload.result;
}

export async function sendTelegramMessage(kind: TelegramBotKind, chatId: string | number, text: string, keyboard?: InlineKeyboard) {
  return telegramRequest(kind, "sendMessage", { chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true, reply_markup: keyboard });
}

export async function answerCallback(kind: TelegramBotKind, callbackId: string, text?: string) {
  return telegramRequest(kind, "answerCallbackQuery", { callback_query_id: callbackId, text });
}

export type { InlineKeyboard };
