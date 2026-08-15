# Manual Install: ROTH DIGITAL Telegram Bot

Upload the supplied ZIP through the host’s **Manual Install** action. The archive root contains `main.js`; select exactly `main.js` as the main file if the host asks. This bundle uses standard **CommonJS Node.js** syntax (`require`), not ES-module `import` syntax.

The host must install the dependencies declared in the root `package.json`, then start the process with `npm start` or `node main.js`.

Configure these values only in the host’s protected environment/secrets panel:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Existing project database connection |
| `TELEGRAM_SHOP_BOT_TOKEN` | Shop bot token |
| `TELEGRAM_ADMIN_BOT_TOKEN` | Admin bot token |
| `TELEGRAM_ADMIN_CHAT_ID` | Permitted admin chat identifier |
| `TELEGRAM_PUBLIC_URL` | Public ROTH DIGITAL website URL |
| `OWNER_OPEN_ID` | Existing project-owner identity mapping |
| `TELEGRAM_POLLING_ENABLED` | Set to `1` only when you intentionally want polling to run |

Do not place any token, wallet credential, or database password in `main.js` or archive files. The bot remains polling-only and does not contain webhook setup.
