# Provider-Backed VCC Delivery Boundary

## Purpose

This design supports the intended future workflow: a customer completes a VCC order, an administrator manually approves it, and an approved external provider delivers the actual VCC through a provider-controlled secure experience. It is a **design boundary only**. The current storefront continues to use manual review and metadata-only handoff records; it does not collect, store, display, transmit, or automatically deliver usable VCC credentials.

> **Non-negotiable boundary:** The ROTH DIGITAL application, its database, its logs, its error reports, its analytics events, its Telegram bots, and its administrator forms must never receive a full card number, CVV, expiry date, reusable delivery URL, provider session token, or any credential that can be used to spend funds.

## Current State

The existing `vccEntitlements` record is intentionally metadata-only. It stores a customer, order identifier, product title, masked reference, lifecycle status, and a fixed handoff note. The server allows an administrator to prepare an entitlement only after an approved VCC payment, then mark that metadata record as handed off. Customer views are restricted to their own entitlement metadata, and the existing admin procedure does not accept a free-form handoff note.

| Current control | Existing behavior | Preserve in provider integration |
|---|---|---|
| Payment decision | Manual administrator approval | Yes; no provider request before approved payment |
| VCC eligibility | Catalog category must be `vcc` | Yes; reject every other category |
| Admin access | Server-side `adminProcedure` | Yes; no client-side-only authorization |
| Customer scope | Customer sees only own entitlement | Yes; provider session must bind to the same authenticated customer |
| Credential data | No PAN, CVV, expiry, or raw link persisted | Yes; never relax this boundary |
| Telegram | Operational status only | Yes; never send card material, links, or tokens |

## Target Flow

| Step | Actor | Application action | Provider action | Data retained by the application |
|---|---|---|---|---|
| 1 | Customer | Places VCC order and completes the existing payment flow | None | Payment/order metadata only |
| 2 | Administrator | Manually approves payment in the existing restricted workspace | None | Existing order transition audit |
| 3 | Administrator | Selects a provider product/SKU and chooses **Issue secure delivery** | Creates a one-time, customer-bound secure-delivery session | Provider name, opaque provider delivery reference, expiry, status, audit timestamps |
| 4 | Provider | Hosts card presentation after its own access checks | Displays or delivers the usable credential inside provider-controlled surface | No credential material returns to ROTH DIGITAL |
| 5 | Customer | Opens only an authenticated ROTH DIGITAL delivery-status page | Redirects to, or launches, the provider-controlled secure surface | Status such as `ready`, `accessed`, `expired`, `revoked` |
| 6 | Administrator | May revoke/expire a pending delivery session | Invalidates provider session when supported | Revocation event and provider status only |

The application must not email, WhatsApp, Telegram, or expose a raw provider URL. If a provider requires the customer to receive a link, the provider should send that link through its own approved secure channel. ROTH DIGITAL may show only a generic authenticated action such as **Open secure delivery** after the provider session has been verified as active.

## Proposed Metadata-Only Model

When an approved provider is selected, add a separate `vccDeliverySessions` table rather than adding sensitive fields to `vccEntitlements`. The table must contain only non-sensitive operational metadata.

| Field | Example | Storage rule |
|---|---|---|
| `id` | Internal numeric identifier | Normal database key |
| `entitlementId` | Existing entitlement ID | Foreign-key relationship |
| `providerCode` | Approved provider identifier | Allowlisted string, not user supplied |
| `providerDeliveryRef` | Opaque provider reference | Store only a provider-issued non-secret reference; hash if the provider reference itself could grant access |
| `providerProductRef` | Provider SKU | Non-sensitive product routing metadata |
| `status` | `created`, `ready`, `accessed`, `expired`, `revoked`, `failed` | Lifecycle state only |
| `expiresAt` | UTC timestamp | No time zone strings |
| `createdByUserId` | Administrator ID | Audit metadata |
| `createdAt`, `updatedAt` | UTC timestamps | Audit metadata |

