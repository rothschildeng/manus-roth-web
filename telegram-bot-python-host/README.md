# ROTH DIGITAL Python Bot Package

This archive is for **Python-only bot hosts**. It is a genuine Python polling bot, not a renamed JavaScript file. It uses Python's standard library only, so no `pip install` step is required.

## Upload and start

Upload the ZIP through the host's Python/manual upload screen. Select **`main.py`** if it asks for a main file. The host should start it using:

```text
python3 main.py
```

If the host chooses the language from the file extension, upload this archive—not the earlier Node.js archive.

## Protected host environment values

Set these only in the host's secret/environment panel. Never put values in `main.py`, `README.md`, or a public repository.

| Variable | Required value |
|---|---|
| `TELEGRAM_POLLING_ENABLED` | `1` to intentionally start polling |
| `TELEGRAM_SHOP_BOT_TOKEN` | Shop bot token |
| `TELEGRAM_ADMIN_BOT_TOKEN` | Admin bot token |
| `TELEGRAM_ADMIN_CHAT_ID` | Permitted numeric administrator chat ID |
| `TELEGRAM_PUBLIC_URL` | `https://aureliastore-fhmpjk85.manus.space` |

## Commands

The shop bot supports `/start`, `/catalog`, `/fund`, `/order`, `/support`, and `/help`. The admin bot supports `/start`, `/menu`, `/orders`, `/deposits`, and `/help`.

The Python package deliberately links admin commands to the protected website admin desks; it **does not** copy customer data, card codes, payment credentials, wallet private keys, or direct approval actions into the VPS. Product fulfilment stays owner-controlled and manual.

No webhook is used. It uses Telegram `getUpdates` polling only.
