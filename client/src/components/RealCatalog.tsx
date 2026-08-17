import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { brandAlt, cleanBrand } from "@/lib/sanitize";
import { useStorePreferences } from "@/contexts/StorePreferencesContext";
import { ProductCardSkeleton, ProductMerchandisingCard, ProductQuickView, type MerchandisingProduct } from "@/components/ProductMerchandising";
import { Heart, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";

export type CheckoutCatalogItem = { itemId: string; name: string; type: string; detail: string; price: string; };

const cleanLabel = (value: string) => cleanBrand(value).replace(/^[^A-Za-z0-9]+/, "");
const categoryImages: Record<string, string> = { indian_giftcard: "/manus-storage/gc-menu_339ac9b0.jpg", intl_giftcard: "/manus-storage/gc-menu_339ac9b0.jpg", binance_card: "/manus-storage/vcc-menu_8fb640d0.jpg", game_topup: "/manus-storage/freefire_f9b5fd3f.jpg", streaming: "/manus-storage/premium-menu_2a88a89e.jpg", premium_sub: "/manus-storage/premium-menu_2a88a89e.jpg", vcc: "/manus-storage/vcc-menu_8fb640d0.jpg", card_shop: "/manus-storage/vcc-menu_8fb640d0.jpg", cloud_services: "/manus-storage/premium-menu_2a88a89e.jpg", electronics: "/manus-storage/elec-menu_b744e046.jpg" };
const brandImages: Array<[string, string]> = [["aws", "/manus-storage/roth-aws-brand_9ddb5827.png"], ["myntra", "/manus-storage/roth-myntra-brand_8d1c4b36.png"], ["ajio", "/manus-storage/roth-ajio-brand_84ac5ad7.png"], ["amazon", "/manus-storage/amazon_3eae347f.jpg"], ["apple", "/manus-storage/apple_9171b857.jpg"], ["flipkart", "/manus-storage/flipkart_a0519cde.jpg"], ["chatgpt", "/manus-storage/chatgpt_50484410.jpg"], ["openai", "/manus-storage/chatgpt_50484410.jpg"], ["claude", "/manus-storage/claude_c627a59f.jpg"], ["gemini", "/manus-storage/roth-gemini-logo_2b4b8b78.png"], ["cursor", "/manus-storage/roth-cursor-logo_a04747bd.png"], ["canva", "/manus-storage/roth-canva-logo_2dcfe4fd.png"], ["free fire", "/manus-storage/freefire_f9b5fd3f.jpg"], ["google play", "/manus-storage/googleplay_a7405d3a.jpg"], ["netflix", "/manus-storage/netflix_290db0bc.jpg"], ["pubg", "/manus-storage/pubg_36ef0361.jpg"], ["roblox", "/manus-storage/roblox_bae4d760.jpg"], ["spotify", "/manus-storage/spotify_2a239ba7.jpg"], ["steam", "/manus-storage/steam_4cc9daa0.jpg"], ["swiggy", "/manus-storage/swiggy_d25b372b.jpg"], ["zomato", "/manus-storage/zomato_7c0c31b6.jpg"]];
const deviceImages: Array<[string, string]> = [
  ["iphone 16 pro max", "/manus-storage/roth-iphone-16-pro-max_bcb7e202.jpg"],
  ["iphone 16 pro", "/manus-storage/roth-iphone-16-pro-official_3a4f33d5.jpg"],
  ["iphone 16 plus", "/manus-storage/roth-iphone-16-plus-official_a1359c45.jpg"],
  ["iphone 16e", "/manus-storage/roth-iphone-16e_9b5309b8.jpg"],
  ["iphone 15 pro", "/manus-storage/roth-iphone-15-pro_8c149dff.jpg"],
  ["iphone 15", "/manus-storage/roth-iphone-15-official_996faacb.jpg"],
  ["ipad pro", "/manus-storage/roth-ipad-pro-official_8f952816.jpg"],
  ["ipad air", "/manus-storage/roth-ipad-air-official_201a2abb.png"],
  ["ipad mini", "/manus-storage/roth-ipad-mini-official_b860a94e.jpg"],
  ["ipad 11", "/manus-storage/roth-ipad-11-official_615dfce9.jpg"],
  ["macbook pro", "/manus-storage/roth-macbook-pro-official_a7542958.jpg"],
  ["macbook air", "/manus-storage/roth-macbook-air-m3_ef524aae.jpg"],
  ["dell xps", "/manus-storage/roth-dell-xps-official_e81d1f2f.jpg"],
  ["thinkpad", "/manus-storage/roth-thinkpad-x1-official_fe133f71.png"],
  ["hp spectre", "/manus-storage/roth-hp-spectre-official_343c0865.png"],
  ["acer predator", "/manus-storage/roth-acer-predator-official_0d6bae2d.jpg"],
  ["galaxy s24 ultra", "/manus-storage/roth-galaxy-s24-ultra_f4c01638.jpg"],
];
export const imageForProduct = (group: string, category: string, label = "") => {
  const identity = `${group} ${label}`.toLowerCase();
  return deviceImages.find(([needle]) => identity.includes(needle))?.[1] ?? brandImages.find(([needle]) => identity.includes(needle))?.[1] ?? categoryImages[category];
};
export const imageAltForProduct = (group: string, category: string, label = "") => {
  void category;
  void label;
  return brandAlt(group);
};
const numericPrice = (value: string) => Number(value.replace(/[^0-9.]/g, "")) || 0;
export default function RealCatalog({ onCheckout, initialQuery = "" }: { onCheckout: (item: CheckoutCatalogItem) => void; initialQuery?: string }) {
  const { isAuthenticated } = useAuth();
  const { formatPrice } = useStorePreferences();
  const { data, isLoading, error } = trpc.catalog.list.useQuery();
  const favorites = trpc.favorites.list.useQuery(undefined, { enabled: isAuthenticated });
  const toggleFavorite = trpc.favorites.toggle.useMutation({ onSuccess: () => favorites.refetch() });
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [brand, setBrand] = useState("all");
  const [priceBand, setPriceBand] = useState("all");
  const [variantOnly, setVariantOnly] = useState("all");
  const [availability, setAvailability] = useState<"available" | "all">("available");
  const [quickView, setQuickView] = useState<{ product: MerchandisingProduct; itemId: string; categoryLabel: string; image?: string; unavailable: boolean } | null>(null);
  const [, setLocation] = useLocation();
  useEffect(() => { if (initialQuery) setQuery(initialQuery); }, [initialQuery]);
  const normalized = query.trim().toLowerCase();
  const categories = (data?.categories ?? {}) as Record<string, string>;
  const brands = useMemo(() => Array.from(new Set((data?.products ?? []).map((product) => cleanLabel(product.group).split(" ")[0]).filter(Boolean))).sort().slice(0, 20), [data?.products]);
  const suggestions = useMemo(() => normalized.length < 2 ? [] : (data?.products ?? []).filter((product) => `${product.group} ${product.label}`.toLowerCase().includes(normalized)).slice(0, 5), [data?.products, normalized]);
  const products = useMemo(() => (data?.products ?? []).filter((product) => {
    const itemId = `${product.group} — ${product.label}`;
    const unavailable = Boolean(data?.availability?.[itemId]);
    const matchesCategory = category === "all" || product.category === category;
    const matchesBrand = brand === "all" || cleanLabel(product.group).toLowerCase().startsWith(brand.toLowerCase());
    const haystack = `${product.group} ${product.label} ${product.pay} ${product.get ?? ""}`.toLowerCase();
    const amount = numericPrice(product.pay);
    const matchesPrice = priceBand === "all" || (priceBand === "entry" && amount <= 10) || (priceBand === "mid" && amount > 10 && amount <= 50) || (priceBand === "premium" && amount > 50);
    const matchesVariants = variantOnly === "all" || (variantOnly === "has_variants" && Boolean(product.colors?.length));
    return matchesCategory && matchesBrand && matchesPrice && matchesVariants && (availability === "all" || !unavailable) && (!normalized || haystack.includes(normalized));
  }), [availability, brand, category, data?.availability, data?.products, normalized, priceBand, variantOnly]);
  const favoriteIds = new Set(favorites.data ?? []);
  const shelves = useMemo(() => {
    const order = ["indian_giftcard", "premium_sub", "game_topup", "electronics"];
    return order.flatMap((key) => {
      const first = (data?.products ?? []).find((product) => product.category === key);
      if (!first) return [];
      return [{ key, label: cleanLabel(categories[key] ?? key), image: imageForProduct(first.group, first.category, first.label), count: (data?.products ?? []).filter((product) => product.category === key).length }];
    });
  }, [categories, data?.products]);
  const checkoutProduct = (product: MerchandisingProduct, itemId: string) => onCheckout({ itemId, name: cleanLabel(product.group), type: cleanLabel(categories[product.category] ?? product.category), detail: product.label, price: product.pay });
  const buyNow = (product: MerchandisingProduct, itemId: string) => { checkoutProduct(product, itemId); setLocation("/checkout"); };
  if (isLoading) return <section className="real-catalog" aria-label="Loading ROTH DIGITAL catalog"><div className="real-catalog-head"><div><span className="catalog-kicker">REPOSITORY CATALOG / SYNCING</span><h3>Every route.<br /><em>One desk.</em></h3></div><p>Loading current source-backed product routes and their managed visual assets.</p></div><ProductCardSkeleton /></section>;
  if (error || !data) return <div className="real-catalog-loading">Catalog is temporarily unavailable. Refresh the page to retry.</div>;
  return <section className="real-catalog" aria-label="Full ROTH DIGITAL catalog"><div className="real-catalog-head"><div><span className="catalog-kicker">SHOP / {data.products.length} PRODUCTS</span><h3>Find your<br /><em>next favorite.</em></h3></div><p>Shop real catalog routes with clear price, availability, and checkout context. Customer reviews are not shown until a verified review source is connected.</p></div><div className="catalog-shelves" aria-label="Shop featured collections">{shelves.map((shelf) => <button type="button" className="catalog-shelf" key={shelf.key} onClick={() => setCategory(shelf.key)}><img src={shelf.image} alt="" /><span><b>{shelf.label}</b><small>{shelf.count} products</small></span><Sparkles size={14} /></button>)}</div><div className="real-catalog-tools"><div className="catalog-search-wrap"><label className="real-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search brands, products, passes" /></label>{suggestions.length > 0 && <div className="catalog-suggestions">{suggestions.map((product) => { const itemId = `${product.group} — ${product.label}`; return <Link key={itemId} href={`/product/${encodeURIComponent(itemId)}`} onClick={() => setQuery("")}><span>{cleanLabel(product.group)}</span><b>{product.label}</b><em>{formatPrice(product.pay)}</em></Link>; })}</div>}</div><div className="real-category-pills"><button className={category === "all" ? "active" : ""} onClick={() => setCategory("all")}>All</button>{Object.entries(categories).map(([key, label]) => <button key={key} className={category === key ? "active" : ""} onClick={() => setCategory(key)}>{cleanLabel(label)}</button>)}</div></div><div className="catalog-filter-bar"><span><SlidersHorizontal size={14} /> Filter products</span><select value={brand} onChange={(event) => setBrand(event.target.value)}><option value="all">All brands</option>{brands.map((value) => <option key={value} value={value}>{value}</option>)}</select><select value={priceBand} onChange={(event) => setPriceBand(event.target.value)}><option value="all">All price ranges</option><option value="entry">Entry (≤ 10)</option><option value="mid">Mid (10–50)</option><option value="premium">Premium (&gt; 50)</option></select><select value={variantOnly} onChange={(event) => setVariantOnly(event.target.value)}><option value="all">All variants</option><option value="has_variants">Has variants</option></select><select value={availability} onChange={(event) => setAvailability(event.target.value as typeof availability)}><option value="available">In stock</option><option value="all">Include out of stock</option></select><small>Prices stay in their original product currency until display conversion is available.</small></div><p className="real-catalog-count">{products.length} products found <span>·</span> <Sparkles size={12} /> curated for you</p><div className="product-merch-grid">{products.map((product) => { const itemId = `${product.group} — ${product.label}`; const image = imageForProduct(product.group, product.category, product.label); const unavailable = Boolean(data.availability?.[itemId]); const isFavorite = favoriteIds.has(itemId); return <ProductMerchandisingCard key={itemId} product={product} itemId={itemId} categoryLabel={cleanLabel(categories[product.category] ?? product.category)} image={image} unavailable={unavailable} formatPrice={formatPrice} onAdd={() => checkoutProduct(product, itemId)} onBuyNow={() => buyNow(product, itemId)} onQuickView={() => setQuickView({ product, itemId, categoryLabel: cleanLabel(categories[product.category] ?? product.category), image, unavailable })} wishlistControl={isAuthenticated ? <button className={`favorite-button ${isFavorite ? "is-active" : ""}`} onClick={() => toggleFavorite.mutate({ productId: itemId })} disabled={toggleFavorite.isPending} aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}><Heart size={14} fill={isFavorite ? "currentColor" : "none"} /></button> : <Link className="favorite-button" href="/login" aria-label="Sign in to save favorite"><Heart size={14} /></Link>} />; })}</div>{products.length === 0 && <div className="real-catalog-loading">No products match these filters. Clear a filter or include out-of-stock items to browse more.</div>}<ProductQuickView product={quickView?.product ?? null} itemId={quickView?.itemId} categoryLabel={quickView?.categoryLabel} image={quickView?.image} unavailable={quickView?.unavailable} formatPrice={formatPrice} onOpenChange={(open) => { if (!open) setQuickView(null); }} onAdd={quickView ? () => checkoutProduct(quickView.product, quickView.itemId) : undefined} onBuyNow={quickView ? () => buyNow(quickView.product, quickView.itemId) : undefined} /></section>;
}
