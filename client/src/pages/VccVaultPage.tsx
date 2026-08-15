import StoreShell from "@/components/StoreShell";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowUpRight, LockKeyhole, ShieldCheck, WalletCards } from "lucide-react";
import { Link } from "wouter";

export default function VccVaultPage() {
  const { isAuthenticated, loading } = useAuth();
  const entitlements = trpc.vcc.mine.useQuery(undefined, { enabled: isAuthenticated });
  if (loading) return <StoreShell><div className="commerce-empty">Opening VCC handoff desk…</div></StoreShell>;
  if (!isAuthenticated) return <StoreShell><section className="wallet-page"><span className="catalog-kicker">MY VCC / SECURE HANDOFF</span><h1>Keep access<br /><em>protected.</em></h1><div className="account-gate"><LockKeyhole size={27} /><h2>Sign in to view VCC handoffs.</h2><p>Only manually prepared handoff metadata belonging to your authenticated account appears here.</p><button className="button-primary" onClick={startLogin}>Sign in to continue <ArrowUpRight size={16} /></button></div></section></StoreShell>;
  return <StoreShell><section className="wallet-page"><span className="catalog-kicker">MY VCC / SECURE HANDOFF</span><div className="wallet-heading"><div><h1>Metadata,<br /><em>not credentials.</em></h1><p>This is a status desk for manually prepared VCC orders. It never displays card numbers, CVVs, expiry dates, or reusable virtual-card credentials.</p></div><div className="referral-code-card"><ShieldCheck size={18} /><span>Secure delivery rule</span><strong>MANUAL</strong><p>A confirmed handoff indicates the administrator completed a separate approved delivery process.</p></div></div><div className="gift-card-grid">{entitlements.isLoading ? <div className="commerce-empty">Loading VCC handoffs…</div> : entitlements.data?.length ? entitlements.data.map((item) => <article key={item.id}><span>{item.status.replaceAll("_", " ")}</span><h2>{item.title}</h2><strong>{item.maskedReference}</strong><p>{item.handoffNote || "Manual handoff status is recorded here."}</p><small>{new Date(item.updatedAt).toLocaleString()}</small></article>) : <div className="commerce-empty"><p>No VCC handoff records exist for this account yet. After payment approval, an administrator can prepare a secure handoff record.</p><Link href="/vcc" className="button-primary">Browse VCC routes <ArrowUpRight size={16} /></Link></div>}</div><div className="vcc-safety"><WalletCards size={18} /><div><b>Never share card credentials through support.</b><p>Support and Telegram may reference your order or masked handoff identifier, but they must not request or receive full virtual-card details.</p></div></div></section></StoreShell>;
}
