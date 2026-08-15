import { afterEach, describe, expect, it, vi } from "vitest";
import { getBtcPayments, getEvmPayments, getSolanaPayments, getTonPayments, reconcileObservedPayment } from "./payments/monitor";

const json = (body: unknown) => ({ ok: true, json: async () => body }) as Response;
const text = (body: string) => ({ ok: true, text: async () => body }) as Response;
const future = new Date(Date.now() + 60_000);
const statusFor = (observed: Awaited<ReturnType<typeof getTonPayments>>) => reconcileObservedPayment({ now: Date.now(), expiresAt: future, expectedBaseUnits: 100n, requiredConfirmations: 1, observed }).status;

afterEach(() => vi.unstubAllGlobals());

describe("direct chain monitor adapters", () => {
  it("parses inbound TON amounts", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => json({ result: [{ transaction_id: { hash: "ton-hash" }, in_msg: { destination: "ton-wallet", value: "100" } }] })));
    const observed = await getTonPayments("ton-wallet");
    expect(observed).toEqual([{ txHash: "ton-hash", amountBaseUnits: 100n, confirmations: 1 }]);
    expect(statusFor(observed)).toBe("pending_admin");
  });

  it("parses finalized Solana balance deltas", async () => {
    vi.stubGlobal("fetch", vi.fn(async (_url: string, init?: RequestInit) => {
      const method = JSON.parse(String(init?.body)).method;
      if (method === "getSignaturesForAddress") return json({ result: [{ signature: "sol-hash", err: null }] });
      return json({ result: { transaction: { message: { accountKeys: [{ pubkey: "sol-wallet" }] } }, meta: { preBalances: [300], postBalances: [450] } } });
    }));
    const observed = await getSolanaPayments("sol-wallet");
    expect(observed).toEqual([{ txHash: "sol-hash", amountBaseUnits: 150n, confirmations: 1 }]);
    expect(statusFor(observed)).toBe("pending_admin");
  });

  it("derives Bitcoin confirmations from the chain tip", async () => {
    vi.stubGlobal("fetch", vi.fn(async (url: string) => url.includes("tip/height") ? text("250") : json([{ txid: "btc-hash", vout: [{ scriptpubkey_address: "btc-wallet", value: 100 }], status: { confirmed: true, block_height: 248 } }])));
    const observed = await getBtcPayments("btc-wallet");
    expect(observed).toEqual([{ txHash: "btc-hash", amountBaseUnits: 100n, confirmations: 3 }]);
    expect(reconcileObservedPayment({ now: Date.now(), expiresAt: future, expectedBaseUnits: 100n, requiredConfirmations: 3, observed }).status).toBe("pending_admin");
  });

  it("derives native Ethereum confirmations from block heights", async () => {
    vi.stubGlobal("fetch", vi.fn(async (url: string) => url.includes("blockscout") ? json({ items: [{ hash: "eth-hash", value: "100", to: { hash: "0xeth" }, block_number: 89 }] }) : json({ result: "0x64" })));
    const observed = await getEvmPayments("ETH", "0xeth");
    expect(observed).toEqual([{ txHash: "eth-hash", amountBaseUnits: 100n, confirmations: 12 }]);
    expect(reconcileObservedPayment({ now: Date.now(), expiresAt: future, expectedBaseUnits: 100n, requiredConfirmations: 12, observed }).status).toBe("pending_admin");
  });

  it("parses USDT-BEP20 transfer logs and block-depth confirmations", async () => {
    vi.stubGlobal("fetch", vi.fn(async (_url: string, init?: RequestInit) => {
      const method = JSON.parse(String(init?.body)).method;
      if (method === "eth_blockNumber") return json({ result: "0x64" });
      return json({ result: [{ transactionHash: "bep20-hash", data: "0x64", blockNumber: "0x56" }] });
    }));
    const observed = await getEvmPayments("USDT_BEP20", "0xbsc");
    expect(observed).toEqual([{ txHash: "bep20-hash", amountBaseUnits: 100n, confirmations: 15 }]);
    expect(reconcileObservedPayment({ now: Date.now(), expiresAt: future, expectedBaseUnits: 100n, requiredConfirmations: 15, observed }).status).toBe("pending_admin");
  });
});
