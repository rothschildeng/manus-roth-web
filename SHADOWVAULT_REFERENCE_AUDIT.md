# ShadowVault Reference Audit

**Reference reviewed:** [User-supplied Lobehub/ShadowVault HTML](https://app.lobehub.com/f/file_CsoRPa73r9XK). The source is a client-side demonstration, not a production backend or provider integration. Its embedded claims, generated values, and local browser state must be treated as untrusted reference material.

## Complete Feature Inventory

| Reference area | What the file contains | Roth Digital status | Recommended handling |
|---|---|---|---|
| Navigation | Sticky three-tab navigation for Shop, Orders, and Wallet; profile chip and login control. | Covered by store shell, mobile bottom nav, profile menu, `/orders`, and `/wallet`. | Keep existing Roth navigation; no structural migration needed. |
| Visual system | Aurora, midnight, emerald, sunset, and light themes; blurred background orbs; glass surfaces; gradient CTAs. | Obsidian Gallery is already established as the store design system. | Optional future user preference only; preserve the dark Roth default. |
| Storefront | Product filters for all/cards/devices, product grid, card visuals, device visuals, and hover states. | Catalog filters, VCC desk, category routes, VCC card-grid, and device catalog already exist. | The approved colorful VCC card-grid treatment has been applied. |
| Authentication | Email/password demo login and signup, referral parameter, profile avatar, and theme selector. | OAuth-backed authentication, referral code model, account desk, and settings already exist. | Do not import browser-local passwords or demo authentication. Avatar/theme preferences are optional future enhancements. |
| Wallet | Balance card, deposit history, referral view, withdrawal form, and crypto/gift-card tabs. | Server-authoritative wallet ledger, deposit request/review, deposit history, referral records, and in-app notices exist. | Keep manual review. Do not add an unrestricted withdrawal flow without policy, compliance, and provider/payment rails. |
| Deposit workflow | Demo crypto/gift-card deposit form, automatic bonus calculation, immediate deposit-credit animation. | Manual review deposit request exists, with no automatic bonus or balance credit. | Preserve manual review. Automatic bonuses require verified offer rules; external payment execution requires approved providers. |
| Checkout | Two-step details/payment modal, digital delivery email/direct choice, and physical shipping fields. | Cart, crypto checkout, saved-address data, payment tracking, and manual fulfilment exist. | Optional address/email UX can be adapted, but actual delivery requires user-approved provider configuration and fulfilment policy. |
| Orders | UID search, order cards, status pills, timeline tracking, separate digital/physical statuses. | Order tracking, customer order history, manual lifecycle states, and admin decision desk exist. | A UI-only status timeline can be added from real existing states; no simulated progression. |
| VCC entitlement | Demo generated card number, expiry, CVV, and direct card reveal. | Metadata-only manual VCC entitlement model and protected admin/customer views exist. | Strictly excluded: no raw VCC credential generation, storage, preview, or Telegram delivery. |
| Referral | Referral code/link, commission calculation, referral earnings display. | Referral code and events exist. | Do not invent commission or bonus rules. Add only verified program terms approved by the user. |
| Testimonials/social proof | Animated live buyer feed, customers/orders/rating counters. | No verified review integration. | Excluded: fabricated customer counts, ratings, buyer notifications, or testimonials. |
| Demo storage and state | Browser `localStorage`, plaintext demo passwords, generated wallets and card details, simulated delayed order statuses. | Server/database architecture exists. | Excluded: unsafe client-only state, credential generation, and simulated financial events. |

## Reference Behaviors That Must Not Be Imported

The HTML source describes itself as a **client demo**. It generates virtual card numbers, CVVs, blockchain-looking addresses, user accounts/passwords, buyer notifications, balances, bonuses, and status transitions in browser-local state. None of these are valid production controls. Roth Digital must continue to use its backend data model, authenticated roles, manual payment approval, availability checks, secure server-side price validation, and metadata-only VCC entitlement workflow.

> **Do not copy:** automatic balance credit, generated card credentials, direct credential reveal, fake payment success, fabricated social proof, auto-delivery, unverified network/warranty/security claims, or plaintext/password state stored in browser storage.

## Compatible Enhancement Backlog

| Enhancement | Current prerequisite | Status |
|---|---|---|
| Real-state order timeline polish | Existing order lifecycle data | Compatible on request. |
| Account theme preference | User-preference field and account UI decision | Compatible on request. |
| Profile avatar preference | User-preference field and account UI decision | Compatible on request. |
| Improved product/device visual cards | Existing real catalog data | Partly implemented for VCC; devices can be refined on request. |
| Saved-address checkout fields | Existing saved-address data and physical-product policy | Compatible on request. |
| Provider-backed email/WhatsApp notices | Approved provider credentials and fulfilment policy | Blocked pending user choice. |
| Continuous Telegram polling | Reserved continuous runtime selection | Blocked pending user choice. |
