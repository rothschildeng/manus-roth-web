import StoreShell from "@/components/StoreShell";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowUpRight, BadgeDollarSign, BellRing, Bitcoin, ClipboardCheck, Copy, Gift, History, ShieldCheck, WalletCards } from "lucide-react";
import { useState } from "react";

const money = (value: unknown) => `$${Number(value ?? 0).toFixed(2)}`;
const flipkartLogo = "/manus-storage/flipkart_a0519cde.jpg";
const cryptoOptions = [
  { value: "USDT_BEP20", label: "USDT · BNB Smart Chain" },
  { value: "TON", label: "TON" },
  { value: "SOLANA", label: "Solana" },
  { value: "BTC", label: "Bitcoin" },
  { value: "ETH", label: "Ethereum" },
] as const;

type DepositMode = "flipkart" | "crypto";

export default function WalletPage() {
  const { isAuthenticated, loading } = useAuth();
  const overview = trpc.wallet.overview.useQuery(undefined, { enabled: isAuthenticated });
  const createDeposit = trpc.wallet.createDeposit.useMutation({ onSuccess: () => overview.refetch() });
  const createCryptoDeposit = trpc.wallet.createCryptoDeposit.useMutation({ onSuccess: () => overview.refetch() });
  const [amount, setAmount] = useState("25");
  const [reference, setReference] = useState("");
  const [mode, setMode] = useState<DepositMode>("flipkart");
  const [chain, setChain] = useState<(typeof cryptoOptions)[number]["value"]>("USDT_BEP20");
  const [createdCode, setCreatedCode] = useState("");
  const [cryptoRequest, setCryptoRequest] = useState<{ orderId: string; expectedAmount: string; asset: string; address: string; expiresAt: Date } | null>(null);
  const [error, setError] = useState("");

  const submitFlipkart = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setCreatedCode("");
    try {
      const deposit = await createDeposit.mutateAsync({ amount: Number(amount), sourceType: "gift_card_review", reference });
      setCreatedCode(deposit?.requestCode ?? "");
      setReference("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Deposit request could not be created.");
    }
  };

  const submitCrypto = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setCryptoRequest(null);
    try {
      const created = await createCryptoDeposit.mutateAsync({ amount: Number(amount), chain, expiresInMinutes: 30 });
      if (!created.order) throw new Error("Crypto deposit request could not be created.");
      setCryptoRequest({ orderId: created.order.orderId, expectedAmount: created.order.expectedAmount, asset: created.asset, address: created.address, expiresAt: created.order.expiresAt });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Crypto deposit request could not be created.");
    }
  };

  if (loading) return <StoreShell><div className="commerce-empty">Opening your wallet…</div></StoreShell>;
  if (!isAuthenticated) return <StoreShell><section className="wallet-page"><span className="catalog-kicker">WALLET / PRIVATE BALANCE</span><h1>Fund with<br /><em>review.</em></h1><div className="account-gate"><div className="flex items-center gap-3"><img src={flipkartLogo} alt="Flipkart" className="h-12 w-12 rounded-xl object-cover" /><Bitcoin className="h-10 w-10 text-[#c7f34a]" /></div><h2>Flipkart or crypto deposit</h2><p>Sign in to submit a Flipkart gift-card request or a crypto wallet-funding request. Both routes remain manual-review deposits; no balance is credited automatically.</p><button className="button-primary" onClick={startLogin}>Sign in to fund wallet <ArrowUpRight size={16} /></button></div></section></StoreShell>;

  const account = overview.data?.account;
  const sourceLabel = (sourceType: string) => sourceType === "gift_card_review" ? "Flipkart gift card" : sourceType === "crypto_review" ? "Crypto deposit" : "Manual source";
  return <StoreShell><section className="wallet-page"><span className="catalog-kicker">MY WALLET / MANUAL REVIEW</span><div className="wallet-heading"><div><h1>Keep every<br /><em>credit visible.</em></h1><p>Balance updates only after a manual admin decision. This page never creates an automatic credit or asks for a wallet private key.</p></div><div className="wallet-balance-card"><span><BadgeDollarSign size={15} /> Available balance</span><strong>{overview.isLoading ? "…" : money(account?.availableBalance)}</strong><small>USD display balance</small></div></div><div className="wallet-grid"><section id="deposit" className="wallet-panel"><div className="wallet-panel-head"><ClipboardCheck size={19} /><div><span>FUND WALLET</span><h2>Submit for review.</h2></div></div><div className="mt-5 grid grid-cols-2 gap-2"><button type="button" onClick={() => { setMode("flipkart"); setError(""); }} className={mode === "flipkart" ? "button-primary !h-11" : "button-outline !h-11"}>Flipkart gift card</button><button type="button" onClick={() => { setMode("crypto"); setError(""); }} className={mode === "crypto" ? "button-primary !h-11" : "button-outline !h-11"}>Crypto deposit</button></div>{mode === "flipkart" ? <><div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", margin: "18px 0", border: "1px solid rgba(199,243,74,.28)", background: "rgba(199,243,74,.06)" }}><img src={flipkartLogo} alt="Flipkart" style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 10 }} /><div style={{ display: "grid", gap: 3 }}><span style={{ color: "#c7f34a", fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase" }}>Supported deposit source</span><strong style={{ color: "#f5f7ef" }}>Flipkart gift card</strong><small style={{ color: "rgba(245,247,239,.68)" }}>Submit the card code/reference for manual verification.</small></div></div><form onSubmit={submitFlipkart} className="deposit-form"><label>Amount (USD)<input inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} min="25" type="number" required /></label><label>Flipkart gift-card code/reference<input value={reference} onChange={(event) => setReference(event.target.value)} minLength={4} maxLength={128} placeholder="Enter Flipkart code/reference for review" required /></label><small><ShieldCheck size={13} /> Reference is immediately masked; the site does not store the full gift-card code or send it to a bot.</small><button className="button-primary" disabled={createDeposit.isPending}>{createDeposit.isPending ? "Creating request…" : "Create review request"}<ArrowUpRight size={16} /></button></form>{createdCode && <RequestReference code={createdCode} />}</> : <><div className="mt-5 border border-[#c7f34a]/25 bg-[#c7f34a]/[.05] p-4 text-sm text-[#dce3d3]"><div className="mb-2 flex items-center gap-2 text-[#c7f34a]"><Bitcoin size={18} /><b>Crypto wallet funding</b></div><p>Send the exact amount only after creating this request. Chain confirmation moves it to admin review; wallet balance still needs manual approval.</p></div><form onSubmit={submitCrypto} className="deposit-form"><label>Amount (USD)<input inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} min="25" type="number" required /></label><label>Network<select value={chain} onChange={(event) => setChain(event.target.value as typeof chain)}>{cryptoOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label><small><ShieldCheck size={13} /> This is a wallet deposit, not product checkout. Confirmed crypto deposits enter manual credit review.</small><button className="button-primary" disabled={createCryptoDeposit.isPending}>{createCryptoDeposit.isPending ? "Preparing crypto request…" : "Create crypto deposit request"}<ArrowUpRight size={16} /></button></form>{cryptoRequest && <div className="deposit-created"><span>CRYPTO DEPOSIT REQUEST</span><strong>{cryptoRequest.orderId}</strong><p>Send exactly <b>{cryptoRequest.expectedAmount} {cryptoRequest.asset}</b> to the selected address before {new Date(cryptoRequest.expiresAt).toLocaleTimeString()}.</p><code className="block break-all border border-white/15 bg-black/20 p-3 text-xs text-[#f5f7ef]">{cryptoRequest.address}</code><button className="button-outline mt-3" onClick={() => navigator.clipboard?.writeText(cryptoRequest.address)}><Copy size={14} /> Copy address</button><p className="mt-3 text-xs text-[#a7b1a3]">After required confirmations, this request appears in the admin wallet-review queue. No automatic wallet credit occurs.</p></div>}</>}{error && <p className="payment-error">{error}</p>}</section><section className="wallet-panel wallet-offer-panel"><div className="wallet-panel-head"><Gift size={19} /><div><span>REVIEW RULES</span><h2>Credit controls.</h2></div></div><p>There are no active automatic deposit bonuses. All Flipkart and crypto funding requests receive the same manual review before balance changes.</p><div className="wallet-rule"><b>1</b><span>Create a request of at least $25.</span></div><div className="wallet-rule"><b>2</b><span>For crypto, send the exact quoted amount on the selected network.</span></div><div className="wallet-rule"><b>3</b><span>Admin verifies the request before balance credit.</span></div></section></div><WalletHistory title="DEPOSIT HISTORY" subtitle="Request trail." icon={<History size={19} />} loading={overview.isLoading}>{overview.data?.deposits.length ? <div className="wallet-table">{overview.data.deposits.map((deposit) => <article key={deposit.id}><div><span className={`wallet-status ${deposit.status}`}>{deposit.status.replaceAll("_", " ")}</span><h3>{sourceLabel(deposit.sourceType)} · {deposit.requestCode}</h3><p>{deposit.referenceMasked} · {new Date(deposit.createdAt).toLocaleString()}</p>{deposit.reviewNote && <small>{deposit.reviewNote}</small>}</div><strong>{money(deposit.requestedAmount)}</strong></article>)}</div> : <div className="commerce-empty">No deposit requests yet. Create one above to begin the manual review process.</div>}</WalletHistory><WalletHistory title="WALLET STATUS" subtitle="In-app signals." icon={<BellRing size={19} />} loading={overview.isLoading}>{overview.data?.notifications.length ? <div className="wallet-table">{overview.data.notifications.map((notice) => <article key={notice.id}><div><span>{notice.event.replaceAll("_", " ")}</span><h3>Deposit request #{notice.depositRequestId}</h3><p>{new Date(notice.createdAt).toLocaleString()} · In app</p></div><strong className="wallet-positive">Recorded</strong></article>)}</div> : <div className="commerce-empty">Deposit request, confirmation, approval, and rejection signals will appear here.</div>}</WalletHistory><WalletHistory title="WALLET LEDGER" subtitle="Verified movements." icon={<WalletCards size={19} />} loading={overview.isLoading}>{overview.data?.ledger.length ? <div className="wallet-table">{overview.data.ledger.map((entry) => <article key={entry.id}><div><span>{entry.kind.replaceAll("_", " ")}</span><h3>{entry.description}</h3><p>{new Date(entry.createdAt).toLocaleString()}</p></div><strong className={Number(entry.amount) >= 0 ? "wallet-positive" : "wallet-negative"}>{Number(entry.amount) >= 0 ? "+" : ""}{money(entry.amount)}</strong></article>)}</div> : <div className="commerce-empty">Your ledger will show approved credits and controlled balance movements here.</div>}</WalletHistory></section></StoreShell>;
}

function RequestReference({ code }: { code: string }) { return <div className="deposit-created"><span>REQUEST CREATED</span><strong>{code}</strong><p>Your request is awaiting manual verification. Share this ROTH reference with support/admin only if needed.</p><button className="button-outline" onClick={() => navigator.clipboard?.writeText(code)}><Copy size={14} /> Copy reference</button></div>; }

function WalletHistory({ title, subtitle, icon, loading, children }: { title: string; subtitle: string; icon: React.ReactNode; loading: boolean; children: React.ReactNode }) { return <div className="wallet-history"><div className="wallet-panel-head">{icon}<div><span>{title}</span><h2>{subtitle}</h2></div></div>{loading ? <div className="commerce-empty">Loading wallet records…</div> : children}</div>; }
