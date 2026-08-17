import { trpc } from "@/lib/trpc";
import RealCatalog, { type CheckoutCatalogItem } from "@/components/RealCatalog";
import CartSidebar from "@/components/CartSidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import { useCart } from "@/contexts/CartContext";
import { useStorePreferences } from "@/contexts/StorePreferencesContext";
import StorePreferenceControls from "@/components/StorePreferenceControls";
import "@/styles/catalog-source-count.css";
import { FormEvent, useMemo, useState } from "react";
import { ArrowUpRight, ChevronRight, Cpu, Gamepad2, Gift, Laptop, LayoutGrid, Menu, Search, ShoppingBag, Sparkles, WalletCards, X, Zap } from "lucide-react";
import { Link, useLocation } from "wouter";

const assets = {
  hero: "/manus-storage/roth-hero-obsidian_e1aea3ed.jpg",
  plates: "/manus-storage/roth-plate-catalog_a51de463.jpg",
  wallet: "/manus-storage/roth-wallet-orbit_a44824e8.jpg",
  room: "/manus-storage/roth-access-room_6f0a17a4.jpg",
  mark: "/manus-storage/roth-split-r-mark_124d79d5.png",
};

const collectionCards = [
  { name: "Gift cards", note: "The everyday unlock", path: "/category/indian_giftcard", tone: "lime", icon: Gift },
  { name: "Game top-ups", note: "Load in one move", path: "/category/game_topup", tone: "steel", icon: Gamepad2 },
  { name: "Subscriptions", note: "Keep your access", path: "/category/premium_sub", tone: "bone", icon: Cpu },
  { name: "Electronics", note: "Device routes, clearly shown", path: "/category/electronics", tone: "blue", icon: Laptop },
];

const discoveryCards = [
  { name: "All routes", note: "Browse the full catalog", path: "/#catalog", category: null, icon: LayoutGrid },
  { name: "Gift cards", note: "Everyday balance", path: "/category/indian_giftcard", category: "indian_giftcard", icon: Gift },
  { name: "Game top-ups", note: "Game currency & passes", path: "/category/game_topup", category: "game_topup", icon: Gamepad2 },
  { name: "Subscriptions", note: "Access & software", path: "/category/premium_sub", category: "premium_sub", icon: Cpu },
  { name: "Electronics", note: "Device routes", path: "/category/electronics", category: "electronics", icon: Laptop },
];

const featuredSlots = [
  { name: "Amazon India", type: "Gift cards", detail: "Repository-backed gift-card route", itemId: "🛒 Amazon India — Pay ₹1,549 → Get ₹5,000" },
  { name: "Free Fire Diamonds", type: "Game top-ups", detail: "Verified catalog route", itemId: "🔥 Free Fire Diamonds — 100 💎" },
  { name: "ChatGPT Plus iCloud", type: "Subscriptions", detail: "Repository-backed package", itemId: "🤖 ChatGPT / OpenAI — ChatGPT Plus iCloud — No warranty" },
  { name: "iPhone 16e", type: "Electronics", detail: "Product-specific image and price", itemId: "📱 iPhone — iPhone 16e · 128GB" },
];

const brandNetwork = [
  { name: "Amazon", route: "Gift cards", src: "/manus-storage/amazon_3eae347f.jpg" },
  { name: "Flipkart", route: "Wallet funding", src: "/manus-storage/flipkart_a0519cde.jpg" },
  { name: "Apple", route: "Electronics", src: "/manus-storage/apple_9171b857.jpg" },
  { name: "ChatGPT", route: "AI access", src: "/manus-storage/chatgpt_50484410.jpg" },
  { name: "Gemini", route: "AI access", src: "/manus-storage/roth-gemini-logo_2b4b8b78.png" },
  { name: "Cursor", route: "Software", src: "/manus-storage/roth-cursor-logo_a04747bd.png" },
  { name: "Canva", route: "Software", src: "/manus-storage/roth-canva-logo_2dcfe4fd.png" },
  { name: "Netflix", route: "Subscriptions", src: "/manus-storage/netflix_290db0bc.jpg" },
  { name: "Free Fire", route: "Game top-ups", src: "/manus-storage/freefire_f9b5fd3f.jpg" },
  { name: "Steam", route: "Game top-ups", src: "/manus-storage/steam_4cc9daa0.jpg" },
  { name: "Spotify", route: "Subscriptions", src: "/manus-storage/spotify_2a239ba7.jpg" },
];

