# ROTH DIGITAL

ROTH DIGITAL is a full-stack digital-goods storefront built with React, TypeScript, tRPC, Express, Drizzle ORM, and MySQL. It uses wallet funding, manual administrator review, source-backed catalog pricing, and metadata-only VCC handoff boundaries.

## Telegram support

Customer support is available through [@the_stevenroths](https://t.me/the_stevenroths). Customers should include their order reference when requesting help and must never send passwords, recovery phrases, private keys, or reusable payment credentials in Telegram.

## Telegram bot configuration

The shop and administrator bots are intentionally **polling-only**. No webhook route or webhook receiver is included in this project. This keeps payment approval and operational events inside the authenticated server workflow and prevents inbound webhook configuration from changing order status.

> Do not configure Telegram `setWebhook` for these bots. If a previous deployment used a webhook, remove it before starting polling so only one update-delivery method is active.

The following server-side environment variables are required in the deployment secret manager. **Never commit their values, paste them into source files, or expose them in the browser.**

| Variable | Purpose |
|---|---|
| `TELEGRAM_SHOP_BOT_TOKEN` | Authentication token for customer bot commands such as `/start`, `/catalog`, `/fund`, and `/order`. |
| `TELEGRAM_ADMIN_BOT_TOKEN` | Authentication token for administrator review notifications and callbacks. |
| `TELEGRAM_ADMIN_CHAT_ID` | Administrator chat destination for safe operational notifications. |
| `TELEGRAM_POLLING_ENABLED` | Explicit activation switch. Set to `1` only after the deployment is running continuously and the configuration has been reviewed. |
| `TELEGRAM_PUBLIC_URL` | Public ROTH DIGITAL website URL used in customer bot responses. |

## Polling activation boundary

1. Deploy the application on an always-on server process; do not rely on a browser session or a process that sleeps after inactivity.
2. Add the required variables in the deployment platform's protected secret manager.
3. Keep `TELEGRAM_POLLING_ENABLED` unset or set to `0` until the deployment, bot identity, and intended administrator chat have been verified.
4. Enable `TELEGRAM_POLLING_ENABLED=1` only once. Operate exactly one polling process per bot token to avoid duplicate update handling.
5. Verify `/start`, `/catalog`, `/fund`, `/order`, and the administrator review controls. Confirm that payment approval remains manual and that no card credentials, recovery phrases, or secret links appear in messages.

The bot source is located under `server/telegram/`. The export includes manual-install documentation for a third-party host, but any deployment must receive fresh secrets only through that host's protected configuration UI.

## Security boundary

This repository is source-only. It excludes environment files, bot tokens, API keys, database credentials, wallet secrets, build output, logs, dependencies, and Git metadata. The application must not store, message, or log card numbers, CVVs, expiry data, provider access tokens, or reusable delivery URLs.
