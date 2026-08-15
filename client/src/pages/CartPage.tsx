import StoreShell from "@/components/StoreShell";
import { useCart } from "@/contexts/CartContext";
import { useStorePreferences } from "@/contexts/StorePreferencesContext";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Link } from "wouter";

export default function CartPage() {
  const { items, updateQuantity, removeItem } = useCart();
  const { formatPrice } = useStorePreferences();
  return <StoreShell><section className="cart-page"><span className="catalog-kicker">CART / SELECTED ROUTES</span><h1>Your access,<br /><em>held in place.</em></h1>{items.length === 0 ? <div className="commerce-empty"><p>Your cart is clear. Start with a route that matches what you need.</p><Link href="/" className="button-primary">Browse catalog</Link></div> : <div className="cart-layout"><div className="cart-lines">{items.map((item) => <article className="cart-line" key={item.itemId}><div><span>{item.category}</span><h2>{item.group}</h2><p>{item.label}</p></div><strong>{formatPrice(item.price)}</strong><div className="quantity-control"><button onClick={() => updateQuantity(item.itemId, item.quantity - 1)} aria-label="Reduce quantity"><Minus size={13} /></button><b>{item.quantity}</b><button onClick={() => updateQuantity(item.itemId, item.quantity + 1)} aria-label="Increase quantity"><Plus size={13} /></button></div><button className="cart-delete" onClick={() => removeItem(item.itemId)} aria-label="Remove item"><Trash2 size={16} /></button></article>)}</div><aside className="cart-summary"><span>WALLET REVIEW</span><h2>All selected routes,<br />one request.</h2><p>Fund your wallet through a reviewed Flipkart or crypto deposit, then create manual-review requests for every selected cart item and quantity.</p><Link href="/checkout" className="button-primary">Continue with wallet</Link></aside></div>}</section></StoreShell>;
}
