import StoreShell from "@/components/StoreShell";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowUpRight, Gift, ShieldCheck } from "lucide-react";

export default function GiftCardsPage() {
  const { isAuthenticated, loading } = useAuth();
  const overview = trpc.wallet.overview.useQuery(undefined, { enabled: isAuthenticated });
  if (loading) return <StoreShell><div className="commerce-empty">Opening gift-card desk…</div></StoreShell>;
  if (!isAuthenticated) return <StoreShell><section className="wallet-page"><span className="catalog-kicker">MY GIFT CARDS / ACCOUNT ACCESS</span><h1>Keep issued<br /><em>value visible.</em></h1><div className="account-gate"><Gift size={27} /><h2>Sign in to view issued entitlements.</h2><p>Only gift cards actually issued to your authenticated account can appear here.</p><button className="button-primary" onClick={startLogin}>Sign in to continue <ArrowUpRight size={16} /></button></div></section></StoreShell>;
  return <StoreShell><section className="wallet-page"><span className="catalog-kicker">MY GIFT CARDS / ISSUED ENTITLEMENTS</span><div className="wallet-heading"><div><h1>Only real<br /><em>issued value.</em></h1><p>This desk lists entitlements issued by the manual delivery process. It does not create demonstrative codes or show any unverified card balance.</p></div><div className="referral-code-card"><ShieldCheck size={18} /><span>Secure code policy</span><strong>MASKED</strong><p>Raw codes require an approved secure vault; they are never placed in browser history or a Telegram message.</p></div></div><div className="gift-card-grid">{overview.isLoading ? <div className="commerce-empty">Loading issued gift cards…</div> : overview.data?.giftCards.length ? overview.data.giftCards.map((card) => <article key={card.id}><span>{card.status}</span><h2>{card.title}</h2><strong>{card.codeMasked}</strong><p>{card.expiresAt ? `Expires ${new Date(card.expiresAt).toLocaleDateString()}` : "No expiry recorded"}</p><button className="button-outline" disabled>Secure reveal unavailable</button></article>) : <div className="commerce-empty">No gift-card entitlements have been issued to this account. Delivered products will appear here once a secure entitlement workflow is configured.</div>}</div></section></StoreShell>;
}
