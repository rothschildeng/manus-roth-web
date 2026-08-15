// Obsidian Gallery admin desk; every decision and fulfillment handoff is manual.
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Check, CreditCard, ExternalLink, PackageCheck, PackageSearch, RefreshCw, ShieldCheck, Truck, WalletCards, X } from "lucide-react";
import { Link } from "wouter";

const mark = "/manus-storage/roth-split-r-mark_124d79d5.png";
const statusLabel = (status: string) => status.replaceAll("_", " ");

export default function PaymentAdmin() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const payments = trpc.payment.adminList.useQuery(undefined, { enabled: user?.role === "admin" });
  const approve = trpc.payment.approve.useMutation({ onSuccess: () => utils.payment.adminList.invalidate() });
  const reject = trpc.payment.reject.useMutation({ onSuccess: () => utils.payment.adminList.invalidate() });
  const advanceFulfillment = trpc.payment.advanceFulfillment.useMutation({ onSuccess: () => utils.payment.adminList.invalidate() });

  const actionFor = (order: { orderId: string; status: string; purpose?: string }) => {
    if (order.purpose === "wallet_deposit") return <Link href="/admin/wallet" className="inline-flex h-8 items-center border border-[#c7f34a]/40 px-3 text-xs text-[#c7f34a] hover:bg-[#c7f34a]/10">Review wallet credit</Link>;
    if (order.status === "pending_admin") return <><Button size="sm" onClick={() => approve.mutate({ orderId: order.orderId })} disabled={approve.isPending} className="bg-[#c7f34a] text-[#11140e] hover:bg-[#d7ff63]"><Check className="mr-1.5 h-3.5 w-3.5" />Approve</Button><Button size="sm" variant="outline" onClick={() => reject.mutate({ orderId: order.orderId })} disabled={reject.isPending} className="border-[#ffb4a7]/40 bg-transparent text-[#ffb4a7] hover:bg-[#ffb4a7]/10 hover:text-[#ffb4a7]"><X className="mr-1.5 h-3.5 w-3.5" />Reject</Button></>;
    if (order.status === "approved") return <Button size="sm" onClick={() => advanceFulfillment.mutate({ orderId: order.orderId, action: "ready" })} disabled={advanceFulfillment.isPending} className="bg-[#c7f34a] text-[#11140e] hover:bg-[#d7ff63]"><PackageCheck className="mr-1.5 h-3.5 w-3.5" />Mark ready</Button>;
    if (order.status === "fulfillment_ready") return <Button size="sm" onClick={() => advanceFulfillment.mutate({ orderId: order.orderId, action: "deliver" })} disabled={advanceFulfillment.isPending} className="bg-[#c7f34a] text-[#11140e] hover:bg-[#d7ff63]"><Truck className="mr-1.5 h-3.5 w-3.5" />Mark delivered</Button>;
    return <span className="text-xs text-[#7e897b]">No action available</span>;
  };

  return <DashboardLayout>
    <section className="min-h-screen -m-4 bg-[#080a08] p-5 text-[#f3f0e6] md:p-9">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-5 border-b border-white/10 pb-7 md:flex-row md:items-end md:justify-between">
          <div>
            <a href="/" className="mb-5 inline-flex items-center gap-2 text-[11px] tracking-[-.03em] text-[#f3f0e6]"><img src={mark} alt="" className="h-6 w-6" /><span className="font-semibold">ROTH <span className="text-[#c7f34a]">DIGITAL</span></span></a>
            <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.18em] text-[#c7f34a]"><ShieldCheck size={14} /> Roth / payment review desk</div>
            <h1 className="font-['Space_Grotesk'] text-4xl font-medium tracking-[-.07em] md:text-6xl">Manual<br /><span className="text-[#c7f34a]">approval queue.</span></h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-[#96a091]">Every stage is a deliberate administrator decision: payment review, approval, fulfillment-ready, and delivered. Nothing here triggers automatic delivery.</p>
          </div>
          <div className="flex flex-wrap gap-2"><Link href="/admin/catalog" className="inline-flex h-9 items-center border border-white/20 bg-white/5 px-3 text-xs text-[#e9eee3] hover:border-[#c7f34a] hover:text-[#c7f34a]"><PackageSearch className="mr-2 h-4 w-4" />Catalog controls</Link><Link href="/admin/wallet" className="inline-flex h-9 items-center border border-white/20 bg-white/5 px-3 text-xs text-[#e9eee3] hover:border-[#c7f34a] hover:text-[#c7f34a]"><WalletCards className="mr-2 h-4 w-4" />Wallet reviews</Link><Link href="/admin/vcc" className="inline-flex h-9 items-center border border-white/20 bg-white/5 px-3 text-xs text-[#e9eee3] hover:border-[#c7f34a] hover:text-[#c7f34a]"><CreditCard className="mr-2 h-4 w-4" />VCC handoffs</Link><Button variant="outline" onClick={() => payments.refetch()} disabled={payments.isFetching} className="border-white/20 bg-white/5 text-[#e9eee3] hover:border-[#c7f34a] hover:bg-[#c7f34a]/10 hover:text-[#c7f34a]"><RefreshCw className={`mr-2 h-4 w-4 ${payments.isFetching ? "animate-spin" : ""}`} />Refresh queue</Button></div>
        </div>
        {user && user.role !== "admin" && <div className="border border-[#ffb4a7]/30 bg-[#702014]/20 p-5 text-sm text-[#ffb4a7]">Your account is signed in but does not have the admin role. Payment-review procedures are locked server-side.</div>}
        {!user && <div className="border border-white/15 bg-white/[.03] p-5 text-sm text-[#a8b1a4]">Sign in with the project-owner account to access the manual payment-review desk.</div>}
        {payments.error && <div className="border border-[#ffb4a7]/30 bg-[#702014]/20 p-5 text-sm text-[#ffb4a7]">{payments.error.message}</div>}
        {payments.isLoading && <div className="border border-white/10 p-12 text-center text-sm uppercase tracking-[.16em] text-[#8f9a8d]">Opening review queue…</div>}
        {payments.data && <div className="overflow-hidden border border-white/10 bg-[#0d110d]">
          <div className="hidden grid-cols-[1.4fr_.8fr_.9fr_.8fr_1.2fr] gap-4 border-b border-white/10 bg-white/[.025] px-5 py-3 text-[9px] font-semibold uppercase tracking-[.15em] text-[#7f8a7c] md:grid"><span>Order</span><span>Asset</span><span>Progress</span><span>State</span><span>Manual action</span></div>
          {payments.data.map((order) => <div className="grid gap-4 border-b border-white/10 px-5 py-5 last:border-b-0 md:grid-cols-[1.4fr_.8fr_.9fr_.8fr_1.2fr] md:items-center" key={order.orderId}>
            <div><p className="font-mono text-xs text-[#dfe5d9]">{order.orderId}</p><p className="mt-1 text-xs text-[#899487]">{order.itemId}{order.quantity > 1 ? ` · Qty ${order.quantity}` : ""}</p>{order.purpose === "wallet_deposit" ? <span className="mt-2 inline-flex text-[10px] uppercase tracking-[.12em] text-[#c7f34a]">Crypto wallet deposit</span> : order.chain === "WALLET" ? <span className="mt-2 inline-flex text-[10px] uppercase tracking-[.12em] text-[#c7f34a]">Wallet-funded request</span> : order.txHash ? <a className="mt-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-[.12em] text-[#c7f34a]" href={`https://www.google.com/search?q=${order.txHash}`} target="_blank" rel="noreferrer">View reference <ExternalLink size={11} /></a> : <span className="mt-2 inline-flex text-[10px] uppercase tracking-[.12em] text-[#7e897b]">Awaiting chain reference</span>}</div>
            <div><p className="font-['Space_Grotesk'] text-lg tracking-[-.04em] text-[#f3f0e6]">{order.expectedAmount} {order.asset}</p><p className="mt-1 text-[10px] uppercase tracking-[.13em] text-[#8e998b]">{order.chain.replace("_", " ")}</p></div>
            <div><p className="font-['Space_Grotesk'] text-lg tracking-[-.04em]">{order.chain === "WALLET" ? "Reserved" : <>{order.confirmations} <span className="text-[#7e897b]">/ {order.requiredConfirmations}</span></>}</p><p className="mt-1 text-[10px] uppercase tracking-[.13em] text-[#8e998b]">{order.chain === "WALLET" ? "Wallet balance" : "Confirmations"}</p></div>
            <div><span className={`inline-flex border px-2 py-1 text-[9px] font-semibold uppercase tracking-[.12em] ${order.status === "pending_admin" ? "border-[#c7f34a]/45 bg-[#c7f34a]/10 text-[#c7f34a]" : "border-white/15 text-[#aab3a4]"}`}>{statusLabel(order.status)}</span></div>
            <div className="flex flex-wrap gap-2">{actionFor(order)}</div>
          </div>)}
          {payments.data.length === 0 && <div className="p-14 text-center"><p className="font-['Space_Grotesk'] text-2xl tracking-[-.05em] text-[#e8ece3]">The desk is clear.</p><p className="mt-2 text-sm text-[#899487]">Confirmed orders will appear here for your manual decision.</p></div>}
        </div>}
      </div>
    </section>
  </DashboardLayout>;
}
