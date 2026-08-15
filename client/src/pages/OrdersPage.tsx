import StoreShell from "@/components/StoreShell";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowUpRight, ClipboardList, PackageCheck } from "lucide-react";
import { Link } from "wouter";

const activeStatuses = new Set(["awaiting_payment", "detected", "confirming", "pending_admin", "approved", "fulfillment_ready"]);

export default function OrdersPage() {
  const { isAuthenticated, loading } = useAuth();
  const orders = trpc.payment.myOrders.useQuery(undefined, { enabled: isAuthenticated });
  if (loading) return <StoreShell><div className="commerce-empty">Opening orders…</div></StoreShell>;
  if (!isAuthenticated) return <StoreShell><section className="wallet-page"><span className="catalog-kicker">MY ORDERS / ACCOUNT ACCESS</span><h1>Track every<br /><em>real handoff.</em></h1><div className="account-gate"><ClipboardList size={27} /><h2>Sign in to view your orders.</h2><p>Order states are linked to your authenticated account, while guest purchases remain accessible with their confirmation link.</p><button className="button-primary" onClick={startLogin}>Sign in to continue <ArrowUpRight size={16} /></button></div></section></StoreShell>;
  const active = orders.data?.filter((order) => activeStatuses.has(order.status)) ?? [];
  const completed = orders.data?.filter((order) => !activeStatuses.has(order.status)) ?? [];
  return <StoreShell><section className="wallet-page"><span className="catalog-kicker">MY ORDERS / LIVE STATUS</span><div className="wallet-heading"><div><h1>Every<br /><em>visible step.</em></h1><p>Active orders show payment, review, and manual fulfilment status. Resolved orders remain visible after delivery, expiry, or rejection.</p></div><div className="referral-code-card"><PackageCheck size={18} /><span>Order status</span><strong>{active.length} ACTIVE</strong><p>Open an order to see its full confirmation route.</p></div></div><OrderGroup label="ACTIVE ORDERS" title="Still in motion." orders={active} loading={orders.isLoading} empty="There are no active orders right now." /><OrderGroup label="COMPLETED / RESOLVED" title="Completed handoffs." orders={completed} loading={orders.isLoading} empty="Delivered, expired, and rejected orders will be retained here." /></section></StoreShell>;
}

function OrderGroup({ label, title, orders, loading, empty }: { label: string; title: string; orders: Array<{ orderId: string; itemId: string; status: string; expectedAmount: string; asset: string; createdAt: Date }>; loading: boolean; empty: string }) { return <div className="wallet-history"><div className="wallet-panel-head"><ClipboardList size={19} /><div><span>{label}</span><h2>{title}</h2></div></div>{loading ? <div className="commerce-empty">Loading orders…</div> : orders.length ? <div className="wallet-table">{orders.map((order) => <article key={order.orderId}><div><span>{order.status.replaceAll("_", " ")}</span><h3>{order.itemId}</h3><p>{new Date(order.createdAt).toLocaleString()}</p></div><div className="order-value"><strong>{order.expectedAmount} {order.asset}</strong><Link href={`/track/${order.orderId}`}>Track <ArrowUpRight size={13} /></Link></div></article>)}</div> : <div className="commerce-empty">{empty}</div>}</div>; }
