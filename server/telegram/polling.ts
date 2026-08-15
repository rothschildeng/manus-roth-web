import { ENV } from "../_core/env";
import { CATEGORY_LABELS, getFullCatalog } from "../catalog";
import { approveWalletDeposit, getPaymentOrder, getUserByOpenId, listPaymentOrders, listWalletDepositsForAdmin, recordOrderNotification, rejectWalletDeposit, updatePaymentOrder } from "../db";
import { answerCallback, sendTelegramMessage, telegramRequest, type InlineKeyboard } from "./client";
import { getTelegramAdminChatId, getTelegramConfig, getTelegramPublicUrl, isPollingEnabled, type TelegramBotKind } from "./config";

type TelegramUpdate = { update_id?: number; message?: { chat?: { id?: number }; text?: string; from?: { first_name?: string } }; callback_query?: { id: string; data?: string; message?: { chat?: { id?: number } } } };
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const started = new Set<TelegramBotKind>();

function shopKeyboard(baseUrl: string): InlineKeyboard {
  const categoryButtons = Object.entries(CATEGORY_LABELS).map(([key, label]) => [{ text: label.replace(/^[^A-Za-z0-9]+/, ""), url: `${baseUrl}/category/${key}` }]);
  return { inline_keyboard: [[{ text: "Open ROTH DIGITAL", url: `${baseUrl}/` }, { text: "Fund wallet", url: `${baseUrl}/wallet#deposit` }], ...categoryButtons, [{ text: "My order status", callback_data: "shop:order" }, { text: "Support", callback_data: "shop:support" }]] };
}

export function shopCatalogMessage() {
  const products = getFullCatalog();
  return `<b>ROTH DIGITAL</b>\n\nLive catalog: <b>${products.length} products</b> across ${Object.keys(CATEGORY_LABELS).length} collections, including the latest Cloud Services routes.\n\n<b>How checkout works</b>\n1. Browse products on the website.\n2. Fund your wallet with a Flipkart gift-card or crypto deposit request.\n3. Use wallet checkout for all cart items and quantities.\n4. Every credit and order stays under manual admin review.\n\nNo direct product-payment address or automatic delivery is sent through this bot.`;
}

export function depositSourceMessage(sourceType: string) {
  return sourceType === "crypto_review" ? "Confirmed crypto wallet funding" : sourceType === "gift_card_review" ? "Flipkart gift-card funding" : "Manual wallet funding";
}

async function handleShopUpdate(update: TelegramUpdate) {
  const chatId = update.message?.chat?.id ?? update.callback_query?.message?.chat?.id;
  if (!chatId) return;
  const baseUrl = getTelegramPublicUrl();
  if (!baseUrl) return;
  const text = update.message?.text?.trim() ?? "";
  const callback = update.callback_query;
  if (callback) await answerCallback("shop", callback.id).catch(() => undefined);
  if (text.startsWith("/start") || text === "/catalog" || callback?.data === "shop:catalog") { const name = update.message?.from?.first_name ? `, ${update.message.from.first_name}` : ""; await sendTelegramMessage("shop", chatId, `${shopCatalogMessage().replace("<b>ROTH DIGITAL</b>", `<b>ROTH DIGITAL</b>${name}`)}`, shopKeyboard(baseUrl)); return; }
  if (text.startsWith("/order")) { const orderId = text.split(/\s+/)[1]; if (!orderId) { await sendTelegramMessage("shop", chatId, "Send <code>/order YOUR_ORDER_ID</code> to open an order status route."); return; } const order = await getPaymentOrder(orderId); if (!order) { await sendTelegramMessage("shop", chatId, "That order ID was not found. Check the confirmation page and try again."); return; } await sendTelegramMessage("shop", chatId, `<b>Order ${order.orderId}</b>\nStatus: <b>${order.status.replaceAll("_", " ")}</b>\nConfirmations: <b>${order.confirmations} / ${order.requiredConfirmations}</b>`, { inline_keyboard: [[{ text: "Open live status", url: `${baseUrl}/confirmation/${order.orderId}` }], [{ text: "Support", url: `${baseUrl}/support` }]] }); return; }
  if (text === "/fund" || callback?.data === "shop:fund") { await sendTelegramMessage("shop", chatId, "Open Wallet to create a Flipkart or crypto funding request. Wallet credit is never automatic and requires manual review.", { inline_keyboard: [[{ text: "Fund wallet", url: `${baseUrl}/wallet#deposit` }]] }); return; }
  if (callback?.data === "shop:order") { await sendTelegramMessage("shop", chatId, "Send <code>/order YOUR_ORDER_ID</code> to open your order’s live confirmation state."); return; }
  if (callback?.data === "shop:support" || text === "/support") { await sendTelegramMessage("shop", chatId, "Open the support desk for payment-safety and order-state help.", { inline_keyboard: [[{ text: "Open support", url: `${baseUrl}/support` }]] }); return; }
  await sendTelegramMessage("shop", chatId, "Use /start or /catalog to browse, /fund to fund your wallet, /order YOUR_ORDER_ID for status, or /support for help.");
}

function adminKeyboard(orderId: string): InlineKeyboard { return { inline_keyboard: [[{ text: "Approve", callback_data: `admin:approve:${orderId}` }, { text: "Reject", callback_data: `admin:reject:${orderId}` }]] }; }
function depositKeyboard(depositId: number): InlineKeyboard { return { inline_keyboard: [[{ text: "Approve credit", callback_data: `deposit:approve:${depositId}` }, { text: "Reject request", callback_data: `deposit:reject:${depositId}` }]] }; }
function isAdmin(chatId: number) { return String(chatId) === getTelegramAdminChatId(); }

