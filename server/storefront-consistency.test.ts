import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectFile = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("ROTH DIGITAL storefront consistency", () => {
  it("uses the ROTH DIGITAL document title and a wallet-first homepage flow", () => {
    expect(projectFile("client/index.html")).toContain("<title>ROTH DIGITAL — Premium Essentials</title>");
    expect(projectFile("client/index.html")).toContain('name="description"');
    expect(projectFile("client/index.html")).toContain('rel="preload" as="image"');
    const confirmation = projectFile("client/src/pages/ConfirmationPage.tsx");
    expect(confirmation).toContain("Record-backed status path");
    expect(confirmation).toContain("does not estimate times or simulate progress");
    const home = projectFile("client/src/pages/Home.tsx");
    expect(home).toContain("setCartOpen(true)");
    expect(home).not.toContain("createPaymentOrder");
    expect(home).not.toContain("receivingAddress");
    expect(home).not.toContain("Create payment order");
  });

  it("uses clean brand-only image labels and exposes key collections with the approved Telegram support channel", () => {
    const catalog = projectFile("client/src/components/RealCatalog.tsx");
    expect(catalog).toContain('import { brandAlt, cleanBrand } from "@/lib/sanitize";');
    const merchandising = projectFile("client/src/components/ProductMerchandising.tsx");
    expect(merchandising).toContain("alt={brandAlt(product.group)}");
    expect(merchandising).toContain("{cleanBrand(product.group)}");
    expect(catalog).toContain("roth-myntra-brand_8d1c4b36.png");
    expect(catalog).toContain("roth-aws-brand_9ddb5827.png");
    expect(catalog).toContain("roth-ajio-brand_84ac5ad7.png");
    const shell = projectFile("client/src/components/StoreShell.tsx");
    expect(shell).toContain('href="/category/electronics"');
    expect(shell).toContain('href="/category/cloud_services"');
    expect(shell).not.toContain("wa.me/");
    const support = projectFile("client/src/pages/SupportPage.tsx");
    expect(support).toContain("https://t.me/the_stevenroths");
    expect(support).not.toContain("wa.me/");
  });

  it("serves explicit security headers and verifies external asset integrity", () => {
    const server = projectFile("server/securityHeaders.ts");
    expect(server).toContain('res.setHeader("X-Frame-Options", "DENY")');
    expect(server).toContain('res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin")');
    expect(server).toContain('res.setHeader("Cross-Origin-Resource-Policy", req.path.startsWith("/manus-storage/") ? "cross-origin" : "same-origin")');
    expect(server).toContain('"default-src": ["\'self\'"]');
    expect(server).toContain('"frame-ancestors": ["\'none\'"]');
    expect(server).toContain("https://d36hbw14aib5lz.cloudfront.net");
    expect(server).toContain('req.path.startsWith("/manus-storage/") ? "cross-origin" : "same-origin"');
    const html = projectFile("client/index.html");
    expect(html).toContain('integrity="sha384-Xhl9F47IcHZsCz+/kxmSZ/G8jWI6gnm0UMi11S+FlYjovQ4ZCN3LebJ04EeJqN8L"');
    expect(html).toContain('crossorigin="anonymous"');
    expect(projectFile("client/src/index.css")).not.toContain("fonts.googleapis.com");
  });

  it("keeps phone storefront cards intentionally single-column and touch-first", () => {
    const mobile = projectFile("client/src/mobile-repair.css");
    expect(mobile).toContain("Mobile-first repair");
    expect(mobile).toContain(".category-rail { grid-template-columns: 1fr");
    expect(mobile).toContain(".product-grid { grid-template-columns: 1fr");
    expect(mobile).toContain(".commerce-product-grid { grid-template-columns: 1fr");
    expect(mobile).toContain(".real-products-grid { grid-template-columns: 1fr");
    expect(projectFile("client/src/main.tsx")).toContain('import "./mobile-repair.css";');
  });

  it("uses a managed-source brand grid without external logo hotlinks or unsupported reference labels", () => {
    const home = projectFile("client/src/pages/Home.tsx");
    const css = projectFile("client/src/index.css");
    expect(home).toContain("MANAGED BRAND NETWORK");
    expect(home).toContain("Mapped only to source-backed catalog routes using managed brand assets.");
    expect(home).toContain('"/manus-storage/amazon_3eae347f.jpg"');
    expect(home).toContain('"/manus-storage/spotify_2a239ba7.jpg"');
    expect(home).not.toContain("logos.hunter.io");
    expect(home).not.toContain("Cartbyt");
    expect(home).not.toContain("Curdos");
    expect(css).toContain(".brand-network-grid { display: grid; grid-template-columns: repeat(4, minmax(0,1fr));");
  });

  it("uses managed real-image merchandising, source-only price anchors, quick view, curated shelves, and loading skeletons", () => {
    const catalog = projectFile("client/src/components/RealCatalog.tsx");
    const category = projectFile("client/src/pages/CategoryPage.tsx");
    const merchandising = projectFile("client/src/components/ProductMerchandising.tsx");
    expect(catalog).toContain("ProductCardSkeleton");
    expect(catalog).toContain("catalog-shelves");
    expect(catalog).toContain("ProductQuickView");
    expect(category).toContain("ProductMerchandisingCard");
    expect(merchandising).toContain("src={image}");
    expect(merchandising).toContain("product.origPay ?");
    expect(merchandising).toContain("Manual review");
    expect(merchandising).toContain("ProductCardSkeleton");
    expect(merchandising).toContain("<Dialog");
    expect(merchandising).not.toContain("logos.hunter.io");
  });

  it("uses consumer-facing shop controls without inventing reviews, delivery promises, prices, or unsupported checkout claims", () => {
    const home = projectFile("client/src/pages/Home.tsx");
    const shell = projectFile("client/src/components/StoreShell.tsx");
    const catalog = projectFile("client/src/components/RealCatalog.tsx");
    const category = projectFile("client/src/pages/CategoryPage.tsx");
    const detail = projectFile("client/src/pages/ProductPage.tsx");
    const merchandising = projectFile("client/src/components/ProductMerchandising.tsx");
    expect(home).toContain("SHOP CATALOG");
    expect(home).not.toContain("GITHUB CATALOG");
    expect(shell).toContain("Search products and brands");
    expect(home).toContain("Search products and brands");
    expect(home).toContain("CartSidebar");
    expect(home).toContain("setCartOpen(true)");
    expect(home).toContain("tile-icon");
    expect(home).toContain("Add to cart");
    expect(home).toContain("START WITH A CATEGORY");
    expect(home).toContain("sourceCategoryCounts");
    expect(home).toContain("Live counts come from the current source-backed catalog.");
    expect(home).toContain("All routes");
    expect(shell).toContain("Gift Cards");
    expect(catalog).toContain('setLocation("/checkout")');
    expect(merchandising).toContain("Buy now");
    expect(merchandising).toContain("Original price");
    expect(merchandising).toContain("Reviews are not yet available.");
    expect(category).toContain("Price: low to high");
    expect(category).toContain("Reviews unavailable");
    expect(category).toContain("source-backed.");
    expect(category).toContain("collection-room-status");
    expect(detail).toContain("YOU MAY ALSO LIKE");
    expect(detail).toContain("QUANTITY");
    expect(home).not.toContain("Instant delivery");
    expect(merchandising).not.toContain("★★★★★");
  });

  it("uses differentiated managed electronics visuals and record-backed receipt states without manufacturing payment outcomes", () => {
    const catalog = projectFile("client/src/components/RealCatalog.tsx");
    const checkout = projectFile("client/src/pages/CheckoutPage.tsx");
    const confirmation = projectFile("client/src/pages/ConfirmationPage.tsx");
    const receipt = projectFile("client/src/components/PaymentReceipt.tsx");
    expect(catalog).toContain("roth-ipad-pro-official_8f952816.jpg");
    expect(catalog).toContain("roth-macbook-pro-official_a7542958.jpg");
    expect(catalog).toContain("roth-dell-xps-official_e81d1f2f.jpg");
    expect(checkout).toContain("PaymentReceipt");
    expect(confirmation).toContain("PaymentReceipt");
    expect(receipt).toContain("Shown from the current website record");
    expect(receipt).toContain("does not imply automatic approval, delivery, or payment settlement");
    expect(receipt).not.toContain("Payment successful");
  });

  it("uses image-led product merchandising without changing source-backed listing data", () => {
    const css = projectFile("client/src/index.css");
    expect(css).toContain(".real-product-card { min-height: 380px");
    expect(css).toContain(".real-product-image { display: block; width: 100%; height: 164px");
    expect(css).toContain(".product-detail-image { width: min(100%, 390px)");
    const detail = projectFile("client/src/pages/ProductPage.tsx");
    expect(detail).toContain('className="product-detail-image"');
    expect(detail).toContain("Selling price");
  });

  it("uses real product data for product-level canonical and social sharing metadata", () => {
    const detail = projectFile("client/src/pages/ProductPage.tsx");
    expect(detail).toContain("shareTitle");
    expect(detail).toContain("shareDescription");
    expect(detail).toContain("shareImage");
    expect(detail).toContain("/product/${encodeURIComponent(itemId)}");
    expect(detail).toContain('"og:title"');
    expect(detail).toContain('"og:description"');
    expect(detail).toContain('"og:image"');
    expect(detail).toContain('"twitter:card"');
    expect(detail).toContain('canonical.href = shareUrl');
    expect(detail).toContain("roth-hero-obsidian_e1aea3ed.jpg");
    expect(detail).not.toContain("Elegant Silk Saree");
  });

  it("provides customer-controlled product share actions without a WhatsApp support number", () => {
    const detail = projectFile("client/src/pages/ProductPage.tsx");
    const styles = projectFile("client/src/index.css");
    expect(detail).toContain("whatsappShare");
    expect(detail).toContain("nativeShare");
    expect(detail).toContain("copyLink");
    expect(detail).toContain("navigator.share");
    expect(detail).toContain("navigator.clipboard.writeText");
    expect(detail).toContain("https://wa.me/?text=");
    expect(detail).toContain("WhatsApp");
    expect(detail).toContain("Copy link");
    expect(detail).not.toContain("wa.me/+");
    expect(styles).toContain(".share-buttons");
    expect(styles).toContain(".detail-share");
  });

  it("provides a branded cart drawer backed by real cart items and supported checkout routing", () => {
    const shell = projectFile("client/src/components/StoreShell.tsx");
    const drawer = projectFile("client/src/components/CartSidebar.tsx");
    const css = projectFile("client/src/index.css");
    expect(shell).toContain("CartSidebar");
    expect(shell).toContain("setCartOpen(true)");
    expect(drawer).toContain("useCart()");
    expect(drawer).toContain("updateQuantity");
    expect(drawer).toContain("removeItem");
    expect(drawer).toContain('href="/checkout"');
    expect(drawer).toContain('href="/cart"');
    expect(drawer).toContain("Mixed source currencies are validated at checkout");
    expect(css).toContain(".cart-drawer { position:fixed");
    expect(css).toContain(".cart-drawer-toast");
  });
});
