import StoreShell from "@/components/StoreShell";
import { imageForProduct } from "@/components/RealCatalog";
import { useCart } from "@/contexts/CartContext";
import { brandAlt, cleanBrand } from "@/lib/sanitize";
import { trpc } from "@/lib/trpc";
import { useStorePreferences } from "@/contexts/StorePreferencesContext";
import { ArrowUpRight, ShoppingBag } from "lucide-react";
import { Link, useRoute } from "wouter";

const clean = (value: string) => cleanBrand(value).replace(/^[^A-Za-z0-9]+/, "");

export default function CategoryPage() {
  const [, params] = useRoute("/category/:category");
  const category = params?.category ?? "";
  const { addItem } = useCart();
  const { formatPrice } = useStorePreferences();
  const { data, isLoading, error } = trpc.catalog.list.useQuery();
  const products = (data?.products ?? []).filter((product) => product.category === category);
  const categoryKey = category as keyof NonNullable<typeof data>["categories"];
  const categoryLabel = data?.categories[categoryKey];
  const title = categoryLabel ? clean(categoryLabel) : "Collection";
  return <StoreShell><section className="commerce-hero"><span className="catalog-kicker">COLLECTION / VERIFIED ROUTES</span><h1>{title}<br /><em>in one place.</em></h1><p>Browse exact repository-backed options. Prices, package labels, variants, and category metadata are shown as imported.</p></section><section className="commerce-grid-section">{isLoading ? <div className="commerce-empty">Loading the live catalog…</div> : error ? <div className="commerce-empty"><p>The catalog is temporarily unavailable.</p><Link href="/">Return to the catalog home</Link></div> : !categoryLabel ? <div className="commerce-empty"><p>This collection is not available.</p><Link href="/">Browse all catalog routes</Link></div> : products.length ? <div className="commerce-product-grid">{products.map((product) => { const itemId = `${product.group} — ${product.label}`; const image = imageForProduct(product.group, product.category, product.label); const quoteOnly = Boolean(product.quoteOnly); return <article className="commerce-product-card" key={itemId}>{image ? <img className="commerce-product-image" src={image} alt={brandAlt(product.group)} /> : null}<span className="commerce-product-group">{cleanBrand(product.group)}</span><h2>{product.label}</h2>{product.get && <p>{product.get}</p>}{quoteOnly ? <small>Manual quote and review required before checkout.</small> : product.colors?.length ? <small>{product.colors.join(" · ")}</small> : <small>Region and delivery details are shown before payment.</small>}<div className="commerce-card-bottom"><div><strong>{formatPrice(product.pay)}</strong>{product.origPay && <s>{formatPrice(product.origPay)}</s>}</div><div>{quoteOnly ? <Link href="/support" aria-label={`Request a quote for ${product.label}`}><ArrowUpRight size={16} /></Link> : <button onClick={() => addItem({ itemId, group: cleanBrand(product.group), label: product.label, category: title, price: product.pay })} aria-label={`Add ${product.label} to cart`}><ShoppingBag size={16} /></button>}<Link href={`/product/${encodeURIComponent(itemId)}`} aria-label={`View ${product.label}`}><ArrowUpRight size={16} /></Link></div></div></article>})}</div> : <div className="commerce-empty">No product route found in this category.</div>}</section></StoreShell>;
}