The table must **not** contain a card number, CVV, expiry, PIN, magnetic-stripe data, provider access token, plaintext delivery URL, or unbounded administrator note. If the provider returns a redirect URL or bearer link, keep it only in the server process long enough to issue a browser redirect after rechecking the customer session; do not write it to the database, logs, telemetry, cache, or notification record.

## Server Contract After Provider Selection

The provider API must not be integrated until the user identifies the approved provider and supplies documented authorization, product mapping, and credential setup through the project’s secret configuration. The eventual server contract should consist of narrow, server-only operations:

| Procedure | Authorization | Responsibility |
|---|---|---|
| `vcc.createProviderDelivery` | Administrator only | Re-check approved order and entitlement state; submit allowed product mapping; persist metadata-only delivery session |
| `vcc.deliveryStatus` | Entitlement owner or administrator | Return only status, expiry, provider display name, and safe lifecycle timestamps |
| `vcc.openSecureDelivery` | Entitlement owner only | Re-check ownership and active state; obtain a short-lived provider redirect server-side; immediately redirect without persistence |
| `vcc.revokeProviderDelivery` | Administrator only | Revoke an unused or compromised provider session and record safe metadata |
| `vcc.providerWebhook` | Provider HMAC verification, idempotent | Accept only safe status transitions and provider references; discard credential payloads |

Every transition must be idempotent, audit who initiated it, and reject attempts to issue delivery before manual payment approval. Provider webhooks should be independently authenticated and must never be accepted as an approval signal for a payment order.

## Security and Operational Requirements

The selected provider integration must meet the following project requirements before implementation begins.

| Area | Required control |
|---|---|
| Provider selection | User confirms that the provider is authorized to issue the offered VCCs and provides product/SKU mapping plus delivery behavior. |
| Secrets | Provider API credentials are held only in server-side project secrets; none are exposed in browser code, repository files, Telegram, or chat. |
| Manual review | The existing manual payment approval remains the only trigger for delivery preparation. |
| Customer binding | Provider delivery is bound to the authenticated entitlement owner, not to an email address or a guessable order ID. |
| Links and tokens | Plaintext bearer URLs and access tokens are never persisted or messaged. |
| Logging | Request/response redaction rejects card-like numbers, CVV-like fields, URLs with secret query parameters, and provider authorization headers. |
| Notifications | In-app notifications use status-only wording. External delivery notifications remain disabled until a provider-specific secure channel is approved. |
| Cancellation and support | Administrator can revoke an unused delivery session; support sees masked references and state only. |
| Retention | Keep only needed non-sensitive audit metadata and define deletion/retention periods with the provider before activation. |

## Test Plan Before Activation

The implementation must add deterministic tests that confirm: only an administrator can create or revoke a delivery session; a customer can see only their own status; a delivery session cannot exist for an unpaid, rejected, non-VCC, or another customer’s order; duplicate issue and webhook calls are idempotent; expired and revoked sessions cannot be opened; and API/logging fixtures reject raw card, CVV, expiry, token, and provider-link fields.

The integration must also be checked in a provider sandbox using test-only credentials. The production provider secret, production product mapping, external delivery notification, and Telegram polling remain disabled until the user explicitly supplies the provider choice and activation requirements.

## Required User Decisions Before Implementation

1. Identify the authorized VCC provider and its documented server API or hosted secure-delivery flow.
2. Confirm the provider’s product/SKU mapping for every offered VCC route and the supported balance/currency behavior.
3. Confirm whether secure delivery is provider-hosted redirect, provider email, provider app, or another provider-controlled method.
4. Provide provider credentials only through the project secret workflow, not chat.
5. Confirm customer eligibility, identity-verification, cancellation, support, and retention policies that apply to the offered VCCs.

Until these decisions are supplied, the correct application behavior is the current safe state: **manual payment review, metadata-only entitlement preparation, and no credential delivery.**
