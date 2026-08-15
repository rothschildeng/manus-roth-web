import StoreShell from "@/components/StoreShell";
import { startLogin } from "@/const";
import { ArrowUpRight, LockKeyhole, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  return <StoreShell><section className="login-page"><span className="catalog-kicker">ACCOUNT ACCESS / SECURE ENTRY</span><h1>Open your<br /><em>private desk.</em></h1><div className="login-card"><LockKeyhole size={26} /><h2>Continue securely</h2><p>Account access uses the site’s existing secure sign-in provider. There is no locally stored password, unverified OTP, or customer credential field in this storefront.</p><button className="button-primary" onClick={startLogin}>Secure sign in <ArrowUpRight size={16} /></button><div><ShieldCheck size={14} /> Your account keeps orders, saved addresses, and wishlist preferences together.</div></div></section></StoreShell>;
}
