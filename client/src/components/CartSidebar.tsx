import { useCart } from "@/contexts/CartContext";
import { useStorePreferences } from "@/contexts/StorePreferencesContext";
import { Check, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

type CartSidebarProps = {
  open: boolean;
  onClose: () => void;
};

function calculateTotal(items: ReturnType<typeof useCart>["items"], formatPrice: (price: string) => string) {
  const parsed = items.map((item) => {
    const match = /^\s*([₹$£])([\d,]+(?:\.\d+)?)\s*$/.exec(item.price);
    return match ? { symbol: match[1], amount: Number(match[2].replaceAll(",", "")) * item.quantity } : null;
  });
  const symbols = new Set(parsed.filter((entry): entry is { symbol: string; amount: number } => Boolean(entry)).map((entry) => entry.symbol));
  return parsed.every(Boolean) && symbols.size === 1
    ? formatPrice(`${Array.from(symbols)[0]}${parsed.reduce((total, entry) => total + (entry?.amount ?? 0), 0)}`)
    : null;
}

export default function CartSidebar({ open, onClose }: CartSidebarProps) {
  const { items, count, updateQuantity, removeItem } = useCart();
  const { formatPrice } = useStorePreferences();
  const [notice, setNotice] = useState<string | null>(null);
  const total = calculateTotal(items, formatPrice);
  const announce = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2400);
  };
  const changeQuantity = (itemId: string, nextQuantity: number) => {
    updateQuantity(itemId, nextQuantity);
    announce(nextQuantity < 1 ? "Item removed from cart" : "Cart quantity updated");
  };
  const remove = (itemId: string) => {
    removeItem(itemId);
    announce("Item removed from cart");
  };

  return <>
    <button className={`cart-drawer-overlay ${open ? "is-open" : ""}`} onClick={onClose} aria-label="Close cart" tabIndex={open ? 0 : -1} />
    <aside className={`cart-drawer ${open ? "is-open" : ""}`} aria-label="Shopping cart" aria-hidden={!open}>
      <header className="cart-drawer-header">
        <div><span>YOUR CART</span><h2>{count} item{count === 1 ? "" : "s"}</h2></div>
        <button onClick={onClose} aria-label="Close cart"><X size={20} /></button>
      </header>
      <div className="cart-drawer-items">
        {items.length === 0 ? <div className="cart-drawer-empty"><ShoppingBag size={38} /><h3>Your cart is empty</h3><p>Add a product route when you are ready to shop.</p><Link href="/" onClick={onClose}>Browse products</Link></div> : items.map((item) => <article className="cart-drawer-item" key={item.itemId}>
          <div className="cart-drawer-icon"><ShoppingBag size={19} /></div>
          <div className="cart-drawer-copy"><span>{item.category}</span><h3>{item.group}</h3><p>{item.label}</p><b>{formatPrice(item.price)} each</b><div className="cart-drawer-quantity"><button onClick={() => changeQuantity(item.itemId, item.quantity - 1)} aria-label={`Reduce ${item.group} quantity`}><Minus size={13} /></button><strong>{item.quantity}</strong><button onClick={() => changeQuantity(item.itemId, item.quantity + 1)} aria-label={`Increase ${item.group} quantity`}><Plus size={13} /></button></div></div>
          <button className="cart-drawer-remove" onClick={() => remove(item.itemId)} aria-label={`Remove ${item.group}`}><Trash2 size={15} /></button>
        </article>)}
      </div>
      {items.length > 0 && <footer className="cart-drawer-footer">
        <div className="cart-drawer-total"><span>{total ? "Estimated item total" : "Source-currency validation"}</span><strong>{total ?? "Shown at checkout"}</strong></div>
        {!total && <p>Mixed source currencies are validated at checkout before an order is created.</p>}
        <Link className="cart-drawer-checkout" href="/checkout" onClick={onClose}>Proceed to checkout</Link>
        <Link className="cart-drawer-view" href="/cart" onClick={onClose}>View full cart</Link>
      </footer>}
    </aside>
    <div className={`cart-drawer-toast ${notice ? "is-visible" : ""}`} role="status"><Check size={15} />{notice}</div>
  </>;
}
