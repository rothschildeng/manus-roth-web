import StoreShell from "@/components/StoreShell";
import { useCart } from "@/contexts/CartContext";
import { useStorePreferences } from "@/contexts/StorePreferencesContext";
import { ArrowUpRight, CircleCheck, Minus, Plus, Trash2, WalletCards } from "lucide-react";
import { Link } from "wouter";

export default function CartPage() {
  const { items, updateQuantity, removeItem } = useCart();
  const { formatPrice } = useStorePreferences();
  const unitCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const parsedLines = items.map((item) => {
    const match = /^\s*([₹$£])([\d,]+(?:\.\d+)?)\s*$/.exec(item.price);
    return match ? { symbol: match[1], amount: Number(match[2].replaceAll(",", "")) * item.quantity } : null;
  });
  const symbols = new Set(parsedLines.filter((line): line is { symbol: string; amount: number } => Boolean(line)).map((line) => line.symbol));
  const estimatedTotal = parsedLines.every(Boolean) && symbols.size === 1 ? formatPrice(`${Array.from(symbols)[0]}${parsedLines.reduce((sum, line) => sum + (line?.amount ?? 0), 0)}`) : null;
  return <StoreShell><section className="cart-page"><span className="catalog-kicker">SHOPPING CART</span><h1>Your cart,<br /><em>ready when you are.</em></h1>{items.length === 0 ? <div className="commerce-empty"><p>Your cart is empty. Browse products and add what you need.</p><Link href="/" className="button-primary">Shop products</Link></div> : <div className="cart-layout"><div className="cart-lines">{items.map((item) => <article className="cart-line" key={item.itemId}><div><span>{item.category}</span><h2>{item.group}</h2><p>{item.label}</p></div><strong>{formatPrice(item.price)} each</strong><div className="quantity-control"><button onClick={() => updateQuantity(item.itemId, item.quantity - 1)} aria-label="Reduce quantity"><Minus size={13} /></button><b>{item.quantity}</b><button onClick={() => updateQuantity(item.itemId, item.quantity + 1)} aria-label="Increase quantity"><Plus size={13} /></button></div><button className="cart-delete" onClick={() => removeItem(item.itemId)} aria-label="Remove item"><Trash2 size={16} /></button></article>)}</div><aside className="cart-summary"><span>ORDER SUMMARY</span><h2>{unitCount} item{unitCount === 1 ? "" : "s"},<br />{items.length} product route{items.length === 1 ? "" : "s"}.</h2>{estimatedTotal ? <div className="cart-total"><span>Estimated item total</span><strong>{estimatedTotal}</strong></div> : <p>Products use mixed source currencies. Checkout will securely validate the final total before an order is created.</p>}<p>Product prices are displayed on each line in your selected display currency. The checkout securely validates every source-backed price, quantity, and final order total.</p><div className="my-5 grid gap-2 border-y border-white/10 py-4 text-sm text-[#c8d1c4]"><p className="flex gap-2"><CircleCheck size={15} className="mt-0.5 shrink-0 text-[#c7f34a]" /> Update quantities before checkout.</p><p className="flex gap-2"><CircleCheck size={15} className="mt-0.5 shrink-0 text-[#c7f34a]" /> Final total is validated by the server.</p><p className="flex gap-2"><CircleCheck size={15} className="mt-0.5 shrink-0 text-[#c7f34a]" /> Track your order status in your account.</p></div><Link href="/checkout" className="button-primary">Proceed to checkout <ArrowUpRight size={15} /></Link><Link href="/" className="button-outline mt-3">Continue shopping</Link></aside></div>}</section></StoreShell>;
}
