import { getPaymentOrder, markCryptoDepositPendingReview, recordOrderNotification, recordPaymentTransaction, updatePaymentOrder } from "../db";
import { getWalletConfig, PaymentChain, USDT_BEP20_CONTRACT } from "./config";
import { baseUnitsToDecimal, confirmationsFromHeights, decimalToBaseUnits } from "./amounts";

export type ObservedPayment = { txHash: string; amountBaseUnits: bigint; confirmations: number; chain?: PaymentChain };

export type ReconciliationResult =
  | { status: "expired" }
  | { status: "unmatched" }
  | { status: "confirming" | "pending_admin"; match: ObservedPayment };

/**
 * Deterministic reconciliation boundary for an observed chain payment. The
 * caller performs persistence separately, allowing this exact business rule to
 * be regression-tested without blockchain or database access.
 */
export function reconcileObservedPayment(input: {
  now: number;
  expiresAt: Date;
  expectedBaseUnits: bigint;
  requiredConfirmations: number;
  chain?: PaymentChain;
  observed: ObservedPayment[];
}): ReconciliationResult {
  if (input.now > input.expiresAt.getTime()) return { status: "expired" };
  const match = input.observed.find((candidate) => candidate.amountBaseUnits >= input.expectedBaseUnits && (!input.chain || !candidate.chain || candidate.chain === input.chain));
  if (!match) return { status: "unmatched" };
  return { status: match.confirmations >= input.requiredConfirmations ? "pending_admin" : "confirming", match };
}

const rpc = async (url: string, body: unknown) => {
  const response = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  if (!response.ok) throw new Error(`RPC request failed with ${response.status}`);
  return response.json() as Promise<any>;
};

const get = async (url: string) => {
  const response = await fetch(url, { headers: { accept: "application/json" } });
  if (!response.ok) throw new Error(`Blockchain request failed with ${response.status}`);
  return response.json() as Promise<any>;
};

export const getTonPayments = async (address: string): Promise<ObservedPayment[]> => {
  const data = await get(`https://toncenter.com/api/v2/getTransactions?address=${encodeURIComponent(address)}&limit=20`);
  return (data.result ?? []).flatMap((tx: any) => {
    const message = tx.in_msg;
    if (!message || message.destination !== address || !message.value) return [];
    return [{ txHash: tx.transaction_id?.hash ?? "", amountBaseUnits: BigInt(message.value), confirmations: 1 }];
  }).filter((tx: ObservedPayment) => tx.txHash);
};

export const getSolanaPayments = async (address: string): Promise<ObservedPayment[]> => {
  const signatures = await rpc("https://api.mainnet-beta.solana.com", { jsonrpc: "2.0", id: 1, method: "getSignaturesForAddress", params: [address, { commitment: "finalized", limit: 20 }] });
  const results: ObservedPayment[] = [];
  for (const item of signatures.result ?? []) {
    if (item.err) continue;
    const tx = await rpc("https://api.mainnet-beta.solana.com", { jsonrpc: "2.0", id: 1, method: "getTransaction", params: [item.signature, { encoding: "jsonParsed", commitment: "finalized", maxSupportedTransactionVersion: 0 }] });
    const accountKeys = tx.result?.transaction?.message?.accountKeys ?? [];
    const index = accountKeys.findIndex((key: any) => (typeof key === "string" ? key : key.pubkey) === address);
    if (index < 0) continue;
    const before = BigInt(tx.result?.meta?.preBalances?.[index] ?? 0);
    const after = BigInt(tx.result?.meta?.postBalances?.[index] ?? 0);
    if (after > before) results.push({ txHash: item.signature, amountBaseUnits: after - before, confirmations: 1 });
  }
  return results;
};

export const getBtcPayments = async (address: string): Promise<ObservedPayment[]> => {
  const [txs, tipHeight] = await Promise.all([
    get(`https://mempool.space/api/address/${encodeURIComponent(address)}/txs/chain`),
    fetch("https://mempool.space/api/blocks/tip/height").then((res) => res.text()),
  ]);
  const tip = Number(tipHeight);
  return (txs ?? []).flatMap((tx: any) => {
    const amount = (tx.vout ?? []).filter((output: any) => output.scriptpubkey_address === address).reduce((sum: bigint, output: any) => sum + BigInt(output.value ?? 0), BigInt(0));
    if (!amount) return [];
    const confirmations = tx.status?.confirmed ? Math.max(1, tip - Number(tx.status.block_height ?? tip) + 1) : 0;
    return [{ txHash: tx.txid, amountBaseUnits: amount, confirmations }];
  });
};

