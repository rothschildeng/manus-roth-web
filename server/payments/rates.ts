import { PaymentChain } from "./config";

const coinIds: Record<Exclude<PaymentChain, "USDT_BEP20"> | "USDT_BEP20", string> = {
  TON: "the-open-network",
  USDT_BEP20: "tether",
  SOLANA: "solana",
  BTC: "bitcoin",
  ETH: "ethereum",
};

export async function quoteUsdToAsset(chain: PaymentChain, usd: number) {
  const coinId = coinIds[chain];
  const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`, { headers: { accept: "application/json" }, cache: "no-store" });
  if (!response.ok) throw new Error(`Rate provider returned ${response.status}`);
  const data = await response.json() as Record<string, { usd?: number }>;
  const rate = data[coinId]?.usd;
  if (!rate || !Number.isFinite(rate) || rate <= 0) throw new Error(`No USD rate available for ${chain}`);
  const amount = usd / rate;
  return { amount: amount.toFixed(chain === "BTC" ? 8 : chain === "SOLANA" || chain === "TON" ? 6 : 6), rate, quotedAt: new Date() };
}

export const DISPLAY_CURRENCIES = ["USD", "INR", "GBP", "EUR", "AED", "IDR", "JPY", "CNY", "KRW", "AUD", "CAD", "SGD", "HKD", "NZD", "CHF", "SEK", "NOK", "DKK", "PLN", "TRY", "SAR", "QAR", "KWD", "THB", "MYR", "PHP", "VND", "BRL", "MXN", "ZAR", "NGN", "PKR", "BDT"] as const;
export type DisplayCurrency = typeof DISPLAY_CURRENCIES[number];

type SupportedCatalogCurrency = "USD" | "INR" | "GBP" | "IDR";

export async function fetchDisplayFxRates(): Promise<Record<DisplayCurrency, number>> {
  const response = await fetch("https://open.er-api.com/v6/latest/USD", { headers: { accept: "application/json" }, cache: "no-store" });
  if (!response.ok) throw new Error(`FX rate provider returned ${response.status}`);
  const data = await response.json() as { rates?: Record<string, number> };
  const rates = data.rates ?? {};
  const result = Object.fromEntries(DISPLAY_CURRENCIES.map((code) => [code, code === "USD" ? 1 : rates[code]])) as Record<DisplayCurrency, number>;
  if (DISPLAY_CURRENCIES.some((code) => !Number.isFinite(result[code]) || result[code] <= 0)) throw new Error("Required display currency FX rates are unavailable");
  return result;
}

export function parseCatalogPrice(price: string): { amount: number; currency: SupportedCatalogCurrency } | null {
  const normalized = price.trim();
  if (/\+|contact/i.test(normalized)) return null;
  const symbolMatch = /^([₹$£])([\d,]+(?:\.\d+)?)$/.exec(normalized);
  if (symbolMatch) {
    const currency = symbolMatch[1] === "$" ? "USD" : symbolMatch[1] === "₹" ? "INR" : "GBP";
    return { amount: Number(symbolMatch[2].replaceAll(",", "")), currency };
  }
  const idrMatch = /^([\d,]+(?:\.\d+)?)\s*K\s*IDR$/i.exec(normalized);
  if (idrMatch) return { amount: Number(idrMatch[1].replaceAll(",", "")) * 1_000, currency: "IDR" };
  return null;
}

export async function quoteCatalogPriceToUsd(price: string) {
  const parsed = parseCatalogPrice(price);
  if (!parsed || !Number.isFinite(parsed.amount) || parsed.amount <= 0) throw new Error("This product requires an admin quote before crypto checkout");
  if (parsed.currency === "USD") return { usd: parsed.amount, sourceCurrency: "USD" as const };
  const response = await fetch("https://open.er-api.com/v6/latest/USD", { headers: { accept: "application/json" }, cache: "no-store" });
  if (!response.ok) throw new Error(`FX rate provider returned ${response.status}`);
  const data = await response.json() as { rates?: Record<string, number> };
  const rate = data.rates?.[parsed.currency];
  if (!rate || !Number.isFinite(rate) || rate <= 0) throw new Error(`No USD FX rate available for ${parsed.currency}`);
  return { usd: parsed.amount / rate, sourceCurrency: parsed.currency };
}
