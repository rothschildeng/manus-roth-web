# Repository Price and Balance Audit

## Source Reviewed

The connected GitHub checkout at `/home/ubuntu/roth-digital` was audited through its shared catalog module (`lib/catalog/src/index.ts`), catalog API route (`artifacts/api-server/src/routes/catalog.ts`), and storefront price helper (`artifacts/roth-digital-store/src/lib/price-utils.ts`). The shared catalog module applies the storewide `SALE_PERCENT = 30` calculation before the API returns catalog entries.

## Confirmed Divergence

A direct diff of the managed storefront catalog against the GitHub catalog identified exactly two additions that do not occur in the repository source:

| Managed-only group | Count | Consequence |
|---|---:|---|
| `🛡️ Source-provided VCC tiers` | 6 | Extra VCC prices and stated limits were visible despite not being in GitHub. |
| `📥 Source-provided device routes` | 6 | Extra device prices were visible despite not being in GitHub. |

These twelve managed-only routes are being removed from the live catalog. All remaining catalog entries must match the repository item-for-item, including sale `pay`, original `origPay`, labels, variants, and category data.

## Balance Boundary

The customer wallet is not repository merchandise data. Its available balance is initialized at `0.00` server-side and changes only through a ledger-backed, manually approved deposit. The audit retains the server account value when present, but removes client fallbacks that could present a guessed `$0.00` while an authenticated wallet record is loading or unavailable. VCC labels containing terms such as `$50 Balance` remain only when they are part of the GitHub catalog source; they are labels, not wallet account balances.

## Homepage Rule

The homepage will no longer keep independent featured-card price literals. Each featured card will resolve its payable value from the public repository-backed catalog query, and the former homepage search input will be replaced with the same query’s live product count.

## Verification Result

After reconciliation, the live catalog query returned **384 products**, and the homepage rendered that exact count in place of the featured search control. The featured Amazon India, Free Fire Diamonds, ChatGPT Plus iCloud, and iPhone 16e cards resolved their prices from the same query rather than an independent literal.

The browser still had JPY selected from the customer display-currency preference. JPY figures were therefore display conversions only; the original GitHub `pay`/`origPay` strings remained present in the catalog and were retained for cart and server checkout validation. No client-side balance default is shown in mobile navigation until an authenticated server wallet record is available.

The mobile guest capture confirmed the Wallet tab remains visible for navigation but has no dollar badge. Deterministic coverage separately verifies that only an authenticated, finite server balance produces the formatted badge.
