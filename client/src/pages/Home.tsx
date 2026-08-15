import { trpc } from "@/lib/trpc";
import RealCatalog, { type CheckoutCatalogItem } from "@/components/RealCatalog";
import MobileBottomNav from "@/components/MobileBottomNav";
import { useCart } from "@/contexts/CartContext";
import { useStorePreferences } from "@/contexts/StorePreferencesContext";
import StorePreferenceControls from "@/components/StorePreferenceControls";
import "@/styles/catalog-source-count.css";
import { useMemo, useState } from "react";
import { ArrowUpRight, ChevronRight, Menu, Search, ShoppingBag, Sparkles, WalletCards, X, Zap } from "lucide-react";
import { Link, useLocation } from "wouter";

const assets = {
  hero: "/manus-storage/roth-hero-obsidian_e1aea3ed.jpg",
  plates: "/manus-storage/roth-plate-catalog_a51de463.jpg",
  wallet: "/manus-storage/roth-wallet-orbit_a44824e8.jpg",
  room: "/manus-storage/roth-access-room_6f0a17a4.jpg",
  mark: "/manus-storage/roth-split-r-mark_124d79d5.png",
};

const collectionCards = [
  { name: "Gift cards", note: "The everyday unlock", path: "/category/indian_giftcard", tone: "lime" },
  { name: "Game top-ups", note: "Load in one move", path: "/category/game_topup", tone: "steel" },
  { name: "Subscriptions", note: "Keep your access", path: "/category/premium_sub", tone: "bone" },
  { name: "Electronics", note: "Device routes, clearly shown", path: "/category/electronics", tone: "blue" },
];

const featuredSlots = [
  { name: "Amazon India", type: "Gift cards", detail: "Repository-backed gift-card route", itemId: "🛒 Amazon India — Pay ₹1,549 → Get ₹5,000" },
  { name: "Free Fire Diamonds", type: "Game top-ups", detail: "Verified catalog route", itemId: "🔥 Free Fire Diamonds — 100 💎" },
  { name: "ChatGPT Plus iCloud", type: "Subscriptions", detail: "Repository-backed package", itemId: "🤖 ChatGPT / OpenAI — ChatGPT Plus iCloud — No warranty" },
  { name: "iPhone 16e", type: "Electronics", detail: "Product-specific image and price", itemId: "📱 iPhone — iPhone 16e · 128GB" },
];

const brandNetwork = [
  { name: "Amazon", src: "/manus-storage/amazon_3eae347f.jpg" }, { name: "Flipkart", src: "/manus-storage/flipkart_a0519cde.jpg" }, { name: "Apple", src: "/manus-storage/apple_9171b857.jpg" }, { name: "ChatGPT", src: "/manus-storage/chatgpt_50484410.jpg" }, { name: "Gemini", src: "/manus-storage/roth-gemini-logo_2b4b8b78.png" }, { name: "Cursor", src: "/manus-storage/roth-cursor-logo_a04747bd.png" }, { name: "Canva", src: "/manus-storage/roth-canva-logo_2dcfe4fd.png" }, { name: "Netflix", src: "/manus-storage/netflix_290db0bc.jpg" }, { name: "Free Fire", src: "/manus-storage/freefire_f9b5fd3f.jpg" }, { name: "Steam", src: "/manus-storage/steam_4cc9daa0.jpg" }, { name: "Spotify", src: "/manus-storage/spotify_2a239ba7.jpg" },
];

