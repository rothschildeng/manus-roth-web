import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { brandAlt, cleanBrand } from "@/lib/sanitize";
import { ArrowUpRight, Eye, ShoppingBag } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "wouter";

export type MerchandisingProduct = {
  category: string;
  group: string;
  label: string;
  pay: string;
  get?: string | null;
  origPay?: string | null;
  colors?: string[] | null;
  quoteOnly?: boolean | null;
};

type ProductCardProps = {
  product: MerchandisingProduct;
  itemId: string;
  categoryLabel: string;
  image?: string;
  unavailable?: boolean;
  formatPrice: (value: string) => string;
  onAdd?: () => void;
  onBuyNow?: () => void;
  onQuickView: () => void;
  wishlistControl?: ReactNode;
};

function productContext(product: MerchandisingProduct) {
  if (product.quoteOnly) return "Manual quote and review required before checkout.";
  if (product.colors?.length) return `Variants: ${product.colors.join(" · ")}`;
  return "Route and fulfilment details shown before wallet checkout.";
}

function savingText(current: string, original?: string | null) {
  if (!original) return null;
  const currentMatch = /^([₹$£])\s*([\d,.]+)$/.exec(current.trim());
  const originalMatch = /^([₹$£])\s*([\d,.]+)$/.exec(original.trim());
  if (!currentMatch || !originalMatch || currentMatch[1] !== originalMatch[1]) return null;
  const saved = Number(originalMatch[2].replaceAll(",", "")) - Number(currentMatch[2].replaceAll(",", ""));
  if (!Number.isFinite(saved) || saved <= 0) return null;
  return `You save ${currentMatch[1]}${saved.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

export function ProductMerchandisingCard({ product, itemId, categoryLabel, image, unavailable = false, formatPrice, onAdd, onBuyNow, onQuickView, wishlistControl }: ProductCardProps) {
  const quoteOnly = Boolean(product.quoteOnly);
  const state = unavailable ? "Out of stock" : quoteOnly ? "Manual quote" : "Manual review";
  const savings = savingText(product.pay, product.origPay);

  return <article className={`product-merch-card ${unavailable ? "is-unavailable" : ""}`}>
    <div className="product-merch-visual">
      {image ? <img src={image} alt={brandAlt(product.group)} loading="lazy" /> : <div className="product-merch-no-image">Catalog route</div>}
      <div className="product-merch-visual-top"><span className="product-merch-route">{categoryLabel}</span><span className={`product-merch-state ${unavailable || quoteOnly ? "is-alert" : ""}`}>{state}</span></div>
      {wishlistControl}
      <span className="product-merch-index" aria-hidden="true">SOURCE / LIVE</span>
    </div>
    <div className="product-merch-copy">
      <span className="product-merch-brand">{cleanBrand(product.group)}</span>
      <h4>{product.label}</h4>
      <p className="product-merch-description">{product.get ?? productContext(product)}</p>
      <p className="product-merch-context">{product.get ? productContext(product) : "Reviews are not yet available."}</p>
    </div>
    <footer className="product-merch-footer">
      <div className="product-merch-price"><span>Selling price</span><strong>{formatPrice(product.pay)}</strong>{product.origPay ? <s>Original price {formatPrice(product.origPay)}</s> : null}{savings ? <em>{formatPrice(savings.replace("You save ", ""))} saved</em> : null}</div>
      <div className="product-merch-actions">
        <button type="button" onClick={onQuickView} className="product-merch-quick" aria-label={`Quick view ${product.label}`}><Eye size={15} /><span>View</span></button>
        {quoteOnly ? <Link href="/support" aria-label={`Request a manual quote for ${product.label}`}><ArrowUpRight size={16} /></Link> : <>{onAdd ? <button type="button" onClick={onAdd} disabled={unavailable} className="product-merch-add" aria-label={`Add ${cleanBrand(product.group)} ${product.label} to cart`}><ShoppingBag size={15} /><span>Add</span></button> : null}{onBuyNow ? <button type="button" onClick={onBuyNow} disabled={unavailable} className="product-merch-buy" aria-label={`Buy ${cleanBrand(product.group)} ${product.label} now`}>Buy now</button> : null}</>}
      </div>
    </footer>
  </article>;
}

type QuickViewProps = {
  product: MerchandisingProduct | null;
  itemId?: string;
  categoryLabel?: string;
  image?: string;
  unavailable?: boolean;
  formatPrice: (value: string) => string;
  onOpenChange: (open: boolean) => void;
  onAdd?: () => void;
  onBuyNow?: () => void;
};

export function ProductQuickView({ product, itemId, categoryLabel, image, unavailable = false, formatPrice, onOpenChange, onAdd, onBuyNow }: QuickViewProps) {
  if (!product || !itemId) return null;
  const quoteOnly = Boolean(product.quoteOnly);

  return <Dialog open={Boolean(product)} onOpenChange={onOpenChange}>
    <DialogContent className="product-quick-view" showCloseButton>
      <DialogHeader className="product-quick-header">
        <span className="catalog-kicker">{categoryLabel ?? "CATALOG ROUTE"} / SOURCE-BACKED</span>
        <DialogTitle>{product.label}</DialogTitle>
        <DialogDescription>{cleanBrand(product.group)} · {quoteOnly ? "Manual quote route" : "Wallet checkout with manual review"}</DialogDescription>
      </DialogHeader>
      <div className="product-quick-layout">
        <div className="product-quick-image">{image ? <img src={image} alt={brandAlt(product.group)} /> : <span>Catalog route</span>}</div>
        <div className="product-quick-facts">
          {product.get ? <p><b>What you get</b>{product.get}</p> : null}
          <p><b>Route context</b>{productContext(product)}</p>
          <p><b>Price</b><strong>{formatPrice(product.pay)}</strong>{product.origPay ? <s>Original price {formatPrice(product.origPay)}</s> : null}{savingText(product.pay, product.origPay) ? <em>{formatPrice(savingText(product.pay, product.origPay)!.replace("You save ", ""))} saved</em> : null}</p>
          <p><b>Availability</b>{unavailable ? "Currently unavailable" : quoteOnly ? "Request a manual quote" : "Available for wallet request"}</p>
        </div>
      </div>
      <DialogFooter className="product-quick-actions">
        <Link href={`/product/${encodeURIComponent(itemId)}`} onClick={() => onOpenChange(false)} className="button-outline">Full details <ArrowUpRight size={15} /></Link>
        {quoteOnly ? <Link href="/support" onClick={() => onOpenChange(false)} className="button-primary">Request quote <ArrowUpRight size={15} /></Link> : <>{onAdd ? <button type="button" className="button-outline" disabled={unavailable} onClick={() => { onAdd(); onOpenChange(false); }}>Add to cart <ShoppingBag size={15} /></button> : null}{onBuyNow ? <button type="button" className="button-primary" disabled={unavailable} onClick={() => { onBuyNow(); onOpenChange(false); }}>Buy now <ArrowUpRight size={15} /></button> : null}</>}
      </DialogFooter>
    </DialogContent>
  </Dialog>;
}

export function ProductCardSkeleton({ count = 6 }: { count?: number }) {
  return <div className="product-merch-skeleton-grid" aria-label="Loading catalog products" role="status">{Array.from({ length: count }, (_, index) => <div className="product-merch-skeleton" key={index}><i /><b /><span /><em /></div>)}</div>;
}
