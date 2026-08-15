# ROTH DIGITAL Bot and Project Source Archive

This archive contains the full **source project** and the Telegram bot implementation. The bot is written in **TypeScript**, not Python; there is no Python bot file in the project.

| Need | File or command |
|---|---|
| Shop and admin polling bot implementation | `server/telegram/polling.ts` |
| Runnable JavaScript bot entry | `roth-digital-bot-main.js` |
| Server-side Telegram API client | `server/telegram/client.ts` |
| Token/configuration guard | `server/telegram/config.ts` |
| Catalog and wallet-flow response tests | `server/telegram.polling.test.ts` |
| Production JavaScript bundle | Run `pnpm install` then `pnpm build`; output is `dist/index.js` |

The archive excludes all `.env` files, real API tokens, database credentials, dependency folders, Git metadata, logs, and temporary files. Configure secrets only in the target deployment’s secret manager; do not paste them into source files or commit them.

The included `roth-digital-bot-main.js` is a bundled Node.js entry generated from the current bot source. Install the package dependencies first, set the required server-side environment variables in the target deployment, then use `node roth-digital-bot-main.js`. It starts polling only when `TELEGRAM_POLLING_ENABLED=1` is explicitly provided in that target environment.

## Polling boundary

The current application intentionally keeps `TELEGRAM_POLLING_ENABLED` disabled. The bot source is ready, but a continuous runtime must be selected before enabling polling. No webhook handler is included.
