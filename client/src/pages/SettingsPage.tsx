import StoreShell from "@/components/StoreShell";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { ArrowUpRight, LogOut, MapPin, ShieldCheck, UserRound } from "lucide-react";
import { Link } from "wouter";

export default function SettingsPage() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  if (loading) return <StoreShell><div className="commerce-empty">Opening account settings…</div></StoreShell>;
  if (!isAuthenticated) return <StoreShell><section className="wallet-page"><span className="catalog-kicker">SETTINGS / ACCOUNT ACCESS</span><h1>Keep your<br /><em>access secure.</em></h1><div className="account-gate"><ShieldCheck size={27} /><h2>Sign in to manage settings.</h2><p>Settings are available only for your authenticated account.</p><button className="button-primary" onClick={startLogin}>Sign in to continue <ArrowUpRight size={16} /></button></div></section></StoreShell>;
  return <StoreShell><section className="wallet-page"><span className="catalog-kicker">SETTINGS / PRIVATE ACCOUNT</span><div className="wallet-heading"><div><h1>Your<br /><em>account controls.</em></h1><p>Manage address convenience, review the authentication identity used on this storefront, or safely end this browser session.</p></div><div className="referral-code-card"><UserRound size={18} /><span>Signed in as</span><strong>{user?.name ?? "Account"}</strong><p>{user?.email ?? "Secure session"}</p></div></div><div className="wallet-grid"><section className="wallet-panel"><div className="wallet-panel-head"><MapPin size={19} /><div><span>ADDRESS BOOK</span><h2>Delivery details.</h2></div></div><p>Saved addresses are managed in the account desk and may be used only where the selected product supports physical delivery.</p><Link href="/account#addresses" className="button-primary">Manage addresses <ArrowUpRight size={16} /></Link></section><section className="wallet-panel"><div className="wallet-panel-head"><LogOut size={19} /><div><span>SESSION</span><h2>Sign out safely.</h2></div></div><p>Signing out removes this browser session. It does not remove order, wallet, or account records held under your authenticated identity.</p><button className="button-outline" onClick={logout}><LogOut size={14} /> Sign out</button></section></div></section></StoreShell>;
}
