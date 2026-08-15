import { describe, expect, it } from "vitest";
import { USDT_BEP20_CONTRACT } from "./payments/config";

const requireEnv = (key: string) => {
  const value = process.env[key];
  if (!value) throw new Error(`${key} is not configured`);
  return value;
};

const getJson = async (url: string) => {
  const response = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  expect(response.ok).toBe(true);
  return response.json() as Promise<any>;
};

describe("configured public receiving addresses", () => {
  const liveNetworkIt = process.env.RUN_NETWORK_TESTS === "1" ? it : it.skip;

  liveNetworkIt("resolve through their lightweight network endpoints", async () => {
    const ton = requireEnv("PAYMENT_TON_ADDRESS");
    const solana = requireEnv("PAYMENT_SOLANA_ADDRESS");
    const btc = requireEnv("PAYMENT_BTC_ADDRESS");
    const eth = requireEnv("PAYMENT_ETH_ADDRESS");
    const bsc = requireEnv("PAYMENT_USDT_BEP20_ADDRESS");
    const usdtContract = USDT_BEP20_CONTRACT;

    const [tonData, solanaData, btcData, ethData, bscData, tokenData] = await Promise.all([
      getJson(`https://toncenter.com/api/v2/getAddressInformation?address=${encodeURIComponent(ton)}`),
      fetch("https://api.mainnet-beta.solana.com", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getBalance", params: [solana] }), signal: AbortSignal.timeout(15_000) }).then(async (response) => { expect(response.ok).toBe(true); return response.json() as Promise<any>; }),
      getJson(`https://mempool.space/api/v1/validate-address/${encodeURIComponent(btc)}`),
      getJson(`https://eth.blockscout.com/api/v2/addresses/${encodeURIComponent(eth)}`),
      fetch("https://bsc-dataseed.binance.org", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_getBalance", params: [bsc, "latest"] }), signal: AbortSignal.timeout(15_000) }).then(async (response) => { expect(response.ok).toBe(true); return response.json() as Promise<any>; }),
      fetch("https://bsc-dataseed.binance.org", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 2, method: "eth_getCode", params: [usdtContract, "latest"] }), signal: AbortSignal.timeout(15_000) }).then(async (response) => { expect(response.ok).toBe(true); return response.json() as Promise<any>; }),
    ]);

    expect(tonData.ok).toBe(true);
    expect(solanaData.result).toBeTruthy();
    expect(btcData.isvalid).toBe(true);
    expect(ethData.hash?.toLowerCase()).toBe(eth.toLowerCase());
    expect(typeof bscData.result).toBe("string");
    expect(tokenData.result).not.toBe("0x");
  }, 30_000);
});
