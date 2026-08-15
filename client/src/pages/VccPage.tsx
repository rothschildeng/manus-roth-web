import StoreShell from "@/components/StoreShell";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";
import { ArrowUpRight, LockKeyhole, ShieldCheck, ShoppingBag, WalletCards } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "wouter";

const clean = (value: string) => value.replace(/^[^A-Za-z0-9]+/, "");
const cardGradients = [
  "linear-gradient(135deg,#148bb9,#12d0ec 55%,#386ee0)",
  "linear-gradient(135deg,#493fd4,#9358ef 56%,#5ba0ff)",
  "linear-gradient(135deg,#ff9b3d,#ff6045 56%,#cf3954)",
  "linear-gradient(135deg,#12ba90,#1cd8b5 56%,#45a4da)",
  "linear-gradient(135deg,#4d5fe9,#476bbb 56%,#211958)",
  "linear-gradient(135deg,#9b42c9,#dc65d6 56%,#5d5ae5)",
];

export default function VccPage() {
  const { data, isLoading } = trpc.catalog.list.useQuery();
  const { addItem } = useCart();
  const products = (data?.products ?? []).filter((product) => product.category === "vcc");
  const availability = data?.availability ?? {};
  const groups = useMemo(() => Array.from(new Set(products.map((product) => product.group))), [products]);
  const [activeGroup, setActiveGroup] = useState("all");
  const visible = activeGroup === "all" ? products : products.filter((product) => product.group === activeGroup);

  return <StoreShell>
    <section className="vcc-hero"><div><span className="catalog-kicker">VCC DESK / MANUAL FULFILMENT</span><h1>Structured<br /><em>virtual access.</em></h1><p>Browse repository-backed virtual-card routes through a richer card desk. A submitted order still enters payment confirmation and manual review before any secured entitlement handoff.</p><div className="vcc-hero-signals"><span><ShieldCheck size={14} /> GitHub catalog data</span><span><LockKeyhole size={14} /> No raw credentials in chat</span></div></div><div className="vcc-feature-card"><div><span>ROTH DIGITAL</span><b>VIRTUAL ACCESS</b></div><strong>•••• ••••<br />MANUAL</strong><small>Card data is never previewed, copied, or sent through the storefront.</small><WalletCards size={23} /></div></section>
    <section className="vcc-desk"><div className="vcc-desk-head"><div><span className="catalog-kicker">CURATED ROUTES</span><h2>Choose a <em>catalogue route.</em></h2></div><p>Package labels, balance labels, and prices shown below are imported from the GitHub catalog. Availability remains subject to manual review.</p></div>{isLoading ? <div className="commerce-empty">Opening VCC catalogue…</div> : <><div className="vcc-filter-row"><button className={activeGroup === "all" ? "active" : ""} onClick={() => setActiveGroup("all")}>All routes <b>{products.length}</b></button>{groups.map((group) => <button key={group} className={activeGroup === group ? "active" : ""} onClick={() => setActiveGroup(group)}>{clean(group)}</button>)}</div><div className="vcc-grid">{visible.map((product, index) => { const itemId = `${product.group} — ${product.label}`; const unavailable = Boolean(availability[itemId]); return <article key={itemId} className={`vcc-product ${unavailable ? "is-unavailable" : ""}`}><div className={`vcc-card-surface vcc-tone-${index % 4}`} style={{ background: cardGradients[index % cardGradients.length] }}><span>ROTH DIGITAL / ACCESS</span><i>{clean(product.group)}</i><strong>•••• ••••<br />{unavailable ? "PAUSED" : "VIRTUAL"}</strong><small>{unavailable ? "ROUTE PAUSED" : "MANUAL HANDOFF"} <b aria-hidden="true">▣</b></small></div><div className="vcc-product-copy"><span>{clean(product.group)}</span><h3>{product.label}</h3><div><strong>{product.pay}</strong>{product.origPay && <s>{product.origPay}</s>}</div><p>{unavailable ? "This catalogue route is currently unavailable. It cannot be added to cart or checked out." : "Payment confirmation and an administrator decision are required before fulfilment."}</p><div className="vcc-actions"><button disabled={unavailable} onClick={() => addItem({ itemId, group: clean(product.group), label: product.label, category: "VCC Store", price: product.pay })}><ShoppingBag size={15} /> {unavailable ? "Unavailable" : "Add to cart"}</button><Link href={`/product/${encodeURIComponent(itemId)}`}>View route <ArrowUpRight size={14} /></Link></div></div></article>; })}</div>{visible.length === 0 && <div className="commerce-empty">No VCC catalogue routes match this filter.</div>}</>}</section>
    <section className="vcc-safety"><LockKeyhole size={18} /><div><b>Protected entitlement boundary.</b><p>This site can record only order state and masked entitlement metadata. Full virtual-card credentials require a separately approved secure delivery method; they are not included in this public catalogue, cart, or Telegram queue.</p></div></section>
  </StoreShell>;
}
