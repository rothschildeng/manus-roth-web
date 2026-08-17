import StoreShell from "@/components/StoreShell";
import PaymentReceipt, { type ReceiptStage } from "@/components/PaymentReceipt";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, CircleDot, RefreshCw, ShieldCheck, XCircle } from "lucide-react";
import { Link, useRoute } from "wouter";

type OrderStage = { label: string; detail: string; state: "done" | "current" | "next" | "stopped" };

function orderTimeline(status: string, isWalletOrder: boolean): OrderStage[] {
  const terminal = status === "rejected" || status === "expired";
  const progress = { awaiting_payment: 0, detected: 1, confirming: 1, pending_admin: 2, approved: 3, fulfillment_ready: 3, delivered: 4, rejected: 2, expired: 0 } as Record<string, number>;
  const current = progress[status] ?? 0;
  const stages = isWalletOrder
    ? [["Request recorded", "Your wallet checkout request is stored."], ["Wallet review", "An administrator reviews the reserved wallet request."], ["Manual decision", "The request is approved or rejected from the protected admin desk."], ["Fulfilment update", "Approved requests move into the available fulfilment state."]]
    : [["Request recorded", "Your payment request is stored."], ["Network checks", "The payment state waits for required confirmation checks."], ["Manual decision", "A confirmed request awaits an administrator decision."], ["Fulfilment update", "Approved requests move into the available fulfilment state."]];
  return stages.map(([label, detail], index) => ({ label, detail, state: terminal && index === current ? "stopped" : index < current ? "done" : index === current ? "current" : "next" }));
}

export default function ConfirmationPage() {
  const [, params] = useRoute("/confirmation/:orderId");
  const orderId = params?.orderId ?? "";
  const status = trpc.payment.getStatus.useQuery({ orderId }, { enabled: Boolean(orderId) });
  const refresh = trpc.payment.refresh.useMutation({ onSuccess: () => status.refetch() });
  const order = status.data;
  const isWalletOrder = order?.chain === "WALLET";
  const timeline = order ? orderTimeline(order.status, Boolean(isWalletOrder)) : [];
  const receiptStage: ReceiptStage = !order ? "processing" : order.status === "approved" || order.status === "delivered" ? "recorded" : order.status === "rejected" || order.status === "expired" ? "attention" : "recorded";
  return <StoreShell><section className="confirmation-page"><span className="catalog-kicker">ORDER CONFIRMATION / {isWalletOrder ? "MANUAL REVIEW" : "LIVE CHAIN STATE"}</span><div className="confirmation-card"><ShieldCheck size={34} /><h1>{order?.status === "approved" ? "Order approved." : "Order received."}</h1><p>{order ? `Order ${order.orderId} is currently ${order.status.replaceAll("_", " ")}.` : "Loading your order state…"}</p>{order && <><div className="confirmation-stats"><div><span>{isWalletOrder ? "WALLET RESERVED" : "PAYMENT"}</span><b>{order.expectedAmount} {order.asset}</b></div><div><span>{isWalletOrder ? "DIRECT PAYMENT" : "CONFIRMATIONS"}</span><b>{isWalletOrder ? "Disabled" : `${order.confirmations} / ${order.requiredConfirmations}`}</b></div><div><span>FULFILLMENT</span><b>{order.status === "approved" ? "Approved" : "Manual review"}</b></div></div><PaymentReceipt stage={receiptStage} reference={order.orderId} amount={order.expectedAmount} asset={order.asset} route={isWalletOrder ? "Wallet-funded order request" : `${order.chain} payment request`} status={order.status} detail={isWalletOrder ? "Wallet funds are reserved for this order record while manual review remains in progress." : "Payment state is shown from the current chain record and may require confirmation checks."} /><section className="mt-6 border border-white/10 bg-black/10 p-4 text-left"><span className="text-[10px] font-semibold uppercase tracking-[.14em] text-[#c7f34a]">Record-backed status path</span><div className="mt-4 grid gap-3 md:grid-cols-4">{timeline.map((stage) => <div key={stage.label} className={`border p-3 ${stage.state === "done" ? "border-[#c7f34a]/35 bg-[#c7f34a]/[.05]" : stage.state === "current" ? "border-[#c7f34a] bg-[#c7f34a]/10" : stage.state === "stopped" ? "border-[#ffb4a7]/50 bg-[#702014]/20" : "border-white/10"}`}><div className="flex items-center gap-2">{stage.state === "done" ? <CheckCircle2 size={15} className="text-[#c7f34a]" /> : stage.state === "stopped" ? <XCircle size={15} className="text-[#ffb4a7]" /> : <CircleDot size={15} className={stage.state === "current" ? "text-[#c7f34a]" : "text-[#96a091]"} />}<b className="text-sm text-[#f3f0e6]">{stage.label}</b></div><p className="mt-2 text-xs leading-5 text-[#a5afa2]">{stage.detail}</p>{stage.state === "current" ? <span className="mt-3 inline-block text-[9px] font-semibold uppercase tracking-[.14em] text-[#c7f34a]">Current record</span> : null}</div>)}</div><p className="mt-4 text-xs leading-5 text-[#8f9a8d]">Stages are derived from the current order record only. The page does not estimate times or simulate progress.</p></section></>}{!isWalletOrder && <button className="button-primary" onClick={() => refresh.mutate({ orderId})} disabled={refresh.isPending}><RefreshCw size={16} /> {refresh.isPending ? "Checking chain…" : "Refresh status"}</button>}<Link href="/support" className="button-outline">Need support?</Link></div></section></StoreShell>;
}
