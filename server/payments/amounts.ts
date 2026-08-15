import type { PaymentChain } from "./config";

const baseDecimals: Record<PaymentChain, number> = {
  TON: 9,
  USDT_BEP20: 18,
  SOLANA: 9,
  BTC: 8,
  ETH: 18,
};

const quotePrecision: Record<PaymentChain, number> = {
  TON: 5,
  USDT_BEP20: 6,
  SOLANA: 5,
  BTC: 8,
  ETH: 7,
};

export function decimalToBaseUnits(value: string, decimals: number) {
  const [whole, fraction = ""] = value.split(".");
  const normalized = `${fraction}${"0".repeat(decimals)}`.slice(0, decimals);
  return BigInt(whole || "0") * BigInt(`1${"0".repeat(decimals)}`) + BigInt(normalized || "0");
}

export function baseUnitsToDecimal(value: bigint, decimals: number) {
  const raw = value.toString().padStart(decimals + 1, "0");
  const splitAt = raw.length - decimals;
  return `${raw.slice(0, splitAt)}.${raw.slice(splitAt)}`.replace(/\.?0+$/, "");
}

export function uniquePaymentAmount(chain: PaymentChain, quoteAmount: string, orderId: string) {
  const decimals = baseDecimals[chain];
  const precision = quotePrecision[chain];
  const suffix = BigInt((Number.parseInt(orderId.slice(-6), 16) % 997) + 1);
  const increment = BigInt(`1${"0".repeat(decimals - precision)}`);
  return baseUnitsToDecimal(decimalToBaseUnits(quoteAmount, decimals) + suffix * increment, decimals);
}

export function confirmationsFromHeights(latestBlock: number, transactionBlock: number | null | undefined) {
  if (!transactionBlock || transactionBlock > latestBlock) return 0;
  return Math.max(1, latestBlock - transactionBlock + 1);
}
