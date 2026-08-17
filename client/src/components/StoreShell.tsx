import { useAuth } from "@/_core/hooks/useAuth";
import MobileBottomNav from "@/components/MobileBottomNav";
import CartSidebar from "@/components/CartSidebar";
import StorePreferenceControls from "@/components/StorePreferenceControls";
import { useCart } from "@/contexts/CartContext";
import { ChevronDown, Gift, Heart, House, LogOut, Menu, MessageCircle, PackageCheck, Search, ShoppingBag, Sparkles, UserRound, WalletCards, X } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useLocation } from "wouter";

const mark = "/manus-storage/roth-split-r-mark_124d79d5.png";

export default function StoreShell({ children }: { children: React.ReactNode }) {
  const { count } = useCart();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [, setLocation] = useLocation();
  const closeMobileNav = () => setMobileNavOpen(false);
  const profileRoute = isAuthenticated ? "/account" : "/login";
  const walletRoute = isAuthenticated ? "/wallet" : "/login";
  const ordersRoute = isAuthenticated ? "/orders" : "/login";
  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = search.trim();
    setLocation(query ? `/?q=${encodeURIComponent(query)}#catalog` : "/#catalog");
  };

  return <div className="store-page-shell">
    <div className="top-signal"><span className="signal-dot" /> ROTH DIGITAL <span className="top-signal-muted">·</span> VERIFIED SHOP <span className="top-signal-muted">·</span> CLEAR PRODUCT AND ORDER STATUS</div>
    <header className="store-topbar consumer-topbar">
      <Link href="/" className="brand-lockup" onClick={closeMobileNav}><img src={mark} alt="ROTH DIGITAL" className="brand-mark" /><span className="brand-wordmark"><strong>ROTH</strong><span>DIGITAL</span></span></Link>
      <form className="store-search" onSubmit={submitSearch} role="search"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products and brands" aria-label="Search products and brands" /><button type="submit">Search</button></form>
      <nav className="store-primary-links" aria-label="Shop categories"><Link href="/category/indian_giftcard">Gift Cards</Link><Link href="/category/game_topup">Game Top-ups</Link><Link href="/category/premium_sub">Subscriptions</Link><Link href="/category/electronics">Electronics</Link></nav>
      <button className="mobile-nav-toggle" onClick={() => setMobileNavOpen((open) => !open)} aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"} aria-expanded={mobileNavOpen}>{mobileNavOpen ? <X size={18} /> : <Menu size={18} />}</button>
      <nav className={mobileNavOpen ? "nav-open" : ""} aria-label="Mobile shop navigation">
        <div className="mobile-nav-profile"><UserRound size={17} /><div><b>{isAuthenticated ? user?.name ?? "My profile" : "My profile"}</b><span>{isAuthenticated ? user?.email ?? "Account access" : "Sign in for wallet and orders"}</span></div></div>
        <Link href="/" onClick={closeMobileNav}><House size={14} className="mobile-nav-icon" />Home</Link>
        <div className="mobile-nav-section"><span>Shop</span><Link href="/category/indian_giftcard" onClick={closeMobileNav}>Gift cards</Link><Link href="/category/game_topup" onClick={closeMobileNav}>Game top-ups</Link><Link href="/category/premium_sub" onClick={closeMobileNav}>Subscriptions</Link><Link href="/category/electronics" onClick={closeMobileNav}>Electronics</Link><Link href="/category/cloud_services" onClick={closeMobileNav}>Cloud services</Link><Link href="/vcc" onClick={closeMobileNav}>Cards</Link></div>
        <div className="mobile-nav-section"><span>Account</span><Link href={walletRoute} onClick={closeMobileNav}><WalletCards size={14} />Wallet</Link><Link href={ordersRoute} onClick={closeMobileNav}><PackageCheck size={14} />My orders</Link><Link href="/wishlist" onClick={closeMobileNav}><Heart size={14} />Wishlist</Link><Link href="/support" onClick={closeMobileNav}><MessageCircle size={14} />Help & support</Link></div>
      </nav>
      <div className="store-top-actions"><StorePreferenceControls compact /><Link href="/support" className="store-text-action"><MessageCircle size={15} /><span>Help</span></Link><div className="profile-menu">{!loading && !isAuthenticated ? <Link href="/login" className="profile-trigger"><UserRound size={15} /><span>Profile</span></Link> : !loading ? <><button className="profile-trigger" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen}><UserRound size={15} /><span>{user?.name?.split(" ")[0] ?? "Profile"}</span><ChevronDown size={13} /></button>{menuOpen && <div className="profile-popover"><b>{user?.name ?? "Account"}</b><small>{user?.email ?? "Signed in securely"}</small><Link href="/orders" onClick={() => setMenuOpen(false)}><PackageCheck size={14} /> My orders</Link><Link href="/wallet" onClick={() => setMenuOpen(false)}><WalletCards size={14} /> My wallet</Link><Link href="/wishlist" onClick={() => setMenuOpen(false)}><Heart size={14} /> My wishlist</Link><Link href="/settings" onClick={() => setMenuOpen(false)}><UserRound size={14} /> Settings</Link><button onClick={() => { setMenuOpen(false); logout(); }}><LogOut size={14} /> Logout</button></div>}</> : <span className="profile-trigger"><UserRound size={15} /></span>}</div><button className="cart-button" onClick={() => setCartOpen(true)} aria-label={`Open cart with ${count} items`}><ShoppingBag size={16} /><span>Cart</span>{count > 0 && <b>{count}</b>}</button></div>
    </header>
    <main className="commerce-main">{children}</main>
    <MobileBottomNav />
    <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
    <Link className="whatsapp-float" href="/support" aria-label="Open ROTH DIGITAL support"><MessageCircle size={19} /></Link>
    <footer className="commerce-footer"><div><Link href="/" className="brand-lockup"><img src={mark} alt="ROTH DIGITAL" className="brand-mark" /><span className="brand-wordmark"><strong>ROTH</strong><span>DIGITAL</span></span></Link><p>Shop source-backed digital products with a visible wallet-funded order journey and clear customer support.</p></div><div className="commerce-footer-links"><div><b>Shop</b><Link href="/category/indian_giftcard">Gift cards</Link><Link href="/category/game_topup">Game top-ups</Link><Link href="/category/premium_sub">Subscriptions</Link><Link href="/category/electronics">Electronics</Link></div><div><b>Account</b><Link href="/account">My account</Link><Link href="/wallet">Wallet</Link><Link href="/orders">Orders</Link><Link href="/wishlist">Wishlist</Link><Link href="/support">Support</Link></div><div><b>Information</b><Link href="/about">About</Link><Link href="/refunds">Refunds</Link><Link href="/terms">Terms</Link><Link href="/privacy">Privacy</Link></div></div></footer>
  </div>;
}