export default function Home() {
  const { count, addItem } = useCart();
  const { formatPrice } = useStorePreferences();
  const [, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const sourceCatalog = trpc.catalog.list.useQuery();
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
    setLocation("/cart");
  };

  return <div className="site-shell">
    <div className="top-signal"><span className="signal-dot" /> ROTH DIGITAL / PRIVATE ACCESS DESK <span className="top-signal-muted">·</span> Manual review after confirmation</div>
    <header className="site-nav">
      <a className="brand-lockup" href="#top" aria-label="ROTH DIGITAL home"><img src={assets.mark} alt="" className="brand-mark" /><span className="brand-wordmark"><strong>ROTH</strong><span>DIGITAL</span></span></a>
      <nav className={`nav-links ${menuOpen ? "is-open" : ""}`} aria-label="Primary navigation"><button onClick={() => scrollTo("catalog")}>Catalog</button><Link href="/category/electronics">Electronics</Link><Link href="/category/cloud_services">Cloud services</Link><Link href="/wallet">Wallet</Link><Link href="/account">Account <ArrowUpRight size={13} /></Link></nav>
      <div className="nav-actions"><StorePreferenceControls compact /><button className="nav-icon-button" onClick={() => scrollTo("catalog")} aria-label="Search catalog"><Search size={17} /></button><button className="cart-button" onClick={() => setLocation("/cart")}><ShoppingBag size={16} /><span>Cart</span>{count > 0 && <b>{count}</b>}</button><button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Close menu" : "Open menu"}>{menuOpen ? <X size={19} /> : <Menu size={19} />}</button></div>
    </header>
    <main id="top">
      <section className="hero-section"><div className="hero-copy"><div className="eyebrow"><span className="eyebrow-line" /> The private access desk <span className="eyebrow-status">Manual review</span></div><h1>Access,<br /><em>without</em> the wait.</h1><p className="hero-lede">A curated ROTH DIGITAL marketplace for gift cards, game top-ups, subscriptions, cloud services, and electronics. Fund your wallet, choose a route, and track each clear review state.</p><div className="hero-actions"><button className="button-primary" onClick={() => scrollTo("catalog")}>Enter the catalog <ChevronRight size={17} /></button><Link href="/wallet#deposit" className="button-text">Fund wallet <ArrowUpRight size={16} /></Link></div><div className="hero-footnote"><span className="mini-check">✓</span> Wallet-first checkout <span className="foot-divider" /> <span className="mini-check">✓</span> Manual fulfilment review</div></div><div className="hero-visual"><div className="hero-orbit orbit-one">REVIEW <span>01</span></div><div className="hero-orbit orbit-two">WALLET <span>02</span></div><div className="hero-orbit orbit-three">ROTH <span>03</span></div><div className="hero-image-frame"><img src={assets.hero} alt="ROTH DIGITAL black glass private-access sculpture" /><div className="hero-image-shine" /></div><div className="hero-coordinate">28.6139° N<br />77.2090° E</div><div className="hero-plate-caption"><span>ROTH / 001</span><strong>Private access<br />for the open web.</strong></div></div></section>
      <section className="proof-strip"><div><span className="proof-number">01</span><span className="proof-label">wallet funding</span></div><div><span className="proof-number">02</span><span className="proof-label">deposit confirmation</span></div><div><span className="proof-number">03</span><span className="proof-label">manual approval</span></div><div className="proof-manifesto"><Sparkles size={17} /> <span>Low noise.<br /><b>Clear state.</b></span></div></section>
      <section className="brand-network" aria-label="Available catalog brands"><div className="brand-network-copy"><span className="catalog-kicker">REPOSITORY BRAND NETWORK</span><strong>Recognize the route.</strong></div><div className="brand-network-grid">{brandNetwork.map((brand, index) => <div className="brand-network-card" key={brand.name}><span>0{index + 1}</span><img src={brand.src} alt={`${brand.name} brand mark`} /><b>{brand.name}</b></div>)}</div></section>
      <section className="catalog-section" id="catalog"><div className="section-heading"><div><div className="eyebrow"><span className="eyebrow-line" /> The collection</div><h2>Choose your<br /><em>next move.</em></h2></div><p>Every route is shown with a clear price and availability state. Wallet-funded orders enter manual review before fulfilment.</p></div><div className="category-rail">{collectionCards.map((item, index) => <Link key={item.name} href={item.path} className={`category-tile tile-${item.tone}`}><span className="tile-index">0{index + 1}</span><span className="tile-name">{item.name}</span><span className="tile-note">{item.note}</span><span className="tile-meta">Open route <ArrowUpRight size={13} /></span></Link>)}</div><div className="featured-heading"><div className="featured-title"><img src={assets.mark} alt="" /><div><span className="catalog-kicker">CURATED DROP / SOURCE-PRICED</span><h3>Ready when you are.</h3></div></div><div className="catalog-source-count" aria-live="polite"><span>GITHUB CATALOG</span>{sourceCatalog.isLoading ? <div className="catalog-count-loading" role="status" aria-label="Loading product count"><i /><i /><i /><em>Syncing source</em></div> : <b>{`${sourceCatalog.data?.products.length ?? 0} products`}</b>}</div></div><div className="product-grid">{featured.map((item, index) => <article className="product-card" key={item.itemId}><div className={`product-art art-${index + 1}`} style={index === 0 ? { backgroundImage: `linear-gradient(135deg, rgba(8,10,8,.28), rgba(8,10,8,.7)), url(${assets.plates})` } : undefined}><span className="product-tag">Source sale</span><span className="product-art-symbol">{index === 0 ? "◌" : index === 1 ? "✦" : index === 2 ? "↗" : "◈"}</span><span className="product-art-index">ROTH / 0{index + 1}</span></div><div className="product-info"><span className="product-type">{item.type}</span><h4>{item.name}</h4><p className="product-detail"><Zap size={12} /> {item.detail}</p><div className="product-bottom"><strong>{formatPrice(item.price)}</strong><button onClick={() => addToCart({ itemId: item.itemId, name: item.name, type: item.type, detail: item.detail, price: item.price })} aria-label={`Add ${item.name} to cart`}><ShoppingBag size={16} /></button></div></div></article>)}{featured.length === 0 && <div className="empty-state">Featured routes are loading from the repository catalog.</div>}</div><RealCatalog onCheckout={addToCart} /></section>
      <section className="story-section"><div className="story-visual"><img src={assets.room} alt="Dark ROTH DIGITAL gallery room with illuminated access stations" /><div className="story-stamp">CURATED<br /><span>FOR MOTION</span></div></div><div className="story-copy"><div className="eyebrow"><span className="eyebrow-line" /> The Roth method</div><h2>Three moves.<br /><em>One clear handoff.</em></h2><p>ROTH DIGITAL keeps the order status visible. Fund your wallet, choose a catalog route, and follow the manual-review and fulfilment stages.</p><div className="method-list"><div><span>01</span><div><strong>Fund your wallet</strong><p>Use the Flipkart or crypto deposit path and wait for manual review.</p></div></div><div><span>02</span><div><strong>Choose your route</strong><p>Add every selected catalog item and quantity to one wallet request.</p></div></div><div><span>03</span><div><strong>Track the review</strong><p>Approved orders move through a visible fulfilment decision.</p></div></div></div><button className="button-primary" onClick={() => scrollTo("catalog")}>Browse the collection <ArrowUpRight size={16} /></button></div></section>
      <section className="wallet-section"><div className="wallet-copy"><span className="catalog-kicker">THE WALLET LAYER</span><h2>Your balance,<br /><em>in motion.</em></h2><p>Keep a balance ready for the next move. Flipkart and crypto deposits remain tied to a visible manual-review trail.</p><Link href="/wallet#deposit" className="wallet-source-chip"><img src="/manus-storage/flipkart_a0519cde.jpg" alt="Flipkart brand mark" /><span><b>Fund with Flipkart or crypto</b><small>Manual review · minimum $25</small></span><ArrowUpRight size={16} /></Link><Link href="/wallet" className="button-outline"><WalletCards size={17} /> Open wallet</Link></div><div className="wallet-visual"><img src={assets.wallet} alt="Black glass wallet sphere with metallic orbit" /><div className="wallet-readout"><span>LEDGER CONTROL</span><strong>•</strong><small>MANUAL / VERIFIED</small></div></div></section>
      <section className="closing-section"><div className="closing-mark"><img src={assets.mark} alt="" /></div><div><span className="catalog-kicker">ROTH DIGITAL / 2026</span><h2>Make the next click<br /><em>feel inevitable.</em></h2></div><button className="button-primary" onClick={() => scrollTo("catalog")}>Enter the catalog <ArrowUpRight size={17} /></button></section>
    </main>
    <footer className="site-footer"><div className="footer-brand"><a className="brand-lockup" href="#top"><img src={assets.mark} alt="" className="brand-mark" /><span className="brand-wordmark"><strong>ROTH</strong><span>DIGITAL</span></span></a><p>Private access for the open web.</p></div><div className="footer-links"><div><span>Explore</span><a href="#catalog">Catalog</a><Link href="/category/indian_giftcard">Gift cards</Link><Link href="/category/electronics">Electronics</Link><Link href="/category/cloud_services">Cloud services</Link></div><div><span>Desk</span><Link href="/account">Account</Link><Link href="/wallet">Wallet</Link><Link href="/support">Support</Link></div><div><span>Policies</span><Link href="/trust">Trust desk</Link><Link href="/terms">Terms</Link></div></div><div className="footer-bottom"><span>© 2026 ROTH DIGITAL</span><span>Graphite / Signal Lime</span><span className="footer-live"><i /> Manual review enabled</span></div></footer>
    <MobileBottomNav />
  </div>;
}
