import StoreShell from "@/components/StoreShell";
import { imageForProduct } from "@/components/RealCatalog";
import { ProductCardSkeleton, ProductMerchandisingCard, ProductQuickView, type MerchandisingProduct } from "@/components/ProductMerchandising";
import { useCart } from "@/contexts/CartContext";
import { cleanBrand } from "@/lib/sanitize";
import { trpc } from "@/lib/trpc";
import { useStorePreferences } from "@/contexts/StorePreferencesContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { Heart, LayoutGrid, List, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useLocation, useRoute } from "wouter";

const clean = (value: string) => cleanBrand(value).replace(/^[^A-Za-z0-9]+/, "");

export default function CategoryPage() {
  const [, params] = useRoute("/category/:category");
  const category = params?.category ?? "";
  const { addItem } = useCart(); const [, setLocation] = useLocation(); const { isAuthenticated } = useAuth(); const favorites = trpc.favorites.list.useQuery(undefined, { enabled: isAuthenticated }); const toggleFavorite = trpc.favorites.toggle.useMutation({ onSuccess: () => favorites.refetch() });
  const { formatPrice } = useStorePreferences();
  const { data, isLoading, error } = trpc.catalog.list.useQuery();
  const [brandFilter, setBrandFilter] = useState("all"); const [sort, setSort] = useState<"featured" | "low" | "high">("featured"); const [view, setView] = useState<"grid" | "list">("grid");
  const products = useMemo(() => (data?.products ?? []).filter((product) => product.category === category && (brandFilter === "all" || clean(product.group).toLowerCase().startsWith(brandFilter))).sort((a, b) => {
    if (sort === "featured") return 0;
    const price = (item: typeof a) => Number(item.pay.replace(/[^0-9.]/g, "")) || 0;
    return sort === "low" ? price(a) - price(b) : price(b) - price(a);
  }), [brandFilter, category, data?.products, sort]);
  const brands = useMemo(() => Array.from(new Set((data?.products ?? []).filter((product) => product.category === category).map((product) => clean(product.group).split(" ")[0].toLowerCase()).filter(Boolean))).sort(), [category, data?.products]);
  const categoryKey = category as keyof NonNullable<typeof data>["categories"];
  const categoryLabel = data?.categories[categoryKey];
  const title = categoryLabel ? clean(categoryLabel) : "Collection";
  const [quickView, setQuickView] = useState<{ product: MerchandisingProduct; itemId: string; image?: string; unavailable: boolean } | null>(null);
  const addProduct = (product: MerchandisingProduct, itemId: string) => addItem({ itemId, group: cleanBrand(product.group), label: product.label, category: title, price: product.pay });
  const buyNow = (product: MerchandisingProduct, itemId: string) => { addProduct(product, itemId); setLocation("/checkout"); };
  const favoriteIds = new Set(favorites.data ?? []);
  return <StoreShell><section className="commerce-hero collection-room"><div className="collection-room-copy"><span className="catalog-kicker">ROTH SHOP / {title.toUpperCase()}</span><h1>{title},<br /><em>source-backed.</em></h1><p>Product routes with managed visual assets, price context, availability, and supported purchase actions. Reviews are not yet available.</p></div><aside className="collection-room-status"><span>COLLECTION STATUS</span><strong>{isLoading ? "Loading products" : `${products.length} visible products`}</strong><small>Cart-ready routes · clear order status</small><i>R</i></aside></section><section className="commerce-grid-section collection-room-grid">{isLoading ? <ProductCardSkeleton count={6} /> : error ? <div className="commerce-empty"><p>The shop is temporarily unavailable.</p><Link href="/">Return to the shop</Link></div> : !categoryLabel ? <div className="commerce-empty"><p>This collection is not available.</p><Link href="/">Browse all products</Link></div> : <><div className="category-shop-toolbar"><div><SlidersHorizontal size={15} /><span>Filter and sort</span></div><select value={brandFilter} onChange={(event) => setBrandFilter(event.target.value)} aria-label="Filter by brand"><option value="all">All brands</option>{brands.map((brand) => <option key={brand} value={brand}>{brand}</option>)}</select><select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)} aria-label="Sort products"><option value="featured">Shop order</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select><span className="category-review-note">Reviews unavailable</span><div className="category-view-toggle"><button type="button" onClick={() => setView("grid")} className={view === "grid" ? "active" : ""} aria-label="Grid view"><LayoutGrid size={15} /></button><button type="button" onClick={() => setView("list")} className={view === "list" ? "active" : ""} aria-label="List view"><List size={16} /></button></div></div>{products.length ? <div className={`product-merch-grid ${view === "list" ? "product-merch-list" : ""}`}>{products.map((product) => { const itemId = `${product.group} — ${product.label}`; const image = imageForProduct(product.group, product.category, product.label); const unavailable = Boolean(data?.availability?.[itemId]); const isFavorite = favoriteIds.has(itemId); return <ProductMerchandisingCard key={itemId} product={product} itemId={itemId} categoryLabel={title} image={image} unavailable={unavailable} formatPrice={formatPrice} onAdd={() => addProduct(product, itemId)} onBuyNow={() => buyNow(product, itemId)} onQuickView={() => setQuickView({ product, itemId, image, unavailable })} wishlistControl={isAuthenticated ? <button className={`favorite-button ${isFavorite ? "is-active" : ""}`} onClick={() => toggleFavorite.mutate({ productId: itemId })} disabled={toggleFavorite.isPending} aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}><Heart size={14} fill={isFavorite ? "currentColor" : "none"} /></button> : <Link className="favorite-button" href="/login" aria-label="Sign in to save favorite"><Heart size={14} /></Link>} />; })}</div> : <div className="commerce-empty">No products match these filters. Choose a different brand or sorting option.</div>}</>}<ProductQuickView product={quickView?.product ?? null} itemId={quickView?.itemId} categoryLabel={title} image={quickView?.image} unavailable={quickView?.unavailable} formatPrice={formatPrice} onOpenChange={(open) => { if (!open) setQuickView(null); }} onAdd={quickView ? () => addProduct(quickView.product, quickView.itemId) : undefined} onBuyNow={quickView ? () => buyNow(quickView.product, quickView.itemId) : undefined} /></section></StoreShell>;
}
