# Payment Monitoring Operations

## Active Project Job

| Field | Value |
|---|---|
| Job name | `roth-payment-scan` |
| Task UID | `EfTVuzaVeRMPTDYhPAYrc6` |
| Cadence | Every five minutes (`0 */5 * * * *`, UTC) |
| Callback | `POST /api/scheduled/scan-payments` |
| Purpose | Idempotently scan active direct-crypto payment orders; no fulfilment or approval action is automatic. |

The callback is cron-authenticated and mounted before the API/static fallthrough. Manual administrator approval remains required after any observed payment state progression. The job can be inspected, paused, resumed, or deleted from the project scheduling controls using the task UID above.

## Initial Execution Verification

The first platform-triggered run completed successfully at `2026-08-15T04:19:07Z` with run UID `4AGhe6ufPAtanY4yBt7xPY`, HTTP `200`, and a duration of `596 ms`. Its safe operational response reported that two active orders were scanned and zero adapter failures occurred. The result did not deliver any product, approve any payment, expose any wallet material, or send customer messages.
