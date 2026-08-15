# Checkout Flow Verification

## Verified customer-facing states

The signed-out `/wallet` route now visibly presents the **Flipkart gift-card deposit** card with a sign-in action and states the $25 minimum plus manual-review boundary. The signed-out `/checkout` route, even with an item already in the cart, presents a **wallet-required** gate. It contains no network selector, receiving address, transaction amount, or direct-payment instruction.

## Confirmed flow

After authentication, a customer submits a Flipkart gift-card deposit request for manual review. An approved server-authoritative wallet balance can then create a wallet-funded order request that enters `pending_admin`. The payment-review desk retains the only approval and fulfilment controls. Direct customer payment-order creation is blocked.
