# Telegram Bot Readiness Audit

## Current Status

The Telegram integration is implemented as a **polling-only** shop and administrator bot. Polling is currently **disabled** because `TELEGRAM_POLLING_ENABLED` is not set to `1`. No bot was started, no Telegram API request was made, and no message or approval action was sent during this audit.

| Area | Verified state |
|---|---|
| Startup gate | The production server calls the polling start function, but it returns immediately unless the explicit enable flag is `1`. |
| Webhook posture | No webhook registration or webhook handler reference was found in the bot startup code. |
| Token handling | Shop/admin tokens are read only from server environment variables and are not exposed to the browser. |
| Public destination | The shop bot requires a configured public store URL before it starts. |
| Admin scope | Administrator callbacks are accepted only from the configured administrator chat identifier. |
| Test result | The non-network configuration regression suite passed: 2 tests, 0 failures. |

## Shop Bot Commands

| Command or action | Behaviour |
|---|---|
| `/start` or `/catalog` | Opens the storefront and category route buttons. |
| `/order ORDER_ID` | Displays existing order status and confirmations, then links to the website confirmation page. |
| `/support` | Links to the website support desk. |

The shop bot does not create payment approvals, wallet credits, fulfilment events, or credential deliveries.

## Admin Bot Commands and Safeguards

| Command or action | Safeguard |
|---|---|
| `/orders` | Lists only orders already confirmed and awaiting manual review, with Approve/Reject buttons. |
| `/deposits` | Lists wallet deposits with masked references only. |
| Order approval/rejection | Re-checks the order is still `pending_admin`, writes the manual status, and explicitly does not trigger automatic delivery. |
| Deposit approval/rejection | Requires the project owner to exist as an administrator in the database; approval/rejection remains a manual action. |
| Callback access | Rejects callback interactions from chats other than the configured admin chat. |

## Activation Prerequisites

The bot must remain disabled until all of the following are intentionally completed: fresh server-side Telegram credentials and admin chat configuration are present; `TELEGRAM_PUBLIC_URL` points to the published store; the owner has signed in and has the `admin` role; and a persistent hosting mode is chosen for continuous polling. A normal request-based deployment can pause between requests, so it is not appropriate for a continuously running polling loop.

> The five-minute payment-monitoring schedule is already suitable for periodic payment checks. The Telegram polling bot is different: it needs an intentionally enabled continuously running process and must not be treated as a scheduled task.
