# Crypto Deposit Flow Verification

The signed-out `/wallet` route visibly presents **“Flipkart or crypto deposit”** with a sign-in action. Its customer copy clearly states that both funding routes remain manual-review deposits and never credit wallet balance automatically.

After sign-in, the Wallet page provides separate Flipkart and crypto deposit choices. A crypto request calculates an exact chain amount, creates a monitored wallet-deposit payment record, and only reaches the admin wallet-credit queue after required blockchain confirmations. Product checkout remains wallet-funded and does not present a direct product-payment address.
