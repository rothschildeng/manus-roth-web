import { z } from "zod";

export const paymentChainSchema = z.enum(["TON", "USDT_BEP20", "SOLANA", "BTC", "ETH"]);
export type PaymentChain = z.infer<typeof paymentChainSchema>;

export const walletConfigSchema = z.object({
  chain: paymentChainSchema,
  address: z.string().trim().min(1),
});

export type WalletConfig = z.infer<typeof walletConfigSchema>;

const envAddress = (key: string) => (process.env[key] ?? "").trim();

export const requiredConfirmations: Record<PaymentChain, number> = {
  TON: 1,
  USDT_BEP20: 15,
  SOLANA: 1,
  BTC: 3,
  ETH: 12,
};

export const walletConfigs: Record<PaymentChain, WalletConfig> = {
  TON: { chain: "TON", address: envAddress("PAYMENT_TON_ADDRESS") },
  USDT_BEP20: { chain: "USDT_BEP20", address: envAddress("PAYMENT_USDT_BEP20_ADDRESS") },
  SOLANA: { chain: "SOLANA", address: envAddress("PAYMENT_SOLANA_ADDRESS") },
  BTC: { chain: "BTC", address: envAddress("PAYMENT_BTC_ADDRESS") },
  ETH: { chain: "ETH", address: envAddress("PAYMENT_ETH_ADDRESS") },
};

export const paymentAssetByChain: Record<PaymentChain, string> = {
  TON: "TON",
  USDT_BEP20: "USDT",
  SOLANA: "SOL",
  BTC: "BTC",
  ETH: "ETH",
};

// Verified BNB Smart Chain BSC-USD / USDT-compatible token contract.
// This is a public token identifier, not a customer credential or receiving wallet.
export const USDT_BEP20_CONTRACT = "0x55d398326f99059ff775485246999027b3197955";

export function getWalletConfig(chain: PaymentChain) {
  const config = walletConfigSchema.parse(walletConfigs[chain]);
  if (!config.address) {
    throw new Error(`Payment address is not configured for ${chain}`);
  }
  return { ...config, requiredConfirmations: requiredConfirmations[chain], asset: paymentAssetByChain[chain] };
}

export function isPaymentsConfigured() {
  return Object.values(walletConfigs).every((config) => config.address.length > 0) && Boolean(process.env.DATABASE_URL);
}
