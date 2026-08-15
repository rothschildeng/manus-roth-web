import StoreShell from "@/components/StoreShell";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { useCart } from "@/contexts/CartContext";
import { useStorePreferences } from "@/contexts/StorePreferencesContext";
import { trpc } from "@/lib/trpc";
import { ArrowUpRight, CheckCircle2, LockKeyhole, ShieldCheck, WalletCards } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

type CreatedOrder = { orderId: string; status: string; expectedAmount: string; asset: string; quantity: number; itemId: string };

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const { formatPrice } = useStorePreferences();
  const { isAuthenticated, loading } = useAuth();
  const [error, setError] = useState("");
  const [orders, setOrders] = useState<CreatedOrder[]>([]);
  const wallet = trpc.wallet.overview.useQuery(undefined, { enabled: isAuthenticated });
  const createOrders = trpc.payment.createWalletOrders.useMutation();
  if (!items.length) return <StoreShell><div className="commerce-empty"><p>Add a product to your cart before creating a review request.</p><Link href="/" className="button-primary">Browse catalog</Link></div></StoreShell>;
  if (loading) return <StoreShell><div className="commerce-empty">Opening secure checkout…</div></StoreShell>;
  if (!isAuthenticated) return <StoreShell><section className="checkout-page"><div><span className="catalog-kicker">CHECKOUT / WALLET REVIEW</span><h1>Sign in,<br /><em>then fund.</em></h1><p>Direct product payment is unavailable. Fund your wallet using a Flipkart gift-card or crypto deposit request, then submit every cart item for manual review.</p></div><div className="checkout-panel"><WalletCards size={28} className="text-[#c7f34a]" /><h2 className="mt-4 font-['Space_Grotesk'] text-3xl">Wallet required</h2><p className="mt-3 text-sm leading-6 text-[#a7b1a3]">Your wallet and order requests stay tied to your authenticated account. No product payment address is displayed here.</p><button className="button-primary mt-6" onClick={startLogin}>Sign in to continue <ArrowUpRight size={16} /></button></div></section></StoreShell>;
  const available = Number(wallet.data?.account?.availableBalance ?? 0);
  const unitCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const submit = async () => {
    setError("");
    try {
      const created = await createOrders.mutateAsync({ items: items.map((item) => ({ itemId: item.itemId, displayPrice: item.price, quantity: item.quantity })) });
      setOrders(created as CreatedOrder[]);
      clearCart();
      await wallet.refetch();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not create your wallet order requests.");
    }
  };
  return <StoreShell><section className="checkout-page"><div><span className="catalog-kicker">CHECKOUT / ALL CART ITEMS</span><h1>Wallet-funded.<br /><em>Admin reviewed.</em></h1><p>Your complete cart creates {items.length} manual-review order request{items.length === 1 ? "" : "s"} with the selected quantities. Direct product payment instructions remain disabled.</p><div className="checkout-product"><span>{unitCount} ITEM{unitCount === 1 ? "" : "S"} / {items.length} ROUTE{items.length === 1 ? "" : "S"}</span>{items.map((item) => <div className="mt-3 border-t border-white/10 pt-3" key={item.itemId}><h2>{item.group}</h2><p>{item.label} · Quantity {item.quantity}</p><strong>{formatPrice(item.price)} each</strong></div>)}</div></div><div className="checkout-panel">{!orders.length ? <><div className="checkout-brand"><WalletCards size={19} className="text-[#c7f34a]" /><span><b>ROTH</b> DIGITAL<br /><small>ALL-ITEMS WALLET REQUEST</small></span></div><div className="checkout-safety"><ShieldCheck size={17} /><p><b>Available wallet balance:</b> ${available.toFixed(2)}. The server validates every repository price and total before any balance is reserved.</p></div><div className="checkout-safety"><LockKeyhole size={17} /><p>Use <b>Fund wallet</b> for Flipkart or crypto deposits. This page creates manual-review purchase requests only—never automatic delivery.</p></div><Link href="/wallet#deposit" className="button-outline">Fund wallet: Flipkart or crypto <ArrowUpRight size={16} /></Link><button className="button-primary checkout-submit" disabled={createOrders.isPending || wallet.isLoading} onClick={submit}>{createOrders.isPending ? "Creating all requests…" : `Create ${items.length} manual order request${items.length === 1 ? "" : "s"}`}<ArrowUpRight size={16} /></button>{error && <p className="payment-error">{error}</p>}</> : <div className="checkout-order"><CheckCircle2 size={24} className="text-[#c7f34a]" /><span>ALL CART REQUESTS CREATED</span><b>{orders.length} pending manual review</b><p>Wallet balance was reserved once for the entire cart. No direct product payment or automatic delivery has been requested.</p><div className="grid gap-2">{orders.map((order) => <Link key={order.orderId} href={`/confirmation/${order.orderId}`} className="button-outline">{order.itemId.split(" — ")[0]} · Qty {order.quantity} <ArrowUpRight size={15} /></Link>)}</div></div>}</div></section></StoreShell>;
}
