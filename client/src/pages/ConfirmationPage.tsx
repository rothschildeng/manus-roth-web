import StoreShell from "@/components/StoreShell";
import { trpc } from "@/lib/trpc";
import { RefreshCw, ShieldCheck } from "lucide-react";
import { Link, useRoute } from "wouter";

export default function ConfirmationPage() {
  const [, params] = useRoute("/confirmation/:orderId");
  const orderId = params?.orderId ?? "";
  const status = trpc.payment.getStatus.useQuery({ orderId }, { enabled: Boolean(orderId) });
  const refresh = trpc.payment.refresh.useMutation({ onSuccess: () => status.refetch() });
  const order = status.data;
  const isWalletOrder = order?.chain === "WALLET";
  return <StoreShell><section className="confirmation-page"><span className="catalog-kicker">ORDER CONFIRMATION / {isWalletOrder ? "MANUAL REVIEW" : "LIVE CHAIN STATE"}</span><div className="confirmation-card"><ShieldCheck size={34} /><h1>{order?.status === "approved" ? "Order approved." : "Order received."}</h1><p>{order ? `Order ${order.orderId} is currently ${order.status.replaceAll("_", " ")}.` : "Loading your order state…"}</p>{order && <div className="confirmation-stats"><div><span>{isWalletOrder ? "WALLET RESERVED" : "PAYMENT"}</span><b>{order.expectedAmount} {order.asset}</b></div><div><span>{isWalletOrder ? "DIRECT PAYMENT" : "CONFIRMATIONS"}</span><b>{isWalletOrder ? "Disabled" : `${order.confirmations} / ${order.requiredConfirmations}`}</b></div><div><span>FULFILLMENT</span><b>{order.status === "approved" ? "Approved" : "Manual review"}</b></div></div>}{!isWalletOrder && <button className="button-primary" onClick={() => refresh.mutate({ orderId })} disabled={refresh.isPending}><RefreshCw size={16} /> {refresh.isPending ? "Checking chain…" : "Refresh status"}</button>}<Link href="/support" className="button-outline">Need support?</Link></div></section></StoreShell>;
}