export default function Home() {
  const { count, addItem } = useCart();
  const { formatPrice } = useStorePreferences();
  const [location, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [shopSearch, setShopSearch] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const sourceCatalog = trpc.catalog.list.useQuery();
  const sourceCategoryCounts = useMemo<Record<string, number>>(() => {
    const products = sourceCatalog.data?.products ?? [];
    return products.reduce<Record<string, number>>((counts, product) => {
      counts[product.category] = (counts[product.category] ?? 0) + 1;
      return counts;
    }, { all: products.length });
  }, [sourceCatalog.data?.products]);
  const featured = useMemo(() => {
    const byId = new Map((sourceCatalog.data?.products ?? []).map((product) => [`${product.group} — ${product.label}`, product]));
    return featuredSlots.flatMap((slot) => {
      const product = byId.get(slot.itemId);
      return product ? [{ ...slot, detail: product.get ?? slot.detail, price: product.pay }] : [];
    });
  }, [sourceCatalog.data?.products]);

  const scrollTo = (id: string) => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); setMenuOpen(false); };
  const addToCart = (item: CheckoutCatalogItem) => {
    addItem({ itemId: item.itemId, group: item.name, label: item.detail, category: item.type, price: item.price });
    setCartOpen(true);
  };
  const initialQuery = new URLSearchParams((location.split("?")[1] ?? "").split("#")[0]).get("q") ?? "";
  const submitSearch = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const query = shopSearch.trim(); setLocation(query ? `/?q=${encodeURIComponent(query)}#catalog` : "/#catalog"); };

  return <div className="site-shell">
    <div className="top-signal"><span className="signal-dot" /> ROTH DIGITAL <span className="top-signal-muted">·</span> SHOP DIGITAL ESSENTIALS WITH CLEAR ORDER STATUS</div>
    <header className="site-nav">
      <a className="brand-lockup" href="#top" aria-label="ROTH DIGITAL home"><img src={assets.mark} alt="" className="brand-mark" /><span className="brand-wordmark"><strong>ROTH</strong><span>DIGITAL</span></span></a>
      <nav className={`nav-links ${menuOpen ? "is-open" : ""}`} aria-label="Primary navigation"><button onClick={() => scrollTo("catalog")}>Shop</button><Link href="/category/indian_giftcard">Gift cards</Link><Link href="/category/game_topup">Games</Link><Link href="/category/premium_sub">Subscriptions</Link><Link href="/category/electronics">Electronics</Link></nav>
      <div className="nav-actions"><form className="home-search" onSubmit={submitSearch}><Search size={14} /><input value={shopSearch} onChange={(event) => setShopSearch(event.target.value)} placeholder="Search products and brands" aria-label="Search products and brands" /><button type="submit">Search</button></form><StorePreferenceControls compact /><button className="cart-button" onClick={() => setCartOpen(true)} aria-label={`Open cart with ${count} items`}><ShoppingBag size={16} /><span>Cart</span>{count > 0 && <b>{count}</b>}</button><button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Close menu" : "Open menu"}>{menuOpen ? <X size={19} /> : <Menu size={19} />}</button></div>
    </header>
    <main id="top">
      <section className="hero-section"><div className="hero-copy"><div className="eyebrow"><span className="eyebrow-line" /> ROTH DIGITAL SHOP <span className="eyebrow-status">Clear order status</span></div><h1>Digital<br /><em>essentials,</em><br />made simple.</h1><p className="hero-lede">Gift cards, game top-ups, subscriptions, cloud services, and electronics in one shop. Browse the catalog, save favorites, and checkout through your wallet.</p><div className="hero-actions"><button className="button-primary" onClick={() => scrollTo("catalog")}>Shop products <ChevronRight size={17} /></button><Link href="/category/indian_giftcard" className="button-text">Browse gift cards <ArrowUpRight size={16} /></Link></div><div className="hero-footnote"><span className="mini-check">✓</span> Real source-backed prices <span className="foot-divider" /> <span className="mini-check">✓</span> Cart and wishlist available</div></div><div className="hero-visual"><div className="hero-orbit orbit-one">SHOP <span>01</span></div><div className="hero-orbit orbit-two">CART <span>02</span></div><div className="hero-orbit orbit-three">ROTH <span>03</span></div><div className="hero-image-frame"><img src={assets.hero} alt="ROTH DIGITAL dark glass storefront sculpture" /><div className="hero-image-shine" /></div><div className="hero-coordinate">SHOP<br />ONLINE</div><div className="hero-plate-caption"><span>ROTH DIGITAL</span><strong>Find your next<br />digital essential.</strong></div></div></section>
      <section className="proof-strip"><div><span className="proof-number">01</span><span className="proof-label">wallet funding</span></div><div><span className="proof-number">02</span><span className="proof-label">deposit confirmation</span></div><div><span className="proof-number">03</span><span className="proof-label">manual approval</span></div><div className="proof-manifesto"><Sparkles size={17} /> <span>Low noise.<br /><b>Clear state.</b></span></div></section>
      <section className="category-discovery" aria-label="Shop categories"><div className="category-discovery-head"><div><span className="catalog-kicker">START WITH A CATEGORY</span><h2>Choose your<br /><em>next route.</em></h2></div><p>Live counts come from the current source-backed catalog.</p></div><div className="category-discovery-grid">{discoveryCards.map((item) => { const Icon = item.icon; const count = item.category ? sourceCategoryCounts[item.category] ?? 0 : sourceCategoryCounts.all; return <Link key={item.name} href={item.path} className="category-discovery-card"><span className="category-discovery-icon"><Icon size={19} /></span><div><b>{item.name}</b><small>{item.note}</small></div><strong>{sourceCatalog.isLoading ? "…" : `${count} routes`}</strong><ArrowUpRight size={14} /></Link>; })}</div></section>
      <section className="mx-auto grid max-w-6xl gap-4 px-5 py-10 md:grid-cols-[1.15fr_1.85fr] md:px-8"><div className="border border-[#c7f34a]/30 bg-[#0d110d] p-6"><span className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#c7f34a]">Wallet-first path</span><h2 className="mt-3 font-['Space_Grotesk'] text-3xl tracking-[-.06em] text-[#f3f0e6]">Three steps.<br />No hidden payment route.</h2><p className="mt-3 text-sm leading-6 text-[#a5afa2]">Every product order begins with a wallet balance and stays visible through manual review. Direct product crypto payment is not used.</p><Link href="/wallet#deposit" className="button-primary mt-5 inline-flex">Open funding desk <ArrowUpRight size={16} /></Link></div><ol className="grid gap-3 sm:grid-cols-3"><li className="border border-white/10 bg-white/[.025] p-5"><span className="text-[10px] font-semibold tracking-[.16em] text-[#c7f34a]">01 / SUBMIT</span><h3 className="mt-3 text-lg text-[#f3f0e6]">Fund wallet</h3><p className="mt-2 text-sm leading-6 text-[#9ba79a]">Create a Flipkart gift-card or crypto deposit request for review.</p></li><li className="border border-white/10 bg-white/[.025] p-5"><span className="text-[10px] font-semibold tracking-[.16em] text-[#c7f34a]">02 / VERIFY</span><h3 className="mt-3 text-lg text-[#f3f0e6]">Wait for credit</h3><p className="mt-2 text-sm leading-6 text-[#9ba79a]">An administrator verifies the request before any balance changes.</p></li><li className="border border-white/10 bg-white/[.025] p-5"><span className="text-[10px] font-semibold tracking-[.16em] text-[#c7f34a]">03 / REQUEST</span><h3 className="mt-3 text-lg text-[#f3f0e6]">Checkout from wallet</h3><p className="mt-2 text-sm leading-6 text-[#9ba79a]">Your cart enters a visible manual-review order workflow.</p></li></ol></section>
      <section className="brand-network" aria-labelledby="brand-network-title"><div className="brand-network-copy"><div><span className="catalog-kicker">MANAGED BRAND NETWORK</span><strong id="brand-network-title">Recognize each route.</strong></div><p>Mapped only to source-backed catalog routes using managed brand assets.</p></div><div className="brand-network-grid">{brandNetwork.map((brand, index) => <article className="brand-network-card" key={brand.name}><span className="brand-network-index">{String(index + 1).padStart(2, "0")}</span><div className="brand-network-logo"><img src={brand.src} alt={`${brand.name} brand mark`} /></div><div className="brand-network-label"><b>{brand.name}</b><small>{brand.route}</small></div></article>)}</div></section>
      <section className="catalog-section" id="catalog"><div className="section-heading"><div><div className="eyebrow"><span className="eyebrow-line" /> Shop by category</div><h2>Find what<br /><em>you need.</em></h2></div><p>Clear products, source-backed prices, managed visual assets, and cart actions built for easy browsing.</p></div><div className="category-rail">{collectionCards.map((item, index) => <Link key={item.name} href={item.path} className={`category-tile tile-${item.tone}`}><span className="tile-index">0{index + 1}</span><span className="tile-icon"><item.icon size={22} /></span><span className="tile-name">{item.name}</span><span className="tile-note">{item.note}</span><span className="tile-meta">Shop now <ArrowUpRight size={13} /></span></Link>)}</div><div className="featured-heading"><div className="featured-title"><img src={assets.mark} alt="" /><div><span className="catalog-kicker">SHOP SPOTLIGHT</span><h3>Popular product routes.</h3></div></div><div className="catalog-source-count" aria-live="polite"><span>SHOP CATALOG</span>{sourceCatalog.isLoading ? <div className="catalog-count-loading" role="status" aria-label="Loading product count"><i /><i /><i /><em>Loading products</em></div> : <b>{`${sourceCatalog.data?.products.length ?? 0} products`}</b>}</div></div><div className="product-grid">{featured.map((item, index) => <article className="product-card" key={item.itemId}><div className={`product-art art-${index + 1}`} style={index === 0 ? { backgroundImage: `linear-gradient(135deg, rgba(8,10,8,.28), rgba(8,10,8,.7)), url(${assets.plates})` } : undefined}><span className="product-tag">Shop pick</span><span className="product-art-symbol">{index === 0 ? "◌" : index === 1 ? "✦" : index === 2 ? "↗" : "◈"}</span><span className="product-art-index">SHOP / 0{index + 1}</span></div><div className="product-info"><span className="product-type">{item.type}</span><h4>{item.name}</h4><p className="product-detail"><Zap size={12} /> {item.detail}</p><div className="product-bottom"><strong>{formatPrice(item.price)}</strong><button className="product-add-label" onClick={() => addToCart({ itemId: item.itemId, name: item.name, type: item.type, detail: item.detail, price: item.price })} aria-label={`Add ${item.name} to cart`}><ShoppingBag size={15} /><span>Add to cart</span></button></div></div></article>)}{featured.length === 0 && <div className="empty-state">Featured products are loading.</div>}</div><RealCatalog onCheckout={addToCart} initialQuery={initialQuery} /></section>
      <section className="story-section"><div className="story-visual"><img src={assets.room} alt="Dark ROTH DIGITAL gallery room with illuminated access stations" /><div className="story-stamp">CURATED<br /><span>FOR MOTION</span></div></div><div className="story-copy"><div className="eyebrow"><span className="eyebrow-line" /> The Roth method</div><h2>Three moves.<br /><em>One clear handoff.</em></h2><p>ROTH DIGITAL keeps the order status visible. Fund your wallet, choose a catalog route, and follow the manual-review and fulfilment stages.</p><div className="method-list"><div><span>01</span><div><strong>Fund your wallet</strong><p>Use the Flipkart or crypto deposit path and wait for manual review.</p></div></div><div><span>02</span><div><strong>Choose your route</strong><p>Add every selected catalog item and quantity to one wallet request.</p></div></div><div><span>03</span><div><strong>Track the review</strong><p>Approved orders move through a visible fulfilment decision.</p></div></div></div><button className="button-primary" onClick={() => scrollTo("catalog")}>Browse the collection <ArrowUpRight size={16} /></button></div></section>
      <section className="wallet-section"><div className="wallet-copy"><span className="catalog-kicker">THE WALLET LAYER</span><h2>Your balance,<br /><em>in motion.</em></h2><p>Keep a balance ready for the next move. Flipkart and crypto deposits remain tied to a visible manual-review trail.</p><Link href="/wallet#deposit" className="wallet-source-chip"><img src="/manus-storage/flipkart_a0519cde.jpg" alt="Flipkart brand mark" /><span><b>Fund with Flipkart or crypto</b><small>Manual review · minimum $25</small></span><ArrowUpRight size={16} /></Link><Link href="/wallet" className="button-outline"><WalletCards size={17} /> Open wallet</Link></div><div className="wallet-visual"><img src={assets.wallet} alt="Black glass wallet sphere with metallic orbit" /><div className="wallet-readout"><span>LEDGER CONTROL</span><strong>•</strong><small>MANUAL / VERIFIED</small></div></div></section>
      <section className="mx-auto max-w-6xl px-5 py-10 md:px-8"><div className="border border-white/10 bg-[#0d110d] p-6 md:p-8"><div className="grid gap-6 md:grid-cols-[1fr_2fr]"><div><span className="catalog-kicker">WHY THE DESK WORKS</span><h2 className="mt-3 font-['Space_Grotesk'] text-3xl tracking-[-.06em] text-[#f3f0e6]">Promoted by process.<br /><em>Not promises.</em></h2><p className="mt-3 text-sm leading-6 text-[#a5afa2]">Explore exact catalog routes, use a visible wallet balance, and contact the support desk with a real order reference when needed.</p><Link href="/support" className="button-outline mt-5">Open support desk <ArrowUpRight size={16} /></Link></div><div className="grid gap-3 sm:grid-cols-3"><article className="border border-white/10 bg-black/10 p-5"><span className="text-[10px] font-semibold uppercase tracking-[.15em] text-[#c7f34a]">Catalog</span><h3 className="mt-3 text-lg text-[#f3f0e6]">Source-priced routes</h3><p className="mt-2 text-sm leading-6 text-[#9ba79a]">Product, category, and availability details stay connected to the catalog source.</p></article><article className="border border-white/10 bg-black/10 p-5"><span className="text-[10px] font-semibold uppercase tracking-[.15em] text-[#c7f34a]">Wallet</span><h3 className="mt-3 text-lg text-[#f3f0e6]">Visible balance trail</h3><p className="mt-2 text-sm leading-6 text-[#9ba79a]">Deposits, credits, and order reservations appear in the account record.</p></article><article className="border border-white/10 bg-black/10 p-5"><span className="text-[10px] font-semibold uppercase tracking-[.15em] text-[#c7f34a]">Support</span><h3 className="mt-3 text-lg text-[#f3f0e6]">Direct Telegram desk</h3><p className="mt-2 text-sm leading-6 text-[#9ba79a]">Use the official support path with your ROTH reference for order-specific help.</p></article></div></div></div></section>
      <section className="closing-section"><div className="closing-mark"><img src={assets.mark} alt="" /></div><div><span className="catalog-kicker">ROTH DIGITAL / 2026</span><h2>Make the next click<br /><em>feel inevitable.</em></h2></div><button className="button-primary" onClick={() => scrollTo("catalog")}>Enter the catalog <ArrowUpRight size={17} /></button></section>
    </main>
    <footer className="site-footer"><div className="footer-brand"><a className="brand-lockup" href="#top"><img src={assets.mark} alt="" className="brand-mark" /><span className="brand-wordmark"><strong>ROTH</strong><span>DIGITAL</span></span></a><p>Private access for the open web.</p></div><div className="footer-links"><div><span>Explore</span><a href="#catalog">Catalog</a><Link href="/category/indian_giftcard">Gift cards</Link><Link href="/category/electronics">Electronics</Link><Link href="/category/cloud_services">Cloud services</Link></div><div><span>Desk</span><Link href="/account">Account</Link><Link href="/wallet">Wallet</Link><Link href="/support">Support</Link></div><div><span>Policies</span><Link href="/trust">Trust desk</Link><Link href="/terms">Terms</Link></div></div><div className="footer-bottom"><span>© 2026 ROTH DIGITAL</span><span>Graphite / Signal Lime</span><span className="footer-live"><i /> Manual review enabled</span></div></footer>
    <MobileBottomNav />
    <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
  </div>;
}