async function sendPendingOrders(chatId: number) {
  const pending = (await listPaymentOrders("pending_admin")).filter((order) => order.purpose !== "wallet_deposit");
  if (!pending.length) { await sendTelegramMessage("admin", chatId, "<b>ROTH REVIEW DESK</b>\nNo confirmed orders are waiting for review."); return; }
  await sendTelegramMessage("admin", chatId, `<b>ROTH REVIEW DESK</b>\n${pending.length} confirmed order(s) waiting for a manual decision.`);
  for (const order of pending.slice(0, 12)) await sendTelegramMessage("admin", chatId, `<b>${order.orderId}</b>\n${order.itemId}\n${order.expectedAmount} ${order.asset} · ${order.confirmations}/${order.requiredConfirmations} confirmations`, adminKeyboard(order.orderId));
}

async function sendPendingDeposits(chatId: number) {
  const pending = await listWalletDepositsForAdmin("pending_review");
  if (!pending.length) { await sendTelegramMessage("admin", chatId, "<b>ROTH WALLET DESK</b>\nNo wallet deposits are waiting for review."); return; }
  await sendTelegramMessage("admin", chatId, `<b>ROTH WALLET DESK</b>\n${pending.length} deposit request(s) waiting for a manual decision.`);
  for (const deposit of pending.slice(0, 12)) await sendTelegramMessage("admin", chatId, `<b>${deposit.requestCode}</b>\nSource: <b>${depositSourceMessage(deposit.sourceType)}</b>\nRequested: <b>$${deposit.requestedAmount} ${deposit.currency}</b>\nReference: <code>${deposit.referenceMasked}</code>\n\n${deposit.sourceType === "crypto_review" ? "Check the linked confirmed transaction in the payment review desk before deciding." : "Only this masked reference is sent to Telegram. Verify the original code through your approved secure process before deciding."}`, depositKeyboard(deposit.id));
}

async function ownerAdminId() { const owner = await getUserByOpenId(ENV.ownerOpenId); if (!owner || owner.role !== "admin") throw new Error("Project owner must sign in once and have the admin role before bot deposit review can be used"); return owner.id; }

async function handleAdminUpdate(update: TelegramUpdate) {
  const chatId = update.message?.chat?.id ?? update.callback_query?.message?.chat?.id;
  if (!chatId || !isAdmin(chatId)) { if (update.callback_query) await answerCallback("admin", update.callback_query.id, "Not authorized").catch(() => undefined); return; }
  const text = update.message?.text?.trim() ?? "";
  const callback = update.callback_query;
  if (callback) await answerCallback("admin", callback.id).catch(() => undefined);
  if (text === "/start" || text === "/menu" || text === "/orders") { await sendPendingOrders(chatId); return; }
  if (text === "/deposits") { await sendPendingDeposits(chatId); return; }
  const orderMatch = callback?.data?.match(/^admin:(approve|reject):([a-zA-Z0-9]{8,64})$/);
  if (orderMatch) { const [, action, orderId] = orderMatch; const order = await getPaymentOrder(orderId!); if (!order || order.status !== "pending_admin" || order.purpose === "wallet_deposit") { await sendTelegramMessage("admin", chatId, order?.purpose === "wallet_deposit" ? "Crypto wallet funding must be credited from the wallet deposit review queue." : "This order is no longer waiting for manual approval."); return; } const next = action === "approve" ? "approved" : "rejected"; await updatePaymentOrder(orderId!, { status: next }); await recordOrderNotification(orderId!, order.customerId, next); await sendTelegramMessage("admin", chatId, `Order <b>${orderId}</b> was ${next}. No automatic delivery was triggered.`); return; }
  const depositMatch = callback?.data?.match(/^deposit:(approve|reject):(\d+)$/);
  if (depositMatch) { const [, action, rawId] = depositMatch; try { const adminId = await ownerAdminId(); const deposit = action === "approve" ? await approveWalletDeposit(Number(rawId), adminId, "Manually reviewed through configured Telegram admin bot") : await rejectWalletDeposit(Number(rawId), adminId, "Manually reviewed through configured Telegram admin bot"); await sendTelegramMessage("admin", chatId, `Wallet request <b>${deposit?.requestCode ?? rawId}</b> was ${action === "approve" ? "approved and credited" : "rejected"}. No automatic code delivery was triggered.`); } catch (error) { await sendTelegramMessage("admin", chatId, error instanceof Error ? error.message : "The wallet request could not be reviewed."); } return; }
  await sendTelegramMessage("admin", chatId, "Use /orders for confirmed payment orders or /deposits for wallet deposits waiting for review.");
}

async function poll(kind: TelegramBotKind) { let offset: number | undefined; while (started.has(kind)) { try { const updates = await telegramRequest(kind, "getUpdates", { timeout: 25, offset, allowed_updates: ["message", "callback_query"] }) as TelegramUpdate[]; for (const update of updates) { if (typeof update.update_id === "number") offset = update.update_id + 1; if (kind === "shop") await handleShopUpdate(update); else await handleAdminUpdate(update); } } catch (error) { console.error(`[telegram.${kind}] polling error`, error); await sleep(5000); } } }

export function startConfiguredTelegramPolling() { if (!isPollingEnabled()) return; for (const kind of ["shop", "admin"] as const) { if (started.has(kind) || !getTelegramConfig(kind)) continue; if (kind === "shop" && !getTelegramPublicUrl()) { console.warn("[telegram.shop] polling disabled: TELEGRAM_PUBLIC_URL is missing"); continue; } started.add(kind); void poll(kind); console.log(`[telegram.${kind}] polling started`); } }
