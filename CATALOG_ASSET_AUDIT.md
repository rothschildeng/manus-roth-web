# Catalog Price and Asset Audit

## Price Source

The connected repository file `roth-digital/lib/catalog/src/index.ts` is the price source for every repository item. The storefront adapter preserves that repository catalog and its configured `SALE_PERCENT = 30` behavior. A catalog regression test already compares every non-`Source-provided` route in the managed catalog against the repository output.

User-supplied VCC and device routes remain visibly labeled **Source-provided** and are isolated from repository-parity assertions. They are not substitutes for repository items.

## Selected Catalog Assets

The following product visuals were selected to match named model routes, staged outside the project, and uploaded to managed web storage. They are presentation-only assets; they do not alter product labels, price, availability, or fulfilment status.

| Product route | Managed storage path | Selection reference |
|---|---|---|
| iPhone 15 Pro · 256GB · Titanium | `/manus-storage/roth-iphone-15-pro_8c149dff.jpg` | Search result: “Buy Used iPhone 15 Pro 256GB.” |
| MacBook Air M3 · 8GB / 256GB · 13.6-inch Retina | `/manus-storage/roth-macbook-air-m3_ef524aae.jpg` | Search result: “Apple MacBook Air 13-Inch (2024, M3).” |
| Galaxy S24 Ultra · 256GB · S Pen | `/manus-storage/roth-galaxy-s24-ultra_f4c01638.jpg` | Search result: “Galaxy S24 Ultra 256GB.” |
| iPhone 16e · 128GB | `/manus-storage/roth-iphone-16e_9b5309b8.jpg` | Search result: “Apple iPhone 16e – 128 GB.” |
| iPhone 16 Pro Max | `/manus-storage/roth-iphone-16-pro-max_bcb7e202.jpg` | Search result: “iPhone 16 Pro Max 512GB.” |
| Gemini brand mark | `/manus-storage/roth-gemini-logo_2b4b8b78.png` | Search result: “Google Gemini.” |
| Cursor brand mark | `/manus-storage/roth-cursor-logo_a04747bd.png` | Search result: “Cursor AI Logo Icon.” |
| Canva brand mark | `/manus-storage/roth-canva-logo_2dcfe4fd.png` | Search result: “Canva Logo and symbol.” |

The storefront uses only these managed storage paths. Local image files remain in `/home/ubuntu/webdev-static-assets/`, not the project source tree.
