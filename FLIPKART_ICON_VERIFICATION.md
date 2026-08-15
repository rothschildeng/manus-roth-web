# Flipkart Deposit and Managed Icon Verification

The customer wallet now visibly presents the managed Flipkart mark, labels the supported source as **Flipkart gift card**, routes the customer to the existing manual-review deposit request, and keeps the minimum request at $25. The customer field is explicitly labeled for a Flipkart gift-card code/reference, while the existing server path continues to persist only a masked reference and leaves crediting to the administrator.

The admin wallet-review queue now labels `gift_card_review` requests as **Flipkart gift card** while retaining the masked-reference-only verification rule and manual Approve/Reject actions.

The public homepage now shows a wallet-source chip linking to `/wallet#deposit` and includes managed Gemini, Cursor, and Canva marks alongside the existing repository brand network. Existing category and product-detail routes continue to use the shared managed image mapper for product-appropriate imagery.

Visual verification completed at desktop (1280×720 full-page captures) and mobile (375×812 full-page captures) for `/`, `/wallet`, and `/category/premium_sub`. The wallet capture visibly showed the Flipkart card, field label, and review button on both sizes. The premium-subscription capture showed the managed brand-image treatment in the catalog grid. No real deposit was submitted during verification, so no test balance or customer transaction was created.

Validation completed: `pnpm check`, `pnpm test` with 47 passing and 2 skipped tests, and `pnpm build` passed. The build emitted only the existing chunk-size advisory.
