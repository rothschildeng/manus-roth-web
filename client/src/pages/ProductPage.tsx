import StoreShell from "@/components/StoreShell";
import { imageForProduct } from "@/components/RealCatalog";
import { useCart } from "@/contexts/CartContext";
import { brandAlt, cleanBrand } from "@/lib/sanitize";
import { trpc } from "@/lib/trpc";
import { useStorePreferences } from "@/contexts/StorePreferencesContext";
import { ArrowLeft, ArrowUpRight, Check, Copy, MessageCircle, Minus, Plus, Share2, ShoppingBag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useRoute } from "wouter";

const clean = (value: string) => cleanBrand(value).replace(/^[^A-Za-z0-9]+/, "");

const setDocumentMeta = (selector: string, attribute: "name" | "property", key: string, content: string) => {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
};

export default function ProductPage() {
  const [, params] = useRoute("/product/:id"); const itemId = params?.id ? decodeURIComponent(params.id) : ""; const { addItem } = useCart(); const { formatPrice } = useStorePreferences(); const { data, isLoading } = trpc.catalog.list.useQuery(); const [quantity, setQuantity] = useState(1); const [shareNotice, setShareNotice] = useState(""); const [, setLocation] = useLocation(); const product = (data?.products ?? []).find((item) => `${item.group} — ${item.label}` === itemId);
  if (isLoading) return <StoreShell><div className="commerce-empty">Opening product route…</div></StoreShell>; if (!product) return <StoreShell><div className="commerce-empty"><p>That product route is unavailable.</p><Link href="/">Return to the catalog</Link></div></StoreShell>;
  const category = clean(data?.categories[product.category] ?? product.category); const isVcc = product.category === "vcc"; const unavailable = Boolean(data?.availability[itemId]); const quoteOnly = Boolean(product.quoteOnly); const image = imageForProduct(product.group, product.category, product.label);
  const shareTitle = `${product.label} | ROTH DIGITAL`;
  const shareDescription = product.get ?? `${cleanBrand(product.group)} · ${category}. Product details and availability are shown before checkout.`;
  const shareUrl = typeof window === "undefined" ? "" : `${window.location.origin}/product/${encodeURIComponent(itemId)}`;
  const shareImage = typeof window === "undefined" ? image : image ? new URL(image, window.location.origin).toString() : `${window.location.origin}/manus-storage/roth-hero-obsidian_e1aea3ed.jpg`;
  const shareText = `${shareDescription}\n\n${product.label}\nPrice: ${formatPrice(product.pay)}\n\nCheck it out:`;
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setShareNotice("Product link copied.");
    } catch {
      setShareNotice("Copy is unavailable in this browser. Use the Share button instead.");
    }
  };
  const nativeShare = async () => {
    if (!navigator.share) { await copyLink(); return; }
    try {
      await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
      setShareNotice("Share sheet opened.");
    } catch (error) {
      if ((error as DOMException).name !== "AbortError") setShareNotice("Share could not be opened. You can copy the link instead.");
    }
  };
  const whatsappShare = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`, "_blank", "noopener,noreferrer");
    setShareNotice("WhatsApp share opened.");
  };
  useEffect(() => {
    document.title = shareTitle;
    setDocumentMeta('meta[property="og:title"]', "property", "og:title", shareTitle);
    setDocumentMeta('meta[property="og:description"]', "property", "og:description", shareDescription);
    setDocumentMeta('meta[property="og:image"]', "property", "og:image", shareImage);
    setDocumentMeta('meta[property="og:url"]', "property", "og:url", shareUrl);
    setDocumentMeta('meta[property="og:type"]', "property", "og:type", "product");
    setDocumentMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    setDocumentMeta('meta[name="twitter:title"]', "name", "twitter:title", shareTitle);
    setDocumentMeta('meta[name="twitter:description"]', "name", "twitter:description", shareDescription);
    setDocumentMeta('meta[name="twitter:image"]', "name", "twitter:image", shareImage);
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = shareUrl;
  }, [shareDescription, shareImage, shareTitle, shareUrl]);
  const addQuantityToCart = () => { for (let index = 0; index < quantity; index += 1) addItem({ itemId, group: cleanBrand(product.group), label: product.label, category, price: product.pay }); };
  const related = useMemo(() => (data?.products ?? []).filter((item) => item.category === product.category && `${item.group} — ${item.label}` !== itemId).slice(0, 3), [data?.products, itemId, product.category]);
  return <StoreShell><section className="product-detail"><Link href={isVcc ? "/vcc" : `/category/${product.category}`} className="back-link"><ArrowLeft size={15} /> Back to {isVcc ? "Cards" : category}</Link><div className="product-detail-layout"><div className={`product-detail-plate ${isVcc ? "vcc-detail-plate" : ""}`}><span>{isVcc ? "CARDS / PRODUCT DETAIL" : "SHOP / PRODUCT DETAIL"}</span><strong>{cleanBrand(product.group)}</strong>{!isVcc && image ? <img className="product-detail-image" src={image} alt={brandAlt(product.group)} /> : <div className="detail-mark">{isVcc ? "••••" : "R"}</div>}{isVcc && <small>{unavailable ? "OUT OF STOCK" : "MANUAL HANDOFF"}</small>}</div><div className="product-detail-copy"><span className="catalog-kicker">{category} / PRODUCT</span><h1>{product.label}</h1><p className="detail-package">{product.get ?? "Product details and purchase context are shown below."}</p><div className="detail-price"><span>Selling price</span><strong>{formatPrice(product.pay)}</strong>{product.origPay && <s>Original price {formatPrice(product.origPay)}</s>}</div><div className="detail-facts"><div><Check size={15} /><span><b>Product information</b>{product.colors?.length ? `Available options: ${product.colors.join(" · ")}` : "Full product details are shown before checkout."}</span></div><div><Check size={15} /><span><b>Availability</b>{unavailable ? "This product is currently out of stock." : quoteOnly ? "Request a quote before purchase." : "Available to add to cart."}</span></div><div><Check size={15} /><span><b>Reviews</b>Reviews are not yet available.</span></div></div>{quoteOnly ? <div className="detail-variants"><span>MANUAL QUOTE</span><p>This service requires a custom review before a quote can be issued.</p></div> : unavailable ? <div className="detail-variants"><span>OUT OF STOCK</span><p>This product is currently unavailable.</p></div> : <div className="detail-quantity"><span>QUANTITY</span><div><button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Reduce quantity"><Minus size={15} /></button><b>{quantity}</b><button type="button" onClick={() => setQuantity((value) => value + 1)} aria-label="Increase quantity"><Plus size={15} /></button></div></div>}<div className="detail-actions">{quoteOnly ? <Link href="/support" className="button-primary">Request quote <ArrowUpRight size={16} /></Link> : <><button className="button-outline" disabled={unavailable} onClick={addQuantityToCart}><ShoppingBag size={16} /> {unavailable ? "Out of stock" : "Add to cart"}</button>{unavailable ? <span className="button-outline">Unavailable</span> : <button className="button-primary" onClick={() => { addQuantityToCart(); setLocation("/checkout"); }}>Buy now <ArrowUpRight size={16} /></button>}</>}</div><div className="detail-share" aria-label="Share this product"><span>SHARE THIS PRODUCT</span><div className="share-buttons"><button type="button" onClick={whatsappShare}><MessageCircle size={14} /> WhatsApp</button><button type="button" onClick={nativeShare}><Share2 size={14} /> Share</button><button type="button" onClick={copyLink}><Copy size={14} /> Copy link</button></div>{shareNotice && <p role="status">{shareNotice}</p>}</div></div></div>{related.length ? <section className="related-products"><div><span className="catalog-kicker">YOU MAY ALSO LIKE</span><h2>More in {category}.</h2></div><div className="related-product-grid">{related.map((item) => { const relatedId = `${item.group} — ${item.label}`; const relatedImage = imageForProduct(item.group, item.category, item.label); return <Link href={`/product/${encodeURIComponent(relatedId)}`} key={relatedId}><img src={relatedImage} alt={brandAlt(item.group)} /><span>{cleanBrand(item.group)}</span><b>{item.label}</b><strong>{formatPrice(item.pay)}</strong></Link>; })}</div></section> : null}</section></StoreShell>;
}