export const getEvmPayments = async (chain: "ETH" | "USDT_BEP20", address: string): Promise<ObservedPayment[]> => {
  if (chain === "USDT_BEP20") {
    const contract = USDT_BEP20_CONTRACT;
    const rpcUrl = "https://bsc-dataseed.binance.org";
    const latestResult = await rpc(rpcUrl, { jsonrpc: "2.0", id: 1, method: "eth_blockNumber", params: [] });
    const latest = Number.parseInt(latestResult.result, 16);
    const recipientTopic = `0x${address.toLowerCase().replace(/^0x/, "").padStart(64, "0")}`;
    const logs = await rpc(rpcUrl, { jsonrpc: "2.0", id: 2, method: "eth_getLogs", params: [{ address: contract, fromBlock: `0x${Math.max(0, latest - 2000).toString(16)}`, toBlock: "latest", topics: ["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef", null, recipientTopic] }] });
    return (logs.result ?? []).map((log: any) => ({ txHash: log.transactionHash, amountBaseUnits: BigInt(log.data), confirmations: Math.max(1, latest - Number.parseInt(log.blockNumber, 16) + 1) }));
  }
  const [data, latestResult] = await Promise.all([
    get(`https://eth.blockscout.com/api/v2/addresses/${encodeURIComponent(address)}/transactions?filter=to`),
    rpc("https://ethereum-rpc.publicnode.com", { jsonrpc: "2.0", id: 1, method: "eth_blockNumber", params: [] }),
  ]);
  const latest = Number.parseInt(latestResult.result, 16);
  return (data.items ?? []).flatMap((item: any) => {
    if (item.to?.hash?.toLowerCase() !== address.toLowerCase() || !item.value) return [];
    const transactionBlock = Number(item.block_number ?? item.block?.height ?? 0);
    return [{ txHash: item.hash, amountBaseUnits: BigInt(item.value), confirmations: confirmationsFromHeights(latest, transactionBlock) }];
  }).filter((tx: ObservedPayment) => tx.txHash);
};


export const observe = async (chain: PaymentChain, address: string): Promise<ObservedPayment[]> => {
  const raw = chain === "TON" ? await getTonPayments(address) : chain === "SOLANA" ? await getSolanaPayments(address) : chain === "BTC" ? await getBtcPayments(address) : await getEvmPayments(chain, address);
  return raw.map((payment) => ({ ...payment, chain }));
};

export async function refreshPaymentOrder(orderId: string) {
  const order = await getPaymentOrder(orderId);
  if (!order) throw new Error("Payment order not found");
  if (order.chain === "WALLET") return order;
  if (["approved", "fulfillment_ready", "delivered", "rejected", "expired"].includes(order.status)) return order;
  const wallet = getWalletConfig(order.chain);
  const observed = await observe(order.chain, wallet.address);
  const decimals = order.chain === "BTC" ? 8 : order.chain === "SOLANA" ? 9 : order.chain === "TON" ? 9 : order.chain === "USDT_BEP20" ? 18 : 18;
  const expected = decimalToBaseUnits(String(order.expectedAmount), decimals);
  const reconciliation = reconcileObservedPayment({ now: Date.now(), expiresAt: order.expiresAt, expectedBaseUnits: expected, requiredConfirmations: order.requiredConfirmations, chain: order.chain, observed });
  if (reconciliation.status === "expired") return updatePaymentOrder(orderId, { status: "expired" });
  if (reconciliation.status === "unmatched") return order;
  const { match } = reconciliation;

  await recordPaymentTransaction({ orderId, chain: order.chain, txHash: match.txHash, amount: baseUnitsToDecimal(match.amountBaseUnits, decimals), confirmations: match.confirmations, observedAt: new Date() });
  const updated = await updatePaymentOrder(orderId, { txHash: match.txHash, confirmations: match.confirmations, status: reconciliation.status });
  if (order.status !== "pending_admin" && reconciliation.status === "pending_admin") await recordOrderNotification(orderId, order.customerId, "pending_review");
  if (order.purpose === "wallet_deposit" && reconciliation.status === "pending_admin") await markCryptoDepositPendingReview(orderId);
  return updated;
}
