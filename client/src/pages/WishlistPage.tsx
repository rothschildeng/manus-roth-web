import StoreShell from "@/components/StoreShell";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { Heart, ArrowUpRight } from "lucide-react";
import { Link } from "wouter";

export default function WishlistPage() {
  const { isAuthenticated, loading } = useAuth();
  const favorites = trpc.favorites.list.useQuery(undefined, { enabled: isAuthenticated });
  const catalog = trpc.catalog.list.useQuery();
  if (loading) return <StoreShell><div className="commerce-empty">Opening your saved routes…</div></StoreShell>;
  if (!isAuthenticated) return <StoreShell><section className="account-page"><span className="catalog-kicker">MY WISHLIST / PRIVATE DESK</span><h1>Save your<br /><em>next route.</em></h1><div className="account-gate"><Heart size={27} /><h2>Sign in to save favorites.</h2><p>Wishlist items are kept only in your authenticated account and always reference the live repository catalog.</p><button className="button-primary" onClick={startLogin}>Sign in to continue <ArrowUpRight size={16} /></button></div></section></StoreShell>;
  const ids = new Set(favorites.data ?? []);
  const items = (catalog.data?.products ?? []).filter((product) => ids.has(`${product.group} — ${product.label}`));
  return <StoreShell><section className="account-page"><span className="catalog-kicker">MY WISHLIST / SAVED ROUTES</span><div className="account-heading"><div><h1>Your saved<br /><em>collection.</em></h1><p>Live product definitions and prices remain linked to the repository catalog.</p></div></div>{favorites.isLoading || catalog.isLoading ? <div className="commerce-empty">Loading saved products…</div> : items.length ? <div className="wishlist-grid">{items.map((product) => { const id = `${product.group} — ${product.label}`; return <Link key={id} href={`/product/${encodeURIComponent(id)}`}><span>{product.group}</span><h2>{product.label}</h2><strong>{product.pay}</strong></Link>; })}</div> : <div className="commerce-empty">No saved routes yet. <Link href="/">Browse the catalog</Link> and use the heart control to save a product.</div>}</section></StoreShell>;
}
